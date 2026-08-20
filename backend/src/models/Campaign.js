import mongoose from 'mongoose';

export const CAMPAIGN_STATUSES = [
  'draft',
  'scheduled',
  'running',
  'paused',
  'completed',
  'failed',
];

const followUpSchema = new mongoose.Schema(
  {
    delayDays: {
      type: Number,
      required: [true, 'Follow-up delay in days is required'],
      min: [1, 'Delay days must be at least 1 day'],
      max: [365, 'Delay days cannot exceed 365 days'],
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
  },
  { _id: true }
);

const campaignSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Campaign name is required'],
      trim: true,
      maxlength: [150, 'Campaign name cannot exceed 150 characters'],
    },
    description: {
      type: String,
      trim: true,
      default: '',
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
        values: CAMPAIGN_STATUSES,
        message: '{VALUE} is not a valid campaign status',
      },
      default: 'draft',
      index: true,
    },
    contacts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Contact',
      },
    ],
    followUps: [followUpSchema],
  },
  {
    timestamps: true,
  }
);

campaignSchema.index({ status: 1, createdAt: -1 });

campaignSchema.set('toJSON', {
  transform: (_doc, ret) => {
    delete ret.__v;
    return ret;
  },
});

const Campaign = mongoose.model('Campaign', campaignSchema);

export default Campaign;
