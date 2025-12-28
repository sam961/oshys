import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Star } from 'lucide-react';
import { DataTable } from '../components/DataTable';
import { TeamMemberModal } from '../components/TeamMemberModal';
import { useGetTeamMembersQuery, useDeleteTeamMemberMutation, useGetSettingsQuery, useCreateSettingMutation, useUpdateSettingMutation } from '../../services/api';
import type { TeamMember } from '../../types';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

export const TeamManagement: React.FC = () => {
  const { t } = useTranslation('admin');
  const navigate = useNavigate();
  const { data: teamMembers = [], isLoading, error } = useGetTeamMembersQuery({});
  const { data: settings = [] } = useGetSettingsQuery({});
  const [deleteTeamMember] = useDeleteTeamMemberMutation();
  const [createSetting] = useCreateSettingMutation();
  const [updateSetting] = useUpdateSettingMutation();
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [featuredInstructorId, setFeaturedInstructorId] = useState<number | null>(null);
  const [featuredSettingId, setFeaturedSettingId] = useState<number | null>(null);

  // Load featured instructor setting
  useEffect(() => {
    const featuredSetting = settings.find(s => s.key === 'featured_instructor_id');
    if (featuredSetting) {
      setFeaturedInstructorId(featuredSetting.value ? parseInt(featuredSetting.value) : null);
      setFeaturedSettingId(featuredSetting.id);
    }
  }, [settings]);

  const handleSetFeatured = async (member: TeamMember) => {
    try {
      if (featuredSettingId) {
        await updateSetting({
          id: featuredSettingId,
          data: { value: String(member.id) },
        }).unwrap();
      } else {
        const result = await createSetting({
          key: 'featured_instructor_id',
          value: String(member.id),
          type: 'number',
          group: 'homepage',
        }).unwrap();
        setFeaturedSettingId(result.id);
      }
      setFeaturedInstructorId(member.id);
      toast.success(`${member.name} is now the featured instructor`);
    } catch (error) {
      toast.error('Failed to set featured instructor');
      console.error('Update error:', error);
    }
  };

  const columns = [
    {
      header: t('team.name'),
      accessor: 'name',
      render: (value: string, row: TeamMember) => (
        <div className="flex items-center gap-3">
          {featuredInstructorId === row.id && (
            <Star className="w-5 h-5 text-yellow-500 fill-yellow-500 shrink-0" />
          )}
          <img
            src={(row as any).image_url || '/placeholder.svg'}
            alt={value}
            className="w-12 h-12 rounded-full object-cover"
          />
          <div>
            <div className="font-medium flex items-center gap-2">
              {value}
              {featuredInstructorId === row.id && (
                <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded-full text-xs font-semibold">
                  Featured
                </span>
              )}
            </div>
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
          {value?.map((cert, index) => (
            <span key={index} className="px-2 py-1 bg-accent-100 text-accent-700 rounded text-xs">
              {cert}
            </span>
          ))}
        </div>
      ),
    },
  ];

  const handleEdit = (item: TeamMember) => {
    navigate(`/admin/team/${item.id}/edit`);
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
    setModalOpen(true);
  };

  const handleAddMember = () => {
    navigate('/admin/team/new');
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
        customActions={(item: TeamMember) => (
          <button
            onClick={() => handleSetFeatured(item)}
            className={`p-2 rounded-lg transition-colors ${
              featuredInstructorId === item.id
                ? 'bg-yellow-100 text-yellow-600'
                : 'hover:bg-gray-100 text-gray-400 hover:text-yellow-600'
            }`}
            title={featuredInstructorId === item.id ? 'Currently Featured' : 'Set as Featured'}
          >
            <Star className={`w-5 h-5 ${featuredInstructorId === item.id ? 'fill-yellow-500' : ''}`} />
          </button>
        )}
      />

      <TeamMemberModal
        isOpen={modalOpen}
        onClose={handleCloseModal}
        teamMember={selectedMember}
        mode="view"
      />
    </div>
  );
};
