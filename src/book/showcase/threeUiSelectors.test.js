import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { THREEUI_SELECTORS, AUTHORED_BOOK_KEYS } from './threeUiSelectors.js';

test('AUTHORED_BOOK_KEYS matches the 3 cards in ThreeUI HTML', () => {
  assert.deepEqual(AUTHORED_BOOK_KEYS, ['codex', 'claude', 'cursor']);
});

test('All verified selectors match elements in authored HTML', () => {
  const html = fs.readFileSync('public/landing-pages/bestsellers-book-showcase.html', 'utf8');

  // Verify IDs exist in HTML
  assert.ok(html.includes('id="detailPanel"'), 'Must have #detailPanel');
  assert.ok(html.includes('id="detailTitle"'), 'Must have #detailTitle');
  assert.ok(html.includes('id="detailDescription"'), 'Must have #detailDescription');
  assert.ok(html.includes('id="gettingStartedLabel"'), 'Must have #gettingStartedLabel');
  assert.ok(html.includes('id="detailSteps"'), 'Must have #detailSteps');
  assert.ok(html.includes('id="firstPromptLabel"'), 'Must have #firstPromptLabel');
  assert.ok(html.includes('id="detailPrompt"'), 'Must have #detailPrompt');
  assert.ok(html.includes('id="reviewLabel"'), 'Must have #reviewLabel');
  assert.ok(html.includes('id="detailReview"'), 'Must have #detailReview');
  assert.ok(html.includes('id="detailYear"'), 'Must have #detailYear');
  assert.ok(html.includes('id="closeButton"'), 'Must have #closeButton');
  assert.ok(html.includes('id="saveButton"'), 'Must have #saveButton');

  // Verify class names exist
  assert.ok(html.includes('class="cover-kicker"'), 'Must have .cover-kicker');
  assert.ok(html.includes('class="cover-title"'), 'Must have .cover-title');
  assert.ok(html.includes('class="cover-subtitle"'), 'Must have .cover-subtitle');
  assert.ok(html.includes('class="cover-footer"'), 'Must have .cover-footer');
  assert.ok(html.includes('class="open-badge"'), 'Must have .open-badge');
  assert.ok(html.includes('class="hero-word"'), 'Must have .hero-word');
  assert.ok(html.includes('class="brand"'), 'Must have .brand');
  assert.ok(html.includes('class="action-rail"'), 'Must have .action-rail');

  // Verify data-book keys exist on book cards
  AUTHORED_BOOK_KEYS.forEach(key => {
    assert.ok(html.includes(`data-book="${key}"`), `Must have data-book="${key}"`);
  });
});
