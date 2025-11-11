import React, { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCreateBlogPostMutation, useUpdateBlogPostMutation, useGetCategoriesQuery } from '../../services/api';
import type { BlogPost } from '../../types';
import toast from 'react-hot-toast';
import LanguageTabs from './LanguageTabs';
import TranslatableInput from './TranslatableInput';

interface BlogModalProps {
  isOpen: boolean;
  onClose: () => void;
  blogPost?: BlogPost | null;
  mode: 'create' | 'edit' | 'view';
}

export const BlogModal: React.FC<BlogModalProps> = ({ isOpen, onClose, blogPost, mode }) => {
  const [createBlogPost, { isLoading: isCreating }] = useCreateBlogPostMutation();
  const [updateBlogPost, { isLoading: isUpdating }] = useUpdateBlogPostMutation();
  const { data: categories = [] } = useGetCategoriesQuery({ active: true, type: 'blog' });

  // Add locale state
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
    // Add translation fields
    title_translations: { ar: '' },
    excerpt_translations: { ar: '' },
    content_translations: { ar: '' },
  });

  useEffect(() => {
    if (blogPost && mode !== 'create') {
      setFormData({
        title: blogPost.title,
        excerpt: blogPost.excerpt,
        content: blogPost.content,
        image: blogPost.image || '',
        category_id: blogPost.category_id || null,
        is_published: blogPost.is_published,
        is_featured: blogPost.is_featured,
        published_at: blogPost.published_at ? blogPost.published_at.split('T')[0] : '',
        // Load translations if available
        title_translations: (blogPost as any).title_translations || { ar: '' },
        excerpt_translations: (blogPost as any).excerpt_translations || { ar: '' },
        content_translations: (blogPost as any).content_translations || { ar: '' },
      });
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
    }
  }, [blogPost, mode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (mode === 'view') {
      onClose();
      return;
    }

    try {
      if (mode === 'create') {
        await createBlogPost(formData).unwrap();
        toast.success('Blog post created successfully');
      } else {
        await updateBlogPost({ id: blogPost!.id, data: formData }).unwrap();
        toast.success('Blog post updated successfully');
      }
      onClose();
    } catch (error) {
      toast.error(`Failed to ${mode} blog post`);
      console.error(`${mode} error:`, error);
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
            <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900">
                  {mode === 'create' ? 'Add New Blog Post' : mode === 'edit' ? 'Edit Blog Post' : 'Blog Post Details'}
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
                  label="Title"
                  name="title"
                  value={formData.title}
                  translations={formData.title_translations}
                  currentLocale={currentLocale}
                  onChange={(value, locale) => handleTranslatableChange('title', value, locale)}
                  required
                  placeholder="Enter blog post title"
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
                  placeholder="Enter full blog post content"
                />

                {/* Non-translatable fields only show when on English tab */}
                {currentLocale === 'en' && (
                  <>
                {/* Category and Published Date */}
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

                {/* Image URL */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Featured Image URL
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
                      {mode === 'create' ? 'Create Post' : 'Update Post'}
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
