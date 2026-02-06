import React from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Loader2, FileText } from 'lucide-react';
import { Section } from '../components/ui';
import { useGetFooterLinkBySlugQuery } from '../services/api';
import { useTranslation } from 'react-i18next';

export const FooterLinkPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const dateLocale = i18n.language === 'ar' ? 'ar-SA' : 'en-US';
  const { slug } = useParams<{ slug: string }>();
  const { data: page, isLoading, error } = useGetFooterLinkBySlugQuery(slug || '');

  if (isLoading) {
    return (
      <div className="pt-20 min-h-screen flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-primary-600" />
      </div>
    );
  }

  if (error || !page) {
    return (
      <div className="pt-20 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{t('common.pageNotFound', 'Page Not Found')}</h1>
          <p className="text-gray-600">
            {t('common.pageNotFoundMessage', 'The page you are looking for does not exist or has been removed.')}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-20">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-20 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-white/80 text-sm mb-6"
          >
            <FileText className="w-4 h-4" />
            {t('common.legalPage', 'Legal Information')}
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-bold text-white mb-4"
          >
            {page.title}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg text-gray-300"
          >
            {t('common.lastUpdated', 'Last updated')}: {new Date(page.updated_at).toLocaleDateString(dateLocale, {
              month: 'long',
              day: 'numeric',
              year: 'numeric',
            })}
          </motion.p>
        </div>
      </div>

      {/* Content Section */}
      <Section background="white">
        <div className="max-w-4xl mx-auto">
          {/* Content */}
          {page.content ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="prose prose-lg max-w-none mb-12"
              dangerouslySetInnerHTML={{ __html: page.content }}
            />
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-center py-12"
            >
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">{t('common.noContent', 'Content coming soon...')}</p>
            </motion.div>
          )}

        </div>
      </Section>
    </div>
  );
};
