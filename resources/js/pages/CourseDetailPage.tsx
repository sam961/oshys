import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  GraduationCap,
  Clock,
  Award,
  Users,
  ArrowLeft,
  CheckCircle,
  Loader2,
  Info,
  Image as ImageIcon,
  Share2,
  X,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { Section, Button, SaudiRiyalPrice } from '../components/ui';
import { BookingModal } from '../components/features/BookingModal';
import { useGetCourseQuery } from '../services/api';
import { useTranslation } from 'react-i18next';

export const CourseDetailPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const { data: course, isLoading, error } = useGetCourseQuery(Number(id));
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const isRTL = i18n.language === 'ar';

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: course?.name,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  const openLightbox = (url: string, index: number) => {
    setLightboxImage(url);
    setLightboxIndex(index);
  };

  const navigateLightbox = (direction: 'prev' | 'next') => {
    if (!course?.images) return;
    const newIndex = direction === 'next'
      ? (lightboxIndex + 1) % course.images.length
      : (lightboxIndex - 1 + course.images.length) % course.images.length;
    setLightboxIndex(newIndex);
    const img = course.images[newIndex];
    setLightboxImage(img.full_url || img.url);
  };

  if (isLoading) {
    return (
      <div className="pt-20 min-h-screen flex items-center justify-center bg-gray-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <Loader2 className="w-12 h-12 animate-spin text-accent-600 mx-auto mb-4" />
          <p className="text-gray-500 font-medium">{t('common.loading')}...</p>
        </motion.div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="pt-20 min-h-screen flex items-center justify-center bg-gray-50">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md mx-auto px-6"
        >
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <GraduationCap className="w-10 h-10 text-gray-400" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-3">{t('pages.courses.notFound')}</h1>
          <p className="text-gray-500 mb-8">{t('pages.courses.notFoundMessage')}</p>
          <Link to="/shop/courses">
            <Button variant="primary" size="lg">
              <ArrowLeft className="w-5 h-5" />
              {t('pages.courses.backToCourses')}
            </Button>
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="pt-20 bg-gray-50 min-h-screen">
      {/* Hero Section */}
      <div className="relative h-[350px] md:h-[450px] overflow-hidden">
        {course.image_url ? (
          <>
            <motion.img
              initial={{ scale: 1.1 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              src={course.image_url}
              alt={course.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/10" />
          </>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-accent-600 via-primary-700 to-primary-900">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0" style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
              }} />
            </div>
          </div>
        )}

        {/* Top Bar */}
        <div className="absolute top-0 left-0 right-0 z-10">
          <div className="container mx-auto px-6 pt-6 flex items-center justify-between">
            <Link
              to="/shop/courses"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-black/30 backdrop-blur-md text-white/90 hover:bg-black/50 hover:text-white transition-all text-sm font-medium"
            >
              <ArrowLeft className="w-4 h-4" />
              {t('pages.courses.backToCourses')}
            </Link>
            <button
              onClick={handleShare}
              className="p-2.5 rounded-full bg-black/30 backdrop-blur-md text-white/90 hover:bg-black/50 hover:text-white transition-all"
            >
              <Share2 className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Hero Content */}
        <div className="absolute inset-0 flex items-end">
          <div className="container mx-auto px-6 pb-8">
            <div className="flex flex-wrap items-center gap-2 mb-4">
              {course.level && (
                <motion.span
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-accent-500 text-white uppercase tracking-wide"
                >
                  <Award className="w-3.5 h-3.5" />
                  {course.level}
                </motion.span>
              )}
            </div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-3 max-w-4xl leading-tight"
            >
              {course.name}
            </motion.h1>

            {/* Quick Info Chips */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex flex-wrap items-center gap-4 mt-5"
            >
              {course.duration && (
                <div className="flex items-center gap-1.5 text-white/80 text-sm">
                  <Clock className="w-4 h-4" />
                  <span>{course.duration}</span>
                </div>
              )}
              {course.max_students && (
                <div className="flex items-center gap-1.5 text-white/80 text-sm">
                  <Users className="w-4 h-4" />
                  <span>{t('pages.courses.maxStudents')}: {course.max_students}</span>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="container mx-auto px-6 -mt-6 relative z-10 pb-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100"
            >
              <h2 className="text-xl font-bold text-gray-900 mb-5 flex items-center gap-2">
                <div className="w-8 h-8 bg-accent-100 rounded-lg flex items-center justify-center">
                  <Info className="w-4 h-4 text-accent-600" />
                </div>
                {t('pages.courses.aboutCourse')}
              </h2>
              <div
                className="prose prose-lg max-w-none text-gray-600 prose-headings:text-gray-900 prose-a:text-accent-600 prose-strong:text-gray-800"
                dangerouslySetInnerHTML={{ __html: course.description }}
              />
            </motion.div>

            {/* Requirements Card */}
            {course.requirements && course.requirements.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100"
              >
                <h3 className="text-xl font-bold text-gray-900 mb-5 flex items-center gap-2">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  </div>
                  {t('pages.courses.requirements')}
                </h3>
                <div className="grid sm:grid-cols-2 gap-3">
                  {course.requirements.map((req, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.35 + index * 0.05 }}
                      className="flex items-start gap-3 p-3 rounded-xl bg-green-50/50 border border-green-100"
                    >
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700 text-sm">{req}</span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Image Gallery Card */}
            {course.images && course.images.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
                className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100"
              >
                <h3 className="text-xl font-bold text-gray-900 mb-5 flex items-center gap-2">
                  <div className="w-8 h-8 bg-accent-100 rounded-lg flex items-center justify-center">
                    <ImageIcon className="w-4 h-4 text-accent-600" />
                  </div>
                  {t('pages.courses.gallery')}
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {course.images.map((img, index) => (
                    <motion.button
                      key={img.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => openLightbox(img.full_url || img.url, index)}
                      className="relative overflow-hidden rounded-xl aspect-square group cursor-pointer"
                    >
                      <img
                        src={img.full_url || img.url}
                        alt={img.filename}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300 flex items-center justify-center">
                        <ImageIcon className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      </div>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 sticky top-28"
            >
              {/* Price */}
              <div className="text-center mb-6 pb-6 border-b border-gray-100">
                <p className="text-sm text-gray-400 mb-2">{t('pages.courses.startingFrom')}</p>
                <SaudiRiyalPrice
                  amount={course.price}
                  className="text-4xl font-bold bg-gradient-to-r from-accent-600 to-primary-600 bg-clip-text text-transparent"
                />
              </div>

              {/* Course Info */}
              <div className="space-y-3 mb-6">
                {course.duration && (
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
                    <div className="w-10 h-10 bg-accent-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Clock className="w-5 h-5 text-accent-600" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-gray-400 uppercase tracking-wide">{t('pages.courses.duration')}</p>
                      <p className="font-semibold text-gray-900 text-sm">{course.duration}</p>
                    </div>
                  </div>
                )}

                {course.level && (
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
                    <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Award className="w-5 h-5 text-primary-600" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-gray-400 uppercase tracking-wide">{t('pages.courses.level')}</p>
                      <p className="font-semibold text-gray-900 text-sm">{course.level}</p>
                    </div>
                  </div>
                )}

                {course.max_students && (
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Users className="w-5 h-5 text-green-600" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-gray-400 uppercase tracking-wide">{t('pages.courses.maxStudents')}</p>
                      <p className="font-semibold text-gray-900 text-sm">{course.max_students}</p>
                    </div>
                  </div>
                )}

              </div>

              {/* CTA Button */}
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  variant="primary"
                  className="w-full shadow-lg shadow-accent-500/20"
                  size="lg"
                  onClick={() => setIsBookingOpen(true)}
                >
                  <Sparkles className="w-5 h-5" />
                  {t('pages.courses.enrollNow')}
                </Button>
              </motion.div>

              <p className="text-xs text-gray-400 text-center mt-4 leading-relaxed">
                {t('pages.courses.ctaDescription')}
              </p>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Mobile Sticky CTA */}
      <div className="fixed bottom-0 left-0 right-0 z-40 lg:hidden">
        <div className="bg-white/95 backdrop-blur-md border-t border-gray-200 px-4 py-3 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
          <div className="flex items-center gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-400">{t('pages.courses.startingFrom')}</p>
              <SaudiRiyalPrice
                amount={course.price}
                className="text-lg font-bold text-gray-900"
              />
            </div>
            <Button
              variant="primary"
              size="lg"
              onClick={() => setIsBookingOpen(true)}
              className="shadow-lg shadow-accent-500/20"
            >
              {t('pages.courses.enrollNow')}
            </Button>
          </div>
        </div>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
            onClick={() => setLightboxImage(null)}
          >
            {/* Close Button */}
            <button
              onClick={() => setLightboxImage(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors z-10"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Navigation Arrows */}
            {course.images && course.images.length > 1 && (
              <>
                <button
                  onClick={(e) => { e.stopPropagation(); navigateLightbox('prev'); }}
                  className="absolute left-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors z-10"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); navigateLightbox('next'); }}
                  className="absolute right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors z-10"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}

            <motion.img
              key={lightboxImage}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2 }}
              src={lightboxImage}
              alt=""
              className="max-w-full max-h-[85vh] object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />

            {/* Image Counter */}
            {course.images && course.images.length > 1 && (
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm text-white text-sm font-medium">
                {lightboxIndex + 1} / {course.images.length}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Booking Modal */}
      <BookingModal
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
        item={course}
        type="course"
      />
    </div>
  );
};
