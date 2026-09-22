import { test } from "node:test";
import assert from "node:assert";
import { DEFAULT_QUESTIONS, WHEEL_SLICES, LESSON_SUMMARY } from "./wheelData.js";

test("DEFAULT_QUESTIONS contains exactly 5 valid questions for Chapter 5", () => {
  assert.strictEqual(DEFAULT_QUESTIONS.length, 5, "Must have exactly 5 questions");

  DEFAULT_QUESTIONS.forEach((q, idx) => {
    assert.strictEqual(q.num, idx + 1, `Question ${idx + 1} has correct index`);
    assert.ok(q.title && q.title.length > 0, `Question ${idx + 1} has a title`);
    assert.ok(q.question && q.question.length > 10, `Question ${idx + 1} has valid text`);
    assert.ok(q.options && q.options.length === 4, `Question ${idx + 1} has 4 options`);

    // Verify exactly one option is correct
    const correctOptions = q.options.filter((o) => o.isCorrect === true);
    assert.strictEqual(correctOptions.length, 1, `Question ${idx + 1} must have exactly 1 correct answer`);

    assert.ok(q.explanation && q.explanation.length > 10, `Question ${idx + 1} has academic explanation`);
  });
});

test("WHEEL_SLICES contains valid slices covering all 5 questions", () => {
  assert.ok(WHEEL_SLICES.length >= 5, "Wheel has at least 5 slices");

  // Every question 1 to 5 must have a corresponding slice
  for (let i = 1; i <= 5; i++) {
    const qId = `q${i}`;
    const slice = WHEEL_SLICES.find((s) => s.type === "question" && s.questionId === qId);
    assert.ok(slice, `Wheel slice exists for question ${qId}`);
    assert.ok(slice.label && slice.label.length > 0, `Slice for ${qId} has label`);
    assert.ok(slice.color && slice.color.startsWith("#"), `Slice for ${qId} has valid hex color`);
  }
});

test("LESSON_SUMMARY contains comprehensive Chapter 5 takeaways and quote", () => {
  assert.ok(LESSON_SUMMARY.header, "Lesson summary has header");
  assert.ok(LESSON_SUMMARY.header.title.length > 0, "Summary has title");
  assert.strictEqual(LESSON_SUMMARY.takeaways.length, 5, "Summary has 5 key takeaways");

  LESSON_SUMMARY.takeaways.forEach((t, i) => {
    assert.strictEqual(t.num, `0${i + 1}`, `Takeaway ${i + 1} has proper numbering`);
    assert.ok(t.title && t.title.length > 0, `Takeaway ${i + 1} has title`);
    assert.ok(t.content && t.content.length > 20, `Takeaway ${i + 1} has detailed content`);
  });

  assert.ok(LESSON_SUMMARY.quote.text.length > 0, "Summary has quote");
  assert.ok(LESSON_SUMMARY.quote.source.length > 0, "Summary has quote source");
});
