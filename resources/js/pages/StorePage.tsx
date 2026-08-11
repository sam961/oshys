import React from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag, MessageCircle, ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Section, Button } from '../components/ui';
import { FastLink } from '../components/ui/FastLink';

/**
 * Placeholder landing page for the upcoming store. Deliberately quiet: it
 * states the position honestly and points at the two things a visitor can
 * actually do today (talk to the team, look at programs) rather than
 * pretending at a countdown or a signup we cannot yet honour.
 */
export const StorePage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="pt-20">
      <Section background="gradient" containerSize="md" className="min-h-[70vh] flex items-center">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full text-center"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white shadow-sm border border-primary-100 mb-6 sm:mb-8">
            <ShoppingBag className="w-7 h-7 sm:w-9 sm:h-9 text-primary-600" />
          </div>

          <p className="text-xs sm:text-sm font-semibold tracking-widest uppercase text-primary-600 mb-3 sm:mb-4">
            {t('store.eyebrow')}
          </p>

          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 sm:mb-6">
            {t('store.heroTitle')}
          </h1>

          <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed mb-3 sm:mb-4">
            {t('store.heroSubtitle')}
          </p>

          <p className="text-sm sm:text-base text-gray-500 max-w-2xl mx-auto leading-relaxed mb-8 sm:mb-10">
            {t('store.description')}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
            <FastLink to="/contact" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto">
                <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                {t('store.ctaContact')}
              </Button>
            </FastLink>

            <FastLink to="/shop/courses" className="w-full sm:w-auto">
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                {t('store.ctaPrograms')}
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 rtl:rotate-180" />
              </Button>
            </FastLink>
          </div>
        </motion.div>
      </Section>
    </div>
  );
};
