import React from 'react';
import { Cpu } from 'lucide-react';

interface AuthScreenProps {
  onSignIn: () => void;
}

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
    <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4"/>
    <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
    <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
    <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
  </svg>
);

export function AuthScreen({ onSignIn }: AuthScreenProps) {
  return (
    <div className="flex h-screen items-center justify-center bg-slate-50 dark:bg-black transition-colors duration-200">
      <div className="flex flex-col items-center gap-7 p-8 max-w-sm w-full text-center">

        {/* App Icon */}
        <div className="w-16 h-16 rounded-2xl bg-slate-900 dark:bg-white flex items-center justify-center shadow-lg">
          <Cpu size={32} className="text-white dark:text-black" />
        </div>

        {/* Title & Description */}
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            TechAge Tracker
          </h1>
          <p className="text-sm text-slate-500 dark:text-zinc-400 leading-relaxed">
            Sign in to sync your tech collection across all your devices.
          </p>
        </div>

        {/* Sign In Button */}
        <button
          onClick={onSignIn}
          className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl text-slate-800 dark:text-zinc-100 font-medium text-sm hover:bg-slate-50 dark:hover:bg-zinc-800 active:scale-[0.98] transition-all duration-150 shadow-sm"
        >
          <GoogleIcon />
          Sign in with Google
        </button>

        <p className="text-xs text-slate-400 dark:text-zinc-600">
          Your data is private and only accessible by you.
        </p>
      </div>
    </div>
  );
}
