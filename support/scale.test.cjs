const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const data = JSON.parse(fs.readFileSync(path.join(__dirname, '../assets/costs.json')));
const html = fs.readFileSync(path.join(__dirname, '../index.html'), 'utf8');

test('conversion uses each source currency once and never inflates to tens or hundreds', async () => {
  const { convertMoney, roundMoney, formatMoney } = await import('../assets/scale-pricing.mjs');
  assert.equal(convertMoney(100, 'CAD', 'CAD', data.rates), 100);
  assert.equal(roundMoney(convertMoney(100, 'USD', 'CAD', data.rates)), 141.54);
  assert.equal(roundMoney(convertMoney(141.54, 'CAD', 'USD', data.rates)), 100);
  assert.equal(formatMoney(18.99, 'USD'), 'US$18.99');
  assert.equal(roundMoney(155.40), 155.4);
  assert.equal(roundMoney(2400), 2400);
  for (const amount of [NaN, -1, Infinity]) assert.throws(() => convertMoney(amount, 'USD', 'CAD', data.rates));
  assert.throws(() => convertMoney(20, 'AUD', 'CAD', data.rates));
});

test('confirmed invoices retain CAD; domains and published USD subscriptions are not relabelled', () => {
  assert.equal(data.rateBasis, 'units-per-USD');
  const cost = name => data.costs.find(c => c.name === name);
  assert.deepEqual([cost('Anthropic').amount, cost('Anthropic').currency], [1864.8, 'CAD']);
  assert.deepEqual([cost('SoundCloud').amount, cost('SoundCloud').currency], [125, 'CAD']);
  assert.deepEqual([cost('Grok').amount, cost('Grok').currency], [2400, 'USD']);
  assert.match(cost('Grok').basis, /invoice may differ/);
  for (const c of data.costs.filter(c => c.name.includes('.'))) assert.equal(c.currency, 'USD');
});

test('requested copy is removed, Scale is visible and donations stay on the corporation site', () => {
  assert.match(html, /id="funds-title">Scale</);
  assert.match(html, /id="planet-pills">Canada</);
  assert.doesNotMatch(html, /Preserve Our Planet|Give directly to relief and conservation\.|Rates as of|>Funds</);
  assert.doesNotMatch(html, /omerta\.chat\/\?donate/);
  assert.match(html, /id="donate"/);
  assert.match(html, /Email-linked rewards · work in progress/);
  assert.match(html, /no email is collected by this donation page/);
  assert.match(html, /href="mailto:mobs2r@illicit\.page">mobs2r@illicit\.page<\/a>/);
  assert.match(html, /"email":"mobs2r@illicit\.page"/);
  assert.match(html, /Inbox setup pending/);
  assert.doesNotMatch(html, /mobs2@waifu\.club/);
});

test('all seven migrated recipients validate and bad or duplicated networks fail closed', async () => {
  const { validateWallets } = await import('../assets/donations.mjs');
  const config = JSON.parse(fs.readFileSync(path.join(__dirname, '../assets/donation-wallets.json')));
  assert.equal(validateWallets(config).length, 7);
  const bad = structuredClone(config); bad.chains[0].address = 'not-a-wallet';
  assert.throws(() => validateWallets(bad));
  const duplicate = structuredClone(config); duplicate.chains[1].id = duplicate.chains[0].id;
  assert.throws(() => validateWallets(duplicate));
  const wrongNetwork = structuredClone(config); wrongNetwork.chains[3].network = 'ethereum';
  assert.throws(() => validateWallets(wrongNetwork));
  const wrongToken = structuredClone(config); wrongToken.chains[5].token = wrongToken.chains[6].token;
  assert.throws(() => validateWallets(wrongToken));
  assert.throws(() => validateWallets({ ...config, rewardsEnabled: true }));
});

test('every referenced local icon is present and is an image, not an HTML error page', () => {
  const icons = new Set([...html.matchAll(/src="\.\/(assets\/icons\/[^"?]+)"/g)].map(m => m[1]).concat(data.costs.map(c => c.icon)));
  for (const icon of icons) {
    const bytes = fs.readFileSync(path.join(__dirname, '..', icon));
    assert.ok(bytes.length > 50, icon);
    if (icon.endsWith('.svg')) { assert.match(bytes.toString(), /<svg\b/); assert.doesNotMatch(bytes.toString(), /<script|<!doctype html/i); }
    else assert.ok(bytes[0] === 0x89 && bytes[1] === 0x50 || bytes[0] === 0xff && bytes[1] === 0xd8, icon + ' signature');
  }
});

test('manifest and touch icon use the same corporate favicon', () => {
  const manifest = JSON.parse(fs.readFileSync(path.join(__dirname, '../manifest.webmanifest')));
  assert.match(html, /rel="apple-touch-icon" href="\.\/assets\/favicon\.png"/);
  assert.ok(manifest.icons.some(i => i.src === './assets/favicon.png' && i.sizes === '512x512'));
  assert.equal(fs.readFileSync(path.join(__dirname, '../assets/favicon.png')).subarray(1, 4).toString(), 'PNG');
});
