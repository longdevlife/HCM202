import { test } from "node:test";
import assert from "node:assert";
import {
  ALL_PUZZLE_QUESTIONS,
  MYSTERY_KEYWORD,
  MYSTERY_IMAGE_SRC,
  getRandomizedPuzzleSet,
} from "./puzzleData.js";

test("ALL_PUZZLE_QUESTIONS contains exactly 10 valid questions matching user content", () => {
  assert.strictEqual(ALL_PUZZLE_QUESTIONS.length, 10, "Must have exactly 10 questions in bank");

  const expectedAnswers = ["B", "C", "B", "A", "B", "C", "D", "A", "B", "A"];

  ALL_PUZZLE_QUESTIONS.forEach((q, idx) => {
    assert.ok(q.id, `Question ${idx + 1} has id`);
    assert.ok(q.question && q.question.length > 10, `Question ${idx + 1} has question text`);
    assert.strictEqual(q.options.length, 4, `Question ${idx + 1} has 4 options`);
    assert.strictEqual(q.correctId, expectedAnswers[idx], `Question ${idx + 1} correct option matches user definition`);

    const correctOpts = q.options.filter((o) => o.isCorrect);
    assert.strictEqual(correctOpts.length, 1, `Question ${idx + 1} has exactly 1 correct option`);
    assert.strictEqual(correctOpts[0].id, q.correctId, `Option id marked correct matches correctId`);
    assert.ok(q.explanation && q.explanation.length > 10, `Question ${idx + 1} has explanation`);
  });
});

test("getRandomizedPuzzleSet generates exactly 9 pieces with valid 3x3 grid coordinates", () => {
  const puzzleSet = getRandomizedPuzzleSet();
  assert.strictEqual(puzzleSet.length, 9, "Must generate exactly 9 puzzle pieces");

  const numbers = puzzleSet.map((p) => p.pieceNumber);
  assert.deepStrictEqual(numbers, [1, 2, 3, 4, 5, 6, 7, 8, 9]);

  const uniqueQuestionIds = new Set(puzzleSet.map((p) => p.question.id));
  assert.strictEqual(uniqueQuestionIds.size, 9, "All 9 questions in the active puzzle must be distinct");

  // Verify coordinates form 3x3 grid
  puzzleSet.forEach((p, idx) => {
    assert.strictEqual(p.pieceIndex, idx);
    assert.strictEqual(p.row, Math.floor(idx / 3));
    assert.strictEqual(p.col, idx % 3);
  });
});

test("MYSTERY_KEYWORD matches the exact user-requested national conference title", () => {
  const expectedKeyword =
    "Hội nghị toàn quốc tổng kết Chương trình mục tiêu quốc gia xây dựng nông thôn mới, Chương trình mục tiêu quốc gia giảm nghèo bền vững giai đoạn 2021 - 2025";
  assert.strictEqual(MYSTERY_KEYWORD, expectedKeyword);
  assert.ok(MYSTERY_IMAGE_SRC.includes("hoi_nghi_tong_ket.jpg"));
});
