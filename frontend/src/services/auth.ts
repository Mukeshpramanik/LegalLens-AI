import {
  initializeApp,
  getApps,
  getApp,
  FirebaseApp,
} from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signOut as firebaseSignOut,
  User,
  Auth,
  AuthError,
} from 'firebase/auth';

// ---------------------------------------------------------------------------
// Firebase configuration – values are injected at build-time by Next.js
// from environment variables (root .env → next.config.js env passthrough).
// NEVER add secret backend credentials here.
// ---------------------------------------------------------------------------
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
};

// Guard against missing config at module load time (surfaced in the UI, not
// silently swallowed so developers can diagnose the problem immediately).
if (typeof window !== 'undefined') {
  const missing: string[] = [];
  if (!firebaseConfig.apiKey) missing.push('NEXT_PUBLIC_FIREBASE_API_KEY');
  if (!firebaseConfig.authDomain) missing.push('NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN');
  if (!firebaseConfig.projectId) missing.push('NEXT_PUBLIC_FIREBASE_PROJECT_ID');
  if (missing.length > 0) {
    console.error(
      `[Firebase] Missing required environment variables: ${missing.join(', ')}. ` +
        'Ensure these are set in your root .env file and injected by next.config.js.'
    );
  } else {
    // Diagnostic: log the current hostname so the developer can verify it is authorized.
    const currentHostname = window.location.hostname;
    console.info(
      `[Firebase Auth] App is running on: ${currentHostname}\n` +
      `[Firebase Auth] authDomain is: ${firebaseConfig.authDomain}\n` +
      `[Firebase Auth] If you see auth/unauthorized-domain, go to:\n` +
      `  Firebase Console → legallens-ai-6ac50 → Authentication → Settings → Authorized Domains\n` +
      `  and add: ${currentHostname}`
    );
  }
}

// Singleton – prevents "Firebase: Firebase App named '[DEFAULT]' already exists" error
// during Next.js hot-reloads and SSR render passes.
let app: FirebaseApp;
try {
  app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
} catch (err: any) {
  console.error('[Firebase] Initialization error:', err.message);
  // Re-throw so the app fails fast rather than running with a broken SDK.
  throw err;
}

export const auth: Auth = getAuth(app);

// ---------------------------------------------------------------------------
// Google OAuth provider
// ---------------------------------------------------------------------------
export const googleProvider = new GoogleAuthProvider();

// Always show the account picker so users can switch accounts.
googleProvider.setCustomParameters({ prompt: 'select_account' });

// Request the minimal scopes needed – profile + email are included by default.
// Add extra scopes here if needed in the future:
// googleProvider.addScope('https://www.googleapis.com/auth/calendar.readonly');

// ---------------------------------------------------------------------------
// Sign-in strategy selection
// Cloudflare Workers / edge deployments restrict browser popup windows in some
// environments (service-worker proxy, cross-origin cookie restrictions, etc.).
// We prefer signInWithPopup (fastest UX), and fall back to signInWithRedirect
// when the environment signals it may not work.
//
// The heuristic: if we're running on a Cloudflare Workers (.workers.dev) domain
// or if the page is served over a non-localhost HTTPS origin that doesn't match
// the Firebase authDomain, prefer redirect to avoid the popup-blocked / COOP
// header issue that Cloudflare sets.
// ---------------------------------------------------------------------------
function shouldUseRedirect(): boolean {
  if (typeof window === 'undefined') return false; // SSR

  const hostname = window.location.hostname;
  const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1';

  // On localhost: always use popup (fastest DX, no redirect round-trip needed).
  // NOTE: localhost must be in Firebase Authorized Domains for this to work.
  if (isLocalhost) return false;

  // On Cloudflare Workers / Pages: use redirect to avoid popup restrictions.
  const isCloudflare = hostname.endsWith('.workers.dev') || hostname.endsWith('.pages.dev');
  if (isCloudflare) return true;

  // On Vercel or any other deployment: use redirect as the safe default.
  return true;
}

/**
 * Signs the user in with Google.
 *
 * - On localhost: uses signInWithPopup (best DX).
 * - On Cloudflare Workers domains: uses signInWithRedirect + getRedirectResult
 *   to avoid COOP/COEP restrictions that block popup windows.
 *
 * @throws {AuthError} with `error.code` set to the Firebase error code.
 */
export async function signInWithGoogle(): Promise<User | null> {
  if (shouldUseRedirect()) {
    // Redirect flow: this call navigates away. The caller must handle the
    // result on the next page load via `getGoogleRedirectResult()`.
    await signInWithRedirect(auth, googleProvider);
    return null; // Never reached – browser navigates away.
  }

  // Popup flow (localhost and non-Cloudflare deployments)
  const result = await signInWithPopup(auth, googleProvider);
  return result.user;
}

/**
 * Resolves a pending Google redirect sign-in result.
 * Call this once on app mount (e.g. in the root layout or login page useEffect).
 *
 * Returns the signed-in User if a redirect just completed, or null otherwise.
 */
export async function getGoogleRedirectResult(): Promise<User | null> {
  try {
    const result = await getRedirectResult(auth);
    return result?.user ?? null;
  } catch (err: any) {
    // Re-throw so the caller can display a proper error. Don't swallow silently.
    throw err;
  }
}

/**
 * Signs the current user out.
 */
export async function signOut(): Promise<void> {
  await firebaseSignOut(auth);
}

// ---------------------------------------------------------------------------
// ID token helper – used by the apiClient to attach Bearer tokens.
// Waits for the auth state to be known before attempting to read currentUser,
// preventing a race where getIdToken is called before Firebase has restored
// the session from IndexedDB/localStorage.
// ---------------------------------------------------------------------------
let _authStateResolved = false;
let _authStatePromise: Promise<void> | null = null;

function waitForAuthState(): Promise<void> {
  if (_authStateResolved) return Promise.resolve();
  if (!_authStatePromise) {
    _authStatePromise = new Promise<void>((resolve) => {
      const unsubscribe = auth.onAuthStateChanged(() => {
        _authStateResolved = true;
        unsubscribe();
        resolve();
      });
    });
  }
  return _authStatePromise;
}

export async function getIdToken(forceRefresh = false): Promise<string | null> {
  await waitForAuthState();
  const currentUser = auth.currentUser;
  if (!currentUser) return null;
  return currentUser.getIdToken(forceRefresh);
}

// ---------------------------------------------------------------------------
// Human-readable Firebase auth error messages
// ---------------------------------------------------------------------------
const AUTH_ERROR_MESSAGES: Record<string, string> = {
  'auth/unauthorized-domain': (() => {
    // Generate a domain-specific error message at runtime
    const hostname = typeof window !== 'undefined' ? window.location.hostname : 'this domain';
    return (
      `"${hostname}" is not authorized for Google Sign-In. ` +
      `Go to Firebase Console → legallens-ai-6ac50 → Authentication → Settings → Authorized Domains ` +
      `and add "${hostname}" to the list.`
    );
  })(),
  'auth/popup-closed-by-user':
    'The sign-in window was closed. Please try again.',
  'auth/popup-blocked':
    'Your browser blocked the sign-in popup. Allow popups for this site and try again.',
  'auth/cancelled-popup-request':
    'A sign-in is already in progress. Please wait.',
  'auth/network-request-failed':
    'A network error occurred. Please check your internet connection.',
  'auth/too-many-requests':
    'Too many failed sign-in attempts. Please wait a moment and try again.',
  'auth/user-disabled':
    'Your account has been disabled. Please contact support.',
  'auth/operation-not-allowed':
    'Google Sign-In is not enabled. Enable it in Firebase Console → Authentication → Sign-in methods.',
  'auth/internal-error':
    'An internal authentication error occurred. Please try again.',
};

/**
 * Returns a user-friendly error message for a given Firebase AuthError code.
 * Falls back to the raw Firebase message if the code is not mapped.
 */
export function getAuthErrorMessage(error: AuthError | Error | unknown): string {
  const code = (error as AuthError)?.code;
  if (code && AUTH_ERROR_MESSAGES[code]) {
    return AUTH_ERROR_MESSAGES[code];
  }
  return (error as Error)?.message || 'An unexpected error occurred during sign-in.';
}
