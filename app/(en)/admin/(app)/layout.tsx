import { Suspense, type ReactNode } from 'react';
import Link from 'next/link';
import { Rosette } from '@/components/Engraving.tsx';
import Nav from '@/components/admin/Nav.tsx';
import { requireAdmin } from '@/lib/admin-auth.ts';
import { logout } from '@/lib/admin-actions.ts';
import { db } from '@/lib/db.ts';
import { LENDER } from '@/lib/config.ts';

export const dynamic = 'force-dynamic';

async function urgentOpen() {
  const supa = db();
  if (!supa) return 0;
  const { count } = await supa.from('la_leads').select('id', { count: 'exact', head: true }).eq('urgent', true).not('status', 'in', '(funded,lost)');
  return count || 0;
}

export default async function AdminShell({ children }: { children: ReactNode }) {
  await requireAdmin();
  const urgent = await urgentOpen();
  return (
    <div className="adm">
      <aside className="adm-side">
        <Link href="/admin" className="adm-brand">
          <Rosette size={34} mark />
          <span>
            {LENDER.name}
            <small>Admin</small>
          </span>
        </Link>
        <Suspense fallback={<nav className="adm-nav" />}>
          <Nav urgent={urgent} />
        </Suspense>
        <div className="adm-side-foot">
          <a href="/" style={{ color: 'inherit' }}>View website</a>
          <form action={logout}>
            <button type="submit">Sign out</button>
          </form>
        </div>
      </aside>
      <main className="adm-main">{children}</main>
    </div>
  );
}
