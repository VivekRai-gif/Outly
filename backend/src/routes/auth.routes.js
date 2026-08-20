import express from 'express';
import {
  initiateGoogleAuth,
  handleGoogleCallback,
  getAuthStatus,
  disconnectGoogle,
} from '../controllers/auth.controller.js';

const router = express.Router();

router.get('/google', initiateGoogleAuth);
router.get('/google/callback', handleGoogleCallback);
router.get('/google/status', getAuthStatus);
router.post('/google/disconnect', disconnectGoogle);

export default router;
