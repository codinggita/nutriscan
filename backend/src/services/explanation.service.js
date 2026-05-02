/**
 * Rule-Based Explanation Engine
 * Replaces Gemini AI with deterministic, instant, offline-capable explanations.
 * 
 * Logic is based on:
 *  - User's medical conditions (Diabetes, Hypertension, Obesity, Heart, etc.)
 *  - User's age group (child, adult, senior)
 *  - Product's nutritional signals from riskService
 */

// ── Helper: pick the single most dangerous signal ──────────────────────────
function getTopSignal(signals = []) {
  const priority = ['Very high sugar', 'Very high sodium', 'Very high fat', 'Elevated sugar', 'Elevated sodium', 'Elevated fat'];
  for (const p of priority) {
    if (signals.includes(p)) return p;
  }
  return signals[0] || null;
}

// ── 1. Explain Risk ────────────────────────────────────────────────────────
export const explainRisk = (productName, per100g, risk, conditions = []) => {
  const sugar   = per100g.sugar_g   || 0;
  const fat     = per100g.fat_g     || 0;
  const sodium  = per100g.sodium_mg || 0;
  const cals    = per100g.calories_kcal || 0;
  const signals = risk.signals || [];
  const level   = risk.level;

  const name = productName || 'This product';

  // ── Condition-specific warnings (highest priority) ────────────────────────

  if (conditions.includes('Diabetes') || conditions.includes('Pre-diabetic')) {
    if (sugar > 20) {
      return `Diabetes Alert: ${name} contains ${sugar}g of sugar per 100g, which can cause a rapid blood glucose spike. Daily consumption is strongly discouraged for diabetics. Based on nutritional data. Not a medical diagnosis.`;
    }
    if (sugar > 10) {
      return `Caution: ${name} has moderate sugar (${sugar}g) which may affect blood sugar control. Consume in small portions and monitor glucose levels. Based on nutritional data. Not a medical diagnosis.`;
    }
  }

  if (conditions.includes('Hypertension') || conditions.includes('High BP')) {
    if (sodium > 600) {
      return `Blood Pressure Alert: ${name} has very high sodium (${sodium}mg), which can elevate blood pressure. Avoid regular consumption if you have hypertension. Based on nutritional data. Not a medical diagnosis.`;
    }
    if (sodium > 300) {
      return `Sodium Warning: ${name} contains ${sodium}mg of sodium. People with high blood pressure should limit this to small portions. Based on nutritional data. Not a medical diagnosis.`;
    }
  }

  if (conditions.includes('Obesity') || conditions.includes('Overweight')) {
    if (fat > 15 && cals > 400) {
      return `Weight Management Alert: ${name} is high in both fat (${fat}g) and calories (${cals} kcal). This can significantly hinder weight loss goals. Based on nutritional data. Not a medical diagnosis.`;
    }
    if (cals > 450) {
      return `High Calorie Alert: ${name} provides ${cals} kcal per 100g. Regular consumption can contribute to weight gain. Limit intake. Based on nutritional data. Not a medical diagnosis.`;
    }
  }

  if (conditions.includes('Heart Disease') || conditions.includes('Cholesterol')) {
    if (fat > 15) {
      return `Heart Health Alert: ${name} is high in fat (${fat}g per 100g). High fat intake is associated with increased cholesterol and cardiovascular risk. Based on nutritional data. Not a medical diagnosis.`;
    }
    if (sodium > 500) {
      return `Cardiac Warning: ${name} contains high sodium (${sodium}mg) which strains the heart. People with heart conditions should avoid this product. Based on nutritional data. Not a medical diagnosis.`;
    }
  }

  if (conditions.includes('Kidney Disease')) {
    if (sodium > 400) {
      return `Kidney Alert: ${name} has high sodium (${sodium}mg). Excess sodium creates extra workload on kidneys. Strictly avoid for kidney patients. Based on nutritional data. Not a medical diagnosis.`;
    }
  }

  // ── Age-specific warnings ─────────────────────────────────────────────────

  if (level === 'HIGH') {
    const topSignal = getTopSignal(signals);
    if (topSignal === 'Very high sugar' && fat > 10) {
      return `${name} is high in both sugar (${sugar}g) and fat (${fat}g), posing a combined risk of obesity and metabolic disorders. Daily consumption is not recommended. Based on nutritional data. Not a medical diagnosis.`;
    }
    if (topSignal === 'Very high sodium') {
      return `${name} contains dangerously high sodium (${sodium}mg). Regular consumption can lead to water retention, high blood pressure, and kidney stress. Based on nutritional data. Not a medical diagnosis.`;
    }
    if (topSignal === 'Very high sugar') {
      return `${name} is extremely high in sugar (${sugar}g per 100g), which can cause energy crashes, tooth decay, and long-term metabolic issues. Avoid daily use. Based on nutritional data. Not a medical diagnosis.`;
    }
    if (topSignal === 'Very high fat') {
      return `${name} is very high in fat (${fat}g per 100g). Excess fat in diet can raise bad cholesterol (LDL) and increase cardiovascular risk over time. Based on nutritional data. Not a medical diagnosis.`;
    }
    return `${name} has a HIGH health risk profile due to elevated levels of ${signals.slice(0,2).join(' and ')}. Limit consumption. Based on nutritional data. Not a medical diagnosis.`;
  }

  if (level === 'MODERATE') {
    return `${name} has a moderate nutritional risk. It contains ${topSignal ? topSignal.toLowerCase() : 'concerning nutrient levels'} — fine occasionally but not as a daily snack. Based on nutritional data. Not a medical diagnosis.`;
  }

  // LOW risk
  return `${name} has a low nutritional risk and is generally acceptable for occasional consumption. Maintain a balanced diet overall. Based on nutritional data. Not a medical diagnosis.`;
};

// ── 2. Reason Alternative ──────────────────────────────────────────────────
export const reasonAlternative = (originalName, altName, originalPer100g, altPer100g) => {
  const sugarDiff  = (originalPer100g.sugar_g   || 0) - (altPer100g.sugar_g   || 0);
  const fatDiff    = (originalPer100g.fat_g     || 0) - (altPer100g.fat_g     || 0);
  const sodiumDiff = (originalPer100g.sodium_mg || 0) - (altPer100g.sodium_mg || 0);
  const proteinAdv = (altPer100g.protein_g || 0) - (originalPer100g.protein_g || 0);
  const fiberAdv   = (altPer100g.fiber_g   || 0) - (originalPer100g.fiber_g   || 0);

  const reasons = [];

  if (sugarDiff  >= 3)  reasons.push(`${sugarDiff.toFixed(1)}g less sugar`);
  if (fatDiff    >= 3)  reasons.push(`${fatDiff.toFixed(1)}g less fat`);
  if (sodiumDiff >= 50) reasons.push(`${sodiumDiff.toFixed(0)}mg less sodium`);
  if (proteinAdv >= 2)  reasons.push(`${proteinAdv.toFixed(1)}g more protein`);
  if (fiberAdv   >= 2)  reasons.push(`${fiberAdv.toFixed(1)}g more fiber`);

  if (reasons.length > 0) {
    return `${altName} has ${reasons.join(', ')} per 100g, making it a healthier choice than ${originalName}.`;
  }

  return `${altName} offers a better overall nutritional profile compared to ${originalName}.`;
};

// ── 3. Compare Verdict ─────────────────────────────────────────────────────
export const generateCompareVerdict = (product1Name, score1, risk1, product2Name, score2, risk2, conditions = []) => {
  const conditionStr = conditions.length > 0 ? ` for someone with ${conditions.join(' and ')}` : '';

  if (score1.score < score2.score) {
    const diff = score2.score - score1.score;
    return `${product1Name} is the healthier choice${conditionStr}. It scores ${diff} points better on the NutriScore scale, indicating lower levels of sugar, fat, and sodium.`;
  }

  if (score2.score < score1.score) {
    const diff = score1.score - score2.score;
    return `${product2Name} is the healthier choice${conditionStr}. It scores ${diff} points better on the NutriScore scale, indicating lower levels of sugar, fat, and sodium.`;
  }

  return `Both ${product1Name} and ${product2Name} have a similar nutritional profile${conditionStr}. Consider portion size and overall diet.`;
};
