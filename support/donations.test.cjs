const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const config = JSON.parse(fs.readFileSync(path.join(__dirname, '../assets/donation-wallets.json')));

function fixture() {
  const status = { textContent: '' };
  const buttons = config.chains.map(chain => {
    const small = { textContent: chain.symbol };
    return { dataset: { cryptoWallet: chain.id }, small, attributes: {}, disabled: true,
      querySelector: () => small, setAttribute(name, value) { this.attributes[name] = value; } };
  });
  return { buttons, status, root: { ownerDocument: {}, querySelectorAll: () => buttons, querySelector: () => status } };
}

test('each crypto button copies its exact existing recipient and briefly confirms success', async () => {
  const { mountDonations } = await import('../assets/donations.mjs');
  const app = fixture();
  const copied = [];
  const resets = [];
  await mountDonations(app.root, {
    fetcher: async () => ({ ok: true, json: async () => config }),
    clipboard: { writeText: async address => copied.push(address) },
    schedule: (callback, delay) => { assert.equal(delay, 2000); resets.push(callback); }, cancel: () => {}
  });
  for (const [i, button] of app.buttons.entries()) {
    assert.equal(button.disabled, false);
    assert.match(button.attributes['aria-label'], /^Copy /);
    await button.onclick();
    assert.equal(copied.at(-1), config.chains[i].address);
    assert.equal(button.small.textContent, 'Copied ✓');
    assert.equal(app.status.textContent, `${config.chains[i].name} address copied.`);
    resets.at(-1)();
    assert.equal(button.small.textContent, config.chains[i].symbol);
  }
  assert.equal(copied.length, 7);
});

test('unavailable or invalid wallet data never enables copying', async () => {
  const { mountDonations } = await import('../assets/donations.mjs');
  for (const response of [{ ok: false }, { ok: true, json: async () => ({ ...config, rewardsEnabled: true }) }]) {
    const app = fixture();
    await mountDonations(app.root, { fetcher: async () => response });
    assert.ok(app.buttons.every(button => button.disabled && !button.onclick));
    assert.ok(app.buttons.every(button => button.small.textContent === 'Unavailable'));
  }
});

test('user-activated copy fallback cleans up and restores focus; denial never reports success', async () => {
  const { copyAddress } = await import('../assets/donations.mjs');
  let removed = 0, focused = 0, selected = 0, copied;
  const field = { style: {}, select: () => { selected++; }, remove: () => { removed++; } };
  const doc = { activeElement: { focus: options => { assert.equal(options.preventScroll, true); focused++; } },
    createElement: () => field, body: { append: () => {} },
    execCommand: command => { assert.equal(command, 'copy'); copied = field.value; return true; } };
  const denied = { writeText: async () => { throw Error('Not delegated'); } };
  await copyAddress(config.chains[0].address, denied, doc);
  assert.equal(copied, config.chains[0].address);
  assert.deepEqual([removed, focused, selected], [1, 1, 1]);
  doc.execCommand = () => false;
  await assert.rejects(copyAddress(config.chains[0].address, denied, doc));
  assert.deepEqual([removed, focused, selected], [2, 2, 2]);
});

test('copy failure gives an error label, not a false Copied confirmation', async () => {
  const { mountDonations } = await import('../assets/donations.mjs');
  const app = fixture();
  app.root.ownerDocument = { createElement: () => { throw Error('Copy blocked'); } };
  await mountDonations(app.root, { fetcher: async () => ({ ok: true, json: async () => config }),
    clipboard: { writeText: async () => { throw Error('Denied'); } }, schedule: () => {}, cancel: () => {} });
  await app.buttons[0].onclick();
  assert.equal(app.buttons[0].small.textContent, 'Copy unavailable');
  assert.match(app.status.textContent, /Could not copy/);
});
