import app from './app.js';
import connectDB from './config/db.js';

const PORT = process.env.PORT || 3001;

// Connect to MongoDB (non-blocking)
connectDB();

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`   Endpoints: /health / (Root)`);
});
