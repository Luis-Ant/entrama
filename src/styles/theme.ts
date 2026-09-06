export const THEME_ID = {
  EDITORIAL: "editorial",
  MIDNIGHT: "midnight",
  NORDIC: "nordic",
  FOREST: "forest",
} as const;

export type ThemeId = (typeof THEME_ID)[keyof typeof THEME_ID];
export const THEMES: readonly ThemeId[] = [
  THEME_ID.EDITORIAL,
  THEME_ID.MIDNIGHT,
  THEME_ID.NORDIC,
  THEME_ID.FOREST,
] as const;

export const TYPOGRAPHY_ID = {
  MONO: "mono",
  SERIF: "serif",
  SANS: "sans",
} as const;

export type TypographyId = (typeof TYPOGRAPHY_ID)[keyof typeof TYPOGRAPHY_ID];
export const TYPOGRAPHIES: readonly TypographyId[] = [
  TYPOGRAPHY_ID.MONO,
  TYPOGRAPHY_ID.SERIF,
  TYPOGRAPHY_ID.SANS,
] as const;

export const SOUND_PROFILE_ID = {
  LINEAR: "linear",
  CLICKY: "clicky",
  SOFT_BUBBLE: "soft-bubble",
  MUTE: "mute",
} as const;

export type SoundProfileId =
  (typeof SOUND_PROFILE_ID)[keyof typeof SOUND_PROFILE_ID];
export const SOUND_PROFILES: readonly SoundProfileId[] = [
  SOUND_PROFILE_ID.LINEAR,
  SOUND_PROFILE_ID.CLICKY,
  SOUND_PROFILE_ID.SOFT_BUBBLE,
  SOUND_PROFILE_ID.MUTE,
] as const;

export const DEFAULT_THEME: ThemeId = THEME_ID.EDITORIAL;
export const DEFAULT_TYPOGRAPHY: TypographyId = TYPOGRAPHY_ID.MONO;
export const DEFAULT_SOUND_PROFILE: SoundProfileId = SOUND_PROFILE_ID.LINEAR;

export interface ThemeDefinition {
  readonly id: ThemeId;
  readonly name: string;
  readonly description: string;
  readonly isDark: boolean;
  readonly previewColor: string;
}

export interface TypographyDefinition {
  readonly id: TypographyId;
  readonly name: string;
  readonly fontFamily: string;
  readonly description: string;
}

export const THEME_DEFINITIONS: Record<ThemeId, ThemeDefinition> = {
  [THEME_ID.EDITORIAL]: {
    id: THEME_ID.EDITORIAL,
    name: "Editorial",
    description: "Warm paper tones inspired by classic print typography.",
    isDark: false,
    previewColor: "#f5f2eb",
  },
  [THEME_ID.MIDNIGHT]: {
    id: THEME_ID.MIDNIGHT,
    name: "Midnight",
    description: "Obsidian dark mode with vibrant neon highlights.",
    isDark: true,
    previewColor: "#0f111a",
  },
  [THEME_ID.NORDIC]: {
    id: THEME_ID.NORDIC,
    name: "Nordic",
    description: "Slate grey and frosty ice-blue minimalist aesthetic.",
    isDark: true,
    previewColor: "#1e222b",
  },
  [THEME_ID.FOREST]: {
    id: THEME_ID.FOREST,
    name: "Forest",
    description: "Deep pine greens, earthy moss, and matcha accents.",
    isDark: true,
    previewColor: "#141c16",
  },
};

export const TYPOGRAPHY_DEFINITIONS: Record<
  TypographyId,
  TypographyDefinition
> = {
  [TYPOGRAPHY_ID.MONO]: {
    id: TYPOGRAPHY_ID.MONO,
    name: "Monospace",
    fontFamily:
      'ui-monospace, "SF Mono", "JetBrains Mono", "Fira Code", monospace',
    description: "Fixed-width font designed for precision and rhythm.",
  },
  [TYPOGRAPHY_ID.SERIF]: {
    id: TYPOGRAPHY_ID.SERIF,
    name: "Serif",
    fontFamily:
      '"Iowan Old Style", "Palatino Linotype", "Newsreader", Georgia, serif',
    description: "Elegant serif typography for literary immersion.",
  },
  [TYPOGRAPHY_ID.SANS]: {
    id: TYPOGRAPHY_ID.SANS,
    name: "Sans-Serif",
    fontFamily: '"Aptos", "Inter", "Segoe UI", system-ui, sans-serif',
    description: "Clean, modern geometric sans-serif typeface.",
  },
};

export function getThemeDefinition(id: ThemeId): ThemeDefinition {
  return THEME_DEFINITIONS[id] ?? THEME_DEFINITIONS[DEFAULT_THEME];
}

export function getTypographyDefinition(
  id: TypographyId,
): TypographyDefinition {
  return (
    TYPOGRAPHY_DEFINITIONS[id] ?? TYPOGRAPHY_DEFINITIONS[DEFAULT_TYPOGRAPHY]
  );
}

export const THEME_STORAGE_KEY = "entrama-theme" as const;
export const FONT_STORAGE_KEY = "entrama-font" as const;
export const TYPOGRAPHY_STORAGE_KEY = FONT_STORAGE_KEY;

function getLocalStorage(): Storage | undefined {
  if (typeof window !== "undefined" && window.localStorage) {
    return window.localStorage;
  }
  if (
    typeof globalThis !== "undefined" &&
    (globalThis as unknown as { localStorage?: Storage }).localStorage
  ) {
    return (globalThis as unknown as { localStorage: Storage }).localStorage;
  }
  return undefined;
}

export function getStoredTheme(): ThemeId {
  const storage = getLocalStorage();
  if (storage) {
    try {
      const stored = storage.getItem(THEME_STORAGE_KEY) as ThemeId | null;
      if (stored && THEMES.includes(stored)) {
        return stored;
      }
    } catch {
      // Ignore storage read errors
    }
  }
  return DEFAULT_THEME;
}

export function getStoredTypography(): TypographyId {
  const storage = getLocalStorage();
  if (storage) {
    try {
      const stored = storage.getItem(FONT_STORAGE_KEY) as TypographyId | null;
      if (stored && TYPOGRAPHIES.includes(stored)) {
        return stored;
      }
    } catch {
      // Ignore storage read errors
    }
  }
  return DEFAULT_TYPOGRAPHY;
}

export function applyTheme(
  theme: ThemeId = DEFAULT_THEME,
  typography: TypographyId = DEFAULT_TYPOGRAPHY,
): void {
  const validTheme = THEMES.includes(theme) ? theme : DEFAULT_THEME;
  const validTypo = TYPOGRAPHIES.includes(typography)
    ? typography
    : DEFAULT_TYPOGRAPHY;

  const storage = getLocalStorage();
  if (storage) {
    try {
      storage.setItem(THEME_STORAGE_KEY, validTheme);
      storage.setItem(FONT_STORAGE_KEY, validTypo);
    } catch {
      // In private browsing or storage quota errors, ignore gracefully
    }
  }

  if (typeof document !== "undefined" && document.documentElement) {
    document.documentElement.setAttribute("data-theme", validTheme);
    document.documentElement.setAttribute("data-font", validTypo);

    const def = getThemeDefinition(validTheme);
    document.documentElement.style.colorScheme = def.isDark ? "dark" : "light";
  }
}
