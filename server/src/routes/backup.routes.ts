import { Router } from 'express';
import path from 'path';
import os from 'os';
import multer from 'multer';
import {
  createBackup, restoreBackup, listBackups,
  deleteBackup, configAutoBackup, downloadBackupFile,
} from '../controllers/backup.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

// Temp storage for restore uploads
const restoreUpload = multer({
  dest: os.tmpdir(),
  limits: { fileSize: 100 * 1024 * 1024 }, // 100 MB max
  fileFilter: (_req, file, cb) => {
    if (path.extname(file.originalname).toLowerCase() === '.db') cb(null, true);
    else cb(new Error('Only .db files are allowed'));
  },
});

router.post(  '/create',      authenticate, authorize('owner'), createBackup);
router.post(  '/restore',     authenticate, authorize('owner'), restoreUpload.single('db'), restoreBackup);
router.get(   '/list',        authenticate, authorize('owner'), listBackups);
router.delete('/:filename',   authenticate, authorize('owner'), deleteBackup);
router.post(  '/auto-config', authenticate, authorize('owner'), configAutoBackup);
router.get(   '/download/:filename', authenticate, authorize('owner'), downloadBackupFile);

export default router;
