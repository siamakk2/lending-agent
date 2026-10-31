import type { Summary } from '@/lib/metrics.ts';

/** Daily leads as bars with a 7-day moving average line. */
export function VelocityChart({ data }: { data: { day: string; count: number; ma7: number }[] }) {
  const W = 760;
  const H = 210;
  const pad = { l: 34, r: 10, t: 12, b: 26 };
  const max = Math.max(4, ...data.map((d) => d.count));
  const step = (W - pad.l - pad.r) / data.length;
  const y = (v: number) => pad.t + (H - pad.t - pad.b) * (1 - v / max);
  const ticks = [0, Math.round(max / 2), max];
  const line = data.map((d, i) => `${i ? 'L' : 'M'}${(pad.l + i * step + step / 2).toFixed(1)},${y(d.ma7).toFixed(1)}`).join(' ');
  const label = (d: string) => new Date(`${d}T12:00:00Z`).toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });
  const every = Math.ceil(data.length / 6);
  return (
    <svg className="chart" viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Leads per day with 7-day average">
      {ticks.map((t) => (
        <g key={t}>
          <line x1={pad.l} x2={W - pad.r} y1={y(t)} y2={y(t)} className="grid" />
          <text x={pad.l - 6} y={y(t) + 4} className="ax" textAnchor="end">{t}</text>
        </g>
      ))}
      {data.map((d, i) => (
        <rect key={d.day} x={pad.l + i * step + step * 0.15} y={y(d.count)} width={step * 0.7} height={H - pad.b - y(d.count)} className="bar">
          <title>{`${label(d.day)}: ${d.count} leads (7-day avg ${d.ma7.toFixed(1)})`}</title>
        </rect>
      ))}
      <path d={line} className="ma" />
      {data.map((d, i) => (i % every === 0 ? <text key={d.day} x={pad.l + i * step + step / 2} y={H - 8} className="ax" textAnchor="middle">{label(d.day)}</text> : null))}
    </svg>
  );
}

/** Stage funnel: bar length = share of all captured leads, with step conversion. */
export function Funnel({ stages }: { stages: { stage: string; count: number; ofTotal: number; fromPrev: number }[] }) {
  return (
    <ol className="funnel">
      {stages.map((s, i) => (
        <li key={s.stage}>
          <span className="f-name">{s.stage}</span>
          <span className="f-track">
            <span className="f-bar" style={{ width: `${Math.max(1.5, s.ofTotal * 100)}%` }} />
          </span>
          <span className="f-num">{s.count.toLocaleString('en-US')}</span>
          <span className="f-pct">{(s.ofTotal * 100).toFixed(1)}%</span>
          <span className="f-step">{i === 0 ? '' : `${(s.fromPrev * 100).toFixed(0)}% of previous`}</span>
        </li>
      ))}
    </ol>
  );
}

/** Weekday × hour heat map of when inquiries arrive. */
export function Heatmap({ grid }: { grid: number[][] }) {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const max = Math.max(1, ...grid.flat());
  const C = 22;
  const L = 36;
  return (
    <svg className="chart heat" viewBox={`0 0 ${L + 24 * C} ${7 * C + 22}`} role="img" aria-label="Inquiries by weekday and hour">
      {grid.map((row, d) => (
        <g key={d}>
          <text x={L - 6} y={d * C + C / 2 + 4} className="ax" textAnchor="end">{days[d]}</text>
          {row.map((v, h) => (
            <rect key={h} x={L + h * C + 1} y={d * C + 1} width={C - 2} height={C - 2} rx="3" fill={`rgba(47,93,80,${v ? 0.12 + 0.88 * (v / max) : 0.04})`}>
              <title>{`${days[d]} ${String(h).padStart(2, '0')}:00 — ${v} inquiries`}</title>
            </rect>
          ))}
        </g>
      ))}
      {[0, 6, 12, 18, 23].map((h) => (
        <text key={h} x={L + h * C + C / 2} y={7 * C + 16} className="ax" textAnchor="middle">{h === 0 ? '12a' : h === 12 ? '12p' : h < 12 ? `${h}a` : `${h - 12}p`}</text>
      ))}
    </svg>
  );
}

/** Score histogram coloured by tier band. */
export function Histogram({ bins }: { bins: { from: number; to: number; count: number }[] }) {
  const W = 360;
  const H = 150;
  const max = Math.max(1, ...bins.map((b) => b.count));
  const bw = (W - 20) / bins.length;
  return (
    <svg className="chart" viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Lead score distribution">
      {bins.map((b, i) => {
        const h = (H - 34) * (b.count / max);
        const cls = b.from >= 70 ? 'hot' : b.from >= 40 ? 'warm' : 'cool';
        return (
          <g key={b.from}>
            <rect x={10 + i * bw + 2} y={H - 22 - h} width={bw - 4} height={h} className={`hb ${cls}`}>
              <title>{`Score ${b.from}–${b.to}: ${b.count} leads`}</title>
            </rect>
            {b.count ? <text x={10 + i * bw + bw / 2} y={H - 26 - h} className="ax" textAnchor="middle">{b.count}</text> : null}
            <text x={10 + i * bw + bw / 2} y={H - 8} className="ax" textAnchor="middle">{b.from}</text>
          </g>
        );
      })}
    </svg>
  );
}

/** Distribution strip: min–max whisker, interquartile box, median tick. */
export function Strip({ s, max, fmt, marker }: { s: Summary; max: number; fmt: (v: number) => string; marker?: { at: number; label: string } }) {
  if (!s.n) return <p className="muted small">No data yet.</p>;
  const x = (v: number) => `${Math.min(100, Math.max(0, (v / max) * 100))}%`;
  return (
    <div className="strip">
      <div className="strip-track">
        <span className="strip-whisker" style={{ left: x(s.min), width: `calc(${x(s.max)} - ${x(s.min)})` }} />
        <span className="strip-box" style={{ left: x(s.p25), width: `calc(${x(s.p75)} - ${x(s.p25)})` }} />
        <span className="strip-median" style={{ left: x(s.median) }} />
        {marker ? <span className="strip-marker" style={{ left: x(marker.at) }} title={marker.label} /> : null}
      </div>
      <div className="strip-legend">
        <span>min {fmt(s.min)}</span>
        <span>P25 {fmt(s.p25)}</span>
        <strong>median {fmt(s.median)}</strong>
        <span>P75 {fmt(s.p75)}</span>
        <span>max {fmt(s.max)}</span>
      </div>
      {marker ? <p className="muted small">Gold line: {marker.label}</p> : null}
    </div>
  );
}

/** Inline share bar for tables. */
export function Share({ v }: { v: number }) {
  return (
    <span className="share">
      <span style={{ width: `${Math.max(2, v * 100)}%` }} />
    </span>
  );
}
