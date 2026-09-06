// @vitest-environment happy-dom
import { describe, expect, it, beforeEach } from "vitest";
import {
  THEME_ID,
  THEMES,
  TYPOGRAPHY_ID,
  TYPOGRAPHIES,
  SOUND_PROFILE_ID,
  SOUND_PROFILES,
  DEFAULT_THEME,
  DEFAULT_TYPOGRAPHY,
  DEFAULT_SOUND_PROFILE,
  THEME_STORAGE_KEY,
  FONT_STORAGE_KEY,
  applyTheme,
  getStoredTheme,
  getStoredTypography,
  getThemeDefinition,
  getTypographyDefinition,
} from "./theme";

function createMemoryStorage(): Storage {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => {
      store[key] = String(value);
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
    key: (index: number) => Object.keys(store)[index] ?? null,
    get length() {
      return Object.keys(store).length;
    },
  };
}

describe("Theme & Typography Tokens", () => {
  beforeEach(() => {
    try {
      if (
        !window.localStorage ||
        typeof window.localStorage.clear !== "function"
      ) {
        const memoryStorage = createMemoryStorage();
        Object.defineProperty(window, "localStorage", {
          value: memoryStorage,
          writable: true,
          configurable: true,
        });
        Object.defineProperty(globalThis, "localStorage", {
          value: memoryStorage,
          writable: true,
          configurable: true,
        });
      }
    } catch {
      // ignore
    }
    window.localStorage.clear();
    document.documentElement.removeAttribute("data-theme");
    document.documentElement.removeAttribute("data-font");
    document.documentElement.style.colorScheme = "";
  });

  it("exports all theme IDs and lists", () => {
    expect(THEME_ID.EDITORIAL).toBe("editorial");
    expect(THEME_ID.MIDNIGHT).toBe("midnight");
    expect(THEME_ID.NORDIC).toBe("nordic");
    expect(THEME_ID.FOREST).toBe("forest");
    expect(THEMES).toEqual(["editorial", "midnight", "nordic", "forest"]);
    expect(DEFAULT_THEME).toBe("editorial");
  });

  it("exports all typography IDs and lists", () => {
    expect(TYPOGRAPHY_ID.MONO).toBe("mono");
    expect(TYPOGRAPHY_ID.SERIF).toBe("serif");
    expect(TYPOGRAPHY_ID.SANS).toBe("sans");
    expect(TYPOGRAPHIES).toEqual(["mono", "serif", "sans"]);
    expect(DEFAULT_TYPOGRAPHY).toBe("mono");
  });

  it("exports all sound profile IDs and lists", () => {
    expect(SOUND_PROFILE_ID.LINEAR).toBe("linear");
    expect(SOUND_PROFILE_ID.CLICKY).toBe("clicky");
    expect(SOUND_PROFILE_ID.SOFT_BUBBLE).toBe("soft-bubble");
    expect(SOUND_PROFILE_ID.MUTE).toBe("mute");
    expect(SOUND_PROFILES).toEqual(["linear", "clicky", "soft-bubble", "mute"]);
    expect(DEFAULT_SOUND_PROFILE).toBe("linear");
  });

  it("exports expected localStorage key constants", () => {
    expect(THEME_STORAGE_KEY).toBe("entrama-theme");
    expect(FONT_STORAGE_KEY).toBe("entrama-font");
  });

  it("provides definitions with descriptive metadata", () => {
    const editorial = getThemeDefinition("editorial");
    expect(editorial.id).toBe("editorial");
    expect(editorial.name).toBeDefined();

    const mono = getTypographyDefinition("mono");
    expect(mono.id).toBe("mono");
    expect(mono.fontFamily).toBeDefined();
    expect(mono.name).toBeDefined();
  });

  it("applies theme and typography attributes to document root and syncs to localStorage", () => {
    applyTheme("midnight", "serif");
    expect(document.documentElement.getAttribute("data-theme")).toBe(
      "midnight",
    );
    expect(document.documentElement.getAttribute("data-font")).toBe("serif");
    expect(document.documentElement.style.colorScheme).toBe("dark");
    expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe("midnight");
    expect(window.localStorage.getItem(FONT_STORAGE_KEY)).toBe("serif");

    applyTheme("forest", "sans");
    expect(document.documentElement.getAttribute("data-theme")).toBe("forest");
    expect(document.documentElement.getAttribute("data-font")).toBe("sans");
    expect(document.documentElement.style.colorScheme).toBe("dark");
    expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe("forest");
    expect(window.localStorage.getItem(FONT_STORAGE_KEY)).toBe("sans");

    applyTheme("editorial", "mono");
    expect(document.documentElement.getAttribute("data-theme")).toBe(
      "editorial",
    );
    expect(document.documentElement.getAttribute("data-font")).toBe("mono");
    expect(document.documentElement.style.colorScheme).toBe("light");
    expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe("editorial");
    expect(window.localStorage.getItem(FONT_STORAGE_KEY)).toBe("mono");
  });

  it("applies default attributes when omitted or partial", () => {
    applyTheme("nordic");
    expect(document.documentElement.getAttribute("data-theme")).toBe("nordic");
    expect(document.documentElement.getAttribute("data-font")).toBe("mono");
    expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe("nordic");
    expect(window.localStorage.getItem(FONT_STORAGE_KEY)).toBe("mono");
  });

  it("retrieves stored theme and typography with getStoredTheme and getStoredTypography", () => {
    expect(getStoredTheme()).toBe(DEFAULT_THEME);
    expect(getStoredTypography()).toBe(DEFAULT_TYPOGRAPHY);

    window.localStorage.setItem(THEME_STORAGE_KEY, "forest");
    window.localStorage.setItem(FONT_STORAGE_KEY, "serif");

    expect(getStoredTheme()).toBe("forest");
    expect(getStoredTypography()).toBe("serif");

    // Falls back to default on invalid stored values
    window.localStorage.setItem(THEME_STORAGE_KEY, "invalid-theme");
    window.localStorage.setItem(FONT_STORAGE_KEY, "invalid-font");

    expect(getStoredTheme()).toBe(DEFAULT_THEME);
    expect(getStoredTypography()).toBe(DEFAULT_TYPOGRAPHY);
  });

  it("handles localStorage errors gracefully without crashing", () => {
    const originalSetItem = window.localStorage.setItem;
    window.localStorage.setItem = () => {
      throw new Error("QuotaExceededError");
    };

    expect(() => {
      applyTheme("nordic", "sans");
    }).not.toThrow();

    expect(document.documentElement.getAttribute("data-theme")).toBe("nordic");
    expect(document.documentElement.getAttribute("data-font")).toBe("sans");

    window.localStorage.setItem = originalSetItem;
  });
});
