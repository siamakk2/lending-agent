'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';

export default function Nav({ urgent }: { urgent: number }) {
  const path = usePathname();
  const qs = useSearchParams();
  const keep = qs.get('sample') ? '?sample=1' : '';
  const items = [
    { href: '/admin', label: 'Overview', on: path === '/admin' },
    { href: '/admin/leads', label: 'Leads', on: path.startsWith('/admin/leads'), badge: urgent },
    { href: '/admin/leads?status=open&urgent=1', label: 'Urgent', on: false },
  ];
  return (
    <nav className="adm-nav" aria-label="Admin">
      {items.map((i) => (
        <Link key={i.label} href={`${i.href}${i.href.includes('?') ? (keep ? '&sample=1' : '') : keep}`} aria-current={i.on ? 'page' : undefined}>
          {i.label}
          {i.badge ? <span className="count" title="Urgent open leads">{i.badge}</span> : null}
        </Link>
      ))}
      <a href={`/api/admin/export${keep}`}>Export CSV</a>
    </nav>
  );
}
