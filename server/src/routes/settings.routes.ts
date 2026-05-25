import { Router } from 'express';
import path from 'path';
import multer from 'multer';
import { getSettings, updateSetting, uploadNotificationSound, deleteNotificationSound } from '../controllers/settings.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

const soundsDir = path.resolve(process.cwd(), '../server/public/sounds');
const soundStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, soundsDir),
  filename:    (_req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});
const soundUpload = multer({
  storage: soundStorage,
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ['.mp3', '.wav', '.ogg'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) cb(null, true);
    else cb(new Error('Only MP3, WAV, and OGG files are allowed'));
  },
});

router.get('/',       getSettings);
router.patch('/:key', authenticate, authorize('owner'), updateSetting);
router.post('/notification-sound',   authenticate, authorize('owner'), soundUpload.single('sound'), uploadNotificationSound);
router.delete('/notification-sound', authenticate, authorize('owner'), deleteNotificationSound);

export default router;
