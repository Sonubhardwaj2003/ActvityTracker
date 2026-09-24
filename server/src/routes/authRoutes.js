import express from 'express';
import {
  register,
  login,
  logout,
  getMe,
  updatePreferences,
  updateProfile,
  seedDemoData,
} from '../controllers/authController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.get('/me', protect, getMe);
router.put('/preferences', protect, updatePreferences);
router.put('/profile', protect, updateProfile);
router.post('/seed-demo', protect, seedDemoData);

export default router;

