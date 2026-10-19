// rates are units per USD, never CAD per unit. Amounts retain their billed
// currency and annual period; conversion occurs exactly once at presentation.
export const currencyOptions = Object.freeze([
  { code: 'USD', symbol: '$', prefix: 'US$', name: 'US dollar' },
  { code: 'CAD', symbol: '$', prefix: 'CA$', name: 'Canadian dollar' },
  { code: 'EUR', symbol: '€', prefix: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', prefix: '£', name: 'British pound' },
  { code: 'AUD', symbol: '$', prefix: 'A$', name: 'Australian dollar' },
  { code: 'NZD', symbol: '$', prefix: 'NZ$', name: 'New Zealand dollar' },
  { code: 'JPY', symbol: '¥', prefix: 'JP¥', name: 'Japanese yen', decimals: 0 },
  { code: 'CHF', symbol: 'Fr', prefix: 'CHF ', name: 'Swiss franc' },
  { code: 'CNY', symbol: '¥', prefix: 'CN¥', name: 'Chinese yuan' },
  { code: 'INR', symbol: '₹', prefix: '₹', name: 'Indian rupee' },
  { code: 'BRL', symbol: 'R$', prefix: 'R$', name: 'Brazilian real' },
  { code: 'KRW', symbol: '₩', prefix: '₩', name: 'South Korean won', decimals: 0 }
].map(Object.freeze));
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
  const option = currencyOptions.find(item => item.code === currency);
  if (!option || !Number.isFinite(value) || value < 0) throw Error('Invalid display currency');
  return option.prefix + roundMoney(value).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: option.decimals ?? 2 });
}
