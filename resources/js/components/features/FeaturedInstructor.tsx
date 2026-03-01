import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, ArrowRight, Instagram, Facebook, Linkedin, Twitter, Quote, ChevronDown, ChevronUp } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useGetFeaturedInstructorQuery } from '../../services/api';
import { Section, Button } from '../ui';

export const FeaturedInstructor: React.FC = () => {
  const { t } = useTranslation();
  const { data: instructor, isLoading, error } = useGetFeaturedInstructorQuery();
  const [bioExpanded, setBioExpanded] = useState(false);
  const [bioOverflows, setBioOverflows] = useState(false);
  const bioRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (bioRef.current) {
      setBioOverflows(bioRef.current.scrollHeight > 120);
    }
  }, [instructor?.bio]);

  if (isLoading || error || !instructor || !instructor.id) {
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
      <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
        {/* Image Side */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="relative flex justify-center lg:justify-start"
        >
          <div className="relative w-full max-w-md">
            {/* Decorative dots pattern */}
            <div className="absolute -top-6 -left-6 w-32 h-32 opacity-[0.07]" style={{
              backgroundImage: 'radial-gradient(circle, currentColor 1.5px, transparent 1.5px)',
              backgroundSize: '12px 12px',
            }} />

            {/* Accent line */}
            <div className="absolute -left-3 top-8 bottom-8 w-1 bg-gradient-to-b from-primary-400 via-accent-400 to-primary-400 rounded-full hidden lg:block" />

            {/* Main image */}
            <div className="relative overflow-hidden rounded-2xl shadow-xl">
              <img
                src={imageUrl}
                alt={instructor.name}
                className="w-full aspect-[4/5] object-cover"
              />
              {/* Bottom gradient */}
              <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

              {/* Name on image */}
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <h2 className="text-2xl sm:text-3xl font-bold text-white">
                  {instructor.name}
                </h2>
              </div>
            </div>

            {/* Experience badge — below image */}
            {instructor.experience && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4, duration: 0.4 }}
                className="mt-3"
              >
                <div className="inline-flex items-center gap-2.5 bg-white border border-gray-100 text-gray-800 px-5 py-3 rounded-xl shadow-md">
                  <div className="p-1.5 bg-primary-100 rounded-lg">
                    <Clock className="w-4 h-4 text-primary-600" />
                  </div>
                  <span className="font-semibold text-sm">{instructor.experience}</span>
                </div>
              </motion.div>
            )}

            {/* Social links */}
            {instructor.social_links && Object.keys(instructor.social_links).length > 0 && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5, duration: 0.4 }}
                className="absolute top-4 -right-4 lg:-right-6 flex flex-col gap-2"
              >
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
                      className="p-2.5 bg-white hover:bg-primary-50 text-gray-500 hover:text-primary-600 rounded-xl shadow-md border border-gray-100 transition-all hover:scale-110"
                    >
                      <Icon className="w-4 h-4" />
                    </a>
                  );
                })}
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Content Side */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.15 }}
          className="text-center lg:text-left"
        >
          {/* Section label */}
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary-50 border border-primary-100 text-primary-700 rounded-full text-sm font-semibold mb-6"
          >
            <div className="w-1.5 h-1.5 rounded-full bg-primary-500" />
            {t('home.meetInstructor', 'Meet Our Instructor')}
          </motion.span>

          {/* Name — mobile only (on desktop it's on the image) */}
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6 lg:hidden">
            {instructor.name}
          </h2>

          {/* Bio with quote styling */}
          {instructor.bio && (
            <div className="relative mb-8 max-w-xl mx-auto lg:mx-0">
              <Quote className="w-8 h-8 text-primary-100 absolute -top-2 -left-1 lg:-left-3" />
              <div className="relative">
                <div
                  ref={bioRef}
                  className={`text-gray-600 text-base sm:text-lg leading-relaxed pl-6 border-l-2 border-primary-200 prose prose-lg max-w-none overflow-hidden transition-all duration-500 ${
                    !bioExpanded && bioOverflows ? 'max-h-[120px]' : 'max-h-[2000px]'
                  }`}
                  dangerouslySetInnerHTML={{ __html: instructor.bio }}
                />
                {!bioExpanded && bioOverflows && (
                  <div className="absolute bottom-0 left-6 right-0 h-12 bg-gradient-to-t from-white to-transparent pointer-events-none" />
                )}
              </div>
              {bioOverflows && (
                <button
                  onClick={() => setBioExpanded(!bioExpanded)}
                  className="mt-3 ml-6 inline-flex items-center gap-1.5 text-primary-600 hover:text-primary-700 font-medium text-sm transition-colors"
                >
                  {bioExpanded ? (
                    <>
                      {t('common.readLess', 'Read Less')}
                      <ChevronUp className="w-4 h-4" />
                    </>
                  ) : (
                    <>
                      {t('common.readMore', 'Read More')}
                      <ChevronDown className="w-4 h-4" />
                    </>
                  )}
                </button>
              )}
            </div>
          )}

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
            <Link to="/about#team">
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
