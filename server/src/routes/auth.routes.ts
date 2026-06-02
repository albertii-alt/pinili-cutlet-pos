import { Router } from 'express';
import multer from 'multer';
import {
  login, logout, changePassword, changeUsername,
  getAllStaff, createStaff, updateStaff, deleteStaff, toggleStaffStatus,
  uploadAvatar, deleteAvatar, changeNickname,
} from '../controllers/auth.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (/^image\/(png|jpeg|webp)$/.test(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only PNG, JPG, and WebP images are allowed'));
    }
  },
});

router.post('/login', login);
router.post('/logout',               authenticate,                    logout);
router.put('/change-password',       authenticate,                    changePassword);
router.put('/change-username',       authenticate,                    changeUsername);
router.get('/staff',                 authenticate, authorize('owner'), getAllStaff);
router.post('/staff',                authenticate, authorize('owner'), createStaff);
router.put('/staff/:id',             authenticate, authorize('owner'), updateStaff);
router.delete('/staff/:id',          authenticate, authorize('owner'), deleteStaff);
router.patch('/staff/:id/toggle',    authenticate, authorize('owner'), toggleStaffStatus);
router.post('/avatar',               authenticate, upload.single('avatar'), uploadAvatar);
router.delete('/avatar',             authenticate, deleteAvatar);
router.put('/nickname',              authenticate, changeNickname);

export default router;
