import type { ProcessedRecord, KPIData, ZoneStats, ClubStats, DayStats, DateStats } from '@/types';

const ENGLISH_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const THAI_TO_ENGLISH_DAY: Record<string, string> = {
  'วันจันทร์': 'Monday',
  'วันอังคาร': 'Tuesday',
  'วันพุธ': 'Wednesday',
  'วันพฤหัสบดี': 'Thursday',
  'วันศุกร์': 'Friday',
  'วันเสาร์': 'Saturday',
  'วันอาทิตย์': 'Sunday',
};
const DAY_ORDER = ENGLISH_DAYS;

function normalizeDayOfWeek(dayOfWeek: string): string {
  const value = String(dayOfWeek).trim();
  if (!value) return value;
  const lower = value.toLowerCase();
  const english = ENGLISH_DAYS.find((day) => day.toLowerCase() === lower);
  if (english) return english;
  return THAI_TO_ENGLISH_DAY[value] ?? value;
}

export function parseExcelData(rawData: Record<string, unknown>[]): ProcessedRecord[] {
  return rawData.map((row) => {
    const booked_peak_h = Number(row.booked_peak_h ?? 0);
    const booked_offpeak_h = Number(row.booked_offpeak_h ?? 0);
    const booked_total_h = Number(row.booked_total_h ?? 0);
    const total_peak_h = Number(row.total_peak_h ?? 0);
    const total_offpeak_h = Number(row.total_offpeak_h ?? 0);
    const total_h = Number(row.total_h ?? 0);

    const overallOccupancy = total_h > 0 ? Math.round((booked_total_h / total_h) * 1000) / 10 : 0;
    const peakOccupancy = total_peak_h > 0 ? Math.round((booked_peak_h / total_peak_h) * 1000) / 10 : 0;
    const offpeakOccupancy = total_offpeak_h > 0 ? Math.round((booked_offpeak_h / total_offpeak_h) * 1000) / 10 : 0;

    const dateStr = String(row.date ?? '');
    const dateObj = dateStr ? new Date(dateStr) : new Date();

    return {
      date: dateStr,
      day_of_week: normalizeDayOfWeek(String(row.day_of_week ?? '')),
      zone: String(row.zone ?? ''),
      club: String(row.club ?? ''),
      court_id: String(row.court_id ?? ''),
      booked_peak_h,
      booked_offpeak_h,
      booked_total_h,
      total_peak_h,
      total_offpeak_h,
      total_h,
      overallOccupancy,
      peakOccupancy,
      offpeakOccupancy,
      dateObj,
    };
  });
}

export function validateRawData(data: Record<string, unknown>[]): boolean {
  if (!data || data.length === 0) return false;
  const required = ['date', 'day_of_week', 'zone', 'club', 'court_id', 'booked_peak_h', 'booked_offpeak_h', 'booked_total_h', 'total_peak_h', 'total_offpeak_h', 'total_h'];
  const keys = Object.keys(data[0]);
  return required.every((col) => keys.includes(col));
}

export function computeKPIs(data: ProcessedRecord[]): KPIData {
  const totalBooked = data.reduce((s, r) => s + r.booked_total_h, 0);
  const totalAvail = data.reduce((s, r) => s + r.total_h, 0);
  const totalPeakBooked = data.reduce((s, r) => s + r.booked_peak_h, 0);
  const totalPeakAvail = data.reduce((s, r) => s + r.total_peak_h, 0);
  const totalOffBooked = data.reduce((s, r) => s + r.booked_offpeak_h, 0);
  const totalOffAvail = data.reduce((s, r) => s + r.total_offpeak_h, 0);

  return {
    overallOccupancy: totalAvail > 0 ? Math.round((totalBooked / totalAvail) * 1000) / 10 : 0,
    peakOccupancy: totalPeakAvail > 0 ? Math.round((totalPeakBooked / totalPeakAvail) * 1000) / 10 : 0,
    offpeakOccupancy: totalOffAvail > 0 ? Math.round((totalOffBooked / totalOffAvail) * 1000) / 10 : 0,
    totalCourts: new Set(data.map((r) => r.court_id)).size,
    totalClubs: new Set(data.map((r) => r.club)).size,
    totalZones: new Set(data.map((r) => r.zone)).size,
  };
}

export function computeZoneStats(data: ProcessedRecord[]): ZoneStats[] {
  const grouped = new Map<string, ProcessedRecord[]>();
  data.forEach((r) => {
    const arr = grouped.get(r.zone) || [];
    arr.push(r);
    grouped.set(r.zone, arr);
  });

  const stats: ZoneStats[] = [];
  grouped.forEach((records, zone) => {
    const totalBooked = records.reduce((s, r) => s + r.booked_total_h, 0);
    const totalAvail = records.reduce((s, r) => s + r.total_h, 0);
    const totalPeakBooked = records.reduce((s, r) => s + r.booked_peak_h, 0);
    const totalPeakAvail = records.reduce((s, r) => s + r.total_peak_h, 0);
    const totalOffBooked = records.reduce((s, r) => s + r.booked_offpeak_h, 0);
    const totalOffAvail = records.reduce((s, r) => s + r.total_offpeak_h, 0);

    stats.push({
      zone,
      overallOccupancy: totalAvail > 0 ? Math.round((totalBooked / totalAvail) * 1000) / 10 : 0,
      peakOccupancy: totalPeakAvail > 0 ? Math.round((totalPeakBooked / totalPeakAvail) * 1000) / 10 : 0,
      offpeakOccupancy: totalOffAvail > 0 ? Math.round((totalOffBooked / totalOffAvail) * 1000) / 10 : 0,
      totalCourts: new Set(records.map((r) => r.court_id)).size,
      totalClubs: new Set(records.map((r) => r.club)).size,
      totalBookedHours: totalBooked,
      totalAvailableHours: totalAvail,
    });
  });

  return stats.sort((a, b) => b.overallOccupancy - a.overallOccupancy);
}

export function computeClubStats(data: ProcessedRecord[]): ClubStats[] {
  const grouped = new Map<string, ProcessedRecord[]>();
  data.forEach((r) => {
    const key = `${r.zone}::${r.club}`;
    const arr = grouped.get(key) || [];
    arr.push(r);
    grouped.set(key, arr);
  });

  const stats: ClubStats[] = [];
  grouped.forEach((records, key) => {
    const [zone, club] = key.split('::');
    const totalBooked = records.reduce((s, r) => s + r.booked_total_h, 0);
    const totalAvail = records.reduce((s, r) => s + r.total_h, 0);
    const totalPeakBooked = records.reduce((s, r) => s + r.booked_peak_h, 0);
    const totalPeakAvail = records.reduce((s, r) => s + r.total_peak_h, 0);
    const totalOffBooked = records.reduce((s, r) => s + r.booked_offpeak_h, 0);
    const totalOffAvail = records.reduce((s, r) => s + r.total_offpeak_h, 0);

    stats.push({
      club,
      zone,
      overallOccupancy: totalAvail > 0 ? Math.round((totalBooked / totalAvail) * 1000) / 10 : 0,
      peakOccupancy: totalPeakAvail > 0 ? Math.round((totalPeakBooked / totalPeakAvail) * 1000) / 10 : 0,
      offpeakOccupancy: totalOffAvail > 0 ? Math.round((totalOffBooked / totalOffAvail) * 1000) / 10 : 0,
      totalCourts: new Set(records.map((r) => r.court_id)).size,
      totalBookedHours: totalBooked,
      totalAvailableHours: totalAvail,
    });
  });

  return stats.sort((a, b) => b.overallOccupancy - a.overallOccupancy);
}

export function computeDayStats(data: ProcessedRecord[]): DayStats[] {
  const grouped = new Map<string, ProcessedRecord[]>();
  data.forEach((r) => {
    const arr = grouped.get(r.day_of_week) || [];
    arr.push(r);
    grouped.set(r.day_of_week, arr);
  });

  const stats: DayStats[] = [];
  grouped.forEach((records, day) => {
    const totalBooked = records.reduce((s, r) => s + r.booked_total_h, 0);
    const totalAvail = records.reduce((s, r) => s + r.total_h, 0);
    const totalPeakBooked = records.reduce((s, r) => s + r.booked_peak_h, 0);
    const totalPeakAvail = records.reduce((s, r) => s + r.total_peak_h, 0);
    const totalOffBooked = records.reduce((s, r) => s + r.booked_offpeak_h, 0);
    const totalOffAvail = records.reduce((s, r) => s + r.total_offpeak_h, 0);

    const normalizedDay = ENGLISH_DAYS.includes(day) ? day : THAI_TO_ENGLISH_DAY[day] ?? day;

    stats.push({
      day: normalizedDay,
      dayEn: normalizedDay,
      overallOccupancy: totalAvail > 0 ? Math.round((totalBooked / totalAvail) * 1000) / 10 : 0,
      peakOccupancy: totalPeakAvail > 0 ? Math.round((totalPeakBooked / totalPeakAvail) * 1000) / 10 : 0,
      offpeakOccupancy: totalOffAvail > 0 ? Math.round((totalOffBooked / totalOffAvail) * 1000) / 10 : 0,
      recordCount: records.length,
    });
  });

  return stats.sort((a, b) => DAY_ORDER.indexOf(a.dayEn) - DAY_ORDER.indexOf(b.dayEn));
}

export function computeDateStats(data: ProcessedRecord[]): DateStats[] {
  const grouped = new Map<string, ProcessedRecord[]>();
  data.forEach((r) => {
    const arr = grouped.get(r.date) || [];
    arr.push(r);
    grouped.set(r.date, arr);
  });

  const stats: DateStats[] = [];
  grouped.forEach((records, date) => {
    const totalBooked = records.reduce((s, r) => s + r.booked_total_h, 0);
    const totalAvail = records.reduce((s, r) => s + r.total_h, 0);
    const totalPeakBooked = records.reduce((s, r) => s + r.booked_peak_h, 0);
    const totalPeakAvail = records.reduce((s, r) => s + r.total_peak_h, 0);
    const totalOffBooked = records.reduce((s, r) => s + r.booked_offpeak_h, 0);
    const totalOffAvail = records.reduce((s, r) => s + r.total_offpeak_h, 0);

    stats.push({
      date,
      overallOccupancy: totalAvail > 0 ? Math.round((totalBooked / totalAvail) * 1000) / 10 : 0,
      peakOccupancy: totalPeakAvail > 0 ? Math.round((totalPeakBooked / totalPeakAvail) * 1000) / 10 : 0,
      offpeakOccupancy: totalOffAvail > 0 ? Math.round((totalOffBooked / totalOffAvail) * 1000) / 10 : 0,
    });
  });

  return stats.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

export function getOccupancyColor(occupancy: number): string {
  if (occupancy >= 70) return '#10B981';
  if (occupancy >= 40) return '#F59E0B';
  return '#EF4444';
}

export function getStatusType(occupancy: number): 'full' | 'medium' | 'low' {
  if (occupancy >= 80) return 'full';
  if (occupancy >= 40) return 'medium';
  return 'low';
}

export function formatEnglishDate(dateStr: string): string {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

export function formatShortDate(dateStr: string): string {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${d.getDate()} ${months[d.getMonth()]}`;
}
