import React, { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCreateEventMutation, useUpdateEventMutation } from '../../services/api';
import type { Event } from '../../types';
import toast from 'react-hot-toast';
import TranslatableField from './TranslatableField';

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  event?: Event | null;
  mode: 'create' | 'edit' | 'view';
}

export const EventModal: React.FC<EventModalProps> = ({ isOpen, onClose, event, mode }) => {
  const [createEvent, { isLoading: isCreating }] = useCreateEventMutation();
  const [updateEvent, { isLoading: isUpdating }] = useUpdateEventMutation();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'workshop' as 'workshop' | 'course' | 'trip' | 'other',
    start_date: '',
    end_date: '',
    location: '',
    is_active: true,
    max_participants: null as number | null,
    price: null as number | null,
    // Add translation fields
    title_translations: { ar: '' },
    description_translations: { ar: '' },
    location_translations: { ar: '' },
  });

  useEffect(() => {
    if (event && mode !== 'create') {
      setFormData({
        title: event.title,
        description: event.description,
        type: event.type,
        start_date: event.start_date ? event.start_date.split('T')[0] + 'T' + event.start_date.split('T')[1].substring(0, 5) : '',
        end_date: event.end_date ? event.end_date.split('T')[0] + 'T' + event.end_date.split('T')[1].substring(0, 5) : '',
        location: event.location || '',
        is_active: event.is_active,
        max_participants: event.max_participants || null,
        price: event.price || null,
        // Load translations if available
        title_translations: (event as any).title_translations || { ar: '' },
        description_translations: (event as any).description_translations || { ar: '' },
        location_translations: (event as any).location_translations || { ar: '' },
      });
    } else if (mode === 'create') {
      setFormData({
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
      });
    }
  }, [event, mode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (mode === 'view') {
      onClose();
      return;
    }

    try {
      if (mode === 'create') {
        await createEvent(formData).unwrap();
        toast.success('Event created successfully');
      } else {
        await updateEvent({ id: event!.id, data: formData }).unwrap();
        toast.success('Event updated successfully');
      }
      onClose();
    } catch (error) {
      toast.error(`Failed to ${mode} event`);
      console.error(`${mode} error:`, error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;

    if (type === 'checkbox') {
      setFormData(prev => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }));
    } else if (type === 'number') {
      setFormData(prev => ({ ...prev, [name]: value === '' ? null : Number(value) }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
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
                  {mode === 'create' ? 'Add New Event' : mode === 'edit' ? 'Edit Event' : 'Event Details'}
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
                  label="Event Title"
                  name="title"
                  value={formData.title}
                  translationValue={formData.title_translations.ar}
                  onChangeEnglish={(value) => setFormData(prev => ({ ...prev, title: value }))}
                  onChangeArabic={(value) => setFormData(prev => ({ ...prev, title_translations: { ...prev.title_translations, ar: value } }))}
                  required
                  placeholder="Enter event title"
                  placeholderAr="أدخل عنوان الحدث"
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
                  placeholder="Enter event description"
                  placeholderAr="أدخل وصف الحدث"
                  disabled={isViewMode}
                />

                <TranslatableField
                  label="Location"
                  name="location"
                  value={formData.location}
                  translationValue={formData.location_translations.ar}
                  onChangeEnglish={(value) => setFormData(prev => ({ ...prev, location: value }))}
                  onChangeArabic={(value) => setFormData(prev => ({ ...prev, location_translations: { ...prev.location_translations, ar: value } }))}
                  placeholder="Enter event location"
                  placeholderAr="أدخل موقع الحدث"
                  disabled={isViewMode}
                />

                {/* Event Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Event Type *
                  </label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    disabled={isViewMode}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-base placeholder:text-gray-400 disabled:bg-gray-100"
                  >
                    <option value="workshop">Workshop</option>
                    <option value="course">Course</option>
                    <option value="trip">Trip</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                {/* Start and End Date */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Start Date & Time *
                    </label>
                    <input
                      type="datetime-local"
                      name="start_date"
                      value={formData.start_date}
                      onChange={handleChange}
                      disabled={isViewMode}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-base placeholder:text-gray-400 disabled:bg-gray-100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      End Date & Time
                    </label>
                    <input
                      type="datetime-local"
                      name="end_date"
                      value={formData.end_date}
                      onChange={handleChange}
                      disabled={isViewMode}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-base placeholder:text-gray-400 disabled:bg-gray-100"
                    />
                  </div>
                </div>

                {/* Price and Max Participants */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Price (SAR)
                    </label>
                    <input
                      type="number"
                      name="price"
                      value={formData.price || ''}
                      onChange={handleChange}
                      disabled={isViewMode}
                      step="0.01"
                      min="0"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-base placeholder:text-gray-400 disabled:bg-gray-100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Max Participants
                    </label>
                    <input
                      type="number"
                      name="max_participants"
                      value={formData.max_participants || ''}
                      onChange={handleChange}
                      disabled={isViewMode}
                      min="1"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-base placeholder:text-gray-400 disabled:bg-gray-100"
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
                      {mode === 'create' ? 'Create Event' : 'Update Event'}
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
