import test from 'node:test';
import assert from 'node:assert/strict';
import { bindThreeUiShowcase } from './threeUiContentAdapter.js';
import { BOOKS } from '../content/bookContent.js';

// Minimal mock DOM for testing adapter in Node
function createMockIframe() {
  const listeners = {};
  const elements = {
    '.hero-word': { textContent: 'Agents' },
    '.brand': { textContent: 'Field Manuals' },
    '.meta-sub': { textContent: 'Original subtitle' },
    '#detailTitle': { textContent: 'Original' },
    '#detailDescription': { textContent: 'Original' },
    '#gettingStartedLabel': { textContent: 'Getting started' },
    '#detailSteps': { innerHTML: '' },
    '#firstPromptLabel': { textContent: 'Your first prompt' },
    '#detailPrompt': { textContent: 'Original' },
    '#reviewLabel': { textContent: 'Before you ship' },
    '#detailReview': { textContent: 'Original' },
    '#detailYear': { textContent: '2026' },
    '.review-source': { textContent: 'Field Notes' },
    '.action-rail .pill:not(.language):not(.icon-only)': {
      textContent: 'Read Notes',
      addEventListener(event, fn) {
        listeners[event] = listeners[event] || [];
        listeners[event].push(fn);
      },
      removeEventListener(event, fn) {
        if (listeners[event]) {
          listeners[event] = listeners[event].filter(f => f !== fn);
        }
      },
      click() {
        (listeners['click'] || []).forEach(fn => fn({ preventDefault: () => {} }));
      },
    },
  };

  const cards = ['codex', 'claude', 'cursor'].map((id, index) => {
    const cardListeners = {};
    const subElements = {
      '.cover-kicker': { textContent: `FIELD MANUAL · ${index + 1}` },
      '.cover-title': { innerHTML: id },
      '.cover-subtitle': { textContent: 'Sub' },
      '.cover-footer': { textContent: 'Footer' },
      '.open-badge': { textContent: 'Read' },
    };

    return {
      getAttribute(attr) {
        if (attr === 'data-book') return id;
        return null;
      },
      setAttribute(attr, val) {
        this[attr] = val;
      },
      querySelector(selector) {
        return subElements[selector] || null;
      },
      addEventListener(event, fn) {
        cardListeners[event] = cardListeners[event] || [];
        cardListeners[event].push(fn);
      },
      removeEventListener(event, fn) {
        if (cardListeners[event]) {
          cardListeners[event] = cardListeners[event].filter(f => f !== fn);
        }
      },
      click() {
        (cardListeners['click'] || []).forEach(fn => fn({ preventDefault: () => {} }));
      },
      cardListeners,
    };
  });

  const docListeners = {};
  const doc = {
    querySelector(selector) {
      return elements[selector] || null;
    },
    querySelectorAll(selector) {
      if (selector === '.book-card') return cards;
      return [];
    },
    addEventListener(event, fn) {
      docListeners[event] = docListeners[event] || [];
      docListeners[event].push(fn);
    },
    removeEventListener(event, fn) {
      if (docListeners[event]) {
        docListeners[event] = docListeners[event].filter(f => f !== fn);
      }
    },
  };

  return {
    iframe: {
      contentDocument: doc,
      contentWindow: {
        document: doc,
        addEventListener: doc.addEventListener,
        removeEventListener: doc.removeEventListener,
      },
    },
    cards,
    elements,
    doc,
  };
}

test('bindThreeUiShowcase returns no-op when iframe is not ready', () => {
  const cleanup = bindThreeUiShowcase({ iframe: null, books: BOOKS });
  assert.equal(typeof cleanup, 'function');
  assert.doesNotThrow(() => cleanup());
});

test('bindThreeUiShowcase injects Vietnamese Chapter 5 copy into DOM slots', () => {
  const { iframe, cards, elements } = createMockIframe();

  let selected = -1;
  let opened = -1;

  const cleanup = bindThreeUiShowcase({
    iframe,
    books: BOOKS,
    selectedBook: 0,
    onSelectBook: (idx) => { selected = idx; },
    onOpenBook: (idx) => { opened = idx; },
  });

  // Verify card 0 (Book I) copy
  assert.equal(cards[0].querySelector('.cover-kicker').textContent, 'QUYỂN I');
  assert.ok(cards[0].querySelector('.cover-title').innerHTML.includes('CƠ CẤU XÃ HỘI'));
  assert.equal(cards[0].querySelector('.cover-subtitle').textContent, 'Khái niệm & vị trí');
  assert.equal(cards[0].querySelector('.open-badge').textContent, 'Đọc');

  // Verify card 1 (Book II) copy
  assert.equal(cards[1].querySelector('.cover-kicker').textContent, 'QUYỂN II');
  assert.ok(cards[1].querySelector('.cover-title').innerHTML.includes('BIẾN ĐỔI'));

  // Verify card 2 (Book III) copy
  assert.equal(cards[2].querySelector('.cover-kicker').textContent, 'QUYỂN III');
  assert.ok(cards[2].querySelector('.cover-title').innerHTML.includes('VIỆT NAM'));

  // Verify hero word and brand branding
  assert.equal(elements['.hero-word'].textContent, 'CHƯƠNG 5');

  // Verify CTA label
  const cta = elements['.action-rail .pill:not(.language):not(.icon-only)'];
  assert.equal(cta.textContent, 'ĐỌC SÁCH 3D ↗');

  // Simulate card click
  cards[1].click();
  assert.equal(selected, 1);

  // Simulate CTA click
  cta.click();
  assert.equal(opened, 1);

  // Verify cleanup removes listeners
  assert.doesNotThrow(() => cleanup());
});
