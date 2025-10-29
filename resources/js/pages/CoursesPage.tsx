import React from 'react';
import { motion } from 'framer-motion';
import { GraduationCap, Clock, BarChart3, Loader2 } from 'lucide-react';
import { Section, Card, Button } from '../components/ui';
import { useGetCoursesQuery } from '../services/api';
import type { Course } from '../types';
import { useTranslation } from 'react-i18next';

export const CoursesPage: React.FC = () => {
  const { t } = useTranslation();
  // Fetch courses from API
  const { data: courses = [], isLoading: coursesLoading, error: coursesError } = useGetCoursesQuery({ active: true });

  return (
    <div className="pt-20">
      {/* Hero */}
      <Section background="gradient" className="text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <GraduationCap className="w-16 h-16 mx-auto mb-6 text-primary-600" />
          <h1 className="text-5xl lg:text-6xl font-bold mb-6">
            {t('pages.courses.heroTitle')}<br />
            <span className="bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
              {t('pages.courses.heroSubtitle')}
            </span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            {t('pages.courses.heroDescription')}
          </p>
        </motion.div>
      </Section>

      {/* Courses Grid */}
      <Section background="white">
        {coursesLoading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="w-12 h-12 animate-spin text-primary-600" />
          </div>
        ) : coursesError ? (
          <div className="text-center py-12">
            <p className="text-red-600">{t('pages.courses.loadingError')}</p>
          </div>
        ) : courses.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600">{t('pages.courses.noCourses')}</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {courses.map((course, index) => (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full group hover:shadow-2xl transition-shadow">
                  <div className="relative overflow-hidden rounded-xl mb-6">
                    <img
                      src={course.image || 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=600&h=400&fit=crop'}
                      alt={course.name}
                      className="w-full h-56 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-4 right-4 bg-accent-600 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg">
                      {course.level}
                    </div>
                  </div>

                  <h3 className="text-2xl font-bold mb-3 group-hover:text-primary-600 transition-colors">
                    {course.name}
                  </h3>

                  <p className="text-gray-600 mb-6 leading-relaxed">
                    {course.description}
                  </p>

                  <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-3 text-gray-700">
                      <Clock className="w-5 h-5 text-primary-600" />
                      <span className="font-medium">{course.duration}</span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-700">
                      <BarChart3 className="w-5 h-5 text-primary-600" />
                      <span className="font-medium">{course.level}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div>
                      <p className="text-sm text-gray-500">{t('pages.courses.startingFrom')}</p>
                      <p className="text-3xl font-bold text-primary-600">SAR {course.price}</p>
                    </div>
                    <Button>
                      {t('pages.courses.enrollNow')}
                    </Button>
                  </div>
                </Card>
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
    </div>
  );
};
