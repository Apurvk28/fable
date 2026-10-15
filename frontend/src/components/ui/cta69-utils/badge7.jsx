import React from 'react';
import { cn } from '@/lib/utils';

export function Badge7({ label, className }) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 rounded-full border border-hairline bg-white/80 px-4 py-1.5 text-xs font-mono font-medium tracking-wide text-ink shadow-editorial backdrop-blur-sm",
        className
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-fable-chartreuse" aria-hidden="true" />
      <span>{label}</span>
    </div>
  );
}

export default Badge7;
