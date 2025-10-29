import React from 'react';
import { motion } from 'framer-motion';
import { Compass, MapPin, Clock, Award, Loader2 } from 'lucide-react';
import { Section, Card, Button } from '../components/ui';
import { useGetTripsQuery } from '../services/api';
import type { Trip } from '../types';
import { useTranslation } from 'react-i18next';

export const TripsPage: React.FC = () => {
  const { t } = useTranslation();
  // Fetch trips from API
  const { data: trips = [], isLoading: tripsLoading, error: tripsError } = useGetTripsQuery({ active: true });

  return (
    <div className="pt-20">
      {/* Hero */}
      <Section background="gradient" className="text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Compass className="w-16 h-16 mx-auto mb-6 text-primary-600" />
          <h1 className="text-5xl lg:text-6xl font-bold mb-6">
            {t('pages.trips.heroTitle')}<br />
            <span className="bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
              {t('pages.trips.heroSubtitle')}
            </span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            {t('pages.trips.heroDescription')}
          </p>
        </motion.div>
      </Section>

      {/* Trips Grid */}
      <Section background="white">
        {tripsLoading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="w-12 h-12 animate-spin text-primary-600" />
          </div>
        ) : tripsError ? (
          <div className="text-center py-12">
            <p className="text-red-600">{t('pages.trips.loadingError')}</p>
          </div>
        ) : trips.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600">{t('pages.trips.noTrips')}</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {trips.map((trip, index) => (
              <motion.div
                key={trip.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full group hover:shadow-2xl transition-shadow overflow-hidden">
                  <div className="relative overflow-hidden rounded-xl mb-6">
                    <img
                      src={trip.image || 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=600&h=400&fit=crop'}
                      alt={trip.name}
                      className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

                    <div className="absolute top-4 right-4 bg-white px-4 py-2 rounded-full shadow-lg">
                      <p className="font-bold text-primary-600">SAR {trip.price}</p>
                    </div>

                    <div className="absolute bottom-4 left-4 right-4">
                      <div className="flex items-center gap-2 text-white text-sm">
                        <MapPin className="w-4 h-4" />
                        <span className="font-semibold">{trip.location}</span>
                      </div>
                    </div>
                  </div>

                  <h3 className="text-2xl font-bold mb-3 group-hover:text-primary-600 transition-colors">
                    {trip.name}
                  </h3>

                  <p className="text-gray-600 mb-6 leading-relaxed">
                    {trip.description}
                  </p>

                  <div className="space-y-3 mb-6">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Clock className="w-4 h-4" />
                        <span>{trip.duration}</span>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        trip.difficulty === 'Beginner'
                          ? 'bg-green-100 text-green-700'
                          : trip.difficulty === 'Intermediate'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {trip.difficulty}
                      </span>
                    </div>

                    {trip.certification_required && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Award className="w-4 h-4 text-primary-600" />
                        <span>{t('pages.trips.certificationRequired')}</span>
                      </div>
                    )}
                  </div>

                  <Button variant="primary" className="w-full">
                    {t('pages.trips.bookThisTrip')}
                  </Button>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </Section>

      {/* Info Section */}
      <Section background="gradient">
        <div className="grid md:grid-cols-3 gap-8">
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
        </div>
      </Section>
    </div>
  );
};
