import { Router } from 'express';
import { protect } from '../middleware/authMiddleware';
import { getAccounts, disconnectAccount } from '../controllers/accountController';

const router = Router();

router.get('/accounts', protect, getAccounts);
router.delete('/accounts/:id', protect, disconnectAccount);

export default router;
