import test from 'node:test';
import assert from 'node:assert/strict';
import { BOOKS, getBookByIndex, isBookReady } from './bookContent.js';

test('BOOKS has exactly 3 volumes with correct Roman numerals', () => {
  assert.equal(BOOKS.length, 3);
  assert.equal(BOOKS[0].roman, 'I');
  assert.equal(BOOKS[1].roman, 'II');
  assert.equal(BOOKS[2].roman, 'III');
});

test('Volume readiness follows Hybrid strategy: Book I ready, II and III not ready', () => {
  assert.equal(isBookReady(0), true);
  assert.equal(isBookReady(1), false);
  assert.equal(isBookReady(2), false);
});

test('getBookByIndex clamps negative and out-of-range indices safely', () => {
  assert.equal(getBookByIndex(-1).id, 0);
  assert.equal(getBookByIndex(0).id, 0);
  assert.equal(getBookByIndex(1).id, 1);
  assert.equal(getBookByIndex(2).id, 2);
  assert.equal(getBookByIndex(99).id, 2);
  assert.equal(getBookByIndex('invalid').id, 0);
});

test('Volume II mapping matches Chapter 5 Section 2 and avoids stale ThreeUI names', () => {
  const book2 = BOOKS[1];
  assert.deepEqual(book2.cover.title, ['BIẾN ĐỔI', 'CÓ TÍNH QUY LUẬT']);
  assert.equal(book2.cover.subtitle, 'Kinh tế · tầng lớp · liên minh');
  assert.equal(book2.detail.title, 'Sự biến đổi có tính quy luật của cơ cấu xã hội – giai cấp');

  // Verify absence of ThreeUI stale names
  const serialized = JSON.stringify(BOOKS);
  assert.ok(!serialized.includes('Codex'), 'Must not contain Codex');
  assert.ok(!serialized.includes('Claude'), 'Must not contain Claude');
  assert.ok(!serialized.includes('Cursor'), 'Must not contain Cursor');
  assert.ok(!serialized.includes('Field Manuals'), 'Must not contain Field Manuals');
});

test('Volume III mapping matches Chapter 5 Section 3 with 4 major classes/strata', () => {
  const book3 = BOOKS[2];
  assert.equal(book3.detail.title, 'Cơ cấu xã hội – giai cấp ở Việt Nam trong thời kỳ quá độ lên CNXH');
  assert.deepEqual(book3.cover.title, ['VIỆT NAM', 'TRONG THỜI KỲ QUÁ ĐỘ']);
  assert.equal(book3.cover.subtitle, 'Công nhân · nông dân · trí thức · doanh nhân');
  assert.deepEqual(book3.detail.keywords, ['CÔNG NHÂN', 'NÔNG DÂN', 'TRÍ THỨC', 'DOANH NHÂN']);

  const chapterTitles = book3.chapters.map((c) => c.title);
  assert.deepEqual(chapterTitles, [
    'Giai cấp công nhân',
    'Giai cấp nông dân',
    'Đội ngũ trí thức',
    'Đội ngũ doanh nhân',
    'Tổng kết',
  ]);

  // Ensure Phụ nữ and Thanh niên are not present in Volume III chapters
  const allSerialized = JSON.stringify(book3.chapters);
  assert.ok(!allSerialized.includes('Phụ nữ'), 'Must not include Phụ nữ');
  assert.ok(!allSerialized.includes('Thanh niên'), 'Must not include Thanh niên');
});

