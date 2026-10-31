import { ImageResponse } from 'next/og';
import { LENDER } from '@/lib/config.ts';
import { DICT } from '@/lib/i18n.ts';

export const alt = `${LENDER.name}: residential and commercial real estate loans`;
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '72px 80px', background: 'linear-gradient(135deg, #1d3459 0%, #0f1f38 60%, #0b172b 100%)', color: '#edf1ef', fontFamily: 'serif' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 18, fontSize: 34, color: '#d2ae63' }}>
          <div style={{ width: 54, height: 54, borderRadius: 27, border: '4px solid #d2ae63', display: 'flex' }} />
          {LENDER.name}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
          <div style={{ fontSize: 68, lineHeight: 1.08, maxWidth: 980 }}>{DICT.en.hero.title}</div>
          <div style={{ fontSize: 30, color: 'rgba(237,241,239,.8)' }}>Residential · Commercial · Hard money · Bridge · DSCR</div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 24, color: '#d2ae63', borderTop: '2px solid rgba(180,138,60,.5)', paddingTop: 22 }}>
          <span>Non-bank lender · 50+ partner brokers</span>
          <span>English · Español · فارسی · Deutsch · 中文</span>
        </div>
      </div>
    ),
    size,
  );
}
