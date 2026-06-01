import { Router } from 'express';
import { getSystemStatus } from '../controllers/system.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

router.get('/status', authenticate, authorize('owner'), getSystemStatus);

export default router;
