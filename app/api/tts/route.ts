import { isLang, type Lang } from '@/lib/i18n.ts';

export const runtime = 'nodejs';
export const maxDuration = 30;

// Native-speaker ElevenLabs voices per language; each can be overridden with an env var.
const VOICES: Record<Lang, string> = {
  en: process.env.VOICE_EN || 'l4Coq6695JDX9xtLqXDE', // Lauren B: warm, humanlike, conversational
  es: process.env.VOICE_ES || 'kcQkGnn0HAT2JRDQ4Ljp', // Norah: neutral Latin American, customer service
  fa: process.env.VOICE_FA || 'RBEKbcQ62sKk2tsmPsAU', // Sara: native Tehrani Persian
  de: process.env.VOICE_DE || 'NbcmfEb55Wznc9QUicaX', // Jones: native German voice agent
  zh: process.env.VOICE_ZH || 'UFDAUkGzdLAEJlINT3Fx', // Lin: native Mandarin, conversational
};
const FALLBACK_VOICE = process.env.VOICE_FALLBACK || VOICES.en;
// eleven_v4_turbo: ~100 ms, 90+ languages including Persian.
const MODEL = process.env.ELEVENLABS_MODEL || 'eleven_v4_turbo';

// How the voice delivers each tone the agent picks (slower and steadier when someone is under stress).
const DELIVERY: Record<string, { stability: number; style: number; speed: number }> = {
  reassuring: { stability: 0.62, style: 0.18, speed: 0.92 },
  calm: { stability: 0.68, style: 0.1, speed: 0.95 },
  warm: { stability: 0.5, style: 0.25, speed: 1.0 },
  upbeat: { stability: 0.42, style: 0.38, speed: 1.04 },
};

async function synth(voice: string, text: string, lang: Lang, key: string, tone = 'warm') {
  const d = DELIVERY[tone] || DELIVERY.warm;
  return fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voice}/stream?output_format=mp3_44100_128`, {
    method: 'POST',
    headers: { 'xi-api-key': key, 'Content-Type': 'application/json', Accept: 'audio/mpeg' },
    body: JSON.stringify({
      text,
      model_id: MODEL,
      language_code: lang,
      voice_settings: { stability: d.stability, similarity_boost: 0.8, style: d.style, use_speaker_boost: true, speed: d.speed },
    }),
    signal: AbortSignal.timeout(20000),
  });
}

export async function POST(req: Request) {
  const key = process.env.ELEVENLABS_API_KEY;
  if (!key) return new Response('voice not configured', { status: 503 });

  // Only the site's own pages may use the voice (keeps the key's credits from being drained).
  const origin = req.headers.get('origin');
  const host = req.headers.get('host');
  if (origin && host && new URL(origin).host !== host) return new Response('forbidden', { status: 403 });

  let body: { text?: string; lang?: string; tone?: string };
  try {
    body = await req.json();
  } catch {
    return new Response('bad json', { status: 400 });
  }
  const text = (body.text || '').replace(/\*\*/g, '').replace(/^[-*•]\s+/gm, '').trim().slice(0, 1200);
  if (!text) return new Response('empty', { status: 400 });
  const lang: Lang = isLang(body.lang) ? body.lang : 'en';

  const tone = typeof body.tone === 'string' ? body.tone : 'warm';
  let res = await synth(VOICES[lang], text, lang, key, tone).catch(() => null);
  if (!res || !res.ok) {
    // Voice not in this account (or a hiccup): fall back to the default multilingual voice.
    res = await synth(FALLBACK_VOICE, text, lang, key, tone).catch(() => null);
  }
  if (!res || !res.ok || !res.body) {
    const detail = res ? await res.text().catch(() => '') : 'network error';
    console.error('tts failed', res?.status, detail.slice(0, 300));
    return new Response('voice unavailable', { status: 502 });
  }
  return new Response(res.body, { headers: { 'Content-Type': 'audio/mpeg', 'Cache-Control': 'no-store' } });
}
