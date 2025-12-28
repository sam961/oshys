import React from 'react';
import '@abdulrysr/saudi-riyal-new-symbol-font/style.css';

interface SaudiRiyalPriceProps {
  amount: number | string;
  className?: string;
  showSymbol?: boolean;
}

/**
 * Displays a price with the official Saudi Riyal symbol (٪)
 * as approved by the Saudi Central Bank (SAMA).
 *
 * The symbol works in both LTR (English) and RTL (Arabic) contexts.
 */
export const SaudiRiyalPrice: React.FC<SaudiRiyalPriceProps> = ({
  amount,
  className = '',
  showSymbol = true
}) => {
  const formattedAmount = typeof amount === 'number'
    ? amount.toLocaleString()
    : amount;

  return (
    <span className={className}>
      {showSymbol && (
        <span
          className="icon-saudi_riyal"
          style={{ marginInlineEnd: '0.25em' }}
          aria-label="SAR"
        >
          &#xea;
        </span>
      )}
      {formattedAmount}
    </span>
  );
};
