// Original banknote-style security engraving, generated mathematically (no stock imagery).

/** Hypotrochoid rosette path, centered at (cx, cy). */
function rosette(cx: number, cy: number, R: number, r: number, d: number, steps: number, rot = 0): string {
  const k = (R - r) / r;
  let p = '';
  for (let i = 0; i <= steps; i++) {
    const t = (i / steps) * Math.PI * 2 * r;
    const x = (R - r) * Math.cos(t) + d * Math.cos(k * t);
    const y = (R - r) * Math.sin(t) - d * Math.sin(k * t);
    const xr = cx + x * Math.cos(rot) - y * Math.sin(rot);
    const yr = cy + x * Math.sin(rot) + y * Math.cos(rot);
    p += `${i ? 'L' : 'M'}${xr.toFixed(1)} ${yr.toFixed(1)}`;
  }
  return p;
}

/** One modulated wave line, like the fine background printing on currency. */
function wave(y0: number, w: number, amp: number, freq: number, phase: number): string {
  let p = '';
  for (let x = 0; x <= w; x += 8) {
    const env = 0.55 + 0.45 * Math.sin((x / w) * Math.PI * 2 + phase * 0.7);
    const y = y0 + Math.sin(x * freq + phase) * amp * env;
    p += `${x ? 'L' : 'M'}${x} ${y.toFixed(1)}`;
  }
  return p;
}

// Every curve stays inside radius 158: (R - r) + d <= 158.
const ROSETTE = [
  rosette(0, 0, 104, 13, 62, 1500),
  rosette(0, 0, 104, 13, 62, 1500, Math.PI / 13),
  rosette(0, 0, 82, 11, 46, 1200, 0.15),
  rosette(0, 0, 60, 9, 32, 900, 0.05),
  rosette(0, 0, 38, 7, 18, 600),
];

const MARK = [rosette(0, 0, 104, 13, 62, 700), rosette(0, 0, 60, 9, 34, 500, 0.2)];

const WAVES = Array.from({ length: 34 }, (_, i) => wave(20 + i * 22, 1600, 9 + (i % 5), 0.012 + (i % 3) * 0.002, i * 0.45));

export function Rosette({ className, size = 360, mark = false }: { className?: string; size?: number; mark?: boolean }) {
  if (mark)
    return (
      <svg className={className} width={size} height={size} viewBox="-170 -170 340 340" aria-hidden="true" focusable="false">
        <circle r="164" fill="none" stroke="currentColor" strokeWidth="10" />
        {MARK.map((d, i) => (
          <path key={i} d={d} fill="none" stroke="currentColor" strokeWidth="5" />
        ))}
      </svg>
    );
  return (
    <svg className={className} width={size} height={size} viewBox="-170 -170 340 340" aria-hidden="true" focusable="false">
      <circle r="166" fill="none" stroke="currentColor" strokeWidth="0.6" />
      <circle r="160" fill="none" stroke="currentColor" strokeWidth="0.3" />
      {ROSETTE.map((d, i) => (
        <path key={i} d={d} fill="none" stroke="currentColor" strokeWidth={i < 2 ? 0.35 : 0.45} />
      ))}
    </svg>
  );
}

export function WaveField({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 1600 780" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
      {WAVES.map((d, i) => (
        <path key={i} d={d} fill="none" stroke="currentColor" strokeWidth="0.6" />
      ))}
    </svg>
  );
}

/** A thin engraved border band, like the frame of a banknote. */
export function Band({ className }: { className?: string }) {
  const d = wave(10, 1600, 6, 0.06, 0) + wave(10, 1600, 6, 0.06, Math.PI);
  return (
    <svg className={className} viewBox="0 0 1600 20" preserveAspectRatio="none" aria-hidden="true" focusable="false">
      <path d={d} fill="none" stroke="currentColor" strokeWidth="0.8" />
      <line x1="0" y1="1" x2="1600" y2="1" stroke="currentColor" strokeWidth="0.6" />
      <line x1="0" y1="19" x2="1600" y2="19" stroke="currentColor" strokeWidth="0.6" />
    </svg>
  );
}
