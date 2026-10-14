import React from 'react';
import { AlertCircle, CheckCircle2, Info, AlertTriangle, X } from 'lucide-react';

export const Alert = ({
  children,
  title,
  variant = 'info',
  onClose,
  className = '',
}) => {
  const variants = {
    info: {
      container: 'bg-blue-50/70 border-blue-200 text-blue-900',
      icon: Info,
      iconColor: 'text-blue-600',
    },
    success: {
      container: 'bg-emerald-50/70 border-emerald-200 text-emerald-900',
      icon: CheckCircle2,
      iconColor: 'text-status-success',
    },
    warning: {
      container: 'bg-amber-50/70 border-amber-200 text-amber-900',
      icon: AlertTriangle,
      iconColor: 'text-status-warning',
    },
    error: {
      container: 'bg-rose-50/70 border-rose-200 text-rose-900',
      icon: AlertCircle,
      iconColor: 'text-status-error',
    },
  };

  const currentVariant = variants[variant] || variants.info;
  const IconComponent = currentVariant.icon;

  return (
    <div
      role="alert"
      className={`p-4 border rounded-sm flex items-start gap-3 text-sm ${currentVariant.container} ${className}`}
    >
      <IconComponent className={`w-5 h-5 shrink-0 mt-0.5 ${currentVariant.iconColor}`} aria-hidden="true" />
      <div className="flex-1 text-left">
        {title && <h5 className="font-semibold text-xs uppercase tracking-wider mb-1">{title}</h5>}
        <div className="text-xs leading-relaxed">{children}</div>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="text-ink-secondary hover:text-ink p-1 transition-colors"
          aria-label="Dismiss alert"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};
