import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';

// ── Helper: sign a JWT ────────────────────────────────────────────────────────
function signToken(user) {
  return jwt.sign(
    {
      id:          user._id,
      name:        user.name,
      email:       user.email,
      bmiCategory: user.bmiCategory,
      ageGroup:    user.ageGroup,
    },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
}

// ── POST /api/users/register (signup) ─────────────────────────────────────────
export const registerUser = async (req, res) => {
  try {
    const { name, email, password, height, weight, ageGroup, sessionId } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email and password are required.' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters.' });
    }

    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return res.status(409).json({ error: 'An account with this email already exists.' });
    }

    const user = new User({
      name:     name.trim(),
      email:    email.toLowerCase().trim(),
      password,
      height:   height   ? parseFloat(height)   : null,
      weight:   weight   ? parseFloat(weight)   : null,
      ageGroup: ageGroup || 'adult',
      sessionId: sessionId || null,
    });
    await user.save();

    const token = signToken(user);
    return res.status(201).json({ token, user: user.toPublic() });
  } catch (err) {
    console.error('[registerUser]', err);
    return res.status(500).json({ error: 'Signup failed. Please try again.' });
  }
};

// ── POST /api/users/login ─────────────────────────────────────────────────────
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const valid = await user.comparePassword(password);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const token = signToken(user);
    return res.json({ token, user: user.toPublic() });
  } catch (err) {
    console.error('[loginUser]', err);
    return res.status(500).json({ error: 'Login failed. Please try again.' });
  }
};

// ── GET /api/users/profile (me) ───────────────────────────────────────────────
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found.' });
    return res.json({ user: user.toPublic() });
  } catch (err) {
    return res.status(500).json({ error: 'Could not fetch user.' });
  }
};

// ── PATCH /api/users/profile (update) ─────────────────────────────────────────
export const updateUserProfile = async (req, res) => {
  try {
    const { name, password, height, weight, conditions, ageGroup, autoFlagHighSugar } = req.body;
    
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found.' });

    if (name) user.name = name.trim();
    if (password && password.length >= 6) user.password = password;

    if (height !== undefined)     user.height = height ? parseFloat(height) : null;
    if (weight !== undefined)     user.weight = weight ? parseFloat(weight) : null;
    if (conditions !== undefined) user.conditions = Array.isArray(conditions) ? conditions : [];
    if (ageGroup !== undefined)   user.ageGroup = ageGroup;
    if (autoFlagHighSugar !== undefined) user.autoFlagHighSugar = Boolean(autoFlagHighSugar);

    await user.save();

    const token = signToken(user);
    return res.json({ token, user: user.toPublic() });
  } catch (err) {
    console.error('[updateUserProfile]', err);
    return res.status(500).json({ error: 'Could not update profile.' });
  }
};
