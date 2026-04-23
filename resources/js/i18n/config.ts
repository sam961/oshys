import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend';

i18n
  // Load translations using http backend
  .use(Backend)
  // Detect user language
  .use(LanguageDetector)
  // Pass the i18n instance to react-i18next
  .use(initReactI18next)
  // Initialize i18next
  .init({
    fallbackLng: 'en',
    debug: import.meta.env.DEV,

    // Supported languages
    supportedLngs: ['en', 'ar'],

    // Namespace configuration
    ns: ['common', 'admin'],
    defaultNS: 'common',

    // Backend configuration
    backend: {
      // NOTE: Bump VITE_TRANSLATIONS_VERSION (or the hardcoded fallback) whenever
      // files in public/locales/*.json change. Browsers cache locale JSON for 1
      // year (see public/.htaccess) so a stale version will serve old strings.
      loadPath: '/locales/{{lng}}/{{ns}}.json?v=' + (import.meta.env.VITE_TRANSLATIONS_VERSION || '20260424'),
    },

    // Language detection options
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
      lookupLocalStorage: 'i18nextLng',
    },

    // Interpolation options
    interpolation: {
      escapeValue: false, // React already escapes values
    },

    // React-specific options
    react: {
      useSuspense: true,
    },
  });

export default i18n;
