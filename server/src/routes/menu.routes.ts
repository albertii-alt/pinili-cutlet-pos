import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { getAll, getById, create, update, remove, toggleAvailability, toggleFeatured, setPromoPrice, uploadImage, bulkToggleAvailability } from '../controllers/menu.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const storage = multer.diskStorage({
  destination: path.join(__dirname, '../../public/images'),
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e6)}`;
    cb(null, `${unique}${path.extname(file.originalname)}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp/;
    cb(null, allowed.test(path.extname(file.originalname).toLowerCase()));
  },
});

const router = Router();

router.get('/',                    authenticate, getAll);
router.get('/:id',                 authenticate, getById);
router.post('/',                   authenticate, authorize('owner'), upload.single('image'), create);
router.put('/:id',                 authenticate, authorize('owner'), upload.single('image'), update);
router.delete('/:id',              authenticate, authorize('owner'), remove);
router.patch('/:id/availability',  authenticate, authorize('owner', 'cashier'), toggleAvailability);
router.patch('/:id/featured',      authenticate, authorize('owner'), toggleFeatured);
router.patch('/:id/promo',         authenticate, authorize('owner'), setPromoPrice);
router.patch('/bulk-availability', authenticate, authorize('owner'), bulkToggleAvailability);
router.post('/upload',             authenticate, authorize('owner'), upload.single('image'), uploadImage);

export default router;
