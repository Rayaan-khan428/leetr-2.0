// middleware/auth.js
import { getAuth } from 'firebase-admin/auth';
import { firebaseAdmin } from '../lib/firebase-admin';

export async function verifyAuthToken(token) {
  try {
    const decodedToken = await getAuth(firebaseAdmin).verifyIdToken(token);
    return decodedToken;
  } catch (error) {
    console.error('Error verifying token:', error);
    throw new Error('Invalid token');
  }
}