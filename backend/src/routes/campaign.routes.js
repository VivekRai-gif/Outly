import express from 'express';
import {
  createCampaign,
  getCampaigns,
  getCampaignById,
  updateCampaign,
  deleteCampaign,
  previewPersonalizedEmail,
  sendCampaign,
  pauseCampaign,
  resumeCampaign,
  getCampaignAnalytics,
} from '../controllers/campaign.controller.js';

const router = express.Router();

router.post('/preview', previewPersonalizedEmail);
router.post('/:id/send', sendCampaign);
router.post('/:id/pause', pauseCampaign);
router.post('/:id/resume', resumeCampaign);
router.get('/:id/analytics', getCampaignAnalytics);

router.route('/')
  .post(createCampaign)
  .get(getCampaigns);

router.route('/:id')
  .get(getCampaignById)
  .put(updateCampaign)
  .delete(deleteCampaign);

export default router;
