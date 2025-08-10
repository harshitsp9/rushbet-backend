import config from '@/config/envConfig';
import admin from 'firebase-admin';
const { FIREBASE_PROJECT_ID, FIREBASE_PRIVATE_KEY, FIREBASE_CLIENT_EMAIL } = config;

admin.initializeApp({
  credential: admin.credential.cert({
    projectId: FIREBASE_PROJECT_ID,
    privateKey: FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'), // Fix line breaks
    clientEmail: FIREBASE_CLIENT_EMAIL,
  }),
});
const firebaseDatabase = admin.firestore();
export { firebaseDatabase };
