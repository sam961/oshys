import React, { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCreateSocialInitiativeMutation, useUpdateSocialInitiativeMutation, useGetCategoriesQuery } from '../../services/api';
import type { SocialInitiative } from '../../types';
import toast from 'react-hot-toast';
import LanguageTabs from './LanguageTabs';
import TranslatableInput from './TranslatableInput';

interface InitiativeModalProps {
  isOpen: boolean;
  onClose: () => void;
  initiative?: SocialInitiative | null;
  mode: 'create' | 'edit' | 'view';
}

export const InitiativeModal: React.FC<InitiativeModalProps> = ({ isOpen, onClose, initiative, mode }) => {
  const [createInitiative, { isLoading: isCreating }] = useCreateSocialInitiativeMutation();
  const [updateInitiative, { isLoading: isUpdating }] = useUpdateSocialInitiativeMutation();
  const { data: categories = [] } = useGetCategoriesQuery({ active: true });

  const [currentLocale, setCurrentLocale] = useState<'en' | 'ar'>('en');

  const [formData, setFormData] = useState({
    title: '',
    excerpt: '',
    content: '',
    image: '',
    category_id: null as number | null,
    is_published: false,
    is_featured: false,
    published_at: '',
    title_translations: { ar: '' },
    excerpt_translations: { ar: '' },
    content_translations: { ar: '' },
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');

  useEffect(() => {
    if (initiative && mode !== 'create') {
      setFormData({
        title: initiative.title,
        excerpt: initiative.excerpt,
        content: initiative.content,
        image: initiative.image || '',
        category_id: initiative.category_id || null,
        is_published: initiative.is_published,
        is_featured: initiative.is_featured,
        published_at: initiative.published_at ? initiative.published_at.split('T')[0] : '',
        title_translations: (initiative as any).title_translations || { ar: '' },
        excerpt_translations: (initiative as any).excerpt_translations || { ar: '' },
        content_translations: (initiative as any).content_translations || { ar: '' },
      });
      if (initiative.image_url) {
        setImagePreview(initiative.image_url);
      }
      setImageFile(null);
    } else if (mode === 'create') {
      setFormData({
        title: '',
        excerpt: '',
        content: '',
        image: '',
        category_id: null,
        is_published: false,
        is_featured: false,
        published_at: '',
        title_translations: { ar: '' },
        excerpt_translations: { ar: '' },
        content_translations: { ar: '' },
      });
      setImageFile(null);
      setImagePreview('');
    }
  }, [initiative, mode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (mode === 'view') {
      onClose();
      return;
    }

    try {
      const submitData = new FormData();

      submitData.append('title', formData.title);
      submitData.append('excerpt', formData.excerpt);
      submitData.append('content', formData.content);
      submitData.append('is_published', formData.is_published ? '1' : '0');
      submitData.append('is_featured', formData.is_featured ? '1' : '0');

      if (formData.category_id) {
        submitData.append('category_id', formData.category_id.toString());
      }
      if (formData.published_at) {
        submitData.append('published_at', formData.published_at);
      }

      if (imageFile) {
        submitData.append('image', imageFile);
      }

      submitData.append('title_translations', JSON.stringify(formData.title_translations));
      submitData.append('excerpt_translations', JSON.stringify(formData.excerpt_translations));
      submitData.append('content_translations', JSON.stringify(formData.content_translations));

      if (mode === 'create') {
        await createInitiative(submitData).unwrap();
        toast.success('Initiative created successfully');
      } else {
        submitData.append('_method', 'PUT');
        await updateInitiative({ id: initiative!.id, data: submitData }).unwrap();
        toast.success('Initiative updated successfully');
      }
      onClose();
    } catch (error: any) {
      console.error(`${mode} error:`, error);

      if (error?.data?.errors) {
        const errors = Object.values(error.data.errors).flat();
        errors.forEach((err: any) => toast.error(err));
      } else if (error?.data?.message) {
        toast.error(error.data.message);
      } else {
        toast.error(`Failed to ${mode} initiative`);
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;

    if (type === 'checkbox') {
      setFormData(prev => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }));
    } else if (name === 'category_id') {
      setFormData(prev => ({ ...prev, [name]: value === '' ? null : Number(value) }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

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

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
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
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900">
                  {mode === 'create' ? 'Add New Initiative' : mode === 'edit' ? 'Edit Initiative' : 'Initiative Details'}
                </h2>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                {!isViewMode && (
                  <LanguageTabs
                    activeLocale={currentLocale}
                    onLocaleChange={setCurrentLocale}
                  />
                )}

                <TranslatableInput
                  label="Title"
                  name="title"
                  value={formData.title}
                  translations={formData.title_translations}
                  currentLocale={currentLocale}
                  onChange={(value, locale) => handleTranslatableChange('title', value, locale)}
                  required
                  placeholder="Enter initiative title"
                />

                <TranslatableInput
                  label="Excerpt"
                  name="excerpt"
                  value={formData.excerpt}
                  translations={formData.excerpt_translations}
                  currentLocale={currentLocale}
                  onChange={(value, locale) => handleTranslatableChange('excerpt', value, locale)}
                  type="textarea"
                  required
                  rows={2}
                  placeholder="Enter a brief excerpt"
                />

                <TranslatableInput
                  label="Content"
                  name="content"
                  value={formData.content}
                  translations={formData.content_translations}
                  currentLocale={currentLocale}
                  onChange={(value, locale) => handleTranslatableChange('content', value, locale)}
                  type="textarea"
                  required
                  rows={8}
                  placeholder="Enter full initiative content"
                />

                {currentLocale === 'en' && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
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
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Published Date
                        </label>
                        <input
                          type="date"
                          name="published_at"
                          value={formData.published_at}
                          onChange={handleChange}
                          disabled={isViewMode}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-100"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Featured Image
                      </label>
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/jpg,image/gif,image/webp"
                        onChange={handleImageChange}
                        disabled={isViewMode}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-100"
                      />
                      <div className="mt-3">
                        <img
                          src={imagePreview || '/placeholder.svg'}
                          alt="Preview"
                          className="w-32 h-32 object-cover rounded-lg border border-gray-200"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          name="is_published"
                          checked={formData.is_published}
                          onChange={handleChange}
                          disabled={isViewMode}
                          className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                        />
                        <span className="text-sm text-gray-700">Published</span>
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
                  </>
                )}

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
                      {mode === 'create' ? 'Create Initiative' : 'Update Initiative'}
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
