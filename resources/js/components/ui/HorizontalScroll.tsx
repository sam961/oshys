import React from 'react';

interface HorizontalScrollProps {
  children: React.ReactNode;
  className?: string;
  itemCount: number;
}

export const HorizontalScroll: React.FC<HorizontalScrollProps> = ({
  children,
  className = '',
}) => {
  return (
    <div
      className={`grid grid-cols-1 gap-6 sm:gap-8 ${className}`}
    >
      {children}
    </div>
  );
};
