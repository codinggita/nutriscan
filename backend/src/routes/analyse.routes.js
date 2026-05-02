import express from 'express';
import { analyseProduct } from '../controllers/analyse.controller.js';

const router = express.Router();

router.post('/', analyseProduct);

export default router;
