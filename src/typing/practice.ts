export const PRACTICE_PHASE = {
  ENGLISH: "english",
  SPANISH: "spanish",
} as const;

export const INPUT_OUTCOME = {
  CORRECT: "correct",
  INCORRECT: "incorrect",
  REJECTED: "rejected",
} as const;

export type PracticePhase =
  (typeof PRACTICE_PHASE)[keyof typeof PRACTICE_PHASE];
export type InputOutcome = (typeof INPUT_OUTCOME)[keyof typeof INPUT_OUTCOME];

export interface PracticeUnit {
  readonly id: string;
  readonly english: string;
  readonly spanish: string;
}

export interface PracticeState {
  readonly units: readonly PracticeUnit[];
  readonly unitIndex: number;
  readonly phase: PracticePhase;
  readonly position: number;
  readonly committedGraphemes: number;
  readonly errors: number;
  readonly completedUnits: number;
  readonly completedBlocks: number;
  readonly blockedByError: boolean;
}

export interface PracticeInputResult {
  readonly state: PracticeState;
  readonly outcome: InputOutcome;
}

const segmenter = new Intl.Segmenter(undefined, { granularity: "grapheme" });

export function segmentGraphemes(value: string): string[] {
  return Array.from(
    segmenter.segment(value.normalize("NFC")),
    ({ segment }) => segment,
  );
}

export function createPracticeState(
  units: readonly PracticeUnit[],
): PracticeState {
  if (units.length === 0) {
    throw new Error("Practice requires at least one bilingual unit.");
  }

  return {
    units,
    unitIndex: 0,
    phase: PRACTICE_PHASE.ENGLISH,
    position: 0,
    committedGraphemes: 0,
    errors: 0,
    completedUnits: 0,
    completedBlocks: 0,
    blockedByError: false,
  };
}

export function getActiveSurface(state: PracticeState): string {
  const unit = getActiveUnit(state);
  return state.phase === PRACTICE_PHASE.ENGLISH ? unit.english : unit.spanish;
}

export function getExpectedGrapheme(state: PracticeState): string {
  return segmentGraphemes(getActiveSurface(state))[state.position] ?? "";
}

export function consumeCommittedText(
  state: PracticeState,
  committedText: string,
): PracticeInputResult {
  const graphemes = segmentGraphemes(committedText);

  if (graphemes.length !== 1) {
    return { state, outcome: INPUT_OUTCOME.REJECTED };
  }

  if (graphemes[0] !== getExpectedGrapheme(state)) {
    return {
      state: {
        ...state,
        errors: state.errors + 1,
        blockedByError: true,
      },
      outcome: INPUT_OUTCOME.INCORRECT,
    };
  }

  return {
    state: advancePractice(state),
    outcome: INPUT_OUTCOME.CORRECT,
  };
}

function getActiveUnit(state: PracticeState): PracticeUnit {
  const unit = state.units[state.unitIndex];

  if (!unit) {
    throw new Error("Practice state points to an unknown unit.");
  }

  return unit;
}

function advancePractice(state: PracticeState): PracticeState {
  const nextPosition = state.position + 1;
  const surfaceLength = segmentGraphemes(getActiveSurface(state)).length;
  const common = {
    ...state,
    committedGraphemes: state.committedGraphemes + 1,
    blockedByError: false,
  };

  if (nextPosition < surfaceLength) {
    return { ...common, position: nextPosition };
  }

  if (state.phase === PRACTICE_PHASE.ENGLISH) {
    return { ...common, phase: PRACTICE_PHASE.SPANISH, position: 0 };
  }

  const completedUnits = state.completedUnits + 1;
  const isBlockComplete = state.unitIndex === state.units.length - 1;

  return {
    ...common,
    unitIndex: isBlockComplete ? 0 : state.unitIndex + 1,
    phase: PRACTICE_PHASE.ENGLISH,
    position: 0,
    completedUnits,
    completedBlocks: state.completedBlocks + (isBlockComplete ? 1 : 0),
  };
}
