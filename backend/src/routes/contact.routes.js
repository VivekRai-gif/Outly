import express from 'express';
import {
  uploadContactsPdf,
  bulkSaveContacts,
  getContacts,
  getContactById,
  createContact,
  updateContact,
  deleteContact,
  triggerReplyCheck,
  getContactActivity,
} from '../controllers/contact.controller.js';
import { handlePdfUpload } from '../middleware/upload.middleware.js';

const router = express.Router();

router.post('/upload', handlePdfUpload, uploadContactsPdf);
router.post('/bulk', bulkSaveContacts);
router.post('/check-replies', triggerReplyCheck);
router.get('/:id/activity', getContactActivity);

router.route('/')
  .get(getContacts)
  .post(createContact);

router.route('/:id')
  .get(getContactById)
  .put(updateContact)
  .delete(deleteContact);

export default router;
