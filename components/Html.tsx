import type { ReactNode } from 'react';
import '../app/globals.css';

const FONTS =
  'https://fonts.googleapis.com/css2?family=Bodoni+Moda:opsz,wght@6..96,500;6..96,600&family=Public+Sans:wght@400;500;600;700&family=Vazirmatn:wght@400;500;700&family=Noto+Sans+SC:wght@400;500;700&display=swap';

/** The <html> shell, with the page's real language and direction for search engines and screen readers. */
export default function Html({ lang, dir, children }: { lang: string; dir: 'ltr' | 'rtl'; children: ReactNode }) {
  return (
    <html lang={lang} dir={dir}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link rel="stylesheet" href={FONTS} />
      </head>
      <body>{children}</body>
    </html>
  );
}
