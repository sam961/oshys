import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { DataTable } from '../components/DataTable';
import { ProductModal } from '../components/ProductModal';
import { useGetProductsQuery, useDeleteProductMutation } from '../../services/api';
import type { Product } from '../../types';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

export const ProductsManagement: React.FC = () => {
  const { t } = useTranslation('admin');
  const navigate = useNavigate();
  const { data: products = [], isLoading, error } = useGetProductsQuery({});
  const [deleteProduct] = useDeleteProductMutation();

  // Keep modal state only for view mode
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const columns = [
    {
      header: 'Product',
      accessor: 'name',
      render: (value: string, row: Product) => (
        <div className="flex items-center gap-3">
          <img
            src={(row as any).image_url || '/placeholder.svg'}
            alt={value}
            className="w-12 h-12 object-cover rounded-lg"
          />
          <div>
            <div className="font-medium">{value}</div>
            {row.category && (
              <div className="text-xs text-gray-500">{row.category.name}</div>
            )}
          </div>
        </div>
      ),
    },
    {
      header: 'Description',
      accessor: 'description',
      render: (value: string) => (
        <div className="max-w-xs truncate">{value}</div>
      ),
    },
    {
      header: 'Price',
      accessor: 'price',
      render: (value: number) => <span className="font-semibold text-primary-600">SAR {value}</span>,
    },
    {
      header: 'Stock',
      accessor: 'stock_quantity',
      render: (value: number) => <span className="text-gray-700">{value}</span>,
    },
    {
      header: 'Status',
      accessor: 'in_stock',
      render: (value: boolean) => (
        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
          value ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        }`}>
          {value ? 'In Stock' : 'Out of Stock'}
        </span>
      ),
    },
  ];

  const handleEdit = (item: Product) => {
    navigate(`/admin/products/${item.id}/edit`);
  };

  const handleDelete = async (item: Product) => {
    if (confirm(t('products.confirmDelete'))) {
      try {
        await deleteProduct(item.id).unwrap();
        toast.success(t('messages.deleteSuccess'));
      } catch (error) {
        toast.error(t('messages.deleteError'));
        console.error('Delete error:', error);
      }
    }
  };

  const handleView = (item: Product) => {
    setSelectedProduct(item);
    setModalOpen(true);
  };

  const handleAddProduct = () => {
    navigate('/admin/products/new');
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedProduct(null);
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('products.title')}</h1>
          <p className="text-gray-600">{t('products.subtitle')}</p>
        </div>
        <button
          onClick={handleAddProduct}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-600 to-accent-600 text-white rounded-lg hover:shadow-lg transition-all"
        >
          <Plus className="w-5 h-5" />
          {t('products.addProduct')}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
          <div className="text-sm text-gray-600 mb-1">Total Products</div>
          <div className="text-3xl font-bold text-gray-900">{products.length}</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
          <div className="text-sm text-gray-600 mb-1">In Stock</div>
          <div className="text-3xl font-bold text-green-600">
            {products.filter(p => p.in_stock).length}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
          <div className="text-sm text-gray-600 mb-1">Out of Stock</div>
          <div className="text-3xl font-bold text-red-600">
            {products.filter(p => !p.in_stock).length}
          </div>
        </div>
      </div>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={products}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onView={handleView}
      />

      {/* Keep modal only for view mode */}
      <ProductModal
        isOpen={modalOpen}
        onClose={handleCloseModal}
        product={selectedProduct}
        mode="view"
      />
    </div>
  );
};
