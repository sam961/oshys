import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GraduationCap, Clock, BarChart3, Loader2, Filter, Grid3x3, List, Heart, BookOpen, Users, Award, Star, CheckCircle2 } from 'lucide-react';
import { Section, Card, Button, GridSkeleton } from '../components/ui';
import { StaggerContainer, WaveBackground } from '../components/animations';
import { BookingModal } from '../components/features/BookingModal';
import { useGetCoursesQuery } from '../services/api';
import type { Course } from '../types';
import { useTranslation } from 'react-i18next';

export const CoursesPage: React.FC = () => {
  const { t } = useTranslation();
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'default' | 'price-low' | 'price-high' | 'duration'>('default');
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [isBookingOpen, setIsBookingOpen] = useState(false);

  const handleEnrollClick = (e: React.MouseEvent, course: Course) => {
    e.stopPropagation();
    setSelectedCourse(course);
    setIsBookingOpen(true);
  };

  // Fetch courses from API
  const { data: courses = [], isLoading: coursesLoading, error: coursesError } = useGetCoursesQuery({ active: true });

  const levels = ['Beginner', 'Intermediate', 'Advanced', 'Professional'];

  const filteredCourses = selectedLevel
    ? courses.filter((c) => c.level === selectedLevel)
    : courses;

  const sortedCourses = [...filteredCourses].sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return parseFloat(a.price) - parseFloat(b.price);
      case 'price-high':
        return parseFloat(b.price) - parseFloat(a.price);
      case 'duration':
        return a.duration.localeCompare(b.duration);
      default:
        return 0;
    }
  });

  return (
    <div className="pt-20">
      {/* Compact Hero */}
      <div className="bg-gradient-to-br from-accent-50 via-white to-primary-50 relative overflow-hidden">
        <WaveBackground variant="accent" opacity={0.03} />
        <div className="container mx-auto px-6 py-12 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between"
          >
            <div>
              <div className="flex items-center gap-3 mb-3">
                <GraduationCap className="w-8 h-8 text-accent-600" />
                <h1 className="text-4xl lg:text-5xl font-bold">
                  <span className="bg-gradient-to-r from-accent-600 to-primary-600 bg-clip-text text-transparent">
                    {t('pages.courses.heroTitle')}
                  </span>
                </h1>
              </div>
              <p className="text-gray-600 max-w-2xl">
                {t('pages.courses.heroDescription')}
              </p>
            </div>

            {/* Stats */}
            <div className="hidden lg:flex gap-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-accent-600">{courses.length}+</div>
                <div className="text-sm text-gray-600">{t('pages.courses.totalCourses')}</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary-600">500+</div>
                <div className="text-sm text-gray-600">{t('pages.courses.students')}</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-secondary-600">98%</div>
                <div className="text-sm text-gray-600">{t('pages.courses.satisfaction')}</div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Enhanced Filter & Toolbar */}
      <div className="bg-white border-b border-gray-200 sticky top-20 z-40 shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Level Filters */}
            <div className="flex items-center gap-3 overflow-x-auto scrollbar-hide">
              <Filter className="w-5 h-5 text-gray-600 flex-shrink-0" />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedLevel(null)}
                className={`px-5 py-2 rounded-full whitespace-nowrap transition-all font-medium ${
                  selectedLevel === null
                    ? 'bg-gradient-to-r from-accent-600 to-accent-500 text-white shadow-lg shadow-accent-500/30'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All Levels
              </motion.button>
              {levels.map((level) => (
                <motion.button
                  key={level}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedLevel(level)}
                  className={`px-5 py-2 rounded-full whitespace-nowrap transition-all font-medium ${
                    selectedLevel === level
                      ? 'bg-gradient-to-r from-accent-600 to-accent-500 text-white shadow-lg shadow-accent-500/30'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {level}
                </motion.button>
              ))}
            </div>

            {/* View Controls */}
            <div className="flex items-center gap-4">
              {/* Sort Dropdown */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent"
              >
                <option value="default">Sort: Default</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="duration">Duration</option>
              </select>

              {/* View Toggle */}
              <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded transition-all ${
                    viewMode === 'grid'
                      ? 'bg-white text-accent-600 shadow'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Grid3x3 className="w-5 h-5" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded transition-all ${
                    viewMode === 'list'
                      ? 'bg-white text-accent-600 shadow'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <List className="w-5 h-5" />
                </motion.button>
              </div>

              {/* Results Count */}
              <div className="hidden md:block text-sm text-gray-600">
                {sortedCourses.length} courses
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Courses Grid */}
      <div className="bg-gray-50 min-h-screen">
        <div className="container mx-auto px-6 py-8">
        {coursesLoading ? (
          <GridSkeleton count={6} />
        ) : coursesError ? (
          <div className="text-center py-12">
            <p className="text-red-600">{t('pages.courses.loadingError')}</p>
          </div>
        ) : sortedCourses.length === 0 ? (
          <div className="text-center py-20">
            <GraduationCap className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <p className="text-xl text-gray-600">{t('pages.courses.noCourses')}</p>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <StaggerContainer
              key={viewMode}
              staggerDelay={0.05}
              className={viewMode === 'grid' ? 'grid md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}
            >
            {sortedCourses.map((course) => (
              viewMode === 'grid' ? (
                <Card key={course.id} className="h-full group cursor-pointer overflow-hidden relative">
                  {/* Quick Actions */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    whileHover={{ opacity: 1 }}
                    className="absolute top-3 right-3 flex flex-col gap-2 z-10"
                  >
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="p-2 bg-white rounded-full shadow-lg hover:bg-accent-50 transition-colors"
                      title="Add to Favorites"
                    >
                      <Heart className="w-4 h-4 text-gray-700" />
                    </motion.button>
                  </motion.div>

                  <div className="relative overflow-hidden rounded-xl mb-4">
                    {(course as any).image_url ? (
                      <img
                        src={(course as any).image_url}
                        alt={course.name}
                        className="w-full h-56 object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-56 bg-gray-100 flex items-center justify-center">
                        <div className="text-center">
                          <BookOpen className="w-16 h-16 mx-auto text-gray-300 mb-2" />
                          <p className="text-sm text-gray-400">{t('courses.noImage')}</p>
                        </div>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
                      <span className="bg-white/90 backdrop-blur-sm text-gray-900 px-3 py-1 rounded-full text-xs font-semibold">
                        {course.level}
                      </span>
                      <div className="flex items-center gap-1 text-white text-sm">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-semibold">4.9</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-xl font-bold line-clamp-2 group-hover:text-accent-600 transition-colors">
                      {course.name}
                    </h3>

                    <p className="text-gray-600 text-sm line-clamp-2 leading-relaxed">
                      {course.description}
                    </p>

                    <div className="flex flex-wrap gap-2">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Clock className="w-4 h-4 text-accent-600" />
                        <span>{course.duration}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <BookOpen className="w-4 h-4 text-accent-600" />
                        <span>12 Modules</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Users className="w-4 h-4 text-accent-600" />
                        <span>50+ Students</span>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-gray-100">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <p className="text-xs text-gray-500">Starting from</p>
                          <p className="text-2xl font-bold bg-gradient-to-r from-accent-600 to-primary-600 bg-clip-text text-transparent">
                            SAR {course.price}
                          </p>
                        </div>
                        <div className="flex items-center gap-1 text-sm">
                          <Award className="w-4 h-4 text-accent-600" />
                          <span className="text-gray-600">Certificate</span>
                        </div>
                      </div>
                      <Button variant="primary" className="w-full" size="sm" onClick={(e) => handleEnrollClick(e, course)}>
                        {t('pages.courses.enrollNow')}
                      </Button>
                    </div>
                  </div>
                </Card>
              ) : (
                <Card key={course.id} className="group cursor-pointer overflow-hidden hover:shadow-xl transition-shadow">
                  <div className="flex gap-6">
                    <div className="relative w-64 h-48 flex-shrink-0 overflow-hidden rounded-xl">
                      {(course as any).image_url ? (
                        <img
                          src={(course as any).image_url}
                          alt={course.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                          <div className="text-center">
                            <BookOpen className="w-12 h-12 mx-auto text-gray-300" />
                          </div>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                      <div className="absolute bottom-3 left-3">
                        <span className="bg-white/90 backdrop-blur-sm text-gray-900 px-3 py-1 rounded-full text-xs font-semibold">
                          {course.level}
                        </span>
                      </div>
                    </div>

                    <div className="flex-1 flex flex-col justify-between py-2">
                      <div>
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="text-2xl font-bold group-hover:text-accent-600 transition-colors">
                            {course.name}
                          </h3>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="p-2 hover:bg-accent-50 rounded-full transition-colors"
                          >
                            <Heart className="w-5 h-5 text-gray-700" />
                          </motion.button>
                        </div>
                        <p className="text-gray-600 mb-4 line-clamp-2">{course.description}</p>

                        <div className="flex flex-wrap gap-4 mb-4">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Clock className="w-5 h-5 text-accent-600" />
                            <span>{course.duration}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <BookOpen className="w-5 h-5 text-accent-600" />
                            <span>12 Modules</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Users className="w-5 h-5 text-accent-600" />
                            <span>50+ Enrolled</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                            <span>4.9 (120 reviews)</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="px-3 py-1 bg-accent-100 text-accent-700 rounded-full text-xs font-semibold flex items-center gap-1">
                            <Award className="w-3 h-3" />
                            Certificate Included
                          </span>
                          <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            Lifetime Access
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-4">
                        <div>
                          <p className="text-sm text-gray-500">Starting from</p>
                          <p className="text-3xl font-bold bg-gradient-to-r from-accent-600 to-primary-600 bg-clip-text text-transparent">
                            SAR {course.price}
                          </p>
                        </div>
                        <Button variant="primary" size="lg" onClick={(e) => handleEnrollClick(e, course)}>
                          {t('pages.courses.enrollNow')}
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

      {/* CTA Section */}
      <Section background="gradient">
        <Card className="bg-gradient-to-r from-primary-600 to-accent-600 text-white text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold mb-4">{t('pages.courses.ctaTitle')}</h2>
            <p className="text-xl mb-8 text-white/90 max-w-2xl mx-auto">
              {t('pages.courses.ctaDescription')}
            </p>
            <Button variant="secondary" size="lg" className="bg-white text-primary-600">
              {t('pages.courses.contactUs')}
            </Button>
          </motion.div>
        </Card>
      </Section>

      {/* Booking Modal */}
      {selectedCourse && (
        <BookingModal
          isOpen={isBookingOpen}
          onClose={() => setIsBookingOpen(false)}
          item={selectedCourse}
          type="course"
        />
      )}
    </div>
  );
};
