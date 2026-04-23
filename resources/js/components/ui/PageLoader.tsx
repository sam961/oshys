import React from 'react';

/**
 * PageLoader — skeleton fallback shown while a lazy-loaded public page chunk
 * is being fetched. Mimics a hero section followed by content blocks so the
 * layout feels stable during navigation (no spinner, no flicker).
 */
export const PageLoader: React.FC = () => {
  return (
    <div
      role="status"
      aria-label="Loading page"
      aria-busy="true"
      className="min-h-screen w-full bg-white"
    >
      {/* Hero block */}
      <div className="w-full h-56 sm:h-80 lg:h-[28rem] bg-gray-100 animate-pulse" />

      {/* Content container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 lg:py-20">
        {/* Title */}
        <div className="h-6 sm:h-8 w-2/3 sm:w-1/2 bg-gray-100 rounded-md animate-pulse mb-4 sm:mb-6" />
        {/* Subtitle */}
        <div className="h-4 sm:h-5 w-1/2 sm:w-1/3 bg-gray-100 rounded-md animate-pulse mb-8 sm:mb-12" />

        {/* Content grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex flex-col gap-3 sm:gap-4">
              <div className="h-40 sm:h-48 lg:h-56 w-full bg-gray-100 rounded-xl animate-pulse" />
              <div className="h-4 sm:h-5 w-3/4 bg-gray-100 rounded-md animate-pulse" />
              <div className="h-3 sm:h-4 w-full bg-gray-100 rounded-md animate-pulse" />
              <div className="h-3 sm:h-4 w-5/6 bg-gray-100 rounded-md animate-pulse" />
            </div>
          ))}
        </div>
      </div>

      <span className="sr-only">Loading</span>
    </div>
  );
};
