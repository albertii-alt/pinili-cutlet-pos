import { Router } from 'express';
import {
  getExpenses,
  getExpenseSummary,
  addExpense,
  updateExpense,
  deleteExpense,
} from '../controllers/expense.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

// All expense routes are owner-only
router.get('/',         authenticate, authorize('owner'), getExpenses);
router.get('/summary',  authenticate, authorize('owner'), getExpenseSummary);
router.post('/',        authenticate, authorize('owner'), addExpense);
router.put('/:id',      authenticate, authorize('owner'), updateExpense);
router.delete('/:id',   authenticate, authorize('owner'), deleteExpense);

export default router;
