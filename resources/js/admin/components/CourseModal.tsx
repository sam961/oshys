import React, { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCreateCourseMutation, useUpdateCourseMutation, useGetCategoriesQuery } from '../../services/api';
import type { Course } from '../../types';
import toast from 'react-hot-toast';
import TranslatableField from './TranslatableField';
import { ImageUploadWithCrop, IMAGE_GUIDELINES } from './ImageUploadWithCrop';

interface CourseModalProps {
  isOpen: boolean;
  onClose: () => void;
  course?: Course | null;
  mode: 'create' | 'edit' | 'view';
}

export const CourseModal: React.FC<CourseModalProps> = ({ isOpen, onClose, course, mode }) => {
  const [createCourse, { isLoading: isCreating }] = useCreateCourseMutation();
  const [updateCourse, { isLoading: isUpdating }] = useUpdateCourseMutation();
  const { data: categories = [] } = useGetCategoriesQuery({ active: true, type: 'course' });

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image: '',
    price: 0,
    duration: '',
    level: '' as string,
    category_id: null as number | null,
    is_active: true,
    is_featured: false,
    max_students: null as number | null,
    requirements: [] as string[],
    name_translations: { ar: '' },
    description_translations: { ar: '' },
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');

  useEffect(() => {
    if (course && mode !== 'create') {
      setFormData({
        name: course.name,
        description: course.description,
        image: course.image || '',
        price: Number(course.price),
        duration: course.duration || '',
        level: course.level || '',
        category_id: course.category_id || null,
        is_active: course.is_active,
        is_featured: course.is_featured,
        max_students: course.max_students || null,
        requirements: course.requirements || [],
        name_translations: (course as any).name_translations || { ar: '' },
        description_translations: (course as any).description_translations || { ar: '' },
      });
      // Set image preview from existing course
      if ((course as any).image_url) {
        setImagePreview((course as any).image_url);
      }
      setImageFile(null);
    } else if (mode === 'create') {
      setFormData({
        name: '',
        description: '',
        image: '',
        price: 0,
        duration: '',
        level: '',
        category_id: null,
        is_active: true,
        is_featured: false,
        max_students: null,
        requirements: [],
        name_translations: { ar: '' },
        description_translations: { ar: '' },
      });
      setImageFile(null);
      setImagePreview('');
    }
  }, [course, mode]);

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
      submitData.append('price', formData.price.toString());
      if (formData.duration) submitData.append('duration', formData.duration);
      if (formData.level) submitData.append('level', formData.level);
      submitData.append('is_active', formData.is_active ? '1' : '0');
      submitData.append('is_featured', formData.is_featured ? '1' : '0');

      if (formData.category_id) {
        submitData.append('category_id', formData.category_id.toString());
      }
      if (formData.max_students) {
        submitData.append('max_students', formData.max_students.toString());
      }

      // Add image file if selected
      if (imageFile) {
        submitData.append('image', imageFile);
      }

      // Add requirements as JSON string
      submitData.append('requirements', JSON.stringify(formData.requirements));

      // Add translations
      submitData.append('name_translations', JSON.stringify(formData.name_translations));
      submitData.append('description_translations', JSON.stringify(formData.description_translations));

      if (mode === 'create') {
        await createCourse(submitData).unwrap();
        toast.success('Course created successfully');
      } else {
        // For update with FormData, we need to use POST with _method spoofing
        submitData.append('_method', 'PUT');
        await updateCourse({ id: course!.id, data: submitData }).unwrap();
        toast.success('Course updated successfully');
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
        toast.error(`Failed to ${mode} course`);
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
                  {mode === 'create' ? 'Add New Course' : mode === 'edit' ? 'Edit Course' : 'Course Details'}
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
                  label="Course Name"
                  name="name"
                  value={formData.name}
                  translationValue={formData.name_translations.ar}
                  onChangeEnglish={(value) => setFormData(prev => ({ ...prev, name: value }))}
                  onChangeArabic={(value) => setFormData(prev => ({ ...prev, name_translations: { ...prev.name_translations, ar: value } }))}
                  required
                  placeholder="Enter course name"
                  placeholderAr="أدخل اسم الدورة"
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
                  placeholder="Enter course description"
                  placeholderAr="أدخل وصف الدورة"
                  disabled={isViewMode}
                />

                {/* Price and Duration */}
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
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-base placeholder:text-gray-400 disabled:bg-gray-100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Duration
                    </label>
                    <input
                      type="text"
                      name="duration"
                      value={formData.duration}
                      onChange={handleChange}
                      disabled={isViewMode}
                      placeholder="e.g. 4 weeks"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-base placeholder:text-gray-400 disabled:bg-gray-100"
                    />
                  </div>
                </div>

                {/* Level and Max Students */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Level
                    </label>
                    <select
                      name="level"
                      value={formData.level}
                      onChange={handleChange}
                      disabled={isViewMode}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-base placeholder:text-gray-400 disabled:bg-gray-100"
                    >
                      <option value="">No Level</option>
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                      <option value="All Levels">All Levels</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Max Students
                    </label>
                    <input
                      type="number"
                      name="max_students"
                      value={formData.max_students || ''}
                      onChange={handleChange}
                      disabled={isViewMode}
                      min="1"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-base placeholder:text-gray-400 disabled:bg-gray-100"
                    />
                  </div>
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
                    Course Image
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
                      guideline={IMAGE_GUIDELINES.course}
                      disabled={isViewMode}
                    />
                  )}
                </div>

                {/* Checkboxes */}
                <div className="grid grid-cols-2 gap-4">
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
                      {mode === 'create' ? 'Create Course' : 'Update Course'}
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
