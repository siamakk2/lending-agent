import Link from 'next/link';
import { loadLeads } from '@/lib/admin-data.ts';
import { computeMetrics, FEE_RATE, STAGE_PROB, STATUS_LABEL, type Group } from '@/lib/metrics.ts';
import { LENDER } from '@/lib/config.ts';
import { money, pct, int, dec, duration, signed, LOAN_LABEL, LANG_LABEL } from '@/lib/fmt.ts';
import { VelocityChart, Funnel, Heatmap, Histogram, Strip, Share } from '@/components/admin/Charts.tsx';

const RANGES = [
  { k: '7', label: '7d' },
  { k: '30', label: '30d' },
  { k: '90', label: '90d' },
  { k: '365', label: '12m' },
  { k: 'all', label: 'All' },
];

type SP = Promise<{ range?: string; sample?: string }>;

export default async function Overview({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const range = RANGES.some((r) => r.k === sp.range) ? sp.range! : '30';
  const days = range === 'all' ? null : Number(range);
  const wantSample = sp.sample === '1';
  const { leads, sample, configured, realCount, error } = await loadLeads(days, wantSample);
  const tz = process.env.LENDER_TZ || 'America/Los_Angeles';
  const m = computeMetrics(leads, { days: days || 90, tz });
  const q = (extra: Record<string, string>) => {
    const p = new URLSearchParams({ ...(sample ? { sample: '1' } : {}), range, ...extra });
    return `?${p.toString()}`;
  };
  const leadsLink = (extra: Record<string, string>) => `/admin/leads?${new URLSearchParams({ ...(sample ? { sample: '1' } : {}), ...extra })}`;

  return (
    <>
      <header className="adm-head">
        <div>
          <h1>Overview</h1>
          <p>
            {int(m.total)} leads {days ? `in the last ${days} days` : 'all time'} · fee {pct(FEE_RATE, 2)} of funded volume
          </p>
        </div>
        <nav className="chips" aria-label="Date range">
          {RANGES.map((r) => (
            <Link key={r.k} href={q({ range: r.k })} aria-current={r.k === range ? 'true' : undefined}>
              {r.label}
            </Link>
          ))}
        </nav>
      </header>

      {sample ? (
        <div className="banner banner-sample" role="status">
          <span>
            <strong>Sample data.</strong> These are generated leads to show how the dashboard works, not real inquiries. Real leads so far: {realCount}.
          </span>
          <Link href={`?range=${range}`}>Show real data</Link>
        </div>
      ) : realCount < 10 ? (
        <div className="banner banner-info">
          <span>{configured ? `${realCount} real leads so far. Numbers fill in as the desk captures more.` : 'The database is not connected, so no leads can load.'}{error ? ` (${error})` : ''}</span>
          <Link href={q({ sample: '1' })}>Preview with sample data</Link>
        </div>
      ) : null}

      <section className="kpis" aria-label="Key numbers">
        <div className="kpi">
          <div className="kpi-label">Leads captured</div>
          <div className="kpi-value">{int(m.total)}</div>
          <div className="kpi-sub">
            Last 7 days {m.last7} <span className={m.wow !== null && m.wow < 0 ? 'down' : 'up'}>{signed(m.wow)}</span> vs prior 7
          </div>
        </div>
        <div className="kpi">
          <div className="kpi-label">Open pipeline</div>
          <div className="kpi-value">{money(m.openVolume)}</div>
          <div className="kpi-sub">{int(m.open)} open leads requested</div>
        </div>
        <div className="kpi">
          <div className="kpi-label">Weighted pipeline</div>
          <div className="kpi-value">{money(m.weightedPipeline)}</div>
          <div className="kpi-sub">Σ loan × stage probability</div>
        </div>
        <div className="kpi">
          <div className="kpi-label">Funded volume</div>
          <div className="kpi-value">{money(m.fundedVolume)}</div>
          <div className="kpi-sub">{int(m.funded)} loans · avg {money(m.funded ? m.fundedVolume / m.funded : null)}</div>
        </div>
        <div className="kpi kpi-money">
          <div className="kpi-label">Fees earned (0.25%)</div>
          <div className="kpi-value">{money(m.feeEarned, false)}</div>
          <div className="kpi-sub">On funded loans in range</div>
        </div>
        <div className="kpi kpi-money">
          <div className="kpi-label">Expected fees</div>
          <div className="kpi-value">{money(m.feeExpected, false)}</div>
          <div className="kpi-sub">0.25% × weighted pipeline</div>
        </div>
        <div className="kpi">
          <div className="kpi-label">Close rate</div>
          <div className="kpi-value">{pct(m.closeRate)}</div>
          <div className="kpi-sub">{m.closed ? `95% CI ${pct(m.closeCI[0])}–${pct(m.closeCI[1])} · n=${m.closed}` : 'No closed leads yet'}</div>
        </div>
        <div className="kpi">
          <div className="kpi-label">Median first response</div>
          <div className="kpi-value">{duration(m.response.median)}</div>
          <div className="kpi-sub">
            {pct(m.within5)} within 5 min · <Link href={leadsLink({ status: 'open', contacted: 'no' })}>{m.uncontacted} not yet contacted</Link>
          </div>
        </div>
      </section>

      <div className="grid2">
        <section className="panel">
          <h2>Lead velocity</h2>
          <p className="lead-in">Leads per day, last {Math.min(days || 90, 90)} days, with the 7-day moving average.</p>
          <VelocityChart data={m.daily} />
          <div className="legend">
            <span><i style={{ background: '#c9d8d1' }} />Leads per day</span>
            <span><i style={{ background: 'var(--gold)' }} />7-day average</span>
          </div>
        </section>
        <section className="panel">
          <h2>Volume and speed</h2>
          <p className="lead-in">How much comes in and how fast your team responds.</p>
          <dl className="stat-list">
            <div><dt>Leads per day (mean ± sd)</dt><dd>{dec(m.perDay.mean)} ± {dec(m.perDay.stdev)}</dd></div>
            <div><dt>Captured after hours or weekends</dt><dd>{pct(m.afterHours)}</dd></div>
            <div><dt>Urgent and still open</dt><dd><Link href={leadsLink({ status: 'open', urgent: '1' })}>{m.urgentOpen}</Link></dd></div>
            <div><dt>First response P90</dt><dd>{duration(m.response.p90)}</dd></div>
            <div><dt>Contacted within 1 hour</dt><dd>{pct(m.within60)}</dd></div>
            <div><dt>Days from lead to funding (median)</dt><dd>{dec(m.daysToFund.median)}</dd></div>
            <div><dt>Lead-to-fund conversion</dt><dd>{pct(m.leadToFund, 1)}</dd></div>
          </dl>
        </section>
      </div>

      <div className="grid2e">
        <section className="panel">
          <h2>Conversion funnel</h2>
          <p className="lead-in">Leads that reached each stage. Bar = share of all captured leads.</p>
          <Funnel stages={m.funnel} />
        </section>
        <section className="panel">
          <h2>Pipeline by stage</h2>
          <p className="lead-in">Open loans weighted by the chance each stage funds.</p>
          <div className="tbl-wrap">
            <table className="tbl">
              <thead>
                <tr><th>Stage</th><th className="r">Leads</th><th className="r">Requested</th><th className="r">P(fund)</th><th className="r">Weighted</th><th className="r">Exp. fee</th></tr>
              </thead>
              <tbody>
                {m.pipelineByStatus.map((s) => (
                  <tr key={s.status}>
                    <td><Link href={leadsLink({ status: s.status })}><span className={`st st-${s.status}`}>{STATUS_LABEL[s.status]}</span></Link></td>
                    <td className="r">{s.count}</td>
                    <td className="r">{money(s.volume)}</td>
                    <td className="r">{pct(s.prob)}</td>
                    <td className="r">{money(s.weighted)}</td>
                    <td className="r">{money(s.weighted * FEE_RATE, false)}</td>
                  </tr>
                ))}
                <tr>
                  <td><strong>Total</strong></td>
                  <td className="r"><strong>{m.open}</strong></td>
                  <td className="r"><strong>{money(m.openVolume)}</strong></td>
                  <td className="r">{pct(m.openVolume ? m.weightedPipeline / m.openVolume : null, 1)}</td>
                  <td className="r"><strong>{money(m.weightedPipeline)}</strong></td>
                  <td className="r"><strong>{money(m.feeExpected, false)}</strong></td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </div>

      <div className="grid3">
        <section className="panel">
          <h2>Loan size</h2>
          <p className="lead-in">Requested amounts · n={m.requested.n} · mean {money(m.requested.mean)} · sd {money(m.requested.stdev)}</p>
          <Strip s={m.requested} max={Math.max(m.requested.p75 * 2.5, 1)} fmt={(v) => money(v)} />
        </section>
        <section className="panel">
          <h2>Loan-to-value</h2>
          <p className="lead-in">Loan ÷ as-is value · n={m.ltv.n} · mean {pct(m.ltv.mean, 1)}</p>
          <Strip s={m.ltv} max={1} fmt={(v) => pct(v)} marker={{ at: LENDER.box.maxLtvAsIs, label: `box limit ${pct(LENDER.box.maxLtvAsIs)}` }} />
        </section>
        <section className="panel">
          <h2>Loan-to-ARV</h2>
          <p className="lead-in">Fix-and-flip loan ÷ after-repair value · n={m.ltarv.n}</p>
          <Strip s={m.ltarv} max={1} fmt={(v) => pct(v)} marker={{ at: LENDER.box.maxLtArv, label: `box limit ${pct(LENDER.box.maxLtArv)}` }} />
        </section>
      </div>

      <div className="grid2e">
        <section className="panel">
          <h2>Lead score distribution</h2>
          <p className="lead-in">
            Mean {dec(m.scores.mean)} · median {dec(m.scores.median, 0)} · hot {m.byTier.hot} · warm {m.byTier.warm} · nurture {m.byTier.nurture}
          </p>
          <Histogram bins={m.histogram} />
          <p className="muted small">
            Score signal: {m.scoreSignal === null ? 'needs at least 3 closed leads' : `r = ${m.scoreSignal.toFixed(2)} between score and funding (point-biserial)`}. Above 0.2 means higher scores really do fund more often.
          </p>
        </section>
        <section className="panel">
          <h2>When inquiries arrive</h2>
          <p className="lead-in">Weekday × hour ({tz.replace('_', ' ')}). Darker = more leads.</p>
          <Heatmap grid={m.heat} />
        </section>
      </div>

      <BreakdownPanel title="Partners and sources" lead="Leads by broker embed partner ID. Fees are 0.25% of funded volume." rows={m.breakdowns.partner} label={(k) => k} />
      <div className="grid2e">
        <BreakdownPanel title="Loan programs" lead="Which programs bring demand and which close." rows={m.breakdowns.loanType} label={(k) => LOAN_LABEL[k] || k} compact />
        <BreakdownPanel title="States" lead="Where the properties are." rows={m.breakdowns.state} label={(k) => k} compact />
      </div>
      <div className="grid3">
        <MiniTable title="Languages" rows={m.breakdowns.language} label={(k) => LANG_LABEL[k] || k} />
        <MiniTable title="Channels" rows={m.breakdowns.channel} label={(k) => (k === 'voice' ? 'Voice' : k === 'chat' ? 'Chat' : k)} />
        <section className="panel">
          <h2>Open workload</h2>
          <p className="lead-in">Open leads per account executive.</p>
          <table className="tbl">
            <tbody>
              {m.breakdowns.owner.map((g) => (
                <tr key={g.key}><td>{g.key}</td><td className="r">{g.leads}</td><td className="r">{money(g.requested)}</td></tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>
      {m.breakdowns.lostReason.length ? (
        <div className="grid2e">
          <MiniTable title="Why leads were lost" rows={m.breakdowns.lostReason} label={(k) => k} />
          <Definitions />
        </div>
      ) : (
        <Definitions />
      )}
    </>
  );
}

function BreakdownPanel({ title, lead, rows, label, compact }: { title: string; lead: string; rows: Group[]; label: (k: string) => string; compact?: boolean }) {
  return (
    <section className="panel" style={{ marginBottom: 18 }}>
      <h2>{title}</h2>
      <p className="lead-in">{lead}</p>
      <div className="tbl-wrap">
        <table className="tbl">
          <thead>
            <tr>
              <th>Name</th><th className="r">Leads</th>{!compact && <th>Share</th>}<th className="r">Requested</th>
              {!compact && <th className="r">Avg score</th>}
              <th className="r">Funded</th><th className="r">Close rate</th><th className="r">Fee earned</th>
              {!compact && <th className="r">Expected fee</th>}
            </tr>
          </thead>
          <tbody>
            {rows.slice(0, 12).map((g) => (
              <tr key={g.key}>
                <td>{label(g.key)}</td>
                <td className="r">{g.leads}</td>
                {!compact && <td><Share v={g.share} />{pct(g.share)}</td>}
                <td className="r">{money(g.requested)}</td>
                {!compact && <td className="r">{dec(g.avgScore, 0)}</td>}
                <td className="r">{compact ? g.funded : `${g.funded} · ${money(g.fundedVolume)}`}</td>
                <td className="r">{pct(g.closeRate)}</td>
                <td className="r">{money(g.feeEarned, false)}</td>
                {!compact && <td className="r">{money(g.feeExpected, false)}</td>}
              </tr>
            ))}
            {!rows.length && <tr><td colSpan={9} className="muted">No leads in this range.</td></tr>}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function MiniTable({ title, rows, label }: { title: string; rows: Group[]; label: (k: string) => string }) {
  return (
    <section className="panel">
      <h2>{title}</h2>
      <table className="tbl" style={{ marginTop: 10 }}>
        <tbody>
          {rows.map((g) => (
            <tr key={g.key}>
              <td>{label(g.key)}</td>
              <td className="r">{g.leads}</td>
              <td><Share v={g.share} />{pct(g.share)}</td>
            </tr>
          ))}
          {!rows.length && <tr><td className="muted">None yet.</td></tr>}
        </tbody>
      </table>
    </section>
  );
}

function Definitions() {
  return (
    <section className="panel" style={{ marginBottom: 18 }}>
      <h2>How the numbers are calculated</h2>
      <p className="lead-in">Every figure on this page comes from these formulas.</p>
      <div className="defs">
        <div>
          <h3>Weighted pipeline and expected fees</h3>
          <pre className="formula">{`Weighted = Σ loan_amount × P(stage)
Expected fee = 0.25% × Weighted
P(stage): ${Object.entries(STAGE_PROB).filter(([s]) => s !== 'funded' && s !== 'lost').map(([s, p]) => `${STATUS_LABEL[s as keyof typeof STATUS_LABEL]} ${p * 100}%`).join(', ')}`}</pre>
        </div>
        <div>
          <h3>Fees earned</h3>
          <pre className="formula">{`Fee = 0.25% × funded_amount
(loan amount if funded amount not entered)`}</pre>
        </div>
        <div>
          <h3>Close rate</h3>
          <pre className="formula">{`Close rate = funded ÷ (funded + lost)
95% interval: Wilson score method`}</pre>
        </div>
        <div>
          <h3>Leverage and score signal</h3>
          <pre className="formula">{`LTV = loan ÷ as-is value · LTARV = loan ÷ ARV
LTC = loan ÷ (price + rehab)
Score signal r = corr(score, funded 0/1)`}</pre>
        </div>
      </div>
      <p className="muted small" style={{ marginTop: 12 }}>Stage probabilities are starting assumptions; they should be recalibrated once 50+ leads have closed.</p>
    </section>
  );
}
