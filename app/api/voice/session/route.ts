// Starts one live voice conversation for a website visitor. The voice agent stays private:
// the browser only ever gets a short-lived conversation token from this endpoint.
import { NextResponse } from 'next/server';
import { SITE_URL, VOICE_AGENT_ID, xi } from '@/lib/voice.ts';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function hostOf(u: string) {
  try { return new URL(u).hostname.replace(/^www\./, '').toLowerCase(); } catch { return ''; }
}

export async function GET(request: Request) {
  // Only our own pages (and the /widget iframe partners embed, which runs on our domain) may start calls.
  const from = request.headers.get('origin') || request.headers.get('referer') || '';
  const host = hostOf(from);
  const ok = host === hostOf(SITE_URL) || host === 'lendingdesk.app' || host.endsWith('.vercel.app') || host === 'localhost';
  if (!ok) return NextResponse.json({ error: 'not_allowed' }, { status: 403 });
  if (!process.env.ELEVENLABS_API_KEY) return NextResponse.json({ error: 'unavailable' }, { status: 503 });
  try {
    const t = await xi<{ token: string }>(`/v1/convai/conversation/token?agent_id=${encodeURIComponent(VOICE_AGENT_ID)}`);
    return NextResponse.json({ token: t.token }, { headers: { 'cache-control': 'no-store' } });
  } catch (e) {
    console.error('voice session', (e as Error).message);
    return NextResponse.json({ error: 'unavailable' }, { status: 502 });
  }
}
