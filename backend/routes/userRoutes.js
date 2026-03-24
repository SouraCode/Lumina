import express from 'express';
import { searchUsers, sendFriendRequest, respondUserRequest, getPendingRequests, getFriends, updateProfile, getUserById } from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.get('/search', protect, searchUsers);
router.get('/friends', protect, getFriends);
router.get('/requests/pending', protect, getPendingRequests);
router.post('/requests/send', protect, sendFriendRequest);
router.post('/requests/respond', protect, respondUserRequest);
router.put('/profile', protect, upload.single('avatar'), updateProfile);
router.get('/:id', protect, getUserById);

export default router;
