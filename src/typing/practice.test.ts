import { describe, expect, it } from "vitest";

import {
  INPUT_OUTCOME,
  PRACTICE_PHASE,
  consumeCommittedText,
  createPracticeState,
  getExpectedGrapheme,
  segmentGraphemes,
  type PracticeState,
  type PracticeUnit,
} from "./practice";

const UNITS: readonly PracticeUnit[] = [
  { id: "hello-hola", english: "hi", spanish: "sí" },
  { id: "home-casa", english: "home", spanish: "casa" },
];

function typeText(state: PracticeState, text: string): PracticeState {
  return segmentGraphemes(text).reduce(
    (current, grapheme) => consumeCommittedText(current, grapheme).state,
    state,
  );
}

describe("practice progression", () => {
  it("blocks progression after an incorrect grapheme until corrected", () => {
    const initial = createPracticeState(UNITS);
    const incorrect = consumeCommittedText(initial, "x");

    expect(incorrect.outcome).toBe(INPUT_OUTCOME.INCORRECT);
    expect(incorrect.state.position).toBe(0);
    expect(incorrect.state.errors).toBe(1);
    expect(incorrect.state.blockedByError).toBe(true);

    const corrected = consumeCommittedText(incorrect.state, "h");

    expect(corrected.outcome).toBe(INPUT_OUTCOME.CORRECT);
    expect(corrected.state.position).toBe(1);
    expect(corrected.state.blockedByError).toBe(false);
  });

  it("moves directly from English to Spanish", () => {
    const state = typeText(createPracticeState(UNITS), "hi");

    expect(state.phase).toBe(PRACTICE_PHASE.SPANISH);
    expect(state.position).toBe(0);
    expect(getExpectedGrapheme(state)).toBe("s");
  });

  it("compares canonically equivalent committed graphemes", () => {
    const spanishState = typeText(createPracticeState(UNITS), "hisi");
    const result = consumeCommittedText(spanishState, "\u0301");

    expect(result.outcome).toBe(INPUT_OUTCOME.INCORRECT);

    const accentResult = consumeCommittedText(spanishState, "i\u0301");

    expect(accentResult.outcome).toBe(INPUT_OUTCOME.CORRECT);
    expect(accentResult.state.unitIndex).toBe(1);
  });

  it("automatically starts the next block after the final Spanish form", () => {
    const firstUnitComplete = typeText(
      createPracticeState(UNITS),
      "hisi\u0301",
    );
    const completedBlock = typeText(firstUnitComplete, "homecasa");

    expect(completedBlock.completedBlocks).toBe(1);
    expect(completedBlock.completedUnits).toBe(2);
    expect(completedBlock.unitIndex).toBe(0);
    expect(completedBlock.phase).toBe(PRACTICE_PHASE.ENGLISH);
  });

  it("rejects multi-grapheme insertions without changing progress", () => {
    const initial = createPracticeState(UNITS);
    const result = consumeCommittedText(initial, "hi");

    expect(result.outcome).toBe(INPUT_OUTCOME.REJECTED);
    expect(result.state).toBe(initial);
  });
});
