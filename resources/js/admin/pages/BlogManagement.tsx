import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { DataTable } from '../components/DataTable';
import { BlogModal } from '../components/BlogModal';
import { useGetBlogPostsQuery, useDeleteBlogPostMutation } from '../../services/api';
import type { BlogPost } from '../../types';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

export const BlogManagement: React.FC = () => {
  const { t } = useTranslation('admin');
  const { data: blogPosts = [], isLoading, error } = useGetBlogPostsQuery({});
  const [deleteBlogPost] = useDeleteBlogPostMutation();
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create');

  const columns = [
    {
      header: t('blog.postTitle'),
      accessor: 'title',
      render: (value: string, row: BlogPost) => (
        <div className="flex items-center gap-3">
          {(row as any).image_url && (
            <img src={(row as any).image_url} alt={value} className="w-12 h-12 object-cover rounded-lg" />
          )}
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
      header: t('blog.author'),
      accessor: 'author',
      render: (value: any) => value?.name || 'Unknown',
    },
    {
      header: t('blog.publishDate'),
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
          {value ? t('blog.published') : t('blog.draft')}
        </span>
      ),
    },
  ];

  const handleEdit = (item: BlogPost) => {
    setSelectedPost(item);
    setModalMode('edit');
    setModalOpen(true);
  };

  const handleDelete = async (item: BlogPost) => {
    if (confirm(t('blog.confirmDelete'))) {
      try {
        await deleteBlogPost(item.id).unwrap();
        toast.success(t('messages.deleteSuccess'));
      } catch (error) {
        toast.error(t('messages.deleteError'));
        console.error('Delete error:', error);
      }
    }
  };

  const handleView = (item: BlogPost) => {
    setSelectedPost(item);
    setModalMode('view');
    setModalOpen(true);
  };

  const handleAddPost = () => {
    setSelectedPost(null);
    setModalMode('create');
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedPost(null);
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('blog.title')}</h1>
          <p className="text-gray-600">{t('blog.subtitle')}</p>
        </div>
        <button
          onClick={handleAddPost}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-600 to-accent-600 text-white rounded-lg hover:shadow-lg transition-all"
        >
          <Plus className="w-5 h-5" />
          {t('blog.addPost')}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
          <div className="text-sm text-gray-600 mb-1">Total Posts</div>
          <div className="text-3xl font-bold text-gray-900">{blogPosts.length}</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
          <div className="text-sm text-gray-600 mb-1">Published</div>
          <div className="text-3xl font-bold text-green-600">
            {blogPosts.filter(p => p.is_published).length}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
          <div className="text-sm text-gray-600 mb-1">Drafts</div>
          <div className="text-3xl font-bold text-gray-600">
            {blogPosts.filter(p => !p.is_published).length}
          </div>
        </div>
      </div>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={blogPosts}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onView={handleView}
      />

      <BlogModal
        isOpen={modalOpen}
        onClose={handleCloseModal}
        blogPost={selectedPost}
        mode={modalMode}
      />
    </div>
  );
};
