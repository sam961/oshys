import React, { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCreateTripMutation, useUpdateTripMutation, useGetCategoriesQuery } from '../../services/api';
import type { Trip } from '../../types';
import toast from 'react-hot-toast';
import TranslatableField from './TranslatableField';
import { ImageUploadWithCrop, IMAGE_GUIDELINES } from './ImageUploadWithCrop';

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
    number_of_dives: null as number | null,
    included_items: [] as string[],
    // Add translation fields
    name_translations: { ar: '' },
    description_translations: { ar: '' },
    details_translations: { ar: '' },
    location_translations: { ar: '' },
    duration_translations: { ar: '' },
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');

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
        number_of_dives: trip.number_of_dives || null,
        included_items: trip.included_items || [],
        // Load translations if available
        name_translations: (trip as any).name_translations || { ar: '' },
        description_translations: (trip as any).description_translations || { ar: '' },
        details_translations: (trip as any).details_translations || { ar: '' },
        location_translations: (trip as any).location_translations || { ar: '' },
        duration_translations: (trip as any).duration_translations || { ar: '' },
      });
      // Set image preview from existing trip
      if ((trip as any).image_url) {
        setImagePreview((trip as any).image_url);
      }
      setImageFile(null);
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
        number_of_dives: null,
        included_items: [],
        name_translations: { ar: '' },
        description_translations: { ar: '' },
        details_translations: { ar: '' },
        location_translations: { ar: '' },
        duration_translations: { ar: '' },
      });
      setImageFile(null);
      setImagePreview('');
    }
  }, [trip, mode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (mode === 'view') {
      onClose();
      return;
    }

    try {
      // Create FormData for file upload
      const submitData = new FormData();

      // Add all form fields to FormData
      submitData.append('name', formData.name);
      submitData.append('description', formData.description);
      submitData.append('details', formData.details);
      submitData.append('price', formData.price.toString());
      submitData.append('location', formData.location);
      submitData.append('duration', formData.duration);
      submitData.append('difficulty', formData.difficulty);
      submitData.append('is_active', formData.is_active ? '1' : '0');
      submitData.append('is_featured', formData.is_featured ? '1' : '0');
      submitData.append('certification_required', formData.certification_required ? '1' : '0');

      if (formData.category_id) {
        submitData.append('category_id', formData.category_id.toString());
      }
      if (formData.max_participants) {
        submitData.append('max_participants', formData.max_participants.toString());
      }
      if (formData.number_of_dives) {
        submitData.append('number_of_dives', formData.number_of_dives.toString());
      }
      if (formData.included_items.length > 0) {
        submitData.append('included_items', JSON.stringify(formData.included_items));
      }

      // Add image file if selected
      if (imageFile) {
        submitData.append('image', imageFile);
      }

      // Add translations
      submitData.append('name_translations', JSON.stringify(formData.name_translations));
      submitData.append('description_translations', JSON.stringify(formData.description_translations));
      submitData.append('details_translations', JSON.stringify(formData.details_translations));
      submitData.append('location_translations', JSON.stringify(formData.location_translations));
      submitData.append('duration_translations', JSON.stringify(formData.duration_translations));

      if (mode === 'create') {
        await createTrip(submitData).unwrap();
        toast.success('Trip created successfully');
      } else {
        // For update with FormData, we need to use POST with _method spoofing
        submitData.append('_method', 'PUT');
        await updateTrip({ id: trip!.id, data: submitData }).unwrap();
        toast.success('Trip updated successfully');
      }
      onClose();
    } catch (error: any) {
      console.error(`${mode} error:`, error);

      // Show specific validation errors if available
      if (error?.data?.errors) {
        const errors = Object.values(error.data.errors).flat();
        errors.forEach((err: any) => toast.error(err));
      } else if (error?.data?.message) {
        toast.error(error.data.message);
      } else {
        toast.error(`Failed to ${mode} trip`);
      }
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

  const handleImageCropped = (file: File, previewUrl: string) => {
    setImageFile(file);
    setImagePreview(previewUrl);
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
              <form onSubmit={handleSubmit} className="p-6 space-y-5">
                {/* Translatable Fields with per-field language toggle */}
                <TranslatableField
                  label="Trip Name"
                  name="name"
                  value={formData.name}
                  translationValue={formData.name_translations.ar}
                  onChangeEnglish={(value) => setFormData(prev => ({ ...prev, name: value }))}
                  onChangeArabic={(value) => setFormData(prev => ({ ...prev, name_translations: { ...prev.name_translations, ar: value } }))}
                  required
                  placeholder="Enter trip name"
                  placeholderAr="أدخل اسم الرحلة"
                  disabled={isViewMode}
                />

                <TranslatableField
                  label="Description"
                  name="description"
                  value={formData.description}
                  translationValue={formData.description_translations.ar}
                  onChangeEnglish={(value) => setFormData(prev => ({ ...prev, description: value }))}
                  onChangeArabic={(value) => setFormData(prev => ({ ...prev, description_translations: { ...prev.description_translations, ar: value } }))}
                  type="textarea"
                  required
                  rows={3}
                  placeholder="Enter trip description"
                  placeholderAr="أدخل وصف الرحلة"
                  disabled={isViewMode}
                />

                <TranslatableField
                  label="Details"
                  name="details"
                  value={formData.details}
                  translationValue={formData.details_translations.ar}
                  onChangeEnglish={(value) => setFormData(prev => ({ ...prev, details: value }))}
                  onChangeArabic={(value) => setFormData(prev => ({ ...prev, details_translations: { ...prev.details_translations, ar: value } }))}
                  type="textarea"
                  rows={3}
                  placeholder="Enter additional details"
                  placeholderAr="أدخل تفاصيل إضافية"
                  disabled={isViewMode}
                />

                {/* Location and Duration */}
                <div className="grid grid-cols-2 gap-4">
                  <TranslatableField
                    label="Location"
                    name="location"
                    value={formData.location}
                    translationValue={formData.location_translations.ar}
                    onChangeEnglish={(value) => setFormData(prev => ({ ...prev, location: value }))}
                    onChangeArabic={(value) => setFormData(prev => ({ ...prev, location_translations: { ...prev.location_translations, ar: value } }))}
                    required
                    placeholder="e.g. Red Sea"
                    placeholderAr="مثال: البحر الأحمر"
                    disabled={isViewMode}
                  />
                  <TranslatableField
                    label="Duration"
                    name="duration"
                    value={formData.duration}
                    translationValue={formData.duration_translations.ar}
                    onChangeEnglish={(value) => setFormData(prev => ({ ...prev, duration: value }))}
                    onChangeArabic={(value) => setFormData(prev => ({ ...prev, duration_translations: { ...prev.duration_translations, ar: value } }))}
                    required
                    placeholder="e.g. 3 days"
                    placeholderAr="مثال: ٣ أيام"
                    disabled={isViewMode}
                  />
                </div>

                {/* Price, Max Participants, Number of Dives */}
                <div className="grid grid-cols-3 gap-4">
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
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-base placeholder:text-gray-400 disabled:bg-gray-100"
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
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-base placeholder:text-gray-400 disabled:bg-gray-100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Number of Dives
                    </label>
                    <input
                      type="number"
                      name="number_of_dives"
                      value={formData.number_of_dives || ''}
                      onChange={handleChange}
                      disabled={isViewMode}
                      min="1"
                      placeholder="e.g. 4"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-base placeholder:text-gray-400 disabled:bg-gray-100"
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-base placeholder:text-gray-400 disabled:bg-gray-100"
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-base placeholder:text-gray-400 disabled:bg-gray-100"
                  >
                    <option value="">No Category</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                {/* Image Upload with Crop */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Trip Image
                  </label>
                  {isViewMode ? (
                    <div className="mt-3">
                      <img
                        src={imagePreview || '/placeholder.svg'}
                        alt="Preview"
                        className="w-full h-48 object-cover rounded-lg border border-gray-200"
                      />
                    </div>
                  ) : (
                    <ImageUploadWithCrop
                      onImageCropped={handleImageCropped}
                      currentPreview={imagePreview}
                      guideline={IMAGE_GUIDELINES.trip}
                      disabled={isViewMode}
                    />
                  )}
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
