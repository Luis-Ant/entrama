import { describe, expect, it } from "vitest";
import {
  evaluateCalibration,
  validateLayoutDefinition,
  CALIBRATION_RESULT,
} from "./calibration";
import {
  KEYBOARD_DEFINITIONS,
  MACOS_LATIN_AMERICAN_QWERTY_DEFINITION,
  MACOS_US_INTERNATIONAL_DEFINITION,
  WINDOWS_LATIN_AMERICAN_QWERTY_DEFINITION,
  WINDOWS_US_INTERNATIONAL_DEFINITION,
} from "./definitions";
import { LAYOUT_PROFILE_ID } from "./types";
import type { CalibrationEvidence, LayoutDefinitionV1 } from "./types";

const EXPECTED_STEP_IDS = [
  "accent-acute-a",
  "letter-enye",
  "letter-udiaeresis",
  "punctuation-open-question",
  "punctuation-question",
  "punctuation-open-exclamation",
  "punctuation-exclamation",
] as const;

describe("keyboard definitions", () => {
  const allDefinitions: LayoutDefinitionV1[] = [
    MACOS_US_INTERNATIONAL_DEFINITION,
    MACOS_LATIN_AMERICAN_QWERTY_DEFINITION,
    WINDOWS_US_INTERNATIONAL_DEFINITION,
    WINDOWS_LATIN_AMERICAN_QWERTY_DEFINITION,
  ];

  it("exports KEYBOARD_DEFINITIONS matching all 4 layout profile IDs", () => {
    expect(Object.keys(KEYBOARD_DEFINITIONS)).toHaveLength(4);
    expect(KEYBOARD_DEFINITIONS[LAYOUT_PROFILE_ID.MACOS_US_INTERNATIONAL]).toBe(
      MACOS_US_INTERNATIONAL_DEFINITION,
    );
    expect(
      KEYBOARD_DEFINITIONS[LAYOUT_PROFILE_ID.MACOS_LATIN_AMERICAN_QWERTY],
    ).toBe(MACOS_LATIN_AMERICAN_QWERTY_DEFINITION);
    expect(
      KEYBOARD_DEFINITIONS[LAYOUT_PROFILE_ID.WINDOWS_US_INTERNATIONAL],
    ).toBe(WINDOWS_US_INTERNATIONAL_DEFINITION);
    expect(
      KEYBOARD_DEFINITIONS[LAYOUT_PROFILE_ID.WINDOWS_LATIN_AMERICAN_QWERTY],
    ).toBe(WINDOWS_LATIN_AMERICAN_QWERTY_DEFINITION);
  });

  it("ensures all 4 definitions are valid with schemaVersion 1 and version 1", () => {
    for (const def of allDefinitions) {
      expect(def.schemaVersion).toBe(1);
      expect(def.version).toBe(1);
      expect(validateLayoutDefinition(def)).toEqual([]);
    }
  });

  it("ensures definitions and step lists are frozen / immutable", () => {
    for (const def of allDefinitions) {
      expect(Object.isFrozen(def)).toBe(true);
      expect(Object.isFrozen(def.steps)).toBe(true);
      for (const step of def.steps) {
        expect(Object.isFrozen(step)).toBe(true);
      }
    }
  });

  it("contains exactly the 7 mandatory calibration steps in order for every profile", () => {
    for (const def of allDefinitions) {
      expect(def.steps).toHaveLength(7);
      const stepIds = def.steps.map((s) => s.id);
      expect(stepIds).toEqual(EXPECTED_STEP_IDS);
      for (const step of def.steps) {
        expect(step.mandatory).toBe(true);
      }
    }
  });

  describe("physical receipt matching", () => {
    it("matches approved receipt #1771 for macOS US International", () => {
      const def = MACOS_US_INTERNATIONAL_DEFINITION;
      expect(def.definitionId).toBe("macos-us-international-calibration");
      expect(def.layoutProfileId).toBe("macos-us-international");

      expect(def.steps[0]).toMatchObject({
        id: "accent-acute-a",
        code: "KeyA",
        altKey: false,
        ctrlKey: false,
        metaKey: false,
        shiftKey: false,
        expected: "á",
        allowComposition: true,
      });
      expect(def.steps[1]).toMatchObject({
        id: "letter-enye",
        code: "KeyN",
        altKey: false,
        ctrlKey: false,
        metaKey: false,
        shiftKey: false,
        expected: "ñ",
        allowComposition: true,
      });
      expect(def.steps[2]).toMatchObject({
        id: "letter-udiaeresis",
        code: "KeyU",
        altKey: false,
        ctrlKey: false,
        metaKey: false,
        shiftKey: false,
        expected: "ü",
        allowComposition: true,
      });
      expect(def.steps[3]).toMatchObject({
        id: "punctuation-open-question",
        code: "Slash",
        altKey: true,
        ctrlKey: false,
        metaKey: false,
        shiftKey: true,
        expected: "¿",
        allowComposition: false,
      });
      expect(def.steps[4]).toMatchObject({
        id: "punctuation-question",
        code: "Slash",
        altKey: false,
        ctrlKey: false,
        metaKey: false,
        shiftKey: true,
        expected: "?",
        allowComposition: false,
      });
      expect(def.steps[5]).toMatchObject({
        id: "punctuation-open-exclamation",
        code: "Digit1",
        altKey: true,
        ctrlKey: false,
        metaKey: false,
        shiftKey: false,
        expected: "¡",
        allowComposition: false,
      });
      expect(def.steps[6]).toMatchObject({
        id: "punctuation-exclamation",
        code: "Digit1",
        altKey: false,
        ctrlKey: false,
        metaKey: false,
        shiftKey: true,
        expected: "!",
        allowComposition: false,
      });
    });

    it("matches approved receipt #1772 for macOS Latin American QWERTY", () => {
      const def = MACOS_LATIN_AMERICAN_QWERTY_DEFINITION;
      expect(def.definitionId).toBe("macos-latin-american-qwerty-calibration");
      expect(def.layoutProfileId).toBe("macos-latin-american-qwerty");

      expect(def.steps[0]).toMatchObject({
        id: "accent-acute-a",
        code: "KeyA",
        altKey: false,
        ctrlKey: false,
        metaKey: false,
        shiftKey: false,
        expected: "á",
        allowComposition: true,
      });
      expect(def.steps[1]).toMatchObject({
        id: "letter-enye",
        code: "Semicolon",
        altKey: false,
        ctrlKey: false,
        metaKey: false,
        shiftKey: false,
        expected: "ñ",
        allowComposition: false,
      });
      expect(def.steps[2]).toMatchObject({
        id: "letter-udiaeresis",
        code: "KeyU",
        altKey: false,
        ctrlKey: false,
        metaKey: false,
        shiftKey: false,
        expected: "ü",
        allowComposition: true,
      });
      expect(def.steps[3]).toMatchObject({
        id: "punctuation-open-question",
        code: "Equal",
        altKey: false,
        ctrlKey: false,
        metaKey: false,
        shiftKey: false,
        expected: "¿",
        allowComposition: false,
      });
      expect(def.steps[4]).toMatchObject({
        id: "punctuation-question",
        code: "Minus",
        altKey: false,
        ctrlKey: false,
        metaKey: false,
        shiftKey: true,
        expected: "?",
        allowComposition: false,
      });
      expect(def.steps[5]).toMatchObject({
        id: "punctuation-open-exclamation",
        code: "Equal",
        altKey: false,
        ctrlKey: false,
        metaKey: false,
        shiftKey: true,
        expected: "¡",
        allowComposition: false,
      });
      expect(def.steps[6]).toMatchObject({
        id: "punctuation-exclamation",
        code: "Digit1",
        altKey: false,
        ctrlKey: false,
        metaKey: false,
        shiftKey: true,
        expected: "!",
        allowComposition: false,
      });
    });

    it("matches approved receipt #1773 for Windows US International", () => {
      const def = WINDOWS_US_INTERNATIONAL_DEFINITION;
      expect(def.definitionId).toBe("windows-us-international-calibration");
      expect(def.layoutProfileId).toBe("windows-us-international");

      expect(def.steps[0]).toMatchObject({
        id: "accent-acute-a",
        code: "KeyA",
        altKey: false,
        ctrlKey: false,
        metaKey: false,
        shiftKey: false,
        expected: "á",
        allowComposition: true,
      });
      expect(def.steps[1]).toMatchObject({
        id: "letter-enye",
        code: "KeyN",
        altKey: true,
        ctrlKey: true,
        metaKey: false,
        shiftKey: false,
        expected: "ñ",
        allowComposition: false,
      });
      expect(def.steps[2]).toMatchObject({
        id: "letter-udiaeresis",
        code: "KeyU",
        altKey: false,
        ctrlKey: false,
        metaKey: false,
        shiftKey: false,
        expected: "ü",
        allowComposition: true,
      });
      expect(def.steps[3]).toMatchObject({
        id: "punctuation-open-question",
        code: "Slash",
        altKey: true,
        ctrlKey: true,
        metaKey: false,
        shiftKey: false,
        expected: "¿",
        allowComposition: false,
      });
      expect(def.steps[4]).toMatchObject({
        id: "punctuation-question",
        code: "Slash",
        altKey: false,
        ctrlKey: false,
        metaKey: false,
        shiftKey: true,
        expected: "?",
        allowComposition: false,
      });
      expect(def.steps[5]).toMatchObject({
        id: "punctuation-open-exclamation",
        code: "Digit1",
        altKey: true,
        ctrlKey: true,
        metaKey: false,
        shiftKey: false,
        expected: "¡",
        allowComposition: false,
      });
      expect(def.steps[6]).toMatchObject({
        id: "punctuation-exclamation",
        code: "Digit1",
        altKey: false,
        ctrlKey: false,
        metaKey: false,
        shiftKey: true,
        expected: "!",
        allowComposition: false,
      });
    });

    it("matches approved receipt #1774 for Windows Latin American QWERTY", () => {
      const def = WINDOWS_LATIN_AMERICAN_QWERTY_DEFINITION;
      expect(def.definitionId).toBe(
        "windows-latin-american-qwerty-calibration",
      );
      expect(def.layoutProfileId).toBe("windows-latin-american-qwerty");

      expect(def.steps[0]).toMatchObject({
        id: "accent-acute-a",
        code: "KeyA",
        altKey: false,
        ctrlKey: false,
        metaKey: false,
        shiftKey: false,
        expected: "á",
        allowComposition: true,
      });
      expect(def.steps[1]).toMatchObject({
        id: "letter-enye",
        code: "Semicolon",
        altKey: false,
        ctrlKey: false,
        metaKey: false,
        shiftKey: false,
        expected: "ñ",
        allowComposition: false,
      });
      expect(def.steps[2]).toMatchObject({
        id: "letter-udiaeresis",
        code: "KeyU",
        altKey: false,
        ctrlKey: false,
        metaKey: false,
        shiftKey: false,
        expected: "ü",
        allowComposition: true,
      });
      expect(def.steps[3]).toMatchObject({
        id: "punctuation-open-question",
        code: "Equal",
        altKey: false,
        ctrlKey: false,
        metaKey: false,
        shiftKey: false,
        expected: "¿",
        allowComposition: false,
      });
      expect(def.steps[4]).toMatchObject({
        id: "punctuation-question",
        code: "Minus",
        altKey: false,
        ctrlKey: false,
        metaKey: false,
        shiftKey: true,
        expected: "?",
        allowComposition: false,
      });
      expect(def.steps[5]).toMatchObject({
        id: "punctuation-open-exclamation",
        code: "Equal",
        altKey: false,
        ctrlKey: false,
        metaKey: false,
        shiftKey: true,
        expected: "¡",
        allowComposition: false,
      });
      expect(def.steps[6]).toMatchObject({
        id: "punctuation-exclamation",
        code: "Digit1",
        altKey: false,
        ctrlKey: false,
        metaKey: false,
        shiftKey: true,
        expected: "!",
        allowComposition: false,
      });
    });
  });

  describe("calibration evaluation for all definitions", () => {
    it.each(allDefinitions.map((def) => [def.definitionId, def]))(
      "evaluates %s sequentially through all 7 steps to completion",
      (_name, def) => {
        let passed: readonly string[] = [];

        for (let i = 0; i < def.steps.length; i++) {
          const step = def.steps[i];
          const evidence: CalibrationEvidence = {
            code: step.code,
            altKey: step.altKey,
            ctrlKey: step.ctrlKey,
            metaKey: step.metaKey,
            shiftKey: step.shiftKey,
            committed: step.expected,
            inputType: "insertText",
            composing: false,
            cancelled: false,
            repeat: false,
          };

          const evaluation = evaluateCalibration(def, passed, evidence);

          if (i < def.steps.length - 1) {
            expect(evaluation.result).toBe(CALIBRATION_RESULT.PASSED);
            expect(evaluation.passedStepIds).toHaveLength(i + 1);
            expect(evaluation.passedStepIds[i]).toBe(step.id);
            passed = evaluation.passedStepIds;
          } else {
            expect(evaluation.result).toBe(CALIBRATION_RESULT.COMPLETE);
            expect(evaluation.passedStepIds).toEqual(EXPECTED_STEP_IDS);
          }
        }
      },
    );

    it("fails calibration on wrong code or modifier evidence", () => {
      const def = MACOS_US_INTERNATIONAL_DEFINITION;
      const step = def.steps[0];
      const wrongEvidence: CalibrationEvidence = {
        code: step.code,
        altKey: true, // Wrong modifier
        ctrlKey: step.ctrlKey,
        metaKey: step.metaKey,
        shiftKey: step.shiftKey,
        committed: step.expected,
        inputType: "insertText",
        composing: false,
        cancelled: false,
        repeat: false,
      };

      const evaluation = evaluateCalibration(def, [], wrongEvidence);
      expect(evaluation.result).toBe(CALIBRATION_RESULT.FAILED);
      expect(evaluation.passedStepIds).toEqual([]);
    });
  });
});
