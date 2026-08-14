import React from 'react';
import { useTranslation } from 'react-i18next';
import type { UpcomingDate } from '../../types';
import { whatsappLink } from '../../utils/whatsapp';
import { formatVenueDate, formatVenueTime, spansDays } from './UpcomingDates';

interface WhatsAppInquiryProps {
  /** What the visitor is asking about. */
  title: string;
  /** The date they picked, if any. */
  date?: UpcomingDate | null;
  /** Page address, so the team can see exactly what was being viewed. */
  url?: string;
  className?: string;
  variant?: 'solid' | 'outline';
}

const WhatsAppGlyph: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

/**
 * "Inquire on WhatsApp", with the subject and chosen date already written.
 *
 * The message is composed in the visitor's own language: someone reading the
 * Arabic site should not have an English sentence appear in their WhatsApp, and
 * the team can tell from the message which language to reply in.
 */
export const WhatsAppInquiry: React.FC<WhatsAppInquiryProps> = ({
  title,
  date = null,
  url,
  className = '',
  variant = 'solid',
}) => {
  const { t, i18n } = useTranslation();

  const lines = [t('whatsapp.inquiryIntro', { title })];

  if (date) {
    const from = `${formatVenueDate(date.start_at, i18n.language)} · ${formatVenueTime(date.start_at)}`;
    // A date running into another day has to name both ends, or the team is
    // told a start with no idea how long it runs.
    const when = spansDays(date)
      ? `${from} → ${formatVenueDate(date.end_at as string, i18n.language)} · ${formatVenueTime(date.end_at as string)}`
      : date.end_at ? `${from} – ${formatVenueTime(date.end_at)}` : from;
    lines.push(t('whatsapp.inquiryDate', { date: when }));
  }

  if (url) {
    lines.push(url);
  }

  const styles = variant === 'solid'
    ? 'bg-[#25D366] text-white hover:bg-[#1da851] shadow-sm'
    : 'border-2 border-[#25D366] text-[#128C7E] hover:bg-[#25D366]/10';

  return (
    <a
      href={whatsappLink(lines.join('\n'))}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex w-full items-center justify-center gap-2 rounded-lg px-5 py-3 text-sm sm:text-base font-semibold transition-colors ${styles} ${className}`}
    >
      <WhatsAppGlyph className="h-5 w-5" />
      {date ? t('whatsapp.inquireAboutDate') : t('whatsapp.inquire')}
    </a>
  );
};
