import { useState, useEffect } from 'react';
import { User, GoogleAuthProvider, signInWithPopup, signInWithRedirect, getRedirectResult, signOut as firebaseSignOut, onAuthStateChanged } from 'firebase/auth';
import { auth } from '../lib/firebase';

function getFriendlyAuthErrorMessage(err: any): string {
  const code: string = err?.code ?? '';
  if (code === 'auth/unauthorized-domain') {
    return 'Domain unauthorized: Ensure you access http://localhost:3000 (not 127.0.0.1) or add your domain to Firebase Console → Authentication → Settings → Authorized domains.';
  }
  if (code === 'auth/popup-blocked') {
    return 'Popup blocked by browser. Please allow popups for localhost and try again.';
  }
  if (code === 'auth/network-request-failed') {
    return 'Network request failed. Please check your internet connection.';
  }
  if (code === 'auth/operation-not-allowed') {
    return 'Google Sign-in is not enabled in Firebase Console → Authentication → Sign-in method.';
  }
  return err?.message || 'Sign-in failed. Please try again.';
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    // Handle the result after a redirect-based sign-in (fallback for popup-blocked).
    getRedirectResult(auth).catch((err) => {
      if (err?.code !== 'auth/null-user') {
        console.error('Redirect sign-in error:', err);
        setAuthError(getFriendlyAuthErrorMessage(err));
      }
    });

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const signIn = async () => {
    setAuthError(null);
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });

    try {
      await signInWithPopup(auth, provider);
    } catch (err: any) {
      const code: string = err?.code ?? '';
      // User intentionally closed the popup — not an error.
      if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') {
        return;
      }
      // Popup was blocked by the browser — fall back to redirect flow.
      if (code === 'auth/popup-blocked') {
        try {
          await signInWithRedirect(auth, provider);
        } catch (redirectErr) {
          console.error('Redirect fallback error:', redirectErr);
          setAuthError(getFriendlyAuthErrorMessage(redirectErr));
        }
        return;
      }
      console.error('Sign-in error:', err);
      setAuthError(getFriendlyAuthErrorMessage(err));
    }
  };

  const signOut = async () => {
    setAuthError(null);
    await firebaseSignOut(auth);
  };

  return { user, loading, authError, signIn, signOut };
}
