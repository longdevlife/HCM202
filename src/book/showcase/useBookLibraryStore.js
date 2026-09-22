import { create } from "zustand";

const clampBookIndex = (index) => Math.max(0, Math.min(2, Number(index) || 0));

export const useBookLibraryStore = create((set) => ({
  selectedBook: 0,
  view: "library",

  setSelectedBook: (index) => set({ selectedBook: clampBookIndex(index) }),

  openBook: (index) =>
    set({
      selectedBook: clampBookIndex(index),
      view: "magazine",
    }),

  openLibrary: () => set({ view: "library" }),
}));
