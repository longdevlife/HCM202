import { THREEUI_SELECTORS, AUTHORED_BOOK_KEYS } from "./threeUiSelectors.js";
import { getBookByIndex } from "../content/bookContent.js";

/**
 * Binds Chapter 5 academic content and React state bridges to an authored ThreeUI showcase iframe.
 *
 * @param {Object} params
 * @param {HTMLIFrameElement} params.iframe - The ThreeUI iframe element
 * @param {Array} params.books - The single-source book content array
 * @param {number} params.selectedBook - Currently active book index (0, 1, 2)
 * @param {Function} params.onSelectBook - Callback when user selects a book
 * @param {Function} params.onOpenBook - Callback when user clicks CTA to open 3D Book
 * @returns {Function} cleanup - Function to unbind all listeners on unmount/reload
 */
export function bindThreeUiShowcase({
  iframe,
  books = [],
  selectedBook = 0,
  onSelectBook,
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
  let currentSelectedIndex = Number(selectedBook) || 0;
  let isRestoring = false;

  // 1. Update Topbar & Brand headers if present
  try {
    const heroWord = doc.querySelector(THREEUI_SELECTORS.heroWord);
    if (heroWord) heroWord.textContent = "CHƯƠNG 5";

    const brand = doc.querySelector(THREEUI_SELECTORS.brand);
    if (brand) brand.textContent = "TỦ SÁCH HỌC THUẬT";

    const metaSub = doc.querySelector(THREEUI_SELECTORS.metaSub);
    if (metaSub) metaSub.textContent = "Giáo trình và tư liệu nghiên cứu Cơ cấu xã hội – giai cấp.";
  } catch (err) {
    console.warn("[ThreeUiAdapter] Error updating topbar branding:", err);
  }

  // 2. Helper to update detail drawer copy
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
              `<li><strong>${ch.id || ""}</strong> ${ch.title || ""}</li>`
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

  // 3. Inject Vietnamese cover copy on the 3 book cards & bind click
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
        onSelectBook?.(index);
        // Delay slightly so ThreeUI's internal selectBook() finishes, then re-apply our copy
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

  // 4. Bind Primary CTA button in action rail
  try {
    const primaryCta = doc.querySelector(THREEUI_SELECTORS.primaryCta);
    if (primaryCta) {
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

  // 5. Restore authored ThreeUI visual selected state (e.g. returning from 3D Book)
  try {
    if (cards && cards.length > currentSelectedIndex) {
      const targetCard = cards[currentSelectedIndex];
      if (targetCard) {
        isRestoring = true;
        // Trigger ThreeUI's native selectBook handler on the card
        if (typeof targetCard.click === "function") {
          targetCard.click();
        }
        // Ensure authored classes and dataset are definitively applied
        cards.forEach((c, idx) => {
          if (c.classList?.toggle) {
            c.classList.toggle("selected", idx === currentSelectedIndex);
          }
        });
        if (doc.body) {
          doc.body.dataset.mode = "detail";
        }
        const detailPanel = doc.querySelector(THREEUI_SELECTORS.detailPanel || "#detailPanel");
        if (detailPanel) {
          detailPanel.setAttribute("aria-hidden", "false");
          detailPanel.inert = false;
        }
        if (typeof targetCard.focus === "function") {
          targetCard.focus({ preventScroll: true });
        }
      }
    }
  } catch (err) {
    console.warn("[ThreeUiAdapter] Error restoring authored visual selection:", err);
  } finally {
    isRestoring = false;
  }

  // 6. Initial sync of detail drawer copy
  updateDetailDrawer(currentSelectedIndex);

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
