import React from 'react';

export const Input = React.forwardRef(({
  label,
  helperText,
  error,
  id,
  className = '',
  icon: Icon,
  disabled = false,
  required = false,
  ...props
}, ref) => {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full space-y-1.5 text-left">
      {label && (
        <label htmlFor={inputId} className="block text-xs font-semibold uppercase tracking-wider text-ink/80">
          {label} {required && <span className="text-status-error">*</span>}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-ink-muted">
            <Icon className="w-4 h-4" aria-hidden="true" />
          </div>
        )}
        <input
          ref={ref}
          id={inputId}
          disabled={disabled}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined}
          className={`w-full bg-white text-ink text-sm border rounded-sm transition-colors duration-150 placeholder:text-ink-muted/60 focus:outline-none focus:ring-1 ${
            Icon ? 'pl-9 pr-3 py-2' : 'px-3 py-2'
          } ${
            error
              ? 'border-status-error focus:border-status-error focus:ring-status-error'
              : 'border-hairline hover:border-hairline-strong focus:border-ink focus:ring-ink'
          } ${disabled ? 'bg-paper-muted opacity-60 cursor-not-allowed' : ''} ${className}`}
          {...props}
        />
      </div>
      {error ? (
        <p id={`${inputId}-error`} className="text-xs text-status-error font-medium">
          {error}
        </p>
      ) : helperText ? (
        <p id={`${inputId}-helper`} className="text-xs text-ink-secondary">
          {helperText}
        </p>
      ) : null}
    </div>
  );
});

Input.displayName = 'Input';

export const Textarea = React.forwardRef(({
  label,
  helperText,
  error,
  id,
  className = '',
  disabled = false,
  required = false,
  rows = 3,
  ...props
}, ref) => {
  const textareaId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full space-y-1.5 text-left">
      {label && (
        <label htmlFor={textareaId} className="block text-xs font-semibold uppercase tracking-wider text-ink/80">
          {label} {required && <span className="text-status-error">*</span>}
        </label>
      )}
      <textarea
        ref={ref}
        id={textareaId}
        rows={rows}
        disabled={disabled}
        aria-invalid={!!error}
        aria-describedby={error ? `${textareaId}-error` : helperText ? `${textareaId}-helper` : undefined}
        className={`w-full bg-white text-ink text-sm border rounded-sm transition-colors duration-150 placeholder:text-ink-muted/60 focus:outline-none focus:ring-1 px-3 py-2 ${
          error
            ? 'border-status-error focus:border-status-error focus:ring-status-error'
            : 'border-hairline hover:border-hairline-strong focus:border-ink focus:ring-ink'
        } ${disabled ? 'bg-paper-muted opacity-60 cursor-not-allowed' : ''} ${className}`}
        {...props}
      />
      {error ? (
        <p id={`${textareaId}-error`} className="text-xs text-status-error font-medium">
          {error}
        </p>
      ) : helperText ? (
        <p id={`${textareaId}-helper`} className="text-xs text-ink-secondary">
          {helperText}
        </p>
      ) : null}
    </div>
  );
});

Textarea.displayName = 'Textarea';
