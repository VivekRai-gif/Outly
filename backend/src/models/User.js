import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'User name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email address is required'],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,})+$/,
        'Please provide a valid email address',
      ],
    },
    password: {
      type: String,
      select: false,
    },
    avatar: {
      type: String,
      default: '',
    },
    company: {
      type: String,
      default: '',
    },
    role: {
      type: String,
      default: 'Growth Marketer',
    },
    gmailConnected: {
      type: Boolean,
      default: false,
    },
    gmailEmail: {
      type: String,
      default: null,
    },
    gmailConnectedAt: {
      type: Date,
      default: null,
    },
    googleTokens: {
      access_token: String,
      refresh_token: String,
      scope: String,
      token_type: String,
      expiry_date: Number,
      id_token: String,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent returning version keys or sensitive fields in JSON
userSchema.set('toJSON', {
  transform: (_doc, ret) => {
    delete ret.__v;
    delete ret.password;
    return ret;
  },
});

const User = mongoose.model('User', userSchema);

export default User;

