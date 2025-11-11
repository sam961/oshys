import React from 'react';
import { motion } from 'framer-motion';
import clsx from 'clsx';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

export const Card: React.FC<CardProps> = ({ children, className, hover = true }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{
        duration: 0.5,
        ease: [0.6, -0.05, 0.01, 0.99]
      }}
      whileHover={hover ? {
        y: -8,
        scale: 1.02,
        transition: { duration: 0.3, ease: 'easeOut' }
      } : undefined}
      className={clsx(
        'bg-white rounded-2xl shadow-xl p-6 border border-gray-100 overflow-hidden relative',
        hover && 'hover:shadow-2xl transition-shadow duration-300',
        className
      )}
    >
      {hover && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-primary-500/5 to-accent-500/5 opacity-0"
          whileHover={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        />
      )}
      <div className="relative z-10">
        {children}
      </div>
    </motion.div>
  );
};
