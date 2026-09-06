import type {
  CalibrationCompletion,
  OnboardingRepository,
} from "./repositories";
import {
  deriveOnboardingState,
  type DefinitionVersions,
  type OnboardingState,
} from "./state";

export interface CompletionInput {
  readonly calibrationId: string;
  readonly passedStepIds: readonly string[];
  readonly completedAt: number;
}
export interface ServiceResult {
  readonly state: OnboardingState;
}

export function createOnboardingService(
  repository: OnboardingRepository,
  versions: DefinitionVersions,
) {
  const restore = async (): Promise<ServiceResult> => ({
    state: deriveOnboardingState(await repository.load(), versions),
  });
  return {
    restore,
    retry: restore,
    complete: async (input: CompletionInput): Promise<ServiceResult> => {
      const snapshot = await repository.load();
      const profile = snapshot.profile;
      const layoutProfileId = snapshot.preference?.layoutProfileId;
      const definitionVersion = layoutProfileId && versions[layoutProfileId];
      if (!profile || !layoutProfileId || definitionVersion === undefined)
        return restore();
      const completion: CalibrationCompletion = {
        id: `${profile.id}:${input.calibrationId}`,
        profileId: profile.id,
        layoutProfileId,
        definitionVersion,
        ...input,
      };
      await repository.save({ ...snapshot, completion });
      return restore();
    },
    completeGuided: async (
      completedAt: number = Date.now(),
    ): Promise<ServiceResult> => {
      const snapshot = await repository.load();
      if (!snapshot.completion) return restore();
      const completion: CalibrationCompletion = {
        ...snapshot.completion,
        guidedCompletedAt: completedAt,
      };
      await repository.save({ ...snapshot, completion });
      return restore();
    },
  } as const;
}
