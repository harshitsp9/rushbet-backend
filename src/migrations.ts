import mongooseInit from './config/db';

// Initialize DB connection
mongooseInit()
  .then(() => console.log('DB connection established'))
  .catch((error) => console.log('DB connection error', error));
