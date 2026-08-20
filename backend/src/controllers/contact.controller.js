import Contact from '../models/Contact.js';
import EmailEvent from '../models/EmailEvent.js';
import { extractContactsFromPdf } from '../services/contactParser.service.js';
import { checkForReplies } from '../services/replyDetectionService.js';
import fs from 'fs';

/**
 * @route   GET /api/contacts/:id/activity
 * @desc    Get contact activity timeline
 * @access  Public
 */
export const getContactActivity = async (req, res, next) => {
  try {
    const contact = await Contact.findById(req.params.id);

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact not found',
      });
    }

    const events = await EmailEvent.find({ contactId: contact._id })
      .populate('emailId', 'subject type status sentAt')
      .sort({ timestamp: -1 });

    res.status(200).json({
      success: true,
      contact,
      count: events.length,
      activity: events,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/contacts/upload
 * @desc    Upload PDF and extract contact records
 * @access  Public
 */
export const uploadContactsPdf = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No PDF file uploaded',
      });
    }

    const filePath = req.file.path;
    const extractedData = await extractContactsFromPdf(filePath);

    fs.unlink(filePath, (err) => {
      if (err) console.error('Failed to delete temporary PDF upload file:', err);
    });

    res.status(200).json({
      success: true,
      message: 'PDF contacts parsed successfully',
      file: {
        originalName: req.file.originalname,
        filename: req.file.filename,
        size: req.file.size,
      },
      contacts: extractedData.contacts,
      totalFound: extractedData.contactsCount,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/contacts/check-replies
 * @desc    Trigger scan of Gmail inbox for recipient replies
 * @access  Public
 */
export const triggerReplyCheck = async (req, res, next) => {
  try {
    const result = await checkForReplies();
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/contacts/bulk
 * @desc    Confirm and save bulk contacts into MongoDB
 * @access  Public
 */
export const bulkSaveContacts = async (req, res, next) => {
  try {
    const { contacts } = req.body;

    if (!Array.isArray(contacts) || contacts.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No contacts provided to save',
      });
    }

    const ops = contacts.map((c) => ({
      updateOne: {
        filter: { email: c.email.toLowerCase().trim() },
        update: {
          $set: {
            name: c.name ? c.name.trim() : 'Unknown',
            email: c.email.toLowerCase().trim(),
            company: c.company ? c.company.trim() : '',
            role: c.role ? c.role.trim() : '',
            phone: c.phone ? c.phone.trim() : '',
            status: c.status || 'ready',
            sourceFile: c.sourceFile || 'PDF Upload',
          },
        },
        upsert: true,
      },
    }));

    await Contact.bulkWrite(ops);

    const savedContacts = await Contact.find({
      email: { $in: contacts.map((c) => c.email.toLowerCase().trim()) },
    });

    res.status(201).json({
      success: true,
      message: `Successfully confirmed and saved ${savedContacts.length} contacts`,
      count: savedContacts.length,
      contacts: savedContacts,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/contacts
 * @desc    Create a single contact manually
 * @access  Public
 */
export const createContact = async (req, res, next) => {
  try {
    const { name, email, company, role, phone, status } = req.body;

    if (!name || !email) {
      return res.status(400).json({
        success: false,
        message: 'Name and email are required fields',
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existing = await Contact.findOne({ email: normalizedEmail });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'A contact with this email address already exists',
      });
    }

    const contact = await Contact.create({
      name: name.trim(),
      email: normalizedEmail,
      company: company ? company.trim() : '',
      role: role ? role.trim() : '',
      phone: phone ? phone.trim() : '',
      status: status || 'ready',
      sourceFile: 'Manual Entry',
    });

    res.status(201).json({
      success: true,
      message: 'Contact created successfully via manual entry',
      contact,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/contacts
 * @desc    Get contacts list with search, filtering, and pagination
 * @access  Public
 */
export const getContacts = async (req, res, next) => {
  try {
    const { search, status, sortBy = 'createdAt', order = 'desc', page = 1, limit = 50 } = req.query;

    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } },
        { role: { $regex: search, $options: 'i' } },
      ];
    }

    if (status) {
      query.status = status;
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 50;
    const skip = (pageNum - 1) * limitNum;
    const sortDirection = order === 'asc' ? 1 : -1;

    const total = await Contact.countDocuments(query);
    const contacts = await Contact.find(query)
      .sort({ [sortBy]: sortDirection })
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({
      success: true,
      count: contacts.length,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
      contacts,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/contacts/:id
 * @desc    Get single contact by ID
 * @access  Public
 */
export const getContactById = async (req, res, next) => {
  try {
    const contact = await Contact.findById(req.params.id);

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact not found',
      });
    }

    res.status(200).json({
      success: true,
      contact,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /api/contacts/:id
 * @desc    Update single contact
 * @access  Public
 */
export const updateContact = async (req, res, next) => {
  try {
    const { name, email, company, role, phone, status } = req.body;

    const contact = await Contact.findById(req.params.id);

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact not found',
      });
    }

    if (email && email.toLowerCase().trim() !== contact.email) {
      const existing = await Contact.findOne({ email: email.toLowerCase().trim() });
      if (existing) {
        return res.status(400).json({
          success: false,
          message: 'Email address already exists for another contact',
        });
      }
    }

    if (name !== undefined) contact.name = name.trim();
    if (email !== undefined) contact.email = email.toLowerCase().trim();
    if (company !== undefined) contact.company = company.trim();
    if (role !== undefined) contact.role = role.trim();
    if (phone !== undefined) contact.phone = phone.trim();
    if (status !== undefined) contact.status = status;

    const updatedContact = await contact.save();

    res.status(200).json({
      success: true,
      message: 'Contact updated successfully',
      contact: updatedContact,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   DELETE /api/contacts/:id
 * @desc    Delete contact by ID
 * @access  Public
 */
export const deleteContact = async (req, res, next) => {
  try {
    const contact = await Contact.findByIdAndDelete(req.params.id);

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Contact deleted successfully',
      id: req.params.id,
    });
  } catch (error) {
    next(error);
  }
};
