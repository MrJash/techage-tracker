import { useState, useEffect } from 'react';
import { User, GoogleAuthProvider, signInWithPopup, signInWithRedirect, getRedirectResult, signOut as firebaseSignOut, onAuthStateChanged } from 'firebase/auth';
import { auth } from '../lib/firebase';

function isMobileDevice(): boolean {
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    // Handle redirect result when returning from mobile sign-in
    getRedirectResult(auth).catch((err) => {
      console.error(err);
      setAuthError('Sign-in failed. Please try again.');
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
      if (isMobileDevice()) {
        await signInWithRedirect(auth, provider);
      } else {
        await signInWithPopup(auth, provider);
      }
    } catch (err) {
      console.error(err);
      setAuthError('Sign-in failed. Please try again.');
    }
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
  };

  return { user, loading, authError, signIn, signOut };
}
