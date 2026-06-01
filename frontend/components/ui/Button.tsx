import React from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  className,
  type = 'button',
  ...props
}) => (
  <button
    type={type}
    className={cn(
      'inline-flex min-h-11 items-center justify-center gap-2 rounded px-5 py-3 font-nav text-xs uppercase tracking-[0.15em] transition-all duration-300 ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-parfang-accent focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
      variant === 'primary' && 'bg-parfang-accent text-white hover:bg-parfang-accent-dark',
      variant === 'secondary' && 'border border-parfang-accent text-parfang-accent hover:bg-parfang-accent hover:text-white',
      variant === 'ghost' && 'text-parfang-muted hover:text-parfang-text hover:underline',
      className
    )}
    {...props}
  />
);
