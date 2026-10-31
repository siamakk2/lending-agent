import Link from 'next/link';
import { loadLeads } from '@/lib/admin-data.ts';
import { leverage, leadFee, STATUSES, STATUS_LABEL, type LeadRow } from '@/lib/metrics.ts';
import { money, pct, ago, LOAN_LABEL, LANG_LABEL } from '@/lib/fmt.ts';
import { filterLeads as filter } from '@/lib/admin-filter.ts';

type SP = Promise<Record<string, string | undefined>>;
const PAGE = 50;

const SORTS: Record<string, (a: LeadRow, b: LeadRow) => number> = {
  newest: (a, b) => b.created_at.localeCompare(a.created_at),
  score: (a, b) => b.score - a.score,
  amount: (a, b) => (b.deal?.loan_amount || 0) - (a.deal?.loan_amount || 0),
  urgent: (a, b) => Number(b.urgent) - Number(a.urgent) || b.score - a.score,
};

export default async function LeadsPage({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const { leads, sample } = await loadLeads(null, sp.sample === '1');
  const rows = filter(leads, sp).sort(SORTS[sp.sort || 'newest'] || SORTS.newest);
  const page = Math.max(1, Number(sp.page) || 1);
  const shown = rows.slice((page - 1) * PAGE, page * PAGE);
  const states = [...new Set(leads.map((l) => l.deal?.state).filter(Boolean))].sort() as string[];
  const partners = [...new Set(leads.map((l) => l.partner_ref || 'direct'))].sort();
  const totalReq = rows.reduce((a, l) => a + (l.deal?.loan_amount || 0), 0);
  const link = (extra: Record<string, string>) => {
    const p = new URLSearchParams(Object.entries({ ...sp, ...extra }).filter(([, v]) => v) as [string, string][]);
    return `?${p}`;
  };

  return (
    <>
      <header className="adm-head">
        <div>
          <h1>Leads</h1>
          <p>
            {rows.length.toLocaleString('en-US')} matching · {money(totalReq)} requested · {money(rows.reduce((a, l) => a + leadFee(l), 0), false)} fee value at 0.25%
          </p>
        </div>
        <a className="btn-adm ghost" href={`/api/admin/export${link({ page: '' })}`}>Export these to CSV</a>
      </header>
      {sample ? <div className="banner banner-sample"><span><strong>Sample data</strong>, not real leads.</span><Link href="/admin/leads">Show real data</Link></div> : null}

      <form className="filters" method="get">
        {sample ? <input type="hidden" name="sample" value="1" /> : null}
        <input type="search" name="q" defaultValue={sp.q} placeholder="Search name, email, phone, city, partner" aria-label="Search" />
        <select name="status" defaultValue={sp.status || ''} aria-label="Status">
          <option value="">All statuses</option>
          <option value="open">Open (not funded or lost)</option>
          {STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
        </select>
        <select name="tier" defaultValue={sp.tier || ''} aria-label="Tier">
          <option value="">All tiers</option>
          <option value="hot">Hot (70+)</option>
          <option value="warm">Warm (40–69)</option>
          <option value="nurture">Nurture (&lt;40)</option>
        </select>
        <select name="type" defaultValue={sp.type || ''} aria-label="Loan program">
          <option value="">All programs</option>
          {Object.entries(LOAN_LABEL).filter(([k]) => k !== 'Unknown').map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <select name="state" defaultValue={sp.state || ''} aria-label="State">
          <option value="">All states</option>
          {states.map((s) => <option key={s}>{s}</option>)}
        </select>
        <select name="partner" defaultValue={sp.partner || ''} aria-label="Partner">
          <option value="">All partners</option>
          {partners.map((p) => <option key={p} value={p}>{p === 'direct' ? 'Direct (website)' : p}</option>)}
        </select>
        <select name="sort" defaultValue={sp.sort || 'newest'} aria-label="Sort">
          <option value="newest">Newest first</option>
          <option value="urgent">Urgent first</option>
          <option value="score">Highest score</option>
          <option value="amount">Largest loan</option>
        </select>
        <label className="check" style={{ margin: 0 }}><input type="checkbox" name="urgent" value="1" defaultChecked={sp.urgent === '1'} /> Urgent only</label>
        <button className="btn-adm" type="submit">Apply</button>
        <Link className="btn-adm ghost" href={sample ? '?sample=1' : '?'}>Clear</Link>
      </form>

      <section className="panel" style={{ padding: '6px 20px' }}>
        <div className="tbl-wrap">
          <table className="tbl">
            <thead>
              <tr>
                <th>Received</th><th>Name</th><th>Program</th><th className="r">Loan</th><th className="r">LTV</th><th>State</th>
                <th className="r">Score</th><th>Status</th><th>Owner</th><th>Partner</th><th>Lang</th><th className="r">Fee 0.25%</th>
              </tr>
            </thead>
            <tbody>
              {shown.map((l) => {
                const lev = leverage(l.deal);
                return (
                  <tr key={l.id}>
                    <td title={new Date(l.created_at).toLocaleString('en-US')}>{ago(l.created_at)} ago</td>
                    <td>
                      <Link href={`/admin/leads/${l.id}${sample ? '?sample=1' : ''}`}>{l.contact?.full_name || 'Unnamed'}</Link>{' '}
                      {l.urgent ? <span className="pill pill-urgent">Urgent</span> : null}
                      {l.lead_type !== 'borrower' ? <span className="muted small"> · broker</span> : null}
                    </td>
                    <td>{LOAN_LABEL[l.deal?.loan_type || 'Unknown'] || l.deal?.loan_type}</td>
                    <td className="r">{money(l.deal?.loan_amount)}</td>
                    <td className="r">{pct(lev.ltv)}</td>
                    <td>{l.deal?.state || '—'}</td>
                    <td className="r"><span className={`pill pill-${l.tier}`}>{l.score}</span></td>
                    <td><span className={`st st-${l.status}`}>{STATUS_LABEL[l.status]}</span></td>
                    <td>{l.assigned_to || l.broker || <span className="muted">—</span>}</td>
                    <td>{l.partner_ref || <span className="muted">Direct</span>}</td>
                    <td>{LANG_LABEL[l.preferred_language || 'en']?.slice(0, 3) || l.preferred_language}</td>
                    <td className="r">{money(leadFee(l), false)}</td>
                  </tr>
                );
              })}
              {!shown.length && <tr><td colSpan={12} className="muted" style={{ padding: 24 }}>No leads match these filters.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>
      <div className="pager">
        <span>Page {page} of {Math.max(1, Math.ceil(rows.length / PAGE))}</span>
        <span style={{ display: 'flex', gap: 8 }}>
          {page > 1 ? <Link className="btn-adm ghost" href={link({ page: String(page - 1) })}>Previous</Link> : null}
          {page * PAGE < rows.length ? <Link className="btn-adm ghost" href={link({ page: String(page + 1) })}>Next</Link> : null}
        </span>
      </div>
    </>
  );
}
