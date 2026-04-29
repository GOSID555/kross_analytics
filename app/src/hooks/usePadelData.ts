import { useState, useCallback, useMemo } from 'react';
import * as XLSX from 'xlsx';
import type { ProcessedRecord, FilterState } from '@/types';
import {
  parseExcelData,
  validateRawData,
  computeKPIs,
  computeZoneStats,
  computeClubStats,
  computeDayStats,
  computeDateStats,
} from '@/lib/dataProcessor';

interface UsePadelDataReturn {
  data: ProcessedRecord[];
  filteredData: ProcessedRecord[];
  kpis: ReturnType<typeof computeKPIs> | null;
  zoneStats: ReturnType<typeof computeZoneStats>;
  clubStats: ReturnType<typeof computeClubStats>;
  dayStats: ReturnType<typeof computeDayStats>;
  dateStats: ReturnType<typeof computeDateStats>;
  filters: FilterState;
  zones: string[];
  clubs: string[];
  isLoading: boolean;
  error: string | null;
  parseFile: (file: File) => Promise<void>;
  setZoneFilter: (zone: string | null) => void;
  setClubFilter: (club: string | null) => void;
  clearFilters: () => void;
}

export function usePadelData(): UsePadelDataReturn {
  const [data, setData] = useState<ProcessedRecord[]>([]);
  const [filters, setFilters] = useState<FilterState>({ zone: null, club: null });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const parseFile = useCallback(async (file: File) => {
    setIsLoading(true);
    setError(null);

    try {
      if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
        throw new Error('Please upload a .xlsx file only');
      }
      if (file.size > 10 * 1024 * 1024) {
        throw new Error('File size must be under 10MB');
      }

      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: 'array' });
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
      const rawData = XLSX.utils.sheet_to_json<Record<string, unknown>>(firstSheet);

      if (!validateRawData(rawData)) {
        throw new Error('Invalid file. Please check all required columns are present');
      }

      const processed = parseExcelData(rawData);
      setData(processed);
      setFilters({ zone: null, club: null });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to read the file');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const filteredData = useMemo(() => {
    return data.filter((r) => {
      if (filters.zone && r.zone !== filters.zone) return false;
      if (filters.club && r.club !== filters.club) return false;
      return true;
    });
  }, [data, filters]);

  const kpis = useMemo(() => {
    if (filteredData.length === 0) return null;
    return computeKPIs(filteredData);
  }, [filteredData]);

  const zoneStats = useMemo(() => {
    return computeZoneStats(filteredData);
  }, [filteredData]);

  const clubStats = useMemo(() => {
    return computeClubStats(filteredData);
  }, [filteredData]);

  const dayStats = useMemo(() => {
    return computeDayStats(filteredData);
  }, [filteredData]);

  const dateStats = useMemo(() => {
    return computeDateStats(filteredData);
  }, [filteredData]);

  const zones = useMemo(() => {
    return Array.from(new Set(data.map((r) => r.zone))).sort();
  }, [data]);

  const clubs = useMemo(() => {
    const source = filters.zone ? data.filter((r) => r.zone === filters.zone) : data;
    return Array.from(new Set(source.map((r) => r.club))).sort();
  }, [data, filters.zone]);

  const setZoneFilter = useCallback((zone: string | null) => {
    setFilters((prev) => ({ ...prev, zone, club: zone ? prev.club : null }));
  }, []);

  const setClubFilter = useCallback((club: string | null) => {
    setFilters((prev) => ({ ...prev, club }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({ zone: null, club: null });
  }, []);

  return {
    data,
    filteredData,
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
  };
}
