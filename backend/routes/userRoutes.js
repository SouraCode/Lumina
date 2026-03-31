import express from 'express';
import { searchUsers, followUser, unfollowUser, getFollowers, getFollowing, getFriends, getChatContacts, updateProfile, getUserById } from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.get('/search', protect, searchUsers);
router.post('/follow', protect, followUser);
router.post('/unfollow', protect, unfollowUser);
router.get('/followers', protect, getFollowers);
router.get('/following', protect, getFollowing);
router.get('/friends', protect, getFriends);
router.get('/chat-contacts', protect, getChatContacts);
router.put('/profile', protect, upload.single('avatar'), updateProfile);
router.get('/:id', protect, getUserById);

export default router;
