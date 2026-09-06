import { describe, expect, it } from "vitest";
import type { OnboardingSnapshot } from "./repositories";
import { createOnboardingService } from "./service";
import { ONBOARDING_STATE, deriveOnboardingState } from "./state";

const versions = { "windows-us-international": 1 } as const;
const preference = {
  profileId: "guest",
  locale: "en",
  layoutProfileId: "windows-us-international",
} as const;
const completion = {
  id: "cal",
  profileId: "guest",
  layoutProfileId: "windows-us-international",
  calibrationId: "definition",
  definitionVersion: 1,
  completedAt: 1,
  passedStepIds: ["one"],
} as const;
const snapshot = (
  overrides: Partial<OnboardingSnapshot> = {},
): OnboardingSnapshot => ({
  profile: { id: "guest", kind: "guest", updatedAt: 1 },
  preference: { profileId: "guest", locale: "en" },
  ...overrides,
});
const state = (overrides: Partial<OnboardingSnapshot> = {}) =>
  deriveOnboardingState(snapshot(overrides), versions);

describe("onboarding state", () => {
  it("requires explicit profile confirmation", () => {
    expect(state()).toBe(ONBOARDING_STATE.NEEDS_PROFILE_CONFIRMATION);
    expect(state({ preference })).toBe(ONBOARDING_STATE.NEEDS_CALIBRATION);
  });
  it.each([
    ["profile", { ...completion, profileId: "other" }],
    [
      "layout",
      { ...completion, layoutProfileId: "macos-us-international" as const },
    ],
    ["version", { ...completion, definitionVersion: 2 }],
  ])("invalidates a %s mismatch", (_name, invalid) => {
    expect(state({ preference, completion: invalid })).toBe(
      ONBOARDING_STATE.NEEDS_CALIBRATION,
    );
  });
  it("rejects preferences owned by another profile", () => {
    expect(state({ preference: { profileId: "other", locale: "en" } })).toBe(
      ONBOARDING_STATE.NEEDS_UI_LANGUAGE,
    );
  });
  it("restores only to the guided-exercise ceiling when guided exercise is incomplete", () => {
    expect(state({ preference, completion })).toBe(
      ONBOARDING_STATE.NEEDS_GUIDED_EXERCISE,
    );
  });
  it("advances to guided-exercise-complete when guidedCompletedAt is present on valid calibration", () => {
    const guidedCompletion = { ...completion, guidedCompletedAt: 123456 };
    expect(state({ preference, completion: guidedCompletion })).toBe(
      ONBOARDING_STATE.GUIDED_EXERCISE_COMPLETE,
    );
  });
  it("invalidates guided-exercise-complete if calibration definition version mismatches", () => {
    const guidedCompletion = {
      ...completion,
      guidedCompletedAt: 123456,
      definitionVersion: 99,
    };
    expect(state({ preference, completion: guidedCompletion })).toBe(
      ONBOARDING_STATE.NEEDS_CALIBRATION,
    );
  });
  it("keeps failure retryable and completes after retry", async () => {
    let current = snapshot({ preference });
    const service = createOnboardingService(
      {
        load: async () => current,
        save: async (next) => {
          current = next;
        },
      },
      versions,
    );
    expect((await service.retry()).state).toBe(
      ONBOARDING_STATE.NEEDS_CALIBRATION,
    );
    const input = {
      calibrationId: "definition",
      passedStepIds: ["one"],
      completedAt: 2,
    };
    expect((await service.complete(input)).state).toBe(
      ONBOARDING_STATE.NEEDS_GUIDED_EXERCISE,
    );
    expect((await service.completeGuided(12345)).state).toBe(
      ONBOARDING_STATE.GUIDED_EXERCISE_COMPLETE,
    );
  });
});
