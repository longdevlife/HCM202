import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { HAZARD_METADATA, HAZARD_QUESTIONS, getHazardQuestion } from "./hazardQuestions.js";

describe("Hazard Questions Suite", () => {
  it("every hazard type in HAZARD_QUESTIONS has valid questions", () => {
    for (const [type, questions] of Object.entries(HAZARD_QUESTIONS)) {
      assert.ok(Array.isArray(questions) && questions.length > 0, `${type} must have non-empty questions array`);
      for (const q of questions) {
        assert.ok(typeof q.id === "string" && q.id.length > 0, `Question id must be non-empty string in ${type}`);
        assert.ok(typeof q.question === "string" && q.question.length > 0, `Question text must be non-empty string in ${type}`);
        assert.ok(Array.isArray(q.options) && q.options.length >= 2, `Question options must have at least 2 choices in ${type}`);
        assert.ok(q.correctIndex >= 0 && q.correctIndex < q.options.length, `correctIndex must be in options range in ${type}`);
        assert.ok(q.rewardScore > 0, `rewardScore must be positive in ${type}`);
        assert.ok(q.penaltyScore < 0, `penaltyScore must be negative in ${type}`);
        assert.ok(typeof q.explanation === "string" && q.explanation.length > 0, `explanation must be provided in ${type}`);
      }
    }
  });

  it("getHazardQuestion returns valid question for all known hazard types and unknown fallbacks", () => {
    const knownTypes = [
      "buck_passing",
      "late_deadline",
      "delay",
      "bureaucracy",
      "envelope",
      "waste",
      "group_interest",
      "personal_gain",
      "achievement_disease",
      "privilege",
      "unknown_custom_type",
    ];

    for (const type of knownTypes) {
      const q = getHazardQuestion(type, 123);
      assert.ok(q, `Should return question for ${type}`);
      assert.ok(q.question, `Should have question text for ${type}`);
      assert.ok(q.options.length >= 2, `Should have options for ${type}`);
      assert.ok(q.metadata, `Should include metadata for ${type}`);
      assert.ok(q.correctIndex >= 0 && q.correctIndex < q.options.length, `correctIndex must be in range for ${type}`);
    }
  });

  it("correct answers are distributed across multiple option positions (not always A / 0)", () => {
    const correctIndicesFound = new Set();

    for (const type of Object.keys(HAZARD_QUESTIONS)) {
      for (let seed = 1; seed <= 20; seed++) {
        const q = getHazardQuestion(type, seed * 101);
        correctIndicesFound.add(q.correctIndex);
      }
    }

    assert.ok(correctIndicesFound.has(0), "Should have correct answers at position A (0)");
    assert.ok(correctIndicesFound.has(1), "Should have correct answers at position B (1)");
    assert.ok(correctIndicesFound.has(2), "Should have correct answers at position C (2)");
  });
});
