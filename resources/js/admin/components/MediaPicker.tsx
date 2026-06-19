import React, { useState } from 'react';
import { X, Loader2, ImageOff, Check } from 'lucide-react';
import { useGetMediaQuery } from '../../services/api';
import type { MediaItem } from '../../types';

interface MediaPickerProps {
  isOpen: boolean;
  onClose: () => void;
  /** Called with the chosen image when the user confirms a selection. */
  onSelect: (item: MediaItem) => void;
}

/**
 * Modal that lists previously-uploaded images across the site so an admin can
 * reuse one (e.g. as a blog featured image) instead of re-uploading.
 */
export const MediaPicker: React.FC<MediaPickerProps> = ({ isOpen, onClose, onSelect }) => {
  const { data, isLoading, isError } = useGetMediaQuery(undefined, { skip: !isOpen });
  const [selected, setSelected] = useState<MediaItem | null>(null);

  if (!isOpen) return null;

  const images = data?.data ?? [];

  const handleConfirm = () => {
    if (selected) {
      onSelect(selected);
      setSelected(null);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Panel */}
      <div className="relative w-full max-w-4xl max-h-[85vh] bg-white rounded-xl shadow-xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Choose from media library</h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-16 text-gray-500">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
          ) : isError ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-500">
              <ImageOff className="w-8 h-8 mb-2" />
              <p>Could not load the media library.</p>
            </div>
          ) : images.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-500">
              <ImageOff className="w-8 h-8 mb-2" />
              <p>No images uploaded yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {images.map((item) => {
                const isActive = selected?.path === item.path;
                return (
                  <button
                    type="button"
                    key={item.path}
                    onClick={() => setSelected(item)}
                    className={`group relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                      isActive ? 'border-primary-500 ring-2 ring-primary-200' : 'border-transparent hover:border-gray-300'
                    }`}
                    title={item.name}
                  >
                    <img
                      src={item.url}
                      alt={item.name}
                      loading="lazy"
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute bottom-0 inset-x-0 bg-black/50 text-white text-[10px] px-1.5 py-0.5 truncate">
                      {item.folder}
                    </span>
                    {isActive && (
                      <span className="absolute top-1.5 right-1.5 bg-primary-600 text-white rounded-full p-1">
                        <Check className="w-3 h-3" />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={!selected}
            className="px-4 py-2 rounded-lg bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Use selected image
          </button>
        </div>
      </div>
    </div>
  );
};
