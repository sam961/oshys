import React from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Facebook, MessageCircle, Mail, Phone, MapPin, Waves } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useGetFooterLinksQuery } from '../../services/api';

const socialLinks = [
  { Icon: Instagram, href: '#', label: 'Instagram' },
  { Icon: Facebook, href: '#', label: 'Facebook' },
  { Icon: MessageCircle, href: '#', label: 'WhatsApp' },
];

export const Footer: React.FC = () => {
  const { t } = useTranslation();
  const { data: dynamicFooterLinks = [] } = useGetFooterLinksQuery({ active: true });

  const footerLinks = {
    company: [
      { name: t('footer.aboutUs'), href: '/about' },
      { name: t('footer.ourTeam'), href: '/about#team' },
      { name: t('footer.contact'), href: '/contact' },
      { name: t('nav.blog'), href: '/blog' },
    ],
    services: [
      { name: t('footer.divingCourses'), href: '/shop/courses' },
      { name: t('footer.divingTrips'), href: '/shop/trips' },
      { name: t('footer.equipment'), href: '/shop/products' },
    ],
  };

  // Render a link - handles both internal and external URLs
  const renderLink = (link: { name: string; href: string; openInNewTab?: boolean }, key: string | number) => {
    const isExternal = link.href.startsWith('http') || link.openInNewTab;

    if (isExternal) {
      return (
        <li key={key}>
          <a
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-primary-400 transition-colors text-sm inline-block hover:translate-x-1 duration-200"
          >
            {link.name}
          </a>
        </li>
      );
    }

    return (
      <li key={key}>
        <Link
          to={link.href}
          className="text-gray-400 hover:text-primary-400 transition-colors text-sm inline-block hover:translate-x-1 duration-200"
        >
          {link.name}
        </Link>
      </li>
    );
  };

  return (
    <footer className="bg-gradient-to-b from-gray-900 to-black text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-3 mb-6 group">
              <motion.div
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.5 }}
                className="bg-gradient-to-br from-primary-600 to-accent-600 p-2.5 rounded-xl shadow-lg"
              >
                <Waves className="w-7 h-7 text-white" />
              </motion.div>
              <div>
                <span className="text-2xl font-bold text-white block">Coral & Shells</span>
                <span className="text-sm text-gray-400">Diving Center</span>
              </div>
            </Link>
            <p className="text-gray-400 mb-6 leading-relaxed">
              {t('footer.tagline')}
            </p>

            {/* Contact Info */}
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <Phone className="w-4 h-4 text-primary-400" />
                <span>+966 50 123 4567</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Mail className="w-4 h-4 text-primary-400" />
                <span>info@coralsandshells.sa</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <MapPin className="w-4 h-4 text-primary-400" />
                <span>{t('footer.location')}</span>
              </div>
            </div>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="text-white font-bold mb-4 text-lg">
              {t('footer.company')}
            </h3>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => renderLink(link, link.name))}
            </ul>
          </div>

          {/* Services Links */}
          <div>
            <h3 className="text-white font-bold mb-4 text-lg">
              {t('footer.services')}
            </h3>
            <ul className="space-y-3">
              {footerLinks.services.map((link) => renderLink(link, link.name))}
            </ul>
          </div>

          {/* Support Links - Dynamic from CMS */}
          <div>
            <h3 className="text-white font-bold mb-4 text-lg">
              {t('footer.support')}
            </h3>
            <ul className="space-y-3">
              {dynamicFooterLinks.length > 0 ? (
                dynamicFooterLinks.map((link) =>
                  renderLink(
                    { name: link.title, href: link.url, openInNewTab: link.open_in_new_tab },
                    link.id
                  )
                )
              ) : (
                // Fallback links if no dynamic links are available
                <>
                  {renderLink({ name: t('footer.faqs'), href: '#' }, 'faqs')}
                  {renderLink({ name: t('footer.privacyPolicy'), href: '#' }, 'privacy')}
                  {renderLink({ name: t('footer.termsConditions'), href: '#' }, 'terms')}
                </>
              )}
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="pt-8 border-t border-gray-800">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-6">
            {/* Social Links */}
            <div className="flex gap-4">
              {socialLinks.map(({ Icon, href, label }) => (
                <motion.a
                  key={label}
                  href={href}
                  whileHover={{ y: -3 }}
                  className="bg-gray-800 hover:bg-gradient-to-br hover:from-primary-600 hover:to-accent-600 p-3 rounded-lg transition-all"
                  aria-label={label}
                >
                  <Icon className="w-5 h-5" />
                </motion.a>
              ))}
            </div>

            {/* Copyright */}
            <p className="text-sm text-gray-400 text-center sm:text-right">
              © {new Date().getFullYear()} {t('footer.copyright')}
            </p>
          </div>
        </div>
      </div>

      {/* Subtle wave pattern at bottom */}
      <div className="h-2 bg-gradient-to-r from-primary-600 via-accent-600 to-secondary-600" />
    </footer>
  );
};
