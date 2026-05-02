import mongoose from 'mongoose';

const additiveSchema = new mongoose.Schema({
  code:        { type: String, required: true, unique: true },
  ingredient:  { type: String, required: true },
  risk:        { type: String, enum: ['LOW', 'MODERATE', 'HIGH'], required: true },
  description: { type: String, required: true },
});

export default mongoose.model('Additive', additiveSchema);
