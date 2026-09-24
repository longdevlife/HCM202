import { test } from "node:test";
import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";
import {
  ALL_PUZZLE_QUESTIONS,
  PUZZLE_GRID_LAYOUT,
  getInitialPuzzleGrid,
  MYSTERY_TITLE,
  FULL_IMAGE_SRC,
} from "./puzzleData.js";

test("ALL_PUZZLE_QUESTIONS contains exactly 9 valid questions matching user content", () => {
  assert.strictEqual(ALL_PUZZLE_QUESTIONS.length, 9, "Must have exactly 9 questions");

  // Expected answers from user prompt:
  // Câu 1: B
  // Câu 2: C
  // Câu 3: B
  // Câu 4: A
  // Câu 5: B
  // Câu 6: C (Dịch vụ - 40,8%)
  // Câu 7: D
  // Câu 8: A
  // Câu 9: A
  const expectedAnswers = ["B", "C", "B", "A", "B", "C", "D", "A", "A"];

  ALL_PUZZLE_QUESTIONS.forEach((q, idx) => {
    assert.strictEqual(q.qNum, idx + 1, `Question ${idx + 1} has qNum ${idx + 1}`);
    assert.ok(q.question && q.question.length > 10, `Question ${idx + 1} has question text`);
    assert.strictEqual(q.options.length, 4, `Question ${idx + 1} has 4 options`);
    assert.strictEqual(
      q.correctId,
      expectedAnswers[idx],
      `Question ${idx + 1} correct option is ${expectedAnswers[idx]}`
    );

    const correctOpts = q.options.filter((o) => o.isCorrect);
    assert.strictEqual(correctOpts.length, 1, `Question ${idx + 1} has exactly 1 correct option`);
    assert.strictEqual(correctOpts[0].id, q.correctId, `Option id matches correctId`);
    assert.ok(q.explanation && q.explanation.length > 10, `Question ${idx + 1} has explanation`);
  });
});

test("PUZZLE_GRID_LAYOUT accurately reflects the user's hand-drawn 3x3 layout", () => {
  // Screenshot mapping:
  // [9, 1, 2]
  // [4, 6, 8]
  // [5, 7, 3]
  const expectedLayout = [
    { row: 0, col: 0, qNum: 9 },
    { row: 0, col: 1, qNum: 1 },
    { row: 0, col: 2, qNum: 2 },
    { row: 1, col: 0, qNum: 4 },
    { row: 1, col: 1, qNum: 6 },
    { row: 1, col: 2, qNum: 8 },
    { row: 2, col: 0, qNum: 5 },
    { row: 2, col: 1, qNum: 7 },
    { row: 2, col: 2, qNum: 3 },
  ];

  assert.strictEqual(PUZZLE_GRID_LAYOUT.length, 9);
  expectedLayout.forEach((expected, i) => {
    const actual = PUZZLE_GRID_LAYOUT[i];
    assert.strictEqual(actual.row, expected.row);
    assert.strictEqual(actual.col, expected.col);
    assert.strictEqual(actual.qNum, expected.qNum);
  });
});

test("getInitialPuzzleGrid generates 9 grid pieces with corresponding questions and image paths", () => {
  const grid = getInitialPuzzleGrid();
  assert.strictEqual(grid.length, 9);

  grid.forEach((piece) => {
    assert.ok(piece.question, `Grid cell for qNum ${piece.qNum} has question attached`);
    assert.strictEqual(piece.question.qNum, piece.qNum);
    assert.ok(piece.pieceImage.includes(`piece_cau_${piece.qNum}.jpg`));
  });
});

test("All 9 sliced piece image files exist on disk in public directory", () => {
  for (let qNum = 1; qNum <= 9; qNum++) {
    const piecePath = path.resolve(
      process.cwd(),
      "public",
      "images",
      "truytimmanhghep",
      "pieces",
      `piece_cau_${qNum}.jpg`
    );
    assert.ok(fs.existsSync(piecePath), `Piece image for Câu ${qNum} exists at ${piecePath}`);
  }

  const fullImgPath = path.resolve(
    process.cwd(),
    "public",
    "images",
    "truytimmanhghep",
    "cocauxahoigiaicap.jpg"
  );
  assert.ok(fs.existsSync(fullImgPath), `Full original image exists at ${fullImgPath}`);
});

test("MYSTERY_TITLE matches lesson theme", () => {
  assert.strictEqual(
    MYSTERY_TITLE,
    "CÔNG NGHIỆP HÓA, HIỆN ĐẠI HÓA ĐẤT NƯỚC - XÂY DỰNG XÃ HỘI MỚI"
  );
  assert.strictEqual(FULL_IMAGE_SRC, "/images/truytimmanhghep/cocauxahoigiaicap.jpg");
});
