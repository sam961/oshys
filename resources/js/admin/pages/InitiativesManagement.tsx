import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { DataTable } from '../components/DataTable';
import { InitiativeModal } from '../components/InitiativeModal';
import { useGetSocialInitiativesQuery, useDeleteSocialInitiativeMutation } from '../../services/api';
import type { SocialInitiative } from '../../types';
import toast from 'react-hot-toast';

export const InitiativesManagement: React.FC = () => {
  const navigate = useNavigate();
  const { data: initiatives = [], isLoading, error } = useGetSocialInitiativesQuery({});
  const [deleteInitiative] = useDeleteSocialInitiativeMutation();

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedInitiative, setSelectedInitiative] = useState<SocialInitiative | null>(null);

  const columns = [
    {
      header: 'Title',
      accessor: 'title',
      render: (value: string, row: SocialInitiative) => (
        <div className="flex items-center gap-3">
          <img
            src={row.image_url || '/placeholder.svg'}
            alt={value}
            className="w-12 h-12 object-cover rounded-lg"
          />
          <div className="max-w-xs">
            <div className="font-medium truncate">{value}</div>
            {row.category && (
              <div className="text-xs text-gray-500">{row.category.name}</div>
            )}
          </div>
        </div>
      ),
    },
    {
      header: 'Publish Date',
      accessor: 'published_at',
      render: (value: string) => value ? new Date(value).toLocaleDateString() : 'Not published',
    },
    {
      header: 'Status',
      accessor: 'is_published',
      render: (value: boolean) => (
        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
          value ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
        }`}>
          {value ? 'Published' : 'Draft'}
        </span>
      ),
    },
  ];

  const handleEdit = (item: SocialInitiative) => {
    navigate(`/admin/initiatives/${item.id}/edit`);
  };

  const handleDelete = async (item: SocialInitiative) => {
    if (confirm('Are you sure you want to delete this initiative?')) {
      try {
        await deleteInitiative(item.id).unwrap();
        toast.success('Initiative deleted successfully');
      } catch (error) {
        toast.error('Failed to delete initiative');
        console.error('Delete error:', error);
      }
    }
  };

  const handleView = (item: SocialInitiative) => {
    setSelectedInitiative(item);
    setModalOpen(true);
  };

  const handleAddInitiative = () => {
    navigate('/admin/initiatives/new');
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedInitiative(null);
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
        Failed to load initiatives
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Social Initiatives</h1>
          <p className="text-gray-600">Manage your B2B social initiatives</p>
        </div>
        <button
          onClick={handleAddInitiative}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-600 to-accent-600 text-white rounded-lg hover:shadow-lg transition-all"
        >
          <Plus className="w-5 h-5" />
          Add Initiative
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
          <div className="text-sm text-gray-600 mb-1">Total Initiatives</div>
          <div className="text-3xl font-bold text-gray-900">{initiatives.length}</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
          <div className="text-sm text-gray-600 mb-1">Published</div>
          <div className="text-3xl font-bold text-green-600">
            {initiatives.filter(i => i.is_published).length}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
          <div className="text-sm text-gray-600 mb-1">Drafts</div>
          <div className="text-3xl font-bold text-gray-600">
            {initiatives.filter(i => !i.is_published).length}
          </div>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={initiatives}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onView={handleView}
      />

      <InitiativeModal
        isOpen={modalOpen}
        onClose={handleCloseModal}
        initiative={selectedInitiative}
        mode="view"
      />
    </div>
  );
};
