import { Document, Types } from 'mongoose';

interface Users {
  username: string;
  email: string;
  password?: string; // Optional for telegram users
  country: string;
  source: string;
  sourceId: string;
  status: string;
  userAgent: string;
  authProvider: string; // email or telegram
  telegramId?: string; // For telegram login
  isEmailVerified: boolean;
  lastLogin?: Date;
  gameId: Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}

interface UsersDocument extends Users, Document {}

export { Users, UsersDocument };
