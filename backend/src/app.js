import express from 'express';
import cors from 'cors';

import userRoutes from './routes/user.routes.js';
import scanRoutes from './routes/scan.routes.js';
import analyseRoutes from './routes/analyse.routes.js';
import compareRoutes from './routes/compare.routes.js';
import alternativesRoutes from './routes/alternatives.routes.js';
import historyRoutes from './routes/history.routes.js';

const app = express();

app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/user', userRoutes);
app.use('/api/scan', scanRoutes);
app.use('/api/analyse', analyseRoutes);
app.use('/api/compare', compareRoutes);
app.use('/api/alternatives', alternativesRoutes);
app.use('/api/history', historyRoutes);

// Root endpoint
app.get('/', (req, res) => res.json({ 
  message: 'NutriScan AI API is running', 
  docs: '/health' 
}));

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok', time: new Date() }));

export default app;
