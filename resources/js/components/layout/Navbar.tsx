import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Waves, CalendarDays, ExternalLink } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '../ui';
import { LanguageSwitcher } from '../shared/LanguageSwitcher';

interface NavItem {
  name: string;
  href: string;
  external?: boolean;
}

export const Navbar: React.FC = () => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleCalendarClick = () => {
    if (location.pathname === '/') {
      const element = document.getElementById('calendar');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      sessionStorage.setItem('scrollToCalendar', 'true');
      navigate('/');
    }
  };

  useEffect(() => {
    if (location.pathname === '/' && sessionStorage.getItem('scrollToCalendar') === 'true') {
      sessionStorage.removeItem('scrollToCalendar');
      setTimeout(() => {
        const element = document.getElementById('calendar');
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 500);
    }
  }, [location.pathname]);

  const mainNav: NavItem[] = [
    { name: t('nav.home'), href: '/' },
    { name: t('nav.about'), href: '/about' },
    { name: t('nav.blog'), href: '/blog' },
    { name: t('nav.initiatives'), href: '/initiatives' },
    { name: t('nav.contact'), href: '/contact' },
  ];

  const shopNav: NavItem[] = [
    { name: t('nav.shop'), href: 'https://coralsandshells.sa', external: true },
    { name: t('courses.allCourses'), href: '/shop/courses' },
    { name: t('trips.allTrips'), href: '/shop/trips' },
  ];

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-white/95 backdrop-blur-lg shadow-lg'
          : 'bg-white/90 backdrop-blur-sm'
      }`}
    >
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-12">
        <div className="flex items-center justify-between h-20">
          {/* Logo - Left aligned */}
          <div className="shrink-0">
            <Link to="/" className="flex items-center gap-3 group">
              <motion.div
                whileHover={{ scale: 1.05, rotate: 5 }}
                transition={{ duration: 0.3 }}
                className="bg-gradient-to-br from-primary-600 to-accent-600 p-2.5 rounded-xl shadow-lg"
              >
                <Waves className="w-7 h-7 text-white" />
              </motion.div>
              <div className="flex flex-col">
                <span className="text-xl font-bold bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
                  {t('brand.name')}
                </span>
                <span className="text-xs text-gray-600">{t('brand.subtitle')}</span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation - Center */}
          <div className="hidden lg:flex items-center gap-1 flex-1 justify-center">
            {mainNav.map((item) => (
              <div key={item.name} className="relative">
                <Link
                  to={item.href}
                  className="relative px-4 py-2 text-sm font-medium text-gray-700 hover:text-primary-600 transition-colors rounded-lg hover:bg-primary-50"
                >
                  {item.name}
                  {location.pathname === item.href && (
                    <motion.div
                      layoutId="navbar-indicator"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary-600 to-accent-600"
                      transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                </Link>
              </div>
            ))}

            {/* Divider */}
            <div className="w-px h-5 bg-gray-300 mx-2" />

            {shopNav.map((item) => (
              <div key={item.name} className="relative">
                {item.external ? (
                  <a
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors rounded-lg hover:bg-primary-50"
                  >
                    {item.name}
                    <ExternalLink className="w-3 h-3 opacity-50" />
                  </a>
                ) : (
                  <Link
                    to={item.href}
                    className="relative px-4 py-2 text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors rounded-lg hover:bg-primary-50"
                  >
                    {item.name}
                    {location.pathname === item.href && (
                      <motion.div
                        layoutId="navbar-indicator"
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary-600 to-accent-600"
                        transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                  </Link>
                )}
              </div>
            ))}
          </div>

          {/* Right Side - Calendar, Language Switcher and {t('common.bookNow')} Button */}
          <div className="hidden lg:flex items-center gap-3 flex-shrink-0">
            <button
              onClick={handleCalendarClick}
              className="p-2 rounded-lg text-gray-700 hover:text-primary-600 hover:bg-primary-50 transition-colors"
              title={t('brand.viewCalendar')}
            >
              <CalendarDays className="w-5 h-5" />
            </button>
            <LanguageSwitcher />
            <Link to="/contact">
              <Button size="sm">{t('common.bookNow')}</Button>
            </Link>
          </div>

          {/* Mobile - Calendar Icon and Menu Button */}
          <div className="lg:hidden flex items-center gap-2">
            <button
              onClick={handleCalendarClick}
              className="p-2 rounded-lg text-gray-700 hover:text-primary-600 hover:bg-primary-50 transition-colors"
              title={t('brand.viewCalendar')}
            >
              <CalendarDays className="w-5 h-5" />
            </button>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-white border-t border-gray-200"
          >
            <div className="px-4 py-4 space-y-2">
              {mainNav.map((item) => (
                <div key={item.name}>
                  <Link
                    to={item.href}
                    className={`block px-4 py-3 rounded-lg transition-colors ${
                      location.pathname === item.href
                        ? 'bg-primary-50 text-primary-600 font-medium'
                        : 'text-gray-700 hover:bg-primary-50'
                    }`}
                  >
                    {item.name}
                  </Link>
                </div>
              ))}

              {/* Divider */}
              <div className="h-px bg-gray-200 mx-4" />

              {shopNav.map((item) => (
                <div key={item.name}>
                  {item.external ? (
                    <a
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between px-4 py-3 rounded-lg text-primary-600 hover:bg-primary-50 transition-colors"
                    >
                      {item.name}
                      <ExternalLink className="w-4 h-4 opacity-50" />
                    </a>
                  ) : (
                    <Link
                      to={item.href}
                      className={`block px-4 py-3 rounded-lg transition-colors ${
                        location.pathname === item.href
                          ? 'bg-primary-50 text-primary-600 font-medium'
                          : 'text-primary-600 hover:bg-primary-50'
                      }`}
                    >
                      {item.name}
                    </Link>
                  )}
                </div>
              ))}

              <div className="pt-2 space-y-2">
                <div className="px-4">
                  <LanguageSwitcher />
                </div>
                <Link to="/contact">
                  <Button className="w-full" size="sm">{t('common.bookNow')}</Button>
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};
