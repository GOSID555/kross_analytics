import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  Legend,
} from 'recharts';
import { Search, ChevronDown } from 'lucide-react';
import type { ClubStats } from '@/types';
import { getOccupancyColor } from '@/lib/dataProcessor';

interface ClubComparisonProps {
  data: ClubStats[];
}

type SortMode = 'occupancy-desc' | 'occupancy-asc' | 'name-asc';
type ViewMode = 'combined' | 'split';

function CustomTooltip({
  active,
  payload,
  viewMode,
}: {
  active?: boolean;
  payload?: Array<{ payload: ClubStats }>;
  viewMode: ViewMode;
}) {
  if (!active || !payload || !payload.length) return null;
  const d = payload[0].payload;

  return (
    <div
      className="rounded-lg border p-3 shadow-xl"
      style={{ background: '#141414', borderColor: '#2A2A2A' }}
    >
      <p className="text-xs mb-1" style={{ color: '#71717A' }}>
        {d.zone}
      </p>
      <p className="text-sm font-semibold mb-2" style={{ color: '#F5F5F5' }}>
        {d.club}
      </p>
      <div className="space-y-1 text-xs">
        <div className="flex justify-between gap-4">
          <span style={{ color: '#A1A1AA' }}>Overall occupancy:</span>
          <span className="font-medium" style={{ color: '#10B981' }}>{d.overallOccupancy}%</span>
        </div>
        {viewMode === 'split' && (
          <>
            <div className="flex justify-between gap-4">
              <span style={{ color: '#A1A1AA' }}>Peak:</span>
              <span className="font-medium" style={{ color: '#F59E0B' }}>{d.peakOccupancy}%</span>
            </div>
            <div className="flex justify-between gap-4">
              <span style={{ color: '#A1A1AA' }}>Off-Peak:</span>
              <span className="font-medium" style={{ color: '#06B6D4' }}>{d.offpeakOccupancy}%</span>
            </div>
          </>
        )}
        <div className="flex justify-between gap-4">
          <span style={{ color: '#A1A1AA' }}>Courts:</span>
          <span className="font-medium" style={{ color: '#F5F5F5' }}>{d.totalCourts}</span>
        </div>
      </div>
    </div>
  );
}

export function ClubComparison({ data }: ClubComparisonProps) {
  const [search, setSearch] = useState('');
  const [sortMode, setSortMode] = useState<SortMode>('occupancy-desc');
  const [viewMode, setViewMode] = useState<ViewMode>('combined');
  const [showAll, setShowAll] = useState(false);

  const filtered = useMemo(() => {
    let result = data.filter((c) => c.club.toLowerCase().includes(search.toLowerCase()));
    if (sortMode === 'occupancy-desc') result = result.sort((a, b) => b.overallOccupancy - a.overallOccupancy);
    else if (sortMode === 'occupancy-asc') result = result.sort((a, b) => a.overallOccupancy - b.overallOccupancy);
    else if (sortMode === 'name-asc') result = result.sort((a, b) => a.club.localeCompare(b.club));
    return result;
  }, [data, search, sortMode]);

  const displayData = showAll ? filtered : filtered.slice(0, 10);

  return (
    <motion.div
      id="club-compare"
      className="rounded-lg border p-6 mb-8"
      style={{ background: '#141414', borderColor: '#2A2A2A' }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.6 }}
    >
      {/* Header with controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-lg font-semibold" style={{ color: '#F5F5F5' }}>
            Club occupancy comparison
          </h2>
          <p className="text-sm mt-0.5" style={{ color: '#A1A1AA' }}>
            {filtered.length} clubs
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#71717A' }} />
            <input
              type="text"
              placeholder="Search clubs..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-3 py-1.5 rounded-md text-sm border outline-none focus:ring-1 w-48"
              style={{
                background: '#1C1C1C',
                borderColor: '#2A2A2A',
                color: '#F5F5F5',
              }}
            />
          </div>
          {/* Sort */}
          <select
            value={sortMode}
            onChange={(e) => setSortMode(e.target.value as SortMode)}
            className="px-3 py-1.5 rounded-md text-sm border outline-none"
            style={{ background: '#1C1C1C', borderColor: '#2A2A2A', color: '#F5F5F5' }}
          >
            <option value="occupancy-desc">Occupancy high → low</option>
            <option value="occupancy-asc">Occupancy low → high</option>
            <option value="name-asc">Name A-Z</option>
          </select>
          {/* View toggle */}
          <div className="flex rounded-md overflow-hidden border" style={{ borderColor: '#2A2A2A' }}>
            <button
              onClick={() => setViewMode('combined')}
              className="px-3 py-1.5 text-xs transition-colors"
              style={{
                background: viewMode === 'combined' ? '#10B981' : '#1C1C1C',
                color: viewMode === 'combined' ? '#0A0A0A' : '#A1A1AA',
              }}
            >
              Combined
            </button>
            <button
              onClick={() => setViewMode('split')}
              className="px-3 py-1.5 text-xs transition-colors"
              style={{
                background: viewMode === 'split' ? '#10B981' : '#1C1C1C',
                color: viewMode === 'split' ? '#0A0A0A' : '#A1A1AA',
              }}
            >
              Split Peak/Off-Peak
            </button>
          </div>
        </div>
      </div>

      {displayData.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12">
          <p className="text-sm" style={{ color: '#71717A' }}>No clubs match your search</p>
        </div>
      ) : (
        <>
          <div className="w-full" style={{ height: Math.max(300, displayData.length * 48) }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={displayData}
                layout="vertical"
                margin={{ top: 5, right: 60, left: 10, bottom: 5 }}
                barSize={viewMode === 'split' ? 16 : 22}
                barGap={2}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2A" opacity={0.5} horizontal={false} />
                <XAxis
                  type="number"
                  domain={[0, 100]}
                  tick={{ fill: '#71717A', fontSize: 12 }}
                  axisLine={{ stroke: '#2A2A2A' }}
                  tickLine={false}
                  tickFormatter={(v: number) => `${v}%`}
                />
                <YAxis
                  type="category"
                  dataKey="club"
                  tick={{ fill: '#F5F5F5', fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                  width={160}
                />
                <Tooltip content={<CustomTooltip viewMode={viewMode} />} cursor={{ fill: 'rgba(255,255,255,0.02)' }} />
                {viewMode === 'split' && (
                  <Legend
                    wrapperStyle={{ fontSize: 12, color: '#A1A1AA' }}
                    iconType="circle"
                    iconSize={8}
                  />
                )}
                {viewMode === 'combined' ? (
                  <Bar dataKey="overallOccupancy" name="Occupancy" radius={[0, 4, 4, 0]}>
                    {displayData.map((entry, i) => (
                      <Cell key={i} fill={getOccupancyColor(entry.overallOccupancy)} />
                    ))}
                  </Bar>
                ) : (
                  <>
                    <Bar dataKey="peakOccupancy" name="Peak" fill="#F59E0B" radius={[0, 4, 4, 0]} />
                    <Bar dataKey="offpeakOccupancy" name="Off-Peak" fill="#06B6D4" radius={[0, 4, 4, 0]} />
                  </>
                )}
              </BarChart>
            </ResponsiveContainer>
          </div>
          {filtered.length > 10 && !showAll && (
            <div className="text-center mt-4">
              <button
                onClick={() => setShowAll(true)}
                className="inline-flex items-center gap-1 px-4 py-2 rounded-md text-sm transition-colors hover:opacity-80"
                style={{ background: '#1C1C1C', color: '#A1A1AA', border: '1px solid #2A2A2A' }}
              >
                Show all ({filtered.length})
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>
          )}
        </>
      )}
    </motion.div>
  );
}
