import React, { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCreateProductMutation, useUpdateProductMutation, useGetCategoriesQuery } from '../../services/api';
import type { Product } from '../../types';
import toast from 'react-hot-toast';
import LanguageTabs from './LanguageTabs';
import TranslatableInput from './TranslatableInput';

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  product?: Product | null;
  mode: 'create' | 'edit' | 'view';
}

export const ProductModal: React.FC<ProductModalProps> = ({ isOpen, onClose, product, mode }) => {
  const [createProduct, { isLoading: isCreating }] = useCreateProductMutation();
  const [updateProduct, { isLoading: isUpdating }] = useUpdateProductMutation();
  const { data: categories = [] } = useGetCategoriesQuery({ active: true, type: 'product' });

  // Add locale state
  const [currentLocale, setCurrentLocale] = useState<'en' | 'ar'>('en');

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    details: '',
    image: '',
    price: 0,
    category_id: null as number | null,
    in_stock: true,
    is_active: true,
    is_featured: false,
    stock_quantity: 0,
    sku: '',
    // Add translation fields
    name_translations: { ar: '' },
    description_translations: { ar: '' },
    details_translations: { ar: '' },
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');

  useEffect(() => {
    if (product && mode !== 'create') {
      setFormData({
        name: product.name,
        description: product.description,
        details: product.details || '',
        image: product.image || '',
        price: Number(product.price),
        category_id: product.category_id || null,
        in_stock: product.in_stock,
        is_active: product.is_active,
        is_featured: product.is_featured,
        stock_quantity: product.stock_quantity,
        sku: product.sku || '',
        // Load translations if available
        name_translations: (product as any).name_translations || { ar: '' },
        description_translations: (product as any).description_translations || { ar: '' },
        details_translations: (product as any).details_translations || { ar: '' },
      });
      // Set image preview from existing product
      if ((product as any).image_url) {
        setImagePreview((product as any).image_url);
      }
      setImageFile(null);
    } else if (mode === 'create') {
      setFormData({
        name: '',
        description: '',
        details: '',
        image: '',
        price: 0,
        category_id: null,
        in_stock: true,
        is_active: true,
        is_featured: false,
        stock_quantity: 0,
        sku: '',
        name_translations: { ar: '' },
        description_translations: { ar: '' },
        details_translations: { ar: '' },
      });
      setImageFile(null);
      setImagePreview('');
    }
  }, [product, mode]);

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
      submitData.append('in_stock', formData.in_stock ? '1' : '0');
      submitData.append('is_active', formData.is_active ? '1' : '0');
      submitData.append('is_featured', formData.is_featured ? '1' : '0');
      submitData.append('stock_quantity', formData.stock_quantity.toString());

      if (formData.category_id) {
        submitData.append('category_id', formData.category_id.toString());
      }
      if (formData.sku) {
        submitData.append('sku', formData.sku);
      }

      // Add image file if selected
      if (imageFile) {
        submitData.append('image', imageFile);
      }

      // Add translations
      submitData.append('name_translations', JSON.stringify(formData.name_translations));
      submitData.append('description_translations', JSON.stringify(formData.description_translations));
      submitData.append('details_translations', JSON.stringify(formData.details_translations));

      if (mode === 'create') {
        await createProduct(submitData).unwrap();
        toast.success('Product created successfully');
      } else {
        // For update with FormData, we need to use POST with _method spoofing
        submitData.append('_method', 'PUT');
        await updateProduct({ id: product!.id, data: submitData }).unwrap();
        toast.success('Product updated successfully');
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
        toast.error(`Failed to ${mode} product`);
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;

    if (type === 'checkbox') {
      setFormData(prev => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }));
    } else if (type === 'number') {
      setFormData(prev => ({ ...prev, [name]: Number(value) }));
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
                  {mode === 'create' ? 'Add New Product' : mode === 'edit' ? 'Edit Product' : 'Product Details'}
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
                  label="Product Name"
                  name="name"
                  value={formData.name}
                  translations={formData.name_translations}
                  currentLocale={currentLocale}
                  onChange={(value, locale) => handleTranslatableChange('name', value, locale)}
                  required
                  placeholder="Enter product name"
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
                  placeholder="Enter product description"
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

                {/* Non-translatable fields only show when on English tab */}
                {currentLocale === 'en' && (
                  <>
                {/* Price and Stock */}
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
                      Stock Quantity *
                    </label>
                    <input
                      type="number"
                      name="stock_quantity"
                      value={formData.stock_quantity}
                      onChange={handleChange}
                      disabled={isViewMode}
                      required
                      min="0"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-100"
                    />
                  </div>
                </div>

                {/* SKU and Category */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      SKU
                    </label>
                    <input
                      type="text"
                      name="sku"
                      value={formData.sku}
                      onChange={handleChange}
                      disabled={isViewMode}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-100"
                    />
                  </div>
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
                </div>

                {/* Image Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Product Image
                  </label>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/jpg,image/gif,image/webp"
                    onChange={handleImageChange}
                    disabled={isViewMode}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-100"
                  />
                  {imagePreview && (
                    <div className="mt-3">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-32 h-32 object-cover rounded-lg border border-gray-200"
                      />
                    </div>
                  )}
                </div>

                {/* Checkboxes */}
                <div className="grid grid-cols-3 gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      name="in_stock"
                      checked={formData.in_stock}
                      onChange={handleChange}
                      disabled={isViewMode}
                      className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                    />
                    <span className="text-sm text-gray-700">In Stock</span>
                  </label>
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
                      {mode === 'create' ? 'Create Product' : 'Update Product'}
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
