'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const html = fs.readFileSync(path.join(__dirname, '../index.html'), 'utf8');
test('homepage navigation reaches real sections and documentation instead of reopening itself', () => {
  for (const [label, id] of [['Explore', 'worlds'], ['Platform', 'platform']]) {
    assert.match(html, new RegExp(`href="#${id}"( aria-current="page")?>${label}`));
    assert.ok(html.includes(`id="${id}"`));
  }
  assert.match(html, /href="https:\/\/github\.com\/mobs2r" target="_blank" rel="noopener noreferrer">GitHub/);
  assert.doesNotMatch(html, />Docs </);
  assert.match(html, /href="https:\/\/illicit\.up\.railway\.app\/support\/distribution" target="_blank" rel="noopener noreferrer">Build/);
});
test('homepage retains keyboard focus, responsive layout and reduced-motion support', () => {
  assert.match(html, /:focus-visible/);
  assert.match(html, /prefers-reduced-motion:reduce/);
  assert.match(html, /@media \(max-width:620px\)/);
  assert.match(html, /currentUrl\.searchParams\.set\('rev', revision\)/);
});
test('homepage links every current world with its own mark and concise moniker', () => {
  for (const [href, name, moniker] of [
    ['https://www.cod.city/', 'Cod City', 'Call it what you want...'],
    ['https://www.gk.style/', 'gKnuckle', 'A mix of old &amp; new...']
  ]) {
    assert.match(html, new RegExp(`href="${href.replaceAll('.', '\\.')}`));
    assert.match(html, new RegExp(`<h3>${name}</h3><p>${moniker.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`));
  }
  assert.match(html, /class="world-symbol codcity-skull"/);
  assert.match(html, /class="world-symbol gknuckle-mark"/);
  assert.match(html, /Build #e0f83a3/);
  assert.match(html, /Build #6b7e0a4/);
});

test('the mmm.page embed lives at the repository root and frames the published site', () => {
  const embed = fs.readFileSync(path.join(__dirname, '../mmm-embed.html'), 'utf8');
  assert.match(embed, /<iframe[\s\S]*src="https:\/\/mobs2r\.github\.io\/illicit-corporation-site\/"/);
  assert.match(embed, /title="Illicit Corporation"/);
  assert.match(embed, /document\.body\.appendChild\(frame\)/);
  assert.match(embed, /position:fixed;inset:0/);
  assert.match(embed, /height:100dvh/);
  assert.match(embed, /overflow:hidden/);
  assert.match(embed, /searchParams\.has\('editing'\)/);
  assert.match(embed, /assets\/favicon\.png/);
  assert.match(embed, /#101318/);
  assert.match(html, /classList\.add\('is-embedded'\)/);
  assert.doesNotMatch(html, /--header-pin|embed-bleed|height:640px/);
  assert.match(html, /\.site-header \{ position:sticky;/);
});

test('active navigation follows scrolling through long Scale sections and the footer', () => {
  assert.match(html, /addEventListener\('scroll', queueCurrentNav, \{ passive: true \}\)/);
  assert.match(html, /if \(navFrame\) return/);
  assert.match(html, /requestAnimationFrame\(\(\) => \{ navFrame = 0; pickCurrentNav\(\); \}\)/);
  const source = html.slice(html.indexOf('const pickCurrentNav = () => {'), html.indexOf('let navFrame = 0;'));
  let active;
  const window = { innerHeight: 900, scrollY: 2800 };
  const document = { documentElement: { scrollHeight: 6000 } };
  const navSections = [{ id: 'mods', getBoundingClientRect: () => ({ top: -300 }) }, { id: 'funds', getBoundingClientRect: () => ({ top: 80 }) }, { id: 'contact', getBoundingClientRect: () => ({ top: 2500 }) }];
  const pick = vm.runInNewContext(source + '; pickCurrentNav', { window, document, navSections, setCurrentNav: id => { active = id; } });
  pick(); assert.equal(active, 'funds');
  window.scrollY = 5100;
  pick(); assert.equal(active, 'contact');
  const scheduler = html.slice(html.indexOf('let navFrame = 0;'), html.indexOf('// Intersection thresholds alone'));
  const frames = [];
  let updates = 0;
  const queue = vm.runInNewContext(scheduler + '; queueCurrentNav', {
    requestAnimationFrame: callback => frames.push(callback),
    pickCurrentNav: () => { updates++; }
  });
  queue(); queue(); queue();
  assert.equal(frames.length, 1);
  frames[0]();
  assert.equal(updates, 1);
  queue(); assert.equal(frames.length, 2);
});
