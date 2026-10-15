import React from 'react';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Button12({ asChild, label, children, className, ...props }) {
  const baseClasses = cn(
    "group relative inline-flex items-center justify-center gap-2.5 rounded-full bg-ink px-7 py-3.5 text-sm font-sans font-medium text-paper transition-all duration-200 hover:bg-ink/90 hover:shadow-editorial-lift active:scale-[0.98]",
    className
  );

  const content = (
    <>
      <span>{label}</span>
      <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
    </>
  );

  if (asChild && React.isValidElement(children)) {
    const href = children.props.href || children.props.to;
    const isExternal = typeof href === 'string' && (href.startsWith('http://') || href.startsWith('https://'));

    if (isExternal) {
      return (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className={baseClasses}
          {...props}
        >
          {content}
        </a>
      );
    }

    return React.cloneElement(children, {
      className: cn(baseClasses, children.props.className),
      children: content,
      ...props,
    });
  }

  return (
    <button type="button" className={baseClasses} {...props}>
      {content}
    </button>
  );
}

export default Button12;
