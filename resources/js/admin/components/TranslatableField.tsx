import React, { useState } from 'react';

interface TranslatableFieldProps {
  label: string;
  name: string;
  value: string;
  translationValue: string;
  onChangeEnglish: (value: string) => void;
  onChangeArabic: (value: string) => void;
  type?: 'text' | 'textarea';
  required?: boolean;
  placeholder?: string;
  placeholderAr?: string;
  rows?: number;
  disabled?: boolean;
  className?: string;
}

const TranslatableField: React.FC<TranslatableFieldProps> = ({
  label,
  name,
  value,
  translationValue,
  onChangeEnglish,
  onChangeArabic,
  type = 'text',
  required = false,
  placeholder,
  placeholderAr,
  rows = 4,
  disabled = false,
  className = '',
}) => {
  const [activeLocale, setActiveLocale] = useState<'en' | 'ar'>('en');

  const currentValue = activeLocale === 'en' ? value : translationValue;
  const currentPlaceholder = activeLocale === 'en'
    ? placeholder
    : (placeholderAr || placeholder);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (activeLocale === 'en') {
      onChangeEnglish(e.target.value);
    } else {
      onChangeArabic(e.target.value);
    }
  };

  const inputClassName = `
    w-full px-4 py-3 rounded-lg border border-gray-300 shadow-sm
    focus:border-primary-500 focus:ring-2 focus:ring-primary-500 focus:ring-opacity-20
    text-base placeholder:text-gray-400 disabled:bg-gray-100
    ${activeLocale === 'ar' ? 'text-right' : 'text-left'}
    ${className}
  `;


  return (
    <div className="space-y-2">
      {/* Label and Language Toggle Row */}
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>

        {/* Language Segment Control */}
        <div className="flex items-center bg-gray-100 rounded-lg p-0.5">
          <button
            type="button"
            onClick={() => setActiveLocale('en')}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-all duration-200 ${
              activeLocale === 'en'
                ? 'bg-white text-primary-600 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            EN
          </button>
          <button
            type="button"
            onClick={() => setActiveLocale('ar')}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-all duration-200 ${
              activeLocale === 'ar'
                ? 'bg-white text-primary-600 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            AR
          </button>
        </div>
      </div>

      {/* Input Field */}
      <div className="relative">
        {type === 'textarea' ? (
          <textarea
            id={`${name}-${activeLocale}`}
            name={`${name}-${activeLocale}`}
            value={currentValue}
            onChange={handleChange}
            rows={rows}
            required={required && activeLocale === 'en'}
            placeholder={currentPlaceholder}
            disabled={disabled}
            className={inputClassName}
            dir={activeLocale === 'ar' ? 'rtl' : 'ltr'}
          />
        ) : (
          <input
            type="text"
            id={`${name}-${activeLocale}`}
            name={`${name}-${activeLocale}`}
            value={currentValue}
            onChange={handleChange}
            required={required && activeLocale === 'en'}
            placeholder={currentPlaceholder}
            disabled={disabled}
            className={inputClassName}
            dir={activeLocale === 'ar' ? 'rtl' : 'ltr'}
          />
        )}

        {/* Language indicator badge */}
        <div className={`absolute top-2 ${activeLocale === 'ar' ? 'left-2' : 'right-2'} pointer-events-none`}>
          <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${
            activeLocale === 'en'
              ? 'bg-blue-50 text-blue-600'
              : 'bg-emerald-50 text-emerald-600'
          }`}>
            {activeLocale === 'en' ? 'English' : 'العربية'}
          </span>
        </div>
      </div>


      {/* Status indicators */}
      <div className="flex items-center gap-3 text-xs">
        <div className="flex items-center gap-1">
          <span className={`w-2 h-2 rounded-full ${value ? 'bg-green-500' : 'bg-gray-300'}`}></span>
          <span className="text-gray-500">EN</span>
        </div>
        <div className="flex items-center gap-1">
          <span className={`w-2 h-2 rounded-full ${translationValue ? 'bg-green-500' : 'bg-gray-300'}`}></span>
          <span className="text-gray-500">AR</span>
        </div>
      </div>
    </div>
  );
};

export default TranslatableField;
