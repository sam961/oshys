import React from 'react';
import '@abdulrysr/saudi-riyal-new-symbol-font/style.css';
import { useCurrency } from '../../context/CurrencyContext';

interface SaudiRiyalPriceProps {
  /** The price amount in SAR (the base currency). */
  amount: number | string;
  className?: string;
  showSymbol?: boolean;
}

/**
 * Displays a price, respecting the user's selected display currency.
 *
 * Amounts are always passed in SAR (the base currency). When the user
 * has selected USD, the amount is converted via the fixed peg and shown
 * with a "$" symbol and whole-dollar rounding. In SAR it renders with the
 * official Saudi Riyal symbol as approved by the Saudi Central Bank (SAMA),
 * which works in both LTR (English) and RTL (Arabic) contexts.
 */
export const SaudiRiyalPrice: React.FC<SaudiRiyalPriceProps> = ({
  amount,
  className = '',
  showSymbol = true,
}) => {
  const { currency, convert } = useCurrency();

  const sarValue = typeof amount === 'string' ? parseFloat(amount) : amount;

  // Guard against non-numeric input — render the raw value untouched.
  if (isNaN(sarValue)) {
    return <span className={className}>{String(amount)}</span>;
  }

  if (currency === 'USD') {
    const usd = Math.round(convert(sarValue));
    const formatted = usd.toLocaleString('en-US', { maximumFractionDigits: 0 });
    return (
      <span className={className}>
        {showSymbol && <span style={{ marginInlineEnd: '0.15em' }}>$</span>}
        {formatted}
      </span>
    );
  }

  // SAR — strip trailing zeros (45.00 -> 45, 45.50 -> 45.5).
  const formatted =
    sarValue % 1 === 0
      ? sarValue.toLocaleString('en-US', { maximumFractionDigits: 0 })
      : sarValue
          .toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 2 })
          .replace(/\.?0+$/, '');

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
      {formatted}
    </span>
  );
};
