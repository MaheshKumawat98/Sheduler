import { Router } from 'express';
import { protect } from '../middleware/authMiddleware';
import upload from '../config/multer';
import { schedulePost, getPosts } from '../controllers/postController';

const router = Router();

router.post('/posts', protect, upload.single('media'), schedulePost);
router.get('/posts', protect, getPosts);

export default router;
