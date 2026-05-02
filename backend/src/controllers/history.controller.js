import { getHistory, getDailySummary, getWeeklySummary, deleteHistory } from '../services/scan.service.js';

export const getHistoryHandler = async (req, res) => {
  const sessionId = req.headers['x-session-id'] || req.query.sessionId || 'anonymous';
  const limit = Math.min(parseInt(req.query.limit) || 20, 50);

  try {
    const history = await getHistory(sessionId, limit);
    return res.json({ history, count: history.length });
  } catch (err) {
    console.error('History controller error:', err);
    return res.status(500).json({ error: 'Failed to fetch history' });
  }
};

export const getDailySummaryHandler = async (req, res) => {
  const sessionId = req.headers['x-session-id'] || req.query.sessionId || 'anonymous';

  try {
    const summary = await getDailySummary(sessionId);
    return res.json(summary);
  } catch (err) {
    console.error('Daily summary controller error:', err);
    return res.status(500).json({ error: 'Failed to fetch daily summary' });
  }
};

export const getWeeklySummaryHandler = async (req, res) => {
  const sessionId = req.headers['x-session-id'] || req.query.sessionId || 'anonymous';

  try {
    const weekly = await getWeeklySummary(sessionId);
    return res.json(weekly);
  } catch (err) {
    console.error('Weekly summary controller error:', err);
    return res.status(500).json({ error: 'Failed to fetch weekly summary' });
  }
};

export const deleteHistoryHandler = async (req, res) => {
  const sessionId = req.headers['x-session-id'] || req.query.sessionId || 'anonymous';
  const id = req.params.id;

  try {
    await deleteHistory(id, sessionId);
    return res.json({ success: true });
  } catch (err) {
    console.error('Delete history controller error:', err);
    return res.status(500).json({ error: 'Failed to delete history item' });
  }
};
