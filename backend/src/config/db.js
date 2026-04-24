import mongoose from 'mongoose';

let isConnected = false;

const connectDB = async () => {
  if (isConnected) return;

  try {
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    isConnected = true;
    console.log('✅ MongoDB connected');

    // Note: Seeding logic would typically go here or in index.js
    // For now, we'll keep it simple as the seed file isn't ported yet.
  } catch (err) {
    console.error('❌ MongoDB connection error:', err.message);
    console.warn('⚠️  Running in degraded mode (no DB). Fallback data will be used.');
  }
};

export default connectDB;
