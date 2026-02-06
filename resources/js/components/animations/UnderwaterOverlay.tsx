import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

interface UnderwaterOverlayProps {
  bubbleCount?: number;
  showLightRays?: boolean;
  showWave?: boolean;
  className?: string;
}

interface BubbleConfig {
  id: number;
  size: number;
  left: string;
  top: string;
  duration: number;
  delay: number;
  opacity: number;
  scaleEnd: number;
}

function generateBubbles(count: number): BubbleConfig[] {
  const bubbles: BubbleConfig[] = [];
  for (let i = 0; i < count; i++) {
    bubbles.push({
      id: i,
      size: 4 + Math.random() * 14,
      left: `${2 + Math.random() * 96}%`,
      top: `${60 + Math.random() * 40}%`,
      duration: 6 + Math.random() * 8,
      delay: Math.random() * 8,
      opacity: 0.4 + Math.random() * 0.4,
      scaleEnd: 0.6 + Math.random() * 0.5,
    });
  }
  return bubbles;
}

const LIGHT_RAYS = [
  { angle: 15, width: 40, left: '15%', duration: 14, delay: 0, opacity: 0.12 },
  { angle: 22, width: 60, left: '35%', duration: 18, delay: 2, opacity: 0.15 },
  { angle: 10, width: 30, left: '55%', duration: 16, delay: 5, opacity: 0.1 },
  { angle: 28, width: 50, left: '75%', duration: 20, delay: 3, opacity: 0.13 },
];

const WAVE_PATHS = [
  'M0,40 Q180,10 360,40 T720,40 T1080,40 T1440,40 L1440,80 L0,80 Z',
  'M0,50 Q180,25 360,50 T720,50 T1080,50 T1440,50 L1440,80 L0,80 Z',
  'M0,30 Q180,55 360,30 T720,30 T1080,30 T1440,30 L1440,80 L0,80 Z',
  'M0,40 Q180,10 360,40 T720,40 T1080,40 T1440,40 L1440,80 L0,80 Z',
];

export const UnderwaterOverlay: React.FC<UnderwaterOverlayProps> = ({
  bubbleCount = 35,
  showLightRays = true,
  showWave = true,
  className = '',
}) => {
  const bubbles = useMemo(() => generateBubbles(bubbleCount), [bubbleCount]);

  return (
    <div
      className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}
      aria-hidden="true"
    >
      {/* Bubbles */}
      <div className="absolute inset-0">
        {bubbles.map((bubble) => (
          <div
            key={bubble.id}
            className="absolute rounded-full"
            style={{
              width: bubble.size,
              height: bubble.size,
              left: bubble.left,
              top: bubble.top,
              background: `radial-gradient(circle at 35% 35%, rgba(255,255,255,${bubble.opacity}), rgba(6,182,212,${bubble.opacity * 0.3}) 60%, transparent 70%)`,
              border: `1px solid rgba(255,255,255,${bubble.opacity * 0.5})`,
              boxShadow: `inset 0 -2px 4px rgba(6,182,212,${bubble.opacity * 0.3}), 0 0 ${bubble.size}px rgba(6,182,212,${bubble.opacity * 0.2})`,
              '--bubble-opacity': `${bubble.opacity}`,
              '--bubble-scale-end': `${bubble.scaleEnd}`,
              animation: `bubble-rise ${bubble.duration}s ${bubble.delay}s ease-out infinite`,
              willChange: 'transform, opacity',
            } as React.CSSProperties}
          />
        ))}
      </div>

      {/* Light Rays */}
      {showLightRays && (
        <div className="absolute inset-0">
          {LIGHT_RAYS.map((ray, i) => (
            <div
              key={i}
              className="absolute h-full"
              style={{
                left: ray.left,
                top: '-20%',
                width: ray.width,
                background: `linear-gradient(180deg, rgba(255,255,255,${ray.opacity}) 0%, rgba(6,182,212,${ray.opacity * 0.6}) 50%, transparent 100%)`,
                '--ray-angle': `${ray.angle}deg`,
                '--ray-opacity': `${ray.opacity}`,
                animation: `light-ray-sweep ${ray.duration}s ${ray.delay}s ease-in-out infinite`,
                willChange: 'transform, opacity',
                filter: `blur(${ray.width / 3}px)`,
                transformOrigin: 'top center',
              } as React.CSSProperties}
            />
          ))}
        </div>
      )}

      {/* Bottom Wave Ripple */}
      {showWave && (
        <div className="absolute bottom-0 left-0 w-full" style={{ height: '100px' }}>
          <svg
            viewBox="0 0 1440 80"
            preserveAspectRatio="none"
            className="w-full h-full"
          >
            <motion.path
              fill="rgba(6, 182, 212, 0.18)"
              animate={{ d: WAVE_PATHS }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
            <motion.path
              fill="rgba(255, 255, 255, 0.1)"
              animate={{
                d: [WAVE_PATHS[2], WAVE_PATHS[0], WAVE_PATHS[1], WAVE_PATHS[2]],
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: 0.5,
              }}
            />
          </svg>
        </div>
      )}
    </div>
  );
};
