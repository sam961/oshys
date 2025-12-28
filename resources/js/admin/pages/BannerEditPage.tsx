import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { FormSection } from '../components/FormSection';
import TranslatableField from '../components/TranslatableField';
import { ImageUploadWithCrop, IMAGE_GUIDELINES } from '../components/ImageUploadWithCrop';
import { useGetBannerQuery, useCreateBannerMutation, useUpdateBannerMutation } from '../../services/api';
import toast from 'react-hot-toast';

interface FormData {
  title: string;
  description: string;
  button_text: string;
  button_link: string;
  position: 'hero' | 'secondary' | 'promo';
  display_order: number;
  is_active: boolean;
  title_translations: { ar: string };
  description_translations: { ar: string };
  button_text_translations: { ar: string };
}

const initialFormData: FormData = {
  title: '',
  description: '',
  button_text: '',
  button_link: '',
  position: 'hero',
  display_order: 0,
  is_active: true,
  title_translations: { ar: '' },
  description_translations: { ar: '' },
  button_text_translations: { ar: '' },
};

export const BannerEditPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);

  const { data: banner, isLoading: isLoadingBanner, error: bannerError } = useGetBannerQuery(Number(id), { skip: !isEditMode });
  const [createBanner, { isLoading: isCreating }] = useCreateBannerMutation();
  const [updateBanner, { isLoading: isUpdating }] = useUpdateBannerMutation();

  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [isDirty, setIsDirty] = useState(false);
  const [initialData, setInitialData] = useState<FormData>(initialFormData);

  useEffect(() => {
    if (banner && isEditMode) {
      const loadedData: FormData = {
        title: banner.title,
        description: banner.description || '',
        button_text: banner.button_text || '',
        button_link: banner.button_link || '',
        position: banner.position,
        display_order: banner.display_order,
        is_active: banner.is_active,
        title_translations: (banner as any).title_translations || { ar: '' },
        description_translations: (banner as any).description_translations || { ar: '' },
        button_text_translations: (banner as any).button_text_translations || { ar: '' },
      };
      setFormData(loadedData);
      setInitialData(loadedData);
      if ((banner as any).image_url) setImagePreview((banner as any).image_url);
    }
  }, [banner, isEditMode]);

  useEffect(() => {
    setIsDirty(JSON.stringify(formData) !== JSON.stringify(initialData) || imageFile !== null);
  }, [formData, initialData, imageFile]);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => { if (isDirty) { e.preventDefault(); e.returnValue = ''; } };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  const handleBack = useCallback(() => {
    if (isDirty && !window.confirm('You have unsaved changes. Are you sure you want to leave?')) return;
    navigate('/admin/banners');
  }, [isDirty, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const submitData = new FormData();
      submitData.append('title', formData.title);
      submitData.append('description', formData.description);
      submitData.append('position', formData.position);
      submitData.append('display_order', formData.display_order.toString());
      submitData.append('is_active', formData.is_active ? '1' : '0');
      if (formData.button_text) submitData.append('button_text', formData.button_text);
      if (formData.button_link) submitData.append('button_link', formData.button_link);
      if (imageFile) submitData.append('image', imageFile);
      submitData.append('title_translations', JSON.stringify(formData.title_translations));
      submitData.append('description_translations', JSON.stringify(formData.description_translations));
      submitData.append('button_text_translations', JSON.stringify(formData.button_text_translations));

      if (isEditMode) {
        submitData.append('_method', 'PUT');
        await updateBanner({ id: Number(id), data: submitData }).unwrap();
        toast.success('Banner updated successfully');
      } else {
        await createBanner(submitData).unwrap();
        toast.success('Banner created successfully');
      }
      navigate('/admin/banners');
    } catch (error: any) {
      if (error?.data?.errors) Object.values(error.data.errors).flat().forEach((err: any) => toast.error(err));
      else toast.error(`Failed to ${isEditMode ? 'update' : 'create'} banner`);
    }
  };

  const isLoading = isCreating || isUpdating;

  if (isEditMode && isLoadingBanner) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div></div>;
  if (isEditMode && bannerError) return <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg"><h3 className="font-semibold mb-2">Banner not found</h3><button onClick={() => navigate('/admin/banners')} className="mt-4 text-red-700 underline">Return to Banners</button></div>;

  return (
    <div>
      <Breadcrumbs items={[{ label: 'Banners', href: '/admin/banners' }, { label: isEditMode ? 'Edit Banner' : 'New Banner' }]} />
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button onClick={handleBack} className="p-2 hover:bg-gray-100 rounded-lg"><ArrowLeft className="w-5 h-5" /></button>
          <div><h1 className="text-2xl font-bold text-gray-900">{isEditMode ? 'Edit Banner' : 'Add New Banner'}</h1>{isEditMode && banner && <p className="text-gray-500 text-sm mt-1">Editing: {banner.title}</p>}</div>
        </div>
        <div className="flex items-center gap-3">
          <button type="button" onClick={handleBack} className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium">Cancel</button>
          <button onClick={handleSubmit} disabled={isLoading} className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-primary-600 to-accent-600 text-white rounded-lg hover:shadow-lg font-medium disabled:opacity-50">
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}{isEditMode ? 'Save Changes' : 'Create Banner'}
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <FormSection title="Banner Content" description="Title, description, and button">
            <div className="space-y-5">
              <TranslatableField label="Banner Title" name="title" value={formData.title} translationValue={formData.title_translations.ar} onChangeEnglish={(v) => setFormData(p => ({ ...p, title: v }))} onChangeArabic={(v) => setFormData(p => ({ ...p, title_translations: { ar: v } }))} required placeholder="Enter banner title" placeholderAr="أدخل عنوان البانر" />
              <TranslatableField label="Description" name="description" value={formData.description} translationValue={formData.description_translations.ar} onChangeEnglish={(v) => setFormData(p => ({ ...p, description: v }))} onChangeArabic={(v) => setFormData(p => ({ ...p, description_translations: { ar: v } }))} type="textarea" rows={3} placeholder="Enter banner description" placeholderAr="أدخل وصف البانر" />
              <TranslatableField label="Button Text" name="button_text" value={formData.button_text} translationValue={formData.button_text_translations.ar} onChangeEnglish={(v) => setFormData(p => ({ ...p, button_text: v }))} onChangeArabic={(v) => setFormData(p => ({ ...p, button_text_translations: { ar: v } }))} placeholder="e.g. Learn More" placeholderAr="مثال: اعرف المزيد" />
              <div><label className="block text-sm font-medium text-gray-700 mb-2">Button Link</label><input type="text" value={formData.button_link} onChange={(e) => setFormData(p => ({ ...p, button_link: e.target.value }))} placeholder="/courses" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500" /></div>
            </div>
          </FormSection>

          <FormSection title="Banner Image" description="Upload banner image">
            <ImageUploadWithCrop onImageCropped={(f, u) => { setImageFile(f); setImagePreview(u); }} currentPreview={imagePreview} guideline={IMAGE_GUIDELINES.banner} required={!isEditMode} />
          </FormSection>

          <FormSection title="Display Settings" description="Position and order">
            <div className="space-y-5">
              <div><label className="block text-sm font-medium text-gray-700 mb-2">Position *</label><select value={formData.position} onChange={(e) => setFormData(p => ({ ...p, position: e.target.value as any }))} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"><option value="hero">Hero Banner (Main)</option><option value="secondary">Secondary Banner</option><option value="promo">Promotional Banner</option></select></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-2">Display Order</label><input type="number" value={formData.display_order} onChange={(e) => setFormData(p => ({ ...p, display_order: Number(e.target.value) }))} min="0" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500" /></div>
            </div>
          </FormSection>

          <FormSection title="Status" description="Banner visibility">
            <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg hover:bg-gray-50"><input type="checkbox" checked={formData.is_active} onChange={(e) => setFormData(p => ({ ...p, is_active: e.target.checked }))} className="w-5 h-5 text-primary-600 border-gray-300 rounded" /><div><span className="text-sm font-medium text-gray-900 block">Active</span><span className="text-xs text-gray-500">Banner is visible on the website</span></div></label>
          </FormSection>
        </div>
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 flex items-center gap-3 z-50"><button type="button" onClick={handleBack} className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium">Cancel</button><button type="submit" disabled={isLoading} className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-primary-600 to-accent-600 text-white rounded-lg font-medium disabled:opacity-50">{isLoading && <Loader2 className="w-4 h-4 animate-spin" />}{isEditMode ? 'Save' : 'Create'}</button></div>
        <div className="lg:hidden h-24" />
      </form>
    </div>
  );
};
