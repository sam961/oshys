import React from 'react';
import { motion } from 'framer-motion';

type Variant = 'jellyfish' | 'treasure' | 'waves' | 'reef' | 'deep-sea';

interface OceanDecorationsProps {
  variant: Variant;
  className?: string;
}

/* ────────── SVG Elements ────────── */

const JellyfishSvg: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg viewBox="0 0 48 64" fill="currentColor" className={className}>
    <ellipse cx="24" cy="20" rx="20" ry="18" opacity="0.8" />
    <ellipse cx="24" cy="20" rx="14" ry="12" fill="rgba(255,255,255,0.12)" />
    <path d="M10,30 Q8,42 12,54" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" opacity="0.6" />
    <path d="M18,32 Q20,46 16,58" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" opacity="0.5" />
    <path d="M30,32 Q28,46 32,58" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" opacity="0.5" />
    <path d="M38,30 Q40,42 36,54" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" opacity="0.6" />
    <path d="M24,34 Q24,48 24,62" strokeWidth="1.5" stroke="currentColor" fill="none" strokeLinecap="round" opacity="0.4" />
  </svg>
);

const TreasureChestSvg: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg viewBox="0 0 64 48" fill="currentColor" className={className}>
    <rect x="6" y="20" width="52" height="26" rx="4" opacity="0.8" />
    <path d="M6,20 Q32,6 58,20" fill="currentColor" opacity="0.9" />
    <rect x="26" y="26" width="12" height="10" rx="2" fill="rgba(255,255,255,0.15)" />
    <circle cx="32" cy="31" r="3" fill="rgba(255,255,255,0.25)" />
    <line x1="6" y1="32" x2="58" y2="32" stroke="rgba(255,255,255,0.1)" strokeWidth="1.5" />
  </svg>
);

const CoinSvg: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg viewBox="0 0 32 32" fill="currentColor" className={className}>
    <circle cx="16" cy="16" r="14" opacity="0.8" />
    <circle cx="16" cy="16" r="10" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" />
    <text x="16" y="21" textAnchor="middle" fontSize="14" fill="rgba(255,255,255,0.3)" fontWeight="bold">$</text>
  </svg>
);

const WhaleSvg: React.FC<{ className?: string; flip?: boolean }> = ({ className = '', flip }) => (
  <svg
    viewBox="0 0 96 48"
    fill="currentColor"
    className={className}
    style={flip ? { transform: 'scaleX(-1)' } : undefined}
  >
    <ellipse cx="42" cy="26" rx="34" ry="18" opacity="0.7" />
    <path d="M76,20 Q88,8 96,12 Q92,18 84,22 Q92,26 96,36 Q88,40 76,32" opacity="0.6" />
    <ellipse cx="20" cy="22" rx="3" ry="2" fill="rgba(255,255,255,0.4)" />
    <path d="M10,30 Q16,36 28,34" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
    <circle cx="42" cy="38" r="1.5" fill="rgba(255,255,255,0.1)" />
  </svg>
);

const SeahorseSvg: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg viewBox="0 0 36 64" fill="currentColor" className={className}>
    <path d="M18,4 Q28,4 28,14 Q28,22 22,26 Q26,30 26,38 Q26,48 18,52 Q10,56 10,48 Q10,44 14,42 Q10,38 10,32 Q10,24 18,20 Q12,16 8,14 Q4,12 8,8 Q12,4 18,4Z" opacity="0.7" />
    <circle cx="22" cy="12" r="2" fill="rgba(255,255,255,0.3)" />
    <path d="M18,52 Q16,58 20,62 Q22,60 20,56" opacity="0.5" />
  </svg>
);

const OctopusSvg: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg viewBox="0 0 64 64" fill="currentColor" className={className}>
    <ellipse cx="32" cy="22" rx="20" ry="18" opacity="0.7" />
    <circle cx="24" cy="18" r="4" fill="rgba(255,255,255,0.2)" />
    <circle cx="40" cy="18" r="4" fill="rgba(255,255,255,0.2)" />
    <circle cx="24" cy="18" r="2" opacity="0.9" />
    <circle cx="40" cy="18" r="2" opacity="0.9" />
    <path d="M14,34 Q8,42 6,54 Q8,56 10,52 Q12,44 16,38" opacity="0.5" />
    <path d="M20,36 Q16,46 18,58 Q20,60 22,56 Q22,46 22,38" opacity="0.5" />
    <path d="M32,38 Q32,50 30,60 Q32,62 34,60 Q36,50 32,40" opacity="0.5" />
    <path d="M44,36 Q48,46 46,58 Q44,60 42,56 Q42,46 42,38" opacity="0.5" />
    <path d="M50,34 Q56,42 58,54 Q56,56 54,52 Q52,44 48,38" opacity="0.5" />
  </svg>
);

const RaySvg: React.FC<{ className?: string; flip?: boolean }> = ({ className = '', flip }) => (
  <svg
    viewBox="0 0 80 32"
    fill="currentColor"
    className={className}
    style={flip ? { transform: 'scaleX(-1)' } : undefined}
  >
    <path d="M40,16 Q20,4 4,8 Q0,16 4,24 Q20,28 40,16Z" opacity="0.6" />
    <path d="M40,16 Q60,4 76,8 Q80,16 76,24 Q60,28 40,16Z" opacity="0.6" />
    <path d="M40,16 Q42,6 50,2 L52,4 Q44,8 42,16" opacity="0.4" />
    <circle cx="16" cy="14" r="2" fill="rgba(255,255,255,0.3)" />
    <circle cx="64" cy="14" r="2" fill="rgba(255,255,255,0.3)" />
  </svg>
);

const SubmarineSvg: React.FC<{ className?: string; flip?: boolean }> = ({ className = '', flip }) => (
  <svg
    viewBox="0 0 80 40"
    fill="currentColor"
    className={className}
    style={flip ? { transform: 'scaleX(-1)' } : undefined}
  >
    <ellipse cx="40" cy="24" rx="32" ry="14" opacity="0.7" />
    <rect x="28" y="8" width="16" height="12" rx="4" opacity="0.8" />
    <rect x="32" y="12" width="8" height="6" rx="2" fill="rgba(255,255,255,0.2)" />
    <path d="M72,22 L78,18 L78,26 Z" opacity="0.5" />
    <circle cx="20" cy="22" r="4" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" />
    <line x1="36" y1="4" x2="36" y2="8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
  </svg>
);

const WaveDivider: React.FC<{ className?: string; position: 'top' | 'bottom' }> = ({ className = '', position }) => (
  <svg
    viewBox="0 0 1440 40"
    fill="currentColor"
    className={`absolute left-0 w-full ${position === 'top' ? 'top-0' : 'bottom-0 rotate-180'} ${className}`}
    preserveAspectRatio="none"
    style={{ height: '60px' }}
  >
    <path d="M0,20 Q180,5 360,20 T720,20 T1080,20 T1440,20 L1440,40 L0,40Z" opacity="0.5" />
    <path d="M0,28 Q180,14 360,28 T720,28 T1080,28 T1440,28 L1440,40 L0,40Z" opacity="0.3" />
  </svg>
);

/* Helper: small bubble cluster */
const BubbleCluster: React.FC<{
  bubbles: Array<{ x: string; y: string; size: number; delay: number; dur: number }>;
  color?: string;
}> = ({ bubbles, color = 'rgba(6,182,212,' }) => (
  <>
    {bubbles.map((b, i) => (
      <motion.div
        key={i}
        className="absolute rounded-full"
        style={{
          left: b.x,
          bottom: b.y,
          width: b.size,
          height: b.size,
          background: `radial-gradient(circle at 35% 35%, ${color}0.65), ${color}0.25) 60%, transparent 70%)`,
          border: `1px solid ${color}0.5)`,
        }}
        animate={{ y: [0, -110, -220], opacity: [0, 1, 0], scale: [0.8, 1.2, 0.5] }}
        transition={{ duration: b.dur, repeat: Infinity, ease: 'easeOut', delay: b.delay }}
      />
    ))}
  </>
);

/* ────────── Variant Renderers ────────── */

function JellyfishVariant() {
  return (
    <>
      {/* Jellyfish top-left */}
      <motion.div
        className="absolute top-[6%] left-[6%] text-primary-500/55 w-24 h-32"
        animate={{ y: [0, -14, 0, 10, 0], x: [0, 8, 0, -6, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
      >
        <JellyfishSvg />
      </motion.div>

      {/* Jellyfish top-right, smaller */}
      <motion.div
        className="absolute top-[12%] right-[10%] text-accent-500/50 w-18 h-24"
        animate={{ y: [0, -10, 0, 12, 0], x: [0, -5, 0, 7, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut', delay: 3 }}
      >
        <JellyfishSvg />
      </motion.div>

      {/* Seahorse mid-right */}
      <motion.div
        className="absolute top-[40%] right-[5%] text-primary-400/50 w-16 h-26"
        animate={{ y: [0, -8, 0, 6, 0], rotate: [0, 5, 0, -3, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
      >
        <SeahorseSvg />
      </motion.div>

      {/* Small jellyfish bottom-center */}
      <motion.div
        className="absolute bottom-[10%] left-[45%] text-accent-600/45 w-16 h-20"
        animate={{ y: [0, -12, 0, 8, 0] }}
        transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut', delay: 5 }}
      >
        <JellyfishSvg />
      </motion.div>

      <BubbleCluster
        bubbles={[
          { x: '8%', y: '30%', size: 11, delay: 0, dur: 7 },
          { x: '10%', y: '25%', size: 8, delay: 2, dur: 8 },
          { x: '92%', y: '35%', size: 9, delay: 1, dur: 7 },
          { x: '48%', y: '20%', size: 8, delay: 3, dur: 9 },
          { x: '88%', y: '28%', size: 12, delay: 4, dur: 6 },
        ]}
      />

      <WaveDivider position="bottom" className="text-primary-300/35" />
    </>
  );
}

function TreasureVariant() {
  return (
    <>
      {/* Treasure chest bottom-left */}
      <motion.div
        className="absolute bottom-[4%] left-[6%] text-amber-500/50 w-28 h-20"
        animate={{ y: [0, -4, 0, 3, 0], rotate: [0, -2, 0, 1, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      >
        <TreasureChestSvg />
      </motion.div>

      {/* Floating coins */}
      {[
        { top: '15%', left: '8%', size: 'w-12 h-12', delay: 0, dur: 10 },
        { top: '25%', left: '12%', size: 'w-10 h-10', delay: 1.5, dur: 12 },
        { top: '10%', right: '10%', size: 'w-11 h-11', delay: 3, dur: 11 },
        { top: '60%', right: '6%', size: 'w-10 h-10', delay: 2, dur: 9 },
        { top: '45%', left: '4%', size: 'w-8 h-8', delay: 4, dur: 10 },
      ].map((coin, i) => (
        <motion.div
          key={i}
          className={`absolute text-amber-400/45 ${coin.size}`}
          style={{ top: coin.top, left: (coin as any).left, right: (coin as any).right }}
          animate={{ y: [0, -10, 0, 8, 0], rotate: [0, 15, 0, -10, 0] }}
          transition={{ duration: coin.dur, repeat: Infinity, ease: 'easeInOut', delay: coin.delay }}
        >
          <CoinSvg />
        </motion.div>
      ))}

      {/* Octopus bottom-right */}
      <motion.div
        className="absolute bottom-[6%] right-[5%] text-primary-500/45 w-26 h-26"
        animate={{ y: [0, -6, 0, 8, 0], rotate: [0, 3, 0, -2, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
      >
        <OctopusSvg />
      </motion.div>

      <BubbleCluster
        bubbles={[
          { x: '7%', y: '15%', size: 9, delay: 0.5, dur: 7 },
          { x: '9%', y: '10%', size: 6, delay: 2, dur: 8 },
          { x: '90%', y: '18%', size: 11, delay: 1, dur: 7 },
          { x: '92%', y: '12%', size: 8, delay: 3.5, dur: 9 },
        ]}
      />
    </>
  );
}

function WavesVariant() {
  return (
    <>
      <WaveDivider position="top" className="text-primary-400/35" />
      <WaveDivider position="bottom" className="text-accent-400/35" />

      {/* Whale swimming across */}
      <motion.div
        className="absolute top-[20%] left-[3%] text-primary-500/40 w-40 h-20"
        animate={{
          x: [0, 200, 500, 700, 500, 200, 0],
          y: [0, -12, 6, -8, 10, -4, 0],
        }}
        transition={{ duration: 28, repeat: Infinity, ease: 'easeInOut' }}
      >
        <WhaleSvg />
      </motion.div>

      {/* Stingray gliding */}
      <motion.div
        className="absolute bottom-[25%] right-[5%] text-accent-600/40 w-32 h-14"
        animate={{
          x: [0, -150, -350, -150, 0],
          y: [0, 8, -6, 10, 0],
        }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut', delay: 4 }}
      >
        <RaySvg flip />
      </motion.div>

      {/* Seahorse left */}
      <motion.div
        className="absolute top-[55%] left-[5%] text-accent-500/40 w-16 h-26"
        animate={{ y: [0, -10, 0, 8, 0], rotate: [0, 4, 0, -3, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
      >
        <SeahorseSvg />
      </motion.div>

      <BubbleCluster
        bubbles={[
          { x: '5%', y: '40%', size: 11, delay: 0, dur: 7 },
          { x: '50%', y: '15%', size: 8, delay: 2, dur: 8 },
          { x: '92%', y: '30%', size: 9, delay: 1, dur: 7 },
          { x: '30%', y: '20%', size: 12, delay: 3, dur: 6 },
          { x: '70%', y: '25%', size: 8, delay: 4, dur: 8 },
          { x: '15%', y: '35%', size: 6, delay: 5, dur: 9 },
        ]}
      />
    </>
  );
}

function ReefVariant() {
  return (
    <>
      {/* Octopus top-left */}
      <motion.div
        className="absolute top-[8%] left-[4%] text-primary-500/50 w-24 h-24"
        animate={{ y: [0, -8, 0, 6, 0], rotate: [0, -3, 0, 4, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
      >
        <OctopusSvg />
      </motion.div>

      {/* Stingray mid-right */}
      <motion.div
        className="absolute top-[35%] right-[4%] text-accent-500/50 w-34 h-14"
        animate={{
          x: [0, -100, -220, -100, 0],
          y: [0, 8, -5, 10, 0],
        }}
        transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut', delay: 3 }}
      >
        <RaySvg flip />
      </motion.div>

      {/* Seahorse bottom-left */}
      <motion.div
        className="absolute bottom-[8%] left-[8%] text-primary-400/50 w-16 h-26"
        animate={{ y: [0, -10, 0, 6, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
      >
        <SeahorseSvg />
      </motion.div>

      {/* Jellyfish bottom-right */}
      <motion.div
        className="absolute bottom-[10%] right-[8%] text-accent-600/45 w-18 h-24"
        animate={{ y: [0, -12, 0, 10, 0], x: [0, 5, 0, -4, 0] }}
        transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut', delay: 4 }}
      >
        <JellyfishSvg />
      </motion.div>

      <BubbleCluster
        bubbles={[
          { x: '6%', y: '25%', size: 11, delay: 0, dur: 7 },
          { x: '8%', y: '20%', size: 8, delay: 1.5, dur: 8 },
          { x: '90%', y: '30%', size: 9, delay: 1, dur: 7 },
          { x: '10%', y: '35%', size: 6, delay: 3, dur: 9 },
          { x: '88%', y: '22%', size: 12, delay: 2, dur: 6 },
        ]}
      />

      <WaveDivider position="top" className="text-accent-300/35" />
    </>
  );
}

function DeepSeaVariant() {
  return (
    <>
      {/* Submarine crossing */}
      <motion.div
        className="absolute top-[15%] left-[2%] text-primary-500/50 w-34 h-18"
        animate={{
          x: [0, 200, 450, 650, 450, 200, 0],
          y: [0, -10, 5, -8, 6, -4, 0],
        }}
        transition={{ duration: 26, repeat: Infinity, ease: 'easeInOut' }}
      >
        <SubmarineSvg />
      </motion.div>

      {/* Whale deep */}
      <motion.div
        className="absolute bottom-[20%] right-[3%] text-accent-600/40 w-38 h-20"
        animate={{
          x: [0, -180, -400, -180, 0],
          y: [0, 10, -8, 12, 0],
        }}
        transition={{ duration: 24, repeat: Infinity, ease: 'easeInOut', delay: 6 }}
      >
        <WhaleSvg flip />
      </motion.div>

      {/* Jellyfish floating */}
      <motion.div
        className="absolute top-[50%] left-[6%] text-primary-400/45 w-22 h-30"
        animate={{ y: [0, -14, 0, 10, 0], x: [0, 6, 0, -5, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
      >
        <JellyfishSvg />
      </motion.div>

      {/* Octopus corner */}
      <motion.div
        className="absolute top-[8%] right-[6%] text-accent-500/45 w-22 h-22"
        animate={{ y: [0, -6, 0, 8, 0], rotate: [0, 4, 0, -3, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut', delay: 4 }}
      >
        <OctopusSvg />
      </motion.div>

      <BubbleCluster
        bubbles={[
          { x: '4%', y: '40%', size: 12, delay: 0, dur: 6 },
          { x: '6%', y: '35%', size: 8, delay: 1, dur: 7 },
          { x: '50%', y: '15%', size: 9, delay: 2, dur: 8 },
          { x: '90%', y: '30%', size: 11, delay: 3, dur: 7 },
          { x: '88%', y: '25%', size: 6, delay: 4.5, dur: 8 },
          { x: '30%', y: '28%', size: 8, delay: 5, dur: 9 },
          { x: '70%', y: '20%', size: 9, delay: 1.5, dur: 7 },
        ]}
      />

      <WaveDivider position="bottom" className="text-primary-400/30" />
    </>
  );
}

/* ────────── Main Component ────────── */

const VARIANTS: Record<Variant, () => React.ReactNode> = {
  jellyfish: JellyfishVariant,
  treasure: TreasureVariant,
  waves: WavesVariant,
  reef: ReefVariant,
  'deep-sea': DeepSeaVariant,
};

export const OceanDecorations: React.FC<OceanDecorationsProps> = ({ variant, className = '' }) => {
  const Renderer = VARIANTS[variant];

  return (
    <div
      className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}
      aria-hidden="true"
    >
      <Renderer />
    </div>
  );
};
