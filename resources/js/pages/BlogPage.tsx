import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, Calendar, User, ArrowRight, Loader2 } from 'lucide-react';
import { Section, Card, Button } from '../components/ui';
import { useGetBlogPostsQuery } from '../services/api';
import type { BlogPost } from '../types';
import { useTranslation } from 'react-i18next';

export const BlogPage: React.FC = () => {
  const { t } = useTranslation();
  // Fetch blog posts from API
  const { data: blogPosts = [], isLoading: blogPostsLoading, error: blogPostsError } = useGetBlogPostsQuery({ published: true });

  return (
    <div className="pt-20">
      {/* Hero */}
      <div className="relative h-96 overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=1920&h=600&fit=crop"
          alt="Blog"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-primary-900/80 to-accent-900/80" />
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center text-white"
          >
            <BookOpen className="w-16 h-16 mx-auto mb-6" />
            <h1 className="text-6xl font-bold mb-4">{t('pages.blog.heroTitle')}</h1>
            <p className="text-2xl text-white/90">
              {t('pages.blog.heroSubtitle')}
            </p>
          </motion.div>
        </div>
      </div>

      {/* Blog Posts Grid */}
      <Section background="white">
        {blogPostsLoading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="w-12 h-12 animate-spin text-primary-600" />
          </div>
        ) : blogPostsError ? (
          <div className="text-center py-12">
            <p className="text-red-600">{t('pages.blog.loadingError')}</p>
          </div>
        ) : blogPosts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600">{t('pages.blog.noPosts')}</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogPosts.map((post, index) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Link to={`/blog/${post.id}`}>
                  <Card className="group cursor-pointer h-full overflow-hidden hover:shadow-2xl transition-shadow">
                  <div className="relative overflow-hidden rounded-xl mb-4">
                    {(post as any).image_url ? (
                      <>
                        <img
                          src={(post as any).image_url}
                          alt={post.title}
                          className="w-full h-56 object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        {post.category && (
                          <div className="absolute top-4 left-4">
                            <span className="bg-primary-600 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg">
                              {post.category.name}
                            </span>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="w-full h-56 bg-gray-100 flex flex-col items-center justify-center">
                        <BookOpen className="w-16 h-16 text-gray-300 mb-2" />
                        <p className="text-sm text-gray-400">{t('blog.noImage')}</p>
                        {post.category && (
                          <div className="absolute top-4 left-4">
                            <span className="bg-primary-600 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg">
                              {post.category.name}
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
                        {post.published_at
                          ? new Date(post.published_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                          : new Date(post.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                        }
                      </span>
                    </div>
                    {post.author && (
                      <div className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        <span>{post.author.name}</span>
                      </div>
                    )}
                  </div>

                  <h3 className="text-2xl font-bold mb-3 group-hover:text-primary-600 transition-colors">
                    {post.title}
                  </h3>

                  <div className="text-gray-600 mb-4 line-clamp-3 prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: post.excerpt }} />

                  <div className="flex items-center text-primary-600 font-semibold group-hover:gap-3 gap-2 transition-all">
                    {t('pages.blog.readMore')}
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </Section>

    </div>
  );
};
