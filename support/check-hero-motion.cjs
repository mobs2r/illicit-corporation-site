const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const { pathToFileURL } = require('node:url');
const path = require('node:path');
const assert = require('node:assert/strict');

(async () => {
  const browser = await chromium.launch({ headless: true, channel: 'msedge' });
  try {
    const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.goto(pathToFileURL(path.resolve(__dirname, '..', 'index.html')).href);
    assert.equal(await page.locator('#hero-word').textContent(), 'analytics.');
    const words = await page.locator('.hero-word-window .hero-word').allTextContents();
    assert.equal(words.length, 1);
    await page.waitForFunction(() => document.querySelectorAll('.hero-word-window .hero-word').length === 2, { timeout: 5000 });
    await page.waitForTimeout(170);
    const transition = await page.locator('.hero-word-window').evaluate(windowElement => {
      const outgoing = windowElement.querySelector('.is-leaving');
      const incoming = windowElement.querySelector('.is-current');
      return {
        oldText: outgoing?.textContent,
        newText: incoming?.textContent,
        oldOpacity: Number(getComputedStyle(outgoing).opacity),
        newOpacity: Number(getComputedStyle(incoming).opacity),
        oldTop: outgoing.getBoundingClientRect().top,
        newTop: incoming.getBoundingClientRect().top,
        windowTop: windowElement.getBoundingClientRect().top
      };
    });
    assert.equal(transition.oldText, 'analytics.');
    assert.equal(transition.newText, 'arcade.');
    assert.ok(transition.oldOpacity < 1 && transition.oldOpacity > 0, 'outgoing word visibly fades');
    assert.ok(transition.newOpacity > 0 && transition.newOpacity < 1, 'incoming word fades in');
    assert.ok(transition.oldTop < transition.windowTop, 'old word travels upward');
    assert.ok(transition.newTop > transition.windowTop, 'new word enters from below');
    await page.waitForFunction(() => document.querySelectorAll('.hero-word-window .hero-word').length === 1);
    assert.equal(await page.locator('#hero-word').textContent(), 'arcade.');
    if (process.env.QA_SCREENSHOT) await page.screenshot({ path: process.env.QA_SCREENSHOT });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.waitForFunction(() => document.getElementById('hero-word')?.textContent === 'analytics.');
    assert.equal(await page.locator('#hero-word').textContent(), 'analytics.');
    await page.waitForTimeout(3600);
    assert.equal(await page.locator('#hero-word').textContent(), 'analytics.');
    await page.setViewportSize({ width: 375, height: 700 });
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'no mobile horizontal overflow');
    console.log('Hero word motion passed: upward fade, paused word, reduced-motion fallback, and mobile width.');
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
