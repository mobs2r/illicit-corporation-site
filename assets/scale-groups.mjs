import { convertMoney, roundBudgetMoney } from './scale-pricing.mjs';

// Sum the displayed per-item budgets; never round the domain subtotal twice.
export function groupAnnualCosts(costs, currency, rates, colors) {
  const sections = [
    { id: 'domains', name: 'Domains', rows: [] },
    { id: 'services', name: 'Services', rows: [] }
  ];
  const slices = [];
  const rows = costs.map(cost => ({
    ...cost,
    shown: cost.amount == null ? null : roundBudgetMoney(convertMoney(cost.amount, cost.currency, currency, rates)),
    sliceIndex: null
  }));
  for (const row of rows) sections[row.category === 'domain' ? 0 : 1].rows.push(row);
  const domains = sections[0].rows.filter(row => row.shown != null);
  if (domains.length) {
    const index = slices.length;
    slices.push({ name: 'Domains', value: domains.reduce((sum, row) => sum + row.shown, 0), color: colors[0] });
    for (const row of domains) row.sliceIndex = index;
  }
  for (const row of sections[1].rows) {
    if (row.shown == null) continue;
    row.sliceIndex = slices.length;
    slices.push({ name: row.name, value: row.shown, color: colors[slices.length % colors.length] });
  }
  return { sections: sections.filter(section => section.rows.length), slices,
    total: rows.reduce((sum, row) => sum + (row.shown ?? 0), 0) };
}
