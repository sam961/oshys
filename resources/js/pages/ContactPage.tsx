import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Clock, Send, CheckCircle, Instagram, Twitter, Ghost, MessageCircle, Loader2 } from 'lucide-react';
import { Section, Card, Button } from '../components/ui';
import { useSendContactMessageMutation } from '../services/api';
import { useTranslation } from 'react-i18next';

export const ContactPage: React.FC = () => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [sendContactMessage, { isLoading }] = useSendContactMessageMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      await sendContactMessage(formData).unwrap();
      setIsSubmitted(true);
      setFormData({ name: '', email: '', phone: '', message: '' });
      setTimeout(() => setIsSubmitted(false), 5000);
    } catch (err: any) {
      setError(err?.data?.message || t('contactPage.sendError', 'Failed to send message. Please try again.'));
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="pt-20">
      {/* Hero */}
      <div className="relative h-96 overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1596436889106-be35e843f974?w=1920&h=600&fit=crop"
          alt="Contact Us"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-primary-900/80 to-accent-900/80" />
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center text-white"
          >
            <Mail className="w-16 h-16 mx-auto mb-6" />
            <h1 className="text-6xl font-bold mb-4">{t('contactPage.heroTitle')}</h1>
            <p className="text-2xl text-white/90">
              {t('contactPage.heroDescription')}
            </p>
          </motion.div>
        </div>
      </div>

      {/* Contact Info Cards */}
      <Section background="white">
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Card className="text-center group cursor-pointer hover:shadow-xl transition-shadow">
              <div className="bg-gradient-to-br from-primary-500 to-accent-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <Phone className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2">{t('contactPage.callUs')}</h3>
              <p className="text-gray-600" dir="ltr">+966 54 100 0233</p>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            <Card className="text-center group cursor-pointer hover:shadow-xl transition-shadow">
              <div className="bg-gradient-to-br from-primary-500 to-accent-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <Mail className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2">{t('contactPage.emailUs')}</h3>
              <p className="text-gray-600">oshysoceans@gmail.com</p>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <a href="https://www.google.com/maps?q=Corals+and+shells+center+%D9%85%D8%B1%D9%83%D8%B2+%D9%85%D8%B1%D8%AC%D8%A7%D9%86+%D9%88%D8%B5%D8%AF%D9%81,+Al+Khobar+34742,+Saudi+Arabia" target="_blank" rel="noopener noreferrer">
              <Card className="text-center group cursor-pointer hover:shadow-xl transition-shadow">
                <div className="bg-gradient-to-br from-primary-500 to-accent-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <MapPin className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-2">{t('contactPage.visitUs')}</h3>
                <p className="text-gray-600">{t('footer.location')}</p>
                <p className="text-gray-600">{t('contactPage.easternProvince')}</p>
              </Card>
            </a>
          </motion.div>
        </div>

        {/* Contact Form & Info */}
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Form */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold mb-6">{t('contactPage.formTitle')}</h2>

            {isSubmitted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-green-50 border border-green-200 rounded-xl p-8 flex items-center gap-4"
              >
                <CheckCircle className="w-12 h-12 text-green-600 flex-shrink-0" />
                <div>
                  <h3 className="font-bold text-green-900 mb-1 text-xl">{t('contactPage.messageSentTitle')}</h3>
                  <p className="text-green-700">{t('contactPage.messageSentDescription')}</p>
                </div>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                    {t('contactPage.fullName')} *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                    placeholder={t('contactPage.namePlaceholder')}
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                    {t('contactPage.emailAddress')} *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                    placeholder={t('contactPage.emailPlaceholder')}
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-2">
                    {t('contactPage.phoneNumber')}
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                    placeholder={t('contactPage.phonePlaceholder')}
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-semibold text-gray-700 mb-2">
                    {t('contactPage.message')} *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={6}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all resize-none"
                    placeholder={t('contactPage.messagePlaceholder')}
                  />
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                    {error}
                  </div>
                )}

                <Button type="submit" size="lg" className="w-full" disabled={isLoading}>
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                  {isLoading ? t('contactPage.sending', 'Sending...') : t('contactPage.sendMessage')}
                </Button>
              </form>
            )}
          </motion.div>

          {/* Additional Info */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <Card className="h-full">
              <h3 className="text-2xl font-bold mb-6">{t('contactPage.additionalInfo')}</h3>

              {/* Opening Hours */}
              <div className="mb-8">
                <div className="flex items-start gap-3 mb-3">
                  <Clock className="w-6 h-6 text-primary-600 flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-semibold text-lg mb-2">{t('contactPage.openingHours')}</h4>
                    <div className="space-y-1 text-gray-600">
                      <p>{t('contactPage.sundayThursday')}</p>
                      <p>{t('contactPage.fridaySaturday')}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Social Media */}
              <div className="mb-8">
                <h4 className="font-semibold text-lg mb-4">{t('contactPage.connectWithUs')}</h4>
                <div className="flex gap-4">
                  <a
                    href="https://www.instagram.com/OSHYS_OCEANS"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-gradient-to-br from-primary-500 to-accent-500 text-white p-3 rounded-full hover:scale-110 transition-transform"
                  >
                    <Instagram className="w-6 h-6" />
                  </a>
                  <a
                    href="https://twitter.com/OSHYS_OCEANS"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-gradient-to-br from-primary-500 to-accent-500 text-white p-3 rounded-full hover:scale-110 transition-transform"
                  >
                    <Twitter className="w-6 h-6" />
                  </a>
                  <a
                    href="https://www.snapchat.com/add/OSHYS_OCEANS"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-gradient-to-br from-primary-500 to-accent-500 text-white p-3 rounded-full hover:scale-110 transition-transform"
                  >
                    <Ghost className="w-6 h-6" />
                  </a>
                  <a
                    href="https://wa.me/966541000233"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-gradient-to-br from-primary-500 to-accent-500 text-white p-3 rounded-full hover:scale-110 transition-transform"
                  >
                    <MessageCircle className="w-6 h-6" />
                  </a>
                </div>
              </div>

              {/* Why Contact Us */}
              <div className="p-6 bg-gradient-to-br from-primary-50 to-accent-50 rounded-xl">
                <h4 className="font-bold text-lg mb-3">{t('contactPage.whyContactTitle')}</h4>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" />
                    <span>{t('contactPage.whyContact1')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" />
                    <span>{t('contactPage.whyContact2')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" />
                    <span>{t('contactPage.whyContact3')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" />
                    <span>{t('contactPage.whyContact4')}</span>
                  </li>
                </ul>
              </div>
            </Card>
          </motion.div>
        </div>
      </Section>

      {/* Map Section */}
      <Section background="gray">
        <Card className="overflow-hidden p-0">
          <div className="h-96 bg-gray-200 relative">
            <img
              src="https://images.unsplash.com/photo-1524661135-423995f22d0b?w=1400&h=600&fit=crop"
              alt="Location"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-8">
              <div className="text-white">
                <h3 className="text-3xl font-bold mb-2">{t('contactPage.visitCenterTitle')}</h3>
                <p className="text-xl text-white/90">{t('contactPage.visitCenterLocation')}</p>
              </div>
            </div>
          </div>
        </Card>
      </Section>
    </div>
  );
};
