import { Router } from 'express';
import { getSettings, updateSetting } from '../controllers/settings.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

router.get('/',       getSettings);  // public — stall name shown on login page
router.patch('/:key', authenticate, authorize('owner'), updateSetting);

export default router;
