import type { ReactNode } from 'react';
import Html from '@/components/Html.tsx';

export const viewport = { themeColor: '#0F1F38', width: 'device-width', initialScale: 1 };

export default function EnglishLayout({ children }: { children: ReactNode }) {
  return (
    <Html lang="en" dir="ltr">
      {children}
    </Html>
  );
}
