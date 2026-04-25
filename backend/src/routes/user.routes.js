import express from 'express';
import { 
  registerUser, 
  loginUser, 
  getUserProfile, 
  updateUserProfile 
} from '../controllers/user.controller.js';
// import { protect } from '../middlewares/auth.middleware.js'; // Placeholder for next class

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);

// Note: Protection middleware will be added in the next step
router.get('/profile', getUserProfile);
router.patch('/profile', updateUserProfile);

export default router;
