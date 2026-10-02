'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const html = fs.readFileSync(path.join(__dirname, '../index.html'), 'utf8');
test('homepage navigation reaches real sections and documentation instead of reopening itself', () => {
  for (const [label, id] of [['Explore', 'worlds'], ['Platform', 'platform'], ['Company', 'home']]) {
    assert.match(html, new RegExp(`href="#${id}">${label}`));
    assert.ok(html.includes(`id="${id}"`));
  }
  for (const label of ['Docs', 'Build']) assert.match(html, new RegExp(`href="https://illicit.up.railway.app/support/distribution" target="_blank" rel="noopener noreferrer">${label}`));
});
test('homepage retains keyboard focus, responsive layout and reduced-motion support', () => {
  assert.match(html, /:focus-visible/);
  assert.match(html, /prefers-reduced-motion:reduce/);
  assert.match(html, /@media \(max-width:620px\)/);
});
