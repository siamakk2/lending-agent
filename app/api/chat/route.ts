import { chat, type ChatTurn } from '@/lib/agent.ts';
import { isLang } from '@/lib/i18n.ts';

export const runtime = 'nodejs';
export const maxDuration = 60;

export async function POST(req: Request) {
  let body: { messages?: ChatTurn[]; sessionId?: string; consent?: boolean; source?: string; lang?: string; voice?: boolean };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: 'bad json' }, { status: 400 });
  }
  const messages = (body.messages || []).filter(
    (m) => (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string' && m.content.length <= 4000,
  );
  if (!messages.length || messages[messages.length - 1].role !== 'user') {
    return Response.json({ error: 'last message must be from the user' }, { status: 400 });
  }
  if (!process.env.ANTHROPIC_API_KEY) {
    return Response.json({ reply: 'The assistant is not configured yet (missing ANTHROPIC_API_KEY).' }, { status: 503 });
  }

  try {
    const { reply, events } = await chat(messages, {
      sessionId: String(body.sessionId || crypto.randomUUID()).slice(0, 64),
      consent: body.consent === true,
      lang: isLang(body.lang) ? body.lang : 'en',
      voice: body.voice === true,
      channel: 'chat',
      source: body.source?.slice(0, 200),
      ip: req.headers.get('x-forwarded-for')?.split(',')[0]?.trim(),
      userAgent: req.headers.get('user-agent')?.slice(0, 300) || undefined,
    });
    return Response.json({ reply, events });
  } catch (e) {
    console.error('chat error', e);
    return Response.json({ reply: 'Sorry, something went wrong on our side. Please try again in a moment.' }, { status: 500 });
  }
}
