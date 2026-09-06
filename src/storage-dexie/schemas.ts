import { z } from "zod";
import {
  LAYOUT_PROFILE_ID,
  type LayoutProfileId,
} from "../keyboard-layouts/types";
import {
  UI_LOCALE,
  type CalibrationCompletion,
  type PreferenceRecord,
  type ProfileRecord,
  type TypingSessionRecord,
  type UiLocale,
} from "../onboarding/repositories";
import {
  SOUND_PROFILE_ID,
  THEME_ID,
  TYPOGRAPHY_ID,
  type SoundProfileId,
  type ThemeId,
  type TypographyId,
} from "../styles/theme";
import { CATALOG_CATEGORIES } from "../typing/catalogs";

export const profileRecordSchema = z.strictObject({
  id: z.string(),
  kind: z.literal("guest"),
  updatedAt: z.number(),
});

export const preferenceRecordSchema = z.strictObject({
  profileId: z.string(),
  locale: z.enum([UI_LOCALE.ENGLISH, UI_LOCALE.SPANISH]),
  layoutProfileId: z
    .enum([
      LAYOUT_PROFILE_ID.WINDOWS_US_INTERNATIONAL,
      LAYOUT_PROFILE_ID.WINDOWS_LATIN_AMERICAN_QWERTY,
      LAYOUT_PROFILE_ID.MACOS_US_INTERNATIONAL,
      LAYOUT_PROFILE_ID.MACOS_LATIN_AMERICAN_QWERTY,
    ])
    .optional(),
  theme: z
    .enum([
      THEME_ID.EDITORIAL,
      THEME_ID.MIDNIGHT,
      THEME_ID.NORDIC,
      THEME_ID.FOREST,
    ])
    .optional(),
  typography: z
    .enum([TYPOGRAPHY_ID.MONO, TYPOGRAPHY_ID.SERIF, TYPOGRAPHY_ID.SANS])
    .optional(),
  fontFamily: z
    .enum([TYPOGRAPHY_ID.MONO, TYPOGRAPHY_ID.SERIF, TYPOGRAPHY_ID.SANS])
    .optional(),
  soundProfile: z
    .enum([
      SOUND_PROFILE_ID.LINEAR,
      SOUND_PROFILE_ID.CLICKY,
      SOUND_PROFILE_ID.SOFT_BUBBLE,
      SOUND_PROFILE_ID.MUTE,
    ])
    .optional(),
});

export const calibrationCompletionSchema = z.strictObject({
  id: z.string(),
  profileId: z.string(),
  layoutProfileId: z.enum([
    LAYOUT_PROFILE_ID.WINDOWS_US_INTERNATIONAL,
    LAYOUT_PROFILE_ID.WINDOWS_LATIN_AMERICAN_QWERTY,
    LAYOUT_PROFILE_ID.MACOS_US_INTERNATIONAL,
    LAYOUT_PROFILE_ID.MACOS_LATIN_AMERICAN_QWERTY,
  ]),
  calibrationId: z.string(),
  definitionVersion: z.number(),
  completedAt: z.number(),
  passedStepIds: z.array(z.string()),
  guidedCompletedAt: z.number().optional(),
});

export function parseProfileRecord(data: unknown): ProfileRecord | undefined {
  const result = profileRecordSchema.safeParse(data);
  return result.success ? result.data : undefined;
}

export function parsePreferenceRecord(
  data: unknown,
): PreferenceRecord | undefined {
  const result = preferenceRecordSchema.safeParse(data);
  return result.success ? result.data : undefined;
}

export function parseCalibrationCompletion(
  data: unknown,
): CalibrationCompletion | undefined {
  const result = calibrationCompletionSchema.safeParse(data);
  return result.success ? result.data : undefined;
}

export function projectProfileRecord(data: unknown): ProfileRecord {
  if (typeof data !== "object" || data === null) {
    throw new Error("Invalid ProfileRecord data");
  }
  const obj = data as Record<string, unknown>;
  const projected: ProfileRecord = {
    id: String(obj.id ?? ""),
    kind: "guest",
    updatedAt: Number(obj.updatedAt ?? Date.now()),
  };
  return profileRecordSchema.parse(projected);
}

export function projectPreferenceRecord(data: unknown): PreferenceRecord {
  if (typeof data !== "object" || data === null) {
    throw new Error("Invalid PreferenceRecord data");
  }
  const obj = data as Record<string, unknown>;
  const typography = (obj.typography ?? obj.fontFamily) as
    TypographyId | undefined;
  const fontFamily = (obj.fontFamily ?? obj.typography) as
    TypographyId | undefined;

  const projected: PreferenceRecord = {
    profileId: String(obj.profileId ?? ""),
    locale: obj.locale as UiLocale,
    ...(obj.layoutProfileId !== undefined && obj.layoutProfileId !== null
      ? { layoutProfileId: obj.layoutProfileId as LayoutProfileId }
      : {}),
    ...(obj.theme !== undefined && obj.theme !== null
      ? { theme: obj.theme as ThemeId }
      : {}),
    ...(typography !== undefined && typography !== null
      ? { typography, fontFamily }
      : {}),
    ...(obj.soundProfile !== undefined && obj.soundProfile !== null
      ? { soundProfile: obj.soundProfile as SoundProfileId }
      : {}),
  };
  return preferenceRecordSchema.parse(projected);
}

export function projectCalibrationCompletion(
  data: unknown,
): CalibrationCompletion {
  if (typeof data !== "object" || data === null) {
    throw new Error("Invalid CalibrationCompletion data");
  }
  const obj = data as Record<string, unknown>;
  const projected: CalibrationCompletion = {
    id: String(obj.id ?? ""),
    profileId: String(obj.profileId ?? ""),
    layoutProfileId: obj.layoutProfileId as LayoutProfileId,
    calibrationId: String(obj.calibrationId ?? ""),
    definitionVersion: Number(obj.definitionVersion ?? 0),
    completedAt: Number(obj.completedAt ?? 0),
    passedStepIds: Array.isArray(obj.passedStepIds)
      ? obj.passedStepIds.map((s) => String(s))
      : [],
    ...(obj.guidedCompletedAt !== undefined && obj.guidedCompletedAt !== null
      ? { guidedCompletedAt: Number(obj.guidedCompletedAt) }
      : {}),
  };
  return calibrationCompletionSchema.parse(projected);
}

export const typingSessionRecordSchema = z.strictObject({
  id: z.string(),
  profileId: z.string(),
  timestamp: z.number(),
  completedAt: z.number().optional(),
  category: z.enum(CATALOG_CATEGORIES),
  locale: z.enum([UI_LOCALE.ENGLISH, UI_LOCALE.SPANISH]),
  durationPreset: z.number().nullable(),
  presetSeconds: z.number().nullable().optional(),
  netWpm: z.number(),
  grossWpm: z.number(),
  accuracy: z.number(),
  characterCount: z.number(),
  errorCount: z.number(),
  elapsedSeconds: z.number(),
});

export function parseTypingSessionRecord(
  data: unknown,
): TypingSessionRecord | undefined {
  const result = typingSessionRecordSchema.safeParse(data);
  return result.success ? result.data : undefined;
}

export function projectTypingSessionRecord(data: unknown): TypingSessionRecord {
  if (typeof data !== "object" || data === null) {
    throw new Error("Invalid TypingSessionRecord data");
  }
  const obj = data as Record<string, unknown>;
  const timestamp = Number(obj.timestamp ?? obj.completedAt ?? Date.now());
  const completedAt = Number(obj.completedAt ?? timestamp);
  const durationPreset =
    obj.durationPreset === null || obj.durationPreset === undefined
      ? obj.presetSeconds === null || obj.presetSeconds === undefined
        ? null
        : Number(obj.presetSeconds)
      : Number(obj.durationPreset);
  const presetSeconds = durationPreset;

  const projected: TypingSessionRecord = {
    id: String(obj.id ?? ""),
    profileId: String(obj.profileId ?? ""),
    timestamp,
    completedAt,
    category: obj.category as TypingSessionRecord["category"],
    locale: obj.locale as UiLocale,
    durationPreset,
    presetSeconds,
    netWpm: Number(obj.netWpm ?? 0),
    grossWpm: Number(obj.grossWpm ?? 0),
    accuracy: Number(obj.accuracy ?? 0),
    characterCount: Number(obj.characterCount ?? 0),
    errorCount: Number(obj.errorCount ?? 0),
    elapsedSeconds: Number(obj.elapsedSeconds ?? 0),
  };
  return typingSessionRecordSchema.parse(projected);
}
