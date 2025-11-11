import React, { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCreateTripMutation, useUpdateTripMutation, useGetCategoriesQuery } from '../../services/api';
import type { Trip } from '../../types';
import toast from 'react-hot-toast';
import LanguageTabs from './LanguageTabs';
import TranslatableInput from './TranslatableInput';

interface TripModalProps {
  isOpen: boolean;
  onClose: () => void;
  trip?: Trip | null;
  mode: 'create' | 'edit' | 'view';
}

export const TripModal: React.FC<TripModalProps> = ({ isOpen, onClose, trip, mode }) => {
  const [createTrip, { isLoading: isCreating }] = useCreateTripMutation();
  const [updateTrip, { isLoading: isUpdating }] = useUpdateTripMutation();
  const { data: categories = [] } = useGetCategoriesQuery({ active: true, type: 'trip' });

  // Add locale state
  const [currentLocale, setCurrentLocale] = useState<'en' | 'ar'>('en');

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    details: '',
    image: '',
    price: 0,
    location: '',
    duration: '',
    difficulty: 'Beginner' as 'Beginner' | 'Intermediate' | 'Advanced' | 'All Levels',
    category_id: null as number | null,
    is_active: true,
    is_featured: false,
    certification_required: false,
    max_participants: null as number | null,
    included_items: [] as string[],
    // Add translation fields
    name_translations: { ar: '' },
    description_translations: { ar: '' },
    details_translations: { ar: '' },
    location_translations: { ar: '' },
    duration_translations: { ar: '' },
  });

  useEffect(() => {
    if (trip && mode !== 'create') {
      setFormData({
        name: trip.name,
        description: trip.description,
        details: trip.details || '',
        image: trip.image || '',
        price: Number(trip.price),
        location: trip.location,
        duration: trip.duration,
        difficulty: trip.difficulty,
        category_id: trip.category_id || null,
        is_active: trip.is_active,
        is_featured: trip.is_featured,
        certification_required: trip.certification_required,
        max_participants: trip.max_participants || null,
        included_items: trip.included_items || [],
        // Load translations if available
        name_translations: (trip as any).name_translations || { ar: '' },
        description_translations: (trip as any).description_translations || { ar: '' },
        details_translations: (trip as any).details_translations || { ar: '' },
        location_translations: (trip as any).location_translations || { ar: '' },
        duration_translations: (trip as any).duration_translations || { ar: '' },
      });
    } else if (mode === 'create') {
      setFormData({
        name: '',
        description: '',
        details: '',
        image: '',
        price: 0,
        location: '',
        duration: '',
        difficulty: 'Beginner',
        category_id: null,
        is_active: true,
        is_featured: false,
        certification_required: false,
        max_participants: null,
        included_items: [],
        name_translations: { ar: '' },
        description_translations: { ar: '' },
        details_translations: { ar: '' },
        location_translations: { ar: '' },
        duration_translations: { ar: '' },
      });
    }
  }, [trip, mode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (mode === 'view') {
      onClose();
      return;
    }

    try {
      if (mode === 'create') {
        await createTrip(formData).unwrap();
        toast.success('Trip created successfully');
      } else {
        await updateTrip({ id: trip!.id, data: formData }).unwrap();
        toast.success('Trip updated successfully');
      }
      onClose();
    } catch (error) {
      toast.error(`Failed to ${mode} trip`);
      console.error(`${mode} error:`, error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;

    if (type === 'checkbox') {
      setFormData(prev => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }));
    } else if (type === 'number') {
      setFormData(prev => ({ ...prev, [name]: value === '' ? null : Number(value) }));
    } else if (name === 'category_id') {
      setFormData(prev => ({ ...prev, [name]: value === '' ? null : Number(value) }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  // Handle translatable field changes
  const handleTranslatableChange = (field: string, value: string, locale: 'en' | 'ar') => {
    if (locale === 'en') {
      setFormData(prev => ({ ...prev, [field]: value }));
    } else {
      setFormData(prev => ({
        ...prev,
        [`${field}_translations`]: {
          ...prev[`${field}_translations` as keyof typeof prev] as Record<string, string>,
          [locale]: value,
        },
      }));
    }
  };

  const isViewMode = mode === 'view';
  const isLoading = isCreating || isUpdating;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900">
                  {mode === 'create' ? 'Add New Trip' : mode === 'edit' ? 'Edit Trip' : 'Trip Details'}
                </h2>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                {/* Language Tabs */}
                {!isViewMode && (
                  <LanguageTabs
                    activeLocale={currentLocale}
                    onLocaleChange={setCurrentLocale}
                  />
                )}

                {/* Translatable Fields */}
                <TranslatableInput
                  label="Trip Name"
                  name="name"
                  value={formData.name}
                  translations={formData.name_translations}
                  currentLocale={currentLocale}
                  onChange={(value, locale) => handleTranslatableChange('name', value, locale)}
                  required
                  placeholder="Enter trip name"
                />

                <TranslatableInput
                  label="Description"
                  name="description"
                  value={formData.description}
                  translations={formData.description_translations}
                  currentLocale={currentLocale}
                  onChange={(value, locale) => handleTranslatableChange('description', value, locale)}
                  type="textarea"
                  required
                  rows={3}
                  placeholder="Enter trip description"
                />

                <TranslatableInput
                  label="Details"
                  name="details"
                  value={formData.details}
                  translations={formData.details_translations}
                  currentLocale={currentLocale}
                  onChange={(value, locale) => handleTranslatableChange('details', value, locale)}
                  type="textarea"
                  rows={3}
                  placeholder="Enter additional details"
                />

                {/* Location and Duration */}
                <div className="grid grid-cols-2 gap-4">
                  <TranslatableInput
                    label="Location"
                    name="location"
                    value={formData.location}
                    translations={formData.location_translations}
                    currentLocale={currentLocale}
                    onChange={(value, locale) => handleTranslatableChange('location', value, locale)}
                    required
                    placeholder="e.g. Red Sea"
                  />
                  <TranslatableInput
                    label="Duration"
                    name="duration"
                    value={formData.duration}
                    translations={formData.duration_translations}
                    currentLocale={currentLocale}
                    onChange={(value, locale) => handleTranslatableChange('duration', value, locale)}
                    required
                    placeholder="e.g. 3 days"
                  />
                </div>

                {/* Non-translatable fields only show when on English tab */}
                {currentLocale === 'en' && (
                  <>
                {/* Price and Max Participants */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Price (SAR) *
                    </label>
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleChange}
                      disabled={isViewMode}
                      required
                      step="0.01"
                      min="0"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Max Participants
                    </label>
                    <input
                      type="number"
                      name="max_participants"
                      value={formData.max_participants || ''}
                      onChange={handleChange}
                      disabled={isViewMode}
                      min="1"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-100"
                    />
                  </div>
                </div>

                {/* Difficulty */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Difficulty Level *
                  </label>
                  <select
                    name="difficulty"
                    value={formData.difficulty}
                    onChange={handleChange}
                    disabled={isViewMode}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-100"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                    <option value="All Levels">All Levels</option>
                  </select>
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <select
                    name="category_id"
                    value={formData.category_id || ''}
                    onChange={handleChange}
                    disabled={isViewMode}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-100"
                  >
                    <option value="">No Category</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                {/* Image URL */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Image URL
                  </label>
                  <input
                    type="url"
                    name="image"
                    value={formData.image}
                    onChange={handleChange}
                    disabled={isViewMode}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-100"
                  />
                </div>

                {/* Checkboxes */}
                <div className="grid grid-cols-3 gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      name="is_active"
                      checked={formData.is_active}
                      onChange={handleChange}
                      disabled={isViewMode}
                      className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                    />
                    <span className="text-sm text-gray-700">Active</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      name="is_featured"
                      checked={formData.is_featured}
                      onChange={handleChange}
                      disabled={isViewMode}
                      className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                    />
                    <span className="text-sm text-gray-700">Featured</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      name="certification_required"
                      checked={formData.certification_required}
                      onChange={handleChange}
                      disabled={isViewMode}
                      className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                    />
                    <span className="text-sm text-gray-700">Cert Required</span>
                  </label>
                </div>
                  </>
                )}

                {/* Actions */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    {isViewMode ? 'Close' : 'Cancel'}
                  </button>
                  {!isViewMode && (
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="px-6 py-2 bg-gradient-to-r from-primary-600 to-accent-600 text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50 flex items-center gap-2"
                    >
                      {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                      {mode === 'create' ? 'Create Trip' : 'Update Trip'}
                    </button>
                  )}
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
