import { create } from "zustand";

const clampBookIndex = (index) => Math.max(0, Math.min(2, Number(index) || 0));

export const useBookLibraryStore = create((set) => ({
  selectedBook: 0,
  view: "library",

  setSelectedBook: (index) => set({ selectedBook: clampBookIndex(index) }),

  openBook: (index) =>
    set((state) => ({
      selectedBook: index !== undefined ? clampBookIndex(index) : state.selectedBook,
      view: "book",
    })),

  openLibrary: () => set({ view: "library" }),
}));
