import { describe, expect, it } from "vitest";
import { getCatalogPassage } from "./catalogs";
import {
  completePractice,
  consumeFreeTypingInput,
  createFreePracticeState,
  getExpectedGrapheme,
  getGraphemeProgress,
  pausePractice,
  resetPractice,
  resumePractice,
  tickTimer,
  TIMER_PRESETS,
} from "./free-practice";

describe("free-practice", () => {
  const mockPassage = {
    id: "test-passage",
    category: "stories" as const,
    locale: "en" as const,
    title: "Test Story",
    text: "Hello, world!".normalize("NFC"),
    difficulty: "easy" as const,
  };

  it("exports TIMER_PRESETS including 30, 60, 120, and null", () => {
    expect(TIMER_PRESETS).toEqual([30, 60, 120, null]);
  });

  describe("createFreePracticeState", () => {
    it("initializes idle state with 30s preset by default", () => {
      const state = createFreePracticeState(mockPassage);
      expect(state.status).toBe("idle");
      expect(state.durationPreset).toBe(30);
      expect(state.remainingSeconds).toBe(30);
      expect(state.elapsedSeconds).toBe(0);
      expect(state.position).toBe(0);
      expect(state.committedGraphemes).toBe(0);
      expect(state.totalErrors).toBe(0);
      expect(state.unfixedErrors).toBe(0);
      expect(state.isBlockedByError).toBe(false);
      expect(state.startTime).toBeNull();
      expect(state.endTime).toBeNull();
      expect(state.metrics).toEqual({
        grossWpm: 0,
        netWpm: 0,
        accuracy: 100,
      });
    });

    it("initializes idle state with unlimited (null) preset", () => {
      const state = createFreePracticeState(mockPassage, null);
      expect(state.durationPreset).toBeNull();
      expect(state.remainingSeconds).toBeNull();
    });

    it("throws if passage has empty text", () => {
      expect(() =>
        createFreePracticeState({ ...mockPassage, text: "" }),
      ).toThrow();
    });
  });

  describe("consumeFreeTypingInput", () => {
    it("starts timer and transitions to running on first keystroke", () => {
      const initial = createFreePracticeState(mockPassage, 60);
      const startTime = 100000;
      const next = consumeFreeTypingInput(initial, "H", startTime);

      expect(next.status).toBe("running");
      expect(next.startTime).toBe(startTime);
      expect(next.position).toBe(1);
      expect(next.committedGraphemes).toBe(1);
      expect(next.isBlockedByError).toBe(false);
      expect(next.lastOutcome).toBe("correct");
    });

    it("tracks incorrect input and blocks progression", () => {
      const initial = createFreePracticeState(mockPassage, 60);
      const startTime = 100000;
      const next = consumeFreeTypingInput(initial, "x", startTime);

      expect(next.status).toBe("running");
      expect(next.position).toBe(0);
      expect(next.committedGraphemes).toBe(0);
      expect(next.totalErrors).toBe(1);
      expect(next.unfixedErrors).toBe(1);
      expect(next.isBlockedByError).toBe(true);
      expect(next.lastOutcome).toBe("incorrect");
    });

    it("unblocks and advances when correct key is pressed while blocked", () => {
      const initial = createFreePracticeState(mockPassage, 60);
      const t1 = 100000;
      const errorState = consumeFreeTypingInput(initial, "x", t1);
      expect(errorState.isBlockedByError).toBe(true);

      const fixedState = consumeFreeTypingInput(errorState, "H", t1 + 500);
      expect(fixedState.isBlockedByError).toBe(false);
      expect(fixedState.position).toBe(1);
      expect(fixedState.committedGraphemes).toBe(1);
      expect(fixedState.totalErrors).toBe(1);
      expect(fixedState.unfixedErrors).toBe(0);
      expect(fixedState.lastOutcome).toBe("correct");
    });

    it("allows backspace to clear error block without advancing position", () => {
      const initial = createFreePracticeState(mockPassage, 60);
      const errorState = consumeFreeTypingInput(initial, "z", 100000);
      expect(errorState.isBlockedByError).toBe(true);

      const backspacedState = consumeFreeTypingInput(
        errorState,
        "Backspace",
        100500,
      );
      expect(backspacedState.isBlockedByError).toBe(false);
      expect(backspacedState.position).toBe(0);
      expect(backspacedState.unfixedErrors).toBe(0);
      expect(backspacedState.totalErrors).toBe(1);
    });

    it("completes session when last grapheme of passage is typed", () => {
      const shortPassage = { ...mockPassage, text: "Hi" };
      let state = createFreePracticeState(shortPassage, 30);
      state = consumeFreeTypingInput(state, "H", 100000);
      expect(state.status).toBe("running");

      state = consumeFreeTypingInput(state, "i", 102000);
      expect(state.status).toBe("completed");
      expect(state.position).toBe(2);
      expect(state.endTime).toBe(102000);
      expect(state.elapsedSeconds).toBe(2);
      expect(state.metrics.grossWpm).toBeGreaterThan(0);
    });

    it("ignores input when state is paused or already completed", () => {
      const running = consumeFreeTypingInput(
        createFreePracticeState(mockPassage),
        "H",
        100000,
      );
      const paused = pausePractice(running, 101000);
      const ignored = consumeFreeTypingInput(paused, "e", 102000);
      expect(ignored).toEqual(paused);

      const completed = completePractice(running, 103000);
      const afterCompleted = consumeFreeTypingInput(completed, "e", 104000);
      expect(afterCompleted).toEqual(completed);
    });

    it("supports multi-character batch input", () => {
      const state = createFreePracticeState(mockPassage, 60);
      const next = consumeFreeTypingInput(state, "Hell", 100000);
      expect(next.position).toBe(4);
      expect(next.committedGraphemes).toBe(4);
      expect(next.isBlockedByError).toBe(false);
    });
  });

  describe("tickTimer & drift-free timing", () => {
    it("does not advance timer when idle or paused", () => {
      const idle = createFreePracticeState(mockPassage, 30);
      expect(tickTimer(idle, 105000)).toEqual(idle);

      const running = consumeFreeTypingInput(idle, "H", 100000);
      const paused = pausePractice(running, 102000);
      expect(tickTimer(paused, 105000)).toEqual(paused);
    });

    it("calculates drift-free elapsed and remaining seconds derived from timestamps", () => {
      const idle = createFreePracticeState(mockPassage, 60);
      const running = consumeFreeTypingInput(idle, "H", 100000); // start at t = 100s

      const ticked = tickTimer(running, 115400); // t = 115.4s (+15.4s)
      expect(ticked.elapsedSeconds).toBe(15);
      expect(ticked.remainingSeconds).toBe(45);
    });

    it("accurately accounts for pause durations across multiple pauses", () => {
      const idle = createFreePracticeState(mockPassage, 60);
      let state = consumeFreeTypingInput(idle, "H", 100000); // t = 100s

      // Run for 10s -> t = 110s
      state = tickTimer(state, 110000);
      expect(state.elapsedSeconds).toBe(10);

      // Pause at t = 110s for 20s
      state = pausePractice(state, 110000);
      // Resume at t = 130s
      state = resumePractice(state, 130000);

      // Check at t = 135s -> total running time should be 10 + 5 = 15s
      state = tickTimer(state, 135000);
      expect(state.elapsedSeconds).toBe(15);
      expect(state.remainingSeconds).toBe(45);
    });

    it("auto-completes session when countdown timer reaches 0", () => {
      const idle = createFreePracticeState(mockPassage, 30);
      let state = consumeFreeTypingInput(idle, "H", 100000);

      // Advance by 30 seconds
      state = tickTimer(state, 130000);
      expect(state.status).toBe("completed");
      expect(state.remainingSeconds).toBe(0);
      expect(state.elapsedSeconds).toBe(30);
      expect(state.endTime).toBe(130000);
    });

    it("tracks upward elapsed time in unlimited/free mode", () => {
      const idle = createFreePracticeState(mockPassage, null);
      let state = consumeFreeTypingInput(idle, "H", 100000);

      state = tickTimer(state, 175000);
      expect(state.status).toBe("running");
      expect(state.remainingSeconds).toBeNull();
      expect(state.elapsedSeconds).toBe(75);
    });
  });

  describe("pausePractice & resumePractice", () => {
    it("toggles pause status correctly", () => {
      const idle = createFreePracticeState(mockPassage, 30);
      const running = consumeFreeTypingInput(idle, "H", 100000);

      const paused = pausePractice(running, 105000);
      expect(paused.status).toBe("paused");

      const resumed = resumePractice(paused, 107000);
      expect(resumed.status).toBe("running");
    });
  });

  describe("resetPractice", () => {
    it("resets state back to idle with new or existing passage/preset", () => {
      const idle = createFreePracticeState(mockPassage, 30);
      let state = consumeFreeTypingInput(idle, "H", 100000);
      state = tickTimer(state, 110000);

      const reset = resetPractice(state);
      expect(reset.status).toBe("idle");
      expect(reset.position).toBe(0);
      expect(reset.elapsedSeconds).toBe(0);
      expect(reset.remainingSeconds).toBe(30);

      const newPassage = getCatalogPassage("technology", "es");
      const resetWithNew = resetPractice(state, newPassage, 120);
      expect(resetWithNew.passage.id).toBe(newPassage.id);
      expect(resetWithNew.durationPreset).toBe(120);
      expect(resetWithNew.remainingSeconds).toBe(120);
    });
  });

  describe("helper methods", () => {
    it("getExpectedGrapheme returns current target grapheme", () => {
      const state = createFreePracticeState(mockPassage);
      expect(getExpectedGrapheme(state)).toBe("H");
    });

    it("getGraphemeProgress splits passage into completed, current, and pending segments", () => {
      let state = createFreePracticeState(mockPassage);
      state = consumeFreeTypingInput(state, "Hel", 100000);

      const progress = getGraphemeProgress(state);
      expect(progress.completed).toBe("Hel");
      expect(progress.current).toBe("l");
      expect(progress.pending).toBe("o, world!");
    });
  });
});
