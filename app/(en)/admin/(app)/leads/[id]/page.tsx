import Link from 'next/link';
import { notFound } from 'next/navigation';
import { loadLead } from '@/lib/admin-data.ts';
import { updateLead } from '@/lib/admin-actions.ts';
import { leverage, grossYield, leadFee, FEE_RATE, STAGE_PROB, STATUSES, STATUS_LABEL } from '@/lib/metrics.ts';
import { checkFit } from '@/lib/scoring.ts';
import { money, pct, duration, LOAN_LABEL, LANG_LABEL } from '@/lib/fmt.ts';

type P = Promise<{ id: string }>;
type SP = Promise<{ sample?: string }>;

const VERDICT: Record<string, string> = { fits: 'Inside the lending box', fits_with_changes: 'Fits with changes', outside_box: 'Outside the box', need_more_info: 'Needs more information' };

export default async function LeadDetail({ params, searchParams }: { params: P; searchParams: SP }) {
  const { id } = await params;
  const sp = await searchParams;
  const data = await loadLead(id);
  if (!data) notFound();
  const { lead: l, events, transcript, sample } = data;
  const d = l.deal || {};
  const lev = leverage(l.deal);
  const yld = grossYield(l.deal);
  const fit = checkFit({ ...d, state: d.state || undefined, loan_type: d.loan_type || undefined, loan_amount: d.loan_amount || undefined, as_is_value: d.as_is_value || undefined, purchase_price: d.purchase_price || undefined, arv: d.arv || undefined, rehab_budget: d.rehab_budget || undefined } as never);
  const fee = leadFee(l);
  const respMin = l.first_contacted_at ? (Date.parse(l.first_contacted_at) - Date.parse(l.created_at)) / 60000 : null;
  const ageMin = (Date.now() - Date.parse(l.created_at)) / 60000;
  const extra = data.lead.dealExtra as Record<string, unknown>;
  const rows: [string, string][] = [
    ['Program', LOAN_LABEL[d.loan_type || 'Unknown'] || String(d.loan_type || '—')],
    ['Loan requested', money(d.loan_amount, false)],
    ['As-is value', money(d.as_is_value, false)],
    ['Purchase price', money(d.purchase_price, false)],
    ['Rehab budget', money(d.rehab_budget, false)],
    ['After-repair value', money(d.arv, false)],
    ['Monthly rent', money(d.monthly_rent, false)],
    ['Property', [d.property_type, d.city, d.state].filter(Boolean).join(' · ') || '—'],
    ['Exit strategy', String(d.exit_strategy || '—')],
    ['Close by', String(d.close_by || '—')],
    ['Deals in last 24 months', d.experience_deals_24mo === null || d.experience_deals_24mo === undefined ? '—' : String(d.experience_deals_24mo)],
    ['Credit (self-reported)', String(d.credit_band || '—')],
  ];
  if (extra.property_address) rows.push(['Address', String(extra.property_address)]);
  if (extra.existing_liens) rows.push(['Existing liens', money(Number(extra.existing_liens), false)]);

  return (
    <>
      <header className="adm-head">
        <div>
          <p style={{ margin: '0 0 6px' }}><Link href={`/admin/leads${sp.sample ? '?sample=1' : ''}`} className="muted small">← All leads</Link></p>
          <h1>{l.contact?.full_name || 'Unnamed lead'}</h1>
          <p>
            <span className={`pill pill-${l.tier}`}>{l.tier} · {l.score}/100</span>{' '}
            {l.urgent ? <span className="pill pill-urgent">Urgent</span> : null}{' '}
            <span className={`st st-${l.status}`}>{STATUS_LABEL[l.status]}</span> · received {new Date(l.created_at).toLocaleString('en-US')} ·{' '}
            {l.lead_type === 'borrower' ? 'Borrower' : l.lead_type === 'broker_deal' ? 'Broker deal' : 'Broker signup'} · {l.channel}
          </p>
        </div>
      </header>
      {sample ? <div className="banner banner-sample"><span><strong>Sample lead.</strong> Editing is turned off for sample data.</span></div> : null}

      <section className="kpis">
        <div className="kpi"><div className="kpi-label">Loan requested</div><div className="kpi-value">{money(d.loan_amount)}</div><div className="kpi-sub">{LOAN_LABEL[d.loan_type || 'Unknown']}</div></div>
        <div className="kpi"><div className="kpi-label">LTV / LTC / LTARV</div><div className="kpi-value">{pct(lev.ltv)}</div><div className="kpi-sub">LTC {pct(lev.ltc)} · LTARV {pct(lev.ltarv)}</div></div>
        <div className="kpi kpi-money"><div className="kpi-label">{l.status === 'funded' ? 'Fee earned' : 'Fee if funded'} (0.25%)</div><div className="kpi-value">{money(fee, false)}</div><div className="kpi-sub">Expected now {money(fee * STAGE_PROB[l.status], false)} at P={pct(STAGE_PROB[l.status])}</div></div>
        <div className="kpi"><div className="kpi-label">First response</div><div className="kpi-value">{respMin !== null ? duration(respMin) : 'Waiting'}</div><div className="kpi-sub">{respMin !== null ? 'From inquiry to first contact' : `${duration(ageMin)} since inquiry`}</div></div>
      </section>

      <div className="detail">
        <div style={{ display: 'grid', gap: 18 }}>
          <section className="panel">
            <h2>Deal file</h2>
            <p className="lead-in">{l.summary || 'No summary.'}</p>
            <dl className="stat-list">
              {rows.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}
              {yld !== null ? <div><dt>Gross rental yield</dt><dd>{pct(yld, 1)}</dd></div> : null}
            </dl>
          </section>
          <section className="panel">
            <h2>Lending box check: {VERDICT[fit.verdict]}</h2>
            <ul style={{ margin: '8px 0 0', paddingInlineStart: 18, fontSize: 14 }}>
              {fit.reasons.map((r) => <li key={r}>{r}</li>)}
            </ul>
            {l.flags.length ? (
              <>
                <h2 style={{ marginTop: 14 }}>Flags from the conversation</h2>
                <ul style={{ margin: '8px 0 0', paddingInlineStart: 18, fontSize: 14 }}>{l.flags.map((f) => <li key={f}>{f}</li>)}</ul>
              </>
            ) : null}
          </section>
          <section className="panel">
            <h2>Conversation</h2>
            <p className="lead-in">The full transcript with the AI lending desk.</p>
            {transcript.length ? (
              <div className="transcript">
                {transcript.map((t, i) => <div key={i} className={t.role === 'user' ? 't-user' : 't-assistant'}>{t.content}</div>)}
              </div>
            ) : <p className="muted small">No transcript saved for this lead.</p>}
          </section>
        </div>

        <div style={{ display: 'grid', gap: 18 }}>
          <section className="panel">
            <h2>Contact</h2>
            <dl className="stat-list" style={{ marginTop: 8 }}>
              <div><dt>Phone</dt><dd>{l.contact?.phone ? <a href={`tel:${l.contact.phone}`}>{l.contact.phone}</a> : '—'}</dd></div>
              <div><dt>Email</dt><dd>{l.contact?.email ? <a href={`mailto:${l.contact.email}`}>{l.contact.email}</a> : '—'}</dd></div>
              {l.contact?.company ? <div><dt>Company</dt><dd>{l.contact.company}</dd></div> : null}
              <div><dt>Consent to call and text</dt><dd>{l.consent ? 'Yes, recorded' : 'No — email only'}</dd></div>
              <div><dt>Language</dt><dd>{LANG_LABEL[l.preferred_language || 'en'] || l.preferred_language}</dd></div>
              <div><dt>Best time to call</dt><dd>{l.best_callback_time || '—'}</dd></div>
              <div><dt>Partner</dt><dd>{l.partner_ref || 'Direct (website)'}</dd></div>
              <div><dt>Routed to</dt><dd>{l.broker || '—'}</dd></div>
            </dl>
          </section>

          <section className="panel">
            <h2>Update lead</h2>
            <form action={updateLead} style={{ marginTop: 10 }}>
              <input type="hidden" name="id" value={l.id} />
              <fieldset disabled={sample} style={{ border: 0, padding: 0, margin: 0 }}>
                <label className="field">Status
                  <select name="status" defaultValue={l.status}>{STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}</select>
                </label>
                <label className="field">Account executive
                  <input name="assigned_to" defaultValue={l.assigned_to || ''} placeholder="Name" />
                </label>
                {!l.first_contacted_at ? <label className="check"><input type="checkbox" name="mark_contacted" value="1" /> Mark first contact made now</label> : null}
                <label className="field">Funded amount ($)
                  <input name="funded_amount" inputMode="decimal" defaultValue={l.funded_amount ?? ''} placeholder={d.loan_amount ? String(d.loan_amount) : 'e.g. 750000'} />
                </label>
                <p className="fee-calc">Fee = {pct(FEE_RATE, 2)} × funded amount. On {money(l.funded_amount ?? d.loan_amount, false)} that is <strong>{money((l.funded_amount ?? d.loan_amount ?? 0) * FEE_RATE, false)}</strong>.</p>
                <label className="field">Lost reason (if lost)
                  <input name="lost_reason" defaultValue={l.lost_reason || ''} list="lost-reasons" />
                  <datalist id="lost-reasons">
                    <option value="Rate or terms" /><option value="Went with another lender" /><option value="Outside lending box" /><option value="No response" /><option value="Deal fell through" />
                  </datalist>
                </label>
                <label className="field">Add a note
                  <textarea name="note" placeholder="Call notes, documents received, next step…" />
                </label>
                <button className="btn-adm" type="submit">Save changes</button>
              </fieldset>
            </form>
          </section>

          <section className="panel">
            <h2>History</h2>
            {events.length ? (
              <ol className="timeline" style={{ marginTop: 10 }}>
                {events.map((e) => (
                  <li key={e.id}>
                    <div>
                      {e.kind === 'status' ? <>Status: {STATUS_LABEL[e.from_status!] || e.from_status} → <strong>{STATUS_LABEL[e.to_status!] || e.to_status}</strong></> : e.body}
                      <time>{new Date(e.created_at).toLocaleString('en-US')}</time>
                    </div>
                  </li>
                ))}
              </ol>
            ) : <p className="muted small" style={{ marginTop: 8 }}>No changes yet. Updates and notes you save appear here.</p>}
          </section>
        </div>
      </div>
    </>
  );
}
