import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut as firebaseSignOut, User } from 'firebase/auth';

if (!process.env.NEXT_PUBLIC_FIREBASE_API_KEY) {
  console.error("Missing NEXT_PUBLIC_FIREBASE_API_KEY. Check your .env configuration.");
}

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
};

// Only initialize if we have the minimum required config
let app;
if (typeof window !== "undefined" && !firebaseConfig.apiKey) {
  throw new Error("Firebase configuration is missing. Please configure NEXT_PUBLIC_FIREBASE_API_KEY in your environment.");
} else {
  app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
}

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Force the account selection prompt every time
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

export async function signInWithGoogle(): Promise<User> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error: any) {
    console.error('[Firebase Auth Error] Code:', error.code, 'Message:', error.message);
    throw error;
  }
}

export async function signOut(): Promise<void> {
  try {
    await firebaseSignOut(auth);
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
}

let authStateInitialized = false;

export async function getIdToken(forceRefresh = false): Promise<string | null> {
  if (!authStateInitialized) {
    await new Promise<void>((resolve) => {
      const unsubscribe = auth.onAuthStateChanged(() => {
        authStateInitialized = true;
        unsubscribe();
        resolve();
      });
    });
  }

  const currentUser = auth.currentUser;
  if (!currentUser) return null;
  return await currentUser.getIdToken(forceRefresh);
}
