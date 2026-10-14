import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

export const Modal = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  className = '',
  maxWidth = 'max-w-lg',
}) => {
  const modalRef = useRef(null);

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/60 backdrop-blur-sm transition-opacity"
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
      aria-describedby={description ? 'modal-description' : undefined}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={modalRef}
        className={`w-full ${maxWidth} bg-white border border-hairline rounded-sm shadow-editorial-lg overflow-hidden transition-all duration-200 transform scale-100 ${className}`}
      >
        <div className="px-6 py-4 border-b border-hairline flex items-center justify-between gap-4 bg-paper-muted/30">
          <div>
            {title && (
              <h3 id="modal-title" className="font-serif text-lg font-medium text-ink">
                {title}
              </h3>
            )}
            {description && (
              <p id="modal-description" className="text-xs text-ink-secondary mt-0.5">
                {description}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-ink-secondary hover:text-ink hover:bg-paper-muted rounded-sm transition-colors focus:outline-none focus:ring-1 focus:ring-ink"
            aria-label="Close dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
};
