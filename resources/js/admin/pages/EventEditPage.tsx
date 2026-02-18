import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { FormSection } from '../components/FormSection';
import TranslatableField from '../components/TranslatableField';
import TranslatableRichText from '../components/TranslatableRichText';
import { useGetEventQuery, useCreateEventMutation, useUpdateEventMutation } from '../../services/api';
import toast from 'react-hot-toast';

interface FormData {
  title: string;
  description: string;
  type: 'workshop' | 'course' | 'trip' | 'other';
  start_date: string;
  end_date: string;
  location: string;
  is_active: boolean;
  max_participants: number | null;
  price: number | null;
  title_translations: { ar: string };
  description_translations: { ar: string };
  location_translations: { ar: string };
}

const initialFormData: FormData = {
  title: '',
  description: '',
  type: 'workshop',
  start_date: '',
  end_date: '',
  location: '',
  is_active: true,
  max_participants: null,
  price: null,
  title_translations: { ar: '' },
  description_translations: { ar: '' },
  location_translations: { ar: '' },
};

export const EventEditPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);

  const { data: event, isLoading: isLoadingEvent, error: eventError } = useGetEventQuery(Number(id), { skip: !isEditMode });
  const [createEvent, { isLoading: isCreating }] = useCreateEventMutation();
  const [updateEvent, { isLoading: isUpdating }] = useUpdateEventMutation();

  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [isDirty, setIsDirty] = useState(false);
  const [initialData, setInitialData] = useState<FormData>(initialFormData);

  useEffect(() => {
    if (event && isEditMode) {
      const loadedData: FormData = {
        title: event.title,
        description: event.description,
        type: event.type,
        start_date: event.start_date ? event.start_date.split('T')[0] + 'T' + event.start_date.split('T')[1].substring(0, 5) : '',
        end_date: event.end_date ? event.end_date.split('T')[0] + 'T' + event.end_date.split('T')[1].substring(0, 5) : '',
        location: event.location || '',
        is_active: event.is_active,
        max_participants: event.max_participants || null,
        price: event.price || null,
        title_translations: (event as any).title_translations || { ar: '' },
        description_translations: (event as any).description_translations || { ar: '' },
        location_translations: (event as any).location_translations || { ar: '' },
      };
      setFormData(loadedData);
      setInitialData(loadedData);
    }
  }, [event, isEditMode]);

  useEffect(() => {
    setIsDirty(JSON.stringify(formData) !== JSON.stringify(initialData));
  }, [formData, initialData]);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => { if (isDirty) { e.preventDefault(); e.returnValue = ''; } };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  const handleBack = useCallback(() => {
    if (isDirty && !window.confirm('You have unsaved changes. Are you sure you want to leave?')) return;
    navigate('/admin/events');
  }, [isDirty, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isEditMode) {
        await updateEvent({ id: Number(id), data: formData }).unwrap();
        toast.success('Event updated successfully');
      } else {
        await createEvent(formData).unwrap();
        toast.success('Event created successfully');
      }
      navigate('/admin/events');
    } catch (error: any) {
      if (error?.data?.errors) Object.values(error.data.errors).flat().forEach((err: any) => toast.error(err));
      else toast.error(`Failed to ${isEditMode ? 'update' : 'create'} event`);
    }
  };

  const isLoading = isCreating || isUpdating;

  if (isEditMode && isLoadingEvent) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div></div>;
  if (isEditMode && eventError) return <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg"><h3 className="font-semibold mb-2">Event not found</h3><button onClick={() => navigate('/admin/events')} className="mt-4 text-red-700 underline">Return to Events</button></div>;

  return (
    <div>
      <Breadcrumbs items={[{ label: 'Events', href: '/admin/events' }, { label: isEditMode ? 'Edit Event' : 'New Event' }]} />
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button onClick={handleBack} className="p-2 hover:bg-gray-100 rounded-lg"><ArrowLeft className="w-5 h-5" /></button>
          <div><h1 className="text-2xl font-bold text-gray-900">{isEditMode ? 'Edit Event' : 'Add New Event'}</h1>{isEditMode && event && <p className="text-gray-500 text-sm mt-1">Editing: {event.title}</p>}</div>
        </div>
        <div className="flex items-center gap-3">
          <button type="button" onClick={handleBack} className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium">Cancel</button>
          <button onClick={handleSubmit} disabled={isLoading} className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-primary-600 to-accent-600 text-white rounded-lg hover:shadow-lg font-medium disabled:opacity-50">
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}{isEditMode ? 'Save Changes' : 'Create Event'}
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <FormSection title="Event Information" description="Title, description, and location">
            <div className="space-y-5">
              <TranslatableField label="Event Title" name="title" value={formData.title} translationValue={formData.title_translations.ar} onChangeEnglish={(v) => setFormData(p => ({ ...p, title: v }))} onChangeArabic={(v) => setFormData(p => ({ ...p, title_translations: { ar: v } }))} required placeholder="Enter event title" placeholderAr="أدخل عنوان الحدث" />
              <TranslatableRichText label="Description" name="description" value={formData.description} translationValue={formData.description_translations.ar} onChangeEnglish={(v) => setFormData(p => ({ ...p, description: v }))} onChangeArabic={(v) => setFormData(p => ({ ...p, description_translations: { ar: v } }))} required />
              <TranslatableField label="Location" name="location" value={formData.location} translationValue={formData.location_translations.ar} onChangeEnglish={(v) => setFormData(p => ({ ...p, location: v }))} onChangeArabic={(v) => setFormData(p => ({ ...p, location_translations: { ar: v } }))} placeholder="Enter event location" placeholderAr="أدخل موقع الحدث" />
            </div>
          </FormSection>

          <FormSection title="Event Details" description="Type, dates, and capacity">
            <div className="space-y-5">
              <div><label className="block text-sm font-medium text-gray-700 mb-2">Event Type *</label><select value={formData.type} onChange={(e) => setFormData(p => ({ ...p, type: e.target.value as any }))} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"><option value="workshop">Workshop</option><option value="course">Course</option><option value="trip">Trip</option><option value="other">Other</option></select></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-2">Start Date & Time *</label><input type="datetime-local" value={formData.start_date} onChange={(e) => setFormData(p => ({ ...p, start_date: e.target.value }))} required className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-2">End Date & Time</label><input type="datetime-local" value={formData.end_date} onChange={(e) => setFormData(p => ({ ...p, end_date: e.target.value }))} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-gray-700 mb-2">Price (SAR)</label><input type="number" value={formData.price || ''} onChange={(e) => setFormData(p => ({ ...p, price: e.target.value === '' ? null : Number(e.target.value) }))} step="0.01" min="0" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-2">Max Participants</label><input type="number" value={formData.max_participants || ''} onChange={(e) => setFormData(p => ({ ...p, max_participants: e.target.value === '' ? null : Number(e.target.value) }))} min="1" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500" /></div>
              </div>
              <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg hover:bg-gray-50"><input type="checkbox" checked={formData.is_active} onChange={(e) => setFormData(p => ({ ...p, is_active: e.target.checked }))} className="w-5 h-5 text-primary-600 border-gray-300 rounded" /><div><span className="text-sm font-medium text-gray-900 block">Active</span><span className="text-xs text-gray-500">Event is visible on the website</span></div></label>
            </div>
          </FormSection>
        </div>
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 flex items-center gap-3 z-50"><button type="button" onClick={handleBack} className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium">Cancel</button><button type="submit" disabled={isLoading} className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-primary-600 to-accent-600 text-white rounded-lg font-medium disabled:opacity-50">{isLoading && <Loader2 className="w-4 h-4 animate-spin" />}{isEditMode ? 'Save' : 'Create'}</button></div>
        <div className="lg:hidden h-24" />
      </form>
    </div>
  );
};
