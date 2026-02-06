import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Share2,
  Loader2,
  Tag,
  CalendarCheck,
  Info
} from 'lucide-react';
import { Section, Button, SaudiRiyalPrice } from '../components/ui';
import { useGetEventQuery } from '../services/api';
import { useTranslation } from 'react-i18next';

export const EventDetailPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const { data: event, isLoading, error } = useGetEventQuery(Number(id));

  const dateLocale = i18n.language === 'ar' ? 'ar-SA' : 'en-US';

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(dateLocale, {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString(dateLocale, {
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'workshop':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'course':
        return 'bg-accent-100 text-accent-700 border-accent-200';
      case 'trip':
        return 'bg-primary-100 text-primary-700 border-primary-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getTypeLabel = (type: string) => {
    return t(`events.${type}`, type.charAt(0).toUpperCase() + type.slice(1));
  };

  const isUpcoming = event ? new Date(event.start_date) >= new Date() : false;

  if (isLoading) {
    return (
      <div className="pt-20 min-h-screen flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-primary-600" />
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="pt-20 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{t('common.eventNotFound')}</h1>
          <p className="text-gray-600">{t('common.eventNotFoundMessage')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-20">
      {/* Hero Section */}
      <div className="relative h-[400px] overflow-hidden bg-gradient-to-br from-primary-600 via-primary-700 to-accent-600">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>

        {/* Hero Content */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4"
            >
              <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold border ${getTypeColor(event.type)}`}>
                <Tag className="w-4 h-4" />
                {getTypeLabel(event.type)}
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 max-w-4xl"
            >
              {event.title}
            </motion.h1>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex flex-wrap items-center justify-center gap-6 text-white/90"
            >
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                <span>{formatDate(event.start_date)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                <span>{formatTime(event.start_date)}</span>
              </div>
              {event.location && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  <span>{event.location}</span>
                </div>
              )}
            </motion.div>
          </div>
        </div>

        {/* Status Badge */}
        <div className="absolute bottom-6 right-6">
          {isUpcoming ? (
            <span className="px-4 py-2 bg-green-500 text-white rounded-full font-semibold flex items-center gap-2">
              <CalendarCheck className="w-4 h-4" />
              {t('events.upcoming')}
            </span>
          ) : (
            <span className="px-4 py-2 bg-gray-500 text-white rounded-full font-semibold">
              {t('events.pastEvent')}
            </span>
          )}
        </div>
      </div>

      {/* Event Details */}
      <Section background="white">
        <div className="max-w-4xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Description */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Info className="w-6 h-6 text-primary-600" />
                  {t('events.aboutThisEvent')}
                </h2>
                <div className="prose prose-lg max-w-none text-gray-600">
                  <p className="leading-relaxed">{event.description}</p>
                </div>
              </motion.div>

              {/* Event Timeline */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-gray-50 rounded-2xl p-6"
              >
                <h3 className="text-xl font-bold text-gray-900 mb-4">{t('events.eventSchedule')}</h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Calendar className="w-6 h-6 text-primary-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{t('events.startDate')}</p>
                      <p className="text-gray-600">{formatDate(event.start_date)} {t('events.at')} {formatTime(event.start_date)}</p>
                    </div>
                  </div>
                  {event.end_date && (
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-accent-100 rounded-xl flex items-center justify-center flex-shrink-0">
                        <CalendarCheck className="w-6 h-6 text-accent-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{t('events.endDate')}</p>
                        <p className="text-gray-600">{formatDate(event.end_date)} {t('events.at')} {formatTime(event.end_date)}</p>
                      </div>
                    </div>
                  )}
                  {event.location && (
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                        <MapPin className="w-6 h-6 text-green-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{t('common.location')}</p>
                        <p className="text-gray-600">{event.location}</p>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-white border border-gray-200 rounded-2xl p-6 shadow-lg sticky top-28"
              >
                {/* Price */}
                <div className="text-center mb-6 pb-6 border-b border-gray-200">
                  {event.price ? (
                    <>
                      <p className="text-sm text-gray-500 mb-1">{t('events.eventPrice')}</p>
                      <SaudiRiyalPrice
                        amount={event.price}
                        className="text-4xl font-bold bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent"
                      />
                    </>
                  ) : (
                    <span className="inline-block px-6 py-3 bg-green-100 text-green-700 rounded-full text-xl font-bold">
                      {t('common.freeEvent')}
                    </span>
                  )}
                </div>

                {/* Event Info */}
                <div className="space-y-4 mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                      <Tag className="w-5 h-5 text-primary-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">{t('common.type')}</p>
                      <p className="font-semibold text-gray-900 capitalize">{getTypeLabel(event.type)}</p>
                    </div>
                  </div>

                  {event.max_participants && (
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-accent-100 rounded-lg flex items-center justify-center">
                        <Users className="w-5 h-5 text-accent-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">{t('common.capacity')}</p>
                        <p className="font-semibold text-gray-900">{event.max_participants} {t('common.participants')}</p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <CalendarCheck className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">{t('common.status')}</p>
                      <p className={`font-semibold ${isUpcoming ? 'text-green-600' : 'text-gray-500'}`}>
                        {isUpcoming ? t('common.openForRegistration') : t('common.eventEnded')}
                      </p>
                    </div>
                  </div>
                </div>

                {/* CTA Buttons */}
                {isUpcoming && (
                  <div className="space-y-3">
                    <Link to="/contact" className="block">
                      <Button variant="primary" className="w-full" size="lg">
                        {t('common.registerNow')}
                      </Button>
                    </Link>
                    <button
                      onClick={() => {
                        if (navigator.share) {
                          navigator.share({
                            title: event.title,
                            text: event.description,
                            url: window.location.href,
                          });
                        } else {
                          navigator.clipboard.writeText(window.location.href);
                          alert(t('common.linkCopied'));
                        }
                      }}
                      className="w-full flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium"
                    >
                      <Share2 className="w-5 h-5" />
                      {t('common.shareEvent')}
                    </button>
                  </div>
                )}

                {!isUpcoming && (
                  <div className="text-center py-4 bg-gray-100 rounded-lg">
                    <p className="text-gray-600">{t('common.thisEventHasEnded')}</p>
                  </div>
                )}
              </motion.div>
            </div>
          </div>

        </div>
      </Section>
    </div>
  );
};
