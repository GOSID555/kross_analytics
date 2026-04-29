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
} from 'recharts';
import type { ZoneStats } from '@/types';
import { getOccupancyColor } from '@/lib/dataProcessor';

interface ZoneComparisonProps {
  data: ZoneStats[];
}

function CustomTooltip({ active, payload }: { active?: boolean; payload?: Array<{ payload: ZoneStats }> }) {
  if (!active || !payload || !payload.length) return null;
  const d = payload[0].payload;

  return (
    <div
      className="rounded-lg border p-3 shadow-xl"
      style={{ background: '#141414', borderColor: '#2A2A2A' }}
    >
      <p className="text-sm font-semibold mb-2" style={{ color: '#F5F5F5' }}>
        {d.zone}
      </p>
      <div className="space-y-1 text-xs">
        <div className="flex justify-between gap-4">
          <span style={{ color: '#A1A1AA' }}>Occupancy:</span>
          <span className="font-medium" style={{ color: '#10B981' }}>{d.overallOccupancy}%</span>
        </div>
        <div className="flex justify-between gap-4">
          <span style={{ color: '#A1A1AA' }}>Peak:</span>
          <span className="font-medium" style={{ color: '#F59E0B' }}>{d.peakOccupancy}%</span>
        </div>
        <div className="flex justify-between gap-4">
          <span style={{ color: '#A1A1AA' }}>Off-Peak:</span>
          <span className="font-medium" style={{ color: '#06B6D4' }}>{d.offpeakOccupancy}%</span>
        </div>
        <div className="flex justify-between gap-4">
          <span style={{ color: '#A1A1AA' }}>Courts:</span>
          <span className="font-medium" style={{ color: '#F5F5F5' }}>{d.totalCourts}</span>
        </div>
        <div className="flex justify-between gap-4">
          <span style={{ color: '#A1A1AA' }}>Clubs:</span>
          <span className="font-medium" style={{ color: '#F5F5F5' }}>{d.totalClubs}</span>
        </div>
      </div>
    </div>
  );
}

export function ZoneComparison({ data }: ZoneComparisonProps) {
  return (
    <motion.div
      id="zone-compare"
      className="rounded-lg border p-6 mb-8"
      style={{ background: '#141414', borderColor: '#2A2A2A' }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.5 }}
    >
      <div className="mb-6">
        <h2 className="text-lg font-semibold" style={{ color: '#F5F5F5' }}>
          Zone occupancy comparison
        </h2>
        <p className="text-sm mt-0.5" style={{ color: '#A1A1AA' }}>
          Ranked by highest occupancy
        </p>
      </div>

      {data.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12">
          <p className="text-sm" style={{ color: '#71717A' }}>No data available</p>
        </div>
      ) : (
        <div className="w-full" style={{ height: Math.max(200, data.length * 56) }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              layout="vertical"
              margin={{ top: 5, right: 60, left: 20, bottom: 5 }}
              barSize={24}
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
                dataKey="zone"
                tick={{ fill: '#F5F5F5', fontSize: 13 }}
                axisLine={false}
                tickLine={false}
                width={100}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.02)' }} />
              <Bar dataKey="overallOccupancy" name="Occupancy" radius={[0, 4, 4, 0]}>
                {data.map((entry, i) => (
                  <Cell key={i} fill={getOccupancyColor(entry.overallOccupancy)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </motion.div>
  );
}
