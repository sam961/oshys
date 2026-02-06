import React from 'react';
import { motion } from 'framer-motion';

interface DivingDecorationsProps {
  className?: string;
}

// Scuba mask SVG
const ScubaMaskSvg: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg viewBox="0 0 80 48" fill="currentColor" className={className}>
    <rect x="4" y="10" width="30" height="24" rx="6" opacity="0.8" />
    <rect x="46" y="10" width="30" height="24" rx="6" opacity="0.8" />
    <rect x="34" y="18" width="12" height="8" rx="3" opacity="0.6" />
    <rect x="8" y="14" width="22" height="16" rx="4" fill="rgba(255,255,255,0.15)" />
    <rect x="50" y="14" width="22" height="16" rx="4" fill="rgba(255,255,255,0.15)" />
    <path d="M0,22 L4,22" strokeWidth="3" stroke="currentColor" strokeLinecap="round" fill="none" />
    <path d="M76,22 L80,22" strokeWidth="3" stroke="currentColor" strokeLinecap="round" fill="none" />
  </svg>
);

// Flipper/Fin SVG
const FlipperSvg: React.FC<{ className?: string; flip?: boolean }> = ({ className = '', flip }) => (
  <svg
    viewBox="0 0 80 32"
    fill="currentColor"
    className={className}
    style={flip ? { transform: 'scaleX(-1)' } : undefined}
  >
    <path d="M10,10 L10,22 Q10,28 16,28 L28,28 Q32,28 32,24 L32,8 Q32,4 28,4 L16,4 Q10,4 10,10Z" opacity="0.9" />
    <path d="M32,6 Q50,2 70,6 Q80,10 78,16 Q76,22 70,26 Q50,30 32,26Z" opacity="0.7" />
    <path d="M40,10 Q55,8 65,12" strokeWidth="1.5" stroke="rgba(255,255,255,0.2)" fill="none" />
    <path d="M40,16 Q55,14 65,18" strokeWidth="1.5" stroke="rgba(255,255,255,0.2)" fill="none" />
    <path d="M40,22 Q55,20 65,24" strokeWidth="1.5" stroke="rgba(255,255,255,0.2)" fill="none" />
  </svg>
);

// Oxygen tank SVG
const TankSvg: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg viewBox="0 0 36 80" fill="currentColor" className={className}>
    <rect x="8" y="16" width="20" height="56" rx="10" opacity="0.8" />
    <rect x="12" y="8" width="12" height="12" rx="4" opacity="0.9" />
    <rect x="14" y="4" width="8" height="6" rx="2" opacity="0.7" />
    <circle cx="18" cy="6" r="2" fill="rgba(255,255,255,0.2)" />
    <rect x="12" y="24" width="12" height="3" rx="1" fill="rgba(255,255,255,0.12)" />
    <rect x="12" y="32" width="12" height="3" rx="1" fill="rgba(255,255,255,0.12)" />
    <path d="M28,20 L32,18 L32,28 L28,26" opacity="0.6" />
  </svg>
);

// Anchor SVG
const AnchorSvg: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg viewBox="0 0 48 64" fill="currentColor" className={className}>
    <circle cx="24" cy="8" r="6" fill="none" stroke="currentColor" strokeWidth="3" />
    <line x1="24" y1="14" x2="24" y2="54" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    <line x1="10" y1="32" x2="38" y2="32" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    <path d="M6,50 Q6,58 14,58 L24,54" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    <path d="M42,50 Q42,58 34,58 L24,54" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
  </svg>
);

// Compass/navigation SVG
const CompassSvg: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg viewBox="0 0 48 48" fill="currentColor" className={className}>
    <circle cx="24" cy="24" r="22" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.6" />
    <circle cx="24" cy="24" r="18" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.4" />
    <polygon points="24,6 27,22 24,24 21,22" opacity="0.8" />
    <polygon points="24,42 21,26 24,24 27,26" opacity="0.5" />
    <polygon points="6,24 22,21 24,24 22,27" opacity="0.5" />
    <polygon points="42,24 26,27 24,24 26,21" opacity="0.5" />
    <circle cx="24" cy="24" r="3" opacity="0.7" />
  </svg>
);

// Wave line decoration
const WaveLineSvg: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg viewBox="0 0 200 20" fill="none" className={className} preserveAspectRatio="none">
    <path
      d="M0,10 Q25,2 50,10 Q75,18 100,10 Q125,2 150,10 Q175,18 200,10"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      opacity="0.6"
    />
    <path
      d="M0,14 Q25,6 50,14 Q75,22 100,14 Q125,6 150,14 Q175,22 200,14"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      opacity="0.3"
    />
  </svg>
);

export const DivingDecorations: React.FC<DivingDecorationsProps> = ({ className = '' }) => {
  return (
    <div
      className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}
      aria-hidden="true"
    >
      {/* Scuba mask - top right */}
      <motion.div
        className="absolute top-[8%] right-[6%] text-primary-500/50 w-28 h-16"
        animate={{
          y: [0, -8, 0, 6, 0],
          rotate: [0, 3, 0, -2, 0],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      >
        <ScubaMaskSvg />
      </motion.div>

      {/* Flippers - bottom left */}
      <motion.div
        className="absolute bottom-[8%] left-[4%] text-accent-600/50 w-32 h-14"
        animate={{
          y: [0, -6, 0, 8, 0],
          rotate: [0, -5, 0, 4, 0],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
      >
        <FlipperSvg />
      </motion.div>

      {/* Second flipper slightly offset */}
      <motion.div
        className="absolute bottom-[12%] left-[6%] text-accent-600/45 w-30 h-12"
        animate={{
          y: [0, -5, 0, 7, 0],
          rotate: [0, -4, 0, 3, 0],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 2.3 }}
      >
        <FlipperSvg />
      </motion.div>

      {/* Oxygen tank - top left */}
      <motion.div
        className="absolute top-[5%] left-[8%] text-primary-500/45 w-14 h-28"
        animate={{
          y: [0, -10, 0, 8, 0],
          rotate: [0, 3, 0, -4, 0],
        }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
      >
        <TankSvg />
      </motion.div>

      {/* Anchor - bottom right */}
      <motion.div
        className="absolute bottom-[5%] right-[8%] text-primary-500/45 w-20 h-24"
        animate={{
          y: [0, -6, 0, 4, 0],
          rotate: [0, -3, 0, 5, 0],
        }}
        transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut', delay: 3 }}
      >
        <AnchorSvg />
      </motion.div>

      {/* Compass - right center area */}
      <motion.div
        className="absolute top-[45%] right-[3%] text-accent-500/45 w-20 h-20"
        animate={{
          rotate: [0, 15, 0, -10, 0],
          scale: [1, 1.05, 1, 0.97, 1],
        }}
        transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut', delay: 4 }}
      >
        <CompassSvg />
      </motion.div>

      {/* Wave line - top area spanning width */}
      <motion.div
        className="absolute top-[2%] left-[10%] right-[10%] text-primary-400/40 h-8"
        animate={{
          x: [0, 20, 0, -20, 0],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      >
        <WaveLineSvg />
      </motion.div>

      {/* Wave line - bottom area */}
      <motion.div
        className="absolute bottom-[2%] left-[5%] right-[5%] text-accent-400/35 h-8"
        animate={{
          x: [0, -15, 0, 15, 0],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
      >
        <WaveLineSvg />
      </motion.div>

      {/* Bubbles scattered around diving gear */}
      {[
        { left: '9%', top: '28%', size: 12, delay: 0, duration: 7 },
        { left: '7%', top: '22%', size: 8, delay: 1.5, duration: 8 },
        { left: '10%', top: '18%', size: 9, delay: 3, duration: 6 },
        { right: '7%', top: '22%', size: 11, delay: 1, duration: 7 },
        { right: '9%', top: '16%', size: 8, delay: 2.5, duration: 8 },
        { right: '5%', top: '28%', size: 6, delay: 4, duration: 9 },
        { left: '50%', top: '8%', size: 9, delay: 2, duration: 7 },
        { left: '45%', top: '12%', size: 6, delay: 3.5, duration: 8 },
      ].map((bubble, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            left: bubble.left,
            right: (bubble as any).right,
            top: bubble.top,
            width: bubble.size,
            height: bubble.size,
            background: `radial-gradient(circle at 35% 35%, rgba(6,182,212,0.65), rgba(6,182,212,0.25) 60%, transparent 70%)`,
            border: '1px solid rgba(6,182,212,0.5)',
            boxShadow: `0 0 ${bubble.size * 2}px rgba(6,182,212,0.2)`,
          }}
          animate={{
            y: [0, -100, -200],
            opacity: [0, 1, 0],
            scale: [0.8, 1.2, 0.6],
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
