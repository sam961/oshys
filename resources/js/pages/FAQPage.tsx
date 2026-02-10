import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle, Search, ChevronDown, MessageCircle, Phone, Compass, Anchor, CreditCard, Shield, Package } from 'lucide-react';
import { Section } from '../components/ui';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

const categoryIcons: Record<string, React.ElementType> = {
  general: HelpCircle,
  courses: Compass,
  trips: Anchor,
  equipment: Package,
  booking: CreditCard,
  safety: Shield,
};

const categoryKeys = ['general', 'courses', 'trips', 'equipment', 'booking', 'safety'] as const;

interface FAQItemProps {
  question: string;
  answer: string;
  isOpen: boolean;
  onToggle: () => void;
  index: number;
}

const FAQItem: React.FC<FAQItemProps> = ({ question, answer, isOpen, onToggle, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.05 }}
    className="border border-gray-200 rounded-xl overflow-hidden bg-white hover:border-primary-300 transition-colors"
  >
    <button
      onClick={onToggle}
      className="w-full flex items-center justify-between px-6 py-5 text-start gap-4"
    >
      <span className="font-semibold text-gray-900 text-base">{question}</span>
      <motion.div
        animate={{ rotate: isOpen ? 180 : 0 }}
        transition={{ duration: 0.2 }}
        className="shrink-0"
      >
        <ChevronDown className="w-5 h-5 text-gray-400" />
      </motion.div>
    </button>
    <AnimatePresence initial={false}>
      {isOpen && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.25, ease: 'easeInOut' }}
        >
          <div className="px-6 pb-5 text-gray-600 leading-relaxed border-t border-gray-100 pt-4">
            {answer}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  </motion.div>
);

export const FAQPage: React.FC = () => {
  const { t } = useTranslation();
  const [activeCategory, setActiveCategory] = useState<string>('general');
  const [openItems, setOpenItems] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');

  const toggleItem = (key: string) => {
    setOpenItems(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  // Build all FAQ items for search
  const allItems = categoryKeys.flatMap(cat =>
    [1, 2, 3].map(i => ({
      category: cat,
      key: `${cat}-${i}`,
      question: t(`faq.${cat}.q${i}`),
      answer: t(`faq.${cat}.a${i}`),
    }))
  );

  const filteredItems = searchQuery.trim()
    ? allItems.filter(
        item =>
          item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.answer.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : allItems.filter(item => item.category === activeCategory);

  const isSearching = searchQuery.trim().length > 0;

  return (
    <div className="pt-20">
      {/* Hero */}
      <div className="relative h-96 overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1920&h=600&fit=crop"
          alt="FAQ"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-primary-900/80 to-accent-900/80" />
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center text-white px-4"
          >
            <HelpCircle className="w-16 h-16 mx-auto mb-6" />
            <h1 className="text-5xl md:text-6xl font-bold mb-4">{t('faq.heroTitle')}</h1>
            <p className="text-xl md:text-2xl text-white/90 max-w-2xl mx-auto">
              {t('faq.heroSubtitle')}
            </p>
          </motion.div>
        </div>
      </div>

      {/* Search Bar */}
      <Section background="white" className="!py-0 -mt-8 relative z-10">
        <div className="max-w-2xl mx-auto">
          <div className="relative">
            <Search className="absolute start-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('faq.searchPlaceholder')}
              className="w-full ps-12 pe-4 py-4 bg-white border border-gray-200 rounded-2xl shadow-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-base"
            />
          </div>
        </div>
      </Section>

      {/* Category Tabs + FAQ Items */}
      <Section background="gray">
        {/* Category Tabs */}
        {!isSearching && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex flex-wrap justify-center gap-3 mb-12"
          >
            {categoryKeys.map((cat) => {
              const Icon = categoryIcons[cat];
              const isActive = activeCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => { setActiveCategory(cat); setOpenItems(new Set()); }}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-medium text-sm transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-primary-600 to-accent-600 text-white shadow-md'
                      : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {t(`faq.categories.${cat}`)}
                </button>
              );
            })}
          </motion.div>
        )}

        {/* FAQ Items */}
        <div className="max-w-3xl mx-auto space-y-3">
          {filteredItems.length > 0 ? (
            filteredItems.map((item, idx) => (
              <FAQItem
                key={item.key}
                question={item.question}
                answer={item.answer}
                isOpen={openItems.has(item.key)}
                onToggle={() => toggleItem(item.key)}
                index={idx}
              />
            ))
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12 text-gray-500"
            >
              <Search className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p className="text-lg">{t('faq.noResults')}</p>
            </motion.div>
          )}
        </div>
      </Section>

      {/* Still Have Questions CTA */}
      <Section background="white">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-xl mx-auto"
        >
          <h2 className="text-3xl font-bold text-gray-900 mb-4">{t('faq.stillHaveQuestions')}</h2>
          <p className="text-gray-600 mb-8 text-lg">{t('faq.contactDescription')}</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/contact"
              className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-primary-600 to-accent-600 text-white rounded-xl font-semibold hover:shadow-lg transition-shadow"
            >
              <Phone className="w-5 h-5" />
              {t('faq.contactUs')}
            </Link>
            <a
              href="https://wa.me/966541000233"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-8 py-3 bg-green-500 text-white rounded-xl font-semibold hover:bg-green-600 transition-colors"
            >
              <MessageCircle className="w-5 h-5" />
              {t('faq.whatsappUs')}
            </a>
          </div>
        </motion.div>
      </Section>
    </div>
  );
};
