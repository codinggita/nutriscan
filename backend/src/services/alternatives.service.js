import Fuse from 'fuse.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Product from '../models/product.model.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const staticAlternatives = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../data/alternatives.json'), 'utf8')
);

// Check for empty/missing nutrition data
function isFalsyData(per100g) {
  if (!per100g) return true;
  const sugar   = per100g.sugar_g       || 0;
  const fat     = per100g.fat_g         || 0;
  const sodium  = per100g.sodium_mg     || 0;
  const fiber   = per100g.fiber_g       || 0;
  const protein = per100g.protein_g     || 0;
  const calories = per100g.calories_kcal || 0;
  
  // If ALL major nutritional values are exactly 0, the data is likely missing/falsy
  return (sugar === 0 && fat === 0 && sodium === 0 && fiber === 0 && protein === 0 && calories === 0);
}

// Nutrition score — lower is better
function nutritionScore(per100g) {
  const sugar   = per100g.sugar_g       || 0;
  const fat     = per100g.fat_g         || 0;
  const sodium  = per100g.sodium_mg     || 0;
  const fiber   = per100g.fiber_g       || 0;
  const protein = per100g.protein_g     || 0;
  return (sugar * 0.40) + (fat * 0.30) + (sodium * 0.01) - (fiber * 0.50) - (protein * 0.30);
}

// Category keywords map
const CATEGORY_KEYWORDS = [
  { category: 'chocolate',  keywords: ['chocolate', 'choco', 'cocoa', 'cadbury', 'dairy milk', 'kitkat', 'kit kat', 'fuse', 'munch', 'bounty', 'truffle'] },
  { category: 'biscuit',    keywords: ['biscuit', 'cookie', 'cookies', 'hide & seek', 'hide and seek', 'bourbon', 'oreo', 'parle', 'marie', 'digestive', 'cracker', 'milano'] },
  { category: 'chips',      keywords: ['chips', 'crisps', 'lays', 'doritos', 'bingo', 'pringles', 'kurkure', 'nachos', 'popped', 'wafer', 'namkeen', 'chana', 'bhujia', 'sev'] },
  { category: 'ice_cream',  keywords: ['ice cream', 'ice-cream', 'kulfi', 'gelato', 'sundae', 'scoop', 'vanilla', 'butterscotch', 'kesar', 'royale', 'chocomini'] },
  { category: 'ketchup',    keywords: ['ketchup', 'sauce', 'tomato sauce', 'kissan', 'maggi sauce', 'dip', 'chutney'] },
  { category: 'spread',     keywords: ['spread', 'hazelnut', 'nutella', 'peanut butter', 'jam', 'jelly', 'butter', 'margarine'] },
  { category: 'noodles',    keywords: ['noodles', 'maggi', 'ramen', 'pasta', 'spaghetti', 'macaroni', 'vermicelli'] },
  { category: 'nuts',       keywords: ['almond', 'cashew', 'peanut', 'walnut', 'pistachio', 'nuts', 'dry fruit', 'dried fruit', 'makhana', 'fox nut', 'roasted'] },
  { category: 'oats',       keywords: ['oats', 'oatmeal', 'granola', 'muesli', 'cereal', 'porridge', 'cornflake', 'wheat flake'] },
  { category: 'drink',      keywords: ['juice', 'drink', 'soda', 'cola', 'pepsi', 'coke', 'sprite', 'limca', 'maaza', 'frooti', 'tea', 'coffee', 'milk', 'lassi', 'chaas'] },
];

/**
 * Detect category of a product by fuzzy-matching its name against keyword groups.
 * Returns the category string, or null if no match.
 */
export const detectCategory = (productName) => {
  if (!productName) return null;
  const lower = productName.toLowerCase();
  for (const { category, keywords } of CATEGORY_KEYWORDS) {
    if (keywords.some(kw => lower.includes(kw))) {
      return category;
    }
  }
  return null;
};

/**
 * Get the keywords list for a category, used for finding same-category products in DB.
 */
function keywordsForCategory(category) {
  const match = CATEGORY_KEYWORDS.find(c => c.category === category);
  return match ? match.keywords : [];
}

// Main export
export const getAlternatives = async (product, riskLevel, count = 3) => {
  const originalScore = nutritionScore(product.per100g);
  const category      = detectCategory(product.name);
  let candidates = [];

  try {
    const allProducts = await Product.find({}).lean();

    if (allProducts.length > 1) {
      // Exclude the scanned product itself via Fuse name match
      const fuse = new Fuse(allProducts, { keys: ['name'], threshold: 0.35 });
      const sameProductIds = new Set(
        fuse.search(product.name || '').map(r => r.item._id?.toString())
      );

      // Filter out same products AND products with falsy (all 0s) data
      const eligible = allProducts.filter(p => !sameProductIds.has(p._id?.toString()) && !isFalsyData(p.per100g));

      // Step 1: same-category products with better nutrition score
      if (category) {
        const catKeywords = keywordsForCategory(category);
        const sameCat = eligible.filter(p => {
          const pLower = (p.name || '').toLowerCase();
          return catKeywords.some(kw => pLower.includes(kw));
        });

        candidates = sameCat
          .filter(p => nutritionScore(p.per100g) < originalScore)
          .sort((a, b) => nutritionScore(a.per100g) - nutritionScore(b.per100g))
          .slice(0, count);
      }

      // Step 2: if not enough same-category hits, fill with any better product
      if (candidates.length < count) {
        const candidateIds = new Set(candidates.map(c => c._id?.toString()));
        const extra = eligible
          .filter(p => !candidateIds.has(p._id?.toString()))
          .filter(p => nutritionScore(p.per100g) < originalScore)
          .sort((a, b) => nutritionScore(a.per100g) - nutritionScore(b.per100g))
          .slice(0, count - candidates.length);
        candidates = [...candidates, ...extra];
      }
    }
  } catch (err) {
    console.error('DB alternatives error (non-fatal):', err.message);
  }

  // Step 3: pad with static fallback (category-aware)
  if (candidates.length < count) {
    // First try the _category_hints block from JSON for exact category match
    const categoryHints = category && staticAlternatives._category_hints
      ? (staticAlternatives._category_hints[category] || [])
      : [];

    const allStatic = [
      ...categoryHints,                                     // same-category hints first
      ...(staticAlternatives[riskLevel]  || []),
      ...(staticAlternatives['MODERATE'] || []),
      ...(staticAlternatives['HIGH']     || []),
    ];

    const existingNames = new Set(candidates.map(c => c.name.toLowerCase()));
    const catKeywords   = category ? keywordsForCategory(category) : [];

    // Within the remaining statics, prefer same-category ones
    const catStatics   = allStatic.filter(a => catKeywords.some(kw => (a.name || '').toLowerCase().includes(kw)));
    const otherStatics = allStatic.filter(a => !catKeywords.some(kw => (a.name || '').toLowerCase().includes(kw)));

    for (const alt of [...catStatics, ...otherStatics]) {
      if (candidates.length >= count) break;
      // Skip if data is falsy
      if (isFalsyData(alt.per100g)) continue;
      
      if (!existingNames.has(alt.name.toLowerCase())) {
        candidates.push(alt);
        existingNames.add(alt.name.toLowerCase());
      }
    }
  }

  return candidates.slice(0, count);
};
