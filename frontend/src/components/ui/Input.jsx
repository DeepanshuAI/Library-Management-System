import React from 'react';
import { cn } from './Button'; // reuse cn utility

export const Input = React.forwardRef(({ className, label, error, ...props }, ref) => {
  return (
    <div className="w-full flex flex-col gap-1">
      {label && <label className="text-sm font-medium text-gray-300 ml-1">{label}</label>}
      <input
        ref={ref}
        className={cn(
          'w-full px-4 py-3 bg-[#0f172a]/40 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#35A7FF]/50 focus:border-transparent transition-all duration-300 hover:border-white/20',
          error && 'border-red-500/50 focus:ring-red-500/50',
          className
        )}
        {...props}
      />
      {error && <span className="text-xs text-red-400 ml-1 mt-1">{error}</span>}
    </div>
  );
});

Input.displayName = 'Input';
