import type { CatalogPassage } from "./catalogs";
import {
  calculateWpmMetrics,
  segmentGraphemes,
  type TypingMetrics,
} from "./metrics";

export const TIMER_PRESETS = [30, 60, 120, null] as const;

export type TimerPreset = (typeof TIMER_PRESETS)[number];

export type FreePracticeStatus = "idle" | "running" | "paused" | "completed";

export type InputOutcome = "correct" | "incorrect" | "rejected" | "ignored";

export interface FreePracticeState {
  readonly passage: CatalogPassage;
  readonly graphemes: readonly string[];
  readonly position: number;
  readonly durationPreset: TimerPreset;
  readonly status: FreePracticeStatus;
  readonly startTime: number | null;
  readonly endTime: number | null;
  readonly pausedAt: number | null;
  readonly totalPauseDuration: number;
  readonly elapsedSeconds: number;
  readonly remainingSeconds: number | null;
  readonly committedGraphemes: number;
  readonly totalErrors: number;
  readonly unfixedErrors: number;
  readonly isBlockedByError: boolean;
  readonly lastOutcome: InputOutcome | null;
  readonly metrics: TypingMetrics;
}

export function createFreePracticeState(
  passage: CatalogPassage,
  durationPreset: TimerPreset = 30,
): FreePracticeState {
  const graphemes = segmentGraphemes(passage.text);
  if (graphemes.length === 0) {
    throw new Error("Practice passage text must not be empty.");
  }

  return {
    passage,
    graphemes,
    position: 0,
    durationPreset,
    status: "idle",
    startTime: null,
    endTime: null,
    pausedAt: null,
    totalPauseDuration: 0,
    elapsedSeconds: 0,
    remainingSeconds: durationPreset,
    committedGraphemes: 0,
    totalErrors: 0,
    unfixedErrors: 0,
    isBlockedByError: false,
    lastOutcome: null,
    metrics: {
      grossWpm: 0,
      netWpm: 0,
      accuracy: 100,
    },
  };
}

export function getExpectedGrapheme(state: FreePracticeState): string {
  return state.graphemes[state.position] ?? "";
}

export function getGraphemeProgress(state: FreePracticeState): {
  readonly completed: string;
  readonly current: string;
  readonly pending: string;
} {
  return {
    completed: state.graphemes.slice(0, state.position).join(""),
    current: state.graphemes[state.position] ?? "",
    pending: state.graphemes.slice(state.position + 1).join(""),
  };
}

function consumeSingleGrapheme(
  state: FreePracticeState,
  input: string,
  now: number,
): FreePracticeState {
  if (state.status === "completed" || state.status === "paused") {
    return { ...state, lastOutcome: "ignored" };
  }

  if (input === "Backspace") {
    if (state.isBlockedByError) {
      return {
        ...state,
        isBlockedByError: false,
        unfixedErrors: Math.max(0, state.unfixedErrors - 1),
        lastOutcome: "correct",
      };
    }
    return state;
  }

  const startTime = state.startTime ?? now;
  const status = state.status === "idle" ? "running" : state.status;
  const expected = getExpectedGrapheme(state);

  const effectiveElapsedMs = Math.max(
    0,
    now - startTime - state.totalPauseDuration,
  );
  const elapsedSeconds = Math.floor(effectiveElapsedMs / 1000);

  if (input === expected) {
    const nextPosition = state.position + 1;
    const committed = state.committedGraphemes + 1;
    const unfixed = 0;
    const isCompleted = nextPosition >= state.graphemes.length;
    const metrics = calculateWpmMetrics(
      committed,
      state.totalErrors,
      unfixed,
      elapsedSeconds,
    );

    if (isCompleted) {
      return {
        ...state,
        status: "completed",
        startTime,
        endTime: now,
        position: nextPosition,
        committedGraphemes: committed,
        unfixedErrors: unfixed,
        isBlockedByError: false,
        elapsedSeconds,
        remainingSeconds:
          state.durationPreset !== null
            ? Math.max(0, state.durationPreset - elapsedSeconds)
            : null,
        metrics,
        lastOutcome: "correct",
      };
    }

    return {
      ...state,
      status,
      startTime,
      position: nextPosition,
      committedGraphemes: committed,
      unfixedErrors: unfixed,
      isBlockedByError: false,
      elapsedSeconds,
      remainingSeconds:
        state.durationPreset !== null
          ? Math.max(0, state.durationPreset - elapsedSeconds)
          : null,
      metrics,
      lastOutcome: "correct",
    };
  }

  const totalErrors = state.totalErrors + 1;
  const unfixedErrors = state.unfixedErrors + 1;
  const metrics = calculateWpmMetrics(
    state.committedGraphemes,
    totalErrors,
    unfixedErrors,
    elapsedSeconds,
  );

  return {
    ...state,
    status,
    startTime,
    totalErrors,
    unfixedErrors,
    isBlockedByError: true,
    elapsedSeconds,
    remainingSeconds:
      state.durationPreset !== null
        ? Math.max(0, state.durationPreset - elapsedSeconds)
        : null,
    metrics,
    lastOutcome: "incorrect",
  };
}

export function consumeFreeTypingInput(
  state: FreePracticeState,
  input: string,
  now: number = Date.now(),
): FreePracticeState {
  if (state.status === "completed" || state.status === "paused") {
    return state;
  }

  if (input === "Backspace") {
    return consumeSingleGrapheme(state, input, now);
  }

  const graphemes = segmentGraphemes(input);
  if (graphemes.length === 0) {
    return state;
  }

  let current = state;
  for (const g of graphemes) {
    if (current.status === "completed" || current.status === "paused") {
      break;
    }
    current = consumeSingleGrapheme(current, g, now);
    if (current.isBlockedByError) {
      break;
    }
  }

  return current;
}

export function tickTimer(
  state: FreePracticeState,
  now: number = Date.now(),
): FreePracticeState {
  if (state.status !== "running" || state.startTime === null) {
    return state;
  }

  const effectiveElapsedMs = Math.max(
    0,
    now - state.startTime - state.totalPauseDuration,
  );
  const elapsedSeconds = Math.floor(effectiveElapsedMs / 1000);

  if (state.durationPreset !== null) {
    const remainingSeconds = Math.max(0, state.durationPreset - elapsedSeconds);
    if (remainingSeconds <= 0) {
      const finalElapsed = state.durationPreset;
      const metrics = calculateWpmMetrics(
        state.committedGraphemes,
        state.totalErrors,
        state.unfixedErrors,
        finalElapsed,
      );
      return {
        ...state,
        status: "completed",
        endTime: now,
        elapsedSeconds: finalElapsed,
        remainingSeconds: 0,
        metrics,
      };
    }

    const metrics = calculateWpmMetrics(
      state.committedGraphemes,
      state.totalErrors,
      state.unfixedErrors,
      elapsedSeconds,
    );
    return {
      ...state,
      elapsedSeconds,
      remainingSeconds,
      metrics,
    };
  }

  const metrics = calculateWpmMetrics(
    state.committedGraphemes,
    state.totalErrors,
    state.unfixedErrors,
    elapsedSeconds,
  );
  return {
    ...state,
    elapsedSeconds,
    remainingSeconds: null,
    metrics,
  };
}

export function pausePractice(
  state: FreePracticeState,
  now: number = Date.now(),
): FreePracticeState {
  if (state.status !== "running") {
    return state;
  }
  return {
    ...state,
    status: "paused",
    pausedAt: now,
  };
}

export function resumePractice(
  state: FreePracticeState,
  now: number = Date.now(),
): FreePracticeState {
  if (state.status !== "paused") {
    return state;
  }
  const pauseDelta =
    state.pausedAt !== null ? Math.max(0, now - state.pausedAt) : 0;
  return {
    ...state,
    status: "running",
    pausedAt: null,
    totalPauseDuration: state.totalPauseDuration + pauseDelta,
  };
}

export function completePractice(
  state: FreePracticeState,
  now: number = Date.now(),
): FreePracticeState {
  if (state.status === "completed") {
    return state;
  }

  const effectiveElapsedMs =
    state.startTime !== null
      ? Math.max(0, now - state.startTime - state.totalPauseDuration)
      : 0;
  const elapsedSeconds = Math.max(1, Math.floor(effectiveElapsedMs / 1000));
  const metrics = calculateWpmMetrics(
    state.committedGraphemes,
    state.totalErrors,
    state.unfixedErrors,
    elapsedSeconds,
  );

  return {
    ...state,
    status: "completed",
    endTime: now,
    elapsedSeconds,
    remainingSeconds: state.durationPreset !== null ? 0 : null,
    metrics,
  };
}

export function resetPractice(
  state: FreePracticeState,
  passage?: CatalogPassage,
  durationPreset?: TimerPreset,
): FreePracticeState {
  return createFreePracticeState(
    passage ?? state.passage,
    durationPreset !== undefined ? durationPreset : state.durationPreset,
  );
}
