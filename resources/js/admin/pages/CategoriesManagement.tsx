import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Tag } from 'lucide-react';
import { DataTable } from '../components/DataTable';
import { useGetCategoriesQuery, useDeleteCategoryMutation } from '../../services/api';
import type { Category } from '../../types';
import toast from 'react-hot-toast';

export const CategoriesManagement: React.FC = () => {
  const navigate = useNavigate();
  const { data: categories = [], isLoading, error } = useGetCategoriesQuery({});
  const [deleteCategory] = useDeleteCategoryMutation();

  const typeColors: Record<string, string> = {
    product: 'bg-blue-100 text-blue-700',
    course: 'bg-purple-100 text-purple-700',
    trip: 'bg-green-100 text-green-700',
    blog: 'bg-orange-100 text-orange-700',
  };

  const columns = [
    {
      header: 'Name',
      accessor: 'name',
      render: (value: string) => (
        <div className="flex items-center gap-3">
          <div className="bg-gray-100 p-2 rounded-lg">
            <Tag className="w-5 h-5 text-gray-600" />
          </div>
          <span className="font-medium">{value}</span>
        </div>
      ),
    },
    {
      header: 'Type',
      accessor: 'type',
      render: (value: string) => (
        <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${typeColors[value] || 'bg-gray-100 text-gray-700'}`}>
          {value}
        </span>
      ),
    },
    {
      header: 'Description',
      accessor: 'description',
      render: (value: string) => (
        <div className="max-w-xs truncate text-gray-600">{value || '—'}</div>
      ),
    },
    {
      header: 'Status',
      accessor: 'is_active',
      render: (value: boolean) => (
        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
          value ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        }`}>
          {value ? 'Active' : 'Inactive'}
        </span>
      ),
    },
  ];

  const handleEdit = (item: Category) => {
    navigate(`/admin/categories/${item.id}/edit`);
  };

  const handleDelete = async (item: Category) => {
    if (confirm(`Are you sure you want to delete "${item.name}"?`)) {
      try {
        await deleteCategory(item.id).unwrap();
        toast.success('Category deleted successfully');
      } catch (error) {
        toast.error('Failed to delete category');
      }
    }
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
        Failed to load categories.
      </div>
    );
  }

  const productCount = categories.filter(c => c.type === 'product').length;
  const courseCount = categories.filter(c => c.type === 'course').length;
  const tripCount = categories.filter(c => c.type === 'trip').length;
  const blogCount = categories.filter(c => c.type === 'blog').length;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Categories</h1>
          <p className="text-gray-600">Manage categories for products, courses, trips, and blog posts</p>
        </div>
        <button
          onClick={() => navigate('/admin/categories/new')}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-600 to-accent-600 text-white rounded-lg hover:shadow-lg transition-all"
        >
          <Plus className="w-5 h-5" />
          Add Category
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
          <div className="text-sm text-gray-600 mb-1">Total</div>
          <div className="text-2xl font-bold text-gray-900">{categories.length}</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
          <div className="text-sm text-gray-600 mb-1">Products</div>
          <div className="text-2xl font-bold text-blue-600">{productCount}</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
          <div className="text-sm text-gray-600 mb-1">Courses</div>
          <div className="text-2xl font-bold text-purple-600">{courseCount}</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
          <div className="text-sm text-gray-600 mb-1">Trips</div>
          <div className="text-2xl font-bold text-green-600">{tripCount}</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
          <div className="text-sm text-gray-600 mb-1">Blog</div>
          <div className="text-2xl font-bold text-orange-600">{blogCount}</div>
        </div>
      </div>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={categories}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </div>
  );
};
