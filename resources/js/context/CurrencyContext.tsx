import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';

/**
 * Supported display currencies.
 *
 * SAR is the base currency — all prices are stored in SAR in the database
 * and are the source of truth. USD is a display-only conversion computed
 * from SAR using the fixed peg below; nothing is ever stored in USD.
 */
export type Currency = 'SAR' | 'USD';

/**
 * Saudi Riyal is pegged to the US Dollar at 3.75 SAR = 1 USD.
 * This peg has been fixed by SAMA since 1986, so a constant is both
 * accurate and stable — no live FX lookup is required.
 */
export const SAR_PER_USD = 3.75;

const STORAGE_KEY = 'cas-currency';

interface CurrencyContextValue {
  /** The currently selected display currency. */
  currency: Currency;
  /** Switch the display currency (persisted to localStorage). */
  setCurrency: (currency: Currency) => void;
  /**
   * Convert a SAR amount into the currently selected currency.
   * SAR is returned unchanged; USD is divided by the peg.
   */
  convert: (sarAmount: number) => number;
}

const CurrencyContext = createContext<CurrencyContextValue | undefined>(undefined);

const isCurrency = (value: unknown): value is Currency =>
  value === 'SAR' || value === 'USD';

const readStoredCurrency = (): Currency => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (isCurrency(stored)) return stored;
  } catch {
    // localStorage may be unavailable (private mode, SSR) — fall back to base.
  }
  return 'SAR';
};

export const CurrencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currency, setCurrencyState] = useState<Currency>(readStoredCurrency);

  const setCurrency = useCallback((next: Currency) => {
    setCurrencyState(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Persistence is best-effort; ignore storage failures.
    }
  }, []);

  const convert = useCallback(
    (sarAmount: number) => (currency === 'USD' ? sarAmount / SAR_PER_USD : sarAmount),
    [currency]
  );

  const value = useMemo<CurrencyContextValue>(
    () => ({ currency, setCurrency, convert }),
    [currency, setCurrency, convert]
  );

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
};

export const useCurrency = (): CurrencyContextValue => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};
