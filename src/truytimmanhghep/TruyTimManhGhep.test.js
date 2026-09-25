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

test("GameRulesModal component file exists and contains all required game rules and scoring details", () => {
  const modalPath = path.resolve(process.cwd(), "src", "truytimmanhghep", "GameRulesModal.jsx");
  assert.ok(fs.existsSync(modalPath), "GameRulesModal.jsx must exist");

  const content = fs.readFileSync(modalPath, "utf-8");

  // Vòng/Phần 1 rules
  assert.ok(content.includes("PHẦN 1") || content.includes("VÒNG 1"), "Must include PHẦN 1 or VÒNG 1");
  assert.ok(content.includes("TRUY TÌM MẢNH GHÉP"), "Must include TRUY TÌM MẢNH GHÉP");
  assert.ok(content.includes("5 điểm/câu"), "Must specify 5 points per correct question");
  assert.ok(content.includes("mất 5đ"), "Must specify -5đ / lock when wrong");

  // Vòng/Phần 2 rules
  assert.ok(content.includes("PHẦN 2") || content.includes("VÒNG 2"), "Must include PHẦN 2 or VÒNG 2");
  assert.ok(content.includes("30 điểm"), "Must specify 30 points for mystery keyword");
  assert.ok(content.includes("20 điểm") && content.includes("Nhanh nhất"), "Must specify 20 points for 1st fastest team");
  assert.ok(content.includes("15 điểm") && content.includes("Nhanh thứ hai"), "Must specify 15 points for 2nd fastest team");
  assert.ok(content.includes("10 điểm") && content.includes("Nhanh thứ ba"), "Must specify 10 points for 3rd fastest team");
  assert.ok(content.includes("Các nhóm còn lại không được cộng điểm tốc độ"), "Must specify remaining teams get no speed bonus");

  // Scoring formula & victory condition
  assert.ok(content.includes("Điểm cuối cùng mỗi nhóm =") && content.includes("Điểm trả lời đúng") && content.includes("Điểm đoán hình") && content.includes("Điểm tốc độ"), "Must state total score formula");
  assert.ok(content.includes("giành chiến thắng"), "Victory condition present");
});

test("TruyTimManhGhepGame.jsx mounts GameRulesModal and provides rules button and tab listener", () => {
  const gamePath = path.resolve(process.cwd(), "src", "truytimmanhghep", "TruyTimManhGhepGame.jsx");
  const content = fs.readFileSync(gamePath, "utf-8");

  assert.ok(content.includes("GameRulesModal"), "TruyTimManhGhepGame imports GameRulesModal");
  assert.ok(content.includes("isRulesModalOpen"), "State isRulesModalOpen is declared");
  assert.ok(content.includes("open-truytimmanhghep-rules"), "CustomEvent listener for open-truytimmanhghep-rules exists");
  assert.ok(content.includes("Thể lệ trò chơi"), "Button to open rules modal is present");
  assert.ok(content.includes("<GameRulesModal"), "GameRulesModal is rendered in JSX");
});

test("GameRulesModal uses clean, elegant slide styling matching user sample", () => {
  const modalPath = path.resolve(process.cwd(), "src", "truytimmanhghep", "GameRulesModal.jsx");
  const content = fs.readFileSync(modalPath, "utf-8");

  assert.ok(content.includes("#faf6ed"), "Uses clean warm cream parchment background");
  assert.ok(content.includes("Playfair Display"), "Uses elegant serif typography matching sample");
});

test("PuzzleQuestionModal unifies font to Inter and cleanly separates answer check vs piece reveal", () => {
  const modalPath = path.resolve(process.cwd(), "src", "truytimmanhghep", "PuzzleQuestionModal.jsx");
  const content = fs.readFileSync(modalPath, "utf-8");

  // Single clean typography
  assert.ok(content.includes("fontFamily: \"'Inter', sans-serif\""), "Uses unified Inter font format");
  assert.ok(!content.includes("Playfair Display"), "Does not mix Playfair Display into puzzle questions/answers");

  // Answer phase shows right/wrong directly
  assert.ok(content.includes("isAnswerChecked"), "Tracks answer checking in the answer phase");
  assert.ok(content.includes("isThisCorrect"), "Highlights correct option directly on answer choices");

  // Piece reveal phase shows only the piece without explanation recap
  assert.ok(content.includes("isPieceRevealed"), "Has separate piece reveal phase");
  assert.ok(!content.includes("Ghi nhớ trọng tâm bài học"), "Does not show explanation text in piece reveal");
});

test("PuzzleQuestionCard designs clean jigsaw puzzle piece without topic, level, or CTA text", () => {
  const cardPath = path.resolve(process.cwd(), "src", "truytimmanhghep", "PuzzleQuestionCard.jsx");
  const content = fs.readFileSync(cardPath, "utf-8");

  // Interlocking puzzle piece SVG path
  assert.ok(content.includes("generatePuzzlePath"), "Uses jigsaw puzzle path generator");
  assert.ok(content.includes("PUZZLE_TAB_CONFIGS"), "Has jigsaw interlocking tabs config");

  // Removed clutter per user request
  assert.ok(!content.includes("question.tag"), "Does not show topic tag");
  assert.ok(!content.includes("question.level"), "Does not show difficulty / recognition level");
  assert.ok(!content.includes("Bấm để mở câu hỏi"), "Does not show verbose CTA text");

  // Features clean puzzle piece number
  assert.ok(content.includes("MẢNH GHÉP {question.qNum}") || content.includes("{question.qNum}"), "Displays puzzle piece number cleanly");
});

test("PuzzleAssemblyStage uses clean light background matching question modal and unified Inter typography", () => {
  const stagePath = path.resolve(process.cwd(), "src", "truytimmanhghep", "PuzzleAssemblyStage.jsx");
  const content = fs.readFileSync(stagePath, "utf-8");

  // Light background matching question modal
  assert.ok(content.includes("#faf7f2"), "Uses #faf7f2 light cream background matching question modal");
  assert.ok(content.includes("fontFamily: \"'Inter', sans-serif\""), "Uses unified Inter font format");

  // Question & Answer formatting
  assert.ok(content.includes("CÂU HỎI QUY LUẬT TRANH"), "Has question section header");
  assert.ok(content.includes("ĐÁP ÁN CHÍNH XÁC"), "Has answer section header");
  assert.ok(content.includes("mối quan hệ vừa đấu tranh, vừa liên minh, từng bước xóa bỏ bất bình đẳng xã hội dẫn đến sự xích lại gần nhau"), "Has exact answer copy");
});

