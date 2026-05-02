import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  barcode:  { type: String, index: true, sparse: true },
  name:     { type: String, required: true },
  brand:    { type: String },
  per100g: {
    sugar_g:       { type: Number, default: 0 },
    fat_g:         { type: Number, default: 0 },
    sodium_mg:     { type: Number, default: 0 },
    calories_kcal: { type: Number, default: 0 },
    protein_g:     { type: Number, default: 0 },
    carbs_g:       { type: Number, default: 0 },
    fiber_g:       { type: Number, default: 0 },
  },
  serving_size_g:    { type: Number, default: 100 },
  image_url:         { type: String },
  ingredients_text:  { type: String },
  source:            { type: String, default: 'local' },
});

// Text index on name for fuzzy search
productSchema.index({ name: 'text' });

export default mongoose.model('Product', productSchema);
