import { Router } from 'express';
import { getAuditLogs, deleteAuditLog, deleteAllAuditLogs } from '../controllers/audit.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

router.get('/',    authenticate, authorize('owner'), getAuditLogs);
router.delete('/all', authenticate, authorize('owner'), deleteAllAuditLogs);
router.delete('/:id', authenticate, authorize('owner'), deleteAuditLog);

export default router;
