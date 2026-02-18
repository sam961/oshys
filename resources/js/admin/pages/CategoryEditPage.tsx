import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { FormSection } from '../components/FormSection';
import TranslatableField from '../components/TranslatableField';
import { useGetCategoryQuery, useCreateCategoryMutation, useUpdateCategoryMutation } from '../../services/api';
import toast from 'react-hot-toast';

interface FormData {
  name: string;
  description: string;
  type: 'product' | 'course' | 'trip' | 'blog';
  is_active: boolean;
  name_translations: { ar: string };
  description_translations: { ar: string };
}

const initialFormData: FormData = {
  name: '',
  description: '',
  type: 'product',
  is_active: true,
  name_translations: { ar: '' },
  description_translations: { ar: '' },
};

export const CategoryEditPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);

  const { data: category, isLoading: isLoadingCategory, error: categoryError } = useGetCategoryQuery(Number(id), {
    skip: !isEditMode,
  });
  const [createCategory, { isLoading: isCreating }] = useCreateCategoryMutation();
  const [updateCategory, { isLoading: isUpdating }] = useUpdateCategoryMutation();

  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [isDirty, setIsDirty] = useState(false);
  const [initialData, setInitialData] = useState<FormData>(initialFormData);

  useEffect(() => {
    if (category && isEditMode) {
      const loadedData: FormData = {
        name: category.name,
        description: category.description || '',
        type: category.type,
        is_active: category.is_active,
        name_translations: (category as any).name_translations || { ar: '' },
        description_translations: (category as any).description_translations || { ar: '' },
      };
      setFormData(loadedData);
      setInitialData(loadedData);
    }
  }, [category, isEditMode]);

  useEffect(() => {
    setIsDirty(JSON.stringify(formData) !== JSON.stringify(initialData));
  }, [formData, initialData]);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) { e.preventDefault(); e.returnValue = ''; }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  const handleBack = useCallback(() => {
    if (isDirty && !window.confirm('You have unsaved changes. Are you sure you want to leave?')) return;
    navigate('/admin/categories');
  }, [isDirty, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const submitData: any = {
        name: formData.name,
        description: formData.description,
        type: formData.type,
        is_active: formData.is_active,
        name_translations: formData.name_translations,
        description_translations: formData.description_translations,
      };

      if (isEditMode) {
        await updateCategory({ id: Number(id), data: submitData }).unwrap();
        toast.success('Category updated successfully');
      } else {
        await createCategory(submitData).unwrap();
        toast.success('Category created successfully');
      }
      navigate('/admin/categories');
    } catch (error: any) {
      if (error?.data?.errors) {
        Object.values(error.data.errors).flat().forEach((err: any) => toast.error(err));
      } else {
        toast.error(`Failed to ${isEditMode ? 'update' : 'create'} category`);
      }
    }
  };

  const isLoading = isCreating || isUpdating;

  if (isEditMode && isLoadingCategory) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (isEditMode && categoryError) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg">
        <h3 className="font-semibold mb-2">Category not found</h3>
        <button onClick={() => navigate('/admin/categories')} className="mt-4 text-red-700 underline">
          Return to Categories
        </button>
      </div>
    );
  }

  return (
    <div>
      <Breadcrumbs items={[{ label: 'Categories', href: '/admin/categories' }, { label: isEditMode ? 'Edit Category' : 'New Category' }]} />

      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button onClick={handleBack} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{isEditMode ? 'Edit Category' : 'Add New Category'}</h1>
            {isEditMode && category && <p className="text-gray-500 text-sm mt-1">Editing: {category.name}</p>}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button type="button" onClick={handleBack} className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium">
            Cancel
          </button>
          <button onClick={handleSubmit} disabled={isLoading} className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-primary-600 to-accent-600 text-white rounded-lg hover:shadow-lg font-medium disabled:opacity-50">
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {isEditMode ? 'Save Changes' : 'Create Category'}
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <FormSection title="Category Information" description="Name and description">
            <div className="space-y-5">
              <TranslatableField
                label="Category Name"
                name="name"
                value={formData.name}
                translationValue={formData.name_translations.ar}
                onChangeEnglish={(value) => setFormData(prev => ({ ...prev, name: value }))}
                onChangeArabic={(value) => setFormData(prev => ({ ...prev, name_translations: { ar: value } }))}
                required
                placeholder="Enter category name"
                placeholderAr="أدخل اسم التصنيف"
              />
              <TranslatableField
                label="Description"
                name="description"
                type="textarea"
                rows={3}
                value={formData.description}
                translationValue={formData.description_translations.ar}
                onChangeEnglish={(value) => setFormData(prev => ({ ...prev, description: value }))}
                onChangeArabic={(value) => setFormData(prev => ({ ...prev, description_translations: { ar: value } }))}
                placeholder="Optional description"
                placeholderAr="وصف اختياري"
              />
            </div>
          </FormSection>

          <FormSection title="Type & Status" description="Category type and visibility">
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Type *</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as any }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  disabled={isEditMode}
                >
                  <option value="product">Product</option>
                  <option value="course">Course</option>
                  <option value="trip">Trip</option>
                  <option value="blog">Blog</option>
                </select>
                {isEditMode && <p className="text-xs text-gray-500 mt-1">Type cannot be changed after creation</p>}
              </div>
              <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg hover:bg-gray-50">
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                  className="w-5 h-5 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                />
                <div>
                  <span className="text-sm font-medium text-gray-900 block">Active</span>
                  <span className="text-xs text-gray-500">Category is available for selection</span>
                </div>
              </label>
            </div>
          </FormSection>
        </div>

        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 flex items-center gap-3 z-50">
          <button type="button" onClick={handleBack} className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium">Cancel</button>
          <button type="submit" disabled={isLoading} className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-primary-600 to-accent-600 text-white rounded-lg font-medium disabled:opacity-50">
            {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
            {isEditMode ? 'Save' : 'Create'}
          </button>
        </div>
        <div className="lg:hidden h-24" />
      </form>
    </div>
  );
};
