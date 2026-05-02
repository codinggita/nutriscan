import express from 'express';
import { compareProducts } from '../controllers/compare.controller.js';

const router = express.Router();

router.post('/', compareProducts);

export default router;
