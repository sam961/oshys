import React from 'react';
import { motion } from 'framer-motion';
import { Award, Users, TrendingUp, MapPin, Shield, Heart, Target, Zap, Loader2 } from 'lucide-react';
import { Section, Card } from '../components/ui';
import { stats } from '../data/mockData';
import { useGetTeamMembersQuery } from '../services/api';
import type { TeamMember } from '../types';
import { useTranslation } from 'react-i18next';

export const AboutPage: React.FC = () => {
  const { t } = useTranslation();

  // Fetch team members from API
  const { data: team = [], isLoading: teamLoading, error: teamError } = useGetTeamMembersQuery({ active: true });

  const values = [
    {
      icon: Shield,
      title: t('about.valueSafetyFirst'),
      description: t('about.valueSafetyDescription'),
    },
    {
      icon: Heart,
      title: t('about.valuePassionateTeam'),
      description: t('about.valuePassionateDescription'),
    },
    {
      icon: Target,
      title: t('about.valueGoalOriented'),
      description: t('about.valueGoalDescription'),
    },
    {
      icon: Zap,
      title: t('about.valueInnovativeTraining'),
      description: t('about.valueInnovativeDescription'),
    },
  ];

  return (
    <div className="pt-20">
      {/* Hero Section */}
      <Section background="gradient" className="text-center relative overflow-hidden !py-12 sm:!py-16 lg:!py-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto relative z-10"
        >
          <h1 className="text-5xl lg:text-7xl font-bold mb-6">
            {t('about.heroTitle')} <span className="bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
              {t('about.heroName')}
            </span>
          </h1>
          <p className="text-2xl text-gray-700 mb-4">
            {t('about.heroSubtitle')}
          </p>
        </motion.div>
      </Section>

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
              src="https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=900&h=700&fit=crop"
              alt="Diving team"
              className="rounded-2xl shadow-2xl"
            />
          </motion.div>
        </div>
      </Section>

      {/* Stats Section */}
      <Section background="gray" className="!py-10 sm:!py-12 lg:!py-16">
        <div className="relative">
          {/* Background image with overlay */}
          <div className="absolute inset-0 rounded-3xl overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1400&h=600&fit=crop"
              alt="Underwater"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-primary-900/95 to-accent-900/95" />
          </div>

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
                    <div className="text-5xl font-bold mb-2">{stat.value}</div>
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

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
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

      {/* Team Section */}
      <Section background="white" className="!py-10 sm:!py-12 lg:!py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold mb-4">{t('about.teamTitle')}</h2>
          <p className="text-xl text-gray-600">
            {t('about.teamSubtitle')}
          </p>
        </motion.div>

        {teamLoading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="w-12 h-12 animate-spin text-primary-600" />
          </div>
        ) : teamError ? (
          <div className="text-center py-12">
            <p className="text-red-600">{t('about.teamLoadingError')}</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, index) => (
              <motion.div
                key={member.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="text-center group hover:shadow-2xl transition-shadow">
                  <div className="relative mb-6">
                    <div className="w-32 h-32 mx-auto rounded-full overflow-hidden ring-4 ring-primary-100 group-hover:ring-primary-300 transition-all">
                      <img
                        src={member.image || 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=200&h=200&fit=crop'}
                        alt={member.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    {member.experience && (
                      <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-primary-600 text-white px-4 py-1 rounded-full text-sm font-semibold whitespace-nowrap">
                        {member.experience}
                      </div>
                    )}
                  </div>
                  <h3 className="text-xl font-bold mb-2">{member.name}</h3>
                  <p className="text-sm text-gray-600 mb-4">{member.role}</p>
                  {member.certifications && member.certifications.length > 0 && (
                    <div className="flex flex-wrap gap-2 justify-center">
                      {member.certifications.map((cert, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 bg-accent-100 text-accent-700 rounded-full text-xs font-medium"
                        >
                          {cert}
                        </span>
                      ))}
                    </div>
                  )}
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </Section>
    </div>
  );
};
