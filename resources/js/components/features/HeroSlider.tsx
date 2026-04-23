import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useGetBannersQuery } from '../../services/api';
import { UnderwaterOverlay } from '../animations/UnderwaterOverlay';
import type { Banner } from '../../types';

interface HeroSliderProps {
  /**
   * Optional pre-fetched banners. When provided, the internal fetch is skipped.
   * Used by HomePage which loads banners via the aggregated `/home-data` endpoint.
   * When omitted, the component falls back to its own RTK Query request.
   */
  banners?: Banner[];
}

export const HeroSlider: React.FC<HeroSliderProps> = ({ banners: bannersProp }) => {
  const { t } = useTranslation();
  const { data: bannersFetched = [], isLoading: isFetching } = useGetBannersQuery(
    { active: true, position: 'hero' },
    { skip: bannersProp !== undefined },
  );
  const banners = bannersProp ?? bannersFetched;
  const isLoading = bannersProp === undefined && isFetching;
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Use banners from API
  const slides = banners;

  useEffect(() => {
    if (isPaused || slides.length === 0) return;

    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000); // 6 seconds per slide
    return () => clearInterval(timer);
  }, [slides.length, isPaused]);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const variants = {
    enter: {
      opacity: 0,
    },
    center: {
      zIndex: 1,
      opacity: 1,
    },
    exit: {
      zIndex: 0,
      opacity: 0,
    },
  };

  if (isLoading) {
    return (
      <div
        className="relative h-screen w-full overflow-hidden bg-gradient-to-br from-gray-200 to-gray-300 animate-pulse"
        aria-hidden="true"
      >
        <div className="relative h-full flex items-center justify-center px-6 sm:px-8">
          <div className="max-w-2xl w-full mx-auto space-y-4 sm:space-y-6">
            {/* Heading placeholder */}
            <div className="h-6 sm:h-10 lg:h-14 bg-white/40 rounded-lg w-3/4 mx-auto" />
            <div className="h-6 sm:h-10 lg:h-14 bg-white/40 rounded-lg w-1/2 mx-auto" />
            {/* Description placeholder */}
            <div className="space-y-2 pt-2 sm:pt-4">
              <div className="h-3 sm:h-4 bg-white/30 rounded w-full" />
              <div className="h-3 sm:h-4 bg-white/30 rounded w-5/6 mx-auto" />
            </div>
            {/* Buttons placeholder */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center pt-4 sm:pt-6">
              <div className="h-10 sm:h-14 w-40 sm:w-48 bg-white/40 rounded-lg" />
              <div className="h-10 sm:h-14 w-40 sm:w-48 bg-white/30 rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (slides.length === 0) {
    return null;
  }

  return (
    <div
      className="relative h-screen w-full overflow-hidden"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <AnimatePresence initial={false} mode="wait">
        <motion.div
          key={currentSlide}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            duration: 0.3,
            ease: 'easeInOut',
          }}
          className="absolute inset-0"
          style={{ willChange: 'opacity' }}
        >
          {/* Background Image — <img> so we can hint fetchpriority/loading */}
          <div className="absolute inset-0">
            <img
              src={slides[currentSlide].image_url || slides[currentSlide].image}
              alt=""
              aria-hidden="true"
              className="absolute inset-0 w-full h-full object-cover"
              {...(currentSlide === 0
                ? { fetchPriority: 'high' as const, loading: 'eager' as const }
                : { loading: 'lazy' as const })}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/60" />
          </div>

          {/* Content */}
          <div className="relative h-full flex items-center justify-center text-center px-6 sm:px-8">
            <div className="max-w-5xl w-full">
              <h1
                className="text-xl sm:text-3xl lg:text-5xl font-bold text-white mb-3 sm:mb-6 tracking-wide leading-tight"
                style={{ textShadow: '0 4px 20px rgba(0,0,0,0.5)' }}
              >
                {slides[currentSlide].title}
              </h1>
              {slides[currentSlide].description && (
                <p className="text-sm sm:text-base lg:text-xl text-white/90 mb-4 sm:mb-8 leading-relaxed max-w-2xl mx-auto">
                  {slides[currentSlide].description}
                </p>
              )}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center">
                {slides[currentSlide].button_text && slides[currentSlide].button_link && (
                  <Link
                    to={slides[currentSlide].button_link || '#'}
                    className="inline-block px-5 py-2.5 sm:px-8 sm:py-4 bg-gradient-to-r from-primary-600 to-accent-600 text-white text-sm sm:text-base font-semibold rounded-lg hover:shadow-lg transition-all"
                  >
                    {slides[currentSlide].button_text}
                  </Link>
                )}
                <Link
                  to="/blog"
                  className="inline-block px-5 py-2.5 sm:px-8 sm:py-4 border-2 border-white/80 text-white text-sm sm:text-base font-semibold rounded-lg hover:bg-white/10 transition-all"
                >
                  {t('home.learnHowWeWork')}
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Underwater Animation Overlay */}
      <UnderwaterOverlay className="z-2" />

      {/* Navigation Arrows — hidden on mobile, users swipe instead */}
      <button
        onClick={prevSlide}
        className="hidden sm:block absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-white/20 hover:bg-white/30 text-white p-3 rounded-full transition-colors"
        aria-label={t('heroSlider.previousSlide')}
      >
        <ChevronLeft className="w-6 h-6" />
      </button>
      <button
        onClick={nextSlide}
        className="hidden sm:block absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-white/20 hover:bg-white/30 text-white p-3 rounded-full transition-colors"
        aria-label={t('heroSlider.nextSlide')}
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Dots Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex gap-3">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`transition-all ${
              index === currentSlide
                ? 'w-12 bg-white'
                : 'w-3 bg-white/50 hover:bg-white/75'
            } h-3 rounded-full`}
            aria-label={t('heroSlider.goToSlide', { number: index + 1 })}
          />
        ))}
      </div>

      {/* Scroll Indicator — hidden on mobile to avoid overlap */}
      <div className="hidden sm:block absolute bottom-24 left-1/2 -translate-x-1/2 z-10">
        <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center pt-2">
          <div className="w-1.5 h-3 bg-white/70 rounded-full animate-bounce" />
        </div>
      </div>
    </div>
  );
};
