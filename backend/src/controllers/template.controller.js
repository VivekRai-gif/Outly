import Template from '../models/Template.js';

/**
 * @route   GET /api/templates
 * @desc    Get all templates (with category filter and text search)
 * @access  Public
 */
export const getTemplates = async (req, res, next) => {
  try {
    const { category, search } = req.query;
    const filter = {};

    if (category && category !== 'All') {
      filter.category = category;
    }

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { subject: { $regex: search, $options: 'i' } },
        { body: { $regex: search, $options: 'i' } },
      ];
    }

    const templates = await Template.find(filter).sort({ isSystem: -1, createdAt: -1 });

    // Category breakdown counts
    const allTemplates = await Template.find({});
    const categoryCounts = allTemplates.reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + 1;
      acc['All'] = (acc['All'] || 0) + 1;
      return acc;
    }, { All: 0 });

    res.status(200).json({
      success: true,
      count: templates.length,
      categoryCounts,
      templates,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/templates/:id
 * @desc    Get single template by ID
 * @access  Public
 */
export const getTemplateById = async (req, res, next) => {
  try {
    const template = await Template.findById(req.params.id);
    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Template not found',
      });
    }

    res.status(200).json({
      success: true,
      template,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/templates
 * @desc    Create a custom email template
 * @access  Public
 */
export const createTemplate = async (req, res, next) => {
  try {
    const { title, category, subject, body, tags } = req.body;

    if (!title || !category || !subject || !body) {
      return res.status(400).json({
        success: false,
        message: 'Title, category, subject, and body are required fields',
      });
    }

    const template = await Template.create({
      title,
      category,
      subject,
      body,
      isSystem: false,
      tags: Array.isArray(tags) ? tags : [],
    });

    res.status(201).json({
      success: true,
      message: 'Custom template created successfully',
      template,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/templates/:id/duplicate
 * @desc    Duplicate a template to create a customizable user copy
 * @access  Public
 */
export const duplicateTemplate = async (req, res, next) => {
  try {
    const sourceTemplate = await Template.findById(req.params.id);
    if (!sourceTemplate) {
      return res.status(404).json({
        success: false,
        message: 'Source template not found',
      });
    }

    const duplicated = await Template.create({
      title: `${sourceTemplate.title} (Copy)`,
      category: sourceTemplate.category,
      subject: sourceTemplate.subject,
      body: sourceTemplate.body,
      isSystem: false,
      tags: sourceTemplate.tags || [],
    });

    res.status(201).json({
      success: true,
      message: 'Template duplicated successfully',
      template: duplicated,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   DELETE /api/templates/:id
 * @desc    Delete a custom template (System templates cannot be deleted)
 * @access  Public
 */
export const deleteTemplate = async (req, res, next) => {
  try {
    const template = await Template.findById(req.params.id);
    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Template not found',
      });
    }

    if (template.isSystem) {
      return res.status(400).json({
        success: false,
        message: 'System templates are read-only and cannot be deleted. You can duplicate them to customize.',
      });
    }

    await Template.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Custom template deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
