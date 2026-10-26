import { Router } from 'express';
import { protect } from '../middleware/authMiddleware';
import { getOAuthUrl, syncAccounts } from '../controllers/socialAuthController';

const router = Router();

router.get('/oauth/sync', protect, syncAccounts);
router.get('/oauth/:platform/url', protect, getOAuthUrl);

export default router;
