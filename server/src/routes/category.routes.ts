import { Router } from 'express';
import { getAll, create, rename, remove } from '../controllers/category.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

router.get('/',              authenticate, getAll);
router.post('/',             authenticate, authorize('owner'), create);
router.patch('/:id/rename',  authenticate, authorize('owner'), rename);
router.delete('/:id',        authenticate, authorize('owner'), remove);

export default router;
