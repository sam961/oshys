import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Filter, Loader2, Grid3x3, List, Heart, Eye, Star, TrendingUp } from 'lucide-react';
import { Section, Card, Button, GridSkeleton, SaudiRiyalPrice } from '../components/ui';
import { StaggerContainer, ScrollReveal, WaveBackground } from '../components/animations';
import { useGetProductsQuery, useGetCategoriesQuery } from '../services/api';
import type { Product, Category } from '../types';
import { useTranslation } from 'react-i18next';

export const ProductsPage: React.FC = () => {
  const { t } = useTranslation();
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'default' | 'price-low' | 'price-high' | 'name'>('default');

  // Fetch products and categories from API
  const { data: products = [], isLoading: productsLoading, error: productsError } = useGetProductsQuery({ active: true });
  const { data: categories = [], isLoading: categoriesLoading } = useGetCategoriesQuery({ active: true, type: 'product' });

  const filteredProducts = selectedCategory
    ? products.filter((p) => p.category_id === selectedCategory)
    : products;

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return parseFloat(a.price) - parseFloat(b.price);
      case 'price-high':
        return parseFloat(b.price) - parseFloat(a.price);
      case 'name':
        return a.name.localeCompare(b.name);
      default:
        return 0;
    }
  });

  return (
    <div className="pt-20">
      {/* Compact Hero */}
      <div className="bg-gradient-to-br from-primary-50 via-white to-accent-50 relative overflow-hidden">
        <WaveBackground variant="primary" opacity={0.03} />
        <div className="container mx-auto px-6 py-12 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between"
          >
            <div>
              <div className="flex items-center gap-3 mb-3">
                <ShoppingBag className="w-8 h-8 text-primary-600" />
                <h1 className="text-4xl lg:text-5xl font-bold">
                  <span className="bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
                    {t('products.heroTitle')}
                  </span>
                </h1>
              </div>
              <p className="text-gray-600 max-w-2xl">
                {t('products.heroDescription')}
              </p>
            </div>

            {/* Stats */}
            <div className="hidden lg:flex gap-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary-600">{products.length}+</div>
                <div className="text-sm text-gray-600">{t('products.totalProducts')}</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-accent-600">{categories.length}</div>
                <div className="text-sm text-gray-600">{t('products.categories')}</div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Enhanced Filter & Toolbar */}
      <div className="bg-white border-b border-gray-200 sticky top-20 z-40 shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Category Filters */}
            <div className="flex items-center gap-3 overflow-x-auto scrollbar-hide">
              <Filter className="w-5 h-5 text-gray-600 flex-shrink-0" />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedCategory(null)}
                className={`px-5 py-2 rounded-full whitespace-nowrap transition-all font-medium ${
                  selectedCategory === null
                    ? 'bg-gradient-to-r from-primary-600 to-primary-500 text-white shadow-lg shadow-primary-500/30'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {t('products.all')}
              </motion.button>
              {!categoriesLoading && categories.map((cat) => (
                <motion.button
                  key={cat.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-5 py-2 rounded-full whitespace-nowrap transition-all font-medium ${
                    selectedCategory === cat.id
                      ? 'bg-gradient-to-r from-primary-600 to-primary-500 text-white shadow-lg shadow-primary-500/30'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {cat.name}
                </motion.button>
              ))}
            </div>

            {/* View Controls */}
            <div className="flex items-center gap-4">
              {/* Sort Dropdown */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="default">{t('products.sortDefault')}</option>
                <option value="price-low">{t('products.sortPriceLow')}</option>
                <option value="price-high">{t('products.sortPriceHigh')}</option>
                <option value="name">{t('products.sortName')}</option>
              </select>

              {/* View Toggle */}
              <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded transition-all ${
                    viewMode === 'grid'
                      ? 'bg-white text-primary-600 shadow'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                  title={t('common.gridView')}
                >
                  <Grid3x3 className="w-5 h-5" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded transition-all ${
                    viewMode === 'list'
                      ? 'bg-white text-primary-600 shadow'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                  title={t('common.listView')}
                >
                  <List className="w-5 h-5" />
                </motion.button>
              </div>

              {/* Results Count */}
              <div className="hidden md:block text-sm text-gray-600">
                {sortedProducts.length} {t('products.results')}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="bg-gray-50 min-h-screen">
        <div className="container mx-auto px-6 py-8">
        {productsLoading ? (
          <GridSkeleton count={8} />
        ) : productsError ? (
          <div className="text-center py-12">
            <p className="text-red-600">{t('products.loadingError')}</p>
          </div>
        ) : sortedProducts.length === 0 ? (
          <div className="text-center py-20">
            <ShoppingBag className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <p className="text-xl text-gray-600">{t('products.noProducts')}</p>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <StaggerContainer
              key={viewMode}
              staggerDelay={0.05}
              className={viewMode === 'grid' ? 'grid sm:grid-cols-2 lg:grid-cols-4 gap-6' : 'space-y-4'}
            >
            {sortedProducts.map((product) => (
              viewMode === 'grid' ? (
                <Card key={product.id} className="group cursor-pointer h-full overflow-hidden relative">
                  {/* Quick Actions Overlay */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    whileHover={{ opacity: 1 }}
                    className="absolute top-3 right-3 flex flex-col gap-2 z-10"
                  >
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="p-2 bg-white rounded-full shadow-lg hover:bg-primary-50 transition-colors"
                      title={t('products.addToWishlist')}
                    >
                      <Heart className="w-4 h-4 text-gray-700" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="p-2 bg-white rounded-full shadow-lg hover:bg-primary-50 transition-colors"
                      title={t('products.quickView')}
                    >
                      <Eye className="w-4 h-4 text-gray-700" />
                    </motion.button>
                  </motion.div>

                  <div className="relative overflow-hidden rounded-xl mb-4">
                    {(product as any).image_url ? (
                      <img
                        src={(product as any).image_url}
                        alt={product.name}
                        className="w-full h-56 object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-56 bg-gray-100 flex items-center justify-center">
                        <div className="text-center">
                          <ShoppingBag className="w-16 h-16 mx-auto text-gray-300 mb-2" />
                          <p className="text-sm text-gray-400">{t('products.noImage')}</p>
                        </div>
                      </div>
                    )}
                    {!product.in_stock && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                        <span className="bg-white px-4 py-2 rounded-full text-sm font-semibold">
                          {t('products.outOfStock')}
                        </span>
                      </div>
                    )}
                    {product.category && (
                      <div className="absolute bottom-3 left-3">
                        <span className="bg-white/90 backdrop-blur-sm text-gray-900 px-3 py-1 rounded-full text-xs font-semibold">
                          {product.category.name}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-lg font-bold line-clamp-2 group-hover:text-primary-600 transition-colors">
                      {product.name}
                    </h3>
                    <p className="text-gray-600 text-sm line-clamp-2">{product.description}</p>

                    <div className="flex items-center justify-between pt-2">
                      <SaudiRiyalPrice
                        amount={product.price}
                        className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent"
                      />
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span>4.8</span>
                      </div>
                    </div>

                    <Button
                      variant="primary"
                      className="w-full"
                      size="sm"
                      disabled={!product.in_stock}
                    >
                      <ShoppingBag className="w-4 h-4" />
                      {product.in_stock ? t('products.addToCart') : t('products.outOfStock')}
                    </Button>
                  </div>
                </Card>
              ) : (
                <Card key={product.id} className="group cursor-pointer overflow-hidden hover:shadow-xl transition-shadow">
                  <div className="flex gap-6">
                    <div className="relative w-48 h-48 flex-shrink-0 overflow-hidden rounded-xl">
                      {(product as any).image_url ? (
                        <img
                          src={(product as any).image_url}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                          <div className="text-center">
                            <ShoppingBag className="w-12 h-12 mx-auto text-gray-300" />
                          </div>
                        </div>
                      )}
                      {product.category && (
                        <div className="absolute bottom-3 left-3">
                          <span className="bg-white/90 backdrop-blur-sm text-gray-900 px-3 py-1 rounded-full text-xs font-semibold">
                            {product.category.name}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex-1 flex flex-col justify-between py-2">
                      <div>
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="text-2xl font-bold group-hover:text-primary-600 transition-colors">
                            {product.name}
                          </h3>
                          <div className="flex gap-2">
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              className="p-2 hover:bg-primary-50 rounded-full transition-colors"
                            >
                              <Heart className="w-5 h-5 text-gray-700" />
                            </motion.button>
                          </div>
                        </div>
                        <p className="text-gray-600 mb-4 line-clamp-3">{product.description}</p>
                        <div className="flex items-center gap-3 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            <span>4.8 (120 {t('products.reviews')})</span>
                          </div>
                          {product.in_stock ? (
                            <span className="text-green-600 flex items-center gap-1">
                              <TrendingUp className="w-4 h-4" />
                              {t('products.inStock')}
                            </span>
                          ) : (
                            <span className="text-red-600">{t('products.outOfStock')}</span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <SaudiRiyalPrice
                          amount={product.price}
                          className="text-3xl font-bold bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent"
                        />
                        <Button
                          variant="primary"
                          disabled={!product.in_stock}
                        >
                          <ShoppingBag className="w-4 h-4" />
                          {product.in_stock ? t('products.addToCart') : t('products.outOfStock')}
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              )
            ))}
            </StaggerContainer>
          </AnimatePresence>
        )}
        </div>
      </div>
    </div>
  );
};
