import { SITE_URL } from '@/lib/seo.ts';

export const revalidate = 86400;

/**
 * Lending Desk embed. Partners paste one line on their site:
 *   <script src="https://www.lendingdesk.app/embed.js" data-partner="YOUR-ID" data-lang="en" async></script>
 * Options (data-*): partner, lang (en|es|fa|de|zh), position (right|left), label, open ("true" to open on load),
 * target (CSS selector: render inline in that element instead of a floating button).
 */
const SCRIPT = String.raw`(function () {
  if (window.__lendingDesk) return;
  window.__lendingDesk = true;
  var ORIGIN = __ORIGIN__;
  var me = document.currentScript || document.querySelector('script[src*="/embed.js"]');
  var ds = (me && me.dataset) || {};
  var LANGS = { en: 'Talk to Lending Desk', es: 'Hable con Lending Desk', fa: 'گفت‌وگو با Lending Desk', de: 'Mit Lending Desk sprechen', zh: '咨询 Lending Desk' };
  var lang = (ds.lang || (navigator.language || 'en').slice(0, 2)).toLowerCase();
  if (!LANGS[lang]) lang = 'en';
  var label = ds.label || LANGS[lang];
  var src = ORIGIN + '/widget?embed=1&lang=' + encodeURIComponent(lang) +
    '&ref=' + encodeURIComponent(ds.partner || '') + '&host=' + encodeURIComponent(location.hostname);

  function frame(h) {
    var f = document.createElement('iframe');
    f.src = src;
    f.title = 'Lending Desk';
    f.allow = 'microphone; autoplay; clipboard-write';
    f.loading = 'lazy';
    f.style.cssText = 'border:0;width:100%;height:' + h + ';display:block;background:#fff;color-scheme:light';
    return f;
  }

  if (ds.target) {
    var t = document.querySelector(ds.target);
    if (t) t.appendChild(frame(ds.height || '680px'));
    return;
  }

  var host = document.createElement('div');
  host.setAttribute('data-lending-desk', '');
  var root = host.attachShadow ? host.attachShadow({ mode: 'open' }) : host;
  var side = ds.position === 'left' ? 'left' : 'right';
  root.innerHTML =
    '<style>' +
    ':host{all:initial}' +
    '.ld-btn{position:fixed;bottom:20px;' + side + ':20px;z-index:2147483646;display:flex;align-items:center;gap:10px;padding:10px 18px 10px 10px;border:1px solid rgba(210,174,99,.7);border-radius:999px;background:#0f1f38;color:#edf1ef;font:600 15px/1 system-ui,-apple-system,"Segoe UI",sans-serif;cursor:pointer;box-shadow:0 14px 34px -10px rgba(4,10,22,.6)}' +
    '.ld-btn:hover{background:#162a4a}' +
    '.ld-btn:focus-visible{outline:2px solid #d2ae63;outline-offset:3px}' +
    '.ld-seal{width:34px;height:34px;flex:none}' +
    '.ld-panel{position:fixed;bottom:84px;' + side + ':20px;z-index:2147483647;width:420px;max-width:calc(100vw - 24px);height:min(680px,calc(100vh - 110px));border-radius:16px;overflow:hidden;box-shadow:0 30px 70px -20px rgba(4,10,22,.65),0 0 0 1px rgba(180,138,60,.4);background:#fff;display:none}' +
    '.ld-panel.open{display:block}' +
    '.ld-x{position:absolute;top:10px;' + (side === 'left' ? 'right' : 'right') + ':10px;z-index:2;width:30px;height:30px;border:0;border-radius:50%;background:rgba(15,31,56,.65);color:#fff;font:400 18px/30px system-ui;cursor:pointer}' +
    '@media (max-width:560px){.ld-panel{left:0;right:0;bottom:0;width:100vw;max-width:100vw;height:100%;border-radius:0}.ld-btn span{display:none}.ld-btn{padding:10px}}' +
    '</style>' +
    '<button class="ld-btn" type="button" aria-expanded="false" aria-controls="ld-panel">' +
    '<svg class="ld-seal" viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="32" r="30" fill="#0f1f38" stroke="#d2ae63" stroke-width="2"/><g fill="none" stroke="#d2ae63" stroke-width="1.6" transform="translate(32 32)"><ellipse rx="18" ry="6.5"/><ellipse rx="18" ry="6.5" transform="rotate(45)"/><ellipse rx="18" ry="6.5" transform="rotate(90)"/><ellipse rx="18" ry="6.5" transform="rotate(135)"/><circle r="4"/></g></svg>' +
    '<span></span></button>' +
    '<div class="ld-panel" id="ld-panel" role="dialog" aria-label="Lending Desk"><button class="ld-x" type="button" aria-label="Close">×</button></div>';
  var btn = root.querySelector('.ld-btn');
  var panel = root.querySelector('.ld-panel');
  btn.querySelector('span').textContent = label;
  var loaded = false;
  function set(open) {
    if (open && !loaded) { panel.appendChild(frame('100%')); loaded = true; }
    panel.classList.toggle('open', open);
    btn.setAttribute('aria-expanded', String(open));
  }
  btn.addEventListener('click', function () { set(!panel.classList.contains('open')); });
  root.querySelector('.ld-x').addEventListener('click', function () { set(false); btn.focus(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') set(false); });
  (document.body || document.documentElement).appendChild(host);
  if (ds.open === 'true') set(true);
})();`;

export function GET() {
  return new Response(SCRIPT.replace('__ORIGIN__', JSON.stringify(SITE_URL)), {
    headers: {
      'Content-Type': 'application/javascript; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=86400',
      'Access-Control-Allow-Origin': '*',
    },
  });
}
