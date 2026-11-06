// ElevenLabs post-call webhook: every finished phone call to the Lending Desk voice agent becomes a lead.
import { NextResponse } from 'next/server';
import { db } from '@/lib/db.ts';
import { saveLead, saveTranscript } from '@/lib/leads.ts';
import { VOICE_AGENT_ID, getSetting, leadFromCall, verifySignature, voiceConsentText, type VoiceCall } from '@/lib/voice.ts';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const raw = await request.text();
  const secret = await getSetting('xi_webhook_secret');
  const ok = secret && (await verifySignature(raw, request.headers.get('elevenlabs-signature') || '', secret));
  if (!ok) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  let evt: { type?: string; data?: VoiceCall };
  try { evt = JSON.parse(raw); } catch { return NextResponse.json({ error: 'bad_json' }, { status: 400 }); }
  const call = evt.data;
  if (evt.type !== 'post_call_transcription' || !call?.conversation_id) return NextResponse.json({ ok: true, ignored: true });
  if (call.agent_id !== VOICE_AGENT_ID) return NextResponse.json({ ok: true, ignored: 'other_agent' });

  const sessionId = `voice:${call.conversation_id}`;
  const supa = db();
  // Webhooks can be retried: one lead per call.
  if (supa) {
    const { data: seen } = await supa.from('la_conversations').select('lead_id').eq('session_id', sessionId).maybeSingle();
    if (seen?.lead_id) return NextResponse.json({ ok: true, duplicate: true });
  }

  const { input, empty } = leadFromCall(call);
  const transcript = (call.transcript || [])
    .filter((t) => (t.message || '').trim())
    .map((t) => ({ role: t.role === 'agent' ? 'assistant' : 'user', content: t.message, t: t.time_in_call_secs ?? null }));
  await saveTranscript(sessionId, transcript, 'voice', input.preferred_language || 'en');
  if (empty) return NextResponse.json({ ok: true, stored: 'transcript_only' });

  const r = await saveLead(input, {
    sessionId,
    channel: 'voice',
    source: 'phone',
    consentText: voiceConsentText(call.conversation_id),
    consentChannels: ['voice'],
    consentLabel: 'yes, verbal on recorded call (return calls only, no texts)',
  });
  if (!r.ok) {
    console.error('voice lead', r.error);
    return NextResponse.json({ error: 'save_failed' }, { status: 500 });
  }
  return NextResponse.json({ ok: true, lead_id: r.lead_id, tier: r.tier });
}
