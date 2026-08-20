import mongoose from 'mongoose';

export const EMAIL_TYPES = ['initial', 'follow_up'];
export const EMAIL_STATUSES = ['queued', 'sent', 'failed'];

const emailSchema = new mongoose.Schema(
  {
    campaignId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Campaign',
      required: [true, 'Campaign reference is required'],
      index: true,
    },
    contactId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Contact',
      required: [true, 'Contact reference is required'],
      index: true,
    },
    messageId: {
      type: String,
      trim: true,
      default: '',
    },
    type: {
      type: String,
      enum: {
        values: EMAIL_TYPES,
        message: '{VALUE} is not a valid email type',
      },
      default: 'initial',
    },
    subject: {
      type: String,
      trim: true,
      default: '',
    },
    body: {
      type: String,
      trim: true,
      default: '',
    },
    status: {
      type: String,
      enum: {
        values: EMAIL_STATUSES,
        message: '{VALUE} is not a valid email send status',
      },
      default: 'queued',
      index: true,
    },
    scheduledAt: {
      type: Date,
      default: Date.now,
    },
    sentAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for query optimization
emailSchema.index({ campaignId: 1, contactId: 1 });
emailSchema.index({ campaignId: 1, status: 1 });

emailSchema.set('toJSON', {
  transform: (_doc, ret) => {
    delete ret.__v;
    return ret;
  },
});

const Email = mongoose.model('Email', emailSchema);

export default Email;
