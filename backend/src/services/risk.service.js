/**
 * Age-aware risk engine
 * Thresholds vary by age group: child | adult | senior
 */

const AGE_THRESHOLDS = {
  child: {
    sugar:  { HIGH: 10,  MODERATE: 5   },
    fat:    { HIGH: 8,   MODERATE: 5   },
    sodium: { HIGH: 400, MODERATE: 200 },
  },
  adult: {
    sugar:  { HIGH: 20,  MODERATE: 10  },
    fat:    { HIGH: 15,  MODERATE: 8   },
    sodium: { HIGH: 600, MODERATE: 300 },
  },
  senior: {
    sugar:  { HIGH: 15,  MODERATE: 8   },
    fat:    { HIGH: 12,  MODERATE: 7   },
    sodium: { HIGH: 400, MODERATE: 200 },
  },
};

export const assessRisk = (per100g, ageGroup = 'adult') => {
  const sugar   = per100g.sugar_g   || 0;
  const fat     = per100g.fat_g     || 0;
  const sodium  = per100g.sodium_mg || 0;
  const protein = per100g.protein_g || 0;
  const fiber   = per100g.fiber_g   || 0;

  const t = AGE_THRESHOLDS[ageGroup] || AGE_THRESHOLDS.adult;

  const signals = [];
  let highCount     = 0;
  let moderateCount = 0;

  if (sugar > t.sugar.HIGH)         { signals.push('Very high sugar');   highCount++;     }
  else if (sugar > t.sugar.MODERATE){ signals.push('Elevated sugar');     moderateCount++; }

  if (fat > t.fat.HIGH)             { signals.push('Very high fat');      highCount++;     }
  else if (fat > t.fat.MODERATE)    { signals.push('Elevated fat');       moderateCount++; }

  if (sodium > t.sodium.HIGH)       { signals.push('Very high sodium');   highCount++;     }
  else if (sodium > t.sodium.MODERATE){ signals.push('Elevated sodium'); moderateCount++; }

  // Positive signals
  if (protein > 8)  signals.push('Good protein source');
  if (fiber   > 4)  signals.push('High fiber');

  let level, label;

  if (highCount >= 2) {
    level = 'HIGH';
    const reasons = signals.filter(s => s.startsWith('Very'));
    label = reasons.includes('Very high sugar') && reasons.includes('Very high fat')
      ? 'High diabetes + obesity risk'
      : reasons.includes('Very high sodium')
        ? 'Heart & kidney risk'
        : 'High health risk';
  } else if (highCount === 1) {
    level = 'HIGH';
    const trigger = signals.find(s => s.startsWith('Very')) || signals[0];
    label = `High risk — ${trigger}`;
  } else if (moderateCount >= 1) {
    level = 'MODERATE';
    label = 'Moderate risk — limit intake';
  } else {
    level = 'LOW';
    label = 'Low risk — occasional use fine';
  }

  return { level, label, signals };
};
