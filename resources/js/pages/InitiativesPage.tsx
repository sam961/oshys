import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, Calendar, ArrowRight, Loader2 } from 'lucide-react';
import { Section, Card, Button } from '../components/ui';
import { useGetSocialInitiativesQuery } from '../services/api';
import { useTranslation } from 'react-i18next';

export const InitiativesPage: React.FC = () => {
  const { t } = useTranslation();
  const { data: initiatives = [], isLoading, error } = useGetSocialInitiativesQuery({ published: true });

  return (
    <div className="pt-20">
      {/* Hero */}
      <div className="relative h-96 overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=1920&h=600&fit=crop"
          alt="Social Initiatives"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-primary-900/80 to-accent-900/80" />
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center text-white"
          >
            <Heart className="w-16 h-16 mx-auto mb-6" />
            <h1 className="text-6xl font-bold mb-4">{t('initiatives.heroTitle')}</h1>
            <p className="text-2xl text-white/90">
              {t('initiatives.heroSubtitle')}
            </p>
          </motion.div>
        </div>
      </div>

      {/* Initiatives Grid */}
      <Section background="white">
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="w-12 h-12 animate-spin text-primary-600" />
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-600">{t('initiatives.loadingError')}</p>
          </div>
        ) : initiatives.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600">{t('initiatives.noInitiatives')}</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {initiatives.map((initiative, index) => (
              <motion.div
                key={initiative.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Link to={`/initiatives/${initiative.id}`}>
                  <Card className="group cursor-pointer h-full overflow-hidden hover:shadow-2xl transition-shadow">
                    <div className="relative overflow-hidden rounded-xl mb-4">
                      {initiative.image_url ? (
                        <>
                          <img
                            src={initiative.image_url}
                            alt={initiative.title}
                            className="w-full h-56 object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                          {initiative.category && (
                            <div className="absolute top-4 left-4">
                              <span className="bg-primary-600 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg">
                                {initiative.category.name}
                              </span>
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="w-full h-56 bg-gray-100 flex flex-col items-center justify-center">
                          <Heart className="w-16 h-16 text-gray-300 mb-2" />
                          <p className="text-sm text-gray-400">{t('initiatives.noImage')}</p>
                          {initiative.category && (
                            <div className="absolute top-4 left-4">
                              <span className="bg-primary-600 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg">
                                {initiative.category.name}
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>
                          {initiative.published_at
                            ? new Date(initiative.published_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                            : new Date(initiative.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                          }
                        </span>
                      </div>
                    </div>

                    <h3 className="text-2xl font-bold mb-3 group-hover:text-primary-600 transition-colors">
                      {initiative.title}
                    </h3>

                    <div className="text-gray-600 mb-4 line-clamp-3 prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: initiative.excerpt }} />

                    <div className="flex items-center text-primary-600 font-semibold group-hover:gap-3 gap-2 transition-all">
                      {t('initiatives.learnMore')}
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </Section>

      {/* CTA Section */}
      <Section background="gradient">
        <Card className="bg-gradient-to-r from-primary-600 to-accent-600 text-white text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold mb-4">{t('initiatives.ctaTitle')}</h2>
            <p className="text-xl mb-8 text-white/90 max-w-2xl mx-auto">
              {t('initiatives.ctaDescription')}
            </p>
            <Link to="/contact">
              <Button variant="secondary" className="bg-white text-primary-600">
                {t('initiatives.getInTouch')}
              </Button>
            </Link>
          </motion.div>
        </Card>
      </Section>
    </div>
  );
};
