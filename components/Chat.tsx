'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Markdown, { toSpeech } from './Markdown.tsx';
import { DICT, LANG_META, type Lang } from '@/lib/i18n.ts';

type Turn = { role: 'user' | 'assistant'; content: string };

// Minimal typing for the browser speech APIs (not in every TS lib).
type Recognition = {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  start: () => void;
  stop: () => void;
  onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }> & { isFinal: boolean }> }) => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
};

function getRecognition(): (new () => Recognition) | null {
  if (typeof window === 'undefined') return null;
  const w = window as unknown as { SpeechRecognition?: new () => Recognition; webkitSpeechRecognition?: new () => Recognition };
  return w.SpeechRecognition || w.webkitSpeechRecognition || null;
}

// crypto.randomUUID only exists in secure contexts; partner sites on plain http embed us too.
function newId(): string {
  try {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') return crypto.randomUUID();
  } catch {}
  const b = new Uint8Array(16);
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) crypto.getRandomValues(b);
  else for (let i = 0; i < 16; i++) b[i] = Math.floor(Math.random() * 256);
  b[6] = (b[6] & 0x0f) | 0x40;
  b[8] = (b[8] & 0x3f) | 0x80;
  const h = [...b].map((x) => x.toString(16).padStart(2, '0')).join('');
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
}

export default function Chat({ lang, lenderName, compact = false }: { lang: Lang; lenderName: string; compact?: boolean }) {
  const t = DICT[lang].chat;
  const [turns, setTurns] = useState<Turn[]>([{ role: 'assistant', content: t.greeting(lenderName) }]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [consent, setConsent] = useState(false);
  const [voiceOn, setVoiceOn] = useState(false);
  const [listening, setListening] = useState(false);
  const [notice, setNotice] = useState('');
  const sessionId = useRef('');
  const log = useRef<HTMLDivElement>(null);
  const rec = useRef<Recognition | null>(null);
  const voiceRef = useRef(false);
  const turnsRef = useRef(turns);
  turnsRef.current = turns;

  useEffect(() => {
    try {
      sessionId.current = sessionStorage.getItem('la_session') || newId();
      sessionStorage.setItem('la_session', sessionId.current);
    } catch {
      sessionId.current = newId();
    }
  }, []);

  // Before the person has said anything, follow the language switcher.
  useEffect(() => {
    setTurns((cur) => (cur.length === 1 ? [{ role: 'assistant', content: DICT[lang].chat.greeting(lenderName) }] : cur));
  }, [lang, lenderName]);

  useEffect(() => {
    log.current?.scrollTo({ top: log.current.scrollHeight, behavior: 'smooth' });
  }, [turns, busy]);

  const audio = useRef<HTMLAudioElement | null>(null);

  // Browser voice: only used if the natural voice can't be reached.
  const speakBrowser = useCallback(
    (text: string, then: () => void) => {
      if (typeof window === 'undefined' || !('speechSynthesis' in window)) return then();
      const u = new SpeechSynthesisUtterance(toSpeech(text));
      u.lang = LANG_META[lang].speech;
      const v = window.speechSynthesis.getVoices().find((x) => x.lang.toLowerCase().startsWith(lang));
      if (v) u.voice = v;
      u.onend = then;
      u.onerror = then;
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(u);
    },
    [lang],
  );

  const speak = useCallback(
    async (text: string, then: () => void, tone = 'warm') => {
      try {
        const res = await fetch('/api/tts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: toSpeech(text), lang, tone }),
        });
        if (!res.ok) throw new Error(String(res.status));
        const url = URL.createObjectURL(await res.blob());
        audio.current?.pause();
        const a = new Audio(url);
        audio.current = a;
        const done = () => {
          URL.revokeObjectURL(url);
          then();
        };
        a.onended = done;
        a.onerror = done;
        await a.play();
      } catch {
        speakBrowser(text, then);
      }
    },
    [lang, speakBrowser],
  );

  const listen = useCallback(() => {
    const R = getRecognition();
    if (!R) return;
    const r = new R();
    r.lang = LANG_META[lang].speech;
    r.interimResults = false;
    r.continuous = false;
    let heard = '';
    r.onresult = (e) => {
      for (let i = 0; i < e.results.length; i++) if (e.results[i].isFinal) heard += e.results[i][0].transcript;
    };
    r.onend = () => {
      setListening(false);
      if (heard.trim()) void send(heard, true);
      else if (voiceRef.current) setVoiceOn(false), (voiceRef.current = false);
    };
    r.onerror = () => setListening(false);
    rec.current = r;
    setListening(true);
    r.start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang]);

  async function send(text: string, viaVoice = false) {
    const content = text.trim();
    if (!content || busy) return;
    const next = [...turnsRef.current, { role: 'user' as const, content }];
    setTurns(next);
    setInput('');
    setBusy(true);
    setNotice('');
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: next.slice(1), sessionId: sessionId.current, consent, lang, voice: viaVoice, source: window.location.href }),
      });
      const data = await res.json();
      const reply = data.reply || t.error;
      setTurns((cur) => [...cur, { role: 'assistant', content: reply }]);
      if (viaVoice && voiceRef.current) void speak(reply, () => voiceRef.current && listen(), data.tone);
    } catch {
      setNotice(t.error);
    } finally {
      setBusy(false);
    }
  }

  function toggleVoice() {
    if (voiceOn) {
      voiceRef.current = false;
      setVoiceOn(false);
      rec.current?.stop();
      audio.current?.pause();
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
      return;
    }
    if (!getRecognition()) {
      setNotice(t.voiceUnsupported);
      return;
    }
    voiceRef.current = true;
    setVoiceOn(true);
    listen();
  }

  return (
    <section className={`desk${compact ? ' desk-compact' : ''}`} aria-label={t.title}>
      <header className="desk-head">
        <div>
          <h2 className="desk-title">{t.title}</h2>
          <p className="desk-sub">{t.sub}</p>
        </div>
        <span className="desk-ai" title="AI">AI</span>
      </header>

      <div className="desk-log" ref={log} aria-live="polite">
        {turns.map((m, i) => (
          <div key={i} className={`msg msg-${m.role}`}>
            <Markdown text={m.content} />
          </div>
        ))}
        {turns.length === 1 && (
          <div className="starters">
            {t.starters.map((s) => (
              <button type="button" key={s} onClick={() => send(s)}>
                {s}
              </button>
            ))}
          </div>
        )}
        {busy && (
          <div className="msg msg-assistant msg-wait">
            <span className="dots" aria-label={t.thinking} />
          </div>
        )}
      </div>

      <button type="button" className={`talk${voiceOn ? ' talk-on' : ''}`} onClick={toggleVoice} aria-pressed={voiceOn}>
        <span className="talk-icon" aria-hidden="true" />
        {voiceOn ? (listening ? t.listening : t.stop) : t.talk}
      </button>

      <form
        className="desk-input"
        onSubmit={(e) => {
          e.preventDefault();
          void send(input);
        }}
      >
        <input value={input} onChange={(e) => setInput(e.target.value)} placeholder={t.placeholder} aria-label={t.placeholder} maxLength={2000} />
        <button type="submit" disabled={busy || !input.trim()}>
          {t.send}
        </button>
      </form>
      {notice && <p className="desk-notice" role="status">{notice}</p>}

      <label className="desk-consent">
        <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
        <span>{t.consent(lenderName)}</span>
      </label>
      <p className="desk-fine">{t.fine}</p>
    </section>
  );
}
