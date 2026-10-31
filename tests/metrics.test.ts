import { test } from 'node:test';
import assert from 'node:assert/strict';
import { computeMetrics, summarize, wilson, correlation, leverage, leadFee, FEE_RATE, type LeadRow } from '../lib/metrics.ts';

const base = (o: Partial<LeadRow>): LeadRow => ({
  id: Math.random().toString(36), created_at: '2026-10-20T15:00:00Z', status: 'new', tier: 'warm', score: 50, urgent: false, channel: 'chat',
  lead_type: 'borrower', preferred_language: 'en', partner_ref: null, assigned_to: null, first_contacted_at: null, funded_amount: null,
  funded_at: null, lost_reason: null, summary: null, flags: [], contact: null, deal: null, broker: null, consent: true, ...o,
});

test('summary statistics', () => {
  const s = summarize([1, 2, 3, 4, 100]);
  assert.equal(s.median, 3);
  assert.equal(s.mean, 22);
  assert.equal(s.min, 1);
  assert.equal(s.max, 100);
  assert.ok(Math.abs(s.stdev - 43.6) < 0.1);
});

test('fee is 0.25% of the funded amount', () => {
  assert.equal(FEE_RATE, 0.0025);
  assert.equal(leadFee({ status: 'funded', funded_amount: 1_000_000, deal: { loan_amount: 900_000 } }), 2500);
  assert.equal(leadFee({ status: 'application', funded_amount: null, deal: { loan_amount: 400_000 } }), 1000);
});

test('leverage ratios', () => {
  const r = leverage({ loan_amount: 750_000, as_is_value: 1_000_000, purchase_price: 900_000, rehab_budget: 100_000, arv: 1_500_000 });
  assert.equal(r.ltv, 0.75);
  assert.equal(r.ltc, 0.75);
  assert.equal(r.ltarv, 0.5);
});

test('wilson interval brackets the rate', () => {
  const [lo, hi] = wilson(3, 10);
  assert.ok(lo < 0.3 && hi > 0.3 && lo > 0 && hi < 1);
  assert.deepEqual(wilson(0, 0), [0, 0]);
});

test('correlation', () => {
  assert.ok(Math.abs((correlation([1, 2, 3, 4], [2, 4, 6, 8]) ?? 0) - 1) < 1e-9);
  assert.equal(correlation([1, 2], [1, 2]), null);
});

test('pipeline, funnel and fees', () => {
  const leads = [
    base({ status: 'new', deal: { loan_amount: 1_000_000 } }),
    base({ status: 'application', deal: { loan_amount: 500_000 }, first_contacted_at: '2026-10-20T15:04:00Z' }),
    base({ status: 'funded', deal: { loan_amount: 2_000_000 }, funded_amount: 2_000_000, first_contacted_at: '2026-10-20T15:30:00Z', funded_at: '2026-10-30T15:00:00Z' }),
    base({ status: 'lost', deal: { loan_amount: 300_000 }, lost_reason: 'Rate', first_contacted_at: '2026-10-20T16:00:00Z' }),
  ];
  const m = computeMetrics(leads, { now: new Date('2026-10-31T12:00:00Z'), days: 30 });
  assert.equal(m.total, 4);
  assert.equal(m.weightedPipeline, 1_000_000 * 0.05 + 500_000 * 0.4);
  assert.equal(m.feeEarned, 5000);
  assert.equal(m.closeRate, 0.5);
  assert.deepEqual(m.funnel.map((f) => f.count), [4, 3, 2, 1, 1]);
  assert.equal(m.within5, 1 / 3);
  assert.equal(m.daysToFund.median, 10);
  assert.equal(m.daily.length, 30);
});
