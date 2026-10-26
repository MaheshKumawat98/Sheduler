import { Router } from 'express';
import { protect } from '../middleware/authMiddleware';
import { getOAuthUrl, syncAccounts } from '../controllers/socialAuthController';

const router = Router();

// Routes mounted at /api/oauth
router.get('/sync', protect, syncAccounts);
router.get('/:platform/url', protect, getOAuthUrl);

// Also support if mounted at /api
router.get('/oauth/sync', protect, syncAccounts);
router.get('/oauth/:platform/url', protect, getOAuthUrl);

export default router;
