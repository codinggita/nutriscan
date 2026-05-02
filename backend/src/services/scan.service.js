import Scan from '../models/scan.model.js';

export const saveScan = async ({ product, risk, nutriScore, ingredientWarnings, sessionId, ageGroup }) => {
  try {
    const scan = new Scan({
      sessionId: sessionId || 'anonymous',
      product_name: product.name || 'Unknown Product',
      brand: product.brand || '',
      barcode: product.barcode || '',
      nutrition: product.per100g || {},
      serving_size_g: product.serving_size_g || 100,
      risk,
      nutriScore,
      ingredientWarnings: ingredientWarnings || [],
      ageGroup: ageGroup || 'adult',
    });
    return await scan.save();
  } catch (err) {
    console.error('Save scan error (non-fatal):', err.message);
    return null;
  }
};

export const getHistory = async (sessionId, limit = 20) => {
  try {
    return await Scan.find({ sessionId })
      .sort({ timestamp: -1 })
      .limit(limit)
      .lean();
  } catch (err) {
    console.error('Get history error:', err.message);
    return [];
  }
};

export const getDailySummary = async (sessionId) => {
  const empty = {
    scanCount: 0,
    totalSugar_g: 0, totalFat_g: 0, totalSodium_mg: 0, totalCalories_kcal: 0,
    sugarTsp: 0,
    dailyLimits: { sugar_g: 25, fat_g: 65, sodium_mg: 2300, calories_kcal: 2000 },
    scans: [],
  };

  try {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const scans = await Scan.find({ sessionId, timestamp: { $gte: startOfDay } }).lean();
    const summary = { ...empty, scanCount: scans.length, scans: [] };

    for (const scan of scans) {
      const n = scan.nutrition || {};
      const factor = (scan.serving_size_g || 100) / 100;
      summary.totalSugar_g += (n.sugar_g || 0) * factor;
      summary.totalFat_g += (n.fat_g || 0) * factor;
      summary.totalSodium_mg += (n.sodium_mg || 0) * factor;
      summary.totalCalories_kcal += (n.calories_kcal || 0) * factor;

      summary.scans.push({
        name: scan.product_name,
        risk: scan.risk?.level,
        nutriScore: scan.nutriScore?.grade,
        timestamp: scan.timestamp,
      });
    }

    summary.totalSugar_g = parseFloat(summary.totalSugar_g.toFixed(1));
    summary.totalFat_g = parseFloat(summary.totalFat_g.toFixed(1));
    summary.totalSodium_mg = parseFloat(summary.totalSodium_mg.toFixed(0));
    summary.totalCalories_kcal = parseFloat(summary.totalCalories_kcal.toFixed(0));
    summary.sugarTsp = parseFloat((summary.totalSugar_g / 4).toFixed(1));

    return summary;
  } catch (err) {
    console.error('Daily summary error:', err.message);
    return empty;
  }
};

export const getWeeklySummary = async (sessionId) => {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const aggregation = await Scan.aggregate([
      {
        $match: {
          sessionId,
          timestamp: { $gte: sevenDaysAgo }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$timestamp" } },
          totalSugar_g: {
            $sum: {
              $multiply: [
                { $ifNull: ["$nutrition.sugar_g", 0] },
                { $divide: [{ $ifNull: ["$serving_size_g", 100] }, 100] }
              ]
            }
          }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const results = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      const dateStr = d.toISOString().split('T')[0];
      const found = aggregation.find(a => a._id === dateStr);
      results.push({
        date: dateStr,
        sugar_g: found ? parseFloat(found.totalSugar_g.toFixed(1)) : 0
      });
    }

    return results;
  } catch (err) {
    console.error('Weekly summary error:', err.message);
    return [];
  }
};

export const deleteHistory = async (id, sessionId) => {
  try {
    await Scan.deleteOne({ _id: id, sessionId });
    return true;
  } catch (err) {
    console.error('Delete history error:', err.message);
    throw err;
  }
};
