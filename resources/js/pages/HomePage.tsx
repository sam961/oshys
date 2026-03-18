import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Compass, GraduationCap, ArrowRight, ShoppingBag, Loader2, Anchor, Users, Award, Shield } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Lottie from 'lottie-react';
import DOMPurify from 'dompurify';
import { HeroSlider } from '../components/features/HeroSlider';
import { EventsCalendar } from '../components/features/EventsCalendar';
import { BookingModal } from '../components/features/BookingModal';
import { Section, Card, Button, GridSkeleton, HorizontalScroll, SaudiRiyalPrice } from '../components/ui';
import { LiquidBackground, WaveBackground, UnderwaterOverlay, SeaLifeDecorations, DivingDecorations, OceanDecorations } from '../components/animations';
import { useGetCoursesQuery, useGetTripsQuery, useGetProductsQuery, useGetBlogPostsQuery } from '../services/api';
import type { Course, Trip, Product, BlogPost } from '../types';

export const HomePage: React.FC = () => {
  const { t } = useTranslation();

  // Booking modal state
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [bookingType, setBookingType] = useState<'course' | 'trip'>('course');

  const handleCourseClick = (e: React.MouseEvent, course: Course) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedCourse(course);
    setSelectedTrip(null);
    setBookingType('course');
    setIsBookingOpen(true);
  };

  const handleTripClick = (e: React.MouseEvent, trip: Trip) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedTrip(trip);
    setSelectedCourse(null);
    setBookingType('trip');
    setIsBookingOpen(true);
  };

  const handleCloseBooking = () => {
    setIsBookingOpen(false);
    setSelectedCourse(null);
    setSelectedTrip(null);
  };

  // Lottie diver animation
  const [diverData, setDiverData] = useState<object | null>(null);
  useEffect(() => {
    fetch('/animations/snorkeling.json')
      .then((res) => res.json())
      .then(setDiverData)
      .catch(() => {});
  }, []);

  // Fetch featured data from API
  const { data: courses = [], isLoading: coursesLoading, error: coursesError } = useGetCoursesQuery({ active: true, featured: true });
  const { data: trips = [], isLoading: tripsLoading, error: tripsError } = useGetTripsQuery({ active: true, featured: true });
  const { data: products = [], isLoading: productsLoading, error: productsError } = useGetProductsQuery({ active: true, featured: true });
  const { data: blogPosts = [], isLoading: blogPostsLoading, error: blogPostsError } = useGetBlogPostsQuery({ published: true, featured: true });

  // Service cards data for "What We Offer"
  const serviceCards = [
    {
      id: 1,
      title: t('home.service1Title'),
      description: t('home.service1Description'),
      icon: GraduationCap,
      link: '/shop/courses?category=Start+Diving',
      image: '/static/diving/courses/diving-courses.jpg',
    },
    {
      id: 2,
      title: t('home.service2Title'),
      description: t('home.service2Description'),
      icon: Award,
      link: '/shop/courses?category=Develop+Your+Diving',
      image: '/static/diving/essentials/diving-essentials.jpg',
    },
    {
      id: 3,
      title: t('home.service3Title'),
      description: t('home.service3Description'),
      icon: Compass,
      link: '/shop/trips',
      image: '/static/diving/trips/diving-trips.jpg',
    },
  ];

  return (
    <div className="overflow-hidden">
      {/* 1. Hero Slider */}
      <HeroSlider />

      {/* 2. Start Diving — Your Journey Underwater */}
      <Section background="gradient" className="text-center relative overflow-hidden">
        <LiquidBackground />
        <WaveBackground variant="primary" opacity={0.05} />

        {/* Lottie Diver - Left side */}
        {diverData && (
          <motion.div
            className="absolute left-[-2%] bottom-[5%] w-[200px] h-[200px] sm:w-[280px] sm:h-[280px] lg:w-[380px] lg:h-[380px] pointer-events-none hidden sm:block"
            animate={{
              y: [0, -12, 0, 8, 0],
              x: [0, 6, 0, -4, 0],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            aria-hidden="true"
          >
            <Lottie
              animationData={diverData}
              loop
              className="w-full h-full opacity-80 drop-shadow-[0_0_25px_rgba(6,182,212,0.2)]"
            />
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative z-10"
        >
          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6">
            <span className="bg-gradient-to-r from-primary-600 via-accent-600 to-secondary-600 bg-clip-text text-transparent">
              {t('home.startDivingTitle')}
            </span>
          </h2>
          <p className="text-base sm:text-xl lg:text-2xl text-gray-700 mb-4 sm:mb-8 max-w-3xl mx-auto">
            {t('home.startDivingSubtitle')}
          </p>
          <p className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto mb-6 sm:mb-8">
            {t('home.startDivingDescription')}
          </p>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center">
            <Link to="/shop/courses">
              <Button size="lg">
                {t('home.viewPrograms')}
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
            <Link to="/shop/trips">
              <Button variant="outline" size="lg">
                {t('home.exploreSea')}
              </Button>
            </Link>
          </div>
        </motion.div>
      </Section>

      {/* 3. Programs — What We Offer */}
      <Section background="white" className="relative overflow-hidden">
        <SeaLifeDecorations />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-8 sm:mb-16 relative z-10"
        >
          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4">
            {t('home.servicesTitle')}
          </h2>
          <p className="text-base sm:text-xl text-gray-600">
            {t('home.servicesSubtitle')}
          </p>
        </motion.div>

        <HorizontalScroll itemCount={serviceCards.length} className="md:grid-cols-3 relative z-10">
          {serviceCards.map((service) => {
            const Icon = service.icon;
            return (
              <Link key={service.id} to={service.link} className="shrink-0 w-[80vw] snap-center sm:w-auto">
                <Card className="group cursor-pointer h-full">
                  <div className="relative overflow-hidden rounded-xl mb-6">
                    <img
                      src={service.image || '/placeholder.svg'}
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
                  <h3 className="text-xl sm:text-2xl font-bold mb-3 group-hover:text-primary-600 transition-colors">
                    {service.title}
                  </h3>
                  <p className="text-gray-600 mb-4 text-sm sm:text-base">{service.description}</p>
                  <div className="flex items-center text-primary-600 font-semibold group-hover:gap-3 gap-2 transition-all">
                    {t('home.learnMore')}
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Card>
              </Link>
            );
          })}
        </HorizontalScroll>
      </Section>

      {/* 4. Blog Posts — How We Train */}
      <Section background="white" className="relative overflow-hidden">
        <OceanDecorations variant="deep-sea" />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-8 sm:mb-16 relative z-10"
        >
          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4">
            {t('home.blogTitle')}
          </h2>
          <p className="text-base sm:text-xl text-gray-600">
            {t('home.blogSubtitle')}
          </p>
        </motion.div>

        <div className="relative z-10">
          {blogPostsLoading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="w-8 h-8 sm:w-12 sm:h-12 animate-spin text-primary-600" />
            </div>
          ) : blogPostsError ? (
            <div className="text-center py-12">
              <p className="text-red-600">{t('home.loadingError')}</p>
            </div>
          ) : blogPosts.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-6 text-sm sm:text-base">{t('home.noBlogPosts', 'Check back soon for tips and insights from the diving world.')}</p>
              <Link to="/blog">
                <Button variant="outline">
                  {t('home.viewAllPosts')}
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          ) : (
            <>
              <HorizontalScroll itemCount={Math.min(blogPosts.length, 3)} className="sm:grid-cols-2 lg:grid-cols-3">
                {blogPosts.slice(0, 3).map((post) => (
                  <div key={post.id} className="shrink-0 w-[80vw] snap-center sm:w-auto">
                    <Link to={`/blog/${post.id}`}>
                      <Card className="group cursor-pointer h-full overflow-hidden">
                        <div className="relative overflow-hidden rounded-xl mb-4">
                          <img
                            src={post.image_url || '/placeholder.svg'}
                            alt={post.title}
                            className="w-full h-48 sm:h-56 object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                        </div>
                        <p className="text-xs sm:text-sm text-gray-500 mb-2">
                          {post.published_at ? new Date(post.published_at).toLocaleDateString() : new Date(post.created_at).toLocaleDateString()}
                          {post.author && ` • ${post.author.name}`}
                        </p>
                        <h3 className="text-lg sm:text-xl font-bold mb-3 group-hover:text-primary-600 transition-colors line-clamp-2">
                          {post.title}
                        </h3>
                        <div className="text-gray-600 text-sm mb-4 line-clamp-2 prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(post.excerpt || '') }} />
                        <div className="flex items-center text-primary-600 font-semibold group-hover:gap-3 gap-2 transition-all text-sm">
                          {t('home.readMore')}
                          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </Card>
                    </Link>
                  </div>
                ))}
              </HorizontalScroll>

              <div className="text-center mt-8 sm:mt-12">
                <Link to="/blog">
                  <Button variant="outline">
                    {t('home.viewAllPosts')}
                    <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                  </Button>
                </Link>
              </div>
            </>
          )}
        </div>
      </Section>

      {/* 5. Featured Trips */}
      <Section background="gradient" className="relative overflow-hidden">
        <OceanDecorations variant="waves" />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-8 sm:mb-16 relative z-10"
        >
          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4">
            {t('home.tripsTitle')}
          </h2>
          <p className="text-base sm:text-xl text-gray-600">
            {t('home.tripsSubtitle')}
          </p>
        </motion.div>

        <div className="relative z-10">
          {tripsLoading ? (
            <GridSkeleton count={3} />
          ) : tripsError ? (
            <div className="text-center py-12">
              <p className="text-red-600">{t('home.loadingError')}</p>
            </div>
          ) : (
            <>
              <HorizontalScroll itemCount={Math.min(trips.length, 3)} className="sm:grid-cols-2 lg:grid-cols-3">
                {trips.slice(0, 3).map((trip) => (
                    <Card key={trip.id} className="h-full flex flex-col group cursor-pointer overflow-hidden shrink-0 w-[80vw] snap-center sm:w-auto">
                      <div className="relative overflow-hidden rounded-xl mb-4">
                        <img
                          src={trip.image_url || '/placeholder.svg'}
                          alt={trip.name}
                          className="w-full h-48 sm:h-56 object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        <div className="absolute top-4 right-4 bg-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-full shadow-lg">
                          <SaudiRiyalPrice
                            amount={trip.price}
                            className="font-bold text-primary-600 text-sm sm:text-base"
                          />
                        </div>
                      </div>
                      <h3 className="text-lg sm:text-xl font-bold mb-2">{trip.name}</h3>
                      <div className="text-gray-600 text-sm mb-4 line-clamp-2 prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(trip.description || '') }} />
                      <div className="flex gap-2 mt-auto">
                        <Link to={`/shop/trips/${trip.id}`} className="flex-1">
                          <Button variant="outline" className="w-full" size="sm">
                            {t('pages.trips.viewDetails')}
                          </Button>
                        </Link>
                        <Button variant="primary" className="flex-1" size="sm" onClick={(e) => handleTripClick(e, trip)}>
                          {t('trips.bookNow')}
                        </Button>
                      </div>
                    </Card>
                ))}
              </HorizontalScroll>

              <div className="text-center mt-8 sm:mt-12">
                <Link to="/shop/trips">
                  <Button size="lg">
                    {t('home.viewAllTrips')}
                    <ArrowRight className="w-5 h-5" />
                  </Button>
                </Link>
              </div>
            </>
          )}
        </div>
      </Section>

      {/* 6. Community / Initiatives */}
      <Section background="gray" className="relative overflow-hidden">
        <DivingDecorations />
        <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 items-center relative z-10">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-2xl sm:text-4xl font-bold mb-4 sm:mb-6">{t('home.communityTitle')}</h2>
            <p className="text-base sm:text-lg text-gray-700 mb-4 sm:mb-6 leading-relaxed">
              {t('home.communityDescription')}
            </p>
            <Link to="/initiatives">
              <Button>
                {t('home.viewInitiatives')}
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
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
              src="/static/about/about-corals-shells.jpg"
              alt={t('home.communityTitle')}
              className="w-full h-56 sm:h-96 object-cover rounded-2xl shadow-2xl"
            />
          </motion.div>
        </div>
      </Section>

      {/* 7. Calendar Section */}
      <Section background="white" id="calendar" className="relative overflow-hidden">
        <OceanDecorations variant="jellyfish" />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-6 sm:mb-12 relative z-10"
        >
          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4">{t('home.calendarTitle')}</h2>
          <p className="text-base sm:text-xl text-gray-600">{t('home.calendarSubtitle')}</p>
        </motion.div>

        <div className="relative z-10">
          <EventsCalendar />
        </div>
      </Section>

      {/* 8. Featured Products / Equipment */}
      <Section background="gray" className="relative overflow-hidden">
        <OceanDecorations variant="treasure" />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-8 sm:mb-16 relative z-10"
        >
          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4">
            {t('home.productsTitle')}
          </h2>
          <p className="text-base sm:text-xl text-gray-600">
            {t('home.productsSubtitle')}
          </p>
        </motion.div>

        <div className="relative z-10">
          {productsLoading ? (
            <GridSkeleton count={4} />
          ) : productsError ? (
            <div className="text-center py-12">
              <p className="text-red-600">{t('home.loadingError')}</p>
            </div>
          ) : (
            <>
              <HorizontalScroll itemCount={Math.min(products.length, 4)} className="sm:grid-cols-2 lg:grid-cols-4">
                {products.slice(0, 4).map((product) => (
                  <div key={product.id} className="shrink-0 w-[65vw] snap-center sm:w-auto">
                    <Card className="group cursor-pointer h-full">
                      <div className="relative overflow-hidden rounded-xl mb-4">
                        <img
                          src={product.image_url || '/placeholder.svg'}
                          alt={product.name}
                          className="w-full h-36 sm:h-40 object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                        {!product.in_stock && (
                          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                            <span className="bg-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-semibold">
                              {t('home.outOfStock')}
                            </span>
                          </div>
                        )}
                      </div>
                      <h3 className="text-base sm:text-lg font-bold mb-2 line-clamp-2">{product.name}</h3>
                      <div className="text-gray-600 text-xs sm:text-sm mb-3 line-clamp-2 prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(product.description || '') }} />
                      <div className="flex items-center justify-between">
                        <SaudiRiyalPrice amount={product.price} className="text-lg sm:text-xl font-bold text-primary-600" />
                        <Button size="sm" variant="ghost">
                          <ShoppingBag className="w-4 h-4" />
                        </Button>
                      </div>
                    </Card>
                  </div>
                ))}
              </HorizontalScroll>

              <div className="text-center mt-8 sm:mt-12">
                <a href="https://coralsandshells.sa" target="_blank" rel="noopener noreferrer">
                  <Button size="lg">
                    <ShoppingBag className="w-5 h-5" />
                    {t('home.shopAllProducts')}
                  </Button>
                </a>
              </div>
            </>
          )}
        </div>
      </Section>

      {/* 9. Closing Line */}
      <Section background="white">
        <Card className="bg-gradient-to-r from-primary-600 via-accent-600 to-secondary-600 text-white text-center relative overflow-hidden">
          <UnderwaterOverlay bubbleCount={15} showLightRays={false} showWave={false} />
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
            <Anchor className="w-10 h-10 sm:w-16 sm:h-16 mx-auto mb-4 sm:mb-6" />
            <h2 className="text-xl sm:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4">{t('home.closingLine1')}</h2>
            <p className="text-sm sm:text-xl mb-6 sm:mb-8 text-white/90 max-w-2xl mx-auto">
              {t('home.closingLine2')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/shop/courses">
                <Button variant="secondary" size="lg" className="bg-white text-primary-600 hover:bg-gray-100">
                  {t('home.viewPrograms')}
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
              <Link to="/contact">
                <Button
                  variant="outline"
                  size="lg"
                  className="border-white text-white hover:bg-white/10"
                >
                  {t('home.contactUs')}
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
            </div>
          </motion.div>
        </Card>
      </Section>

      {/* Training Team Section */}
      <Section background="gradient" className="relative overflow-hidden">
        <WaveBackground variant="accent" opacity={0.03} />
        <div className="relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-6 sm:mb-12"
          >
            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6">{t('home.teamTitle')}</h2>
            <p className="text-sm sm:text-lg text-gray-700 max-w-3xl mx-auto mb-6 sm:mb-8">
              {t('home.teamDescription')}
            </p>
          </motion.div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 max-w-4xl mx-auto">
            {[
              { icon: Users, label: t('home.teamInstructors') },
              { icon: Shield, label: t('home.teamAssistantInstructors') },
              { icon: Anchor, label: t('home.teamDivemasters') },
              { icon: Award, label: t('home.teamAdaptiveDiving') },
            ].map((category, index) => (
              <motion.div
                key={category.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="text-center h-full">
                  <div className="bg-primary-100 w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <category.icon className="w-7 h-7 text-primary-600" />
                  </div>
                  <h3 className="font-bold text-sm sm:text-lg">{category.label}</h3>
                </Card>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-10">
            <Link to="/about#team">
              <Button variant="outline" size="lg">
                {t('home.viewTeam')}
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </Section>

      {/* Booking Modal */}
      {(selectedCourse || selectedTrip) && (
        <BookingModal
          isOpen={isBookingOpen}
          onClose={handleCloseBooking}
          item={(bookingType === 'course' ? selectedCourse : selectedTrip)!}
          type={bookingType}
        />
      )}
    </div>
  );
};
