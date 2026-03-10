import { useState, useEffect } from 'react';
import { User, GoogleAuthProvider, signInWithPopup, signInWithRedirect, getRedirectResult, signOut as firebaseSignOut, onAuthStateChanged } from 'firebase/auth';
import { auth } from '../lib/firebase';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    // Handle the result after a redirect-based sign-in (fallback for popup-blocked).
    getRedirectResult(auth).catch((err) => {
      if (err?.code !== 'auth/null-user') {
        console.error('Redirect sign-in error:', err);
        setAuthError('Sign-in failed. Please try again.');
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
          setAuthError('Sign-in failed. Please try again.');
        }
        return;
      }
      console.error('Sign-in error:', err);
      setAuthError('Sign-in failed. Please try again.');
    }
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
  };

  return { user, loading, authError, signIn, signOut };
}
