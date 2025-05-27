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

export async function signUp(email: string, password: string) {
  const { user } = await createUserWithEmailAndPassword(auth, email, password);
  return { user: transformUser(user) };
}

export async function signIn(email: string, password: string) {
  const { user } = await signInWithEmailAndPassword(auth, email, password);
  return { user: transformUser(user) };
}

export async function signOut() {
  await firebaseSignOut(auth);
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  const user = auth.currentUser;
  return user ? transformUser(user) : null;
}

export async function resetPassword(email: string) {
  await sendPasswordResetEmail(auth, email);
}

export async function updatePassword(newPassword: string) {
  if (!auth.currentUser) throw new Error('No user logged in');
  await firebaseUpdatePassword(auth.currentUser, newPassword);
}