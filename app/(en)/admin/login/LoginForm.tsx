'use client';

import { useActionState } from 'react';
import { login } from '@/lib/admin-actions.ts';

export default function LoginForm() {
  const [state, action, pending] = useActionState(login, undefined);
  return (
    <form action={action}>
      {state?.error ? <p className="err" role="alert">{state.error}</p> : null}
      <label className="field">
        Password
        <input type="password" name="password" autoComplete="current-password" required autoFocus />
      </label>
      <button className="btn-adm" type="submit" disabled={pending}>{pending ? 'Signing in…' : 'Sign in'}</button>
    </form>
  );
}
