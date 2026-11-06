import { LENDER } from '@/lib/config.ts';
import { getLine, getSetting, friendlyPhoneError, tw, voiceConfigured, VOICE_AGENT_ID } from '@/lib/voice.ts';
import { buyNumber, connectDelivery, reconnectNumber, releaseNumber } from '@/lib/phone-actions.ts';

export const dynamic = 'force-dynamic';

type SP = Promise<{ area?: string; msg?: string; err?: string }>;
type Avail = { number: string; pretty: string; city: string };

const pretty = (n: string) => n.replace(/^\+1(\d{3})(\d{3})(\d{4})$/, '($1) $2-$3');

async function search(area: string): Promise<{ list: Avail[]; error?: string }> {
  try {
    const q = new URLSearchParams({ VoiceEnabled: 'true', PageSize: '6', ...(area.length === 3 ? { AreaCode: area } : {}) });
    const r = await tw<{ available_phone_numbers?: { phone_number: string; friendly_name: string; locality?: string; region?: string }[] }>(
      `/AvailablePhoneNumbers/US/Local.json?${q}`,
    );
    return {
      list: (r.available_phone_numbers || []).map((n) => ({ number: n.phone_number, pretty: n.friendly_name, city: [n.locality, n.region].filter(Boolean).join(', ') })),
    };
  } catch (e) {
    return { list: [], error: friendlyPhoneError((e as Error).message) };
  }
}

export default async function PhonePage({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const cfg = voiceConfigured();
  const [line, webhookId] = await Promise.all([getLine(), getSetting('xi_webhook_id')]);
  const area = String(sp.area || '').replace(/\D/g, '').slice(0, 3);
  const found = !line && cfg.twilio && sp.area !== undefined ? await search(area) : null;

  return (
    <>
      <header className="adm-head">
        <div>
          <h1>Phone line</h1>
          <p>Lenders keep their office number and forward missed or after-hours calls here. The {LENDER.name} voice agent answers, and every call lands in Leads.</p>
        </div>
      </header>

      {sp.msg ? <div className="banner banner-info"><span>{sp.msg}</span></div> : null}
      {sp.err ? <div className="banner banner-sample"><span><strong>Not done.</strong> {sp.err}</span></div> : null}

      <div style={{ display: 'grid', gap: 18 }}>
        <section className="panel">
          <h2>1. Call delivery</h2>
          {webhookId ? (
            <p className="muted">Connected. Finished calls arrive as leads within a minute, scored and routed like chat leads.</p>
          ) : (
            <>
              <p className="muted">Connect once so finished calls become leads. {cfg.elevenlabs ? '' : 'Add ELEVENLABS_API_KEY in Vercel first.'}</p>
              <form action={connectDelivery}><button className="btn-adm" type="submit" disabled={!cfg.elevenlabs || !cfg.database}>Connect call delivery</button></form>
            </>
          )}
          <p className="muted" style={{ fontSize: 13 }}>Voice agent: {VOICE_AGENT_ID}</p>
        </section>

        <section className="panel">
          <h2>2. Phone number</h2>
          {line ? (
            <>
              <p style={{ fontSize: 28, fontWeight: 600, margin: '6px 0' }}>{pretty(line.number)}</p>
              <p className="muted">Live since {new Date(line.since).toLocaleDateString('en-US')}. Call it yourself once before anyone forwards a line to it.</p>
              <form action={reconnectNumber} style={{ display: 'inline' }}><button className="btn-adm ghost" type="submit">Reconnect to the agent</button></form>
              <details style={{ marginTop: 12 }}>
                <summary className="muted">Release this number</summary>
                <form action={releaseNumber} style={{ display: 'flex', gap: 8, marginTop: 8, alignItems: 'center' }}>
                  <input name="confirm" placeholder="Type RELEASE" aria-label="Type RELEASE to confirm" className="field" />
                  <button className="btn-adm ghost" type="submit">Release</button>
                </form>
              </details>
            </>
          ) : !cfg.twilio ? (
            <p className="muted">Add TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN in Vercel (Sensitive), redeploy, then come back to pick a number.</p>
          ) : (
            <>
              <form method="get" style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                <label htmlFor="area" className="muted">Area code</label>
                <input id="area" name="area" defaultValue={area} inputMode="numeric" maxLength={3} placeholder="213" className="field" style={{ width: 90 }} />
                <button className="btn-adm ghost" type="submit">Search</button>
              </form>
              {found?.error ? <p className="err">{found.error}</p> : null}
              {found && !found.error && !found.list.length ? <p className="muted">No numbers in that area code right now. Try a nearby one.</p> : null}
              {found?.list.length ? (
                <form action={buyNumber} style={{ marginTop: 12, display: 'grid', gap: 8 }}>
                  {found.list.map((n, i) => (
                    <label key={n.number} style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                      <input type="radio" name="number" value={n.number} defaultChecked={i === 0} />
                      <span><strong>{n.pretty}</strong> <span className="muted">{n.city}</span></span>
                    </label>
                  ))}
                  <p className="muted" style={{ fontSize: 13 }}>Buying adds a monthly number fee on your Twilio account, plus per-minute Twilio and ElevenLabs charges for calls.</p>
                  <div><button className="btn-adm" type="submit">Get this number</button></div>
                </form>
              ) : null}
            </>
          )}
        </section>

        <section className="panel">
          <h2>3. Forwarding steps to send the lender</h2>
          <p className="muted">They keep their office number and tell their phone company to forward calls to {line ? <strong>{pretty(line.number)}</strong> : 'the new number'}:</p>
          <ul style={{ fontSize: 14, paddingInlineStart: 18 }}>
            <li><strong>When nobody picks up</strong> (“forward on no answer”, after about 4 rings): staff answer as usual; missed calls go to the agent.</li>
            <li><strong>After hours</strong>: every call outside office hours goes to the agent.</li>
            <li><strong>Business phone system</strong> (RingCentral, Nextiva, 8x8, Spectrum or Comcast Business): admin portal → call handling for the main line → forward to an external number on no answer and after hours.</li>
            <li><strong>Cell phone</strong>: Verizon, dial *71 and the 10-digit number (no answer/busy). AT&amp;T or T-Mobile, dial **61*1 and the number, then #. Codes vary by plan; the carrier can confirm.</li>
          </ul>
          <p className="muted" style={{ fontSize: 13 }}>The agent says it is an AI and that the call is recorded and transcribed, never quotes a rate, and never asks for Social Security, bank or card numbers. Callback consent is recorded as a verbal yes for return calls only, not texts.</p>
        </section>
      </div>
    </>
  );
}
