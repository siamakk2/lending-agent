import { test } from 'node:test';
import assert from 'node:assert/strict';
import { checkFit, scoreLead } from '../lib/scoring.ts';
import { parseFredCsv } from '../lib/rates.ts';
import { pickBroker } from '../lib/leads.ts';

const today = new Date('2026-10-31T12:00:00Z');

test('strong fix-and-flip deal scores hot and fits', () => {
  const d = { loan_type: 'fix_flip', state: 'CA', loan_amount: 450_000, purchase_price: 500_000, rehab_budget: 120_000, arv: 750_000, exit_strategy: 'sell', close_by: '2026-11-20', experience_deals_24mo: 4 };
  assert.equal(checkFit(d).verdict, 'fits');
  const s = scoreLead(d, 5, today);
  assert.equal(s.tier, 'hot');
  assert.ok(s.score >= 85, `score ${s.score}`);
});

test('over-leveraged flip fits with changes and suggests a loan size', () => {
  const r = checkFit({ loan_type: 'fix_flip', state: 'TX', loan_amount: 700_000, arv: 800_000 });
  assert.equal(r.verdict, 'fits_with_changes');
  assert.match(r.reasons[0], /600,000/);
});

test('out-of-area deal is outside the box', () => {
  assert.equal(checkFit({ loan_type: 'bridge', state: 'NY', loan_amount: 500_000, as_is_value: 900_000 }).verdict, 'outside_box');
});

test('thin lead stays in nurture', () => {
  assert.equal(scoreLead({ loan_type: 'bridge' }, 0, today).tier, 'nurture');
});

test('FRED CSV parser skips missing values', () => {
  const csv = 'observation_date,DPRIME\n2026-10-27,7.00\n2026-10-28,7.00\n2026-10-29,.\n';
  assert.deepEqual(parseFredCsv(csv), { date: '2026-10-28', value: 7 });
});

test('broker routing respects state, type and capacity', () => {
  const brokers = [
    { id: 'a', name: 'A', email: 'a@x', states: ['CA'], loan_types: ['fix_flip'], min_loan: null, max_loan: null, capacity: 1, close_rate: 0.5 },
    { id: 'b', name: 'B', email: 'b@x', states: ['CA', 'NV'], loan_types: ['fix_flip', 'bridge'], min_loan: null, max_loan: null, capacity: 5, close_rate: 0.3 },
    { id: 'c', name: 'C', email: 'c@x', states: ['TX'], loan_types: ['fix_flip'], min_loan: null, max_loan: null, capacity: 5, close_rate: 0.9 },
  ];
  assert.equal(pickBroker(brokers, {}, { state: 'CA', loan_type: 'fix_flip' })?.id, 'a');
  assert.equal(pickBroker(brokers, { a: 1 }, { state: 'CA', loan_type: 'fix_flip' })?.id, 'b');
  assert.equal(pickBroker(brokers, {}, { state: 'FL', loan_type: 'fix_flip' }), null);
});
