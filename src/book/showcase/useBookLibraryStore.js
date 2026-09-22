import zustand from "zustand";

const create = typeof zustand === "function" ? zustand : zustand.create;

const clampBookIndex = (index) => Math.max(0, Math.min(2, Number(index) || 0));

export const useBookLibraryStore = create((set) => ({
  selectedBook: null,
  isDetailOpen: false,
  view: "library",

  setSelectedBook: (index, openDetail = true) =>
    set({
      selectedBook: index !== null && index !== undefined ? clampBookIndex(index) : null,
      isDetailOpen: Boolean(openDetail),
    }),

  closeDetail: () =>
    set({
      isDetailOpen: false,
    }),

  openBook: (index) =>
    set((state) => ({
      selectedBook: index !== undefined && index !== null ? clampBookIndex(index) : (state.selectedBook ?? 0),
      isDetailOpen: true,
      view: "book",
    })),

  openLibrary: (options = {}) =>
    set((state) => ({
      view: "library",
      isDetailOpen: options.restoreDetail !== undefined ? Boolean(options.restoreDetail) : state.isDetailOpen,
    })),
}));
