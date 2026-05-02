import express from 'express';
import {
  getHistoryHandler,
  getDailySummaryHandler,
  getWeeklySummaryHandler,
  deleteHistoryHandler
} from '../controllers/history.controller.js';

const router = express.Router();

router.get('/', getHistoryHandler);
router.get('/daily-summary', getDailySummaryHandler);
router.get('/weekly-summary', getWeeklySummaryHandler);
router.delete('/:id', deleteHistoryHandler);

export default router;
