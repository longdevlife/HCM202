/**
 * Verified selectors for ThreeUI Bestsellers Book Showcase DOM slots.
 * Matches public/landing-pages/bestsellers-book-showcase.html byte-for-byte.
 */

export const THREEUI_SELECTORS = {
  // Container & Stage
  stage: ".stage",
  heroWord: ".hero-word",
  brand: ".brand",
  brandMark: ".brand-mark",
  metaSub: ".meta-sub",

  // Book cards (3 volumes)
  cardList: ".gallery",
  bookCards: ".book-card",
  bookCardByBookId: (bookId) => `.book-card[data-book="${bookId}"]`,
  bookCardByIndex: (index) => {
    const ids = ["codex", "claude", "cursor"];
    return `.book-card[data-book="${ids[index] || ids[0]}"]`;
  },

  // Inside each card
  coverKicker: ".cover-kicker",
  coverTitle: ".cover-title",
  coverSubtitle: ".cover-subtitle",
  coverFooter: ".cover-footer",
  openBadge: ".open-badge",

  // Detail Drawer Panel
  detailPanel: "#detailPanel",
  detailTitle: "#detailTitle",
  detailScroll: "#detailScroll",
  detailDescription: "#detailDescription",
  gettingStartedLabel: "#gettingStartedLabel",
  detailSteps: "#detailSteps",
  firstPromptLabel: "#firstPromptLabel",
  detailPrompt: "#detailPrompt",
  reviewLabel: "#reviewLabel",
  detailReview: "#detailReview",
  detailYear: "#detailYear",
  reviewSource: ".review-source",
  closeButton: "#closeButton",
  saveButton: "#saveButton",

  // Actions Rail
  actionRail: ".action-rail",
  pills: ".action-rail .pill",
  primaryCta: ".action-rail .pill:not(.language):not(.icon-only)",
};

export const AUTHORED_BOOK_KEYS = ["codex", "claude", "cursor"];
