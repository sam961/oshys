import React, { useState } from 'react';
import RichTextEditor from './RichTextEditor';

interface TranslatableRichTextProps {
  label: string;
  name: string;
  value: string;
  translationValue: string;
  onChangeEnglish: (value: string) => void;
  onChangeArabic: (value: string) => void;
  required?: boolean;
  disabled?: boolean;
  minHeight?: string;
}

const TranslatableRichText: React.FC<TranslatableRichTextProps> = ({
  label,
  name,
  value,
  translationValue,
  onChangeEnglish,
  onChangeArabic,
  required = false,
  disabled = false,
  minHeight = '150px',
}) => {
  const [activeLocale, setActiveLocale] = useState<'en' | 'ar'>('en');

  return (
    <div className="space-y-2">
      {/* Label and Language Toggle */}
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
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

      {/* Editors - both mounted, toggled via CSS */}
      <div className={activeLocale === 'en' ? '' : 'hidden'}>
        <RichTextEditor
          content={value}
          onChange={onChangeEnglish}
          disabled={disabled}
          minHeight={minHeight}
          dir="ltr"
        />
      </div>
      <div className={activeLocale === 'ar' ? '' : 'hidden'}>
        <RichTextEditor
          content={translationValue}
          onChange={onChangeArabic}
          disabled={disabled}
          minHeight={minHeight}
          dir="rtl"
        />
      </div>

      {/* Status indicators */}
      <div className="flex items-center gap-3 text-xs">
        <div className="flex items-center gap-1">
          <span className={`w-2 h-2 rounded-full ${value && value !== '<p></p>' ? 'bg-green-500' : 'bg-gray-300'}`} />
          <span className="text-gray-500">EN</span>
        </div>
        <div className="flex items-center gap-1">
          <span className={`w-2 h-2 rounded-full ${translationValue && translationValue !== '<p></p>' ? 'bg-green-500' : 'bg-gray-300'}`} />
          <span className="text-gray-500">AR</span>
        </div>
      </div>
    </div>
  );
};

export default TranslatableRichText;
