const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname, '..');

test('requested server choices have game icons rather than bracketed runtime names', async () => {
  const { serverCatalog, serverDetails, billingUrl } = await import('../assets/server-catalog.mjs');
  assert.deepEqual(serverCatalog.slice(0, 9).map(item => item.name), ['Cod City','gKnuckle','DarkRP','TTT','FiveM','alt:V','MTA','Factions','SMP']);
  assert.equal(new Set(serverCatalog.map(item => item.id)).size, serverCatalog.length);
  for (const server of serverCatalog) {
    assert.ok(fs.statSync(path.join(root, server.icon)).size > 50);
    const details = serverDetails(server.id);
    assert.ok(details.readiness && details.hostLabel);
    if (details.guideUrl) assert.equal(new URL(details.guideUrl).origin, 'https://illicit.up.railway.app');
  }
  for (const id of ['gknuckle','darkrp','ttt','fivem','altv','mta','bedrock']) assert.equal(serverDetails(id).host, 'external');
  assert.equal(serverDetails('mta').status, 'planned');
  assert.equal(serverDetails('mta').guideUrl, null);
  assert.equal(billingUrl, 'https://illicit.up.railway.app/?billing');
  assert.throws(() => serverDetails('unknown'));
});

test('the corporate site does not expose or load the paused billing/server picker', () => {
  const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  const script = fs.readFileSync(path.join(root, 'assets/server-portal.mjs'), 'utf8');
  assert.doesNotMatch(html, /account-toggle|server-portal|server-catalog|Servers and billing|\?billing/);
  assert.match(script, /dialog.showModal\(\)/);
  assert.match(script, /trigger.focus\(\)/);
  assert.match(script, /form method="dialog"/);
  assert.match(script, /radio.type = 'radio'/);
  assert.match(script, /image.alt = ''/);
  assert.match(script, /game.className = 'sr-only'/);
  assert.match(script, /Manual setup/);
  assert.doesNotMatch(script, /fetch\(|localStorage|sessionStorage|apiKey|API_SECRET|checkout.tebex.io|window.postMessage/);
});
