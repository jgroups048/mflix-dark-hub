
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  updatePassword as firebaseUpdatePassword,
  User as FirebaseUser
} from 'firebase/auth';
import { auth } from '@/integrations/firebase/client';

export type AuthUser = {
  id: string;
  email: string;
  role: string;
};

function transformUser(user: FirebaseUser): AuthUser {
  return {
    id: user.uid,
    email: user.email!,
    role: user.email === 'admin@example.com' ? 'admin' : 'user', // Simple role check, adjust as needed
  };
}

// Check if Firebase auth is available
const isFirebaseConfigured = auth !== null;

export async function signUp(email: string, password: string) {
  if (!isFirebaseConfigured) {
    throw new Error('Firebase is not configured. Please set the required environment variables.');
  }
  const { user } = await createUserWithEmailAndPassword(auth!, email, password);
  return { user: transformUser(user) };
}

export async function signIn(email: string, password: string) {
  if (!isFirebaseConfigured) {
    throw new Error('Firebase is not configured. Please set the required environment variables.');
  }
  const { user } = await signInWithEmailAndPassword(auth!, email, password);
  return { user: transformUser(user) };
}

export async function signOut() {
  if (!isFirebaseConfigured) {
    throw new Error('Firebase is not configured. Please set the required environment variables.');
  }
  await firebaseSignOut(auth!);
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  if (!isFirebaseConfigured) {
    console.warn('Firebase is not configured. Returning null user.');
    return null;
  }
  const user = auth!.currentUser;
  return user ? transformUser(user) : null;
}

export async function resetPassword(email: string) {
  if (!isFirebaseConfigured) {
    throw new Error('Firebase is not configured. Please set the required environment variables.');
  }
  await sendPasswordResetEmail(auth!, email);
}

export async function updatePassword(newPassword: string) {
  if (!isFirebaseConfigured) {
    throw new Error('Firebase is not configured. Please set the required environment variables.');
  }
  if (!auth!.currentUser) throw new Error('No user logged in');
  await firebaseUpdatePassword(auth!.currentUser, newPassword);
}
