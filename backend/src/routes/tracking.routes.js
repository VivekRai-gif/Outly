import express from 'express';
import { handleOpenTracking, handleClickTracking } from '../controllers/tracking.controller.js';

const router = express.Router();

router.get('/open/:emailId', handleOpenTracking);
router.get('/click/:emailId', handleClickTracking);

export default router;
