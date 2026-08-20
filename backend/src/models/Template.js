import mongoose from 'mongoose';

export const TEMPLATE_CATEGORIES = [
  'Internship',
  'Job Application',
  'Referral',
];

const templateSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Template title is required'],
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Template category is required'],
      enum: TEMPLATE_CATEGORIES,
      index: true,
    },
    subject: {
      type: String,
      required: [true, 'Template subject is required'],
      trim: true,
    },
    body: {
      type: String,
      required: [true, 'Template body is required'],
    },
    isSystem: {
      type: Boolean,
      default: false,
      index: true,
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
  },
  {
    timestamps: true,
  }
);

templateSchema.index({ title: 'text', subject: 'text', body: 'text' });

templateSchema.set('toJSON', {
  transform: (_doc, ret) => {
    delete ret.__v;
    return ret;
  },
});

const Template = mongoose.model('Template', templateSchema);

export default Template;
