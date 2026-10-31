import type { ReactNode } from 'react';
import type { Metadata } from 'next';
import './admin.css';

export const metadata: Metadata = { title: 'Lending Desk Admin', robots: { index: false, follow: false } };

export default function AdminRoot({ children }: { children: ReactNode }) {
  return children;
}
