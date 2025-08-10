import { Schema, model } from 'mongoose';
import { PlatformInfoDocument } from './platformInfo.type';

const platformInfoSchema = new Schema<PlatformInfoDocument>(
  {
    telegramGroupLink: {
      type: String,
    },
    platformIcon: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Model creation
const PlatformInfoModel = model<PlatformInfoDocument>('platform-infos', platformInfoSchema);

export default PlatformInfoModel;
