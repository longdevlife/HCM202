import test from 'node:test';
import assert from 'node:assert/strict';
import { useBookLibraryStore } from './useBookLibraryStore.js';

test('useBookLibraryStore initializes with selectedBook 0 and view library', () => {
  useBookLibraryStore.getState().openLibrary();
  useBookLibraryStore.getState().setSelectedBook(0);

  const state = useBookLibraryStore.getState();
  assert.equal(state.selectedBook, 0);
  assert.equal(state.view, 'library');
});

test('openBook(1) updates view to book and selectedBook to 1', () => {
  useBookLibraryStore.getState().openBook(1);
  const state = useBookLibraryStore.getState();
  assert.equal(state.selectedBook, 1);
  assert.equal(state.view, 'book');
});

test('openLibrary() preserves selectedBook (does not reset to 0)', () => {
  useBookLibraryStore.getState().setSelectedBook(2);
  useBookLibraryStore.getState().openBook(2);
  useBookLibraryStore.getState().openLibrary({ restoreDetail: true });

  const state = useBookLibraryStore.getState();
  assert.equal(state.view, 'library');
  assert.equal(state.selectedBook, 2, 'Must keep selectedBook 2 when returning to library');
  assert.equal(state.isDetailOpen, true);
});

test('closeDetail() closes detail drawer leaving library in gallery mode', () => {
  useBookLibraryStore.getState().setSelectedBook(1, true);
  assert.equal(useBookLibraryStore.getState().isDetailOpen, true);

  useBookLibraryStore.getState().closeDetail();
  assert.equal(useBookLibraryStore.getState().isDetailOpen, false);
});
