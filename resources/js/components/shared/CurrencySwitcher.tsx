import React from 'react';
import { useTranslation } from 'react-i18next';
import { useCurrency, type Currency } from '../../context/CurrencyContext';

const OPTIONS: Currency[] = ['SAR', 'USD'];

/**
 * Compact SAR/USD segmented toggle for the navbar.
 * SAR is the base currency; USD is a display-only conversion.
 */
export const CurrencySwitcher: React.FC = () => {
  const { t } = useTranslation();
  const { currency, setCurrency } = useCurrency();

  return (
    <div
      className="inline-flex items-center rounded-lg bg-gray-100 p-0.5"
      role="group"
      aria-label={t('currency.label')}
    >
      {OPTIONS.map((option) => {
        const isActive = currency === option;
        return (
          <button
            key={option}
            type="button"
            onClick={() => setCurrency(option)}
            aria-pressed={isActive}
            className={`px-2.5 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              isActive
                ? 'bg-white text-primary-600 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {t(`currency.${option.toLowerCase()}`)}
          </button>
        );
      })}
    </div>
  );
};
