import { Document, Types } from 'mongoose';

interface OTP {
  userId: Types.ObjectId;
  email: string;
  otp: string;
  type: string; // password_reset, email_verification
  status: string; // active, used, expired
  expiresAt: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

interface OTPDocument extends OTP, Document {}

export { OTP, OTPDocument };
