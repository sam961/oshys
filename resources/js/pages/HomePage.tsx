import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Package, Compass, GraduationCap, ArrowRight, Gift, ShoppingBag, Instagram, Facebook, MessageCircle, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { HeroSlider } from '../components/features/HeroSlider';
import { EventsCalendar } from '../components/features/EventsCalendar';
import { Section, Card, Button, GridSkeleton } from '../components/ui';
import { ScrollReveal, StaggerContainer, LiquidBackground, WaveBackground } from '../components/animations';
import { services } from '../data/mockData';
import { useGetCoursesQuery, useGetTripsQuery, useGetProductsQuery, useGetBlogPostsQuery } from '../services/api';
import type { Course, Trip, Product, BlogPost } from '../types';

export const HomePage: React.FC = () => {
  const { t } = useTranslation();

  // Fetch featured data from API
  const { data: courses = [], isLoading: coursesLoading, error: coursesError } = useGetCoursesQuery({ active: true, featured: true });
  const { data: trips = [], isLoading: tripsLoading, error: tripsError } = useGetTripsQuery({ active: true, featured: true });
  const { data: products = [], isLoading: productsLoading, error: productsError } = useGetProductsQuery({ active: true, featured: true });
  const { data: blogPosts = [], isLoading: blogPostsLoading, error: blogPostsError } = useGetBlogPostsQuery({ published: true, featured: true });

  return (
    <div className="overflow-hidden">
      {/* Hero Slider */}
      <HeroSlider />

      {/* Tagline Section */}
      <Section background="gradient" className="text-center relative overflow-hidden">
        {/* Animated liquid background */}
        <LiquidBackground />
        <WaveBackground variant="primary" opacity={0.05} />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative z-10"
        >
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6">
            <span className="bg-gradient-to-r from-primary-600 via-accent-600 to-secondary-600 bg-clip-text text-transparent">
              {t('home.heroTitle')}
            </span>
          </h1>
          <p className="text-xl sm:text-2xl text-gray-700 mb-8 max-w-3xl mx-auto">
            {t('home.heroSubtitle')}
          </p>
          <p className="text-base text-gray-600 max-w-2xl mx-auto mb-8">
            {t('home.heroDescription')}
          </p>

          {/* Social Media Icons */}
          <div className="flex gap-6 justify-center mb-8">
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-700 hover:text-primary-600 transition-colors"
            >
              <Instagram className="w-6 h-6" />
            </a>
            <a
              href="https://wa.me/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-700 hover:text-primary-600 transition-colors"
            >
              <MessageCircle className="w-6 h-6" />
            </a>
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-700 hover:text-primary-600 transition-colors"
            >
              <Facebook className="w-6 h-6" />
            </a>
          </div>

          <div className="flex gap-4 justify-center">
            <Button size="lg">
              {t('home.bookCourse')}
              <ArrowRight className="w-5 h-5" />
            </Button>
            <Button variant="outline" size="lg">
              {t('home.exploreTrips')}
            </Button>
          </div>
        </motion.div>
      </Section>

      {/* Services Section */}
      <Section background="white">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl lg:text-5xl font-bold mb-4">
            {t('home.servicesTitle')}
          </h2>
          <p className="text-xl text-gray-600">
            {t('home.servicesSubtitle')}
          </p>
        </motion.div>

        <StaggerContainer staggerDelay={0.15} className="grid md:grid-cols-3 gap-8">
          {services.map((service, index) => {
            const icons = {
              Package: Package,
              Compass: Compass,
              GraduationCap: GraduationCap,
            };
            const Icon = icons[service.icon as keyof typeof icons];

            return (
              <Link key={service.id} to={service.link}>
                <Card className="group cursor-pointer h-full">
                    <div className="relative overflow-hidden rounded-xl mb-6">
                      <img
                        src={service.image}
                        alt={service.title}
                        className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-primary-900/80 to-transparent" />
                      <div className="absolute bottom-4 left-4">
                        <div className="bg-white p-3 rounded-xl shadow-lg">
                          <Icon className="w-6 h-6 text-primary-600" />
                        </div>
                      </div>
                    </div>
                    <h3 className="text-2xl font-bold mb-3 group-hover:text-primary-600 transition-colors">
                      {service.title}
                    </h3>
                    <p className="text-gray-600 mb-4">{service.description}</p>
                    <div className="flex items-center text-primary-600 font-semibold group-hover:gap-3 gap-2 transition-all">
                      {t('home.learnMore')}
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </div>
                </Card>
              </Link>
            );
          })}
        </StaggerContainer>
      </Section>

      {/* More About Us Section */}
      <Section background="gray">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold mb-6">{t('home.aboutTitle')}</h2>
            <p className="text-lg text-gray-700 mb-6 leading-relaxed">
              {t('home.aboutDescription')}
            </p>
            <Link to="/about">
              <Button>
                {t('home.learnMore')}
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            <img
              src="https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&h=600&fit=crop"
              alt="Diving"
              className="rounded-2xl shadow-2xl"
            />
            <div className="absolute -bottom-6 -right-6 bg-white p-6 rounded-xl shadow-xl">
              <p className="text-4xl font-bold text-primary-600">10+</p>
              <p className="text-gray-600">{t('home.yearsExperience')}</p>
            </div>
          </motion.div>
        </div>
      </Section>

      {/* Calendar Section */}
      <Section background="white">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl font-bold mb-4">{t('home.calendarTitle')}</h2>
          <p className="text-xl text-gray-600">{t('home.calendarSubtitle')}</p>
        </motion.div>

        <EventsCalendar />
      </Section>

      {/* Featured Trips */}
      <Section background="gradient">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl lg:text-5xl font-bold mb-4">
            {t('home.tripsTitle')}
          </h2>
          <p className="text-xl text-gray-600">
            {t('home.tripsSubtitle')}
          </p>
        </motion.div>

        {tripsLoading ? (
          <GridSkeleton count={3} />
        ) : tripsError ? (
          <div className="text-center py-12">
            <p className="text-red-600">{t('home.loadingError')}</p>
          </div>
        ) : (
          <>
            <StaggerContainer className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {trips.slice(0, 3).map((trip, index) => (
                  <Card className="group cursor-pointer overflow-hidden">
                    <div className="relative overflow-hidden rounded-xl mb-4">
                      <img
                        src={trip.image || 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=600&h=400&fit=crop'}
                        alt={trip.name}
                        className="w-full h-56 object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute top-4 right-4 bg-white px-4 py-2 rounded-full shadow-lg">
                        <p className="font-bold text-primary-600">SAR {trip.price}</p>
                      </div>
                    </div>
                    <h3 className="text-xl font-bold mb-2">{trip.name}</h3>
                    <p className="text-gray-600 text-sm mb-4">{trip.description}</p>
                    <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                      <span>{trip.duration}</span>
                      <span className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full">
                        {trip.difficulty}
                      </span>
                    </div>
                    <Button variant="outline" className="w-full">
                      {t('trips.bookNow')}
                    </Button>
                  </Card>
              ))}
            </StaggerContainer>

            <div className="text-center mt-12">
              <Link to="/shop/trips">
                <Button size="lg">
                  {t('home.viewAllTrips')}
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
            </div>
          </>
        )}
      </Section>

      {/* Featured Courses */}
      <Section background="white">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl lg:text-5xl font-bold mb-4">
            {t('home.coursesTitle')}
          </h2>
          <p className="text-xl text-gray-600">
            {t('home.coursesSubtitle')}
          </p>
        </motion.div>

        {coursesLoading ? (
          <GridSkeleton count={3} />
        ) : coursesError ? (
          <div className="text-center py-12">
            <p className="text-red-600">{t('home.loadingError')}</p>
          </div>
        ) : (
          <>
            <StaggerContainer className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {courses.slice(0, 3).map((course, index) => (
                  <Card className="h-full">
                    <div className="relative overflow-hidden rounded-xl mb-4">
                      <img
                        src={course.image || 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=600&h=400&fit=crop'}
                        alt={course.name}
                        className="w-full h-48 object-cover hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-4 right-4 bg-accent-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                        {course.level}
                      </div>
                    </div>
                    <h3 className="text-xl font-bold mb-2">{course.name}</h3>
                    <p className="text-gray-600 text-sm mb-4">{course.description}</p>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm text-gray-500">{course.duration}</span>
                      <span className="text-lg font-bold text-primary-600">SAR {course.price}</span>
                    </div>
                    <Button variant="primary" className="w-full">
                      {t('home.enrollNow')}
                    </Button>
                  </Card>
              ))}
            </StaggerContainer>

            <div className="text-center mt-12">
              <Link to="/shop/courses">
                <Button size="lg" variant="outline">
                  {t('home.viewAllCourses')}
                </Button>
              </Link>
            </div>
          </>
        )}
      </Section>

      {/* Featured Products */}
      <Section background="gray">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl lg:text-5xl font-bold mb-4">
            {t('home.productsTitle')}
          </h2>
          <p className="text-xl text-gray-600">
            {t('home.productsSubtitle')}
          </p>
        </motion.div>

        {productsLoading ? (
          <GridSkeleton count={4} />
        ) : productsError ? (
          <div className="text-center py-12">
            <p className="text-red-600">{t('home.loadingError')}</p>
          </div>
        ) : (
          <>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {products.slice(0, 4).map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="group cursor-pointer h-full">
                    <div className="relative overflow-hidden rounded-xl mb-4">
                      <img
                        src={product.image || 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=600&h=400&fit=crop'}
                        alt={product.name}
                        className="w-full h-40 object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                      {!product.in_stock && (
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                          <span className="bg-white px-4 py-2 rounded-full text-sm font-semibold">
                            {t('home.outOfStock')}
                          </span>
                        </div>
                      )}
                    </div>
                    <h3 className="text-lg font-bold mb-2 line-clamp-2">{product.name}</h3>
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">{product.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xl font-bold text-primary-600">SAR {product.price}</span>
                      <Button size="sm" variant="ghost">
                        <ShoppingBag className="w-4 h-4" />
                      </Button>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>

            <div className="text-center mt-12">
              <Link to="/shop/products">
                <Button size="lg">
                  <ShoppingBag className="w-5 h-5" />
                  {t('home.shopAllProducts')}
                </Button>
              </Link>
            </div>
          </>
        )}
      </Section>

      {/* Blog Posts Section */}
      <Section background="white">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl lg:text-5xl font-bold mb-4">
            {t('home.blogTitle')}
          </h2>
          <p className="text-xl text-gray-600">
            {t('home.blogSubtitle')}
          </p>
        </motion.div>

        {blogPostsLoading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="w-12 h-12 animate-spin text-primary-600" />
          </div>
        ) : blogPostsError ? (
          <div className="text-center py-12">
            <p className="text-red-600">{t('home.loadingError')}</p>
          </div>
        ) : (
          <>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {blogPosts.slice(0, 3).map((post, index) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link to="/blog">
                    <Card className="group cursor-pointer h-full overflow-hidden">
                      <div className="relative overflow-hidden rounded-xl mb-4">
                        <img
                          src={post.image || 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=600&h=400&fit=crop'}
                          alt={post.title}
                          className="w-full h-56 object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        {post.category && (
                          <div className="absolute top-4 left-4">
                            <span className="bg-white px-3 py-1 rounded-full text-sm font-semibold text-primary-600">
                              {post.category.name}
                            </span>
                          </div>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 mb-2">
                        {post.published_at ? new Date(post.published_at).toLocaleDateString() : new Date(post.created_at).toLocaleDateString()}
                        {post.author && ` • ${post.author.name}`}
                      </p>
                      <h3 className="text-xl font-bold mb-3 group-hover:text-primary-600 transition-colors">
                        {post.title}
                      </h3>
                      <p className="text-gray-600 text-sm mb-4">{post.excerpt}</p>
                      <div className="flex items-center text-primary-600 font-semibold group-hover:gap-3 gap-2 transition-all">
                        {t('home.readMore')}
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </div>

            <div className="text-center mt-12">
              <Link to="/blog">
                <Button size="lg" variant="outline">
                  {t('home.viewAllPosts')}
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
            </div>
          </>
        )}
      </Section>

      {/* CTA Section */}
      <Section background="white">
        <Card className="bg-gradient-to-r from-primary-600 via-accent-600 to-secondary-600 text-white text-center relative overflow-hidden">
          {/* Animated waves */}
          <div className="absolute inset-0 opacity-10">
            <motion.div
              animate={{ x: [0, 100, 0] }}
              transition={{ duration: 20, repeat: Infinity }}
              className="absolute inset-0"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='20' viewBox='0 0 100 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 10 Q 25 0, 50 10 T 100 10' fill='none' stroke='white' stroke-width='2'/%3E%3C/svg%3E")`,
                backgroundRepeat: 'repeat-x',
              }}
            />
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative z-10"
          >
            <Gift className="w-16 h-16 mx-auto mb-6" />
            <h2 className="text-4xl font-bold mb-4">{t('home.ctaTitle')}</h2>
            <p className="text-xl mb-8 text-white/90 max-w-2xl mx-auto">
              {t('home.ctaDescription')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/shop/courses">
                <Button variant="secondary" size="lg" className="bg-white text-primary-600 hover:bg-gray-100">
                  {t('home.bookCourse')}
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
              <Link to="/shop/trips">
                <Button
                  variant="outline"
                  size="lg"
                  className="border-white text-white hover:bg-white/10"
                >
                  {t('home.exploreTrips')}
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
            </div>
          </motion.div>
        </Card>
      </Section>
    </div>
  );
};
