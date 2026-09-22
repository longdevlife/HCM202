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
    const classes = new Set();
    const subElements = {
      '.cover-kicker': { textContent: `FIELD MANUAL · ${index + 1}` },
      '.cover-title': { innerHTML: id },
      '.cover-subtitle': { textContent: 'Sub' },
      '.cover-footer': { textContent: 'Footer' },
      '.open-badge': { textContent: 'Read' },
    };

    return {
      classList: {
        add: (c) => classes.add(c),
        remove: (c) => classes.delete(c),
        toggle: (c, force) => {
          if (force === undefined) {
            if (classes.has(c)) classes.delete(c);
            else classes.add(c);
          } else if (force) {
            classes.add(c);
          } else {
            classes.delete(c);
          }
        },
        contains: (c) => classes.has(c),
      },
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
      focus() {},
      cardListeners,
    };
  });

  const docListeners = {};
  const doc = {
    body: {
      dataset: { mode: 'gallery' },
    },
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

test('cleanup actually removes card and cta event listeners from DOM', () => {
  const { iframe, cards, elements } = createMockIframe();

  const cleanup = bindThreeUiShowcase({
    iframe,
    books: BOOKS,
    selectedBook: 0,
    onSelectBook: () => {},
    onOpenBook: () => {},
  });

  const cta = elements['.action-rail .pill:not(.language):not(.icon-only)'];

  // Verify listeners were added
  cards.forEach((card) => {
    assert.equal(card.cardListeners['click']?.length, 1);
  });

  // Call cleanup
  cleanup();

  // Verify all listeners were completely removed
  cards.forEach((card) => {
    assert.equal(card.cardListeners['click']?.length || 0, 0);
  });
});

test('rebind does not double-fire CTA or leak listeners', () => {
  const { iframe, elements } = createMockIframe();

  let openCount = 0;
  const onOpen = () => { openCount++; };

  // First bind
  const cleanup1 = bindThreeUiShowcase({
    iframe,
    books: BOOKS,
    selectedBook: 0,
    onOpenBook: onOpen,
  });

  cleanup1();

  // Second bind
  const cleanup2 = bindThreeUiShowcase({
    iframe,
    books: BOOKS,
    selectedBook: 0,
    onOpenBook: onOpen,
  });

  const cta = elements['.action-rail .pill:not(.language):not(.icon-only)'];
  cta.click();

  assert.equal(openCount, 1, 'CTA must only fire once after rebind');

  cleanup2();
});

test('restore authored ThreeUI selected state after remount with Book II', () => {
  const { iframe, cards, doc, elements } = createMockIframe();

  // Simulate returning from 3D Book with selectedBook = 1 (Book II)
  let notifiedIndex = -1;

  const cleanup = bindThreeUiShowcase({
    iframe,
    books: BOOKS,
    selectedBook: 1,
    onSelectBook: (idx) => { notifiedIndex = idx; },
    onOpenBook: () => {},
  });

  // Authored visual selection must be restored to Book II (index 1)
  assert.ok(cards[1].classList.contains('selected'), 'Card 1 (Book II) must have .selected class');
  assert.ok(!cards[0].classList.contains('selected'), 'Card 0 must not have .selected class');
  assert.equal(doc.body.dataset.mode, 'detail', 'Body mode must be set to detail');

  // Detail drawer must reflect Book II content
  assert.equal(
    elements['#detailTitle'].textContent,
    'Sự biến đổi có tính quy luật của cơ cấu xã hội – giai cấp'
  );

  // Must not trigger infinite feedback loop on mount
  assert.equal(notifiedIndex, -1, 'Must not re-notify parent on mount restore');

  cleanup();
});

test('sources have valid official URLs and structured bibliography', () => {
  assert.ok(BOOKS.length === 3);

  BOOKS.forEach((b) => {
    assert.ok(Array.isArray(b.bibliography), `Book ${b.roman} must have bibliography`);
    assert.ok(b.bibliography.length > 0, `Book ${b.roman} bibliography must not be empty`);
    b.bibliography.forEach((bib) => {
      assert.ok(bib.title, 'Bibliography must have title');
      assert.ok(bib.publisher, 'Bibliography must have publisher');
      assert.ok(bib.year, 'Bibliography must have year');
      assert.ok(bib.url.startsWith('https://'), 'Bibliography must have https:// URL');
    });
  });
});
