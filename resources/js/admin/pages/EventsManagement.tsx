import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { DataTable } from '../components/DataTable';
import { EventModal } from '../components/EventModal';
import { useGetEventsQuery, useDeleteEventMutation } from '../../services/api';
import type { Event } from '../../types';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

export const EventsManagement: React.FC = () => {
  const { t } = useTranslation('admin');
  const { data: events = [], isLoading, error } = useGetEventsQuery({});
  const [deleteEvent] = useDeleteEventMutation();
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create');

  const columns = [
    {
      header: t('events.eventName'),
      accessor: 'title',
    },
    {
      header: t('events.description'),
      accessor: 'description',
      render: (value: string) => (
        <div className="max-w-xs truncate">{value}</div>
      ),
    },
    {
      header: t('events.startDate'),
      accessor: 'start_date',
      render: (value: string) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
    },
    {
      header: 'Type',
      accessor: 'type',
      render: (value: string) => (
        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
          value === 'workshop' ? 'bg-blue-100 text-blue-700' :
          value === 'course' ? 'bg-green-100 text-green-700' :
          'bg-purple-100 text-purple-700'
        }`}>
          {value.charAt(0).toUpperCase() + value.slice(1)}
        </span>
      ),
    },
  ];

  const handleEdit = (item: Event) => {
    setSelectedEvent(item);
    setModalMode('edit');
    setModalOpen(true);
  };

  const handleDelete = async (item: Event) => {
    if (confirm(t('events.confirmDelete'))) {
      try {
        await deleteEvent(item.id).unwrap();
        toast.success(t('messages.deleteSuccess'));
      } catch (error) {
        toast.error(t('messages.deleteError'));
        console.error('Delete error:', error);
      }
    }
  };

  const handleView = (item: Event) => {
    setSelectedEvent(item);
    setModalMode('view');
    setModalOpen(true);
  };

  const handleAddEvent = () => {
    setSelectedEvent(null);
    setModalMode('create');
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedEvent(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
        {t('messages.loadError')}
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('events.title')}</h1>
          <p className="text-gray-600">{t('events.subtitle')}</p>
        </div>
        <button
          onClick={handleAddEvent}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-600 to-accent-600 text-white rounded-lg hover:shadow-lg transition-all"
        >
          <Plus className="w-5 h-5" />
          {t('events.addEvent')}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
          <div className="text-sm text-gray-600 mb-1">Total Events</div>
          <div className="text-3xl font-bold text-gray-900">{events.length}</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
          <div className="text-sm text-gray-600 mb-1">Workshops</div>
          <div className="text-3xl font-bold text-blue-600">
            {events.filter(e => e.type === 'workshop').length}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
          <div className="text-sm text-gray-600 mb-1">Courses</div>
          <div className="text-3xl font-bold text-green-600">
            {events.filter(e => e.type === 'course').length}
          </div>
        </div>
      </div>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={events}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onView={handleView}
      />

      <EventModal
        isOpen={modalOpen}
        onClose={handleCloseModal}
        event={selectedEvent}
        mode={modalMode}
      />
    </div>
  );
};
