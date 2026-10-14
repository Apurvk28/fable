import React from 'react';

export const Badge = ({
  children,
  variant = 'default',
  size = 'md',
  className = '',
  dot = false,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center font-mono font-medium uppercase tracking-wider rounded-sm select-none';

  const variants = {
    default: 'bg-paper-muted text-ink border border-hairline',
    success: 'bg-emerald-50 text-status-success border border-emerald-200',
    warning: 'bg-amber-50 text-amber-700 border border-amber-200',
    error: 'bg-rose-50 text-status-error border border-rose-200',
    accent: 'bg-fable-chartreuse/30 text-ink border border-fable-chartreuse/80 font-semibold',
    outline: 'bg-transparent text-ink-secondary border border-hairline',
  };

  const sizes = {
    sm: 'text-[10px] px-1.5 py-0.5 gap-1',
    md: 'text-xs px-2 py-0.5 gap-1.5',
    lg: 'text-sm px-2.5 py-1 gap-2',
  };

  const dotColors = {
    default: 'bg-ink-muted',
    success: 'bg-status-success',
    warning: 'bg-status-warning',
    error: 'bg-status-error',
    accent: 'bg-ink',
    outline: 'bg-ink-secondary',
  };

  return (
    <span
      className={`${baseStyles} ${variants[variant] || variants.default} ${sizes[size] || sizes.md} ${className}`}
      {...props}
    >
      {dot && (
        <span
          className={`w-1.5 h-1.5 rounded-full ${dotColors[variant] || dotColors.default}`}
          aria-hidden="true"
        />
      )}
      <span>{children}</span>
    </span>
  );
};
