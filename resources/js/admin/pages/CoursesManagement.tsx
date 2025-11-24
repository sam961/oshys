import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { DataTable } from '../components/DataTable';
import { CourseModal } from '../components/CourseModal';
import { useGetCoursesQuery, useDeleteCourseMutation } from '../../services/api';
import type { Course } from '../../types';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

export const CoursesManagement: React.FC = () => {
  const { t } = useTranslation('admin');
  const { data: courses = [], isLoading, error } = useGetCoursesQuery({});
  const [deleteCourse] = useDeleteCourseMutation();
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create');

  const columns = [
    {
      header: t('courses.courseName'),
      accessor: 'name',
      render: (value: string, row: Course) => (
        <div className="flex items-center gap-3">
          <img
            src={(row as any).image_url || '/placeholder.svg'}
            alt={value}
            className="w-12 h-12 object-cover rounded-lg"
          />
          <div className="font-medium">{value}</div>
        </div>
      ),
    },
    {
      header: t('courses.duration'),
      accessor: 'duration',
    },
    {
      header: t('courses.level'),
      accessor: 'level',
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
      header: t('courses.price'),
      accessor: 'price',
      render: (value: number) => <span className="font-semibold text-primary-600">SAR {value}</span>,
    },
  ];

  const handleEdit = (item: Course) => {
    setSelectedCourse(item);
    setModalMode('edit');
    setModalOpen(true);
  };

  const handleDelete = async (item: Course) => {
    if (confirm(t('courses.confirmDelete'))) {
      try {
        await deleteCourse(item.id).unwrap();
        toast.success(t('messages.deleteSuccess'));
      } catch (error) {
        toast.error(t('messages.deleteError'));
        console.error('Delete error:', error);
      }
    }
  };

  const handleView = (item: Course) => {
    setSelectedCourse(item);
    setModalMode('view');
    setModalOpen(true);
  };

  const handleAddCourse = () => {
    setSelectedCourse(null);
    setModalMode('create');
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedCourse(null);
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('courses.title')}</h1>
          <p className="text-gray-600">{t('courses.subtitle')}</p>
        </div>
        <button
          onClick={handleAddCourse}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-600 to-accent-600 text-white rounded-lg hover:shadow-lg transition-all"
        >
          <Plus className="w-5 h-5" />
          {t('courses.addCourse')}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
          <div className="text-sm text-gray-600 mb-1">Total Courses</div>
          <div className="text-3xl font-bold text-gray-900">{courses.length}</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
          <div className="text-sm text-gray-600 mb-1">Beginner</div>
          <div className="text-3xl font-bold text-green-600">
            {courses.filter(c => c.level === 'Beginner').length}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
          <div className="text-sm text-gray-600 mb-1">Advanced</div>
          <div className="text-3xl font-bold text-red-600">
            {courses.filter(c => c.level === 'Advanced').length}
          </div>
        </div>
      </div>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={courses}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onView={handleView}
      />

      <CourseModal
        isOpen={modalOpen}
        onClose={handleCloseModal}
        course={selectedCourse}
        mode={modalMode}
      />
    </div>
  );
};
