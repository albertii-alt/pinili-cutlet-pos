import { Router } from 'express';
import { getShiftReport } from '../controllers/shiftReport.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

router.get('/', authenticate, authorize('owner'), getShiftReport);

export default router;
