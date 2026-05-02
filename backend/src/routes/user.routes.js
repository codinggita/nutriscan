import express from 'express';
import { 
  registerUser, 
  loginUser, 
  getUserProfile, 
  updateUserProfile 
} from '../controllers/user.controller.js';
import protect from '../middlewares/auth.middleware.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);

// Profile routes (protected)
router.get('/profile', protect, getUserProfile);
router.patch('/profile', protect, updateUserProfile);

export default router;
