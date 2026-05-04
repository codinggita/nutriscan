/**
 * Official NutriScore A–E algorithm (simplified, solid approximation)
 * Based on the French NutriScore system used across Europe.
 */

function getPoints(value, thresholds) {
  for (let i = 0; i < thresholds.length; i++) {
    if (value <= thresholds[i]) return i;
  }
  return thresholds.length;
}

export const computeNutriScore = (per100g) => {
  const {
    sugar_g = 0,
    fat_g = 0,
    sodium_mg = 0,
    calories_kcal = 0,
    fiber_g = 0,
    protein_g = 0,
  } = per100g;

  // Convert kcal → kJ (1 kcal = 4.184 kJ)
  const energyKJ = calories_kcal * 4.184;

  // Negative points (0–10 each)
  const energyPts = getPoints(energyKJ, [335, 670, 1005, 1340, 1675, 2010, 2345, 2680, 3015, 3350]);
  const sugarPts = getPoints(sugar_g, [4.5, 9, 13.5, 18, 22.5, 27, 31, 36, 40, 45]);
  const fatPts = getPoints(fat_g, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  const sodiumPts = getPoints(sodium_mg, [90, 180, 270, 360, 450, 540, 630, 720, 810, 900]);
  const negativeTotal = energyPts + sugarPts + fatPts + sodiumPts;

  // Positive points (0–5 each)
  const fiberPts = getPoints(fiber_g, [0.9, 1.9, 2.8, 3.7, 4.7]);
  const proteinPts = getPoints(protein_g, [1.6, 3.2, 4.8, 6.4, 8.0]);

  // Score
  const score = negativeTotal >= 11
    ? negativeTotal - fiberPts
    : negativeTotal - fiberPts - proteinPts;

  // Grade + colour
  let grade, color, label;
  if (score <= -1) { grade = 'A'; color = '#038141'; label = 'Excellent'; }
  else if (score <= 2) { grade = 'B'; color = '#85BB2F'; label = 'Good'; }
  else if (score <= 10) { grade = 'C'; color = '#FECB02'; label = 'Average'; }
  else if (score <= 18) { grade = 'D'; color = '#EE8100'; label = 'Poor'; }
  else { grade = 'E'; color = '#E63E11'; label = 'Bad'; }

  return { grade, color, score, label };
};
