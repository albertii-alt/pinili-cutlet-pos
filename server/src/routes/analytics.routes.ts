import { Router } from 'express';
import { getSummary, getDailySales, getBestSellers, getRevenueByPayment } from '../controllers/analytics.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

router.get('/summary',      authenticate, authorize('owner'), getSummary);
router.get('/sales',        authenticate, authorize('owner'), getDailySales);
router.get('/best-sellers', authenticate, authorize('owner'), getBestSellers);
router.get('/revenue',      authenticate, authorize('owner'), getRevenueByPayment);

export default router;
