import { Router } from 'express';
import multer from 'multer';
import {
  getPaymentMethods,
  addPaymentMethod,
  deletePaymentMethod,
  setDefaultPaymentMethod,
  togglePaymentMethod,
  updatePaymentMethodColor,
  uploadPaymentLogo,
  deletePaymentLogo,
} from '../controllers/paymentMethods.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

// Multer: memory storage, 2MB limit, images only
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (/^image\/(png|jpeg|webp)$/.test(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only PNG, JPG, and WebP images are allowed'));
    }
  },
});

router.get('/',              getPaymentMethods);                              // public
router.post('/',             authenticate, authorize('owner'), addPaymentMethod);
router.delete('/:id',        authenticate, authorize('owner'), deletePaymentMethod);
router.patch('/:id/default', authenticate, authorize('owner'), setDefaultPaymentMethod);
router.patch('/:id/toggle',  authenticate, authorize('owner'), togglePaymentMethod);
router.patch('/:id/color',   authenticate, authorize('owner'), updatePaymentMethodColor);
router.post('/:id/logo',     authenticate, authorize('owner'), upload.single('logo'), uploadPaymentLogo);
router.delete('/:id/logo',   authenticate, authorize('owner'), deletePaymentLogo);

export default router;
