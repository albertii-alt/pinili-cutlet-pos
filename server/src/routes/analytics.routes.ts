import { Router } from 'express';
import {
  getSummary, getDailySales, getBestSellers, getRevenueByPayment,
  getPeakHours, getCategorySales, getAverageOrderValue,
} from '../controllers/analytics.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

router.get('/summary',             authenticate, authorize('owner'), getSummary);
router.get('/sales',               authenticate, authorize('owner'), getDailySales);
router.get('/best-sellers',        authenticate, authorize('owner'), getBestSellers);
router.get('/revenue',             authenticate, authorize('owner'), getRevenueByPayment);
router.get('/peak-hours',          authenticate, authorize('owner'), getPeakHours);
router.get('/category-sales',      authenticate, authorize('owner'), getCategorySales);
router.get('/average-order-value', authenticate, authorize('owner'), getAverageOrderValue);

export default router;
