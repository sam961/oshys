import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
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
  Heart,
  ChevronDown,
  ShoppingBag,
  Megaphone,
  Cog,
  Home,
  Link as LinkIcon,
  ClipboardList,
  Tag,
} from 'lucide-react';

interface SidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
}

interface MenuGroup {
  title: string;
  icon: React.ElementType;
  items: MenuItem[];
}

interface MenuItem {
  icon: React.ElementType;
  label: string;
  path: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, setIsCollapsed }) => {
  const { t, i18n } = useTranslation('admin');
  const location = useLocation();
  const isRTL = i18n.language === 'ar';
  const [expandedGroups, setExpandedGroups] = useState<string[]>(['shop', 'content']);

  const toggleGroup = (groupTitle: string) => {
    setExpandedGroups(prev =>
      prev.includes(groupTitle)
        ? prev.filter(g => g !== groupTitle)
        : [...prev, groupTitle]
    );
  };

  // Standalone items (no group)
  const standaloneItems: MenuItem[] = [
    { icon: LayoutDashboard, label: t('sidebar.dashboard'), path: '/admin' },
  ];

  // Grouped menu items
  const menuGroups: MenuGroup[] = [
    {
      title: 'shop',
      icon: ShoppingBag,
      items: [
        { icon: ClipboardList, label: 'Bookings', path: '/admin/bookings' },
        { icon: Package, label: t('sidebar.products'), path: '/admin/products' },
        { icon: GraduationCap, label: t('sidebar.courses'), path: '/admin/courses' },
        { icon: Compass, label: t('sidebar.trips'), path: '/admin/trips' },
      ],
    },
    {
      title: 'content',
      icon: Megaphone,
      items: [
        { icon: BookOpen, label: t('sidebar.blog'), path: '/admin/blog' },
        { icon: Calendar, label: t('sidebar.events'), path: '/admin/events' },
        { icon: Heart, label: 'Initiatives', path: '/admin/initiatives' },
        { icon: Image, label: t('sidebar.banners'), path: '/admin/banners' },
        { icon: Users, label: t('sidebar.team'), path: '/admin/team' },
      ],
    },
    {
      title: 'settings',
      icon: Cog,
      items: [
        { icon: Tag, label: 'Categories', path: '/admin/categories' },
        { icon: LinkIcon, label: 'Footer Links', path: '/admin/footer-links' },
        { icon: Settings, label: t('sidebar.settings'), path: '/admin/settings' },
      ],
    },
  ];

  const groupLabels: Record<string, string> = {
    shop: 'Shop',
    content: 'Content',
    settings: 'Settings',
  };

  const isGroupActive = (group: MenuGroup) => {
    return group.items.some(item => location.pathname === item.path);
  };

  const renderMenuItem = (item: MenuItem, isNested: boolean = false) => {
    const Icon = item.icon;
    const isActive = location.pathname === item.path;

    return (
      <Link key={item.path} to={item.path}>
        <motion.div
          whileHover={{ x: isRTL ? -4 : 4 }}
          className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all ${
            isNested && !isCollapsed ? 'ml-4' : ''
          } ${
            isActive
              ? 'bg-gradient-to-r from-primary-600 to-accent-600 text-white shadow-lg'
              : 'text-gray-300 hover:bg-gray-700/50'
          }`}
        >
          <Icon className={`w-5 h-5 shrink-0 ${isActive ? '' : 'text-gray-400'}`} />
          {!isCollapsed && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={`font-medium text-sm ${isNested ? '' : ''}`}
            >
              {item.label}
            </motion.span>
          )}
        </motion.div>
      </Link>
    );
  };

  return (
    <motion.div
      animate={{ width: isCollapsed ? 80 : 280 }}
      className={`bg-gradient-to-b from-gray-900 via-gray-900 to-gray-800 text-white h-screen fixed top-0 overflow-hidden shadow-2xl z-50 flex flex-col ${
        isRTL ? 'right-0' : 'left-0'
      }`}
      style={{
        left: isRTL ? 'auto' : 0,
        right: isRTL ? 0 : 'auto',
      }}
    >
      {/* Header */}
      <div className="p-5 border-b border-gray-700/50 flex items-center justify-between">
        {!isCollapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-3"
          >
            <div className="bg-gradient-to-br from-primary-600 to-accent-600 p-2.5 rounded-xl shadow-lg">
              <Waves className="w-6 h-6" />
            </div>
            <div>
              <div className="font-bold text-lg">Coral & Shells</div>
              <div className="text-xs text-gray-400">Admin Panel</div>
            </div>
          </motion.div>
        )}
        {isCollapsed && (
          <div className="bg-gradient-to-br from-primary-600 to-accent-600 p-2.5 rounded-xl shadow-lg mx-auto">
            <Waves className="w-6 h-6" />
          </div>
        )}
      </div>

      {/* Toggle Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className={`absolute top-20 bg-gray-800 text-white p-1.5 rounded-full shadow-lg hover:bg-gray-700 transition-colors border border-gray-600 z-10 ${
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
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1 scrollbar-hide">
        {/* Standalone Items */}
        {standaloneItems.map(item => renderMenuItem(item))}

        {/* Grouped Items */}
        {menuGroups.map((group) => {
          const GroupIcon = group.icon;
          const isExpanded = expandedGroups.includes(group.title);
          const hasActiveItem = isGroupActive(group);

          return (
            <div key={group.title} className="pt-3">
              {/* Group Header */}
              {!isCollapsed ? (
                <button
                  onClick={() => toggleGroup(group.title)}
                  className={`w-full flex items-center justify-between px-4 py-2 rounded-lg transition-all ${
                    hasActiveItem
                      ? 'text-primary-400'
                      : 'text-gray-400 hover:text-gray-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <GroupIcon className="w-4 h-4" />
                    <span className="text-xs font-semibold uppercase tracking-wider">
                      {groupLabels[group.title]}
                    </span>
                  </div>
                  <motion.div
                    animate={{ rotate: isExpanded ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </motion.div>
                </button>
              ) : (
                <div className="flex justify-center py-2">
                  <div className={`w-8 h-0.5 rounded-full ${hasActiveItem ? 'bg-primary-500' : 'bg-gray-700'}`} />
                </div>
              )}

              {/* Group Items */}
              <AnimatePresence initial={false}>
                {(isExpanded || isCollapsed) && (
                  <motion.div
                    initial={isCollapsed ? false : { height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className={`space-y-1 ${!isCollapsed ? 'mt-1' : ''}`}>
                      {group.items.map(item => renderMenuItem(item, !isCollapsed))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </nav>

      {/* Back to Site Button */}
      <div className="p-3 border-t border-gray-700/50">
        <Link to="/">
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg bg-gray-800/50 hover:bg-gray-700/50 transition-all ${
              isCollapsed ? 'justify-center' : ''
            }`}
          >
            <Home className="w-5 h-5 text-gray-400" />
            {!isCollapsed && (
              <span className="text-sm text-gray-300">Back to Site</span>
            )}
          </motion.div>
        </Link>
      </div>

      {/* Footer */}
      {!isCollapsed && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="p-3 border-t border-gray-700/50"
        >
          <div className="text-xs text-gray-500 text-center">
            Coral & Shells CMS v1.0.0
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};
