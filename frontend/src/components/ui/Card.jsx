import React from 'react';
import { motion } from 'framer-motion';
import { cn } from './Button';

export const Card = React.forwardRef(({ className, children, hoverEffect = false, ...props }, ref) => {
  return (
    <motion.div
      ref={ref}
      whileHover={hoverEffect ? { y: -5, transition: { duration: 0.2 } } : {}}
      className={cn(
        'bg-white/5 backdrop-blur-xl border-t border-l border border-white/20 bg-[#1e293b]/60 shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] rounded-2xl p-6 relative overflow-hidden',
        hoverEffect && 'hover:shadow-[0_8px_32px_0_rgba(53,167,255,0.15)] hover:border-sky/30 transition-all duration-300',
        className
      )}
      {...props}
    >
      {/* Glossy top highlight */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      {children}
    </motion.div>
  );
});

Card.displayName = 'Card';
