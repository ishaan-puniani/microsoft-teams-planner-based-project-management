export type AggregateEstimates = {
  architect: number;
  developer: number;
  tester: number;
  businessAnalyst: number;
  ux: number;
  pm: number;
};

export const ESTIMATES_ROLES: { key: keyof AggregateEstimates; label: string }[] = [
  { key: 'architect', label: 'Architect' },
  { key: 'developer', label: 'Developer' },
  { key: 'tester', label: 'Tester' },
  { key: 'businessAnalyst', label: 'Business Analyst' },
  { key: 'ux', label: 'UX' },
  { key: 'pm', label: 'PM' },
];

export const CHART_COLORS = [
  '#36A2EB',
  '#FF6384',
  '#4BC0C0',
  '#FFCE56',
  '#9966FF',
  '#FF9F40',
];
