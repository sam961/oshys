import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag, Filter, Loader2 } from 'lucide-react';
import { Section, Card, Button } from '../components/ui';
import { useGetProductsQuery, useGetCategoriesQuery } from '../services/api';
import type { Product, Category } from '../types';
import { useTranslation } from 'react-i18next';

export const ProductsPage: React.FC = () => {
  const { t } = useTranslation();
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);

  // Fetch products and categories from API
  const { data: products = [], isLoading: productsLoading, error: productsError } = useGetProductsQuery({ active: true });
  const { data: categories = [], isLoading: categoriesLoading } = useGetCategoriesQuery({ active: true, type: 'product' });

  const filteredProducts = selectedCategory
    ? products.filter((p) => p.category_id === selectedCategory)
    : products;

  return (
    <div className="pt-20">
      {/* Hero */}
      <Section background="gradient" className="text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <ShoppingBag className="w-16 h-16 mx-auto mb-6 text-primary-600" />
          <h1 className="text-5xl lg:text-6xl font-bold mb-6">
            {t('products.heroTitle')}<br />
            <span className="bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
              {t('products.heroSubtitle')}
            </span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            {t('products.heroDescription')}
          </p>
        </motion.div>
      </Section>

      {/* Filter */}
      <Section background="white" className="py-8">
        <div className="flex items-center gap-4 overflow-x-auto pb-2">
          <Filter className="w-5 h-5 text-gray-600 flex-shrink-0" />
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-4 py-2 rounded-full whitespace-nowrap transition-all ${
              selectedCategory === null
                ? 'bg-primary-600 text-white shadow-lg'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {t('products.all')}
          </button>
          {!categoriesLoading && categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-full whitespace-nowrap transition-all ${
                selectedCategory === cat.id
                  ? 'bg-primary-600 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </Section>

      {/* Products Grid */}
      <Section background="gray">
        {productsLoading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="w-12 h-12 animate-spin text-primary-600" />
          </div>
        ) : productsError ? (
          <div className="text-center py-12">
            <p className="text-red-600">{t('products.loadingError')}</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600">{t('products.noProducts')}</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="group cursor-pointer h-full">
                  <div className="relative overflow-hidden rounded-xl mb-4">
                    <img
                      src={product.image || 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=600&h=400&fit=crop'}
                      alt={product.name}
                      className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    {!product.in_stock && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                        <span className="bg-white px-4 py-2 rounded-full text-sm font-semibold">
                          {t('products.outOfStock')}
                        </span>
                      </div>
                    )}
                    {product.category && (
                      <div className="absolute top-3 right-3">
                        <span className="bg-primary-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
                          {product.category.name}
                        </span>
                      </div>
                    )}
                  </div>
                  <h3 className="text-lg font-bold mb-2">{product.name}</h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">{product.description}</p>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-2xl font-bold text-primary-600">SAR {product.price}</span>
                  </div>
                  <Button
                    variant="primary"
                    className="w-full"
                    disabled={!product.in_stock}
                  >
                    <ShoppingBag className="w-4 h-4" />
                    {product.in_stock ? t('products.addToCart') : t('products.outOfStock')}
                  </Button>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </Section>
    </div>
  );
};
