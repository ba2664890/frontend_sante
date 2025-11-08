import { TrendDataPoint, GeographicDataPoint, Patient, Alert, Action } from '../types/dashboard';

export interface ChartProps {
  data: any[]; // Accept various shapes (trend points, {name,value} for pie, or multi-series)
  type: 'line' | 'bar' | 'pie';
  height?: number;
  xKey?: string; // Optional key for x-axis
  yKeys?: string[]; // Optional array of keys for y-axis
  colors?: string[]; // Optional array of colors for the chart
  showTooltip?: boolean; // Optional flag to show tooltip
  showLegend?: boolean; // Optional flag to show legend
}

export interface RecentPatientsProps {
  patients: Patient[];
  showActions?: boolean;
}

export interface RecentAlertsProps {
  alerts: Alert[];
}

export interface SenegalMapProps {
  // Accept either an array of geographic points or a record keyed by region id/name to counts
  data: GeographicDataPoint[] | Record<string, number>;
}

export interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  color: 'primary' | 'success' | 'warning' | 'info' | 'error';
}