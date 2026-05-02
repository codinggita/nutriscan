import { assessRisk } from '../services/risk.service.js';
import { computeNutriScore } from '../services/nutriScore.service.js';
import { generateCompareVerdict } from '../services/explanation.service.js';

const NUTRIENTS = [
  { key: 'sugar_g',       label: 'Sugar',    unit: 'g',    lowerIsBetter: true  },
  { key: 'fat_g',         label: 'Fat',      unit: 'g',    lowerIsBetter: true  },
  { key: 'sodium_mg',     label: 'Sodium',   unit: 'mg',   lowerIsBetter: true  },
  { key: 'calories_kcal', label: 'Calories', unit: 'kcal', lowerIsBetter: true  },
  { key: 'protein_g',     label: 'Protein',  unit: 'g',    lowerIsBetter: false },
  { key: 'fiber_g',       label: 'Fiber',    unit: 'g',    lowerIsBetter: false },
];

export const compareProducts = async (req, res) => {
  const { product1, product2, ageGroup = 'adult', conditions = [] } = req.body;

  if (!product1?.per100g || !product2?.per100g) {
    return res.status(400).json({ error: 'Two complete product objects are required' });
  }

  try {
    const risk1  = assessRisk(product1.per100g, ageGroup);
    const risk2  = assessRisk(product2.per100g, ageGroup);
    const score1 = computeNutriScore(product1.per100g);
    const score2 = computeNutriScore(product2.per100g);

    // Per-nutrient win/lose
    const comparison = {};
    for (const { key, label, unit, lowerIsBetter } of NUTRIENTS) {
      const v1 = product1.per100g[key] || 0;
      const v2 = product2.per100g[key] || 0;
      let winner;
      if (lowerIsBetter) winner = v1 < v2 ? 'product1' : v1 > v2 ? 'product2' : 'tie';
      else                winner = v1 > v2 ? 'product1' : v1 < v2 ? 'product2' : 'tie';

      comparison[key] = { label, unit, product1: v1, product2: v2, winner };
    }

    const overallWinner = score1.score < score2.score ? 'product1'
                        : score1.score > score2.score ? 'product2'
                        : 'tie';

    const verdict = generateCompareVerdict(
      product1.name || 'Product 1', score1, risk1,
      product2.name || 'Product 2', score2, risk2,
      conditions
    );

    return res.json({
      product1:      { name: product1.name || 'Product 1', risk: risk1, nutriScore: score1 },
      product2:      { name: product2.name || 'Product 2', risk: risk2, nutriScore: score2 },
      comparison,
      overallWinner,
      verdict,
    });

  } catch (err) {
    console.error('Compare controller error:', err);
    return res.status(500).json({ error: 'Comparison failed' });
  }
};
