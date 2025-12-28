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
  const formatPrice = (value: number | string): string => {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(num)) return String(value);

    // Remove trailing zeros (e.g., 45.00 -> 45, 45.50 -> 45.5)
    const formatted = num % 1 === 0
      ? num.toLocaleString('en-US', { maximumFractionDigits: 0 })
      : num.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 2 }).replace(/\.?0+$/, '');

    return formatted;
  };

  const formattedAmount = formatPrice(amount);

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
