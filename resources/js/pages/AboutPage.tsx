import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Award, Users, TrendingUp, MapPin, Shield, Layers, UserCheck, FileCheck, Anchor, Loader2, Clock, Instagram, Facebook, Linkedin, Twitter } from 'lucide-react';
import { Section, Card } from '../components/ui';
import { CountUp } from '../components/animations';
import { stats } from '../data/mockData';
import { useGetTeamMembersQuery } from '../services/api';
import { useTranslation } from 'react-i18next';

export const AboutPage: React.FC = () => {
  const { t } = useTranslation();
  const { hash } = useLocation();

  // Fetch team members from API
  const { data: team = [], isLoading: teamLoading, error: teamError } = useGetTeamMembersQuery({ active: true });

  useEffect(() => {
    if (hash) {
      const el = document.getElementById(hash.replace('#', ''));
      if (el) {
        setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
      }
    }
  }, [hash, teamLoading]);

  const values = [
    {
      icon: Shield,
      title: t('about.valueSafetyFirst'),
      description: t('about.valueSafetyDescription'),
    },
    {
      icon: Layers,
      title: t('about.valueStructuredPaths'),
      description: t('about.valueStructuredDescription'),
    },
    {
      icon: UserCheck,
      title: t('about.valueQualifiedInstruction'),
      description: t('about.valueQualifiedDescription'),
    },
    {
      icon: FileCheck,
      title: t('about.valueHonestExpectations'),
      description: t('about.valueHonestDescription'),
    },
    {
      icon: Anchor,
      title: t('about.valueResponsibleAccess'),
      description: t('about.valueResponsibleDescription'),
    },
  ];

  return (
    <div className="pt-20">
      {/* Hero */}
      <div className="relative h-96 overflow-hidden">
        <img
          src="/static/about/about-hero.jpg"
          alt="About Us"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-primary-900/80 to-accent-900/80" />
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center text-white"
          >
            <Users className="w-16 h-16 mx-auto mb-6" />
            <h1 className="text-6xl font-bold mb-4">{t('about.heroTitle')} <span className="bg-gradient-to-r from-primary-300 to-accent-300 bg-clip-text text-transparent">{t('about.heroName')}</span></h1>
            <p className="text-2xl text-white/90">
              {t('about.heroSubtitle')}
            </p>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <Section background="white" className="!py-10 sm:!py-12 lg:!py-16">
        <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold mb-6">{t('about.ourStory')}</h2>
            <p className="text-lg text-gray-700 mb-4 leading-relaxed">
              {t('about.storyParagraph1')}
            </p>
            <p className="text-lg text-gray-700 mb-4 leading-relaxed">
              {t('about.storyParagraph2')}
            </p>
            <p className="text-lg text-gray-700 leading-relaxed">
              {t('about.storyParagraph3')}
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <img
              src="/static/about/about-team.jpg"
              alt={t('about.ourStory')}
              className="w-full h-96 object-cover rounded-2xl shadow-2xl"
            />
          </motion.div>
        </div>
      </Section>

      {/* Stats Section */}
      <Section background="gray" className="!py-10 sm:!py-12 lg:!py-16">
        <div className="relative">
          {/* Background with overlay */}
          <div className="absolute inset-0 rounded-3xl overflow-hidden bg-gradient-to-r from-primary-900 to-accent-900" />


          <div className="relative z-10 py-16 px-8">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
              {stats.map((stat, index) => {
                const icons = {
                  Award: Award,
                  Users: Users,
                  TrendingUp: TrendingUp,
                  MapPin: MapPin,
                };
                const Icon = icons[stat.icon as keyof typeof icons];

                // Parse the stat value to extract number and prefix/suffix
                const parseStatValue = (value: string) => {
                  const match = value.match(/^([+]?)(\d+)([%+]?)$/);
                  if (match) {
                    return {
                      prefix: match[1] || '',
                      number: parseInt(match[2]),
                      suffix: match[3] === '+' ? '' : match[3] || '',
                    };
                  }
                  return { prefix: '', number: 0, suffix: '' };
                };

                const { prefix, number, suffix } = parseStatValue(stat.value);

                return (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="text-center text-white"
                  >
                    <Icon className="w-10 h-10 mx-auto mb-4" />
                    <CountUp
                      end={number}
                      prefix={prefix}
                      suffix={suffix}
                      duration={2.5}
                      className="text-5xl font-bold mb-2"
                    />
                    <div className="text-lg opacity-90">{stat.label}</div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </Section>

      {/* Promise Section */}
      <Section background="white" className="!py-10 sm:!py-12 lg:!py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl font-bold mb-6">{t('about.promiseTitle')}</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            {t('about.promiseDescription')}
          </p>
        </motion.div>
      </Section>

      {/* Why Choose Us */}
      <Section background="gradient" className="!py-10 sm:!py-12 lg:!py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold mb-4">{t('about.whyChooseTitle')}</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {t('about.whyChooseDescription')}
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {values.map((value, index) => (
            <motion.div
              key={value.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="text-center h-full">
                <div className="bg-gradient-to-br from-primary-500 to-accent-500 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <value.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-3">{value.title}</h3>
                <p className="text-gray-600">{value.description}</p>
              </Card>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-12 text-center"
        >
          <Card className="max-w-3xl mx-auto">
            <p className="text-lg text-gray-700 leading-relaxed">
              {t('about.whyChooseClosing')}
            </p>
          </Card>
        </motion.div>
      </Section>

      {/* Team Section - only shown when team members exist */}
      {!teamLoading && !teamError && team.length > 0 && (
        <Section background="white" className="!py-10 sm:!py-12 lg:!py-16" id="team">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary-50 border border-primary-100 text-primary-700 rounded-full text-sm font-semibold mb-4">
              <div className="w-1.5 h-1.5 rounded-full bg-primary-500" />
              {t('about.teamTitle')}
            </span>
            <h2 className="text-4xl font-bold mb-4">{t('about.teamTitle')}</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              {t('about.teamSubtitle')}
            </p>
          </motion.div>

          <div className={`grid gap-8 ${team.length <= 2 ? 'sm:grid-cols-2 max-w-3xl mx-auto' : team.length === 3 ? 'sm:grid-cols-2 lg:grid-cols-3' : 'sm:grid-cols-2 lg:grid-cols-4'}`}>
            {team.map((member, index) => {
              const socialIcons: Record<string, React.FC<{ className?: string }>> = {
                instagram: Instagram,
                facebook: Facebook,
                linkedin: Linkedin,
                twitter: Twitter,
              };

              const imageUrl = (member as any).image_url;

              return (
                <motion.div
                  key={member.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  className="group"
                >
                  <div className="relative bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100">
                    {/* Image */}
                    <div className="relative aspect-[3/4] overflow-hidden">
                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt={member.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-primary-100 to-accent-100 flex items-center justify-center">
                          <Users className="w-16 h-16 text-primary-300" />
                        </div>
                      )}

                      {/* Gradient overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-gray-900/20 to-transparent" />

                      {/* Social links — appear on hover */}
                      {member.social_links && Object.values(member.social_links).some(v => v) && (
                        <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                          {Object.entries(member.social_links).map(([platform, url]) => {
                            if (!url) return null;
                            const Icon = socialIcons[platform];
                            if (!Icon) return null;
                            return (
                              <a
                                key={platform}
                                href={url as string}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 bg-white/90 backdrop-blur-sm hover:bg-white text-gray-700 hover:text-primary-600 rounded-lg shadow-sm transition-all hover:scale-110"
                              >
                                <Icon className="w-4 h-4" />
                              </a>
                            );
                          })}
                        </div>
                      )}

                      {/* Name & role on image */}
                      <div className="absolute bottom-0 left-0 right-0 p-5">
                        <h3 className="text-xl font-bold text-white mb-1">{member.name}</h3>
                        <p className="text-sm text-white/80 font-medium">{member.role}</p>
                      </div>
                    </div>

                    {/* Experience badge */}
                    {member.experience && (
                      <div className="px-5 py-3 border-t border-gray-100 flex items-center gap-2.5 bg-gray-50/50">
                        <div className="p-1 bg-primary-100 rounded-md">
                          <Clock className="w-3.5 h-3.5 text-primary-600" />
                        </div>
                        <span className="text-sm font-semibold text-gray-700">{member.experience}</span>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </Section>
      )}
    </div>
  );
};
