import { db } from '@/lib/db.ts';
import { getBenchmarks } from '@/lib/rates.ts';

export const runtime = 'nodejs';

/** Daily job (vercel.json cron): clears the cache so benchmarks are re-pulled from FRED. */
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret && req.headers.get('authorization') !== `Bearer ${secret}`) {
    return new Response('unauthorized', { status: 401 });
  }
  const supa = db();
  if (supa) await supa.from('la_rates_cache').update({ fetched_at: '2000-01-01T00:00:00Z' }).neq('series', '');
  const { benchmarks, from } = await getBenchmarks();
  return Response.json({ from, count: benchmarks.length, benchmarks });
}
