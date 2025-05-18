import express from 'express';
import { getAllProducts } from '../controllers/product.controller.js';
import { protectRoute, adminRoute } from '../middleware/auth.middleware.js';// Import middleware for authentication and authorization


const router= express.Router();

router.get('/', protectRoute, adminRoute, getAllProducts);

export default router;