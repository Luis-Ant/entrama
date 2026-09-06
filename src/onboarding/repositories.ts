import type { LayoutProfileId } from "../keyboard-layouts/types";
import type { SoundProfileId, ThemeId, TypographyId } from "../styles/theme";
import type { CatalogCategory } from "../typing/catalogs";

export const UI_LOCALE = { ENGLISH: "en", SPANISH: "es" } as const;
export type UiLocale = (typeof UI_LOCALE)[keyof typeof UI_LOCALE];

// prettier-ignore
export interface ProfileRecord { readonly id: string; readonly kind: "guest"; readonly updatedAt: number; }
// prettier-ignore
export interface PreferenceRecord {
  readonly profileId: string;
  readonly locale: UiLocale;
  readonly layoutProfileId?: LayoutProfileId;
  readonly theme?: ThemeId;
  readonly typography?: TypographyId;
  readonly fontFamily?: TypographyId;
  readonly soundProfile?: SoundProfileId;
}
export type UserPreference = PreferenceRecord;
// prettier-ignore
export interface CalibrationCompletion { readonly id: string; readonly profileId: string; readonly layoutProfileId: LayoutProfileId; readonly calibrationId: string; readonly definitionVersion: number; readonly completedAt: number; readonly passedStepIds: readonly string[]; readonly guidedCompletedAt?: number; }
// prettier-ignore
export interface OnboardingSnapshot { readonly profile?: ProfileRecord; readonly preference?: PreferenceRecord; readonly completion?: CalibrationCompletion; }

export interface TypingSessionRecord {
  readonly id: string;
  readonly profileId: string;
  readonly timestamp: number;
  readonly completedAt?: number;
  readonly category: CatalogCategory;
  readonly locale: UiLocale;
  readonly durationPreset: number | null;
  readonly presetSeconds?: number | null;
  readonly netWpm: number;
  readonly grossWpm: number;
  readonly accuracy: number;
  readonly characterCount: number;
  readonly errorCount: number;
  readonly elapsedSeconds: number;
}

// prettier-ignore
export interface ProfileRepository { ensureGuest(): Promise<ProfileRecord>; }
// prettier-ignore
export interface PreferenceRepository {
  load(profileId: string): Promise<PreferenceRecord | undefined>;
  saveLocale(profileId: string, locale: UiLocale): Promise<void>;
  confirmLayout(profileId: string, layoutProfileId: LayoutProfileId): Promise<void>;
  savePreferences(profileId: string, updates: Partial<PreferenceRecord>): Promise<void>;
}
// prettier-ignore
export interface CalibrationRepository { findValid(profileId: string): Promise<CalibrationCompletion | undefined>; replaceCompletion(completion: CalibrationCompletion): Promise<void>; }
// prettier-ignore
export interface OnboardingRepository { load(): Promise<OnboardingSnapshot>; save(snapshot: OnboardingSnapshot): Promise<void>; }

export interface TypingSessionRepository {
  saveSession(record: TypingSessionRecord): Promise<void>;
  listRecentSessions(
    profileId: string,
    limit?: number,
  ): Promise<readonly TypingSessionRecord[]>;
  getRecentSessions(
    profileId: string,
    limit?: number,
  ): Promise<readonly TypingSessionRecord[]>;
  clearSessions?(profileId?: string): Promise<void>;
}
