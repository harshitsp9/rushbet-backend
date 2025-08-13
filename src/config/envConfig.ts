//all env configs
const config = {
  NODE_ENV: process.env.NODE_ENV as string,
  PORT: process.env.PORT as string,
  DB_URI: process.env.DB_URI as string,
  JWT_SECRET: process.env.JWT_SECRET as string,
  //speed
  SPEED_DEPOSIT_URL: process.env.SPEED_DEPOSIT_URL as string,
  SPEED_WITHDRAWAL_URL: process.env.SPEED_WITHDRAWAL_URL as string,
  BACKEND_URL: process.env.BACKEND_URL as string,
  //hookdeck
  HOOKDECK_SECRET: process.env.HOOKDECK_SECRET as string,

  //firebase
  FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID as string,
  FIREBASE_PRIVATE_KEY: process.env.FIREBASE_PRIVATE_KEY as string,
  FIREBASE_CLIENT_EMAIL: process.env.FIREBASE_CLIENT_EMAIL as string,

  //game provider
  ONLY_PLAY_SECRET_KEY: process.env.ONLY_PLAY_SECRET_KEY as string,

  //email service
  EMAIL_HOST: process.env.EMAIL_HOST as string,
  EMAIL_PORT: process.env.EMAIL_PORT as string,
  EMAIL_USER: process.env.EMAIL_USER as string,
  EMAIL_PASS: process.env.EMAIL_PASS as string,
  EMAIL_FROM: process.env.EMAIL_FROM as string,

  //webhook
  DEPOSIT_WEBHOOK_SECRET: process.env.DEPOSIT_WEBHOOK_SECRET as string,
  WITHDRAWAL_WEBHOOK_SECRET: process.env.WITHDRAWAL_WEBHOOK_SECRET as string,
};

export default config;
