import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Compass, MapPin, Clock, Award, Loader2, Filter, Grid3x3, List, Heart, Users, Calendar, Anchor, Star, TrendingUp } from 'lucide-react';
import { Section, Card, Button, GridSkeleton } from '../components/ui';
import { StaggerContainer, WaveBackground } from '../components/animations';
import { BookingModal } from '../components/features/BookingModal';
import { useGetTripsQuery } from '../services/api';
import type { Trip } from '../types';
import { useTranslation } from 'react-i18next';

export const TripsPage: React.FC = () => {
  const { t } = useTranslation();
  const [selectedDifficulty, setSelectedDifficulty] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'default' | 'price-low' | 'price-high' | 'duration'>('default');
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [isBookingOpen, setIsBookingOpen] = useState(false);

  const handleBookClick = (e: React.MouseEvent, trip: Trip) => {
    e.stopPropagation();
    setSelectedTrip(trip);
    setIsBookingOpen(true);
  };

  // Fetch trips from API
  const { data: trips = [], isLoading: tripsLoading, error: tripsError } = useGetTripsQuery({ active: true });

  const difficulties = ['Beginner', 'Intermediate', 'Advanced'];

  const filteredTrips = selectedDifficulty
    ? trips.filter((t) => t.difficulty === selectedDifficulty)
    : trips;

  const sortedTrips = [...filteredTrips].sort((a, b) => {
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
      <div className="bg-gradient-to-br from-secondary-50 via-white to-primary-50 relative overflow-hidden">
        <WaveBackground variant="secondary" opacity={0.03} />
        <div className="container mx-auto px-6 py-12 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between"
          >
            <div>
              <div className="flex items-center gap-3 mb-3">
                <Compass className="w-8 h-8 text-secondary-600" />
                <h1 className="text-4xl lg:text-5xl font-bold">
                  <span className="bg-gradient-to-r from-secondary-600 to-primary-600 bg-clip-text text-transparent">
                    {t('pages.trips.heroTitle')}
                  </span>
                </h1>
              </div>
              <p className="text-gray-600 max-w-2xl">
                {t('pages.trips.heroDescription')}
              </p>
            </div>

            {/* Stats */}
            <div className="hidden lg:flex gap-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-secondary-600">{trips.length}+</div>
                <div className="text-sm text-gray-600">Dive Trips</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary-600">15</div>
                <div className="text-sm text-gray-600">Destinations</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-accent-600">1000+</div>
                <div className="text-sm text-gray-600">Happy Divers</div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Enhanced Filter & Toolbar */}
      <div className="bg-white border-b border-gray-200 sticky top-20 z-40 shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Difficulty Filters */}
            <div className="flex items-center gap-3 overflow-x-auto scrollbar-hide">
              <Filter className="w-5 h-5 text-gray-600 flex-shrink-0" />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedDifficulty(null)}
                className={`px-5 py-2 rounded-full whitespace-nowrap transition-all font-medium ${
                  selectedDifficulty === null
                    ? 'bg-gradient-to-r from-secondary-600 to-secondary-500 text-white shadow-lg shadow-secondary-500/30'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All Levels
              </motion.button>
              {difficulties.map((level) => (
                <motion.button
                  key={level}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedDifficulty(level)}
                  className={`px-5 py-2 rounded-full whitespace-nowrap transition-all font-medium ${
                    selectedDifficulty === level
                      ? 'bg-gradient-to-r from-secondary-600 to-secondary-500 text-white shadow-lg shadow-secondary-500/30'
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
                className="px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-secondary-500 focus:border-transparent"
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
                      ? 'bg-white text-secondary-600 shadow'
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
                      ? 'bg-white text-secondary-600 shadow'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <List className="w-5 h-5" />
                </motion.button>
              </div>

              {/* Results Count */}
              <div className="hidden md:block text-sm text-gray-600">
                {sortedTrips.length} trips
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Trips Grid */}
      <div className="bg-gray-50 min-h-screen">
        <div className="container mx-auto px-6 py-8">
        {tripsLoading ? (
          <GridSkeleton count={6} />
        ) : tripsError ? (
          <div className="text-center py-12">
            <p className="text-red-600">{t('pages.trips.loadingError')}</p>
          </div>
        ) : sortedTrips.length === 0 ? (
          <div className="text-center py-20">
            <Compass className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <p className="text-xl text-gray-600">{t('pages.trips.noTrips')}</p>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <StaggerContainer
              key={viewMode}
              staggerDelay={0.05}
              className={viewMode === 'grid' ? 'grid md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}
            >
            {sortedTrips.map((trip) => (
              viewMode === 'grid' ? (
                <Card key={trip.id} className="h-full group cursor-pointer overflow-hidden relative">
                  {/* Quick Actions */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    whileHover={{ opacity: 1 }}
                    className="absolute top-3 right-3 flex flex-col gap-2 z-10"
                  >
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="p-2 bg-white rounded-full shadow-lg hover:bg-secondary-50 transition-colors"
                      title="Add to Favorites"
                    >
                      <Heart className="w-4 h-4 text-gray-700" />
                    </motion.button>
                  </motion.div>

                  <div className="relative overflow-hidden rounded-xl mb-4">
                    {(trip as any).image_url ? (
                      <>
                        <img
                          src={(trip as any).image_url}
                          alt={trip.name}
                          className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                      </>
                    ) : (
                      <div className="w-full h-64 bg-gray-100 flex flex-col items-center justify-center">
                        <Anchor className="w-16 h-16 text-gray-300 mb-2" />
                        <p className="text-sm text-gray-400">{t('trips.noImage')}</p>
                      </div>
                    )}

                    <div className="absolute top-3 left-3 flex flex-col gap-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-sm ${
                        trip.difficulty === 'Beginner'
                          ? 'bg-green-500/90 text-white'
                          : trip.difficulty === 'Intermediate'
                          ? 'bg-yellow-500/90 text-white'
                          : 'bg-red-500/90 text-white'
                      }`}>
                        {trip.difficulty}
                      </span>
                      {trip.certification_required && (
                        <span className="bg-white/90 backdrop-blur-sm text-gray-900 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                          <Award className="w-3 h-3" />
                          Cert Required
                        </span>
                      )}
                    </div>

                    <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
                      <div className="flex items-center gap-2 text-white text-sm">
                        <MapPin className="w-4 h-4" />
                        <span className="font-semibold">{trip.location || 'Location TBD'}</span>
                      </div>
                      <div className="flex items-center gap-1 text-white text-sm">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-semibold">4.8</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-xl font-bold line-clamp-2 group-hover:text-secondary-600 transition-colors">
                      {trip.name}
                    </h3>

                    <p className="text-gray-600 text-sm line-clamp-2 leading-relaxed">
                      {trip.description}
                    </p>

                    <div className="flex flex-wrap gap-2">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Clock className="w-4 h-4 text-secondary-600" />
                        <span>{trip.duration}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Users className="w-4 h-4 text-secondary-600" />
                        <span>Max 12</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Anchor className="w-4 h-4 text-secondary-600" />
                        <span>4 Dives</span>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-gray-100">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <p className="text-xs text-gray-500">Starting from</p>
                          <p className="text-2xl font-bold bg-gradient-to-r from-secondary-600 to-primary-600 bg-clip-text text-transparent">
                            SAR {trip.price}
                          </p>
                        </div>
                        <div className="flex items-center gap-1 text-sm">
                          <Calendar className="w-4 h-4 text-secondary-600" />
                          <span className="text-gray-600">Book Now</span>
                        </div>
                      </div>
                      <Button variant="primary" className="w-full" size="sm" onClick={(e) => handleBookClick(e, trip)}>
                        {t('pages.trips.bookThisTrip')}
                      </Button>
                    </div>
                  </div>
                </Card>
              ) : (
                <Card key={trip.id} className="group cursor-pointer overflow-hidden hover:shadow-xl transition-shadow">
                  <div className="flex gap-6">
                    <div className="relative w-72 h-56 flex-shrink-0 overflow-hidden rounded-xl">
                      {(trip as any).image_url ? (
                        <>
                          <img
                            src={(trip as any).image_url}
                            alt={trip.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                          <div className="absolute bottom-3 left-3 flex items-center gap-2 text-white text-sm">
                            <MapPin className="w-4 h-4" />
                            <span className="font-semibold">{trip.location || 'Location TBD'}</span>
                          </div>
                        </>
                      ) : (
                        <div className="w-full h-full bg-gray-100 flex flex-col items-center justify-center">
                          <Anchor className="w-12 h-12 text-gray-300 mb-2" />
                          <p className="text-xs text-gray-400">{t('trips.noImage')}</p>
                        </div>
                      )}
                      <div className="absolute top-3 left-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-sm ${
                          trip.difficulty === 'Beginner'
                            ? 'bg-green-500/90 text-white'
                            : trip.difficulty === 'Intermediate'
                            ? 'bg-yellow-500/90 text-white'
                            : 'bg-red-500/90 text-white'
                        }`}>
                          {trip.difficulty}
                        </span>
                      </div>
                    </div>

                    <div className="flex-1 flex flex-col justify-between py-2">
                      <div>
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="text-2xl font-bold group-hover:text-secondary-600 transition-colors">
                            {trip.name}
                          </h3>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="p-2 hover:bg-secondary-50 rounded-full transition-colors"
                          >
                            <Heart className="w-5 h-5 text-gray-700" />
                          </motion.button>
                        </div>
                        <p className="text-gray-600 mb-4 line-clamp-2">{trip.description}</p>

                        <div className="flex flex-wrap gap-4 mb-4">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Clock className="w-5 h-5 text-secondary-600" />
                            <span>{trip.duration}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Users className="w-5 h-5 text-secondary-600" />
                            <span>Small Groups (Max 12)</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Anchor className="w-5 h-5 text-secondary-600" />
                            <span>4 Dive Sites</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                            <span>4.8 (95 reviews)</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          {trip.certification_required && (
                            <span className="px-3 py-1 bg-secondary-100 text-secondary-700 rounded-full text-xs font-semibold flex items-center gap-1">
                              <Award className="w-3 h-3" />
                              Certification Required
                            </span>
                          )}
                          <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold flex items-center gap-1">
                            <TrendingUp className="w-3 h-3" />
                            Spots Available
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-4">
                        <div>
                          <p className="text-sm text-gray-500">Starting from</p>
                          <p className="text-3xl font-bold bg-gradient-to-r from-secondary-600 to-primary-600 bg-clip-text text-transparent">
                            SAR {trip.price}
                          </p>
                        </div>
                        <Button variant="primary" size="lg" onClick={(e) => handleBookClick(e, trip)}>
                          {t('pages.trips.bookThisTrip')}
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

      {/* Info Section */}
      <Section background="gradient">
        <StaggerContainer className="grid md:grid-cols-3 gap-8">
          <Card className="text-center">
            <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Award className="w-8 h-8 text-primary-600" />
            </div>
            <h3 className="text-xl font-bold mb-2">{t('pages.trips.expertGuidesTitle')}</h3>
            <p className="text-gray-600">
              {t('pages.trips.expertGuidesDescription')}
            </p>
          </Card>

          <Card className="text-center">
            <div className="bg-accent-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <MapPin className="w-8 h-8 text-accent-600" />
            </div>
            <h3 className="text-xl font-bold mb-2">{t('pages.trips.amazingLocationsTitle')}</h3>
            <p className="text-gray-600">
              {t('pages.trips.amazingLocationsDescription')}
            </p>
          </Card>

          <Card className="text-center">
            <div className="bg-secondary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Compass className="w-8 h-8 text-secondary-600" />
            </div>
            <h3 className="text-xl font-bold mb-2">{t('pages.trips.allInclusiveTitle')}</h3>
            <p className="text-gray-600">
              {t('pages.trips.allInclusiveDescription')}
            </p>
          </Card>
        </StaggerContainer>
      </Section>

      {/* Booking Modal */}
      {selectedTrip && (
        <BookingModal
          isOpen={isBookingOpen}
          onClose={() => setIsBookingOpen(false)}
          item={selectedTrip}
          type="trip"
        />
      )}
    </div>
  );
};
