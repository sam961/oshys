import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { DataTable } from '../components/DataTable';
import { TripModal } from '../components/TripModal';
import { useGetTripsQuery, useDeleteTripMutation } from '../../services/api';
import type { Trip } from '../../types';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

export const TripsManagement: React.FC = () => {
  const { t } = useTranslation('admin');
  const { data: trips = [], isLoading, error } = useGetTripsQuery({});
  const [deleteTrip] = useDeleteTripMutation();
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create');

  const columns = [
    {
      header: t('trips.tripName'),
      accessor: 'name',
      render: (value: string, row: Trip) => (
        <div className="flex items-center gap-3">
          <img
            src={(row as any).image_url || '/placeholder.svg'}
            alt={value}
            className="w-12 h-12 object-cover rounded-lg"
          />
          <div>
            <div className="font-medium">{value}</div>
            <div className="text-xs text-gray-500">{row.location}</div>
          </div>
        </div>
      ),
    },
    {
      header: t('trips.duration'),
      accessor: 'duration',
    },
    {
      header: t('trips.difficulty'),
      accessor: 'difficulty',
      render: (value: string) => (
        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
          value === 'Beginner' ? 'bg-green-100 text-green-700' :
          value === 'Intermediate' ? 'bg-yellow-100 text-yellow-700' :
          'bg-red-100 text-red-700'
        }`}>
          {value}
        </span>
      ),
    },
    {
      header: t('trips.price'),
      accessor: 'price',
      render: (value: number) => <span className="font-semibold text-primary-600">SAR {value}</span>,
    },
  ];

  const handleEdit = (item: Trip) => {
    setSelectedTrip(item);
    setModalMode('edit');
    setModalOpen(true);
  };

  const handleDelete = async (item: Trip) => {
    if (confirm(t('trips.confirmDelete'))) {
      try {
        await deleteTrip(item.id).unwrap();
        toast.success(t('messages.deleteSuccess'));
      } catch (error) {
        toast.error(t('messages.deleteError'));
        console.error('Delete error:', error);
      }
    }
  };

  const handleView = (item: Trip) => {
    setSelectedTrip(item);
    setModalMode('view');
    setModalOpen(true);
  };

  const handleAddTrip = () => {
    setSelectedTrip(null);
    setModalMode('create');
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedTrip(null);
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('trips.title')}</h1>
          <p className="text-gray-600">{t('trips.subtitle')}</p>
        </div>
        <button
          onClick={handleAddTrip}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-600 to-accent-600 text-white rounded-lg hover:shadow-lg transition-all"
        >
          <Plus className="w-5 h-5" />
          {t('trips.addTrip')}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
          <div className="text-sm text-gray-600 mb-1">Total Trips</div>
          <div className="text-3xl font-bold text-gray-900">{trips.length}</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
          <div className="text-sm text-gray-600 mb-1">Beginner</div>
          <div className="text-3xl font-bold text-green-600">
            {trips.filter(t => t.difficulty === 'Beginner').length}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
          <div className="text-sm text-gray-600 mb-1">Advanced</div>
          <div className="text-3xl font-bold text-red-600">
            {trips.filter(t => t.difficulty === 'Advanced').length}
          </div>
        </div>
      </div>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={trips}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onView={handleView}
      />

      <TripModal
        isOpen={modalOpen}
        onClose={handleCloseModal}
        trip={selectedTrip}
        mode={modalMode}
      />
    </div>
  );
};
