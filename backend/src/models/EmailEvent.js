import mongoose from 'mongoose';

export const EVENT_TYPES = [
  'sent',
  'delivered',
  'opened',
  'clicked',
  'replied',
  'bounced',
  'failed',
];

const emailEventSchema = new mongoose.Schema(
  {
    emailId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Email',
      required: false,
      index: true,
    },
    contactId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Contact',
      required: [true, 'Contact reference is required'],
      index: true,
    },
    eventType: {
      type: String,
      required: [true, 'Event type is required'],
      enum: {
        values: EVENT_TYPES,
        message: '{VALUE} is not a valid email event type',
      },
      index: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: false, // Event has explicit 'timestamp' field
  }
);

// Indexes for activity timeline queries and campaign analytics
emailEventSchema.index({ emailId: 1, eventType: 1 });
emailEventSchema.index({ contactId: 1, timestamp: -1 });

emailEventSchema.set('toJSON', {
  transform: (_doc, ret) => {
    delete ret.__v;
    return ret;
  },
});

const EmailEvent = mongoose.model('EmailEvent', emailEventSchema);

export default EmailEvent;
