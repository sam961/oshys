import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Clock, MapPin, Users, Filter, Grid3x3, List, ArrowRight } from 'lucide-react';
import { Section, Card, Button, GridSkeleton, SaudiRiyalPrice } from '../components/ui';
import { StaggerContainer, WaveBackground } from '../components/animations';
import { useGetEventsQuery } from '../services/api';
import type { Event } from '../types';
import { useTranslation } from 'react-i18next';

export const EventsPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'default' | 'date-asc' | 'date-desc' | 'price'>('default');

  // Fetch events from API
  const { data: events = [], isLoading, error } = useGetEventsQuery({ active: true });

  const eventTypes = [
    { key: 'workshop', label: t('events.workshop') },
    { key: 'course', label: t('events.course') },
    { key: 'trip', label: t('events.trip') },
    { key: 'other', label: t('events.other') },
  ];

  const getTypeLabel = (type: string) => {
    const typeObj = eventTypes.find(et => et.key === type);
    return typeObj ? typeObj.label : type.charAt(0).toUpperCase() + type.slice(1);
  };

  const currentLocale = i18n.language === 'ar' ? 'ar-SA' : 'en-US';

  // Filter upcoming events only
  const now = new Date();
  const upcomingEvents = events.filter(event => new Date(event.start_date) >= now);

  const filteredEvents = selectedType
    ? upcomingEvents.filter((e) => e.type === selectedType)
    : upcomingEvents;

  const sortedEvents = [...filteredEvents].sort((a, b) => {
    switch (sortBy) {
      case 'date-asc':
        return new Date(a.start_date).getTime() - new Date(b.start_date).getTime();
      case 'date-desc':
        return new Date(b.start_date).getTime() - new Date(a.start_date).getTime();
      case 'price':
        return (a.price || 0) - (b.price || 0);
      default:
        return new Date(a.start_date).getTime() - new Date(b.start_date).getTime();
    }
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(currentLocale, {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString(currentLocale, {
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const formatMonth = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(currentLocale, { month: 'short' });
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'workshop':
        return 'bg-purple-100 text-purple-700';
      case 'course':
        return 'bg-accent-100 text-accent-700';
      case 'trip':
        return 'bg-primary-100 text-primary-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

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
                <Calendar className="w-8 h-8 text-primary-600" />
                <h1 className="text-4xl lg:text-5xl font-bold">
                  <span className="bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
                    {t('events.heroTitle')}
                  </span>
                </h1>
              </div>
              <p className="text-gray-600 max-w-2xl">
                {t('events.heroSubtitle')}
              </p>
            </div>

            {/* Stats */}
            <div className="hidden lg:flex items-center gap-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary-600">{upcomingEvents.length}</div>
                <div className="text-sm text-gray-600">{t('events.upcoming')}</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-accent-600">
                  {upcomingEvents.filter(e => e.type === 'workshop').length}
                </div>
                <div className="text-sm text-gray-600">{t('events.workshops')}</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-secondary-600">
                  {upcomingEvents.filter(e => e.type === 'trip').length}
                </div>
                <div className="text-sm text-gray-600">{t('events.trips')}</div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Filter & Toolbar */}
      <div className="bg-white border-b border-gray-200 sticky top-20 z-40 shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Type Filters */}
            <div className="flex items-center gap-3 overflow-x-auto scrollbar-hide">
              <Filter className="w-5 h-5 text-gray-600 flex-shrink-0" />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedType(null)}
                className={`px-5 py-2 rounded-full whitespace-nowrap transition-all font-medium ${
                  selectedType === null
                    ? 'bg-gradient-to-r from-primary-600 to-primary-500 text-white shadow-lg shadow-primary-500/30'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {t('events.allEvents')}
              </motion.button>
              {eventTypes.map((type) => (
                <motion.button
                  key={type.key}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedType(type.key)}
                  className={`px-5 py-2 rounded-full whitespace-nowrap transition-all font-medium ${
                    selectedType === type.key
                      ? 'bg-gradient-to-r from-primary-600 to-primary-500 text-white shadow-lg shadow-primary-500/30'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {type.label}
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
                <option value="default">{t('events.sortSoonestFirst')}</option>
                <option value="date-asc">{t('events.dateEarliest')}</option>
                <option value="date-desc">{t('events.dateLatest')}</option>
                <option value="price">{t('events.priceLowToHigh')}</option>
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
                >
                  <List className="w-5 h-5" />
                </motion.button>
              </div>

              {/* Results Count */}
              <div className="hidden md:block text-sm text-gray-600">
                {t('events.eventsCount', { count: sortedEvents.length })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Events Grid */}
      <div className="bg-gray-50 min-h-screen">
        <div className="container mx-auto px-6 py-8">
          {isLoading ? (
            <GridSkeleton count={6} />
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-600">{t('events.loadingError')}</p>
            </div>
          ) : sortedEvents.length === 0 ? (
            <div className="text-center py-20">
              <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <p className="text-xl text-gray-600">{t('events.noEvents')}</p>
              <p className="text-gray-500 mt-2">{t('events.checkBackSoon')}</p>
            </div>
          ) : (
            <AnimatePresence mode="wait">
              <StaggerContainer
                key={viewMode}
                staggerDelay={0.05}
                className={viewMode === 'grid' ? 'grid md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}
              >
                {sortedEvents.map((event) => (
                  viewMode === 'grid' ? (
                    <Link key={event.id} to={`/events/${event.id}`}>
                      <Card className="h-full group cursor-pointer overflow-hidden relative hover:shadow-xl transition-shadow">
                        {/* Date Badge */}
                        <div className="absolute top-4 left-4 z-10 bg-white rounded-lg shadow-lg p-3 text-center">
                          <div className="text-2xl font-bold text-primary-600">
                            {new Date(event.start_date).getDate()}
                          </div>
                          <div className="text-xs text-gray-600 uppercase">
                            {formatMonth(event.start_date)}
                          </div>
                        </div>

                        {/* Type Badge */}
                        <div className="absolute top-4 right-4 z-10">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getTypeColor(event.type)}`}>
                            {getTypeLabel(event.type)}
                          </span>
                        </div>

                        {/* Image/Placeholder */}
                        <div className="relative h-48 bg-gradient-to-br from-primary-100 to-accent-100 rounded-xl mb-4 overflow-hidden">
                          <div className="absolute inset-0 flex items-center justify-center">
                            <Calendar className="w-16 h-16 text-primary-300" />
                          </div>
                          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                        </div>

                        <div className="space-y-3">
                          <h3 className="text-xl font-bold line-clamp-2 group-hover:text-primary-600 transition-colors">
                            {event.title}
                          </h3>

                          <p className="text-gray-600 text-sm line-clamp-2 leading-relaxed">
                            {event.description}
                          </p>

                          <div className="space-y-2 text-sm text-gray-600">
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4 text-primary-600" />
                              <span>{formatTime(event.start_date)}</span>
                            </div>
                            {event.location && (
                              <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-primary-600" />
                                <span className="line-clamp-1">{event.location}</span>
                              </div>
                            )}
                            {event.max_participants && (
                              <div className="flex items-center gap-2">
                                <Users className="w-4 h-4 text-primary-600" />
                                <span>{t('events.maxParticipants', { count: event.max_participants })}</span>
                              </div>
                            )}
                          </div>

                          <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                            {event.price ? (
                              <div>
                                <p className="text-xs text-gray-500">{t('events.price')}</p>
                                <SaudiRiyalPrice
                                  amount={event.price}
                                  className="text-xl font-bold text-primary-600"
                                />
                              </div>
                            ) : (
                              <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
                                {t('events.free')}
                              </span>
                            )}
                            <span className="flex items-center gap-1 text-primary-600 font-medium group-hover:gap-2 transition-all">
                              {t('events.viewDetails')}
                              <ArrowRight className="w-4 h-4" />
                            </span>
                          </div>
                        </div>
                      </Card>
                    </Link>
                  ) : (
                    <Link key={event.id} to={`/events/${event.id}`}>
                      <Card className="group cursor-pointer overflow-hidden hover:shadow-xl transition-shadow">
                        <div className="flex gap-6">
                          {/* Date Block */}
                          <div className="w-24 h-24 flex-shrink-0 bg-gradient-to-br from-primary-600 to-accent-600 rounded-xl flex flex-col items-center justify-center text-white">
                            <div className="text-3xl font-bold">
                              {new Date(event.start_date).getDate()}
                            </div>
                            <div className="text-sm uppercase">
                              {formatMonth(event.start_date)}
                            </div>
                          </div>

                          <div className="flex-1 flex flex-col justify-between py-1">
                            <div>
                              <div className="flex items-start justify-between mb-2">
                                <h3 className="text-2xl font-bold group-hover:text-primary-600 transition-colors">
                                  {event.title}
                                </h3>
                                <span className={`px-3 py-1 rounded-full text-xs font-semibold flex-shrink-0 ${getTypeColor(event.type)}`}>
                                  {getTypeLabel(event.type)}
                                </span>
                              </div>
                              <p className="text-gray-600 mb-3 line-clamp-2">{event.description}</p>

                              <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                                <div className="flex items-center gap-2">
                                  <Clock className="w-4 h-4 text-primary-600" />
                                  <span>{formatDate(event.start_date)} {t('events.at')} {formatTime(event.start_date)}</span>
                                </div>
                                {event.location && (
                                  <div className="flex items-center gap-2">
                                    <MapPin className="w-4 h-4 text-primary-600" />
                                    <span>{event.location}</span>
                                  </div>
                                )}
                                {event.max_participants && (
                                  <div className="flex items-center gap-2">
                                    <Users className="w-4 h-4 text-primary-600" />
                                    <span>{t('events.max', { count: event.max_participants })}</span>
                                  </div>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center justify-between mt-4">
                              {event.price ? (
                                <SaudiRiyalPrice
                                  amount={event.price}
                                  className="text-2xl font-bold text-primary-600"
                                />
                              ) : (
                                <span className="px-4 py-1 bg-green-100 text-green-700 rounded-full font-semibold">
                                  {t('events.freeEvent')}
                                </span>
                              )}
                              <Button variant="primary" size="sm">
                                {t('events.viewDetails')}
                                <ArrowRight className="w-4 h-4 ml-2" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </Card>
                    </Link>
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
            <h2 className="text-4xl font-bold mb-4">{t('events.dontMissOut')}</h2>
            <p className="text-xl mb-8 text-white/90 max-w-2xl mx-auto">
              {t('events.ctaDescription')}
            </p>
            <Link to="/contact">
              <Button variant="secondary" size="lg" className="bg-white text-primary-600">
                {t('events.contactUs')}
              </Button>
            </Link>
          </motion.div>
        </Card>
      </Section>
    </div>
  );
};
