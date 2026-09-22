import { THREEUI_SELECTORS, AUTHORED_BOOK_KEYS } from "./threeUiSelectors.js";
import { getBookByIndex } from "../content/bookContent.js";

/**
 * Injects Google Fonts (Playfair Display & Inter) and CSS overrides into ThreeUI iframe document.
 * Eliminates Vietnamese font split / missing glyph fallback issues on Windows.
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

    // 3. Style overrides for Vietnamese letter spacing and font stacks
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

          /* Reset negative letter-spacing that breaks Vietnamese diacritics */
          .hero-word {
            font-family: var(--serif) !important;
            letter-spacing: -0.02em !important;
          }

          .brand {
            font-family: var(--serif) !important;
            letter-spacing: normal !important;
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

          .detail-title {
            font-family: var(--serif) !important;
            letter-spacing: -0.01em !important;
            line-height: 1.15 !important;
          }

          .detail-description {
            font-family: var(--sans) !important;
            letter-spacing: normal !important;
            line-height: 1.6 !important;
            color: #d6cbb8 !important;
          }

          .doc-label {
            font-family: var(--sans) !important;
            letter-spacing: 0.08em !important;
            font-weight: 700 !important;
            text-transform: uppercase !important;
          }

          .doc-step-copy strong {
            font-family: var(--sans) !important;
            letter-spacing: normal !important;
            font-weight: 600 !important;
          }

          .doc-step-copy span {
            font-family: var(--sans) !important;
            letter-spacing: normal !important;
            line-height: 1.5 !important;
          }

          .prompt-block code, #detailPrompt {
            font-family: var(--sans) !important;
            letter-spacing: normal !important;
            line-height: 1.5 !important;
            font-size: 14px !important;
          }

          .doc-review {
            font-family: var(--serif) !important;
            letter-spacing: normal !important;
            font-style: italic !important;
            line-height: 1.5 !important;
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
            font-size: clamp(28px, 4vw, 54px) !important;
          }

          /* Clean up unused action rail elements so user focuses on the main CTA */
          .action-rail .pill.language,
          .action-rail .pill:not(.primary-cta):not(#saveButton),
          #saveButton {
            display: none !important;
          }

          /* Highlight primary reading CTA */
          .action-rail .primary-cta {
            min-width: 220px !important;
            font-weight: 700 !important;
            background: #eadfc7 !important;
            color: #29251d !important;
            box-shadow: 0 4px 18px rgba(0, 0, 0, 0.3) !important;
          }

          .action-rail .primary-cta:hover {
            background: #fff8e8 !important;
            transform: translateY(-2px) !important;
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
        "Bộ 3 tác phẩm chuyên khảo Chương 5 HCM202"
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
        detailSteps.innerHTML = book.chapters
          .map(
            (ch) =>
              `<li><span class="doc-step-copy"><strong>${ch.id || ""}</strong> <span>${ch.title || ""}</span></span></li>`
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
      if (reviewSource) reviewSource.textContent = "Giáo trình MLN";
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
      if (footer) footer.textContent = "HCM202 · CHƯƠNG 5";

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

  // 6. Bind Primary CTA button in action rail
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
  } catch (err) {
    console.warn("[ThreeUiAdapter] Error setting up CTA:", err);
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
