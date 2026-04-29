import { motion } from 'framer-motion';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
  Brush,
} from 'recharts';
import { BarChart3 } from 'lucide-react';
import type { DateStats } from '@/types';
import { formatShortDate } from '@/lib/dataProcessor';

interface OccupancyChartProps {
  data: DateStats[];
}

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ color: string; name: string; value: number }>; label?: string }) {
  if (!active || !payload || !payload.length) return null;

  return (
    <div
      className="rounded-lg border p-3 shadow-xl"
      style={{ background: '#141414', borderColor: '#2A2A2A' }}
    >
      <p className="text-sm font-medium mb-2" style={{ color: '#F5F5F5' }}>
        {label ? formatShortDate(label) : ''}
      </p>
      {payload.map((entry, i) => (
        <div key={i} className="flex items-center gap-2 text-xs mb-1">
          <span className="w-2.5 h-2.5 rounded-full" style={{ background: entry.color }} />
          <span style={{ color: '#A1A1AA' }}>{entry.name}:</span>
          <span className="font-medium" style={{ color: '#F5F5F5', fontFamily: 'JetBrains Mono, monospace' }}>
            {entry.value}%
          </span>
        </div>
      ))}
    </div>
  );
}

export function OccupancyChart({ data }: OccupancyChartProps) {
  const avgOccupancy = data.length > 0
    ? Math.round((data.reduce((s, d) => s + d.overallOccupancy, 0) / data.length) * 10) / 10
    : 0;

  const isSingleDay = data.length <= 1;

  const chartData = data.map((d) => ({
    ...d,
    dateLabel: formatShortDate(d.date),
  }));

  return (
    <motion.div
      id="overview"
      className="rounded-lg border p-6 mb-8"
      style={{ background: '#141414', borderColor: '#2A2A2A' }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.4 }}
    >
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold" style={{ color: '#F5F5F5' }}>
            Occupancy trend
          </h2>
          <p className="text-sm mt-0.5" style={{ color: '#A1A1AA' }}>
            All zones and clubs
          </p>
        </div>
        {isSingleDay && (
          <span
            className="px-2 py-1 rounded text-xs font-medium"
            style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10B981' }}
          >
            Single day
          </span>
        )}
      </div>

      {data.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16">
          <BarChart3 className="w-12 h-12 mb-3" style={{ color: '#3A3A3A' }} />
          <p className="text-sm" style={{ color: '#71717A' }}>
            No data available for the selected range
          </p>
        </div>
      ) : (
        <div className="w-full" style={{ height: 360 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="overallGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2A" opacity={0.5} vertical={false} />
              <XAxis
                dataKey={isSingleDay ? 'date' : 'dateLabel'}
                tick={{ fill: '#71717A', fontSize: 12 }}
                axisLine={{ stroke: '#2A2A2A' }}
                tickLine={false}
              />
              <YAxis
                domain={[0, 100]}
                tick={{ fill: '#71717A', fontSize: 12 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v: number) => `${v}%`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{ fontSize: 12, color: '#A1A1AA' }}
                iconType="circle"
                iconSize={8}
              />
              <ReferenceLine
                y={avgOccupancy}
                stroke="#71717A"
                strokeDasharray="6 4"
                label={{
                  value: `Average ${avgOccupancy}%`,
                  fill: '#71717A',
                  fontSize: 11,
                  position: 'right',
                }}
              />
              <Area
                type="monotone"
                dataKey="overallOccupancy"
                name="Overall occupancy"
                stroke="#10B981"
                strokeWidth={2}
                fill="url(#overallGrad)"
                dot={{ r: 3, fill: '#10B981', strokeWidth: 0 }}
                activeDot={{ r: 5, fill: '#10B981', stroke: '#0A0A0A', strokeWidth: 2 }}
              />
              <Area
                type="monotone"
                dataKey="peakOccupancy"
                name="Peak Hours"
                stroke="#F59E0B"
                strokeWidth={2}
                fill="transparent"
                dot={{ r: 3, fill: '#F59E0B', strokeWidth: 0 }}
                activeDot={{ r: 5, fill: '#F59E0B', stroke: '#0A0A0A', strokeWidth: 2 }}
              />
              <Area
                type="monotone"
                dataKey="offpeakOccupancy"
                name="Off-Peak Hours"
                stroke="#06B6D4"
                strokeWidth={2}
                strokeDasharray="6 4"
                fill="transparent"
                dot={{ r: 3, fill: '#06B6D4', strokeWidth: 0 }}
                activeDot={{ r: 5, fill: '#06B6D4', stroke: '#0A0A0A', strokeWidth: 2 }}
              />
              {!isSingleDay && <Brush dataKey="dateLabel" height={24} stroke="#3A3A3A" fill="#141414" />}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </motion.div>
  );
}
