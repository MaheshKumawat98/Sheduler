import { Router } from 'express';
import { protect } from '../middleware/authMiddleware';
import upload from '../config/multer';
import {
  generatePost,
  schedulePost,
  getPosts,
} from '../controllers/postController';

const router = Router();

// Routes mounted at /api/posts
router.post('/generate', protect, generatePost);
router.post('/', protect, upload.single('media'), schedulePost);
router.get('/', protect, getPosts);

// Also support if mounted at /api
router.post('/posts/generate', protect, generatePost);
router.post('/posts', protect, upload.single('media'), schedulePost);
router.get('/posts', protect, getPosts);

export default router;
