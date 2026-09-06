export const LAYOUT_PROFILE_ID = {
  WINDOWS_US_INTERNATIONAL: "windows-us-international",
  WINDOWS_LATIN_AMERICAN_QWERTY: "windows-latin-american-qwerty",
  MACOS_US_INTERNATIONAL: "macos-us-international",
  MACOS_LATIN_AMERICAN_QWERTY: "macos-latin-american-qwerty",
} as const;

export type LayoutProfileId =
  (typeof LAYOUT_PROFILE_ID)[keyof typeof LAYOUT_PROFILE_ID];

// prettier-ignore
export interface CalibrationStepV1 { readonly id: string; readonly mandatory: boolean; readonly code: string; readonly altKey: boolean; readonly ctrlKey: boolean; readonly metaKey: boolean; readonly shiftKey: boolean; readonly expected: string; readonly allowComposition: boolean; }

// prettier-ignore
export interface LayoutDefinitionV1 { readonly schemaVersion: 1; readonly definitionId: string; readonly layoutProfileId: LayoutProfileId; readonly version: number; readonly steps: readonly CalibrationStepV1[]; }

// prettier-ignore
export interface CalibrationEvidence { readonly code: string; readonly altKey: boolean; readonly ctrlKey: boolean; readonly metaKey: boolean; readonly shiftKey: boolean; readonly committed: string; readonly inputType: string; readonly composing: boolean; readonly cancelled: boolean; readonly repeat: boolean; }
