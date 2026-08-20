import express from 'express';
import { sendTestEmail } from '../controllers/email.controller.js';

const router = express.Router();

router.post('/test', sendTestEmail);

export default router;
