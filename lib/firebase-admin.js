import { initializeApp, getApps, cert } from 'firebase-admin/app';

// loads the service account credentials from environment variables
const firebaseAdminConfig = {
  credential: cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    // This environment variable comes as a JSON string, so we need to parse it
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
  })
};

// Initialize Firebase Admin
const firebaseAdmin = 
  getApps().length === 0 ? initializeApp(firebaseAdminConfig) : getApps()[0];

export { firebaseAdmin };