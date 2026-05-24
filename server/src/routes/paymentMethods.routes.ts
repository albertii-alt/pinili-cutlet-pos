import { Router } from 'express';
import {
  getPaymentMethods,
  addPaymentMethod,
  deletePaymentMethod,
  setDefaultPaymentMethod,
  togglePaymentMethod,
} from '../controllers/paymentMethods.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

router.get('/',              getPaymentMethods);                              // public
router.post('/',             authenticate, authorize('owner'), addPaymentMethod);
router.delete('/:id',        authenticate, authorize('owner'), deletePaymentMethod);
router.patch('/:id/default', authenticate, authorize('owner'), setDefaultPaymentMethod);
router.patch('/:id/toggle',  authenticate, authorize('owner'), togglePaymentMethod);

export default router;
