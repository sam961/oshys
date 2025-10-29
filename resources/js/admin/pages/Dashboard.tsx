import React from 'react';
import { motion } from 'framer-motion';
import { Package, GraduationCap, Compass, BookOpen, Calendar, Users, Loader2 } from 'lucide-react';
import { StatCard } from '../components/StatCard';
import { useTranslation } from 'react-i18next';
import {
  useGetProductsQuery,
  useGetCoursesQuery,
  useGetTripsQuery,
  useGetBlogPostsQuery,
  useGetEventsQuery,
  useGetTeamMembersQuery,
} from '../../services/api';

export const Dashboard: React.FC = () => {
  const { t } = useTranslation('admin');
  // Fetch data from API
  const { data: products = [], isLoading: loadingProducts } = useGetProductsQuery({});
  const { data: courses = [], isLoading: loadingCourses } = useGetCoursesQuery({});
  const { data: trips = [], isLoading: loadingTrips } = useGetTripsQuery({});
  const { data: blogPosts = [], isLoading: loadingBlog } = useGetBlogPostsQuery({});
  const { data: events = [], isLoading: loadingEvents } = useGetEventsQuery({});
  const { data: teamMembers = [], isLoading: loadingTeam } = useGetTeamMembersQuery({});

  const isLoading = loadingProducts || loadingCourses || loadingTrips || loadingBlog || loadingEvents || loadingTeam;

  // Calculate real stats
  const stats = [
    {
      title: 'Total Products',
      value: products.length.toString(),
      icon: Package,
      trend: { value: `${products.filter(p => p.in_stock).length} in stock`, isPositive: true },
      color: 'bg-gradient-to-br from-blue-500 to-blue-600',
    },
    {
      title: 'Active Courses',
      value: courses.filter(c => c.is_active).length.toString(),
      icon: GraduationCap,
      trend: { value: `${courses.filter(c => c.is_featured).length} featured`, isPositive: true },
      color: 'bg-gradient-to-br from-green-500 to-green-600',
    },
    {
      title: 'Active Trips',
      value: trips.filter(t => t.is_active).length.toString(),
      icon: Compass,
      trend: { value: `${trips.filter(t => t.is_featured).length} featured`, isPositive: true },
      color: 'bg-gradient-to-br from-purple-500 to-purple-600',
    },
    {
      title: 'Blog Posts',
      value: blogPosts.length.toString(),
      icon: BookOpen,
      trend: { value: `${blogPosts.filter(b => b.is_published).length} published`, isPositive: true },
      color: 'bg-gradient-to-br from-orange-500 to-orange-600',
    },
    {
      title: 'Upcoming Events',
      value: events.filter(e => e.is_active).length.toString(),
      icon: Calendar,
      trend: { value: `${events.filter(e => e.type === 'workshop').length} workshops`, isPositive: true },
      color: 'bg-gradient-to-br from-cyan-500 to-cyan-600',
    },
    {
      title: 'Team Members',
      value: teamMembers.length.toString(),
      icon: Users,
      trend: { value: `${teamMembers.filter(t => t.is_active).length} active`, isPositive: true },
      color: 'bg-gradient-to-br from-pink-500 to-pink-600',
    },
    {
      title: 'Total Inventory',
      value: products.reduce((sum, p) => sum + p.stock_quantity, 0).toString(),
      icon: Package,
      trend: { value: 'Total units', isPositive: true },
      color: 'bg-gradient-to-br from-emerald-500 to-emerald-600',
    },
    {
      title: 'Categories',
      value: new Set([
        ...products.filter(p => p.category_id).map(p => p.category_id),
        ...courses.filter(c => c.category_id).map(c => c.category_id),
        ...trips.filter(t => t.category_id).map(t => t.category_id),
      ]).size.toString(),
      icon: BookOpen,
      trend: { value: 'Active categories', isPositive: true },
      color: 'bg-gradient-to-br from-indigo-500 to-indigo-600',
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('dashboard.title')}</h1>
        <p className="text-gray-600">{t('dashboard.welcome')}</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <StatCard {...stat} />
          </motion.div>
        ))}
      </div>

      {/* Recent Activity & Quick Actions */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Items */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
        >
          <h2 className="text-xl font-bold text-gray-900 mb-6">Recent Items</h2>
          <div className="space-y-4">
            {/* Latest Products */}
            {products.slice(0, 2).map((product, index) => (
              <div key={`product-${index}`} className="flex items-start gap-4 pb-4 border-b border-gray-100">
                <div className="w-10 h-10 rounded-full flex items-center justify-center bg-blue-100 text-blue-600">
                  <Package className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{product.name}</p>
                  <p className="text-sm text-gray-600">SAR {product.price}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {product.in_stock ? `${product.stock_quantity} in stock` : 'Out of stock'}
                  </p>
                </div>
              </div>
            ))}
            {/* Latest Courses */}
            {courses.slice(0, 2).map((course, index) => (
              <div key={`course-${index}`} className="flex items-start gap-4 pb-4 border-b border-gray-100">
                <div className="w-10 h-10 rounded-full flex items-center justify-center bg-green-100 text-green-600">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{course.name}</p>
                  <p className="text-sm text-gray-600">{course.level} - {course.duration}</p>
                  <p className="text-xs text-gray-400 mt-1">SAR {course.price}</p>
                </div>
              </div>
            ))}
            {/* Latest Trip */}
            {trips.slice(0, 1).map((trip, index) => (
              <div key={`trip-${index}`} className="flex items-start gap-4 pb-4 border-b border-gray-100 last:border-0">
                <div className="w-10 h-10 rounded-full flex items-center justify-center bg-purple-100 text-purple-600">
                  <Compass className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{trip.name}</p>
                  <p className="text-sm text-gray-600">{trip.location} - {trip.duration}</p>
                  <p className="text-xs text-gray-400 mt-1">SAR {trip.price}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
        >
          <h2 className="text-xl font-bold text-gray-900 mb-6">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-4">
            <button className="p-4 border-2 border-gray-200 rounded-xl hover:border-primary-500 hover:bg-primary-50 transition-all text-left group">
              <Package className="w-6 h-6 text-primary-600 mb-2" />
              <div className="font-semibold text-gray-900 group-hover:text-primary-600">Add Product</div>
              <div className="text-xs text-gray-500">Create new item</div>
            </button>

            <button className="p-4 border-2 border-gray-200 rounded-xl hover:border-green-500 hover:bg-green-50 transition-all text-left group">
              <GraduationCap className="w-6 h-6 text-green-600 mb-2" />
              <div className="font-semibold text-gray-900 group-hover:text-green-600">Add Course</div>
              <div className="text-xs text-gray-500">Create new course</div>
            </button>

            <button className="p-4 border-2 border-gray-200 rounded-xl hover:border-purple-500 hover:bg-purple-50 transition-all text-left group">
              <Compass className="w-6 h-6 text-purple-600 mb-2" />
              <div className="font-semibold text-gray-900 group-hover:text-purple-600">Add Trip</div>
              <div className="text-xs text-gray-500">Create new trip</div>
            </button>

            <button className="p-4 border-2 border-gray-200 rounded-xl hover:border-orange-500 hover:bg-orange-50 transition-all text-left group">
              <BookOpen className="w-6 h-6 text-orange-600 mb-2" />
              <div className="font-semibold text-gray-900 group-hover:text-orange-600">Add Blog Post</div>
              <div className="text-xs text-gray-500">Write new post</div>
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
