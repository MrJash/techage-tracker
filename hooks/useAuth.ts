import { useState, useEffect } from 'react';
import { User, GoogleAuthProvider, signInWithPopup, signOut as firebaseSignOut, onAuthStateChanged } from 'firebase/auth';
import { auth } from '../lib/firebase';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
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
      // signInWithPopup works on both desktop and mobile (opens a new tab on mobile).
      // signInWithRedirect is avoided because mobile Safari's ITP blocks the
      // cross-origin cookies Firebase needs, causing the redirect flow to silently fail.
      await signInWithPopup(auth, provider);
    } catch (err: any) {
      console.error(err);
      setAuthError('Sign-in failed. Please try again.');
    }
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
  };

  return { user, loading, authError, signIn, signOut };
}
