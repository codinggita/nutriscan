import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json({ limit: '2mb' }));

// ── Routes ───────────────────────────────────────────────────────────────────
// These will be enabled as the route files are ported
// app.use('/auth',        require('./routes/auth.routes'));
// app.use('/scan',         require('./routes/scan.routes'));
// app.use('/analyse',      require('./routes/analyse.routes'));
// app.use('/history',      require('./routes/history.routes'));
// app.use('/compare',      require('./routes/compare.routes'));
// app.use('/alternatives', require('./routes/alternatives.routes'));

// Health check
app.get('/health', (req, res) =>
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
);

// Root check
app.get('/', (req, res) => {
  res.send('NutriScan AI API is running...');
});

// 404 catch-all
app.use((req, res) => res.status(404).json({ error: `Route ${req.method} ${req.path} not found` }));

export default app;
