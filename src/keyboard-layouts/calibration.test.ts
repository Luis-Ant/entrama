import { describe, expect, it } from "vitest";
import {
  CALIBRATION_RESULT,
  evaluateCalibration,
  validateLayoutDefinition,
} from "./calibration";
import type { CalibrationEvidence, LayoutDefinitionV1 } from "./types";

const modifiers = {
  altKey: false,
  ctrlKey: false,
  metaKey: false,
  shiftKey: false,
} as const;
const step = {
  id: "accent-a",
  mandatory: true,
  code: "KeyA",
  ...modifiers,
  expected: "á",
  allowComposition: true,
} as const;
const definition = (expected: string = step.expected): LayoutDefinitionV1 => ({
  schemaVersion: 1,
  definitionId: "windows-us-int-v1",
  layoutProfileId: "windows-us-international",
  version: 1,
  steps: [{ ...step, expected }],
});
const baseEvidence = {
  code: "KeyA",
  ...modifiers,
  committed: "á",
  inputType: "insertText",
  composing: false,
  cancelled: false,
  repeat: false,
} as const;
function result(
  overrides: Partial<CalibrationEvidence> = {},
  current = definition(),
  passed: readonly string[] = [],
) {
  return evaluateCalibration(current, passed, {
    ...baseEvidence,
    ...overrides,
  });
}

describe("layout definition validation", () => {
  it("rejects missing, duplicate, and incomplete stable IDs", () => {
    const invalid = {
      ...definition(),
      definitionId: "",
      steps: [{ ...step, code: "" }, step],
    };
    expect(validateLayoutDefinition(invalid)).toEqual([
      "definitionId is required",
      "step IDs must be unique",
      "step accent-a code is required",
    ]);
  });
  it.each(["a\u0301", "ab", ""])('rejects invalid grapheme "%s"', (value) => {
    expect(validateLayoutDefinition(definition(value))).toContain(
      "step accent-a expected must be one NFC grapheme",
    );
  });
});

describe("calibration evaluation", () => {
  it("ignores composition updates and accepts the final commit", () => {
    expect(result({ composing: true }).result).toBe(CALIBRATION_RESULT.IGNORED);
    expect(result({ committed: "" }).result).toBe(CALIBRATION_RESULT.IGNORED);
    expect(result({ committed: "´" }).result).toBe(CALIBRATION_RESULT.IGNORED);
    expect(result().result).toBe(CALIBRATION_RESULT.COMPLETE);
  });
  it.each([
    ["physical mismatch", { code: "KeyB" }],
    ["grapheme mismatch", { committed: "a" }],
    ["multi-grapheme", { committed: "áa" }],
    ["cancellation", { cancelled: true }],
    ["repeat", { repeat: true }],
    ["paste", { inputType: "insertFromPaste" }],
    ["replacement", { inputType: "insertReplacementText" }],
    ["deletion", { inputType: "deleteContentBackward", committed: "" }],
  ])("fails closed for %s", (_name, unsafe) => {
    expect(result(unsafe).result).toBe(CALIBRATION_RESULT.FAILED);
  });
  it("requires valid mandatory progress in order", () => {
    const steps = [step, { ...step, id: "accent-b", code: "KeyB" }];
    const current = { ...definition(), steps };
    expect(result({ code: "KeyB" }, current).result).toBe(
      CALIBRATION_RESULT.FAILED,
    );
    const first = result({}, current);
    expect(first.passedStepIds).toEqual(["accent-a"]);
    expect(result({ code: "KeyB" }, current, ["unknown"]).result).toBe(
      CALIBRATION_RESULT.FAILED,
    );
    expect(result({ code: "KeyB" }, current, first.passedStepIds).result).toBe(
      CALIBRATION_RESULT.COMPLETE,
    );
  });
  it("refuses to evaluate an invalid definition", () => {
    expect(result({}, { ...definition(), definitionId: "" }).result).toBe(
      CALIBRATION_RESULT.FAILED,
    );
  });
});
