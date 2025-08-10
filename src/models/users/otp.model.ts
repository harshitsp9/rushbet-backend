import { Schema, model } from 'mongoose';
import { OTP_TYPE, OTP_STATUS } from '@/types/enums/enums.common';
import { OTPDocument } from './otp.type';

const otpSchema = new Schema<OTPDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'users',
      required: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
    },
    otp: {
      type: String,
      required: true,
      length: 6,
    },
    type: {
      type: String,
      enum: Object.values(OTP_TYPE),
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(OTP_STATUS),
      default: OTP_STATUS.ACTIVE,
    },
    expiresAt: {
      type: Date,
      required: true,
      default: () => new Date(Date.now() + 5 * 60 * 1000), // 5 minutes from now
    },
  },
  {
    timestamps: true,
  }
);

// Index for automatic deletion of expired documents
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Index for better performance
otpSchema.index({ userId: 1, type: 1 });
otpSchema.index({ email: 1, otp: 1, type: 1 });

// Model creation
const OTPModel = model<OTPDocument>('otp', otpSchema);

export default OTPModel;
