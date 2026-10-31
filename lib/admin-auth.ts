import { createHmac, timingSafeEqual, createHash } from 'node:crypto';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export const ADMIN_COOKIE = 'ld_admin';
const DAY = 86400;

function secret(): string | null {
  const pw = process.env.ADMIN_PASSWORD;
  if (!pw) return null;
  return `${pw}:${process.env.ADMIN_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY || ''}`;
}

export const adminConfigured = () => !!process.env.ADMIN_PASSWORD;

function sign(exp: number, key: string) {
  return createHmac('sha256', key).update(`ld-admin:${exp}`).digest('hex');
}

export function makeToken(days = 7): string | null {
  const key = secret();
  if (!key) return null;
  const exp = Math.floor(Date.now() / 1000) + days * DAY;
  return `${exp}.${sign(exp, key)}`;
}

export function verifyToken(token?: string | null): boolean {
  const key = secret();
  if (!key || !token) return false;
  const [expStr, mac] = token.split('.');
  const exp = Number(expStr);
  if (!exp || exp < Date.now() / 1000 || !mac) return false;
  const want = Buffer.from(sign(exp, key));
  const got = Buffer.from(mac);
  return want.length === got.length && timingSafeEqual(want, got);
}

/** Constant-time password check. */
export function passwordMatches(input: string): boolean {
  const pw = process.env.ADMIN_PASSWORD;
  if (!pw) return false;
  const a = createHash('sha256').update(input).digest();
  const b = createHash('sha256').update(pw).digest();
  return timingSafeEqual(a, b);
}

export async function isAdmin(): Promise<boolean> {
  return verifyToken((await cookies()).get(ADMIN_COOKIE)?.value);
}

export async function requireAdmin() {
  if (!(await isAdmin())) redirect('/admin/login');
}
