import mongoose from 'mongoose';

const scanSchema = new mongoose.Schema({
  sessionId:    { type: String, required: true, index: true },
  product_name: { type: String, required: true },
  brand:        { type: String },
  barcode:      { type: String },
  nutrition: {
    sugar_g:       Number,
    fat_g:         Number,
    sodium_mg:     Number,
    calories_kcal: Number,
    protein_g:     Number,
    fiber_g:       Number,
    carbs_g:       Number,
  },
  serving_size_g: Number,
  risk: {
    level:   { type: String, enum: ['LOW', 'MODERATE', 'HIGH'] },
    label:   String,
    signals: [String],
  },
  nutriScore: {
    grade: String,
    color: String,
    score: Number,
    label: String,
  },
  ingredientWarnings: [{
    ingredient:  String,
    risk:        String,
    description: String,
  }],
  ageGroup:  { type: String, default: 'adult' },
  timestamp: { type: Date, default: Date.now, index: true },
});

// Compound index for per-session time-sorted queries
scanSchema.index({ sessionId: 1, timestamp: -1 });

const Scan = mongoose.model('Scan', scanSchema);
export default Scan;
