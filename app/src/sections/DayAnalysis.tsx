import { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ReferenceLine,
} from 'recharts';
import { TrendingUp, Calendar } from 'lucide-react';
import type { DayStats } from '@/types';

interface DayAnalysisProps {
  data: DayStats[];
}

function CustomTooltip({ active, payload }: { active?: boolean; payload?: Array<{ name: string; value: number; color: string }> }) {
  if (!active || !payload || !payload.length) return null;

  return (
    <div
      className="rounded-lg border p-3 shadow-xl"
      style={{ background: '#141414', borderColor: '#2A2A2A' }}
    >
      <div className="space-y-1">
        {payload.map((entry, i) => (
          <div key={i} className="flex items-center gap-2 text-xs">
            <span className="w-2.5 h-2.5 rounded-full" style={{ background: entry.color }} />
            <span style={{ color: '#A1A1AA' }}>{entry.name}:</span>
            <span className="font-medium" style={{ color: '#F5F5F5', fontFamily: 'JetBrains Mono, monospace' }}>
              {entry.value}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function DayAnalysis({ data }: DayAnalysisProps) {
  const avgOverall = useMemo(() => {
    if (data.length === 0) return 0;
    return Math.round((data.reduce((s, d) => s + d.overallOccupancy, 0) / data.length) * 10) / 10;
  }, [data]);

  const insights = useMemo(() => {
    if (data.length === 0) return [];
    const sorted = [...data].sort((a, b) => b.overallOccupancy - a.overallOccupancy);
    const highest = sorted[0];
    const lowest = sorted[sorted.length - 1];
    const weekendDays = data.filter((d) => d.dayEn === 'Saturday' || d.dayEn === 'Sunday');
    const weekdayDays = data.filter((d) => d.dayEn !== 'Saturday' && d.dayEn !== 'Sunday');
    const weekendAvg = weekendDays.length > 0
      ? weekendDays.reduce((s, d) => s + d.overallOccupancy, 0) / weekendDays.length
      : 0;
    const weekdayAvg = weekdayDays.length > 0
      ? weekdayDays.reduce((s, d) => s + d.overallOccupancy, 0) / weekdayDays.length
      : 0;
    const weekendDiff = weekendAvg > 0 && weekdayAvg > 0
      ? Math.round(((weekendAvg - weekdayAvg) / weekdayAvg) * 1000) / 10
      : 0;

    const result: Array<{ icon: React.ElementType; text: string; color: string }> = [];
    if (highest) {
      result.push({
        icon: TrendingUp,
        text: `${highest.day} has the highest occupancy (${highest.overallOccupancy}%)`,
        color: '#10B981',
      });
    }
    if (lowest && lowest !== highest) {
      result.push({
        icon: TrendingUp,
        text: `${lowest.day} has the lowest occupancy (${lowest.overallOccupancy}%)`,
        color: '#EF4444',
      });
    }
    if (weekendDiff !== 0) {
      result.push({
        icon: Calendar,
        text: `Weekend occupancy is ${weekendDiff > 0 ? 'higher' : 'lower'} than weekdays by ${Math.abs(weekendDiff)}%`,
        color: weekendDiff > 0 ? '#F59E0B' : '#06B6D4',
      });
    }
    return result;
  }, [data]);

  const isWeekend = (dayEn: string) => dayEn === 'Saturday' || dayEn === 'Sunday';

  return (
    <motion.div
      id="day-analysis"
      className="rounded-lg border p-6 mb-8"
      style={{ background: '#141414', borderColor: '#2A2A2A' }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.7 }}
    >
      <div className="mb-6">
        <h2 className="text-lg font-semibold" style={{ color: '#F5F5F5' }}>
          Day analysis
        </h2>
        <p className="text-sm mt-0.5" style={{ color: '#A1A1AA' }}>
          Compare occupancy by weekday
        </p>
      </div>

      {data.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12">
          <p className="text-sm" style={{ color: '#71717A' }}>No data available</p>
        </div>
      ) : (
        <>
          <div className="w-full" style={{ height: 320 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2A" opacity={0.5} vertical={false} />
                <XAxis
                  dataKey="day"
                  tick={({ x, y, payload }) => {
                    const dayData = data.find((d) => d.day === payload.value);
                    const weekend = dayData ? isWeekend(dayData.dayEn) : false;
                    return (
                      <text
                        x={x}
                        y={y + 15}
                        textAnchor="middle"
                        fill={weekend ? '#F59E0B' : '#F5F5F5'}
                        fontSize={12}
                        fontWeight={weekend ? 600 : 400}
                      >
                        {payload.value}
                      </text>
                    );
                  }}
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
                  y={avgOverall}
                  stroke="#71717A"
                  strokeDasharray="6 4"
                  label={{
                    value: `Average ${avgOverall}%`,
                    fill: '#71717A',
                    fontSize: 11,
                    position: 'right',
                  }}
                />
                <Bar dataKey="overallOccupancy" name="Overall" fill="#10B981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="peakOccupancy" name="Peak" fill="#F59E0B" radius={[4, 4, 0, 0]} />
                <Bar dataKey="offpeakOccupancy" name="Off-Peak" fill="#06B6D4" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Insights */}
          {insights.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-6">
              {insights.map((insight, i) => {
                const Icon = insight.icon;
                return (
                  <div
                    key={i}
                    className="flex items-start gap-3 p-3 rounded-md border"
                    style={{ background: '#0A0A0A', borderColor: '#2A2A2A' }}
                  >
                    <div
                      className="w-8 h-8 rounded-md flex items-center justify-center flex-shrink-0"
                      style={{ background: `${insight.color}15` }}
                    >
                      <Icon className="w-4 h-4" style={{ color: insight.color }} />
                    </div>
                    <p className="text-xs leading-relaxed" style={{ color: '#A1A1AA' }}>
                      {insight.text}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </motion.div>
  );
}
