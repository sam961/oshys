import React from 'react';
import { motion } from 'framer-motion';

interface SeaLifeDecorationsProps {
  className?: string;
}

// Fish SVG silhouette
const FishSvg: React.FC<{ className?: string; flip?: boolean }> = ({ className = '', flip }) => (
  <svg
    viewBox="0 0 64 32"
    fill="currentColor"
    className={className}
    style={flip ? { transform: 'scaleX(-1)' } : undefined}
  >
    <path d="M48,16c8-6,16-6,16-6s-8,0-16-6c0,4-4,6-8,6H20c-6,0-12-4-16-6v12c4-2,10-6,16-6h20c4,0,8,2,8,6z" />
    <circle cx="44" cy="14" r="2" fill="rgba(255,255,255,0.6)" />
  </svg>
);

// Seaweed SVG
const SeaweedSvg: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg viewBox="0 0 40 120" fill="currentColor" className={className}>
    <path d="M20,120 Q10,100 20,80 Q30,60 20,40 Q10,20 20,0" strokeWidth="6" stroke="currentColor" fill="none" strokeLinecap="round" />
    <path d="M20,120 Q30,95 20,75 Q10,55 20,35 Q30,15 25,0" strokeWidth="4" stroke="currentColor" fill="none" strokeLinecap="round" opacity="0.6" />
  </svg>
);

// Coral SVG
const CoralSvg: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg viewBox="0 0 80 80" fill="currentColor" className={className}>
    <path d="M40,80 L40,50 Q30,45 25,30 Q20,15 30,10 Q35,8 38,15 Q40,20 40,25" />
    <path d="M40,50 Q50,45 55,30 Q60,15 50,10 Q45,8 42,15 Q40,20 40,25" />
    <path d="M40,60 Q32,55 28,45 Q24,35 32,30 Q36,28 38,35" opacity="0.7" />
    <path d="M40,60 Q48,55 52,45 Q56,35 48,30 Q44,28 42,35" opacity="0.7" />
  </svg>
);

// Starfish SVG
const StarfishSvg: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg viewBox="0 0 48 48" fill="currentColor" className={className}>
    <path d="M24,2 L28,18 L46,18 L32,28 L36,46 L24,36 L12,46 L16,28 L2,18 L20,18 Z" />
  </svg>
);

// Shell SVG
const ShellSvg: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg viewBox="0 0 48 48" fill="currentColor" className={className}>
    <path d="M24,4 Q36,4 42,20 Q48,36 24,46 Q0,36 6,20 Q12,4 24,4Z" />
    <path d="M24,8 L24,42" stroke="rgba(255,255,255,0.3)" strokeWidth="1" fill="none" />
    <path d="M12,14 Q24,24 36,14" stroke="rgba(255,255,255,0.3)" strokeWidth="1" fill="none" />
    <path d="M8,24 Q24,32 40,24" stroke="rgba(255,255,255,0.3)" strokeWidth="1" fill="none" />
  </svg>
);

// Turtle SVG
const TurtleSvg: React.FC<{ className?: string; flip?: boolean }> = ({ className = '', flip }) => (
  <svg
    viewBox="0 0 80 48"
    fill="currentColor"
    className={className}
    style={flip ? { transform: 'scaleX(-1)' } : undefined}
  >
    <ellipse cx="40" cy="24" rx="22" ry="16" />
    <ellipse cx="40" cy="24" rx="18" ry="12" opacity="0.5" />
    <path d="M18,24 L6,18 Q2,16 4,20 L14,24" />
    <path d="M18,28 L8,34 Q4,36 6,32 L16,28" />
    <path d="M62,24 L74,18 Q78,16 76,20 L66,24" />
    <path d="M62,28 L72,34 Q76,36 74,32 L64,28" />
    <circle cx="12" cy="20" r="6" />
    <circle cx="13" cy="19" r="2" fill="rgba(255,255,255,0.5)" />
  </svg>
);

export const SeaLifeDecorations: React.FC<SeaLifeDecorationsProps> = ({ className = '' }) => {
  return (
    <div
      className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}
      aria-hidden="true"
    >
      {/* Large fish swimming across top right */}
      <motion.div
        className="absolute top-[10%] left-[5%] text-primary-500/60 w-32 h-16"
        animate={{
          x: [0, 300, 600, 900, 600, 300, 0],
          y: [0, -20, 10, -15, 5, 15, 0],
        }}
        transition={{ duration: 24, repeat: Infinity, ease: 'easeInOut' }}
      >
        <FishSvg />
      </motion.div>

      {/* Medium fish swimming left from right side */}
      <motion.div
        className="absolute top-[35%] right-[3%] text-accent-600/55 w-28 h-14"
        animate={{
          x: [0, -200, -500, -700, -500, -200, 0],
          y: [0, 15, -10, 20, -5, 12, 0],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
      >
        <FishSvg flip />
      </motion.div>

      {/* Fish lower area going right */}
      <motion.div
        className="absolute top-[65%] left-[10%] text-primary-500/50 w-24 h-12"
        animate={{
          x: [0, 180, 350, 180, 0],
          y: [0, -12, 8, -10, 0],
        }}
        transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut', delay: 4 }}
      >
        <FishSvg />
      </motion.div>

      {/* School of 3 small fish - top area */}
      <motion.div
        className="absolute top-[20%] right-[15%] text-primary-400/55 w-20 h-10"
        animate={{
          x: [0, -120, -280, -120, 0],
          y: [0, 10, -8, 14, 0],
        }}
        transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
      >
        <FishSvg flip />
      </motion.div>
      <motion.div
        className="absolute top-[23%] right-[18%] text-primary-400/50 w-14 h-7"
        animate={{
          x: [0, -120, -280, -120, 0],
          y: [0, 8, -10, 12, 0],
        }}
        transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut', delay: 1.4 }}
      >
        <FishSvg flip />
      </motion.div>
      <motion.div
        className="absolute top-[18%] right-[17%] text-primary-400/45 w-12 h-6"
        animate={{
          x: [0, -120, -280, -120, 0],
          y: [0, 12, -5, 10, 0],
        }}
        transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut', delay: 1.8 }}
      >
        <FishSvg flip />
      </motion.div>

      {/* Sea turtle swimming slowly across */}
      <motion.div
        className="absolute top-[50%] left-[2%] text-accent-600/45 w-40 h-22"
        animate={{
          x: [0, 150, 400, 600, 400, 150, 0],
          y: [0, -18, 8, -12, 10, -6, 0],
          rotate: [0, -3, 2, -2, 3, -1, 0],
        }}
        transition={{ duration: 30, repeat: Infinity, ease: 'easeInOut', delay: 5 }}
      >
        <TurtleSvg />
      </motion.div>

      {/* Seaweed - bottom left - tall */}
      <motion.div
        className="absolute bottom-0 left-[4%] text-accent-600/50 w-18 h-52"
        animate={{ rotateZ: [-5, 5, -5] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        style={{ transformOrigin: 'bottom center' }}
      >
        <SeaweedSvg />
      </motion.div>

      {/* Seaweed - bottom left second */}
      <motion.div
        className="absolute bottom-0 left-[8%] text-primary-500/45 w-14 h-44"
        animate={{ rotateZ: [3, -4, 3] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
        style={{ transformOrigin: 'bottom center' }}
      >
        <SeaweedSvg />
      </motion.div>

      {/* Seaweed - bottom right - tall */}
      <motion.div
        className="absolute bottom-0 right-[5%] text-accent-600/50 w-16 h-48"
        animate={{ rotateZ: [4, -5, 4] }}
        transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        style={{ transformOrigin: 'bottom center' }}
      >
        <SeaweedSvg />
      </motion.div>

      {/* Seaweed - bottom right second */}
      <motion.div
        className="absolute bottom-0 right-[9%] text-primary-500/45 w-14 h-38"
        animate={{ rotateZ: [-3, 6, -3] }}
        transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }}
        style={{ transformOrigin: 'bottom center' }}
      >
        <SeaweedSvg />
      </motion.div>

      {/* Seaweed - bottom center */}
      <motion.div
        className="absolute bottom-0 left-[48%] text-accent-500/40 w-12 h-32"
        animate={{ rotateZ: [-4, 4, -4] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        style={{ transformOrigin: 'bottom center' }}
      >
        <SeaweedSvg />
      </motion.div>

      {/* Coral - bottom left cluster */}
      <motion.div
        className="absolute bottom-0 left-[10%] text-primary-500/50 w-32 h-32"
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
      >
        <CoralSvg />
      </motion.div>

      {/* Coral - bottom right cluster */}
      <motion.div
        className="absolute bottom-0 right-[12%] text-accent-600/45 w-28 h-28"
        animate={{ scale: [1, 1.06, 1] }}
        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
      >
        <CoralSvg />
      </motion.div>

      {/* Coral - bottom center-right */}
      <motion.div
        className="absolute bottom-0 right-[35%] text-primary-400/40 w-22 h-22"
        animate={{ scale: [1, 1.04, 1] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 3 }}
      >
        <CoralSvg />
      </motion.div>

      {/* Starfish - bottom left */}
      <motion.div
        className="absolute bottom-[4%] left-[20%] text-primary-500/55 w-16 h-16"
        animate={{ rotate: [0, 20, 0, -15, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
      >
        <StarfishSvg />
      </motion.div>

      {/* Starfish - bottom right */}
      <motion.div
        className="absolute bottom-[6%] right-[22%] text-accent-500/50 w-14 h-14"
        animate={{ rotate: [0, -12, 0, 18, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut', delay: 4 }}
      >
        <StarfishSvg />
      </motion.div>

      {/* Shell - bottom center-left */}
      <motion.div
        className="absolute bottom-[3%] left-[35%] text-primary-500/50 w-14 h-14"
        animate={{ rotate: [0, -10, 0, 8, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
      >
        <ShellSvg />
      </motion.div>

      {/* Shell - bottom right area */}
      <motion.div
        className="absolute bottom-[5%] right-[30%] text-accent-600/45 w-12 h-12"
        animate={{ rotate: [0, 12, 0, -6, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut', delay: 5 }}
      >
        <ShellSvg />
      </motion.div>

      {/* Bubbles rising from coral/seaweed areas */}
      {[
        { left: '6%', bottom: '20%', size: 15, delay: 0, duration: 6 },
        { left: '8%', bottom: '15%', size: 11, delay: 1.5, duration: 7 },
        { left: '11%', bottom: '18%', size: 8, delay: 3, duration: 8 },
        { left: '12%', bottom: '22%', size: 12, delay: 0.5, duration: 6.5 },
        { left: '49%', bottom: '12%', size: 9, delay: 2, duration: 7 },
        { left: '50%', bottom: '16%', size: 6, delay: 4, duration: 8 },
        { left: '88%', bottom: '18%', size: 14, delay: 1, duration: 6 },
        { left: '91%', bottom: '14%', size: 9, delay: 3, duration: 7.5 },
        { left: '93%', bottom: '20%', size: 8, delay: 5, duration: 8 },
        { left: '36%', bottom: '10%', size: 11, delay: 2.5, duration: 7 },
      ].map((bubble, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            left: bubble.left,
            bottom: bubble.bottom,
            width: bubble.size,
            height: bubble.size,
            background: `radial-gradient(circle at 35% 35%, rgba(6,182,212,0.7), rgba(6,182,212,0.25) 60%, transparent 70%)`,
            border: '1px solid rgba(6,182,212,0.5)',
            boxShadow: `0 0 ${bubble.size * 2}px rgba(6,182,212,0.25)`,
          }}
          animate={{
            y: [0, -120, -250],
            opacity: [0, 1, 0],
            scale: [0.8, 1.3, 0.6],
          }}
          transition={{
            duration: bubble.duration,
            repeat: Infinity,
            ease: 'easeOut',
            delay: bubble.delay,
          }}
        />
      ))}
    </div>
  );
};
