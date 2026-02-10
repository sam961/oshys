import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { FormSection } from '../components/FormSection';
import TranslatableField from '../components/TranslatableField';
import { ImageUploadWithCrop, IMAGE_GUIDELINES } from '../components/ImageUploadWithCrop';
import { useGetTripQuery, useGetCategoriesQuery, useCreateTripMutation, useUpdateTripMutation } from '../../services/api';
import toast from 'react-hot-toast';

interface FormData {
  name: string;
  description: string;
  details: string;
  price: number;
  location: string;
  duration: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced' | 'All Levels';
  category_id: number | null;
  is_active: boolean;
  is_featured: boolean;
  certification_required: boolean;
  max_participants: number | null;
  number_of_dives: number | null;
  name_translations: { ar: string };
  description_translations: { ar: string };
  details_translations: { ar: string };
  location_translations: { ar: string };
  duration_translations: { ar: string };
}

const initialFormData: FormData = {
  name: '',
  description: '',
  details: '',
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
  name_translations: { ar: '' },
  description_translations: { ar: '' },
  details_translations: { ar: '' },
  location_translations: { ar: '' },
  duration_translations: { ar: '' },
};

export const TripEditPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);

  const { data: trip, isLoading: isLoadingTrip, error: tripError } = useGetTripQuery(Number(id), { skip: !isEditMode });
  const { data: categories = [] } = useGetCategoriesQuery({ active: true, type: 'trip' });
  const [createTrip, { isLoading: isCreating }] = useCreateTripMutation();
  const [updateTrip, { isLoading: isUpdating }] = useUpdateTripMutation();

  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [isDirty, setIsDirty] = useState(false);
  const [initialData, setInitialData] = useState<FormData>(initialFormData);

  useEffect(() => {
    if (trip && isEditMode) {
      const loadedData: FormData = {
        name: trip.name,
        description: trip.description,
        details: trip.details || '',
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
        name_translations: (trip as any).name_translations || { ar: '' },
        description_translations: (trip as any).description_translations || { ar: '' },
        details_translations: (trip as any).details_translations || { ar: '' },
        location_translations: (trip as any).location_translations || { ar: '' },
        duration_translations: (trip as any).duration_translations || { ar: '' },
      };
      setFormData(loadedData);
      setInitialData(loadedData);
      if ((trip as any).image_url) setImagePreview((trip as any).image_url);
    }
  }, [trip, isEditMode]);

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
    navigate('/admin/trips');
  }, [isDirty, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const submitData = new FormData();
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
      if (formData.category_id) submitData.append('category_id', formData.category_id.toString());
      if (formData.max_participants) submitData.append('max_participants', formData.max_participants.toString());
      if (formData.number_of_dives) submitData.append('number_of_dives', formData.number_of_dives.toString());
      if (imageFile) submitData.append('image', imageFile);
      submitData.append('name_translations', JSON.stringify(formData.name_translations));
      submitData.append('description_translations', JSON.stringify(formData.description_translations));
      submitData.append('details_translations', JSON.stringify(formData.details_translations));
      submitData.append('location_translations', JSON.stringify(formData.location_translations));
      submitData.append('duration_translations', JSON.stringify(formData.duration_translations));

      if (isEditMode) {
        submitData.append('_method', 'PUT');
        await updateTrip({ id: Number(id), data: submitData }).unwrap();
        toast.success('Trip updated successfully');
      } else {
        await createTrip(submitData).unwrap();
        toast.success('Trip created successfully');
      }
      navigate('/admin/trips');
    } catch (error: any) {
      if (error?.data?.errors) Object.values(error.data.errors).flat().forEach((err: any) => toast.error(err));
      else toast.error(`Failed to ${isEditMode ? 'update' : 'create'} trip`);
    }
  };

  const isLoading = isCreating || isUpdating;

  if (isEditMode && isLoadingTrip) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div></div>;
  if (isEditMode && tripError) return <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg"><h3 className="font-semibold mb-2">Trip not found</h3><button onClick={() => navigate('/admin/trips')} className="mt-4 text-red-700 underline">Return to Trips</button></div>;

  return (
    <div>
      <Breadcrumbs items={[{ label: 'Trips', href: '/admin/trips' }, { label: isEditMode ? 'Edit Trip' : 'New Trip' }]} />
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button onClick={handleBack} className="p-2 hover:bg-gray-100 rounded-lg"><ArrowLeft className="w-5 h-5" /></button>
          <div><h1 className="text-2xl font-bold text-gray-900">{isEditMode ? 'Edit Trip' : 'Add New Trip'}</h1>{isEditMode && trip && <p className="text-gray-500 text-sm mt-1">Editing: {trip.name}</p>}</div>
        </div>
        <div className="flex items-center gap-3">
          <button type="button" onClick={handleBack} className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium">Cancel</button>
          <button onClick={handleSubmit} disabled={isLoading} className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-primary-600 to-accent-600 text-white rounded-lg hover:shadow-lg font-medium disabled:opacity-50">
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}{isEditMode ? 'Save Changes' : 'Create Trip'}
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <FormSection title="Basic Information" description="Trip name, description, and details">
            <div className="space-y-5">
              <TranslatableField label="Trip Name" name="name" value={formData.name} translationValue={formData.name_translations.ar} onChangeEnglish={(v) => setFormData(p => ({ ...p, name: v }))} onChangeArabic={(v) => setFormData(p => ({ ...p, name_translations: { ar: v } }))} required placeholder="Enter trip name" placeholderAr="أدخل اسم الرحلة" />
              <TranslatableField label="Description" name="description" value={formData.description} translationValue={formData.description_translations.ar} onChangeEnglish={(v) => setFormData(p => ({ ...p, description: v }))} onChangeArabic={(v) => setFormData(p => ({ ...p, description_translations: { ar: v } }))} type="textarea" required rows={3} placeholder="Enter trip description" placeholderAr="أدخل وصف الرحلة" />
              <TranslatableField label="Details" name="details" value={formData.details} translationValue={formData.details_translations.ar} onChangeEnglish={(v) => setFormData(p => ({ ...p, details: v }))} onChangeArabic={(v) => setFormData(p => ({ ...p, details_translations: { ar: v } }))} type="textarea" rows={3} placeholder="Enter additional details" placeholderAr="أدخل تفاصيل إضافية" />
              <div><label className="block text-sm font-medium text-gray-700 mb-2">Category</label><select value={formData.category_id || ''} onChange={(e) => setFormData(p => ({ ...p, category_id: e.target.value === '' ? null : Number(e.target.value) }))} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"><option value="">No Category</option>{categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
            </div>
          </FormSection>

          <FormSection title="Trip Details" description="Location, duration, and pricing">
            <div className="space-y-5">
              <TranslatableField label="Location" name="location" value={formData.location} translationValue={formData.location_translations.ar} onChangeEnglish={(v) => setFormData(p => ({ ...p, location: v }))} onChangeArabic={(v) => setFormData(p => ({ ...p, location_translations: { ar: v } }))} required placeholder="e.g. Red Sea" placeholderAr="مثال: البحر الأحمر" />
              <TranslatableField label="Duration" name="duration" value={formData.duration} translationValue={formData.duration_translations.ar} onChangeEnglish={(v) => setFormData(p => ({ ...p, duration: v }))} onChangeArabic={(v) => setFormData(p => ({ ...p, duration_translations: { ar: v } }))} required placeholder="e.g. 3 days" placeholderAr="مثال: ٣ أيام" />
              <div><label className="block text-sm font-medium text-gray-700 mb-2">Price (SAR) *</label><input type="number" value={formData.price} onChange={(e) => setFormData(p => ({ ...p, price: Number(e.target.value) }))} required step="0.01" min="0" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-2">Difficulty *</label><select value={formData.difficulty} onChange={(e) => setFormData(p => ({ ...p, difficulty: e.target.value as any }))} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"><option value="Beginner">Beginner</option><option value="Intermediate">Intermediate</option><option value="Advanced">Advanced</option><option value="All Levels">All Levels</option></select></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-2">Max Participants</label><input type="number" value={formData.max_participants || ''} onChange={(e) => setFormData(p => ({ ...p, max_participants: e.target.value === '' ? null : Number(e.target.value) }))} min="1" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-2">Number of Dives</label><input type="number" value={formData.number_of_dives || ''} onChange={(e) => setFormData(p => ({ ...p, number_of_dives: e.target.value === '' ? null : Number(e.target.value) }))} min="1" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500" placeholder="e.g. 4" /></div>
            </div>
          </FormSection>

          <FormSection title="Trip Image" description="Upload trip image">
            <ImageUploadWithCrop onImageCropped={(f, u) => { setImageFile(f); setImagePreview(u); }} currentPreview={imagePreview} guideline={IMAGE_GUIDELINES.trip} />
          </FormSection>

          <FormSection title="Status & Options" description="Visibility and requirements">
            <div className="space-y-4">
              <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg hover:bg-gray-50"><input type="checkbox" checked={formData.is_active} onChange={(e) => setFormData(p => ({ ...p, is_active: e.target.checked }))} className="w-5 h-5 text-primary-600 border-gray-300 rounded" /><div><span className="text-sm font-medium text-gray-900 block">Active</span><span className="text-xs text-gray-500">Trip is visible on the website</span></div></label>
              <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg hover:bg-gray-50"><input type="checkbox" checked={formData.is_featured} onChange={(e) => setFormData(p => ({ ...p, is_featured: e.target.checked }))} className="w-5 h-5 text-primary-600 border-gray-300 rounded" /><div><span className="text-sm font-medium text-gray-900 block">Featured</span><span className="text-xs text-gray-500">Show in featured trips section</span></div></label>
              <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg hover:bg-gray-50"><input type="checkbox" checked={formData.certification_required} onChange={(e) => setFormData(p => ({ ...p, certification_required: e.target.checked }))} className="w-5 h-5 text-primary-600 border-gray-300 rounded" /><div><span className="text-sm font-medium text-gray-900 block">Certification Required</span><span className="text-xs text-gray-500">Participants need diving certification</span></div></label>
            </div>
          </FormSection>
        </div>
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 flex items-center gap-3 z-50"><button type="button" onClick={handleBack} className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium">Cancel</button><button type="submit" disabled={isLoading} className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-primary-600 to-accent-600 text-white rounded-lg font-medium disabled:opacity-50">{isLoading && <Loader2 className="w-4 h-4 animate-spin" />}{isEditMode ? 'Save' : 'Create'}</button></div>
        <div className="lg:hidden h-24" />
      </form>
    </div>
  );
};
