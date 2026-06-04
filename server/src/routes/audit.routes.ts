import { Router } from 'express';
import { getAuditLogs, deleteAuditLog, deleteAllAuditLogs, deleteManyAuditLogs } from '../controllers/audit.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

router.get('/',        authenticate, authorize('owner'), getAuditLogs);
router.delete('/all',  authenticate, authorize('owner'), deleteAllAuditLogs);
router.post('/bulk-delete', authenticate, authorize('owner'), deleteManyAuditLogs);
router.delete('/:id',  authenticate, authorize('owner'), deleteAuditLog);

export default router;
