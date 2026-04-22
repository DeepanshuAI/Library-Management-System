import React from 'react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export const cn = (...inputs) => twMerge(clsx(inputs));

export const Button = React.forwardRef(({ 
  className, 
  variant = 'primary', 
  size = 'md', 
  isLoading, 
  children, 
  ...props 
}, ref) => {
  const variants = {
    primary: 'bg-primary/80 hover:bg-primary text-white shadow-[0_0_15px_rgba(52,211,153,0.3)]',
    sky: 'bg-sky/80 hover:bg-sky text-white shadow-[0_0_15px_rgba(53,167,255,0.3)]',
    ghost: 'bg-transparent hover:bg-white/10 text-gray-300 hover:text-white',
    danger: 'bg-red-500/80 hover:bg-red-500 text-white shadow-[0_0_15px_rgba(239,68,68,0.3)]'
  };

  const sizes = {
    sm: 'py-1.5 px-3 text-sm',
    md: 'py-2 px-4',
    lg: 'py-3 px-6 text-lg'
  };

  return (
    <motion.button
      ref={ref}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        'relative overflow-hidden font-medium rounded-xl transition-colors duration-300 flex items-center justify-center gap-2',
        variants[variant],
        sizes[size],
        isLoading && 'opacity-70 pointer-events-none cursor-not-allowed',
        className
      )}
      disabled={isLoading}
      {...props}
    >
      {isLoading && (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      {children}
    </motion.button>
  );
});

Button.displayName = 'Button';
