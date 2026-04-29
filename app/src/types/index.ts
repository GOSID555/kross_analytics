export interface PadelRecord {
  date: string;
  day_of_week: string;
  zone: string;
  club: string;
  court_id: string;
  booked_peak_h: number;
  booked_offpeak_h: number;
  booked_total_h: number;
  total_peak_h: number;
  total_offpeak_h: number;
  total_h: number;
}

export interface ProcessedRecord extends PadelRecord {
  overallOccupancy: number;
  peakOccupancy: number;
  offpeakOccupancy: number;
  dateObj: Date;
}

export interface KPIData {
  overallOccupancy: number;
  peakOccupancy: number;
  offpeakOccupancy: number;
  totalCourts: number;
  totalClubs: number;
  totalZones: number;
}

export interface ZoneStats {
  zone: string;
  overallOccupancy: number;
  peakOccupancy: number;
  offpeakOccupancy: number;
  totalCourts: number;
  totalClubs: number;
  totalBookedHours: number;
  totalAvailableHours: number;
}

export interface ClubStats {
  club: string;
  zone: string;
  overallOccupancy: number;
  peakOccupancy: number;
  offpeakOccupancy: number;
  totalCourts: number;
  totalBookedHours: number;
  totalAvailableHours: number;
}

export interface DayStats {
  day: string;
  dayEn: string;
  overallOccupancy: number;
  peakOccupancy: number;
  offpeakOccupancy: number;
  recordCount: number;
}

export interface DateStats {
  date: string;
  overallOccupancy: number;
  peakOccupancy: number;
  offpeakOccupancy: number;
}

export type StatusType = 'full' | 'medium' | 'low' | 'error';

export interface FilterState {
  zone: string | null;
  club: string | null;
}

export type SectionId = 'overview' | 'zone-compare' | 'club-compare' | 'day-analysis' | 'court-details';

export interface NavItem {
  id: SectionId;
  icon: string;
  labelTh: string;
  labelEn: string;
}
