import React from 'react';
import { motion } from 'framer-motion';

interface LiquidBlobProps {
  color?: string;
  size?: number;
  blur?: number;
  position?: { x: string; y: string };
  animate?: boolean;
}

export const LiquidBlob: React.FC<LiquidBlobProps> = ({
  color = 'from-primary-400 to-accent-400',
  size = 400,
  blur = 60,
  position = { x: '50%', y: '50%' },
  animate = true
}) => {
  const variants = {
    animate: {
      scale: [1, 1.2, 1.1, 1],
      rotate: [0, 90, 180, 270, 360],
      borderRadius: ['60% 40% 30% 70%', '30% 60% 70% 40%', '50% 50% 50% 50%', '60% 40% 30% 70%']
    }
  };

  return (
    <motion.div
      className={`absolute bg-gradient-to-br ${color}`}
      style={{
        width: size,
        height: size,
        left: position.x,
        top: position.y,
        filter: `blur(${blur}px)`,
        transform: 'translate(-50%, -50%)',
        borderRadius: '60% 40% 30% 70%',
      }}
      variants={variants}
      animate={animate ? 'animate' : undefined}
      transition={{
        duration: 20,
        repeat: Infinity,
        ease: 'easeInOut'
      }}
    />
  );
};

export const LiquidBackground: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      <LiquidBlob
        color="from-primary-400/20 to-accent-400/20"
        size={600}
        blur={80}
        position={{ x: '20%', y: '30%' }}
      />
      <LiquidBlob
        color="from-secondary-400/15 to-primary-400/15"
        size={500}
        blur={70}
        position={{ x: '80%', y: '60%' }}
      />
      <LiquidBlob
        color="from-accent-400/10 to-secondary-400/10"
        size={400}
        blur={60}
        position={{ x: '60%', y: '80%' }}
      />
    </div>
  );
};
