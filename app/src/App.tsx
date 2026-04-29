import { useCallback, useRef, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { usePadelData } from '@/hooks/usePadelData';
import { useActiveSection } from '@/hooks/useActiveSection';
import { useCommandPalette } from '@/hooks/useCommandPalette';
import { UploadGate } from '@/sections/UploadGate';
import { Sidebar } from '@/sections/Sidebar';
import { TopBar } from '@/sections/TopBar';
import { KPICards } from '@/sections/KPICards';
import { OccupancyChart } from '@/sections/OccupancyChart';
import { ZoneComparison } from '@/sections/ZoneComparison';
import { ClubComparison } from '@/sections/ClubComparison';
import { DayAnalysis } from '@/sections/DayAnalysis';
import { CourtDetails } from '@/sections/CourtDetails';
import { CommandPalette } from '@/sections/CommandPalette';
import { translations, type Language } from '@/lib/translations';
import type { SectionId } from '@/types';

function App() {
  const {
    data,
    kpis,
    zoneStats,
    clubStats,
    dayStats,
    dateStats,
    filters,
    zones,
    clubs,
    isLoading,
    error,
    parseFile,
    setZoneFilter,
    setClubFilter,
    clearFilters,
  } = usePadelData();

  const [language, setLanguage] = useState<Language>('en');
  const activeSection = useActiveSection();
  const { open: paletteOpen, toggle: paletteToggle, close: paletteClose } = useCommandPalette();
  const mainRef = useRef<HTMLDivElement>(null);
  const t = translations[language];

  const handleNavigate = useCallback(
    (section: SectionId) => {
      const el = document.getElementById(section);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    },
    []
  );

  const handleUploadNew = useCallback(() => {
    window.location.reload();
  }, []);

  const hasData = data.length > 0;

  return (
    <div className="min-h-screen" style={{ background: '#0A0A0A' }}>
      <AnimatePresence>
        {!hasData && (
          <UploadGate onFileParsed={parseFile} isLoading={isLoading} error={error} language={language} />
        )}
      </AnimatePresence>

      {hasData && (
        <>
          <Sidebar
            activeSection={activeSection}
            onNavigate={handleNavigate}
            onUploadNew={handleUploadNew}
            language={language}
          />
          <TopBar
            zones={zones}
            clubs={clubs}
            filters={filters}
            onZoneChange={setZoneFilter}
            onClubChange={setClubFilter}
            onClearFilters={clearFilters}
            onSearchClick={paletteToggle}
            onRefresh={handleUploadNew}
            onLanguageToggle={() => setLanguage((prev) => (prev === 'th' ? 'en' : 'th'))}
            language={language}
            sidebarCollapsed={false}
          />
          <main
            ref={mainRef}
            className="pt-14 min-h-screen overflow-y-auto"
            style={{ marginLeft: 240, padding: '72px 32px 32px' }}
          >
            <KPICards kpis={kpis} />
            <OccupancyChart data={dateStats} />
            <ZoneComparison data={zoneStats} />
            <ClubComparison data={clubStats} />
            <DayAnalysis data={dayStats} />
            <CourtDetails data={data} />

            {/* Footer */}
            <footer className="mt-12 pt-6 border-t text-center" style={{ borderColor: '#2A2A2A' }}>
              <p className="text-xs" style={{ color: '#71717A' }}>
                {t.footer.text}
              </p>
            </footer>
          </main>
        </>
      )}

      <CommandPalette
        open={paletteOpen}
        onClose={paletteClose}
        onNavigate={handleNavigate}
        onFilterZone={setZoneFilter}
        onFilterClub={setClubFilter}
        zones={zoneStats}
        clubs={clubStats}
        language={language}
      />
    </div>
  );
}

export default App;
