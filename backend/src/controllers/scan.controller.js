import Product from '../models/product.model.js';
import Fuse from 'fuse.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const indianSnacks = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../data/indianSnacks.json'), 'utf8')
);

export const getProductByBarcode = async (req, res) => {
  const barcode = req.query.barcode;
  if (!barcode) {
    return res.status(400).json({ error: 'Barcode query parameter is required' });
  }

  try {
    const dbProduct = await Product.findOne({ barcode }).lean().catch(() => null);
    if (dbProduct) {
      console.log(`[Cache HIT] Barcode ${barcode} found in MongoDB.`);
      return res.json({ ...dbProduct, id: undefined, _id: undefined, source: 'database' });
    }

    // Fallback to local JSON
    const localProduct = indianSnacks.find(item => item.barcode === barcode);
    if (localProduct) {
      console.log(`[Local HIT] Barcode ${barcode} found in indianSnacks.json.`);
      return res.json({ ...localProduct, ingredients_text: '', source: 'fallback' });
    }

    // Fetch from OpenFoodFacts
    const response = await fetch(`https://world.openfoodfacts.org/api/v0/product/${barcode}.json`, {
      headers: { 'User-Agent': 'NutriScanHackathonApp/1.0 (contact@nutriscan.app)' }
    });

    // Handle 429 Rate Limit specifically
    if (response.status === 429) {
      console.warn(`[Rate Limited] OpenFoodFacts returned 429 for barcode ${barcode}.`);
      return res.status(503).json({ error: 'External food database is rate-limited. Please try again in a moment or use Manual Entry.' });
    }

    const contentType = response.headers.get('content-type') || '';
    if (!response.ok || !contentType.includes('application/json')) {
      throw new Error(`OpenFoodFacts returned non-JSON response (status ${response.status})`);
    }

    const data = await response.json();

    if (data.status === 1 && data.product && data.product.nutriments) {
      const p = data.product;
      const n = p.nutriments;

      const mapped = {
        name:             p.product_name || p.generic_name || 'Unknown Product',
        brand:            p.brands || 'Unknown Brand',
        image_url:        p.image_url || p.image_front_url || null,
        ingredients_text: p.ingredients_text_en || p.ingredients_text || '',
        barcode,
        per100g: {
          sugar_g:       n.sugars_100g || 0,
          fat_g:         n.fat_100g || 0,
          sodium_mg:     n.sodium_100g !== undefined ? Number((n.sodium_100g * 1000).toFixed(0)) : 0,
          calories_kcal: n['energy-kcal_100g'] || 0,
          protein_g:     n.proteins_100g || 0,
          carbs_g:       n.carbohydrates_100g || 0,
          fiber_g:       n.fiber_100g || 0,
        },
        serving_size_g: p.serving_quantity ? parseFloat(p.serving_quantity) : 100,
        source: 'openfoodfacts',
      };

      // Cache result for future scans
      Product.updateOne({ barcode }, { $setOnInsert: { ...mapped, source: 'openfoodfacts' } }, { upsert: true })
        .catch(() => {});

      return res.json(mapped);
    }

    return res.status(404).json({ error: 'Product not found. Try entering details manually.' });

  } catch (error) {
    console.error('Scan controller error:', error.message);
    return res.status(500).json({ error: 'Internal server error. Please try Manual Entry.' });
  }
};

export const getFeaturedProducts = async (req, res) => {
  try {
    // Return local snacks for discovery
    return res.json(indianSnacks);
  } catch (error) {
    console.error('Featured products error:', error.message);
    return res.status(500).json({ error: 'Failed to fetch featured products' });
  }
};

export const searchProducts = async (req, res) => {
  const query = req.query.q;
  if (!query) return res.status(400).json({ error: 'Search query is required' });

  try {
    const response = await fetch(`https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(query)}&search_simple=1&action=process&json=1&page_size=20`, {
      headers: {
        'User-Agent': 'NutriScanHackathonApp/1.0 (harshitkumar@example.com)'
      }
    });
    
    if (!response.ok) {
      throw new Error(`OpenFoodFacts returned status ${response.status}`);
    }

    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      throw new Error('OpenFoodFacts returned non-JSON response');
    }

    const data = await response.json();
    if (!data.products) return res.json([]);

    const results = data.products.map(p => ({
      name:             p.product_name || p.generic_name || 'Unknown Product',
      brand:            p.brands || 'Unknown Brand',
      image_url:        p.image_url || p.image_front_url || null,
      barcode:          p.code,
      nutrition:        p.nutriments || {},
      ingredients_text: p.ingredients_text_en || p.ingredients_text || '',
      serving_size_g:   p.serving_quantity ? parseFloat(p.serving_quantity) : 100,
    }));

    return res.json(results);
  } catch (err) {
    console.warn(`Search API warning (${err.message}), falling back to local database.`);
    
    // Fallback to local Fuse.js search
    const fuse = new Fuse(indianSnacks, {
      keys: ['name', 'brand'],
      threshold: 0.3, // typo tolerance
      minMatchCharLength: 2
    });

    const fallbackResults = fuse.search(query).slice(0, 10).map(({ item }) => ({
      name:             item.name,
      brand:            item.brand,
      image_url:        item.image_url,
      barcode:          item.barcode,
      nutrition: {
        sugars_100g:         item.per100g?.sugar_g      || 0,
        fat_100g:            item.per100g?.fat_g        || 0,
        sodium_100g:        (item.per100g?.sodium_mg   || 0) / 1000,
        'energy-kcal_100g':  item.per100g?.calories_kcal|| 0,
      },
      ingredients_text: '',
      serving_size_g:   item.serving_size_g || 100,
      source:           'fallback',
    }));

    if (fallbackResults.length > 0) {
      return res.json(fallbackResults);
    }

    return res.status(503).json({ error: 'External search service is temporarily unavailable. Please use Manual Entry.' });
  }
};
