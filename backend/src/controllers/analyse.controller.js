import { assessRisk } from '../services/risk.service.js';
import { computeNutriScore } from '../services/nutriScore.service.js';
import { detectIngredients } from '../services/ingredient.service.js';
import { getAlternatives } from '../services/alternatives.service.js';
import { explainRisk, reasonAlternative } from '../services/explanation.service.js';
import { saveScan } from '../services/scan.service.js';

export const analyseProduct = async (req, res) => {
  const { product, ageGroup = 'adult', conditions = [] } = req.body;
  const sessionId = req.headers['x-session-id'] || 'anonymous';

  if (!product || !product.per100g) {
    return res.status(400).json({ error: 'Product data missing or invalid' });
  }

  try {
    const productName = product.name || 'this food';

    // 1. Calculate Risk and Score mathematically (fast)
    const risk       = assessRisk(product.per100g, ageGroup);
    const nutriScore = computeNutriScore(product.per100g);

    // 2. Find harmful ingredients in parallel with alternatives
    const ingredientWarnings = await detectIngredients(product.ingredients_text || '');
    const altCandidates      = await getAlternatives(product, risk.level);

    // 3. Generate rule-based explanation (instant, no API call)
    const explanation = explainRisk(productName, product.per100g, risk, conditions);

    // 4. Generate rule-based reason for each alternative (instant, no API call)
    const alternatives = altCandidates.map(alt => ({
      name:      alt.name,
      brand:     alt.brand,
      image_url: alt.image_url,
      per100g:   alt.per100g,
      why_better: reasonAlternative(productName, alt.name, product.per100g, alt.per100g),
    }));

    // 5. Save the scan to the database history
    await saveScan({ product, risk, nutriScore, ingredientWarnings, sessionId, ageGroup });

    // 6. Send the final compiled result to the frontend
    return res.json({
      risk:               risk,
      nutriScore:         nutriScore,
      ingredientWarnings: ingredientWarnings,
      explanation:        explanation,
      alternatives:       alternatives,
      ageGroup:           ageGroup,
    });

  } catch (err) {
    console.error('Analyse controller error:', err);
    return res.status(500).json({ error: 'Internal server error during analysis' });
  }
};
