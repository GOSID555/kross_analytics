import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  MapPin,
  Building2,
  CalendarDays,
  Table2,
  ChevronsLeft,
  ChevronsRight,
  Upload,
} from 'lucide-react';
import type { SectionId } from '@/types';
import { translations, type Language } from '@/lib/translations';

interface SidebarProps {
  activeSection: SectionId;
  onNavigate: (section: SectionId) => void;
  onUploadNew: () => void;
  language: Language;
}

const NAV_ITEMS = [
  { id: 'overview' as SectionId, icon: LayoutDashboard, labelTh: 'ภาพรวม', labelEn: 'Overview' },
  { id: 'zone-compare' as SectionId, icon: MapPin, labelTh: 'เปรียบเทียบโซน', labelEn: 'Zone Compare' },
  { id: 'club-compare' as SectionId, icon: Building2, labelTh: 'เปรียบเทียบสนาม', labelEn: 'Club Compare' },
  { id: 'day-analysis' as SectionId, icon: CalendarDays, labelTh: 'วิเคราะห์ตามวัน', labelEn: 'Day Analysis' },
  { id: 'court-details' as SectionId, icon: Table2, labelTh: 'รายละเอียดคอร์ท', labelEn: 'Court Details' },
];

export function Sidebar({ activeSection, onNavigate, onUploadNew, language }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const t = translations[language].sidebar;

  const handleNavClick = useCallback(
    (id: SectionId) => {
      onNavigate(id);
    },
    [onNavigate]
  );

  const toggleCollapse = useCallback(() => {
    setCollapsed((prev) => !prev);
  }, []);

  return (
    <motion.aside
      className="fixed left-0 top-0 h-full z-30 flex flex-col border-r"
      style={{
        width: collapsed ? 64 : 240,
        background: '#111111',
        borderColor: '#2A2A2A',
      }}
      animate={{ width: collapsed ? 64 : 240 }}
      transition={{ duration: 0.25, ease: 'easeInOut' }}
    >
      {/* Header */}
      <div className="h-14 flex items-center gap-3 px-4 border-b" style={{ borderColor: '#2A2A2A' }}>
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: 'linear-gradient(135deg, #10B981, #059669)' }}
        >
          <span className="text-white text-sm font-bold">P</span>
        </div>
        {!collapsed && (
          <motion.div
            className="overflow-hidden"
            initial={false}
            animate={{ opacity: collapsed ? 0 : 1, width: collapsed ? 0 : 'auto' }}
            transition={{ duration: 0.2 }}
          >
            <h1 className="text-sm font-bold whitespace-nowrap" style={{ color: '#F5F5F5' }}>
              Padel Analytics
            </h1>
          </motion.div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const label = language === 'th' ? item.labelTh : item.labelEn;
          const isActive = activeSection === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-all duration-150 group"
              style={{
                background: isActive ? 'rgba(16, 185, 129, 0.1)' : 'transparent',
                color: isActive ? '#10B981' : '#A1A1AA',
              }}
              title={collapsed ? label : undefined}
            >
              <Icon className="w-5 h-5 flex-shrink-0" style={{ color: isActive ? '#10B981' : '#A1A1AA' }} />
              {!collapsed && (
                <motion.span
                  className="whitespace-nowrap font-medium"
                  initial={false}
                  animate={{ opacity: collapsed ? 0 : 1 }}
                  transition={{ duration: 0.2 }}
                >
                  {label}
                </motion.span>
              )}
              {isActive && !collapsed && (
                <motion.div
                  className="ml-auto w-1.5 h-1.5 rounded-full"
                  style={{ background: '#10B981' }}
                  layoutId="activeIndicator"
                />
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom actions */}
      <div className="px-3 py-4 border-t space-y-1" style={{ borderColor: '#2A2A2A' }}>
        <button
          onClick={onUploadNew}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-all duration-150"
          style={{ color: '#A1A1AA' }}
          title={collapsed ? t.uploadNew : undefined}
        >
          <Upload className="w-5 h-5 flex-shrink-0" />
          {!collapsed && <span className="whitespace-nowrap">{t.uploadNew}</span>}
        </button>
        <button
          onClick={toggleCollapse}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-all duration-150"
          style={{ color: '#71717A' }}
        >
          {collapsed ? (
            <>
              <ChevronsRight className="w-5 h-5 flex-shrink-0" />
            </>
          ) : (
            <>
              <ChevronsLeft className="w-5 h-5 flex-shrink-0" />
              <span className="whitespace-nowrap">{t.collapseSidebar}</span>
            </>
          )}
        </button>
      </div>
    </motion.aside>
  );
}
