// @vitest-environment happy-dom
import { act } from "react";
import { createRoot, Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  DEFAULT_SOUND_PROFILE,
  DEFAULT_THEME,
  DEFAULT_TYPOGRAPHY,
  FONT_STORAGE_KEY,
  SOUND_PROFILE_ID,
  THEME_ID,
  THEME_STORAGE_KEY,
  TYPOGRAPHY_ID,
} from "../../styles/theme";
import { AudioSynthesizer } from "../audio/audioSynthesizer";
import { SoundSelector } from "../audio/SoundSelector";
import { ThemeSelector } from "./ThemeSelector";

// Ensure React act environment flag is set
(
  globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT?: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;

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

describe("ThemeSelector and SoundSelector Components", () => {
  let container: HTMLDivElement;
  let root: Root;

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
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
    document.documentElement.removeAttribute("data-theme");
    document.documentElement.removeAttribute("data-font");
    document.documentElement.style.colorScheme = "";
  });

  afterEach(() => {
    act(() => {
      root.unmount();
    });
    container.remove();
  });

  describe("ThemeSelector", () => {
    it("renders theme and typography options with localized labels in English", () => {
      act(() => {
        root.render(
          <ThemeSelector
            activeTheme={DEFAULT_THEME}
            activeTypography={DEFAULT_TYPOGRAPHY}
            locale="en"
          />,
        );
      });

      expect(container.textContent).toContain("Theme");
      expect(container.textContent).toContain("Editorial");
      expect(container.textContent).toContain("Midnight");
      expect(container.textContent).toContain("Nordic");
      expect(container.textContent).toContain("Forest");
      expect(container.textContent).toContain("Typography");
      expect(container.textContent).toContain("Monospace");
      expect(container.textContent).toContain("Serif");
      expect(container.textContent).toContain("Sans-Serif");
    });

    it("renders with localized labels in Spanish", () => {
      act(() => {
        root.render(
          <ThemeSelector
            activeTheme={DEFAULT_THEME}
            activeTypography={DEFAULT_TYPOGRAPHY}
            locale="es"
          />,
        );
      });

      expect(container.textContent).toContain("Tema visual");
      expect(container.textContent).toContain("Medianoche");
      expect(container.textContent).toContain("Nórdico");
      expect(container.textContent).toContain("Bosque");
      expect(container.textContent).toContain("Tipografía");
      expect(container.textContent).toContain("Monoespaciada");
      expect(container.textContent).toContain("Serifa");
    });

    it("triggers onThemeChange, updates localStorage, and applies data-theme on theme selection", () => {
      const onThemeChange = vi.fn();
      act(() => {
        root.render(
          <ThemeSelector
            activeTheme={DEFAULT_THEME}
            activeTypography={DEFAULT_TYPOGRAPHY}
            locale="en"
            onThemeChange={onThemeChange}
          />,
        );
      });

      const midnightButton = Array.from(
        container.querySelectorAll("button"),
      ).find((b) => b.textContent?.includes("Midnight"));

      expect(midnightButton).toBeDefined();

      act(() => {
        midnightButton?.click();
      });

      expect(onThemeChange).toHaveBeenCalledWith(THEME_ID.MIDNIGHT);
      expect(document.documentElement.getAttribute("data-theme")).toBe(
        THEME_ID.MIDNIGHT,
      );
      expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe(
        THEME_ID.MIDNIGHT,
      );
    });

    it("triggers onTypographyChange, updates localStorage, and applies data-font on typography selection", () => {
      const onTypographyChange = vi.fn();
      act(() => {
        root.render(
          <ThemeSelector
            activeTheme={DEFAULT_THEME}
            activeTypography={DEFAULT_TYPOGRAPHY}
            locale="en"
            onTypographyChange={onTypographyChange}
          />,
        );
      });

      const serifButton = Array.from(container.querySelectorAll("button")).find(
        (b) => b.textContent?.includes("Serif"),
      );

      expect(serifButton).toBeDefined();

      act(() => {
        serifButton?.click();
      });

      expect(onTypographyChange).toHaveBeenCalledWith(TYPOGRAPHY_ID.SERIF);
      expect(document.documentElement.getAttribute("data-font")).toBe(
        TYPOGRAPHY_ID.SERIF,
      );
      expect(window.localStorage.getItem(FONT_STORAGE_KEY)).toBe(
        TYPOGRAPHY_ID.SERIF,
      );
    });

    it("has accessible ARIA attributes for active states", () => {
      act(() => {
        root.render(
          <ThemeSelector
            activeTheme={THEME_ID.FOREST}
            activeTypography={TYPOGRAPHY_ID.SANS}
            locale="en"
          />,
        );
      });

      const forestButton = Array.from(
        container.querySelectorAll("button"),
      ).find((b) => b.textContent?.includes("Forest"));

      expect(forestButton?.getAttribute("aria-pressed")).toBe("true");

      const sansButton = Array.from(container.querySelectorAll("button")).find(
        (b) => b.textContent?.includes("Sans-Serif"),
      );

      expect(sansButton?.getAttribute("aria-pressed")).toBe("true");
    });
  });

  describe("SoundSelector", () => {
    let mockSynth: AudioSynthesizer;

    beforeEach(() => {
      mockSynth = new AudioSynthesizer({
        audioContextFactory: () => undefined,
      });
      vi.spyOn(mockSynth, "playKeyPressSound");
      vi.spyOn(mockSynth, "setProfile");
      vi.spyOn(mockSynth, "setMuted");
    });

    it("renders sound profile options with localized labels in English", () => {
      act(() => {
        root.render(
          <SoundSelector
            activeProfile={DEFAULT_SOUND_PROFILE}
            muted={false}
            locale="en"
            synthesizer={mockSynth}
          />,
        );
      });

      expect(container.textContent).toContain("Key Acoustics");
      expect(container.textContent).toContain("Linear");
      expect(container.textContent).toContain("Clicky");
      expect(container.textContent).toContain("Soft Bubble");
      expect(container.textContent).toContain("Mute");
    });

    it("triggers onProfileChange and plays preview sound on profile click", () => {
      const onProfileChange = vi.fn();
      act(() => {
        root.render(
          <SoundSelector
            activeProfile={DEFAULT_SOUND_PROFILE}
            muted={false}
            locale="en"
            synthesizer={mockSynth}
            onProfileChange={onProfileChange}
          />,
        );
      });

      const clickyButton = Array.from(
        container.querySelectorAll("button"),
      ).find((b) => b.textContent?.includes("Clicky"));

      expect(clickyButton).toBeDefined();

      act(() => {
        clickyButton?.click();
      });

      expect(onProfileChange).toHaveBeenCalledWith(SOUND_PROFILE_ID.CLICKY);
      expect(mockSynth.setProfile).toHaveBeenCalledWith(
        SOUND_PROFILE_ID.CLICKY,
      );
      expect(mockSynth.playKeyPressSound).toHaveBeenCalledWith(
        SOUND_PROFILE_ID.CLICKY,
      );
    });

    it("toggles mute state when mute toggle button is clicked", () => {
      const onMuteToggle = vi.fn();
      act(() => {
        root.render(
          <SoundSelector
            activeProfile={DEFAULT_SOUND_PROFILE}
            muted={false}
            locale="en"
            synthesizer={mockSynth}
            onMuteToggle={onMuteToggle}
          />,
        );
      });

      const muteButton = container.querySelector(
        'button[data-testid="mute-toggle-button"]',
      ) as HTMLButtonElement;

      expect(muteButton).toBeDefined();

      act(() => {
        muteButton.click();
      });

      expect(onMuteToggle).toHaveBeenCalledWith(true);
      expect(mockSynth.setMuted).toHaveBeenCalledWith(true);
    });

    it("triggers preview sound button", () => {
      act(() => {
        root.render(
          <SoundSelector
            activeProfile={SOUND_PROFILE_ID.SOFT_BUBBLE}
            muted={false}
            locale="en"
            synthesizer={mockSynth}
          />,
        );
      });

      const previewButton = container.querySelector(
        'button[data-testid="preview-sound-button"]',
      ) as HTMLButtonElement;

      expect(previewButton).toBeDefined();

      act(() => {
        previewButton.click();
      });

      expect(mockSynth.playKeyPressSound).toHaveBeenCalledWith(
        SOUND_PROFILE_ID.SOFT_BUBBLE,
      );
    });
  });
});
