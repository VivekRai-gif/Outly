import express from 'express';
import {
  registerUser,
  loginUser,
  logoutUser,
  getCurrentUser,
  initiateGoogleAuth,
  handleGoogleCallback,
  getAuthStatus,
  disconnectGoogle,
} from '../controllers/auth.controller.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/logout', logoutUser);
router.get('/me', getCurrentUser);

router.get('/google', initiateGoogleAuth);
router.get('/google/callback', handleGoogleCallback);
router.get('/google/status', getAuthStatus);
router.post('/google/disconnect', disconnectGoogle);

export default router;

