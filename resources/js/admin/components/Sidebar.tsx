import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  LayoutDashboard,
  Package,
  GraduationCap,
  Compass,
  BookOpen,
  Calendar,
  Users,
  Image,
  Settings,
  Waves,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

interface SidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, setIsCollapsed }) => {
  const { t, i18n } = useTranslation('admin');
  const location = useLocation();
  const isRTL = i18n.language === 'ar';

  const menuItems = [
    { icon: LayoutDashboard, label: t('sidebar.dashboard'), path: '/admin' },
    { icon: Package, label: t('sidebar.products'), path: '/admin/products' },
    { icon: GraduationCap, label: t('sidebar.courses'), path: '/admin/courses' },
    { icon: Compass, label: t('sidebar.trips'), path: '/admin/trips' },
    { icon: BookOpen, label: t('sidebar.blog'), path: '/admin/blog' },
    { icon: Calendar, label: t('sidebar.events'), path: '/admin/events' },
    { icon: Users, label: t('sidebar.team'), path: '/admin/team' },
    { icon: Image, label: t('sidebar.banners'), path: '/admin/banners' },
    { icon: Settings, label: t('sidebar.settings'), path: '/admin/settings' },
  ];

  return (
    <motion.div
      animate={{ width: isCollapsed ? 80 : 280 }}
      className={`bg-gradient-to-b from-gray-900 to-gray-800 text-white h-screen fixed top-0 overflow-hidden shadow-2xl z-50 ${
        isRTL ? 'right-0' : 'left-0'
      }`}
      style={{
        left: isRTL ? 'auto' : 0,
        right: isRTL ? 0 : 'auto',
      }}
    >
      {/* Header */}
      <div className="p-6 border-b border-gray-700 flex items-center justify-between">
        {!isCollapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-3"
          >
            <div className="bg-gradient-to-br from-primary-600 to-accent-600 p-2 rounded-lg">
              <Waves className="w-6 h-6" />
            </div>
            <div>
              <div className="font-bold text-lg">Coral & Shells</div>
              <div className="text-xs text-gray-400">Admin Panel</div>
            </div>
          </motion.div>
        )}
        {isCollapsed && (
          <div className="bg-gradient-to-br from-primary-600 to-accent-600 p-2 rounded-lg mx-auto">
            <Waves className="w-6 h-6" />
          </div>
        )}
      </div>

      {/* Toggle Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className={`absolute top-24 bg-gray-800 text-white p-1.5 rounded-full shadow-lg hover:bg-gray-700 transition-colors border border-gray-700 ${
          isRTL ? '-left-3' : '-right-3'
        }`}
        style={{
          left: isRTL ? '-12px' : 'auto',
          right: isRTL ? 'auto' : '-12px',
        }}
      >
        {isCollapsed ? (
          isRTL ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />
        ) : (
          isRTL ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />
        )}
      </button>

      {/* Menu Items */}
      <nav className="p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <Link key={item.path} to={item.path}>
              <motion.div
                whileHover={{ x: 4 }}
                className={`flex items-center gap-4 px-4 py-3 rounded-lg transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-primary-600 to-accent-600 text-white shadow-lg'
                    : 'text-gray-300 hover:bg-gray-700'
                }`}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {!isCollapsed && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="font-medium"
                  >
                    {item.label}
                  </motion.span>
                )}
              </motion.div>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      {!isCollapsed && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-700"
        >
          <div className="text-xs text-gray-400 text-center">
            Version 1.0.0
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};
