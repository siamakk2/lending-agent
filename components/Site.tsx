'use client';

import { useEffect, useState } from 'react';
import Chat from './Chat.tsx';
import LiveVoice from './LiveVoice.tsx';
import { Band, Rosette, WaveField } from './Engraving.tsx';
import Medallion from './Medallion.tsx';
import StateMap from './StateMap.tsx';
import { DICT, LANG_META, LANGS, isLang, type Lang } from '@/lib/i18n.ts';
import type { Benchmark } from '@/lib/rates.ts';
import type { LoanType } from '@/lib/config.ts';
import type { QA } from '@/lib/faq.ts';

type Ranges = Record<LoanType, { rate: string; points: string | null; term: { from: number; to: number; unit: 'mo' | 'yr' } | null }>;

const BOARD = ['DPRIME', 'SOFR', 'DFEDTARU', 'DGS10', 'MORTGAGE30US'];
const SEGMENTS: Record<'residential' | 'commercial', LoanType[]> = {
  residential: ['bank_statement', 'dscr', 'fix_flip', 'bridge', 'construction'],
  commercial: ['commercial_perm', 'commercial', 'construction'],
};

function fmtDate(iso: string, lang: Lang) {
  const locale = { en: 'en-US', es: 'es-US', fa: 'fa-IR', de: 'de-DE', zh: 'zh-CN' }[lang];
  try {
    return new Date(`${iso}T12:00:00Z`).toLocaleDateString(locale, { month: 'short', day: 'numeric' });
  } catch {
    return iso;
  }
}

function fmtPct(v: number, lang: Lang) {
  const locale = { en: 'en-US', es: 'es-US', fa: 'fa-IR', de: 'de-DE', zh: 'zh-CN' }[lang];
  return `${v.toLocaleString(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%`;
}

export default function Site({
  benchmarks,
  ranges,
  rangesAsOf,
  lenderName,
  nmls,
  states,
  initialLang,
  faq,
  faqTitle,
}: {
  benchmarks: Benchmark[];
  ranges: Ranges;
  rangesAsOf: string;
  lenderName: string;
  nmls: string;
  states: string[];
  initialLang: Lang;
  faq: Record<Lang, QA[]>;
  faqTitle: Record<Lang, string>;
}) {
  const [lang, setLang] = useState<Lang>(initialLang);
  const [seg, setSeg] = useState<'residential' | 'commercial'>('residential');
  const [copied, setCopied] = useState(false);
  const d = DICT[lang];
  const meta = LANG_META[lang];

  // Only the root page auto-detects; /es, /fa, /de, /zh are explicit.
  useEffect(() => {
    if (window.location.pathname !== '/') return;
    try {
      const saved = localStorage.getItem('la_lang');
      const nav = navigator.language.slice(0, 2);
      const pick = isLang(saved) ? saved : isLang(nav) ? nav : null;
      if (pick && pick !== 'en') switchLang(pick);
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function switchLang(l: Lang) {
    setLang(l);
    try {
      window.history.replaceState(null, '', l === 'en' ? '/' : `/${l}`);
    } catch {}
  }

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = meta.dir;
    try {
      localStorage.setItem('la_lang', lang);
    } catch {}
  }, [lang, meta.dir]);

  const origin = typeof window === 'undefined' ? 'https://www.lendingdesk.app' : window.location.origin;
  const snippet = `<script src="${origin}/embed.js" data-partner="YOUR-ID" data-lang="${lang}" async></script>`;
  const toDesk = () => document.getElementById('desk')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  const board = BOARD.map((s) => benchmarks.find((b) => b.series === s)).filter(Boolean) as Benchmark[];
  const term = (r: Ranges[LoanType]) =>
    !r.term ? d.units.varies : r.term.from === r.term.to ? `${r.term.from} ${d.units[r.term.unit]}` : `${r.term.from}–${r.term.to} ${d.units[r.term.unit]}`;

  return (
    <div className={`site lang-${lang}`} dir={meta.dir}>
      <header className="top">
        <a className="brand" href="#" aria-label={lenderName}>
          <Rosette className="brand-mark" size={34} mark />
          <span className="brand-name">{lenderName}</span>
        </a>
        <nav className="top-nav" aria-label="Main">
          <a href="#programs">{d.nav.programs}</a>
          <a href="#rates">{d.nav.rates}</a>
          <a href="#how">{d.nav.how}</a>
          <a href="#brokers">{d.nav.brokers}</a>
          <a href="#embed">{d.embed.copy === 'Copy code' ? 'Embed' : d.embed.copy}</a>
          <a href="#faq">FAQ</a>
        </nav>
        <div className="top-actions">
          <label className="lang-pick">
            <span className="sr-only">{d.units.lang}</span>
            <select value={lang} onChange={(e) => isLang(e.target.value) && switchLang(e.target.value)}>
              {LANGS.map((l) => (
                <option key={l} value={l}>
                  {LANG_META[l].native}
                </option>
              ))}
            </select>
          </label>
          <button type="button" className="btn btn-gold btn-small" onClick={toDesk}>
            {d.nav.talk}
          </button>
        </div>
      </header>

      <section className="hero">
        <WaveField className="hero-waves" />
        <Medallion className="hero-medallion" />
        <Rosette className="hero-rosette" size={720} />
        <div className="hero-inner">
          <div className="hero-copy">
            <h1>{d.hero.title}</h1>
            <p className="hero-lead">{d.hero.lead}</p>
            <div className="hero-ctas">
              <button type="button" className="btn btn-gold" onClick={toDesk}>
                {d.hero.ctaChat}
              </button>
              <a className="btn btn-line" href="#brokers">
                {d.hero.ctaBroker}
              </a>
            </div>
            <ul className="hero-proof">
              {d.hero.proof.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>
          </div>
          <div
            id="desk"
            className="hero-desk"
            onPointerMove={(e) => {
              if (e.pointerType !== 'mouse') return;
              const r = e.currentTarget.getBoundingClientRect();
              e.currentTarget.style.setProperty('--ry', `${((e.clientX - r.left) / r.width - 0.5) * 5}deg`);
              e.currentTarget.style.setProperty('--rx', `${-((e.clientY - r.top) / r.height - 0.5) * 4}deg`);
            }}
            onPointerLeave={(e) => {
              e.currentTarget.style.setProperty('--ry', '0deg');
              e.currentTarget.style.setProperty('--rx', '0deg');
            }}
          >
            <Chat lang={lang} lenderName={lenderName} />
          </div>
        </div>
        <Band className="hero-band" />
      </section>

      <section id="rates" className="board" aria-labelledby="rates-h">
        <div className="wrap">
          <div className="board-head">
            <h2 id="rates-h">{d.rates.title}</h2>
            <p>{d.rates.note}</p>
          </div>
          <dl className="board-grid">
            {board.map((b) => (
              <div key={b.series} className="board-cell">
                <dt>{d.rates.labels[b.series] || b.label}</dt>
                <dd className="board-num">{fmtPct(b.value, lang)}</dd>
                <dd className="board-meta">
                  {d.rates.asOf} {fmtDate(b.as_of, lang)} ·{' '}
                  <a href={b.source_url} target="_blank" rel="noreferrer">
                    FRED
                  </a>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section id="programs" className="programs" aria-labelledby="programs-h">
        <div className="wrap">
          <h2 id="programs-h">{d.programs.title}</h2>
          <p className="section-lead">{d.programs.lead}</p>
          <div className="seg" role="tablist" aria-label={d.programs.title}>
            {(['residential', 'commercial'] as const).map((k) => (
              <button key={k} type="button" role="tab" aria-selected={seg === k} className={seg === k ? 'seg-on' : ''} onClick={() => setSeg(k)}>
                {d.segments[k]}
              </button>
            ))}
          </div>
          <div className="sheet-scroll" role="tabpanel">
            <table className="sheet">
              <thead>
                <tr>
                  {d.programs.cols.map((c) => (
                    <th key={c} scope="col">
                      {c}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {SEGMENTS[seg].map((k) => (
                  <tr key={k}>
                    <th scope="row">{d.programs.rows[k].name}</th>
                    <td className="use">{d.programs.rows[k].use}</td>
                    <td className="num" data-label={d.programs.cols[2]}>{ranges[k].rate}</td>
                    <td className="num" data-label={d.programs.cols[3]}>{ranges[k].points ?? d.units.varies}</td>
                    <td data-label={d.programs.cols[4]}>{term(ranges[k])}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="sheet-note">
            {d.programs.note} {d.rates.asOf} {fmtDate(rangesAsOf, lang)}.
          </p>
        </div>
      </section>

      <section id="coverage" className="coverage" aria-labelledby="coverage-h">
        <div className="wrap coverage-inner">
          <div>
            <h2 id="coverage-h">{d.coverage.title}</h2>
            <p className="section-lead">{d.coverage.lead}</p>
            <p className="coverage-list">{states.join(' · ')}</p>
          </div>
          <StateMap states={states} label={d.coverage.title} />
        </div>
      </section>

      <section id="how" className="how" aria-labelledby="how-h">
        <div className="wrap">
          <h2 id="how-h">{d.how.title}</h2>
          <ol className="steps">
            {d.how.steps.map((s, i) => (
              <li key={s.t}>
                <span className="step-n" aria-hidden="true">
                  {(i + 1).toLocaleString({ en: 'en-US', es: 'es-US', fa: 'fa-IR', de: 'de-DE', zh: 'zh-CN' }[lang])}
                </span>
                <h3>{s.t}</h3>
                <p>{s.d}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section id="brokers" className="brokers" aria-labelledby="brokers-h">
        <Rosette className="brokers-rosette" size={520} />
        <div className="wrap brokers-inner">
          <div>
            <h2 id="brokers-h">{d.brokers.title}</h2>
            <p className="section-lead">{d.brokers.lead}</p>
          </div>
          <ul className="brokers-points">
            {d.brokers.points.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
          <button type="button" className="btn btn-gold" onClick={toDesk}>
            {d.brokers.cta}
          </button>
        </div>
      </section>

      <section id="embed" className="embed" aria-labelledby="embed-h">
        <div className="wrap embed-inner">
          <div>
            <h2 id="embed-h">{d.embed.title}</h2>
            <p className="section-lead">{d.embed.lead}</p>
            <ol className="embed-steps">
              {d.embed.steps.map((x) => (
                <li key={x}>{x}</li>
              ))}
            </ol>
          </div>
          <div className="code-card">
            <pre dir="ltr">
              <code>{snippet}</code>
            </pre>
            <button
              type="button"
              className="btn btn-gold btn-small"
              onClick={() => {
                navigator.clipboard?.writeText(snippet).then(() => {
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                });
              }}
            >
              {copied ? d.embed.copied : d.embed.copy}
            </button>
            <p className="code-note">{d.embed.note}</p>
          </div>
        </div>
      </section>

      <section id="faq" className="faq" aria-labelledby="faq-h">
        <div className="wrap">
          <h2 id="faq-h">{faqTitle[lang]}</h2>
          <div className="faq-list">
            {faq[lang].map((x, i) => (
              <details key={x.q} className="faq-item" open={i === 0}>
                <summary>
                  <h3 className="faq-q">{x.q}</h3>
                </summary>
                <p className="faq-a">{x.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <footer className="foot">
        <Band className="foot-band" />
        <div className="wrap foot-inner">
          <div className="foot-brand">
            <Rosette className="brand-mark" size={40} mark />
            <div>
              <p className="foot-name">{lenderName}</p>
              {nmls && <p className="foot-nmls">NMLS #{nmls}</p>}
              <p className="foot-eho">{d.footer.ehoText}</p>
            </div>
          </div>
          <p className="foot-disclaimer">{d.footer.disclaimer}</p>
          <p className="foot-rights">
            © {new Date().getFullYear()} {lenderName}. {d.footer.rights}
          </p>
        </div>
      </footer>
      <LiveVoice lang={lang} />
    </div>
  );
}
