import React from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Twitter, Ghost, MessageCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useGetFooterLinksQuery } from '../../services/api';

const socialLinks = [
  { Icon: Instagram, href: 'https://www.instagram.com/OSHYS_OCEANS', label: 'Instagram' },
  { Icon: Twitter, href: 'https://twitter.com/OSHYS_OCEANS', label: 'Twitter' },
  { Icon: Ghost, href: 'https://www.snapchat.com/add/OSHYS_OCEANS', label: 'Snapchat' },
  { Icon: MessageCircle, href: 'https://wa.me/966541000233', label: 'WhatsApp' },
];

export const Footer: React.FC = () => {
  const { t } = useTranslation();
  const { data: dynamicFooterLinks = [] } = useGetFooterLinksQuery({ active: true });

  const navLinks = [
    { name: t('footer.aboutUs'), href: '/about' },
    { name: t('footer.programs'), href: '/shop/courses' },
    { name: t('footer.divingTrips'), href: '/shop/trips' },
    { name: t('nav.blog'), href: '/blog' },
    { name: t('footer.contact'), href: '/contact' },
    { name: t('footer.faqs'), href: '/faq' },
    ...dynamicFooterLinks.map((link) => ({
      name: link.title,
      href: link.url,
      external: link.open_in_new_tab,
    })),
  ];

  return (
    <footer className="bg-gray-950 text-gray-400">
      {/* Main footer */}
      <div className="max-w-6xl mx-auto px-5 sm:px-8 pt-10 pb-6 sm:pt-14 sm:pb-8">

        {/* Top row: logo + socials */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 mb-8 sm:mb-10">
          <Link to="/" className="shrink-0">
            <img
              src="/images/logo.png"
              alt={t('brand.name')}
              className="h-16 sm:h-20 w-auto brightness-110"
            />
          </Link>

          <div className="flex gap-3">
            {socialLinks.map(({ Icon, href, label }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 hover:bg-primary-600 text-gray-400 hover:text-white transition-colors"
                aria-label={label}
              >
                <Icon className="w-4 h-4" />
              </a>
            ))}
          </div>
        </div>

        {/* Nav links — inline on desktop, wrapped on mobile */}
        <nav className="flex flex-wrap gap-x-6 gap-y-2 mb-8 sm:mb-10">
          {navLinks.map((link) => {
            const isExternal = link.href.startsWith('http') || (link as any).external;
            if (isExternal) {
              return (
                <a
                  key={link.name}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-gray-400 hover:text-white transition-colors py-1"
                >
                  {link.name}
                </a>
              );
            }
            return (
              <Link
                key={link.name}
                to={link.href}
                className="text-sm text-gray-400 hover:text-white transition-colors py-1"
              >
                {link.name}
              </Link>
            );
          })}
        </nav>

        {/* Contact row */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-8 text-sm mb-8 sm:mb-10">
          <a href="tel:+966541000233" className="hover:text-white transition-colors" dir="ltr">
            +966 54 100 0233
          </a>
          <a href="mailto:diver.cas1@gmail.com" className="hover:text-white transition-colors">
            diver.cas1@gmail.com
          </a>
          <span>{t('footer.location')}</span>
        </div>

        {/* Divider + bottom */}
        <div className="border-t border-white/10 pt-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <p className="text-xs text-gray-500">
            © {new Date().getFullYear()} {t('footer.copyright')}
          </p>
          <p className="text-xs text-gray-600">
            {t('footer.tagline')}
          </p>
        </div>
      </div>
    </footer>
  );
};
