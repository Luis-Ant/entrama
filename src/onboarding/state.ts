import type { LayoutProfileId } from "../keyboard-layouts/types";
import type { OnboardingSnapshot } from "./repositories";

export const ONBOARDING_STATE = {
  NEEDS_UI_LANGUAGE: "needs-ui-language",
  NEEDS_PROFILE_CONFIRMATION: "needs-profile-confirmation",
  NEEDS_CALIBRATION: "needs-calibration",
  NEEDS_GUIDED_EXERCISE: "needs-guided-exercise",
  GUIDED_EXERCISE_COMPLETE: "guided-exercise-complete",
} as const;
export type OnboardingState =
  (typeof ONBOARDING_STATE)[keyof typeof ONBOARDING_STATE];
export type DefinitionVersions = Readonly<
  Partial<Record<LayoutProfileId, number>>
>;

export function deriveOnboardingState(
  snapshot: OnboardingSnapshot,
  versions: DefinitionVersions,
): OnboardingState {
  const { profile, preference, completion } = snapshot;
  if (!profile || !preference || preference.profileId !== profile.id)
    return ONBOARDING_STATE.NEEDS_UI_LANGUAGE;
  if (!preference.layoutProfileId)
    return ONBOARDING_STATE.NEEDS_PROFILE_CONFIRMATION;
  const version = versions[preference.layoutProfileId];
  if (
    !completion ||
    completion.profileId !== profile.id ||
    completion.layoutProfileId !== preference.layoutProfileId ||
    completion.definitionVersion !== version
  )
    return ONBOARDING_STATE.NEEDS_CALIBRATION;
  if (typeof completion.guidedCompletedAt === "number")
    return ONBOARDING_STATE.GUIDED_EXERCISE_COMPLETE;
  return ONBOARDING_STATE.NEEDS_GUIDED_EXERCISE;
}
