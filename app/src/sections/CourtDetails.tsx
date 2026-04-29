import { useState, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Search, ArrowUpDown, Download, ChevronLeft, ChevronRight, Copy, Check } from 'lucide-react';
import type { ProcessedRecord, StatusType } from '@/types';
import { getStatusType, formatEnglishDate } from '@/lib/dataProcessor';

type SortField = 'date' | 'zone' | 'club' | 'court_id' | 'overallOccupancy' | 'booked_total_h';
type SortDir = 'asc' | 'desc';

interface CourtDetailsProps {
  data: ProcessedRecord[];
}

const STATUS_MAP: Record<StatusType, { label: string; bg: string; color: string }> = {
  full: { label: 'Full', bg: 'rgba(16, 185, 129, 0.1)', color: '#10B981' },
  medium: { label: 'Medium', bg: 'rgba(245, 158, 11, 0.1)', color: '#F59E0B' },
  low: { label: 'Available', bg: 'rgba(239, 68, 68, 0.1)', color: '#EF4444' },
  error: { label: 'Error', bg: 'rgba(239, 68, 68, 0.1)', color: '#EF4444' },
};

const ROWS_PER_PAGE_OPTIONS = [10, 25, 50, 100];

export function CourtDetails({ data }: CourtDetailsProps) {
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState<SortField>('overallOccupancy');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [page, setPage] = useState(0);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleSort = useCallback(
    (field: SortField) => {
      if (sortField === field) {
        setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
      } else {
        setSortField(field);
        setSortDir('desc');
      }
      setPage(0);
    },
    [sortField]
  );

  const filtered = useMemo(() => {
    let result = [...data];
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (r) =>
          r.club.toLowerCase().includes(q) ||
          r.court_id.toLowerCase().includes(q) ||
          r.zone.toLowerCase().includes(q)
      );
    }
    result.sort((a, b) => {
      let av: string | number;
      let bv: string | number;
      switch (sortField) {
        case 'date':
          av = a.date;
          bv = b.date;
          break;
        case 'zone':
          av = a.zone;
          bv = b.zone;
          break;
        case 'club':
          av = a.club;
          bv = b.club;
          break;
        case 'court_id':
          av = a.court_id;
          bv = b.court_id;
          break;
        case 'booked_total_h':
          av = a.booked_total_h;
          bv = b.booked_total_h;
          break;
        default:
          av = a.overallOccupancy;
          bv = b.overallOccupancy;
      }
      if (av < bv) return sortDir === 'asc' ? -1 : 1;
      if (av > bv) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
    return result;
  }, [data, search, sortField, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / rowsPerPage));
  const pageData = filtered.slice(page * rowsPerPage, (page + 1) * rowsPerPage);

  const handleCopy = useCallback((id: string) => {
    navigator.clipboard.writeText(id).catch(() => { });
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  }, []);

  const handleExport = useCallback(() => {
    const headers = ['Date', 'Day', 'Zone', 'Club', 'Court ID', 'Booked Peak', 'Booked Off-Peak', 'Booked Total', 'Total Peak', 'Total Off-Peak', 'Occupancy'];
    const rows = filtered.map((r) => [
      r.date, r.day_of_week, r.zone, r.club, r.court_id,
      r.booked_peak_h, r.booked_offpeak_h, r.booked_total_h,
      r.total_peak_h, r.total_offpeak_h, `${r.overallOccupancy}%`,
    ]);
    const csv = [headers, ...rows].map((row) => row.map((c) => `"${c}"`).join(',')).join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'padel_court_data.csv';
    a.click();
    URL.revokeObjectURL(url);
  }, [filtered]);

  const SortHeader = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <button
      onClick={() => handleSort(field)}
      className="flex items-center gap-1 hover:opacity-80 transition-opacity"
    >
      {children}
      <ArrowUpDown
        className="w-3 h-3"
        style={{
          color: sortField === field ? '#10B981' : '#71717A',
          transform: sortField === field && sortDir === 'asc' ? 'rotate(180deg)' : undefined,
        }}
      />
    </button>
  );

  return (
    <motion.div
      id="court-details"
      className="rounded-lg border p-6"
      style={{ background: '#141414', borderColor: '#2A2A2A' }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.8 }}
    >
      {/* Header toolbar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-lg font-semibold" style={{ color: '#F5F5F5' }}>
            Court details
          </h2>
          <p className="text-sm mt-0.5" style={{ color: '#A1A1AA' }}>
            {filtered.length} entries
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#71717A' }} />
            <input
              type="text"
              placeholder="Search club or court..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(0); }}
              className="pl-9 pr-3 py-1.5 rounded-md text-sm border outline-none focus:ring-1 w-56"
              style={{ background: '#1C1C1C', borderColor: '#2A2A2A', color: '#F5F5F5' }}
            />
          </div>
          {/* Export */}
          <button
            onClick={handleExport}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-sm border transition-colors hover:border-[#3A3A3A]"
            style={{ background: '#1C1C1C', borderColor: '#2A2A2A', color: '#A1A1AA' }}
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
          {/* Rows per page */}
          <select
            value={rowsPerPage}
            onChange={(e) => { setRowsPerPage(Number(e.target.value)); setPage(0); }}
            className="px-2 py-1.5 rounded-md text-sm border outline-none"
            style={{ background: '#1C1C1C', borderColor: '#2A2A2A', color: '#F5F5F5' }}
          >
            {ROWS_PER_PAGE_OPTIONS.map((n) => (
              <option key={n} value={n}>{n} / page</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto -mx-6">
        <table className="w-full" style={{ minWidth: 960 }}>
          <thead>
            <tr style={{ background: '#1C1C1C' }}>
              <th className="text-left px-6 py-3 text-xs font-semibold" style={{ color: '#A1A1AA' }}>
                <SortHeader field="date">Date</SortHeader>
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold" style={{ color: '#A1A1AA' }}>
                Day
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold" style={{ color: '#A1A1AA' }}>
                <SortHeader field="zone">Zone</SortHeader>
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold" style={{ color: '#A1A1AA' }}>
                <SortHeader field="club">Club</SortHeader>
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold" style={{ color: '#A1A1AA' }}>
                <SortHeader field="court_id">Court ID</SortHeader>
              </th>
              <th className="text-right px-4 py-3 text-xs font-semibold" style={{ color: '#A1A1AA' }}>
                Booked Peak
              </th>
              <th className="text-right px-4 py-3 text-xs font-semibold" style={{ color: '#A1A1AA' }}>
                Booked Off-Peak
              </th>
              <th className="text-right px-4 py-3 text-xs font-semibold" style={{ color: '#A1A1AA' }}>
                Booked Total
              </th>
              <th className="text-right px-4 py-3 text-xs font-semibold" style={{ color: '#A1A1AA' }}>
                <SortHeader field="overallOccupancy">Occupancy</SortHeader>
              </th>
              <th className="text-center px-4 py-3 text-xs font-semibold" style={{ color: '#A1A1AA' }}>
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {pageData.map((row, i) => {
              const status = getStatusType(row.overallOccupancy);
              const statusStyle = STATUS_MAP[status];
              return (
                <tr
                  key={`${row.court_id}-${i}`}
                  className="transition-colors"
                  style={{
                    background: i % 2 === 0 ? '#141414' : '#0A0A0A',
                    borderBottom: '1px solid #2A2A2A',
                  }}
                >
                  <td className="px-6 py-3 text-sm" style={{ color: '#F5F5F5', whiteSpace: 'nowrap' }}>
                    {formatEnglishDate(row.date)}
                  </td>
                  <td className="px-4 py-3 text-sm" style={{ color: '#A1A1AA' }}>
                    {row.day_of_week}
                  </td>
                  <td className="px-4 py-3 text-sm" style={{ color: '#F5F5F5' }}>
                    {row.zone}
                  </td>
                  <td className="px-4 py-3 text-sm font-medium" style={{ color: '#F5F5F5' }}>
                    {row.club}
                  </td>
                  <td className="px-4 py-3 text-sm" style={{ color: '#A1A1AA' }}>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs">{row.court_id.slice(0, 8)}...</span>
                      <button
                        onClick={() => handleCopy(row.court_id)}
                        className="opacity-0 group-hover:opacity-100 hover:opacity-100 transition-opacity"
                        style={{ color: '#71717A' }}
                        title="Copy"
                      >
                        {copiedId === row.court_id ? (
                          <Check className="w-3.5 h-3.5" style={{ color: '#10B981' }} />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-right" style={{ color: '#F5F5F5', fontFamily: 'JetBrains Mono, monospace' }}>
                    {row.booked_peak_h.toFixed(1)}
                  </td>
                  <td className="px-4 py-3 text-sm text-right" style={{ color: '#F5F5F5', fontFamily: 'JetBrains Mono, monospace' }}>
                    {row.booked_offpeak_h.toFixed(1)}
                  </td>
                  <td className="px-4 py-3 text-sm text-right" style={{ color: '#F5F5F5', fontFamily: 'JetBrains Mono, monospace' }}>
                    {row.booked_total_h.toFixed(1)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <div className="w-16 h-1.5 rounded-full overflow-hidden" style={{ background: '#1C1C1C' }}>
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${Math.min(100, row.overallOccupancy)}%`,
                            background: statusStyle.color,
                          }}
                        />
                      </div>
                      <span className="text-sm text-right" style={{ color: '#F5F5F5', fontFamily: 'JetBrains Mono, monospace', minWidth: 48 }}>
                        {row.overallOccupancy}%
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className="inline-block px-2 py-0.5 rounded text-xs font-medium"
                      style={{ background: statusStyle.bg, color: statusStyle.color }}
                    >
                      {statusStyle.label}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {filtered.length > 0 && (
        <div className="flex items-center justify-between mt-4 pt-4" style={{ borderTop: '1px solid #2A2A2A' }}>
          <span className="text-xs" style={{ color: '#71717A' }}>
            Showing {page * rowsPerPage + 1}-{Math.min((page + 1) * rowsPerPage, filtered.length)} of {filtered.length} entries
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="p-1.5 rounded-md border transition-colors disabled:opacity-30"
              style={{ background: '#1C1C1C', borderColor: '#2A2A2A', color: '#A1A1AA' }}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const pageNum = i;
              return (
                <button
                  key={i}
                  onClick={() => setPage(pageNum)}
                  className="w-8 h-8 rounded-md text-sm transition-colors"
                  style={{
                    background: page === pageNum ? '#10B981' : '#1C1C1C',
                    color: page === pageNum ? '#0A0A0A' : '#A1A1AA',
                    border: page === pageNum ? 'none' : '1px solid #2A2A2A',
                  }}
                >
                  {pageNum + 1}
                </button>
              );
            })}
            {totalPages > 5 && <span style={{ color: '#71717A' }}>...</span>}
            <button
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="p-1.5 rounded-md border transition-colors disabled:opacity-30"
              style={{ background: '#1C1C1C', borderColor: '#2A2A2A', color: '#A1A1AA' }}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12">
          <p className="text-sm" style={{ color: '#71717A' }}>No results match your filters</p>
        </div>
      )}
    </motion.div>
  );
}
