export const money = (v: number | null | undefined, compact = true) => {
  if (v === null || v === undefined || !Number.isFinite(v)) return '—';
  if (compact && Math.abs(v) >= 1e6) return `$${(v / 1e6).toFixed(v >= 1e7 ? 1 : 2)}M`;
  if (compact && Math.abs(v) >= 1e4) return `$${(v / 1e3).toFixed(0)}K`;
  return `$${Math.round(v).toLocaleString('en-US')}`;
};
export const pct = (v: number | null | undefined, digits = 0) => (v === null || v === undefined || !Number.isFinite(v) ? '—' : `${(v * 100).toFixed(digits)}%`);
export const int = (v: number | null | undefined) => (v === null || v === undefined || !Number.isFinite(v) ? '—' : Math.round(v).toLocaleString('en-US'));
export const dec = (v: number | null | undefined, d = 1) => (v === null || v === undefined || !Number.isFinite(v) ? '—' : v.toFixed(d));
export const duration = (minutes: number | null | undefined) => {
  if (minutes === null || minutes === undefined || !Number.isFinite(minutes) || minutes === 0) return '—';
  if (minutes < 60) return `${minutes.toFixed(minutes < 10 ? 1 : 0)} min`;
  if (minutes < 2880) return `${(minutes / 60).toFixed(1)} h`;
  return `${(minutes / 1440).toFixed(1)} d`;
};
export const signed = (v: number | null | undefined) => (v === null || v === undefined || !Number.isFinite(v) ? '—' : `${v >= 0 ? '+' : '−'}${Math.abs(v * 100).toFixed(0)}%`);
export const LOAN_LABEL: Record<string, string> = {
  fix_flip: 'Fix-and-flip',
  bridge: 'Bridge',
  construction: 'Construction',
  dscr: 'DSCR rental',
  bank_statement: 'Bank statement',
  commercial_perm: 'Commercial permanent',
  commercial: 'Commercial bridge',
  Unknown: 'Not given',
};
export const LANG_LABEL: Record<string, string> = { en: 'English', es: 'Spanish', fa: 'Persian', de: 'German', zh: 'Chinese' };
export const ago = (iso: string, now = Date.now()) => {
  const m = (now - Date.parse(iso)) / 60000;
  if (m < 60) return `${Math.max(1, Math.round(m))}m`;
  if (m < 1440) return `${Math.round(m / 60)}h`;
  return `${Math.round(m / 1440)}d`;
};
