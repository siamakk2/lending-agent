/** Lending Desk seal for generated raster icons (next/og). */
export function Seal({ size }: { size: number }) {
  const ring = Math.round(size * 0.035);
  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f1f38' }}>
      <div style={{ width: size * 0.78, height: size * 0.78, borderRadius: size, border: `${ring}px solid #d2ae63`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: size * 0.56, height: size * 0.56, borderRadius: size, border: `${Math.max(2, Math.round(ring / 2))}px solid rgba(210,174,99,.55)`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#d2ae63', fontSize: size * 0.26, fontFamily: 'serif', letterSpacing: -size * 0.006 }}>
          LD
        </div>
      </div>
    </div>
  );
}
