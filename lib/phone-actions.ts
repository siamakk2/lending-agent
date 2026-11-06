'use server';

import { redirect } from 'next/navigation';
import { isAdmin } from './admin-auth.ts';
import { LENDER } from './config.ts';
import { SITE_URL, VOICE_AGENT_ID, friendlyPhoneError, getLine, setSetting, tw, xi } from './voice.ts';

const back = (q: Record<string, string>) => redirect(`/admin/phone?${new URLSearchParams(q)}`);

/** Create the post-call webhook and attach it to the Lending Desk voice agent. */
export async function connectDelivery() {
  if (!(await isAdmin())) redirect('/admin/login');
  let msg = '';
  try {
    const created = await xi<{ webhook_id: string; webhook_secret: string }>('/v1/workspace/webhooks', {
      method: 'POST',
      body: { settings: { auth_type: 'hmac', name: `${LENDER.name} phone leads`, webhook_url: `${SITE_URL}/api/voice/webhook` } },
    });
    if (!created?.webhook_id || !created?.webhook_secret) throw new Error('No webhook secret was returned');
    await setSetting('xi_webhook_secret', created.webhook_secret);
    await setSetting('xi_webhook_id', created.webhook_id);
    await xi(`/v1/convai/agents/${VOICE_AGENT_ID}`, {
      method: 'PATCH',
      body: { platform_settings: { workspace_overrides: { webhooks: { post_call_webhook_id: created.webhook_id, events: ['transcript'] } } } },
    });
    msg = 'Call delivery is connected. Every finished call now becomes a lead.';
  } catch (e) {
    back({ err: `Couldn’t connect call delivery: ${(e as Error).message.slice(0, 200)}` });
  }
  back({ msg });
}

/** Buy a local number, connect it to the voice agent, and remember it. */
export async function buyNumber(form: FormData) {
  if (!(await isAdmin())) redirect('/admin/login');
  const number = String(form.get('number') || '');
  if (!/^\+1\d{10}$/.test(number)) back({ err: 'Pick a number from the list.' });
  if (await getLine()) back({ err: 'There is already a phone line. Release it first to pick a different number.' });
  let msg = '';
  try {
    const bought = await tw<{ sid: string; phone_number: string }>('/IncomingPhoneNumbers.json', {
      method: 'POST',
      form: { PhoneNumber: number, FriendlyName: `${LENDER.name} phone`.slice(0, 64) },
    });
    let xiId = '';
    try {
      const imported = await xi<{ phone_number_id: string }>('/v1/convai/phone-numbers', {
        method: 'POST',
        body: {
          phone_number: bought.phone_number, label: `${LENDER.name} phone`.slice(0, 80),
          sid: process.env.TWILIO_ACCOUNT_SID, token: process.env.TWILIO_AUTH_TOKEN, provider: 'twilio',
        },
      });
      xiId = imported.phone_number_id;
      await xi(`/v1/convai/phone-numbers/${xiId}`, { method: 'PATCH', body: { agent_id: VOICE_AGENT_ID } });
    } catch (e) {
      // Don't leave a paid number dangling if the voice side failed.
      await tw(`/IncomingPhoneNumbers/${bought.sid}.json`, { method: 'DELETE' }).catch(() => {});
      throw e;
    }
    await setSetting('phone_line', JSON.stringify({ number: bought.phone_number, twilio_sid: bought.sid, xi_id: xiId, since: new Date().toISOString() }));
    msg = `Your phone line ${bought.phone_number} is live and answers with the Lending Desk voice agent.`;
  } catch (e) {
    back({ err: friendlyPhoneError((e as Error).message) });
  }
  back({ msg });
}

/** Re-attach the number to the agent (if someone changed it in ElevenLabs). */
export async function reconnectNumber() {
  if (!(await isAdmin())) redirect('/admin/login');
  const line = await getLine();
  if (!line) back({ err: 'There is no phone line yet.' });
  try {
    await xi(`/v1/convai/phone-numbers/${line!.xi_id}`, { method: 'PATCH', body: { agent_id: VOICE_AGENT_ID } });
  } catch (e) {
    back({ err: (e as Error).message.slice(0, 200) });
  }
  back({ msg: 'The number is connected to the voice agent again.' });
}

/** Give the number back. Calls forwarded to it stop working. */
export async function releaseNumber(form: FormData) {
  if (!(await isAdmin())) redirect('/admin/login');
  if (form.get('confirm') !== 'RELEASE') back({ err: 'Type RELEASE to confirm.' });
  const line = await getLine();
  if (line) {
    await xi(`/v1/convai/phone-numbers/${line.xi_id}`, { method: 'DELETE' }).catch(() => {});
    await tw(`/IncomingPhoneNumbers/${line.twilio_sid}.json`, { method: 'DELETE' }).catch(() => {});
    await setSetting('phone_line', null);
  }
  back({ msg: 'The phone line was released.' });
}
