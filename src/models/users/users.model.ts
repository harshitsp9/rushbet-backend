import { Schema, model } from 'mongoose';
import { AUTH_PROVIDER, USER_STATUS_TYPE } from '@/types/enums/enums.common';
import { UserDocument } from './users.type';

const userSchema = new Schema<UserDocument>(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3,
      maxlength: 50,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      minlength: 6,
    },
    country: {
      type: String,
      uppercase: true,
      minlength: 3,
      maxlength: 3,
      // Removed required: true to make it optional
    },
    authProvider: {
      type: String,
      enum: Object.values(AUTH_PROVIDER),
      required: true,
    },
    telegramId: {
      type: String,
      unique: true,
      sparse: true,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: Object.values(USER_STATUS_TYPE),
      default: USER_STATUS_TYPE.ACTIVE,
    },
    source: {
      type: String,
      default: 'rushbet',
    },
    lastLogin: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save hook to validate required fields based on auth provider
userSchema.pre('save', function (next) {
  if (this.authProvider === AUTH_PROVIDER.EMAIL && !this.password) {
    return next(new Error('Password is required for email authentication'));
  }
  if (this.authProvider === AUTH_PROVIDER.TELEGRAM && !this.telegramId) {
    return next(new Error('Telegram ID is required for telegram authentication'));
  }
  next();
});

// Model creation
const UserModel = model<UserDocument>('users', userSchema);

export default UserModel;
