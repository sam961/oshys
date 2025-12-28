import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { DataTable } from '../components/DataTable';
import { BannerModal } from '../components/BannerModal';
import { useGetBannersQuery, useDeleteBannerMutation } from '../../services/api';
import type { Banner } from '../../types';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

export const BannerManagement: React.FC = () => {
  const { t } = useTranslation('admin');
  const navigate = useNavigate();
  const { data: banners = [], isLoading, error } = useGetBannersQuery({});
  const [deleteBanner] = useDeleteBannerMutation();
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedBanner, setSelectedBanner] = useState<Banner | null>(null);

  const columns = [
    {
      header: t('banners.bannerTitle'),
      accessor: 'title',
      render: (value: string, row: Banner) => (
        <div className="flex items-center gap-3">
          <img
            src={(row as any).image_url || '/placeholder.svg'}
            alt={value}
            className="w-16 h-10 object-cover rounded-lg"
          />
          <div>
            <div className="font-medium">{value}</div>
            <div className="text-xs text-gray-500">{row.position}</div>
          </div>
        </div>
      ),
    },
    {
      header: t('banners.position'),
      accessor: 'position',
      render: (value: string) => (
        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
          value === 'hero' ? 'bg-blue-100 text-blue-700' :
          value === 'secondary' ? 'bg-green-100 text-green-700' :
          'bg-purple-100 text-purple-700'
        }`}>
          {value.charAt(0).toUpperCase() + value.slice(1)}
        </span>
      ),
    },
    {
      header: t('banners.displayOrder'),
      accessor: 'display_order',
    },
    {
      header: 'Status',
      accessor: 'is_active',
      render: (value: boolean) => (
        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
          value ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
        }`}>
          {value ? 'Active' : 'Inactive'}
        </span>
      ),
    },
    {
      header: 'Schedule',
      accessor: 'start_date',
      render: (value: string, row: Banner) => {
        if (!row.start_date && !row.end_date) {
          return <span className="text-gray-500 text-sm">Always visible</span>;
        }
        return (
          <div className="text-sm">
            {row.start_date && <div>From: {new Date(row.start_date).toLocaleDateString()}</div>}
            {row.end_date && <div>To: {new Date(row.end_date).toLocaleDateString()}</div>}
          </div>
        );
      },
    },
  ];

  const handleEdit = (item: Banner) => {
    navigate(`/admin/banners/${item.id}/edit`);
  };

  const handleDelete = async (item: Banner) => {
    if (confirm(t('banners.confirmDelete'))) {
      try {
        await deleteBanner(item.id).unwrap();
        toast.success(t('messages.deleteSuccess'));
      } catch (error) {
        toast.error(t('messages.deleteError'));
        console.error('Delete error:', error);
      }
    }
  };

  const handleView = (item: Banner) => {
    setSelectedBanner(item);
    setModalOpen(true);
  };

  const handleAddBanner = () => {
    navigate('/admin/banners/new');
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedBanner(null);
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('banners.title')}</h1>
          <p className="text-gray-600">{t('banners.subtitle')}</p>
        </div>
        <button
          onClick={handleAddBanner}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-600 to-accent-600 text-white rounded-lg hover:shadow-lg transition-all"
        >
          <Plus className="w-5 h-5" />
          {t('banners.addBanner')}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
          <div className="text-sm text-gray-600 mb-1">Total Banners</div>
          <div className="text-3xl font-bold text-gray-900">{banners.length}</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
          <div className="text-sm text-gray-600 mb-1">Active</div>
          <div className="text-3xl font-bold text-green-600">
            {banners.filter(b => b.is_active).length}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
          <div className="text-sm text-gray-600 mb-1">Hero Banners</div>
          <div className="text-3xl font-bold text-blue-600">
            {banners.filter(b => b.position === 'hero').length}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
          <div className="text-sm text-gray-600 mb-1">Scheduled</div>
          <div className="text-3xl font-bold text-purple-600">
            {banners.filter(b => b.start_date || b.end_date).length}
          </div>
        </div>
      </div>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={banners}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onView={handleView}
      />

      <BannerModal
        isOpen={modalOpen}
        onClose={handleCloseModal}
        banner={selectedBanner}
        mode="view"
      />
    </div>
  );
};
