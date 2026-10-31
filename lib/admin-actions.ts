'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { db } from './db.ts';
import { ADMIN_COOKIE, isAdmin, makeToken, passwordMatches } from './admin-auth.ts';
import { STATUSES, type Status } from './metrics.ts';

export async function login(_: { error?: string } | undefined, form: FormData): Promise<{ error?: string }> {
  const pw = String(form.get('password') || '');
  if (!passwordMatches(pw)) {
    await new Promise((r) => setTimeout(r, 600)); // slow down guessing
    return { error: 'That password is not right. Try again.' };
  }
  const token = makeToken(7);
  if (!token) return { error: 'Admin is not set up yet.' };
  (await cookies()).set(ADMIN_COOKIE, token, { httpOnly: true, secure: true, sameSite: 'lax', path: '/', maxAge: 7 * 86400 });
  redirect('/admin');
}

export async function logout() {
  (await cookies()).delete(ADMIN_COOKIE);
  redirect('/admin/login');
}

const clean = (v: FormDataEntryValue | null, max = 500) => {
  const s = String(v ?? '').trim();
  return s ? s.slice(0, max) : null;
};

/** Save changes to one lead and log each change to its history. */
export async function updateLead(form: FormData) {
  if (!(await isAdmin())) redirect('/admin/login');
  const id = String(form.get('id') || '');
  const supa = db();
  if (!supa || !id || id.startsWith('sample-')) return;

  const { data: cur } = await supa.from('la_leads').select('status,assigned_to,first_contacted_at,funded_amount,lost_reason').eq('id', id).single();
  if (!cur) return;

  const patch: Record<string, unknown> = {};
  const events: Record<string, unknown>[] = [];
  const actor = 'admin';

  const status = clean(form.get('status')) as Status | null;
  if (status && STATUSES.includes(status) && status !== cur.status) {
    patch.status = status;
    events.push({ lead_id: id, kind: 'status', from_status: cur.status, to_status: status, actor });
    if (status === 'funded') patch.funded_at = new Date().toISOString();
    if (['contacted', 'application', 'term_sheet', 'funded'].includes(status) && !cur.first_contacted_at) patch.first_contacted_at = new Date().toISOString();
  }

  const owner = clean(form.get('assigned_to'), 120);
  if (owner !== (cur.assigned_to || null)) {
    patch.assigned_to = owner;
    events.push({ lead_id: id, kind: 'assign', body: owner ? `Assigned to ${owner}` : 'Unassigned', actor });
  }

  if (form.get('mark_contacted') && !cur.first_contacted_at) {
    patch.first_contacted_at = new Date().toISOString();
    events.push({ lead_id: id, kind: 'contact', body: 'First contact made', actor });
  }

  const fundedRaw = clean(form.get('funded_amount'), 20);
  const funded = fundedRaw ? Number(fundedRaw.replace(/[^0-9.]/g, '')) : null;
  if (funded !== null && Number.isFinite(funded) && funded !== Number(cur.funded_amount || 0)) {
    patch.funded_amount = funded;
    events.push({ lead_id: id, kind: 'funded', body: `Funded amount set to $${funded.toLocaleString('en-US')}`, actor });
  }

  const lostReason = clean(form.get('lost_reason'), 200);
  if (lostReason !== (cur.lost_reason || null)) patch.lost_reason = lostReason;

  const note = clean(form.get('note'), 4000);
  if (note) events.push({ lead_id: id, kind: 'note', body: note, actor });

  if (Object.keys(patch).length) await supa.from('la_leads').update(patch).eq('id', id);
  if (events.length) await supa.from('la_lead_events').insert(events);
  revalidatePath(`/admin/leads/${id}`);
  revalidatePath('/admin');
}
