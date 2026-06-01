import { Router } from 'express';
import {
  getNotifications, getUnreadCount,
  markAsRead, markAllAsRead, deleteNotification,
} from '../controllers/notification.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

router.get('/',            authenticate, authorize('owner'), getNotifications);
router.get('/unread-count', authenticate, authorize('owner'), getUnreadCount);
router.put('/read-all',    authenticate, authorize('owner'), markAllAsRead);
router.put('/:id/read',    authenticate, authorize('owner'), markAsRead);
router.delete('/:id',      authenticate, authorize('owner'), deleteNotification);

export default router;
