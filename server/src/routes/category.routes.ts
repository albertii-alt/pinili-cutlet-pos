import { Router } from 'express';
import { getAll, create, remove } from '../controllers/category.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

router.get('/',    authenticate, getAll);
router.post('/',   authenticate, authorize('owner'), create);
router.delete('/:id', authenticate, authorize('owner'), remove);

export default router;
