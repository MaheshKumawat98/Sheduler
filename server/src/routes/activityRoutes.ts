import { Router } from 'express';
import { protect } from '../middleware/authMiddleware';
import { getActivity } from '../controllers/activityController';

const router = Router();

// Supports both direct mounting at /api/activity (as '/') and /api (as '/activity')
router.get('/', protect, getActivity);
router.get('/activity', protect, getActivity);

export default router;
