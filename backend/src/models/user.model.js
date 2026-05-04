import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

// BMI helper
function calcBMI(heightCm, weightKg) {
  if (!heightCm || !weightKg) return null;
  const h = heightCm / 100;
  return parseFloat((weightKg / (h * h)).toFixed(1));
}

function bmiCategory(bmi) {
  if (!bmi) return null;
  if (bmi < 18.5) return 'Underweight';
  if (bmi < 25)   return 'Normal';
  if (bmi < 30)   return 'Overweight';
  return 'Obese';
}

// Schema
const userSchema = new mongoose.Schema({
  // Auth fields
  name:     { type: String, required: true, trim: true },
  email:    { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },

  // Health fields (optional)
  height:      { type: Number, default: null }, // cm
  weight:      { type: Number, default: null }, // kg
  bmi:         { type: Number, default: null },
  bmiCategory: { type: String, default: null }, // Underweight | Normal | Overweight | Obese
  conditions:  { type: [String], default: [] }, // e.g. ['Diabetes', 'Hypertension']

  // Profile
  ageGroup:  { type: String, enum: ['child', 'adult', 'senior'], default: 'adult' },
  sessionId: { type: String, default: null },
  
  // Preferences
  autoFlagHighSugar: { type: Boolean, default: false },

}, { timestamps: true });

// Pre-save hooks
userSchema.pre('save', async function () {
  // Hash password only when modified
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 12);
  }

  // Recompute BMI whenever height/weight changes
  if (this.isModified('height') || this.isModified('weight')) {
    this.bmi         = calcBMI(this.height, this.weight);
    this.bmiCategory = bmiCategory(this.bmi);
  }
});

// Instance method
userSchema.methods.comparePassword = async function (plain) {
  return bcrypt.compare(plain, this.password);
};

// Safe public projection
userSchema.methods.toPublic = function () {
  return {
    id:          this._id,
    name:        this.name,
    email:       this.email,
    ageGroup:    this.ageGroup,
    height:      this.height,
    weight:      this.weight,
    bmi:         this.bmi,
    bmiCategory: this.bmiCategory,
    conditions:  this.conditions,
    autoFlagHighSugar: this.autoFlagHighSugar,
  };
};

const User = mongoose.model('User', userSchema);
export default User;
