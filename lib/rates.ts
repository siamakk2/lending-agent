import { db } from './db.ts';

export type Benchmark = { series: string; label: string; value: number; as_of: string; source_url: string };

export const SERIES: { series: string; label: string }[] = [
  { series: 'DFEDTARU', label: 'Fed funds target (upper bound)' },
  { series: 'DFEDTARL', label: 'Fed funds target (lower bound)' },
  { series: 'DPRIME', label: 'Bank prime rate' },
  { series: 'SOFR', label: 'SOFR (overnight)' },
  { series: 'DGS10', label: '10-year Treasury yield' },
  { series: 'DGS2', label: '2-year Treasury yield' },
  { series: 'MORTGAGE30US', label: '30-yr fixed mortgage avg (Freddie Mac)' },
  { series: 'MORTGAGE15US', label: '15-yr fixed mortgage avg (Freddie Mac)' },
];

// Last verified snapshot (Oct 2026) — used only if FRED and the cache are both unreachable.
const FALLBACK: Benchmark[] = [
  { series: 'DFEDTARU', label: 'Fed funds target (upper bound)', value: 4.0, as_of: '2026-10-28', source_url: 'https://fred.stlouisfed.org/series/DFEDTARU' },
  { series: 'DFEDTARL', label: 'Fed funds target (lower bound)', value: 3.75, as_of: '2026-10-28', source_url: 'https://fred.stlouisfed.org/series/DFEDTARL' },
  { series: 'DPRIME', label: 'Bank prime rate', value: 7.0, as_of: '2026-10-28', source_url: 'https://fred.stlouisfed.org/series/DPRIME' },
  { series: 'MORTGAGE30US', label: '30-yr fixed mortgage avg (Freddie Mac)', value: 7.32, as_of: '2026-10-22', source_url: 'https://fred.stlouisfed.org/series/MORTGAGE30US' },
  { series: 'MORTGAGE15US', label: '15-yr fixed mortgage avg (Freddie Mac)', value: 6.68, as_of: '2026-10-22', source_url: 'https://fred.stlouisfed.org/series/MORTGAGE15US' },
];

/** Parse FRED's fredgraph CSV and return the latest non-missing observation. */
export function parseFredCsv(csv: string): { date: string; value: number } | null {
  const lines = csv.trim().split(/\r?\n/).slice(1);
  for (let i = lines.length - 1; i >= 0; i--) {
    const [date, raw] = lines[i].split(',');
    const value = Number(raw);
    if (date && raw && raw !== '.' && Number.isFinite(value)) return { date, value };
  }
  return null;
}

async function fetchSeries(series: string, label: string): Promise<Benchmark | null> {
  try {
    const start = new Date(Date.now() - 60 * 864e5).toISOString().slice(0, 10);
    const res = await fetch(`https://fred.stlouisfed.org/graph/fredgraph.csv?id=${series}&cosd=${start}`, {
      signal: AbortSignal.timeout(6000),
      headers: { 'User-Agent': 'lending-agent/0.1' },
    });
    if (!res.ok) return null;
    const last = parseFredCsv(await res.text());
    if (!last) return null;
    return { series, label, value: last.value, as_of: last.date, source_url: `https://fred.stlouisfed.org/series/${series}` };
  } catch {
    return null;
  }
}

/** Live benchmarks: cache (≤ 12h) → FRED → last verified snapshot. */
export async function getBenchmarks(): Promise<{ benchmarks: Benchmark[]; from: 'cache' | 'live' | 'snapshot' }> {
  const supa = db();
  if (supa) {
    const { data } = await supa.from('la_rates_cache').select('*');
    const fresh = (data || []).filter((r) => Date.now() - new Date(r.fetched_at).getTime() < 12 * 3600e3);
    if (fresh.length >= SERIES.length - 2) {
      return { benchmarks: fresh.map(({ series, label, value, as_of, source_url }) => ({ series, label, value: Number(value), as_of, source_url })), from: 'cache' };
    }
  }

  const live = (await Promise.all(SERIES.map((s) => fetchSeries(s.series, s.label)))).filter(Boolean) as Benchmark[];
  if (live.length) {
    if (supa) await supa.from('la_rates_cache').upsert(live.map((b) => ({ ...b, fetched_at: new Date().toISOString() })));
    return { benchmarks: live, from: 'live' };
  }
  return { benchmarks: FALLBACK, from: 'snapshot' };
}
