import { getAlternatives } from '../services/alternatives.service.js';
import { assessRisk } from '../services/risk.service.js';
import { reasonAlternative } from '../services/explanation.service.js';

export const getAlternativesHandler = async (req, res) => {
  const { product, ageGroup = 'adult' } = req.body;

  if (!product?.per100g) {
    return res.status(400).json({ error: 'Product data required' });
  }

  try {
    const risk      = assessRisk(product.per100g, ageGroup);
    const candidates = await getAlternatives(product, risk.level);

    const alternatives = candidates.map((alt) => {
        const why_better = reasonAlternative(
          product.name || 'this food',
          alt.name,
          product.per100g,
          alt.per100g
        );
        return { ...alt, _id: undefined, why_better };
      });

    return res.json({ alternatives });
  } catch (err) {
    console.error('Alternatives controller error:', err);
    return res.status(500).json({ error: 'Failed to fetch alternatives' });
  }
};
