import express from 'express';
import { getAlternativesHandler } from '../controllers/alternatives.controller.js';

const router = express.Router();

router.post('/', getAlternativesHandler);

export default router;
