import type {
  CalibrationEvidence,
  CalibrationStepV1,
  LayoutDefinitionV1,
} from "./types";

export const CALIBRATION_RESULT = {
  IGNORED: "ignored",
  FAILED: "failed",
  PASSED: "passed",
  COMPLETE: "complete",
} as const;

export type CalibrationResult =
  (typeof CALIBRATION_RESULT)[keyof typeof CALIBRATION_RESULT];

export interface CalibrationEvaluation {
  readonly result: CalibrationResult;
  readonly passedStepIds: readonly string[];
}

const segmenter = new Intl.Segmenter(undefined, { granularity: "grapheme" });

export function validateLayoutDefinition(
  definition: LayoutDefinitionV1,
): string[] {
  const errors: string[] = [];
  if (!definition.definitionId) errors.push("definitionId is required");
  if (
    new Set(definition.steps.map(({ id }) => id)).size !==
    definition.steps.length
  )
    errors.push("step IDs must be unique");

  for (const step of definition.steps) {
    if (!step.id) errors.push("step id is required");
    if (!step.code) errors.push(`step ${step.id} code is required`);
    const graphemes = Array.from(segmenter.segment(step.expected));
    if (
      step.expected !== step.expected.normalize("NFC") ||
      graphemes.length !== 1
    )
      errors.push(`step ${step.id} expected must be one NFC grapheme`);
  }
  return errors;
}

export function evaluateCalibration(
  definition: LayoutDefinitionV1,
  passedStepIds: readonly string[],
  evidence: CalibrationEvidence,
): CalibrationEvaluation {
  if (validateLayoutDefinition(definition).length > 0)
    return { result: CALIBRATION_RESULT.FAILED, passedStepIds };
  if (evidence.composing)
    return { result: CALIBRATION_RESULT.IGNORED, passedStepIds };

  const mandatory = definition.steps.filter(({ mandatory }) => mandatory);
  if (passedStepIds.some((id, index) => id !== mandatory[index]?.id))
    return { result: CALIBRATION_RESULT.FAILED, passedStepIds };
  const step = mandatory[passedStepIds.length];
  if (!step) return { result: CALIBRATION_RESULT.FAILED, passedStepIds };

  const deadKeySymbols = new Set(["´", "¨", "`", "^", "~", "'", '"', "Dead"]);
  if (
    evidence.inputType === "insertText" &&
    (!evidence.committed ||
      (step.allowComposition &&
        deadKeySymbols.has(evidence.committed) &&
        evidence.committed !== step.expected))
  ) {
    return { result: CALIBRATION_RESULT.IGNORED, passedStepIds };
  }

  if (!isSafeMatch(step, evidence))
    return { result: CALIBRATION_RESULT.FAILED, passedStepIds };

  const next = [...passedStepIds, step.id];
  return {
    result:
      next.length === mandatory.length
        ? CALIBRATION_RESULT.COMPLETE
        : CALIBRATION_RESULT.PASSED,
    passedStepIds: next,
  };
}

function isSafeMatch(
  step: CalibrationStepV1,
  evidence: CalibrationEvidence,
): boolean {
  const codeMatches =
    evidence.code === step.code ||
    (!evidence.code && evidence.committed === step.expected);

  return (
    !evidence.cancelled &&
    !evidence.repeat &&
    evidence.inputType === "insertText" &&
    evidence.committed === step.expected &&
    codeMatches &&
    evidence.altKey === step.altKey &&
    evidence.ctrlKey === step.ctrlKey &&
    evidence.metaKey === step.metaKey &&
    evidence.shiftKey === step.shiftKey
  );
}
