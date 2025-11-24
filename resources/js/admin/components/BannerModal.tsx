import React, { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCreateBannerMutation, useUpdateBannerMutation } from '../../services/api';
import type { Banner } from '../../types';
import toast from 'react-hot-toast';

interface BannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  banner?: Banner | null;
  mode: 'create' | 'edit' | 'view';
}

export const BannerModal: React.FC<BannerModalProps> = ({ isOpen, onClose, banner, mode }) => {
  const [createBanner, { isLoading: isCreating }] = useCreateBannerMutation();
  const [updateBanner, { isLoading: isUpdating }] = useUpdateBannerMutation();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image: '',
    button_text: '',
    button_link: '',
    position: 'hero' as 'hero' | 'secondary' | 'promo',
    display_order: 0,
    is_active: true,
    start_date: '',
    end_date: '',
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');

  useEffect(() => {
    if (banner && mode !== 'create') {
      setFormData({
        title: banner.title,
        description: banner.description || '',
        image: banner.image,
        button_text: banner.button_text || '',
        button_link: banner.button_link || '',
        position: banner.position,
        display_order: banner.display_order,
        is_active: banner.is_active,
        start_date: banner.start_date ? banner.start_date.split('T')[0] : '',
        end_date: banner.end_date ? banner.end_date.split('T')[0] : '',
      });
      // Set image preview from existing banner
      if ((banner as any).image_url) {
        setImagePreview((banner as any).image_url);
      }
      setImageFile(null);
    } else if (mode === 'create') {
      setFormData({
        title: '',
        description: '',
        image: '',
        button_text: '',
        button_link: '',
        position: 'hero',
        display_order: 0,
        is_active: true,
        start_date: '',
        end_date: '',
      });
      setImageFile(null);
      setImagePreview('');
    }
  }, [banner, mode]);

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
      submitData.append('title', formData.title);
      submitData.append('description', formData.description);
      submitData.append('position', formData.position);
      submitData.append('display_order', formData.display_order.toString());
      submitData.append('is_active', formData.is_active ? '1' : '0');

      if (formData.button_text) {
        submitData.append('button_text', formData.button_text);
      }
      if (formData.button_link) {
        submitData.append('button_link', formData.button_link);
      }
      if (formData.start_date) {
        submitData.append('start_date', formData.start_date);
      }
      if (formData.end_date) {
        submitData.append('end_date', formData.end_date);
      }

      // Add image file if selected
      if (imageFile) {
        submitData.append('image', imageFile);
      }

      if (mode === 'create') {
        await createBanner(submitData).unwrap();
        toast.success('Banner created successfully');
      } else {
        // For update with FormData, we need to use POST with _method spoofing
        submitData.append('_method', 'PUT');
        await updateBanner({ id: banner!.id, data: submitData }).unwrap();
        toast.success('Banner updated successfully');
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
        toast.error(`Failed to ${mode} banner`);
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;

    if (type === 'checkbox') {
      setFormData(prev => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }));
    } else if (type === 'number') {
      setFormData(prev => ({ ...prev, [name]: Number(value) }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  // Handle image file selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
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
                  {mode === 'create' ? 'Add New Banner' : mode === 'edit' ? 'Edit Banner' : 'Banner Details'}
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
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Banner Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    disabled={isViewMode}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-100"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    disabled={isViewMode}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-100"
                  />
                </div>

                {/* Image Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Banner Image *
                  </label>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/jpg,image/gif,image/webp"
                    onChange={handleImageChange}
                    disabled={isViewMode}
                    required={mode === 'create'}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-100"
                  />
                  <div className="mt-3">
                    <img
                      src={imagePreview || '/placeholder.svg'}
                      alt="Preview"
                      className="w-full h-48 object-cover rounded-lg border border-gray-200"
                    />
                  </div>
                </div>

                {/* Button Text and Link */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Button Text
                    </label>
                    <input
                      type="text"
                      name="button_text"
                      value={formData.button_text}
                      onChange={handleChange}
                      disabled={isViewMode}
                      placeholder="e.g. Learn More"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Button Link
                    </label>
                    <input
                      type="text"
                      name="button_link"
                      value={formData.button_link}
                      onChange={handleChange}
                      disabled={isViewMode}
                      placeholder="/courses"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-100"
                    />
                  </div>
                </div>

                {/* Position and Display Order */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Position *
                    </label>
                    <select
                      name="position"
                      value={formData.position}
                      onChange={handleChange}
                      disabled={isViewMode}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-100"
                    >
                      <option value="hero">Hero Banner (Main)</option>
                      <option value="secondary">Secondary Banner</option>
                      <option value="promo">Promotional Banner</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Display Order
                    </label>
                    <input
                      type="number"
                      name="display_order"
                      value={formData.display_order}
                      onChange={handleChange}
                      disabled={isViewMode}
                      min="0"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-100"
                    />
                  </div>
                </div>

                {/* Start and End Date */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Start Date
                    </label>
                    <input
                      type="date"
                      name="start_date"
                      value={formData.start_date}
                      onChange={handleChange}
                      disabled={isViewMode}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      End Date
                    </label>
                    <input
                      type="date"
                      name="end_date"
                      value={formData.end_date}
                      onChange={handleChange}
                      disabled={isViewMode}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-100"
                    />
                  </div>
                </div>

                {/* Active Checkbox */}
                <div>
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
                      {mode === 'create' ? 'Create Banner' : 'Update Banner'}
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
