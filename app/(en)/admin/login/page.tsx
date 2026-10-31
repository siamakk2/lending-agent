import { redirect } from 'next/navigation';
import { Rosette } from '@/components/Engraving.tsx';
import { adminConfigured, isAdmin } from '@/lib/admin-auth.ts';
import LoginForm from './LoginForm.tsx';

export const dynamic = 'force-dynamic';

export default async function LoginPage() {
  if (await isAdmin()) redirect('/admin');
  return (
    <main className="login">
      <div className="login-card">
        <Rosette size={44} mark />
        <h1>Lending Desk Admin</h1>
        {adminConfigured() ? (
          <>
            <p>Sign in to manage leads and pipeline.</p>
            <LoginForm />
          </>
        ) : (
          <p>Admin isn’t set up yet. Add an <strong>ADMIN_PASSWORD</strong> environment variable in Vercel, then redeploy.</p>
        )}
      </div>
    </main>
  );
}
