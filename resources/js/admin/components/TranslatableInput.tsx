import React from 'react';

interface TranslatableInputProps {
  label: string;
  name: string;
  value: string;
  translations?: Record<string, string>;
  currentLocale: 'en' | 'ar';
  onChange: (value: string, locale: 'en' | 'ar') => void;
  type?: 'text' | 'textarea';
  required?: boolean;
  placeholder?: string;
  rows?: number;
  className?: string;
}

const TranslatableInput: React.FC<TranslatableInputProps> = ({
  label,
  name,
  value,
  translations = {},
  currentLocale,
  onChange,
  type = 'text',
  required = false,
  placeholder,
  rows = 4,
  className = '',
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    onChange(e.target.value, currentLocale);
  };

  // Get the current value based on locale
  const getCurrentValue = () => {
    if (currentLocale === 'en') {
      return value;
    }
    return translations[currentLocale] || '';
  };

  const inputClassName = `
    mt-1 block w-full rounded-md border-gray-300 shadow-sm
    focus:border-blue-500 focus:ring-blue-500 sm:text-sm
    ${currentLocale === 'ar' ? 'text-right' : 'text-left'}
    ${className}
  `;

  return (
    <div>
      <label htmlFor={`${name}-${currentLocale}`} className="block text-sm font-medium text-gray-700">
        {label}
        {required && currentLocale === 'en' && <span className="text-red-500 ml-1">*</span>}
        {currentLocale !== 'en' && (
          <span className="ml-2 text-xs text-gray-500">(Optional)</span>
        )}
      </label>
      {type === 'textarea' ? (
        <textarea
          id={`${name}-${currentLocale}`}
          name={`${name}-${currentLocale}`}
          value={getCurrentValue()}
          onChange={handleChange}
          rows={rows}
          required={required && currentLocale === 'en'}
          placeholder={placeholder}
          className={inputClassName}
          dir={currentLocale === 'ar' ? 'rtl' : 'ltr'}
        />
      ) : (
        <input
          type="text"
          id={`${name}-${currentLocale}`}
          name={`${name}-${currentLocale}`}
          value={getCurrentValue()}
          onChange={handleChange}
          required={required && currentLocale === 'en'}
          placeholder={placeholder}
          className={inputClassName}
          dir={currentLocale === 'ar' ? 'rtl' : 'ltr'}
        />
      )}
      {currentLocale === 'ar' && !getCurrentValue() && value && (
        <p className="mt-1 text-xs text-gray-500">
          English value: {value.substring(0, 50)}{value.length > 50 ? '...' : ''}
        </p>
      )}
    </div>
  );
};

export default TranslatableInput;
