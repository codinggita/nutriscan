import express from 'express';
import { getProductByBarcode, getFeaturedProducts, searchProducts } from '../controllers/scan.controller.js';

const router = express.Router();

router.get('/barcode', getProductByBarcode);
router.get('/featured', getFeaturedProducts);
router.get('/search', searchProducts);

export default router;
