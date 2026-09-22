import { THREEUI_SELECTORS, AUTHORED_BOOK_KEYS } from "./threeUiSelectors.js";
import { getBookByIndex } from "../content/bookContent.js";

/**
 * Injects Google Fonts (Playfair Display & Inter) and refined CSS overrides into ThreeUI iframe document.
 * - Eliminates Vietnamese font split and missing glyph fallback issues on Windows.
 * - Fixes giant broken detail titles by sizing them appropriately for Vietnamese academic titles.
 * - Removes floating blossom petals that overlap and obscure text.
 * - Offsets topbar so it never collides with the global navigation bar.
 * - Adds clean action rail controls including an explicit "Close / Pick another book" button.
 *
 * @param {Document} doc - The iframe HTML document
 */
export function injectVietnameseTypography(doc) {
  if (!doc || !doc.head) return;

  try {
    // 1. Google Fonts Preconnect
    if (!doc.head.querySelector?.("#google-fonts-preconnect-1")) {
      const p1 = doc.createElement?.("link");
      if (p1) {
        p1.id = "google-fonts-preconnect-1";
        p1.rel = "preconnect";
        p1.href = "https://fonts.googleapis.com";
        doc.head.appendChild(p1);
      }
    }
    if (!doc.head.querySelector?.("#google-fonts-preconnect-2")) {
      const p2 = doc.createElement?.("link");
      if (p2) {
        p2.id = "google-fonts-preconnect-2";
        p2.rel = "preconnect";
        p2.href = "https://fonts.gstatic.com";
        p2.crossOrigin = "anonymous";
        doc.head.appendChild(p2);
      }
    }

    // 2. Google Fonts Stylesheet: Playfair Display (Serif) + Inter (Sans)
    if (!doc.head.querySelector?.("#google-fonts-vietnamese")) {
      const fontLink = doc.createElement?.("link");
      if (fontLink) {
        fontLink.id = "google-fonts-vietnamese";
        fontLink.rel = "stylesheet";
        fontLink.href =
          "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Playfair+Display:ital,wght@0,500;0,600;0,700;1,500;1,600&display=swap";
        doc.head.appendChild(fontLink);
      }
    }

    // 3. Style overrides for Vietnamese letter spacing, detail typography, and UI polish
    if (!doc.head.querySelector?.("#threeui-vietnamese-typography")) {
      const styleEl = doc.createElement?.("style");
      if (styleEl) {
        styleEl.id = "threeui-vietnamese-typography";
        styleEl.textContent = `
          :root {
            --serif: 'Playfair Display', Georgia, serif !important;
            --sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
          }

          body {
            font-family: var(--serif) !important;
            -webkit-font-smoothing: antialiased !important;
            -moz-osx-font-smoothing: grayscale !important;
            text-rendering: optimizeLegibility !important;
          }

          /* Offset iframe topbar so it sits comfortably beneath the global Navbar */
          .topbar {
            padding-top: 86px !important;
            z-index: 40 !important;
          }

          .hero-word {
            font-family: var(--serif) !important;
            letter-spacing: -0.02em !important;
            top: 17vh !important;
          }

          .brand {
            font-family: var(--serif) !important;
            letter-spacing: normal !important;
            font-size: clamp(20px, 1.8vw, 26px) !important;
          }

          .cover-kicker {
            font-family: var(--sans) !important;
            letter-spacing: 0.08em !important;
            font-weight: 600 !important;
          }

          .cover-title {
            font-family: var(--serif) !important;
            letter-spacing: -0.01em !important;
            line-height: 1.15 !important;
          }

          .cover-subtitle {
            font-family: var(--sans) !important;
            letter-spacing: normal !important;
            line-height: 1.35 !important;
          }

          .cover-footer {
            font-family: var(--sans) !important;
            letter-spacing: 0.04em !important;
          }

          .open-badge {
            font-family: var(--sans) !important;
            letter-spacing: 0.04em !important;
            font-weight: 600 !important;
          }

          /* DETAIL TITLE FIX: Replaces 82-118px monster font with refined academic title font */
          .detail-title {
            font-family: var(--serif) !important;
            font-size: clamp(22px, 2.4vw, 34px) !important;
            font-weight: 600 !important;
            line-height: 1.3 !important;
            letter-spacing: -0.01em !important;
            margin-bottom: 14px !important;
            color: #f7edd9 !important;
            word-break: normal !important;
            overflow-wrap: break-word !important;
          }

          .detail-description {
            font-family: var(--sans) !important;
            font-size: clamp(14px, 1.05vw, 15px) !important;
            letter-spacing: normal !important;
            line-height: 1.65 !important;
            color: #d6cbb8 !important;
            margin-bottom: 20px !important;
          }

          /* Hide floating flower petals that obscure text */
          .blossom-field {
            display: none !important;
          }

          .doc-label {
            font-family: var(--sans) !important;
            letter-spacing: 0.08em !important;
            font-weight: 700 !important;
            text-transform: uppercase !important;
            color: #dbc39c !important;
            font-size: 12px !important;
            margin-bottom: 10px !important;
          }

          .doc-steps {
            gap: 12px !important;
          }

          .doc-steps li {
            gap: 12px !important;
            align-items: baseline !important;
          }

          .doc-step-copy strong {
            font-family: var(--sans) !important;
            letter-spacing: normal !important;
            font-weight: 600 !important;
            color: #f5eedf !important;
            font-size: 13.5px !important;
            line-height: 1.45 !important;
          }

          .prompt-block {
            padding: 12px 16px !important;
            background: rgba(18, 15, 12, 0.6) !important;
            border: 1px solid rgba(255, 255, 255, 0.08) !important;
            border-radius: 8px !important;
          }

          .prompt-block code, #detailPrompt {
            font-family: var(--sans) !important;
            letter-spacing: normal !important;
            line-height: 1.5 !important;
            font-size: 13px !important;
            color: #f7edd9 !important;
          }

          .doc-review {
            font-family: var(--serif) !important;
            letter-spacing: normal !important;
            font-style: italic !important;
            line-height: 1.55 !important;
            color: #eadfc7 !important;
            font-size: 14px !important;
          }

          /* Hide commercial bookshop rating stars */
          .meta-row .stars,
          .meta-row .meta-divider {
            display: none !important;
          }

          .review-source {
            font-family: var(--sans) !important;
            font-size: 12px !important;
            letter-spacing: 0.08em !important;
            text-transform: uppercase !important;
            color: #dbc39c !important;
            font-weight: 600 !important;
          }

          .year {
            font-family: var(--sans) !important;
            font-size: 12px !important;
            color: #b7976c !important;
            font-weight: 600 !important;
          }

          .pill {
            font-family: var(--sans) !important;
            letter-spacing: 0.04em !important;
          }

          .ticket-button {
            font-family: var(--sans) !important;
            letter-spacing: 0.05em !important;
          }

          .menu-link {
            font-family: var(--serif) !important;
            letter-spacing: normal !important;
            font-size: clamp(24px, 3vw, 38px) !important;
          }

          /* Refined close button with clear affordance */
          .close-button {
            cursor: pointer !important;
            background: rgba(234, 223, 199, 0.15) !important;
            border: 1px solid rgba(234, 223, 199, 0.3) !important;
            color: #eadfc7 !important;
            border-radius: 50% !important;
            transition: all 200ms ease !important;
            top: 24px !important;
          }

          .close-button:hover {
            background: rgba(234, 223, 199, 0.3) !important;
            transform: translate3d(-50%, 0, 0) scale(1.1) !important;
            color: #fff !important;
          }

          /* Hide unused action rail buttons */
          .action-rail .pill.language,
          #saveButton {
            display: none !important;
          }

          /* Primary CTA: Read 3D Book */
          .action-rail .primary-cta {
            min-width: 170px !important;
            font-weight: 700 !important;
            background: #eadfc7 !important;
            color: #29251d !important;
            box-shadow: 0 4px 18px rgba(0, 0, 0, 0.3) !important;
            cursor: pointer !important;
          }

          .action-rail .primary-cta:hover {
            background: #fff8e8 !important;
            transform: translateY(-2px) !important;
          }

          /* Secondary CTA: Close detail & return to 3-book overview */
          .action-rail .close-rail-btn {
            min-width: 140px !important;
            background: rgba(234, 223, 199, 0.12) !important;
            border: 1px solid rgba(234, 223, 199, 0.25) !important;
            color: #eadfc7 !important;
            font-weight: 600 !important;
            cursor: pointer !important;
          }

          .action-rail .close-rail-btn:hover {
            background: rgba(234, 223, 199, 0.25) !important;
            color: #fff !important;
          }
        `;
        doc.head.appendChild(styleEl);
      }
    }
  } catch (err) {
    console.warn("[ThreeUiAdapter] Error injecting Vietnamese typography:", err);
  }
}

/**
 * Binds Chapter 5 academic content and React state bridges to an authored ThreeUI showcase iframe.
 *
 * @param {Object} params
 * @param {HTMLIFrameElement} params.iframe - The ThreeUI iframe element
 * @param {Array} params.books - The single-source book content array
 * @param {number|null} params.selectedBook - Currently active book index (0, 1, 2) or null
 * @param {boolean} params.isDetailOpen - Whether the detail drawer is open (false for 3-book overview)
 * @param {Function} params.onSelectBook - Callback when user selects a book
 * @param {Function} params.onCloseDetail - Callback when user closes the detail drawer
 * @param {Function} params.onOpenBook - Callback when user clicks CTA to open 3D Book
 * @returns {Function} cleanup - Function to unbind all listeners on unmount/reload
 */
export function bindThreeUiShowcase({
  iframe,
  books = [],
  selectedBook = null,
  isDetailOpen = false,
  onSelectBook,
  onCloseDetail,
  onOpenBook,
}) {
  if (!iframe) {
    return () => {};
  }

  let doc = null;
  try {
    doc = iframe.contentDocument || iframe.contentWindow?.document;
  } catch (err) {
    console.warn("[ThreeUiAdapter] Cross-origin or unready iframe document:", err);
    return () => {};
  }

  if (!doc) {
    return () => {};
  }

  const cleanups = [];
  let currentSelectedIndex =
    selectedBook !== null && selectedBook !== undefined ? Number(selectedBook) : 0;
  let isRestoring = false;

  // 1. Inject Vietnamese typography & Google Fonts into iframe
  injectVietnameseTypography(doc);

  // 2. Update Topbar & Brand headers
  try {
    const heroWord = doc.querySelector(THREEUI_SELECTORS.heroWord);
    if (heroWord) heroWord.textContent = "CHƯƠNG 5";

    const brand = doc.querySelector(THREEUI_SELECTORS.brand);
    if (brand) brand.textContent = "TỦ SÁCH HỌC THUẬT";

    const metaSub = doc.querySelector(THREEUI_SELECTORS.metaSub);
    if (metaSub) metaSub.textContent = "Giáo trình và tư liệu nghiên cứu Cơ cấu xã hội – giai cấp.";

    const ticketButton = doc.querySelector(".ticket-button");
    if (ticketButton) {
      ticketButton.textContent = "BỘ 3 QUYỂN SÁCH";
      ticketButton.setAttribute(
        "data-toast",
        "Bộ 3 tác phẩm chuyên khảo Chương 5 MLN131"
      );
    }

    // Translate Menu links
    const menuLinks = doc.querySelectorAll(".menu-link");
    const menuTitles = [
      "Quyển I: Cơ cấu Xã hội – Giai cấp",
      "Quyển II: Liên minh Giai cấp – Tầng lớp",
      "Quyển III: Định hướng Xã hội Chủ nghĩa",
    ];
    menuLinks.forEach((link, idx) => {
      if (menuTitles[idx]) {
        link.textContent = menuTitles[idx];
        const handleMenuLinkClick = (e) => {
          e.preventDefault();
          onSelectBook?.(idx, true);
          // Close menu if open
          if (doc.body) doc.body.dataset.menu = "closed";
          const menuLayer = doc.querySelector("#menuLayer");
          if (menuLayer) menuLayer.inert = true;
          // Trigger card selection
          const cards = doc.querySelectorAll(THREEUI_SELECTORS.bookCards);
          if (cards[idx] && typeof cards[idx].click === "function") {
            cards[idx].click();
          }
        };
        link.addEventListener("click", handleMenuLinkClick);
        cleanups.push(() => link.removeEventListener("click", handleMenuLinkClick));
      }
    });
  } catch (err) {
    console.warn("[ThreeUiAdapter] Error updating topbar branding:", err);
  }

  // 3. Helper to update detail drawer copy
  const updateDetailDrawer = (index) => {
    try {
      const book = getBookByIndex(index);
      if (!book) return;

      const detailTitle = doc.querySelector(THREEUI_SELECTORS.detailTitle);
      if (detailTitle) detailTitle.textContent = book.detail.title;

      const detailDesc = doc.querySelector(THREEUI_SELECTORS.detailDescription);
      if (detailDesc) detailDesc.textContent = book.detail.summary;

      const gettingStartedLabel = doc.querySelector(THREEUI_SELECTORS.gettingStartedLabel);
      if (gettingStartedLabel) gettingStartedLabel.textContent = "Nội dung trọng tâm";

      const detailSteps = doc.querySelector(THREEUI_SELECTORS.detailSteps);
      if (detailSteps && Array.isArray(book.chapters) && book.chapters.length > 0) {
        // Counter is already added via CSS counter(doc-step, decimal-leading-zero)
        detailSteps.innerHTML = book.chapters
          .map(
            (ch) =>
              `<li><span class="doc-step-copy"><strong>${ch.title || ch.id || ""}</strong></span></li>`
          )
          .join("");
      }

      const firstPromptLabel = doc.querySelector(THREEUI_SELECTORS.firstPromptLabel);
      if (firstPromptLabel) firstPromptLabel.textContent = "Từ khóa cốt lõi";

      const detailPrompt = doc.querySelector(THREEUI_SELECTORS.detailPrompt);
      if (detailPrompt) detailPrompt.textContent = (book.detail.keywords || []).join(" · ");

      const reviewLabel = doc.querySelector(THREEUI_SELECTORS.reviewLabel);
      if (reviewLabel) reviewLabel.textContent = "Thông điệp cốt lõi";

      const detailReview = doc.querySelector(THREEUI_SELECTORS.detailReview);
      if (detailReview) detailReview.textContent = book.detail.description || book.detail.summary;

      const detailYear = doc.querySelector(THREEUI_SELECTORS.detailYear);
      if (detailYear) detailYear.textContent = book.cover.eyebrow || "Chương 5";

      const reviewSource = doc.querySelector(THREEUI_SELECTORS.reviewSource);
      if (reviewSource) reviewSource.textContent = "Giáo trình MLN131";
    } catch (err) {
      console.warn("[ThreeUiAdapter] Error updating detail drawer:", err);
    }
  };

  // 4. Inject Vietnamese cover copy on the 3 book cards & bind click
  const cards = doc.querySelectorAll(THREEUI_SELECTORS.bookCards);
  try {
    cards.forEach((card, index) => {
      const book = getBookByIndex(index);
      if (!book) return;

      // Card cover kicker
      const kicker = card.querySelector(THREEUI_SELECTORS.coverKicker);
      if (kicker) kicker.textContent = book.cover.eyebrow || `QUYỂN ${book.roman}`;

      // Card cover title
      const title = card.querySelector(THREEUI_SELECTORS.coverTitle);
      if (title && Array.isArray(book.cover.title)) {
        title.innerHTML = book.cover.title.join("<br>");
      }

      // Card cover subtitle
      const subtitle = card.querySelector(THREEUI_SELECTORS.coverSubtitle);
      if (subtitle) subtitle.textContent = book.cover.subtitle || "";

      // Card cover footer
      const footer = card.querySelector(THREEUI_SELECTORS.coverFooter);
      if (footer) footer.textContent = "MLN131 · CHƯƠNG 5";

      // Card open badge
      const badge = card.querySelector(THREEUI_SELECTORS.openBadge);
      if (badge) badge.textContent = "Đọc";

      // Card aria-label
      card.setAttribute(
        "aria-label",
        `Mở chi tiết ${book.cover.eyebrow}: ${book.detail.title}`
      );

      // Card click listener
      const handleCardClick = () => {
        if (isRestoring) return;
        currentSelectedIndex = index;
        onSelectBook?.(index, true);
        setTimeout(() => {
          updateDetailDrawer(index);
        }, 30);
      };

      card.addEventListener("click", handleCardClick);
      cleanups.push(() => card.removeEventListener("click", handleCardClick));
    });
  } catch (err) {
    console.warn("[ThreeUiAdapter] Error setting up cards:", err);
  }

  // 5. Bind Close Button (#closeButton) and Escape key to close detail mode
  try {
    const closeBtn = doc.querySelector(THREEUI_SELECTORS.closeButton || "#closeButton");
    if (closeBtn) {
      closeBtn.setAttribute("title", "Đóng chi tiết (quay lại bộ sách)");
      closeBtn.setAttribute("aria-label", "Đóng chi tiết");

      const handleCloseBtnClick = () => {
        onCloseDetail?.();
      };

      closeBtn.addEventListener("click", handleCloseBtnClick);
      cleanups.push(() => closeBtn.removeEventListener("click", handleCloseBtnClick));
    }

    const handleIframeKeydown = (e) => {
      if (e.key === "Escape") {
        onCloseDetail?.();
      }
    };

    doc.addEventListener("keydown", handleIframeKeydown);
    cleanups.push(() => doc.removeEventListener("keydown", handleIframeKeydown));
  } catch (err) {
    console.warn("[ThreeUiAdapter] Error setting up close handler:", err);
  }

  // 6. Bind Primary CTA button & Secondary Close button in action rail
  try {
    const primaryCta = doc.querySelector(THREEUI_SELECTORS.primaryCta);
    if (primaryCta) {
      primaryCta.classList.add("primary-cta");
      primaryCta.textContent = "ĐỌC SÁCH 3D ↗";
      if (primaryCta.style) {
        primaryCta.style.cursor = "pointer";
      }

      const handleCtaClick = (event) => {
        event.preventDefault();
        onOpenBook?.(currentSelectedIndex);
      };

      primaryCta.addEventListener("click", handleCtaClick);
      cleanups.push(() => primaryCta.removeEventListener("click", handleCtaClick));
    }

    const railButtons = doc.querySelectorAll(".action-rail .pill:not(.language):not(#saveButton)");
    if (railButtons && railButtons.length > 1) {
      const closeCta = railButtons[1];
      closeCta.classList.add("close-rail-btn");
      closeCta.textContent = "← QUAY LẠI";
      if (closeCta.style) {
        closeCta.style.cursor = "pointer";
      }

      const handleRailCloseClick = (event) => {
        event.preventDefault();
        onCloseDetail?.();
      };

      closeCta.addEventListener("click", handleRailCloseClick);
      cleanups.push(() => closeCta.removeEventListener("click", handleRailCloseClick));

      for (let i = 2; i < railButtons.length; i++) {
        if (railButtons[i].style) {
          railButtons[i].style.display = "none";
        }
      }
    }
  } catch (err) {
    console.warn("[ThreeUiAdapter] Error setting up rail CTA:", err);
  }

  // 7. Synchronize Visual Mode: Gallery (3 books overview) vs Detail
  try {
    const detailPanel = doc.querySelector(THREEUI_SELECTORS.detailPanel || "#detailPanel");
    const closeButton = doc.querySelector(THREEUI_SELECTORS.closeButton || "#closeButton");

    if (!isDetailOpen || selectedBook === null || selectedBook === undefined) {
      // GALLERY MODE: Show all 3 books in 3D overview, allow user to browse and pick
      if (doc.body) {
        doc.body.dataset.mode = "gallery";
      }
      cards.forEach((c) => {
        if (c.classList?.remove) c.classList.remove("selected");
        c.tabIndex = 0;
      });
      if (detailPanel) {
        detailPanel.setAttribute("aria-hidden", "true");
        detailPanel.inert = true;
      }
      if (closeButton) {
        closeButton.tabIndex = -1;
      }
    } else {
      // DETAIL MODE: Restore selected book detail drawer (e.g. returning from 3D Book)
      const targetIndex = Number(selectedBook);
      if (cards && cards.length > targetIndex) {
        const targetCard = cards[targetIndex];
        if (targetCard) {
          isRestoring = true;
          try {
            if (doc.body?.dataset?.mode !== "detail" && typeof targetCard.click === "function") {
              targetCard.click();
            }
            cards.forEach((c, idx) => {
              if (c.classList?.toggle) {
                c.classList.toggle("selected", idx === targetIndex);
              }
              c.tabIndex = -1;
            });
            if (doc.body) {
              doc.body.dataset.mode = "detail";
            }
            if (detailPanel) {
              detailPanel.setAttribute("aria-hidden", "false");
              detailPanel.inert = false;
            }
            if (closeButton) {
              closeButton.tabIndex = 0;
            }
            if (typeof targetCard.focus === "function") {
              targetCard.focus({ preventScroll: true });
            }
            updateDetailDrawer(targetIndex);
          } finally {
            isRestoring = false;
          }
        }
      }
    }
  } catch (err) {
    console.warn("[ThreeUiAdapter] Error synchronizing visual mode:", err);
  }

  // Return comprehensive cleanup
  return () => {
    while (cleanups.length > 0) {
      const fn = cleanups.pop();
      try {
        fn();
      } catch (e) {
        // ignore
      }
    }
  };
}
