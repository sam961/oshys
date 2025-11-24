import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { DataTable } from '../components/DataTable';
import { TeamMemberModal } from '../components/TeamMemberModal';
import { useGetTeamMembersQuery, useDeleteTeamMemberMutation } from '../../services/api';
import type { TeamMember } from '../../types';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

export const TeamManagement: React.FC = () => {
  const { t } = useTranslation('admin');
  const { data: teamMembers = [], isLoading, error } = useGetTeamMembersQuery({});
  const [deleteTeamMember] = useDeleteTeamMemberMutation();
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create');

  const columns = [
    {
      header: t('team.name'),
      accessor: 'name',
      render: (value: string, row: TeamMember) => (
        <div className="flex items-center gap-3">
          <img
            src={(row as any).image_url || '/placeholder.svg'}
            alt={value}
            className="w-12 h-12 rounded-full object-cover"
          />
          <div>
            <div className="font-medium">{value}</div>
            {row.experience && (
              <div className="text-xs text-gray-500">{row.experience}</div>
            )}
          </div>
        </div>
      ),
    },
    {
      header: t('team.position'),
      accessor: 'role',
    },
    {
      header: t('team.certifications'),
      accessor: 'certifications',
      render: (value: string[]) => (
        <div className="flex flex-wrap gap-1">
          {value.map((cert, index) => (
            <span key={index} className="px-2 py-1 bg-accent-100 text-accent-700 rounded text-xs">
              {cert}
            </span>
          ))}
        </div>
      ),
    },
  ];

  const handleEdit = (item: TeamMember) => {
    setSelectedMember(item);
    setModalMode('edit');
    setModalOpen(true);
  };

  const handleDelete = async (item: TeamMember) => {
    if (confirm(t('team.confirmDelete'))) {
      try {
        await deleteTeamMember(item.id).unwrap();
        toast.success(t('messages.deleteSuccess'));
      } catch (error) {
        toast.error(t('messages.deleteError'));
        console.error('Delete error:', error);
      }
    }
  };

  const handleView = (item: TeamMember) => {
    setSelectedMember(item);
    setModalMode('view');
    setModalOpen(true);
  };

  const handleAddMember = () => {
    setSelectedMember(null);
    setModalMode('create');
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedMember(null);
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('team.title')}</h1>
          <p className="text-gray-600">{t('team.subtitle')}</p>
        </div>
        <button
          onClick={handleAddMember}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-600 to-accent-600 text-white rounded-lg hover:shadow-lg transition-all"
        >
          <Plus className="w-5 h-5" />
          {t('team.addMember')}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
          <div className="text-sm text-gray-600 mb-1">Total Members</div>
          <div className="text-3xl font-bold text-gray-900">{teamMembers.length}</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
          <div className="text-sm text-gray-600 mb-1">Active</div>
          <div className="text-3xl font-bold text-green-600">
            {teamMembers.filter(t => t.is_active).length}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
          <div className="text-sm text-gray-600 mb-1">Inactive</div>
          <div className="text-3xl font-bold text-gray-600">
            {teamMembers.filter(t => !t.is_active).length}
          </div>
        </div>
      </div>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={teamMembers}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onView={handleView}
      />

      <TeamMemberModal
        isOpen={modalOpen}
        onClose={handleCloseModal}
        teamMember={selectedMember}
        mode={modalMode}
      />
    </div>
  );
};
