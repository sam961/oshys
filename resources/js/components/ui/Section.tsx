import React from 'react';
import clsx from 'clsx';
import { Container } from './Container';

interface SectionProps {
  children: React.ReactNode;
  className?: string;
  containerSize?: 'sm' | 'md' | 'lg' | 'full';
  background?: 'white' | 'gray' | 'gradient' | 'none';
}

export const Section: React.FC<SectionProps> = ({
  children,
  className,
  containerSize = 'lg',
  background = 'none'
}) => {
  const backgrounds = {
    white: 'bg-white',
    gray: 'bg-gray-50',
    gradient: 'bg-gradient-to-br from-primary-50 via-white to-accent-50',
    none: '',
  };

  return (
    <section className={clsx('py-16 sm:py-20 lg:py-24', backgrounds[background], className)}>
      <Container size={containerSize}>
        {children}
      </Container>
    </section>
  );
};
