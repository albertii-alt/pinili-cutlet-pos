import { Router } from 'express';
import {
  getTodayDrawer,
  setOpeningAmount,
  closeDrawer,
  getDrawerHistory,
} from '../controllers/cashDrawer.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

router.get('/today',   authenticate,                    getTodayDrawer);
router.put('/opening', authenticate, authorize('owner'), setOpeningAmount);
router.put('/close',   authenticate, authorize('owner'), closeDrawer);
router.get('/history', authenticate, authorize('owner'), getDrawerHistory);

export default router;
