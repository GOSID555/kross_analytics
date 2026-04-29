import { motion } from 'framer-motion';
import { Activity, Zap, Moon, LayoutGrid, TrendingUp, TrendingDown, HelpCircle } from 'lucide-react';
import type { KPIData } from '@/types';

interface KPICardsProps {
  kpis: KPIData | null;
}

interface KPICardProps {
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  label: string;
  value: string | number;
  unit: string;
  change: number;
  changeLabel: string;
  delay: number;
}

function KPICard({ icon: Icon, iconBg, iconColor, label, value, unit, change, changeLabel, delay }: KPICardProps) {
  const isPositive = change >= 0;

  return (
    <motion.div
      className="rounded-lg border p-6 transition-all duration-200 hover:-translate-y-0.5"
      style={{
        background: '#141414',
        borderColor: '#2A2A2A',
      }}
      whileHover={{ borderColor: '#3A3A3A' }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
    >
      {/* Top row */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center"
            style={{ background: iconBg }}
          >
            <Icon className="w-5 h-5" style={{ color: iconColor }} />
          </div>
          <span className="text-sm" style={{ color: '#A1A1AA' }}>
            {label}
          </span>
        </div>
        <button className="opacity-0 hover:opacity-100 transition-opacity" style={{ color: '#71717A' }}>
          <HelpCircle className="w-4 h-4" />
        </button>
      </div>

      {/* Value */}
      <div className="flex items-baseline gap-2 mb-3">
        <span className="text-3xl font-bold" style={{ color: '#F5F5F5', fontFamily: 'JetBrains Mono, monospace' }}>
          {value}
        </span>
        <span className="text-base" style={{ color: '#A1A1AA' }}>
          {unit}
        </span>
      </div>

      {/* Change indicator */}
      <div className="flex items-center gap-2">
        <span
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium"
          style={{
            background: isPositive ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
            color: isPositive ? '#10B981' : '#EF4444',
          }}
        >
          {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          {isPositive ? '+' : ''}{change}%
        </span>
        <span className="text-xs" style={{ color: '#71717A' }}>
          {changeLabel}
        </span>
      </div>
    </motion.div>
  );
}

export function KPICards({ kpis }: KPICardsProps) {
  if (!kpis) return null;

  const cards = [
    {
      icon: Activity,
      iconBg: 'rgba(16, 185, 129, 0.1)',
      iconColor: '#10B981',
      label: 'Overall occupancy',
      value: kpis.overallOccupancy,
      unit: '%',
      change: 2.4,
      changeLabel: 'vs average',
    },
    {
      icon: Zap,
      iconBg: 'rgba(245, 158, 11, 0.1)',
      iconColor: '#F59E0B',
      label: 'Peak hours',
      value: kpis.peakOccupancy,
      unit: '%',
      change: 5.1,
      changeLabel: 'vs average',
    },
    {
      icon: Moon,
      iconBg: 'rgba(6, 182, 212, 0.1)',
      iconColor: '#06B6D4',
      label: 'Off-Peak hours',
      value: kpis.offpeakOccupancy,
      unit: '%',
      change: -1.2,
      changeLabel: 'vs average',
    },
    {
      icon: LayoutGrid,
      iconBg: 'rgba(139, 92, 246, 0.1)',
      iconColor: '#8B5CF6',
      label: 'Total courts',
      value: kpis.totalCourts,
      unit: 'courts',
      change: 0,
      changeLabel: `from ${kpis.totalClubs} clubs`,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {cards.map((card, i) => (
        <KPICard key={card.label} {...card} delay={i * 0.1} />
      ))}
    </div>
  );
}
