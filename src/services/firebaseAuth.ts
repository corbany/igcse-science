import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, User, signOut } from 'firebase/auth';
import { getFirestore, initializeFirestore } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);

const databaseId = (firebaseConfig as any).firestoreDatabaseId || 'ai-studio-igcsecombinedsci-22a2cdf5-7220-4d08-bc81-da5c0b77a814';

export const db = (() => {
  try {
    if (databaseId) {
      return initializeFirestore(app, {
        experimentalAutoDetectLongPolling: true
      }, databaseId);
    }
    return initializeFirestore(app, {
      experimentalAutoDetectLongPolling: true
    });
  } catch {
    return databaseId ? getFirestore(app, databaseId) : getFirestore(app);
  }
})();

export const WORKSPACE_DRIVE_SCOPES = [
  'https://www.googleapis.com/auth/drive',
  'https://www.googleapis.com/auth/drive.file',
  'https://www.googleapis.com/auth/drive.readonly'
];

// Standard provider for general student and instructor sign-in: ONLY requests basic profile and email.
// This prevents Google's "Google hasn't verified this app" blocking screen on personal Gmail accounts!
const provider = new GoogleAuthProvider();
provider.addScope('email');
provider.addScope('profile');
provider.setCustomParameters({
  prompt: 'select_account'
});

// Dedicated provider with Drive scopes for optional Google Drive sync (instructors only)
const driveProvider = new GoogleAuthProvider();
driveProvider.addScope('email');
driveProvider.addScope('profile');
WORKSPACE_DRIVE_SCOPES.forEach(scope => driveProvider.addScope(scope));
driveProvider.setCustomParameters({
  prompt: 'consent select_account',
  access_type: 'offline'
});

// Flag to indicate if we are in the middle of a sign-in flow
let isSigningIn = false;
// Cache the access token in memory (never localStorage per workspace guidelines)
let cachedAccessToken: string | null = null;
let cachedDriveToken: string | null = null;
const DRIVE_TOKEN_SESSION_KEY = 'igcse_drive_scoped_token';

export const initAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      if (cachedAccessToken) {
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
      } else if (!isSigningIn) {
        // User is signed in to Firebase, but access token needs refresh or prompt
        if (onAuthFailure) onAuthFailure();
      }
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

export const googleSignIn = async (): Promise<{ user: User; accessToken: string } | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    cachedAccessToken = credential?.accessToken || '';
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    if (error?.code === 'auth/unauthorized-domain') {
      const currentHost = typeof window !== 'undefined' ? window.location.hostname : 'current domain';
      console.warn(
        `[Firebase Auth] Domain "${currentHost}" is not authorized for Google Sign-In in Firebase project "${(firebaseConfig as any)?.projectId}". To enable Google OAuth, add "${currentHost}" in Firebase Console -> Authentication -> Settings -> Authorized domains.`
      );
    } else {
      console.error('Sign in error:', error);
    }
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const getAccessToken = async (): Promise<string | null> => {
  return cachedAccessToken;
};

export const getCachedDriveToken = async (): Promise<string | null> => {
  if (cachedDriveToken) return cachedDriveToken;
  try {
    const sessionToken = sessionStorage.getItem(DRIVE_TOKEN_SESSION_KEY);
    if (sessionToken) {
      cachedDriveToken = sessionToken;
      return sessionToken;
    }
  } catch {
    // sessionStorage not available
  }
  return null;
};

export const clearCachedDriveToken = () => {
  cachedDriveToken = null;
  try {
    sessionStorage.removeItem(DRIVE_TOKEN_SESSION_KEY);
  } catch {}
};

export const hasDrivePermission = (): boolean => {
  if (cachedDriveToken) return true;
  try {
    return !!sessionStorage.getItem(DRIVE_TOKEN_SESSION_KEY);
  } catch {
    return false;
  }
};

export const signInWithGoogle = async (): Promise<string | null> => {
  try {
    const res = await googleSignIn();
    return res?.accessToken || null;
  } catch (error: any) {
    if (error?.code === 'auth/popup-closed-by-user' || error?.code === 'auth/cancelled-popup-request') {
      console.warn('Google sign-in popup was closed by user');
      return null;
    }
    throw error;
  }
};

/**
 * Incremental sign-in requesting Google Drive scopes when an instructor explicitly syncs Drive folders.
 */
export const signInWithDriveScope = async (): Promise<string | null> => {
  try {
    const result = await signInWithPopup(auth, driveProvider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    cachedDriveToken = credential?.accessToken || null;
    if (cachedDriveToken) {
      try {
        sessionStorage.setItem(DRIVE_TOKEN_SESSION_KEY, cachedDriveToken);
      } catch {}
    }
    return cachedDriveToken;
  } catch (error: any) {
    if (error?.code === 'auth/popup-closed-by-user' || error?.code === 'auth/cancelled-popup-request') {
      return null;
    }
    throw error;
  }
};

export const logout = async () => {
  await signOut(auth);
  cachedAccessToken = null;
  cachedDriveToken = null;
  try {
    sessionStorage.removeItem(DRIVE_TOKEN_SESSION_KEY);
  } catch {}
};
