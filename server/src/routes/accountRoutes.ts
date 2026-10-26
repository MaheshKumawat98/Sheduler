import { Router } from 'express';
import { protect } from '../middleware/authMiddleware';
import { getAccounts, disconnectAccount } from '../controllers/accountController';

const router = Router();

// Routes mounted at /api/accounts
router.get('/', protect, getAccounts);
router.delete('/:id', protect, disconnectAccount);

// Also support if mounted at /api
router.get('/accounts', protect, getAccounts);
router.delete('/accounts/:id', protect, disconnectAccount);

export default router;
