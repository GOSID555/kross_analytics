import { Search, RefreshCw, X } from 'lucide-react';
import type { FilterState } from '@/types';
import { translations, type Language } from '@/lib/translations';

interface TopBarProps {
  zones: string[];
  clubs: string[];
  filters: FilterState;
  onZoneChange: (zone: string | null) => void;
  onClubChange: (club: string | null) => void;
  onClearFilters: () => void;
  onSearchClick: () => void;
  onRefresh: () => void;
  onLanguageToggle: () => void;
  language: Language;
  sidebarCollapsed: boolean;
}

export function TopBar({
  zones,
  clubs,
  filters,
  onZoneChange,
  onClubChange,
  onClearFilters,
  onSearchClick,
  onRefresh,
  onLanguageToggle,
  language,
  sidebarCollapsed,
}: TopBarProps) {
  const hasFilters = filters.zone || filters.club;
  const t = translations[language].topBar;

  return (
    <header
      className="fixed top-0 right-0 h-14 z-40 flex items-center justify-between border-b px-6"
      style={{
        left: sidebarCollapsed ? 64 : 240,
        background: '#111111',
        borderColor: '#2A2A2A',
        transition: 'left 0.25s ease-in-out',
      }}
    >
      {/* Left: Breadcrumb + filter pills */}
      <div className="flex items-center gap-3">
        <span className="text-sm" style={{ color: '#A1A1AA' }}>
          {t.dashboard}
        </span>
        {hasFilters && (
          <>
            <span style={{ color: '#3A3A3A' }}>/</span>
            <div className="flex items-center gap-2">
              {filters.zone && (
                <span
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium"
                  style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10B981' }}
                >
                  {filters.zone}
                  <button onClick={() => onZoneChange(null)} className="hover:opacity-70">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {filters.club && (
                <span
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium"
                  style={{ background: 'rgba(6, 182, 212, 0.1)', color: '#06B6D4' }}
                >
                  {filters.club}
                  <button onClick={() => onClubChange(null)} className="hover:opacity-70">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              <button
                onClick={onClearFilters}
                className="text-xs hover:opacity-70 transition-opacity"
                style={{ color: '#71717A' }}
              >
                {t.clearFilters}
              </button>
            </div>
          </>
        )}
      </div>

      {/* Right: Filters + Actions */}
      <div className="flex items-center gap-3">
        {/* Zone filter */}
        <select
          value={filters.zone || ''}
          onChange={(e) => onZoneChange(e.target.value || null)}
          className="text-sm rounded-md px-3 py-1.5 border outline-none focus:ring-1 focus:ring-[#10B981]"
          style={{
            background: '#1C1C1C',
            borderColor: '#2A2A2A',
            color: '#F5F5F5',
          }}
        >
          <option value="">{t.allZones}</option>
          {zones.map((z) => (
            <option key={z} value={z}>
              {z}
            </option>
          ))}
        </select>

        {/* Club filter */}
        <select
          value={filters.club || ''}
          onChange={(e) => onClubChange(e.target.value || null)}
          className="text-sm rounded-md px-3 py-1.5 border outline-none focus:ring-1 focus:ring-[#10B981]"
          style={{
            background: '#1C1C1C',
            borderColor: '#2A2A2A',
            color: '#F5F5F5',
          }}
        >
          <option value="">{t.allClubs}</option>
          {clubs.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        {/* Search button */}
        <button
          onClick={onSearchClick}
          className="flex items-center gap-2 px-3 py-1.5 rounded-md text-sm border transition-colors hover:border-[#3A3A3A]"
          style={{ background: '#1C1C1C', borderColor: '#2A2A2A', color: '#A1A1AA' }}
        >
          <Search className="w-4 h-4" />
          <span className="hidden md:inline">{t.search}</span>
          <kbd
            className="hidden lg:inline-block px-1.5 py-0.5 rounded text-xs"
            style={{ background: '#2A2A2A', color: '#71717A' }}
          >
            Ctrl K
          </kbd>
        </button>

        <button
          onClick={onLanguageToggle}
          className="px-3 py-1.5 rounded-md border transition-colors hover:border-[#3A3A3A]"
          style={{ background: '#1C1C1C', borderColor: '#2A2A2A', color: '#A1A1AA' }}
          title={t.switchLanguage}
        >
          {t.languageButton}
        </button>

        {/* Refresh */}
        <button
          onClick={onRefresh}
          className="p-1.5 rounded-md border transition-colors hover:border-[#3A3A3A]"
          style={{ background: '#1C1C1C', borderColor: '#2A2A2A', color: '#A1A1AA' }}
          title={t.refreshTitle}
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}
