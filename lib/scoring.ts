import { LENDER } from './config.ts';

export type DealInput = {
  goal?: string;
  loan_type?: string;
  property_type?: string;
  state?: string;
  city?: string;
  purchase_price?: number;
  as_is_value?: number;
  loan_amount?: number;
  rehab_budget?: number;
  arv?: number;
  monthly_rent?: number;
  exit_strategy?: string;
  close_by?: string; // YYYY-MM-DD
  experience_deals_24mo?: number;
  credit_band?: string;
};

export type FitResult = { verdict: 'fits' | 'fits_with_changes' | 'outside_box' | 'need_more_info'; reasons: string[]; leverage?: number };

/** Compare a deal to the lender's box. */
export function checkFit(d: DealInput): FitResult {
  const box = LENDER.box;
  const reasons: string[] = [];
  let verdict: FitResult['verdict'] = 'fits';
  const worse = (v: FitResult['verdict']) => {
    const order = ['fits', 'fits_with_changes', 'need_more_info', 'outside_box'];
    if (order.indexOf(v) > order.indexOf(verdict)) verdict = v;
  };

  if (!d.loan_amount || !d.state || !d.loan_type) {
    worse('need_more_info');
    reasons.push('Need loan amount, property state and loan type to check fit.');
  }
  if (d.state && !box.states.includes(d.state.toUpperCase())) {
    worse('outside_box');
    reasons.push(`Property state ${d.state.toUpperCase()} is outside the lending area (${box.states.join(', ')}).`);
  }
  if (d.loan_amount && d.loan_amount < box.minLoan) {
    worse('outside_box');
    reasons.push(`Loan amount is below the $${box.minLoan.toLocaleString()} minimum.`);
  }
  if (d.loan_amount && d.loan_amount > box.maxLoan) {
    worse('outside_box');
    reasons.push(`Loan amount is above the $${box.maxLoan.toLocaleString()} maximum.`);
  }

  let leverage: number | undefined;
  if (d.loan_amount) {
    if (d.loan_type === 'fix_flip' && d.arv) {
      leverage = d.loan_amount / d.arv;
      if (leverage > box.maxLtArv) {
        worse('fits_with_changes');
        reasons.push(`Loan is ${(leverage * 100).toFixed(0)}% of ARV; max is ${box.maxLtArv * 100}%. A loan near $${Math.round(d.arv * box.maxLtArv).toLocaleString()} would fit.`);
      }
    } else if (d.loan_type === 'construction' && (d.purchase_price || d.as_is_value) && d.rehab_budget) {
      const cost = (d.purchase_price || d.as_is_value || 0) + d.rehab_budget;
      leverage = d.loan_amount / cost;
      if (leverage > box.maxLtc) {
        worse('fits_with_changes');
        reasons.push(`Loan is ${(leverage * 100).toFixed(0)}% of total cost; max is ${box.maxLtc * 100}%.`);
      }
    } else if (d.as_is_value || d.purchase_price) {
      const value = d.as_is_value || d.purchase_price!;
      leverage = d.loan_amount / value;
      if (leverage > box.maxLtvAsIs) {
        worse('fits_with_changes');
        reasons.push(`Loan is ${(leverage * 100).toFixed(0)}% of value; max is ${box.maxLtvAsIs * 100}%. About $${Math.round(value * box.maxLtvAsIs).toLocaleString()} would fit.`);
      }
    }
  }
  if (verdict === 'fits') reasons.push('Deal looks inside the lending box, subject to underwriting.');
  return { verdict, reasons, leverage };
}

/** 0–100 lead score per the blueprint. */
export function scoreLead(d: DealInput, engagement = 0, today = new Date()): { score: number; tier: 'hot' | 'warm' | 'nurture' } {
  let score = 0;

  // Completeness (0–25)
  const core = [d.loan_type, d.state, d.loan_amount, d.as_is_value || d.purchase_price, d.exit_strategy, d.close_by];
  score += Math.round((core.filter((v) => v !== undefined && v !== null && v !== '').length / core.length) * 25);

  // Leverage fit (0–20)
  const fit = checkFit(d);
  score += fit.verdict === 'fits' ? 20 : fit.verdict === 'fits_with_changes' ? 10 : 0;

  // Exit clarity (0–15)
  if (d.exit_strategy) score += d.arv || d.monthly_rent ? 15 : 8;

  // Timeline (0–15)
  if (d.close_by) {
    const days = (Date.parse(d.close_by) - today.getTime()) / 864e5;
    score += days >= 7 && days <= 45 ? 15 : days > 45 && days <= 120 ? 8 : days >= 0 ? 5 : 0;
  }

  // Experience (0–15)
  const exp = d.experience_deals_24mo ?? 0;
  score += exp >= 3 ? 15 : exp >= 1 ? 8 : 0;

  // Engagement (0–10)
  score += Math.max(0, Math.min(10, engagement));

  score = Math.min(100, score);
  return { score, tier: score >= 70 ? 'hot' : score >= 40 ? 'warm' : 'nurture' };
}
