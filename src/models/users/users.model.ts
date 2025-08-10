import { Schema, model } from 'mongoose';
import { USER_STATUS_TYPE, AUTH_PROVIDER } from '@/types/enums/enums.common';
import { UsersDocument } from './users.type';

const userSchema = new Schema<UsersDocument>(
  {
    username: {
      type: String,
      maxlength: 50,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      maxlength: 100,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      minlength: 6,
      // Required only for email authentication
    },
    country: {
      type: String,
      maxlength: 3, // Country code (ISO 3166-1 alpha-3)
      required: true,
      uppercase: true,
    },
    authProvider: {
      type: String,
      enum: Object.values(AUTH_PROVIDER),
      required: true,
      default: AUTH_PROVIDER.EMAIL,
    },
    telegramId: {
      type: String,
      sparse: true, // Allows multiple null values but unique non-null values
      unique: true,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    lastLogin: {
      type: Date,
    },
    source: {
      type: String,
      default: 'rushbet',
    },
    sourceId: {
      type: String,
    },
    userAgent: {
      type: String,
    },
    status: {
      type: String,
      enum: Object.values(USER_STATUS_TYPE),
      default: USER_STATUS_TYPE.ACTIVE,
    },
    gameId: {
      type: Schema.Types.ObjectId,
      ref: 'games',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Ensure password is required for email authentication
userSchema.pre('save', function (next) {
  if (this.authProvider === AUTH_PROVIDER.EMAIL && !this.password) {
    next(new Error('Password is required for email authentication'));
  }
  if (this.authProvider === AUTH_PROVIDER.TELEGRAM && !this.telegramId) {
    next(new Error('Telegram ID is required for telegram authentication'));
  }
  next();
});

// Model creation
const UserModel = model<UsersDocument>('users', userSchema);

export default UserModel;
