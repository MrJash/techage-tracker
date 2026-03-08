import React from 'react';
import { Slot } from '@radix-ui/react-slot';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  asChild?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  fullWidth = false,
  asChild = false,
  className = '',
  ...props 
}) => {
  const Component = asChild ? Slot : "button";
  const baseStyles = "inline-flex items-center justify-center rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:pointer-events-none";
  
  const variants = {
    primary: "bg-slate-900 text-white hover:bg-slate-800 focus:ring-slate-900 dark:bg-white dark:text-black dark:hover:bg-slate-200 dark:focus:ring-white",
    secondary: "bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100 focus:ring-slate-200 shadow-sm dark:bg-zinc-800/50 dark:text-zinc-300 dark:border-zinc-700 dark:hover:bg-zinc-800 dark:focus:ring-zinc-700",
    danger: "bg-red-50 text-red-600 hover:bg-red-100 focus:ring-red-500 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30",
    ghost: "bg-transparent text-slate-500 hover:bg-slate-50 hover:text-slate-700 focus:ring-slate-200 dark:text-zinc-500 dark:hover:bg-zinc-900 dark:hover:text-zinc-300"

  };

  const sizes = {
    sm: "h-8 px-3 text-xs",
    md: "h-10 px-4 text-sm",
    lg: "h-12 px-6 text-base"
  };

  return (
    <Component 
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...props}
    >
      {children}
    </Component>
  );
};