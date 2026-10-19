const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const embed = fs.readFileSync(path.join(__dirname, '../mmm-embed.html'), 'utf8');
const script = embed.match(/<script>([\s\S]*?)<\/script>/)[1];
function run(href) {
  const location = new URL(href);
  let src = 'https://mobs2r.github.io/illicit-page/';
  const frame = { style: {}, getAttribute: () => src, setAttribute: (key, value) => { src = value; } };
  const icon = {};
  const attached = [];
  const events = {};
  const document = {
    getElementById: () => frame,
    querySelector: () => icon,
    documentElement: { style: { cssText: '' } },
    body: { style: { cssText: '' }, appendChild: node => attached.push(node) }
  };
  vm.runInNewContext(script, { document, location, URL, window: { addEventListener: (name, fn) => { events[name] = fn; } } });
  return { document, location, frame, icon, attached, events, src: () => src };
}
test('public embed has one viewport scroll owner and matching favicon', () => {
  const app = run('https://illicit.page/#donate');
  assert.deepEqual(app.attached, [app.frame]);
  assert.match(app.frame.style.cssText, /position:fixed;inset:0/);
  assert.match(app.frame.style.cssText, /height:100dvh/);
  assert.match(app.document.documentElement.style.cssText, /overflow:hidden/);
  assert.equal(app.src(), 'https://mobs2r.github.io/illicit-page/#donate');
  assert.equal(app.icon.href, 'https://mobs2r.github.io/illicit-page/assets/favicon.png');
  app.location.hash = '#contact'; app.events.hashchange();
  assert.equal(app.src(), 'https://mobs2r.github.io/illicit-page/#contact');
  app.location.hash = '#untrusted'; app.events.hashchange();
  assert.equal(app.src(), 'https://mobs2r.github.io/illicit-page/');
});
test('editor preview is never covered or scroll-locked by the public embed', () => {
  const app = run('https://mmm.page/mobs2r?editing');
  assert.equal(app.attached.length, 0);
  assert.equal(app.document.body.style.cssText, '');
  assert.equal(app.frame.style.cssText, undefined);
});
