'use client';

// Lending Desk's own live voice desk: a branded launcher and console. It talks to the private
// Lending Desk voice agent through /api/voice/session and our self-hosted voice module, so
// visitors never see a third-party widget or brand.
import { useCallback, useEffect, useRef, useState } from 'react';
import type { Lang } from '@/lib/i18n.ts';

type Msg = { src: 'ai' | 'user'; text: string };
type State = 'idle' | 'connecting' | 'live' | 'ending';
type Conv = {
  endSession: () => Promise<void>;
  setMicMuted: (m: boolean) => void;
  getInputVolume: () => number;
  getOutputVolume: () => number;
};

const T: Record<Lang, Record<string, string>> = {
  en: { launch: 'Talk live with the lending desk', title: 'Live lending desk', sub: 'AI voice assistant · an account executive follows up', start: 'Start talking', end: 'End', mute: 'Mute', unmute: 'Unmute', connecting: 'Connecting…', listening: 'Listening', speaking: 'Speaking', ended: 'Conversation ended. An account executive will follow up.', mic: 'Allow microphone access to talk, or use the chat instead.', error: 'The live desk isn’t available right now. Please use the chat.', notice: 'You’re speaking with an AI assistant. The conversation is recorded and transcribed so an account executive can follow up. It never quotes rates or approves loans, and never needs your Social Security or bank numbers.', close: 'Close' },
  es: { launch: 'Hable en vivo con la mesa de préstamos', title: 'Mesa de préstamos en vivo', sub: 'Asistente de voz con IA · un ejecutivo le dará seguimiento', start: 'Empezar a hablar', end: 'Terminar', mute: 'Silenciar', unmute: 'Activar', connecting: 'Conectando…', listening: 'Escuchando', speaking: 'Hablando', ended: 'Conversación terminada. Un ejecutivo le dará seguimiento.', mic: 'Permita el micrófono para hablar, o use el chat.', error: 'La mesa en vivo no está disponible ahora. Use el chat, por favor.', notice: 'Está hablando con un asistente de IA. La conversación se graba y transcribe para que un ejecutivo le dé seguimiento. Nunca cotiza tasas ni aprueba préstamos, y nunca necesita su número de Seguro Social ni de cuenta.', close: 'Cerrar' },
  fa: { launch: 'گفتگوی زنده با میز وام', title: 'میز وام زنده', sub: 'دستیار صوتی هوش مصنوعی · کارشناس پیگیری می‌کند', start: 'شروع گفتگو', end: 'پایان', mute: 'بی‌صدا', unmute: 'صدا', connecting: 'در حال اتصال…', listening: 'در حال شنیدن', speaking: 'در حال صحبت', ended: 'گفتگو پایان یافت. کارشناس با شما تماس می‌گیرد.', mic: 'برای گفتگو اجازه میکروفون بدهید، یا از چت استفاده کنید.', error: 'میز زنده اکنون در دسترس نیست. لطفاً از چت استفاده کنید.', notice: 'شما با یک دستیار هوش مصنوعی صحبت می‌کنید. گفتگو ضبط و رونویسی می‌شود تا کارشناس پیگیری کند. هرگز نرخ اعلام نمی‌کند، وام تأیید نمی‌کند و شماره تأمین اجتماعی یا حساب بانکی نمی‌خواهد.', close: 'بستن' },
  de: { launch: 'Live mit dem Kreditteam sprechen', title: 'Kreditteam live', sub: 'KI-Sprachassistent · ein Account Executive meldet sich', start: 'Gespräch starten', end: 'Beenden', mute: 'Stumm', unmute: 'Ton an', connecting: 'Verbinde…', listening: 'Hört zu', speaking: 'Spricht', ended: 'Gespräch beendet. Ein Account Executive meldet sich.', mic: 'Erlauben Sie das Mikrofon oder nutzen Sie den Chat.', error: 'Das Live-Team ist gerade nicht erreichbar. Bitte nutzen Sie den Chat.', notice: 'Sie sprechen mit einem KI-Assistenten. Das Gespräch wird aufgezeichnet und transkribiert, damit sich ein Account Executive meldet. Er nennt keine Zinssätze, genehmigt keine Kredite und braucht nie Sozialversicherungs- oder Kontonummern.', close: 'Schließen' },
  zh: { launch: '与贷款服务台实时通话', title: '实时贷款服务台', sub: 'AI 语音助手 · 客户经理会跟进', start: '开始通话', end: '结束', mute: '静音', unmute: '取消静音', connecting: '正在连接…', listening: '正在聆听', speaking: '正在说话', ended: '通话已结束。客户经理会与您联系。', mic: '请允许使用麦克风，或改用聊天。', error: '实时服务台暂时不可用，请使用聊天。', notice: '您正在与 AI 助手交谈。通话会被录音和转写，以便客户经理跟进。它不会报出利率或批准贷款，也绝不需要您的社会安全号或银行账号。', close: '关闭' },
};

export default function LiveVoice({ lang }: { lang: Lang }) {
  const t = T[lang] || T.en;
  const [open, setOpen] = useState(false);
  const [state, setState] = useState<State>('idle');
  const [mode, setMode] = useState<'listening' | 'speaking'>('listening');
  const [muted, setMuted] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [note, setNote] = useState('');
  const conv = useRef<Conv | null>(null);
  const orb = useRef<HTMLDivElement>(null);
  const log = useRef<HTMLDivElement>(null);

  // Other parts of the page can open the desk: window.dispatchEvent(new Event('ld:live'))
  useEffect(() => {
    const show = () => setOpen(true);
    window.addEventListener('ld:live', show);
    return () => window.removeEventListener('ld:live', show);
  }, []);

  useEffect(() => { log.current?.scrollTo({ top: log.current.scrollHeight, behavior: 'smooth' }); }, [msgs]);

  // The orb breathes with the voices.
  useEffect(() => {
    if (state !== 'live') return;
    let raf = 0;
    const tick = () => {
      const c = conv.current;
      if (c && orb.current) {
        const v = Math.min(1, Math.max(c.getOutputVolume?.() || 0, (c.getInputVolume?.() || 0) * 0.8));
        orb.current.style.setProperty('--lv', v.toFixed(3));
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [state]);

  const start = useCallback(async () => {
    setNote(''); setMsgs([]); setState('connecting');
    try {
      const r = await fetch('/api/voice/session', { cache: 'no-store' });
      const j = await r.json().catch(() => ({}));
      if (!r.ok || !j.token) throw new Error('unavailable');
      const mod = await import(/* webpackIgnore: true */ '/vendor/voice.js' as string);
      conv.current = await mod.Conversation.startSession({
        conversationToken: j.token,
        connectionType: 'webrtc',
        onConnect: () => { setMuted(false); setMode('listening'); setState('live'); },
        onDisconnect: () => { conv.current = null; setState('idle'); setNote(t.ended); },
        onModeChange: (p: { mode: string }) => setMode(p.mode === 'speaking' ? 'speaking' : 'listening'),
        onMessage: (p: { message?: string; source?: string }) => {
          if (p?.message) setMsgs((m) => [...m, { src: p.source === 'ai' ? 'ai' : 'user', text: p.message! }]);
        },
        onError: (m: unknown) => console.warn('[lending-desk voice]', m),
      });
    } catch (e) {
      conv.current = null;
      const denied = e instanceof Error && (e.name === 'NotAllowedError' || /permission|denied/i.test(e.message));
      setNote(denied ? t.mic : t.error);
      setState('idle');
    }
  }, [t]);

  const stop = useCallback(async () => {
    if (!conv.current) return;
    setState('ending');
    try { await conv.current.endSession(); } catch {}
    conv.current = null;
    setState('idle');
    setNote(t.ended);
  }, [t]);

  useEffect(() => {
    const bye = () => { try { conv.current?.endSession(); } catch {} };
    window.addEventListener('pagehide', bye);
    return () => window.removeEventListener('pagehide', bye);
  }, []);

  const toggleMute = () => {
    if (!conv.current) return;
    const m = !muted; setMuted(m);
    try { conv.current.setMicMuted(m); } catch {}
  };

  const status = state === 'connecting' ? t.connecting : state === 'live' ? (mode === 'speaking' ? t.speaking : t.listening) : '';

  return (
    <>
      {!open ? (
        <button type="button" className="lv-launch" onClick={() => setOpen(true)} aria-haspopup="dialog">
          <span className="lv-dot" aria-hidden="true" />
          {t.launch}
        </button>
      ) : null}
      {open ? (
        <section className="lv-panel" role="dialog" aria-label={t.title} data-state={state}>
          <header className="lv-head">
            <div>
              <strong>{t.title}</strong>
              <span>{t.sub}</span>
            </div>
            <button type="button" className="lv-x" aria-label={t.close} onClick={() => { if (state === 'live') stop(); setOpen(false); }}>×</button>
          </header>
          <div className="lv-stage">
            <div ref={orb} className={`lv-orb${state === 'live' ? ' on' : ''}${mode === 'speaking' ? ' speaking' : ''}`} aria-hidden="true">
              <span /><span /><span />
            </div>
            <p className="lv-status" aria-live="polite">{status}</p>
          </div>
          {msgs.length ? (
            <div className="lv-log" ref={log} aria-live="polite">
              {msgs.slice(-12).map((m, i) => <p key={i} className={m.src}>{m.text}</p>)}
            </div>
          ) : (
            <p className="lv-notice">{t.notice}</p>
          )}
          {note ? <p className="lv-note">{note}</p> : null}
          <div className="lv-actions">
            {state === 'live' || state === 'ending' ? (
              <>
                <button type="button" className="btn btn-line lv-btn" onClick={toggleMute}>{muted ? t.unmute : t.mute}</button>
                <button type="button" className="btn btn-gold lv-btn" onClick={stop} disabled={state === 'ending'}>{t.end}</button>
              </>
            ) : (
              <button type="button" className="btn btn-gold lv-btn" onClick={start} disabled={state === 'connecting'}>
                {state === 'connecting' ? t.connecting : t.start}
              </button>
            )}
          </div>
        </section>
      ) : null}
    </>
  );
}
