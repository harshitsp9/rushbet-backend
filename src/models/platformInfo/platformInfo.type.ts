import { Document } from 'mongoose';

interface PlatformInfo {
  telegramGroupLink: string;
  platformIcon: string;
}

interface PlatformInfoDocument extends PlatformInfo, Document {}

export { PlatformInfo, PlatformInfoDocument };
