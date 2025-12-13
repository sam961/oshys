import React, { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';

interface HorizontalScrollProps {
  children: React.ReactNode;
  className?: string;
  itemCount: number;
}

export const HorizontalScroll: React.FC<HorizontalScrollProps> = ({
  children,
  className = '',
  itemCount,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft } = scrollRef.current;
      // Calculate active index based on scroll position
      const cardWidth = scrollRef.current.firstElementChild?.clientWidth || 0;
      const gap = 24; // gap-6 = 24px
      const index = Math.round(scrollLeft / (cardWidth + gap));
      setActiveIndex(Math.min(index, itemCount - 1));
    }
  };

  useEffect(() => {
    const scrollElement = scrollRef.current;
    if (scrollElement) {
      scrollElement.addEventListener('scroll', checkScroll);
      // Initial check
      checkScroll();
      // Check on resize
      window.addEventListener('resize', checkScroll);
      return () => {
        scrollElement.removeEventListener('scroll', checkScroll);
        window.removeEventListener('resize', checkScroll);
      };
    }
  }, [itemCount]);

  return (
    <div className="relative">
      {/* Scroll hint text - only on mobile */}
      <div className="sm:hidden flex items-center justify-center gap-2 mb-3 text-sm text-gray-500">
        <motion.div
          animate={{ x: [0, 5, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          className="flex items-center gap-1"
        >
          <span>Swipe to see more</span>
          <ChevronRight className="w-4 h-4" />
        </motion.div>
      </div>

      {/* Scroll container */}
      <div
        ref={scrollRef}
        className={`flex overflow-x-auto pb-4 gap-6 snap-x snap-mandatory scrollbar-hide sm:grid sm:gap-8 sm:overflow-visible sm:pb-0 ${className}`}
      >
        {children}
      </div>

      {/* Pagination dots - mobile only */}
      {itemCount > 1 && (
        <div className="sm:hidden flex justify-center gap-2 mt-4">
          {Array.from({ length: itemCount }).map((_, index) => (
            <button
              key={index}
              onClick={() => {
                if (scrollRef.current) {
                  const cardWidth = scrollRef.current.firstElementChild?.clientWidth || 0;
                  const gap = 24;
                  scrollRef.current.scrollTo({
                    left: index * (cardWidth + gap),
                    behavior: 'smooth',
                  });
                }
              }}
              className={`transition-all duration-300 rounded-full ${
                activeIndex === index
                  ? 'w-6 h-2 bg-primary-600'
                  : 'w-2 h-2 bg-gray-300 hover:bg-gray-400'
              }`}
              aria-label={`Go to item ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};
