import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MapPin, Building2, TrendingUp } from 'lucide-react';
import type { SectionId, ClubStats, ZoneStats } from '@/types';
import { translations, type Language } from '@/lib/translations';

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
  onNavigate: (section: SectionId) => void;
  onFilterZone: (zone: string) => void;
  onFilterClub: (club: string) => void;
  zones: ZoneStats[];
  clubs: ClubStats[];
  language: Language;
}

interface CommandItem {
  id: string;
  icon: React.ElementType;
  label: string;
  subtitle?: string;
  color: string;
  action: () => void;
  section: string;
}

export function CommandPalette({
  open,
  onClose,
  onNavigate,
  onFilterZone,
  onFilterClub,
  zones,
  clubs,
  language,
}: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const t = translations[language].commandPalette;

  useEffect(() => {
    if (open) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  const items = useMemo(() => {
    const result: CommandItem[] = [];
    const q = query.toLowerCase();

    // Navigation section
    const navItems: Array<{ id: SectionId; label: string; icon: React.ElementType; color: string }> = [
      { id: 'overview', label: t.nav.overview, icon: Search, color: '#10B981' },
      { id: 'zone-compare', label: t.nav.zoneCompare, icon: MapPin, color: '#F59E0B' },
      { id: 'club-compare', label: t.nav.clubCompare, icon: Building2, color: '#06B6D4' },
      { id: 'day-analysis', label: t.nav.dayAnalysis, icon: TrendingUp, color: '#8B5CF6' },
      { id: 'court-details', label: t.nav.courtDetails, icon: Search, color: '#EC4899' },
    ];

    navItems.forEach((item) => {
      if (!q || item.label.toLowerCase().includes(q)) {
        result.push({
          id: `nav-${item.id}`,
          icon: item.icon,
          label: item.label,
          color: item.color,
          action: () => { onNavigate(item.id); onClose(); },
          section: t.sectionNavigation,
        });
      }
    });

    // Zones section
    zones.forEach((zone) => {
      if (!q || zone.zone.toLowerCase().includes(q)) {
        result.push({
          id: `zone-${zone.zone}`,
          icon: MapPin,
          label: zone.zone,
          subtitle: `${t.occupancyLabel} ${zone.overallOccupancy}%`,
          color: '#10B981',
          action: () => { onFilterZone(zone.zone); onClose(); },
          section: t.sectionZones,
        });
      }
    });

    // Popular clubs section (top 10)
    const topClubs = [...clubs].sort((a, b) => b.overallOccupancy - a.overallOccupancy).slice(0, 10);
    topClubs.forEach((club) => {
      if (!q || club.club.toLowerCase().includes(q) || club.zone.toLowerCase().includes(q)) {
        result.push({
          id: `club-${club.club}`,
          icon: Building2,
          label: club.club,
          subtitle: t.clubSectionSubtitle(club.zone, club.overallOccupancy),
          color: '#F59E0B',
          action: () => { onFilterClub(club.club); onClose(); },
          section: t.sectionClubs,
        });
      }
    });

    return result;
  }, [query, zones, clubs, onNavigate, onFilterZone, onFilterClub, onClose, t]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((i) => Math.min(items.length - 1, i + 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((i) => Math.max(0, i - 1));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (items[selectedIndex]) {
          items[selectedIndex].action();
        }
      } else if (e.key === 'Escape') {
        onClose();
      }
    },
    [items, selectedIndex, onClose]
  );

  // Group by section
  const grouped = useMemo(() => {
    const groups = new Map<string, CommandItem[]>();
    items.forEach((item) => {
      const arr = groups.get(item.section) || [];
      arr.push(item);
      groups.set(item.section, arr);
    });
    return groups;
  }, [items]);

  let globalIndex = 0;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          onClick={onClose}
        >
          {/* Backdrop */}
          <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }} />

          {/* Container */}
          <motion.div
            className="relative w-full max-w-[640px] mx-4 rounded-xl border shadow-2xl overflow-hidden"
            style={{ background: '#141414', borderColor: '#2A2A2A' }}
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            onClick={(e) => e.stopPropagation()}
            onKeyDown={handleKeyDown}
          >
            {/* Search input */}
            <div className="flex items-center gap-3 px-4 border-b" style={{ borderColor: '#2A2A2A' }}>
              <Search className="w-5 h-5 flex-shrink-0" style={{ color: '#71717A' }} />
              <input
                ref={inputRef}
                type="text"
                placeholder={t.searchPlaceholder}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="flex-1 py-4 text-sm outline-none bg-transparent"
                style={{ color: '#F5F5F5' }}
              />
              <kbd
                className="px-2 py-1 rounded text-xs flex-shrink-0"
                style={{ background: '#2A2A2A', color: '#71717A' }}
              >
                ESC
              </kbd>
            </div>

            {/* Results */}
            <div className="max-h-[50vh] overflow-y-auto py-2">
              {items.length === 0 ? (
                <div className="py-8 text-center">
                  <p className="text-sm" style={{ color: '#71717A' }}>{t.noResults}</p>
                </div>
              ) : (
                Array.from(grouped.entries()).map(([section, sectionItems]) => (
                  <div key={section}>
                    <div className="px-4 py-2 text-xs font-medium" style={{ color: '#71717A' }}>
                      {section}
                    </div>
                    {sectionItems.map((item) => {
                      const Icon = item.icon;
                      const idx = globalIndex++;
                      const isSelected = idx === selectedIndex;
                      return (
                        <button
                          key={item.id}
                          onClick={item.action}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors"
                          style={{
                            background: isSelected ? 'rgba(16, 185, 129, 0.08)' : 'transparent',
                          }}
                          onMouseEnter={() => setSelectedIndex(idx)}
                        >
                          <div
                            className="w-8 h-8 rounded-md flex items-center justify-center flex-shrink-0"
                            style={{ background: `${item.color}15` }}
                          >
                            <Icon className="w-4 h-4" style={{ color: item.color }} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate" style={{ color: '#F5F5F5' }}>
                              {item.label}
                            </p>
                            {item.subtitle && (
                              <p className="text-xs truncate" style={{ color: '#71717A' }}>
                                {item.subtitle}
                              </p>
                            )}
                          </div>
                          {isSelected && (
                            <motion.div
                              className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                              style={{ background: '#10B981' }}
                              layoutId="cmdIndicator"
                            />
                          )}
                        </button>
                      );
                    })}
                  </div>
                ))
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
