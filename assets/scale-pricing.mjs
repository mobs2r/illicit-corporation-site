// rates are units per USD, never CAD per unit. Amounts retain their billed
// currency and annual period; conversion occurs exactly once at presentation.
export function convertMoney(amount, from, to, rates) {
  if (!Number.isFinite(amount) || amount < 0 || !Number.isFinite(rates?.[from]) || rates[from] <= 0 || !Number.isFinite(rates?.[to]) || rates[to] <= 0) throw Error('Invalid cost or exchange rate');
  return from === to ? amount : amount / rates[from] * rates[to];
}
export const roundMoney = value => Math.round((value + Number.EPSILON) * 100) / 100;
export function roundBudgetMoney(value) {
  if (!Number.isFinite(value) || value < 0) throw Error('Invalid annual amount');
  const step = value >= 1000 ? 100 : 10;
  const scaled = value / step;
  const nearest = Math.round(scaled);
  return (Math.abs(scaled - nearest) < 1e-6 ? nearest : Math.ceil(scaled)) * step;
}
export function formatMoney(value, currency) {
  const symbols = { USD: 'US$', CAD: 'CA$', EUR: '€', GBP: '£' };
  if (!symbols[currency] || !Number.isFinite(value)) throw Error('Invalid display currency');
  return symbols[currency] + roundMoney(value).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
}
