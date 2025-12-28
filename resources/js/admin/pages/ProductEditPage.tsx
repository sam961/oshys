import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { FormSection } from '../components/FormSection';
import TranslatableField from '../components/TranslatableField';
import { ImageUploadWithCrop, IMAGE_GUIDELINES } from '../components/ImageUploadWithCrop';
import { useGetProductQuery, useGetCategoriesQuery, useCreateProductMutation, useUpdateProductMutation } from '../../services/api';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

interface FormData {
  name: string;
  description: string;
  details: string;
  price: number;
  category_id: number | null;
  in_stock: boolean;
  is_active: boolean;
  is_featured: boolean;
  stock_quantity: number;
  sku: string;
  name_translations: { ar: string };
  description_translations: { ar: string };
  details_translations: { ar: string };
}

const initialFormData: FormData = {
  name: '',
  description: '',
  details: '',
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
};

export const ProductEditPage: React.FC = () => {
  const { t } = useTranslation('admin');
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);

  const { data: product, isLoading: isLoadingProduct, error: productError } = useGetProductQuery(Number(id), {
    skip: !isEditMode,
  });
  const { data: categories = [] } = useGetCategoriesQuery({ active: true, type: 'product' });
  const [createProduct, { isLoading: isCreating }] = useCreateProductMutation();
  const [updateProduct, { isLoading: isUpdating }] = useUpdateProductMutation();

  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [isDirty, setIsDirty] = useState(false);
  const [initialData, setInitialData] = useState<FormData>(initialFormData);

  // Load product data when editing
  useEffect(() => {
    if (product && isEditMode) {
      const loadedData: FormData = {
        name: product.name,
        description: product.description,
        details: product.details || '',
        price: Number(product.price),
        category_id: product.category_id || null,
        in_stock: product.in_stock,
        is_active: product.is_active,
        is_featured: product.is_featured,
        stock_quantity: product.stock_quantity,
        sku: product.sku || '',
        name_translations: (product as any).name_translations || { ar: '' },
        description_translations: (product as any).description_translations || { ar: '' },
        details_translations: (product as any).details_translations || { ar: '' },
      };
      setFormData(loadedData);
      setInitialData(loadedData);
      if ((product as any).image_url) {
        setImagePreview((product as any).image_url);
      }
    }
  }, [product, isEditMode]);

  // Track dirty state
  useEffect(() => {
    const hasChanges = JSON.stringify(formData) !== JSON.stringify(initialData) || imageFile !== null;
    setIsDirty(hasChanges);
  }, [formData, initialData, imageFile]);

  // Warn on unsaved changes when navigating away
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  const handleBack = useCallback(() => {
    if (isDirty) {
      if (window.confirm('You have unsaved changes. Are you sure you want to leave?')) {
        navigate('/admin/products');
      }
    } else {
      navigate('/admin/products');
    }
  }, [isDirty, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const submitData = new FormData();

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

      if (imageFile) {
        submitData.append('image', imageFile);
      }

      submitData.append('name_translations', JSON.stringify(formData.name_translations));
      submitData.append('description_translations', JSON.stringify(formData.description_translations));
      submitData.append('details_translations', JSON.stringify(formData.details_translations));

      if (isEditMode) {
        submitData.append('_method', 'PUT');
        await updateProduct({ id: Number(id), data: submitData }).unwrap();
        toast.success('Product updated successfully');
      } else {
        await createProduct(submitData).unwrap();
        toast.success('Product created successfully');
      }

      navigate('/admin/products');
    } catch (error: any) {
      console.error('Save error:', error);

      if (error?.data?.errors) {
        const errors = Object.values(error.data.errors).flat();
        errors.forEach((err: any) => toast.error(err));
      } else if (error?.data?.message) {
        toast.error(error.data.message);
      } else {
        toast.error(`Failed to ${isEditMode ? 'update' : 'create'} product`);
      }
    }
  };

  const handleImageCropped = (file: File, previewUrl: string) => {
    setImageFile(file);
    setImagePreview(previewUrl);
  };

  const isLoading = isCreating || isUpdating;

  // Loading state
  if (isEditMode && isLoadingProduct) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  // Error state
  if (isEditMode && productError) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg">
        <h3 className="font-semibold mb-2">Product not found</h3>
        <p>The product you're looking for doesn't exist or has been deleted.</p>
        <button
          onClick={() => navigate('/admin/products')}
          className="mt-4 text-red-700 underline hover:no-underline"
        >
          Return to Products
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Breadcrumbs */}
      <Breadcrumbs
        items={[
          { label: 'Products', href: '/admin/products' },
          { label: isEditMode ? 'Edit Product' : 'New Product' },
        ]}
      />

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button
            onClick={handleBack}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {isEditMode ? 'Edit Product' : 'Add New Product'}
            </h1>
            {isEditMode && product && (
              <p className="text-gray-500 text-sm mt-1">
                Editing: {product.name}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleBack}
            className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-primary-600 to-accent-600 text-white rounded-lg hover:shadow-lg transition-all font-medium disabled:opacity-50"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {isEditMode ? 'Save Changes' : 'Create Product'}
          </button>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Basic Information */}
          <FormSection title="Basic Information" description="Product name, description, and category">
            <div className="space-y-5">
              <TranslatableField
                label="Product Name"
                name="name"
                value={formData.name}
                translationValue={formData.name_translations.ar}
                onChangeEnglish={(value) => setFormData(prev => ({ ...prev, name: value }))}
                onChangeArabic={(value) => setFormData(prev => ({ ...prev, name_translations: { ar: value } }))}
                required
                placeholder="Enter product name"
                placeholderAr="أدخل اسم المنتج"
              />

              <TranslatableField
                label="Description"
                name="description"
                value={formData.description}
                translationValue={formData.description_translations.ar}
                onChangeEnglish={(value) => setFormData(prev => ({ ...prev, description: value }))}
                onChangeArabic={(value) => setFormData(prev => ({ ...prev, description_translations: { ar: value } }))}
                type="textarea"
                required
                rows={3}
                placeholder="Enter product description"
                placeholderAr="أدخل وصف المنتج"
              />

              <TranslatableField
                label="Details"
                name="details"
                value={formData.details}
                translationValue={formData.details_translations.ar}
                onChangeEnglish={(value) => setFormData(prev => ({ ...prev, details: value }))}
                onChangeArabic={(value) => setFormData(prev => ({ ...prev, details_translations: { ar: value } }))}
                type="textarea"
                rows={3}
                placeholder="Enter additional details"
                placeholderAr="أدخل تفاصيل إضافية"
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  value={formData.category_id || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, category_id: e.target.value === '' ? null : Number(e.target.value) }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-base"
                >
                  <option value="">No Category</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </FormSection>

          {/* Pricing & Inventory */}
          <FormSection title="Pricing & Inventory" description="Price, stock, and SKU information">
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price (SAR) *
                </label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData(prev => ({ ...prev, price: Number(e.target.value) }))}
                  required
                  step="0.01"
                  min="0"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-base"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Stock Quantity *
                </label>
                <input
                  type="number"
                  value={formData.stock_quantity}
                  onChange={(e) => setFormData(prev => ({ ...prev, stock_quantity: Number(e.target.value) }))}
                  required
                  min="0"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-base"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  SKU
                </label>
                <input
                  type="text"
                  value={formData.sku}
                  onChange={(e) => setFormData(prev => ({ ...prev, sku: e.target.value }))}
                  placeholder="e.g., PROD-001"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-base"
                />
              </div>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.in_stock}
                  onChange={(e) => setFormData(prev => ({ ...prev, in_stock: e.target.checked }))}
                  className="w-5 h-5 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                />
                <span className="text-sm font-medium text-gray-700">In Stock</span>
              </label>
            </div>
          </FormSection>

          {/* Product Image */}
          <FormSection title="Product Image" description="Upload and crop the product image">
            <ImageUploadWithCrop
              onImageCropped={handleImageCropped}
              currentPreview={imagePreview}
              guideline={IMAGE_GUIDELINES.product}
              aspectRatio={1}
            />
          </FormSection>

          {/* Status & Visibility */}
          <FormSection title="Status & Visibility" description="Control product visibility">
            <div className="space-y-4">
              <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                  className="w-5 h-5 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                />
                <div>
                  <span className="text-sm font-medium text-gray-900 block">Active</span>
                  <span className="text-xs text-gray-500">Product is visible on the website</span>
                </div>
              </label>

              <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <input
                  type="checkbox"
                  checked={formData.is_featured}
                  onChange={(e) => setFormData(prev => ({ ...prev, is_featured: e.target.checked }))}
                  className="w-5 h-5 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                />
                <div>
                  <span className="text-sm font-medium text-gray-900 block">Featured</span>
                  <span className="text-xs text-gray-500">Show in featured products section</span>
                </div>
              </label>
            </div>
          </FormSection>
        </div>

        {/* Mobile Bottom Action Bar */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 flex items-center gap-3 z-50">
          <button
            type="button"
            onClick={handleBack}
            className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-primary-600 to-accent-600 text-white rounded-lg font-medium disabled:opacity-50"
          >
            {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
            {isEditMode ? 'Save' : 'Create'}
          </button>
        </div>

        {/* Spacer for mobile bottom bar */}
        <div className="lg:hidden h-24" />
      </form>
    </div>
  );
};
