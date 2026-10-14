import React from 'react';
import { Loader2 } from 'lucide-react';

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  className = '',
  type = 'button',
  icon: Icon,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none';

  const variants = {
    primary: 'bg-ink text-paper hover:bg-ink/90 active:translate-y-[1px] shadow-editorial hover:shadow-editorial-lift focus-visible:ring-ink border border-ink',
    secondary: 'bg-paper-muted text-ink hover:bg-hairline active:translate-y-[1px] border border-hairline focus-visible:ring-ink',
    outline: 'bg-transparent text-ink border border-hairline hover:bg-paper-muted active:translate-y-[1px] focus-visible:ring-ink',
    danger: 'bg-status-error text-white hover:bg-status-error/90 border border-status-error focus-visible:ring-status-error active:translate-y-[1px]',
    ghost: 'bg-transparent text-ink hover:bg-paper-muted focus-visible:ring-ink border border-transparent',
    accent: 'bg-fable-chartreuse text-ink font-semibold border border-ink hover:brightness-105 active:translate-y-[1px] shadow-editorial focus-visible:ring-ink',
  };

  const sizes = {
    sm: 'text-xs px-2.5 py-1.5 gap-1.5 rounded-sm',
    md: 'text-sm px-4 py-2 gap-2 rounded-sm',
    lg: 'text-base px-5 py-2.5 gap-2.5 rounded-sm',
  };

  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      className={`${baseStyles} ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${className}`}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin shrink-0" aria-hidden="true" />
      ) : Icon ? (
        <Icon className="w-4 h-4 shrink-0" aria-hidden="true" />
      ) : null}
      <span>{children}</span>
    </button>
  );
};
