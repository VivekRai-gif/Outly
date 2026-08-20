import express from 'express';
import {
  getTemplates,
  getTemplateById,
  createTemplate,
  duplicateTemplate,
  deleteTemplate,
} from '../controllers/template.controller.js';

const router = express.Router();

router.get('/', getTemplates);
router.get('/:id', getTemplateById);
router.post('/', createTemplate);
router.post('/:id/duplicate', duplicateTemplate);
router.delete('/:id', deleteTemplate);

export default router;
