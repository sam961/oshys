import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Award, Clock, ArrowRight, Instagram, Facebook, Linkedin, Twitter } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useGetFeaturedInstructorQuery } from '../../services/api';
import { Section, Button } from '../ui';

export const FeaturedInstructor: React.FC = () => {
  const { t } = useTranslation();
  const { data: instructor, isLoading, error } = useGetFeaturedInstructorQuery();

  if (isLoading) {
    return (
      <Section background="white">
        <div className="animate-pulse">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="relative aspect-[4/5] max-w-md mx-auto lg:mx-0 bg-gray-200 rounded-2xl" />
            <div className="space-y-4">
              <div className="h-8 bg-gray-200 rounded w-1/3" />
              <div className="h-12 bg-gray-200 rounded w-2/3" />
              <div className="h-6 bg-gray-200 rounded w-1/4" />
              <div className="h-24 bg-gray-200 rounded" />
            </div>
          </div>
        </div>
      </Section>
    );
  }

  if (error || !instructor) {
    return null;
  }

  const socialIcons = {
    instagram: Instagram,
    facebook: Facebook,
    linkedin: Linkedin,
    twitter: Twitter,
  };

  const imageUrl = instructor.image
    ? instructor.image.startsWith('http')
      ? instructor.image
      : `/storage/${instructor.image}`
    : '/placeholder.svg';

  return (
    <Section background="white" className="overflow-hidden">
      <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
        {/* Image Side */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative"
        >
          <div className="relative aspect-[4/5] max-w-md mx-auto lg:mx-0">
            {/* Decorative background shape */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary-100 to-accent-100 rounded-2xl transform rotate-3 scale-105" />

            {/* Main image container */}
            <div className="relative h-full overflow-hidden rounded-2xl shadow-2xl">
              <img
                src={imageUrl}
                alt={instructor.name}
                className="w-full h-full object-cover"
              />
              {/* Gradient overlay at bottom */}
              <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/60 to-transparent" />

              {/* Experience badge */}
              {instructor.experience && (
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="flex items-center gap-2 text-white">
                    <Clock className="w-5 h-5" />
                    <span className="text-sm font-medium">{instructor.experience}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Floating certifications badge */}
            {instructor.certifications && instructor.certifications.length > 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3, duration: 0.4 }}
                className="absolute -right-4 -bottom-4 lg:-right-8 lg:-bottom-8 bg-white rounded-xl shadow-xl p-4 max-w-[200px]"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Award className="w-5 h-5 text-primary-600" />
                  <span className="text-sm font-semibold text-gray-900">{t('common.certifications')}</span>
                </div>
                <p className="text-xs text-gray-600 line-clamp-2">
                  {instructor.certifications.slice(0, 2).join(', ')}
                  {instructor.certifications.length > 2 && ` ${t('common.more', { count: instructor.certifications.length - 2 })}`}
                </p>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Content Side */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center lg:text-left"
        >
          {/* Section label */}
          <span className="inline-block px-4 py-1.5 bg-primary-100 text-primary-700 rounded-full text-sm font-semibold mb-4">
            {t('home.meetInstructor', 'Meet Our Instructor')}
          </span>

          {/* Name */}
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-2">
            {instructor.name}
          </h2>

          {/* Role */}
          <p className="text-xl text-primary-600 font-semibold mb-6">
            {instructor.role}
          </p>

          {/* Bio */}
          {instructor.bio && (
            <p className="text-gray-600 text-lg leading-relaxed mb-6 max-w-xl mx-auto lg:mx-0">
              {instructor.bio}
            </p>
          )}

          {/* Certifications list */}
          {instructor.certifications && instructor.certifications.length > 0 && (
            <div className="mb-8">
              <div className="flex flex-wrap gap-2 justify-center lg:justify-start">
                {instructor.certifications.map((cert, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full text-sm"
                  >
                    <Award className="w-3.5 h-3.5 text-primary-600" />
                    {cert}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Social Links */}
          {instructor.social_links && Object.keys(instructor.social_links).length > 0 && (
            <div className="flex gap-3 justify-center lg:justify-start mb-8">
              {Object.entries(instructor.social_links).map(([platform, url]) => {
                if (!url) return null;
                const Icon = socialIcons[platform as keyof typeof socialIcons];
                if (!Icon) return null;
                return (
                  <a
                    key={platform}
                    href={url as string}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2.5 bg-gray-100 hover:bg-primary-100 text-gray-600 hover:text-primary-600 rounded-full transition-colors"
                  >
                    <Icon className="w-5 h-5" />
                  </a>
                );
              })}
            </div>
          )}

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
            <Link to="/about">
              <Button size="lg">
                {t('home.viewTeam', 'View Our Team')}
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
            <Link to="/contact">
              <Button variant="outline" size="lg">
                {t('home.contactUs', 'Contact Us')}
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </Section>
  );
};
