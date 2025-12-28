import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { DataTable } from '../components/DataTable';
import { FooterLinkModal } from '../components/FooterLinkModal';
import { useGetFooterLinksQuery, useDeleteFooterLinkMutation } from '../../services/api';
import type { FooterLink } from '../../types';
import toast from 'react-hot-toast';

export const FooterLinksManagement: React.FC = () => {
  const navigate = useNavigate();
  const { data: footerLinks = [], isLoading, error } = useGetFooterLinksQuery({});
  const [deleteFooterLink] = useDeleteFooterLinkMutation();

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedLink, setSelectedLink] = useState<FooterLink | null>(null);

  const columns = [
    {
      header: 'Title',
      accessor: 'title',
      render: (value: string) => (
        <div className="font-medium">{value}</div>
      ),
    },
    {
      header: 'URL',
      accessor: 'url',
      render: (value: string) => (
        <a
          href={value}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary-600 hover:text-primary-700 text-sm truncate max-w-xs block"
        >
          {value}
        </a>
      ),
    },
    {
      header: 'Order',
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
      header: 'Open in New Tab',
      accessor: 'open_in_new_tab',
      render: (value: boolean) => (
        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
          value ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
        }`}>
          {value ? 'Yes' : 'No'}
        </span>
      ),
    },
  ];

  const handleEdit = (item: FooterLink) => {
    navigate(`/admin/footer-links/${item.id}/edit`);
  };

  const handleDelete = async (item: FooterLink) => {
    if (confirm('Are you sure you want to delete this footer link?')) {
      try {
        await deleteFooterLink(item.id).unwrap();
        toast.success('Footer link deleted successfully');
      } catch (error) {
        toast.error('Failed to delete footer link');
        console.error('Delete error:', error);
      }
    }
  };

  const handleView = (item: FooterLink) => {
    setSelectedLink(item);
    setModalOpen(true);
  };

  const handleAddLink = () => {
    navigate('/admin/footer-links/new');
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedLink(null);
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
        Failed to load footer links
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Footer Links</h1>
          <p className="text-gray-600">Manage links displayed in the footer support section</p>
        </div>
        <button
          onClick={handleAddLink}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-600 to-accent-600 text-white rounded-lg hover:shadow-lg transition-all"
        >
          <Plus className="w-5 h-5" />
          Add Footer Link
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
          <div className="text-sm text-gray-600 mb-1">Total Links</div>
          <div className="text-3xl font-bold text-gray-900">{footerLinks.length}</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
          <div className="text-sm text-gray-600 mb-1">Active</div>
          <div className="text-3xl font-bold text-green-600">
            {footerLinks.filter(l => l.is_active).length}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
          <div className="text-sm text-gray-600 mb-1">External Links</div>
          <div className="text-3xl font-bold text-blue-600">
            {footerLinks.filter(l => l.open_in_new_tab).length}
          </div>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={footerLinks}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onView={handleView}
      />

      <FooterLinkModal
        isOpen={modalOpen}
        onClose={handleCloseModal}
        footerLink={selectedLink}
        mode="view"
      />
    </div>
  );
};
