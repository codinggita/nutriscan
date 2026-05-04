import Additive from '../models/additive.model.js';

/**
 * Maps text patterns → additive codes
 * Each pattern is a lowercase substring to search inside ingredients_text
 */
const SEARCH_PATTERNS = [
  { patterns: ['monosodium glutamate', 'msg'],code: 'MSG'},
  { patterns: ['e621', 'e-621'],code: 'E621'},
  { patterns: ['tartrazine', 'e102', 'e-102', 'fd&c yellow 5'],code: 'E102'},
  { patterns: ['sunset yellow', 'e110', 'e-110', 'fd&c yellow 6'],code: 'E110'},
  { patterns: ['allura red', 'e129', 'e-129', 'fd&c red 40'],code: 'E129'},
  { patterns: ['high fructose corn syrup', 'hfcs'],code: 'HFCS'},
  { patterns: ['partially hydrogenated', 'hydrogenated vegetable oil'],code: 'TRANS_FAT'},
  { patterns: ['sodium benzoate', 'e211', 'e-211'],code: 'E211'},
  { patterns: ['aspartame', 'e951', 'e-951', 'nutrasweet'],code: 'E951'},
  { patterns: ['carrageenan', 'e407', 'e-407'],code: 'E407'},
  { patterns: ['sulphite ammonia caramel', 'e150d', 'e-150d', 'caramel color iv'],code: 'E150D' },
  { patterns: ['sodium nitrite', 'e250', 'e-250'],code: 'E250'},
  { patterns: ['butylated hydroxyanisole', 'bha', 'e320', 'e-320'],code: 'E320'},
];

export const detectIngredients = async (ingredientText) => {
  if (!ingredientText || typeof ingredientText !== 'string') return [];

  const lower = ingredientText.toLowerCase();
  const detectedCodes = SEARCH_PATTERNS
    .filter(({ patterns }) => patterns.some(p => lower.includes(p)))
    .map(({ code }) => code);

  if (detectedCodes.length === 0) return [];

  try {
    const additives = await Additive.find({ code: { $in: [...detectedCodes] } }).lean();
    return additives.map(a => ({
      ingredient:  a.ingredient,
      risk:        a.risk,
      description: a.description,
    }));
  } catch (err) {
    console.error('Ingredient DB error (non-fatal):', err.message);
    // Minimal fallback without DB
    return [...detectedCodes].map(code => ({
      ingredient:  code,
      risk:        'MODERATE',
      description: 'Potentially harmful additive detected.',
    }));
  }
};
