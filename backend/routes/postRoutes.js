import express from 'express';
import { createPost, getFeed, likePost, getUserPosts, addComment, deletePost } from '../controllers/postController.js';
import { protect } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.get('/feed', protect, getFeed);
router.get('/user/:id', protect, getUserPosts);
router.post('/', protect, upload.single('media'), createPost);
router.put('/:id/like', protect, likePost);
router.post('/:id/comment', protect, addComment);
router.delete('/:id', protect, deletePost);

export default router;
