import type { LeadRow } from './metrics.ts';

export function filterLeads(leads: LeadRow[], sp: Record<string, string | undefined>) {
  const q = (sp.q || '').toLowerCase().trim();
  return leads.filter((l) => {
    if (sp.status === 'open' && (l.status === 'funded' || l.status === 'lost')) return false;
    if (sp.status && sp.status !== 'open' && l.status !== sp.status) return false;
    if (sp.tier && l.tier !== sp.tier) return false;
    if (sp.type && l.deal?.loan_type !== sp.type) return false;
    if (sp.state && l.deal?.state !== sp.state) return false;
    if (sp.partner && (l.partner_ref || 'direct') !== sp.partner) return false;
    if (sp.urgent === '1' && !l.urgent) return false;
    if (sp.contacted === 'no' && l.first_contacted_at) return false;
    if (q) {
      const hay = [l.contact?.full_name, l.contact?.email, l.contact?.phone, l.contact?.company, l.summary, l.deal?.city, l.partner_ref].join(' ').toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
}

