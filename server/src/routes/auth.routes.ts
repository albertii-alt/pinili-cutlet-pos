import { Router } from 'express';
import { login, logout, changePassword, changeUsername, getAllStaff, createStaff, updateStaff, deleteStaff, toggleStaffStatus } from '../controllers/auth.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

router.post('/login', login);
router.post('/logout',               authenticate,                    logout);
router.put('/change-password',       authenticate,                    changePassword);
router.put('/change-username',       authenticate,                    changeUsername);
router.get('/staff',                 authenticate, authorize('owner'), getAllStaff);
router.post('/staff',                authenticate, authorize('owner'), createStaff);
router.put('/staff/:id',             authenticate, authorize('owner'), updateStaff);
router.delete('/staff/:id',          authenticate, authorize('owner'), deleteStaff);
router.patch('/staff/:id/toggle',    authenticate, authorize('owner'), toggleStaffStatus);

export default router;
