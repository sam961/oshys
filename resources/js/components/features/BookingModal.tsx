import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Mail, Phone, Loader2, CheckCircle, Clock, MapPin, Award, Users } from 'lucide-react';
import { Button } from '../ui';
import { useCreateBookingMutation } from '../../services/api';
import { useTranslation } from 'react-i18next';
import type { Course, Trip } from '../../types';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: Course | Trip;
  type: 'course' | 'trip';
}

export const BookingModal: React.FC<BookingModalProps> = ({ isOpen, onClose, item, type }) => {
  const { t } = useTranslation();
  const [createBooking, { isLoading }] = useCreateBookingMutation();
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = t('booking.errors.nameRequired');
    }

    if (!formData.email.trim()) {
      newErrors.email = t('booking.errors.emailRequired');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = t('booking.errors.emailInvalid');
    }

    if (!formData.phone.trim()) {
      newErrors.phone = t('booking.errors.phoneRequired');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      await createBooking({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        bookable_type: type,
        bookable_id: item.id,
      }).unwrap();

      setSubmitted(true);
    } catch (error) {
      console.error('Booking failed:', error);
    }
  };

  const handleClose = () => {
    setFormData({ name: '', email: '', phone: '' });
    setErrors({});
    setSubmitted(false);
    onClose();
  };

  const isCourse = type === 'course';
  const course = item as Course;
  const trip = item as Trip;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={handleClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header with image */}
            <div className="relative h-48 overflow-hidden">
              {(item as any).image_url ? (
                <img
                  src={(item as any).image_url}
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-primary-500 to-accent-500" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

              {/* Close button */}
              <button
                onClick={handleClose}
                className="absolute top-4 right-4 p-2 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>

              {/* Item info overlay */}
              <div className="absolute bottom-4 left-4 right-4 text-white">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium">
                    {isCourse ? course.level : trip.difficulty}
                  </span>
                </div>
                <h2 className="text-2xl font-bold">{item.name}</h2>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-12rem)]">
              {submitted ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center py-8"
                >
                  <div className="w-20 h-20 mx-auto mb-6 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-10 h-10 text-green-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    {t('booking.successTitle')}
                  </h3>
                  <p className="text-gray-600 mb-6">
                    {t('booking.successMessage')}
                  </p>
                  <Button onClick={handleClose} variant="primary">
                    {t('common.close')}
                  </Button>
                </motion.div>
              ) : (
                <>
                  {/* Item details */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6 p-4 bg-gray-50 rounded-xl">
                    <div className="text-center">
                      <Clock className="w-5 h-5 mx-auto mb-1 text-primary-600" />
                      <p className="text-xs text-gray-500">{t('booking.duration')}</p>
                      <p className="font-semibold text-gray-900">{item.duration}</p>
                    </div>
                    {isCourse ? (
                      <>
                        <div className="text-center">
                          <Award className="w-5 h-5 mx-auto mb-1 text-primary-600" />
                          <p className="text-xs text-gray-500">{t('booking.level')}</p>
                          <p className="font-semibold text-gray-900">{course.level}</p>
                        </div>
                        <div className="text-center">
                          <Users className="w-5 h-5 mx-auto mb-1 text-primary-600" />
                          <p className="text-xs text-gray-500">{t('booking.maxStudents')}</p>
                          <p className="font-semibold text-gray-900">{course.max_students || '-'}</p>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="text-center">
                          <MapPin className="w-5 h-5 mx-auto mb-1 text-primary-600" />
                          <p className="text-xs text-gray-500">{t('booking.location')}</p>
                          <p className="font-semibold text-gray-900 truncate">{trip.location}</p>
                        </div>
                        <div className="text-center">
                          <Users className="w-5 h-5 mx-auto mb-1 text-primary-600" />
                          <p className="text-xs text-gray-500">{t('booking.maxParticipants')}</p>
                          <p className="font-semibold text-gray-900">{trip.max_participants || '-'}</p>
                        </div>
                      </>
                    )}
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary-600">
                        SAR {item.price}
                      </div>
                      <p className="text-xs text-gray-500">{t('booking.price')}</p>
                    </div>
                  </div>

                  {/* Form */}
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      {t('booking.fillDetails')}
                    </h3>

                    {/* Name field */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t('booking.name')} *
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all ${
                            errors.name ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder={t('booking.namePlaceholder')}
                        />
                      </div>
                      {errors.name && (
                        <p className="mt-1 text-sm text-red-500">{errors.name}</p>
                      )}
                    </div>

                    {/* Email field */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t('booking.email')} *
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all ${
                            errors.email ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder={t('booking.emailPlaceholder')}
                        />
                      </div>
                      {errors.email && (
                        <p className="mt-1 text-sm text-red-500">{errors.email}</p>
                      )}
                    </div>

                    {/* Phone field */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t('booking.phone')} *
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all ${
                            errors.phone ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder={t('booking.phonePlaceholder')}
                        />
                      </div>
                      {errors.phone && (
                        <p className="mt-1 text-sm text-red-500">{errors.phone}</p>
                      )}
                    </div>

                    {/* Submit button */}
                    <div className="flex gap-3 pt-4">
                      <Button
                        type="button"
                        variant="outline"
                        className="flex-1"
                        onClick={handleClose}
                      >
                        {t('common.cancel')}
                      </Button>
                      <Button
                        type="submit"
                        variant="primary"
                        className="flex-1"
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            {t('booking.submitting')}
                          </>
                        ) : (
                          t('booking.submit')
                        )}
                      </Button>
                    </div>
                  </form>
                </>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
