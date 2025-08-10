import mongoose from 'mongoose';

import config from '@/config/envConfig';

import type { Connection } from 'mongoose';

const { DB_URI } = config;

const mongooseInit = async (): Promise<Connection['db']> => {
  const res = await mongoose.connect(DB_URI, {
    serverSelectionTimeoutMS: 20000,
    waitQueueTimeoutMS: 50000,
    socketTimeoutMS: 50000,
    connectTimeoutMS: 50000,
    minPoolSize: 10, // Minimum number of connections
    maxPoolSize: 100,
  });
  // NODE_ENV === 'development' && mongoose.set('debug', true);

  return res.connection.db;
};

export default mongooseInit;
