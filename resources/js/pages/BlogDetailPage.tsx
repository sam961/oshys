import React from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, User, Tag, Share2, Loader2 } from 'lucide-react';
import { Section } from '../components/ui';
import { useGetBlogPostQuery } from '../services/api';
import { useTranslation } from 'react-i18next';

export const BlogDetailPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const dateLocale = i18n.language === 'ar' ? 'ar-SA' : 'en-US';
  const { id } = useParams<{ id: string }>();
  const { data: post, isLoading, error } = useGetBlogPostQuery(Number(id));

  if (isLoading) {
    return (
      <div className="pt-20 min-h-screen flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-primary-600" />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="pt-20 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{t('common.postNotFound')}</h1>
          <p className="text-gray-600">{t('common.postNotFoundMessage')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-20">
      {/* Hero Image */}
      <div className="relative h-[500px] overflow-hidden">
        <img
          src={post.image || 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1920&h=800&fit=crop'}
          alt={post.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/70" />
      </div>

      {/* Article Content */}
      <Section background="white">
        <div className="max-w-4xl mx-auto">
          {/* Category Badge */}
          {post.category && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6"
            >
              <span className="inline-flex items-center gap-2 bg-primary-100 text-primary-700 px-4 py-2 rounded-full text-sm font-semibold">
                <Tag className="w-4 h-4" />
                {post.category.name}
              </span>
            </motion.div>
          )}

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl font-bold text-gray-900 mb-6 leading-tight"
          >
            {post.title}
          </motion.h1>

          {/* Meta Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex items-center gap-6 text-gray-600 mb-8 pb-8 border-b border-gray-200"
          >
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              <span>
                {post.published_at
                  ? new Date(post.published_at).toLocaleDateString(dateLocale, {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })
                  : new Date(post.created_at).toLocaleDateString(dateLocale, {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })}
              </span>
            </div>
            {post.author && (
              <div className="flex items-center gap-2">
                <User className="w-5 h-5" />
                <span>{t('common.by')} {post.author.name}</span>
              </div>
            )}
            <button className="ml-auto flex items-center gap-2 text-primary-600 hover:text-primary-700 transition-colors">
              <Share2 className="w-5 h-5" />
              <span className="font-medium">{t('common.share')}</span>
            </button>
          </motion.div>

          {/* Excerpt */}
          {post.excerpt && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-xl text-gray-700 mb-8 p-6 bg-gray-50 rounded-xl border-l-4 border-primary-600"
            >
              <div dangerouslySetInnerHTML={{ __html: post.excerpt }} />
            </motion.div>
          )}

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="prose prose-lg max-w-none mb-12"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

        </div>
      </Section>
    </div>
  );
};
