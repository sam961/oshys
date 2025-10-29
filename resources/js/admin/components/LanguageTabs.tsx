import React from 'react';

interface LanguageTabsProps {
  activeLocale: 'en' | 'ar';
  onLocaleChange: (locale: 'en' | 'ar') => void;
  showBadges?: boolean;
  missingTranslations?: string[];
}

const LanguageTabs: React.FC<LanguageTabsProps> = ({
  activeLocale,
  onLocaleChange,
  showBadges = false,
  missingTranslations = [],
}) => {
  const locales = [
    { code: 'en', label: 'English', flag: '🇬🇧' },
    { code: 'ar', label: 'العربية', flag: '🇸🇦' },
  ] as const;

  return (
    <div className="mb-6">
      <div className="flex gap-3">
        {locales.map((locale) => {
          const isActive = activeLocale === locale.code;
          const hasMissingTranslations = showBadges && missingTranslations.includes(locale.code);

          return (
            <button
              key={locale.code}
              onClick={() => onLocaleChange(locale.code as 'en' | 'ar')}
              className={`
                flex-1 inline-flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium text-sm transition-all
                ${
                  isActive
                    ? 'bg-gradient-to-r from-primary-600 to-accent-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }
              `}
              type="button"
            >
              <span className="text-lg">{locale.flag}</span>
              <span>{locale.label}</span>
              {hasMissingTranslations && (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                  !
                </span>
              )}
              {isActive && !hasMissingTranslations && showBadges && (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-white/20 text-white">
                  ✓
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default LanguageTabs;
