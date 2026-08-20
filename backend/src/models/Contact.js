import mongoose from 'mongoose';

export const CONTACT_STATUSES = [
  'pending',
  'ready',
  'sent',
  'follow_up_pending',
  'replied',
  'bounced',
  'completed',
  'failed',
];

const contactSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Contact name is required'],
      trim: true,
      maxlength: [120, 'Name cannot exceed 120 characters'],
    },
    email: {
      type: String,
      required: [true, 'Contact email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,})+$/,
        'Please provide a valid email address',
      ],
    },
    company: {
      type: String,
      trim: true,
      default: '',
    },
    role: {
      type: String,
      trim: true,
      default: '',
    },
    phone: {
      type: String,
      trim: true,
      default: '',
    },
    status: {
      type: String,
      enum: {
        values: CONTACT_STATUSES,
        message: '{VALUE} is not a valid contact status',
      },
      default: 'pending',
      index: true,
    },
    sourceFile: {
      type: String,
      trim: true,
      default: '',
    },
    lastEmailSentAt: {
      type: Date,
      default: null,
    },
    nextFollowUpAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for fast status filtering and deduplication checks
contactSchema.index({ email: 1, status: 1 });
contactSchema.index({ createdAt: -1 });

contactSchema.set('toJSON', {
  transform: (_doc, ret) => {
    delete ret.__v;
    return ret;
  },
});

const Contact = mongoose.model('Contact', contactSchema);

export default Contact;
