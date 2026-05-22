import { Router } from 'express';
import { getActive, getHistory, create, complete, cancel } from '../controllers/order.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

router.get('/active',          authenticate, getActive);
router.get('/',                authenticate, getHistory);
router.post('/',               authenticate, authorize('owner', 'cashier'), create);
router.patch('/:id/complete',  authenticate, authorize('owner', 'cashier', 'kitchen'), complete);
router.patch('/:id/cancel',    authenticate, authorize('owner', 'cashier'), cancel);

export default router;
