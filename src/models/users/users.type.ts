import { Document } from 'mongoose';

interface Users {
  username: string;
  email: string;
  password?: string;
  country?: string; // Made optional
  authProvider: string;
  telegramId?: string;
  isEmailVerified: boolean;
  status: string;
  source: string;
  lastLogin?: Date;
  createdAt?: Date;
  updatedAt?: Date;
  // Removed gameId field
}

interface UserDocument extends Users, Document {}

export { Users, UserDocument };
