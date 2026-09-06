// @vitest-environment happy-dom
import React, { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { CatalogPassage } from "../../typing/catalogs";
import { DEFAULT_SOUND_PROFILE } from "../../styles/theme";
import { audioSynthesizer } from "../audio/audioSynthesizer";
import { CatalogSelector } from "./CatalogSelector";
import { FreeTypingView } from "./FreeTypingView";
import { SessionSummaryModal } from "./SessionSummaryModal";
import { TimerSelector } from "./TimerSelector";

(
  globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;

const testPassage: CatalogPassage = {
  id: "test-passage",
  category: "stories",
  locale: "en",
  title: "Test Story",
  text: "Hello world",
  difficulty: "easy",
};

describe("CatalogSelector view", () => {
  let container: HTMLDivElement | null = null;
  let root: ReturnType<typeof createRoot> | null = null;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    if (root) act(() => root?.unmount());
    if (container) container.remove();
    container = null;
    root = null;
  });

  it("renders category tabs and calls onSelectCategory on tab click", () => {
    const onSelectCategory = vi.fn();

    act(() => {
      root?.render(
        React.createElement(CatalogSelector, {
          selectedCategory: "stories",
          onSelectCategory,
          locale: "en",
        }),
      );
    });

    const tabs = container?.querySelectorAll('[role="tab"]');
    expect(tabs?.length).toBe(4);

    const techTab = Array.from(tabs || []).find((t) =>
      t.textContent?.includes("Technology"),
    );
    expect(techTab).not.toBeUndefined();

    act(() => {
      techTab?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    expect(onSelectCategory).toHaveBeenCalledWith("technology");
  });

  it("calls onSelectPassage when a passage card is clicked", () => {
    const onSelectPassage = vi.fn();

    act(() => {
      root?.render(
        React.createElement(CatalogSelector, {
          selectedCategory: "stories",
          onSelectCategory: vi.fn(),
          passages: [testPassage],
          selectedPassageId: testPassage.id,
          onSelectPassage,
          locale: "en",
        }),
      );
    });

    const passageCard = container?.querySelector(
      `[aria-pressed="true"]`,
    ) as HTMLButtonElement;
    expect(passageCard).not.toBeNull();
    expect(passageCard?.textContent).toContain("Test Story");

    act(() => {
      passageCard.click();
    });

    expect(onSelectPassage).toHaveBeenCalledWith(testPassage);
  });

  it("disables tabs and cards when disabled prop is true", () => {
    act(() => {
      root?.render(
        React.createElement(CatalogSelector, {
          selectedCategory: "stories",
          onSelectCategory: vi.fn(),
          disabled: true,
        }),
      );
    });

    const buttons = container?.querySelectorAll("button");
    buttons?.forEach((btn) => {
      expect(btn.disabled).toBe(true);
    });
  });
});

describe("TimerSelector view", () => {
  let container: HTMLDivElement | null = null;
  let root: ReturnType<typeof createRoot> | null = null;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    if (root) act(() => root?.unmount());
    if (container) container.remove();
    container = null;
    root = null;
  });

  it("renders duration presets and handles preset selection", () => {
    const onSelectPreset = vi.fn();

    act(() => {
      root?.render(
        React.createElement(TimerSelector, {
          selectedPreset: 30,
          onSelectPreset,
          locale: "en",
        }),
      );
    });

    const buttons = container?.querySelectorAll("button");
    expect(buttons?.length).toBe(4);

    const btn60 = Array.from(buttons || []).find((b) =>
      b.textContent?.includes("60s"),
    );
    expect(btn60).not.toBeUndefined();

    act(() => {
      btn60?.click();
    });

    expect(onSelectPreset).toHaveBeenCalledWith(60);
  });
});

describe("SessionSummaryModal view", () => {
  let container: HTMLDivElement | null = null;
  let root: ReturnType<typeof createRoot> | null = null;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    if (root) act(() => root?.unmount());
    if (container) container.remove();
    container = null;
    root = null;
  });

  it("does not render when isOpen is false", () => {
    act(() => {
      root?.render(
        React.createElement(SessionSummaryModal, {
          isOpen: false,
          netWpm: 50,
          grossWpm: 55,
          accuracy: 98,
          characterCount: 200,
          errorCount: 2,
          elapsedSeconds: 60,
        }),
      );
    });

    expect(container?.querySelector('[role="dialog"]')).toBeNull();
  });

  it("renders stats, celebrations, best streak, and invokes actions when open", () => {
    const onRetry = vi.fn();
    const onChangeSetup = vi.fn();
    const onClose = vi.fn();

    act(() => {
      root?.render(
        React.createElement(SessionSummaryModal, {
          isOpen: true,
          netWpm: 72,
          grossWpm: 75,
          accuracy: 99,
          characterCount: 250,
          errorCount: 1,
          elapsedSeconds: 60,
          bestStreak: 45,
          isPersonalBest: true,
          locale: "en",
          onRetry,
          onChangeSetup,
          onClose,
        }),
      );
    });

    expect(container?.textContent).toContain("Session Summary");
    expect(container?.textContent).toContain("72");
    expect(container?.textContent).toContain("99%");
    expect(container?.textContent).toContain("Flawless Performance!");
    expect(container?.textContent).toContain("45");
    expect(container?.textContent).toContain("1");

    const buttons = container?.querySelectorAll("button");
    const retryBtn = Array.from(buttons || []).find((b) =>
      b.textContent?.includes("Practice Again"),
    );
    const changeBtn = Array.from(buttons || []).find((b) =>
      b.textContent?.includes("Change Passage"),
    );
    const closeBtn = Array.from(buttons || []).find((b) =>
      b.textContent?.includes("Close"),
    );

    act(() => {
      retryBtn?.click();
      changeBtn?.click();
      closeBtn?.click();
    });

    expect(onRetry).toHaveBeenCalled();
    expect(onChangeSetup).toHaveBeenCalled();
    expect(onClose).toHaveBeenCalled();
  });
});

describe("FreeTypingView view and delight integration", () => {
  let container: HTMLDivElement | null = null;
  let root: ReturnType<typeof createRoot> | null = null;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    if (root) act(() => root?.unmount());
    if (container) container.remove();
    container = null;
    root = null;
    vi.restoreAllMocks();
  });

  it("renders delight components (SmoothCaret, StreakBadge, WpmSparkline, VisualKeyboard)", () => {
    act(() => {
      root?.render(
        React.createElement(FreeTypingView, {
          initialPassage: testPassage,
          initialPreset: 30,
          locale: "en",
          initialShowKeyboard: true,
        }),
      );
    });

    // Verify SmoothCaret
    const caret = container?.querySelector('[data-testid="smooth-caret"]');
    expect(caret).not.toBeNull();

    // Verify StreakBadge
    const streakBadge = container?.querySelector(
      '[data-testid="streak-badge"]',
    );
    expect(streakBadge).not.toBeNull();
    expect(streakBadge?.getAttribute("data-streak")).toBe("0");

    // Verify WpmSparkline
    const sparkline = container?.querySelector('[data-testid="wpm-sparkline"]');
    expect(sparkline).not.toBeNull();

    // Verify VisualKeyboard
    const keyboard = container?.querySelector(
      '[data-testid="visual-keyboard"]',
    );
    expect(keyboard).not.toBeNull();
  });

  it("allows toggling VisualKeyboard on and off", () => {
    act(() => {
      root?.render(
        React.createElement(FreeTypingView, {
          initialPassage: testPassage,
          initialPreset: 30,
          locale: "en",
          initialShowKeyboard: true,
        }),
      );
    });

    expect(
      container?.querySelector('[data-testid="visual-keyboard"]'),
    ).not.toBeNull();

    const buttons = container?.querySelectorAll("button");
    const toggleBtn = Array.from(buttons || []).find((b) =>
      b.textContent?.includes("Hide Keyboard"),
    );
    expect(toggleBtn).not.toBeUndefined();

    // Click to hide keyboard
    act(() => {
      toggleBtn?.click();
    });

    expect(
      container?.querySelector('[data-testid="visual-keyboard"]'),
    ).toBeNull();
    expect(toggleBtn?.textContent).toContain("Show Keyboard");

    // Click again to show keyboard
    act(() => {
      toggleBtn?.click();
    });

    expect(
      container?.querySelector('[data-testid="visual-keyboard"]'),
    ).not.toBeNull();
  });

  it("triggers audio playback and updates streak on typing input", async () => {
    const playSpy = vi.spyOn(audioSynthesizer, "playKeyPressSound");
    const onSessionComplete = vi.fn();

    act(() => {
      root?.render(
        React.createElement(FreeTypingView, {
          initialPassage: testPassage,
          initialPreset: 30,
          locale: "en",
          onSessionComplete,
        }),
      );
    });

    const textarea = container?.querySelector(
      "textarea",
    ) as HTMLTextAreaElement;
    expect(textarea).not.toBeNull();

    // Type "H"
    act(() => {
      textarea.value = "H";
      textarea.dispatchEvent(
        new InputEvent("input", {
          inputType: "insertText",
          data: "H",
          bubbles: true,
        }),
      );
    });

    expect(playSpy).toHaveBeenCalled();
    const streakBadge = container?.querySelector(
      '[data-testid="streak-badge"]',
    );
    expect(streakBadge?.getAttribute("data-streak")).toBe("1");

    // Type remainder "ello world"
    const remaining = "ello world";
    for (const char of remaining) {
      act(() => {
        textarea.value = char;
        textarea.dispatchEvent(
          new InputEvent("input", {
            inputType: "insertText",
            data: char,
            bubbles: true,
          }),
        );
      });
    }

    expect(onSessionComplete).toHaveBeenCalled();
    const record = onSessionComplete.mock.calls[0][0];
    expect(record.characterCount).toBe(11);
    expect(record.errorCount).toBe(0);
    expect(record.accuracy).toBe(100);

    // Summary modal should now be visible
    expect(container?.textContent).toContain("Session Summary");
  });

  it("handles error blocking, Backspace error clearing, and resets streak on error", () => {
    act(() => {
      root?.render(
        React.createElement(FreeTypingView, {
          initialPassage: testPassage,
          initialPreset: 30,
          locale: "en",
        }),
      );
    });

    const textarea = container?.querySelector(
      "textarea",
    ) as HTMLTextAreaElement;

    // Type incorrect character 'x' when 'H' is expected
    act(() => {
      textarea.value = "x";
      textarea.dispatchEvent(
        new InputEvent("input", {
          inputType: "insertText",
          data: "x",
          bubbles: true,
        }),
      );
    });

    expect(container?.textContent).toContain("Press Backspace to correct");
    const streakBadge = container?.querySelector(
      '[data-testid="streak-badge"]',
    );
    expect(streakBadge?.getAttribute("data-streak")).toBe("0");

    const caret = container?.querySelector('[data-testid="smooth-caret"]');
    expect(caret?.getAttribute("data-error")).toBe("true");

    const playSpy = vi.spyOn(audioSynthesizer, "playKeyPressSound");

    // Press Backspace to clear error block
    act(() => {
      textarea.dispatchEvent(
        new KeyboardEvent("keydown", { key: "Backspace", bubbles: true }),
      );
    });

    expect(playSpy).toHaveBeenCalledWith(DEFAULT_SOUND_PROFILE, "Backspace");
    expect(container?.textContent).toContain("Type the highlighted character");
    const caretAfterBackspace = container?.querySelector(
      '[data-testid="smooth-caret"]',
    );
    expect(caretAfterBackspace?.getAttribute("data-error")).toBe("false");

    // Press Backspace again when not in error state - sound still plays unconditionally
    playSpy.mockClear();
    act(() => {
      textarea.dispatchEvent(
        new KeyboardEvent("keydown", { key: "Backspace", bubbles: true }),
      );
    });
    expect(playSpy).toHaveBeenCalledWith(DEFAULT_SOUND_PROFILE, "Backspace");
  });

  it("handles Escape pause and resume toggle", () => {
    act(() => {
      root?.render(
        React.createElement(FreeTypingView, {
          initialPassage: testPassage,
          initialPreset: 30,
          locale: "en",
        }),
      );
    });

    const textarea = container?.querySelector(
      "textarea",
    ) as HTMLTextAreaElement;

    // Type first character to transition to 'running'
    act(() => {
      textarea.value = "H";
      textarea.dispatchEvent(
        new InputEvent("input", {
          inputType: "insertText",
          data: "H",
          bubbles: true,
        }),
      );
    });

    // Press Escape to pause
    act(() => {
      textarea.dispatchEvent(
        new KeyboardEvent("keydown", { key: "Escape", bubbles: true }),
      );
    });

    expect(container?.textContent).toContain("Practice paused.");

    // Press Escape again to resume
    act(() => {
      textarea.dispatchEvent(
        new KeyboardEvent("keydown", { key: "Escape", bubbles: true }),
      );
    });

    expect(container?.textContent).toContain("Practice resumed.");
  });

  it("handles quick restart with Tab + Enter hotkey sequence and resets progress", () => {
    act(() => {
      root?.render(
        React.createElement(FreeTypingView, {
          initialPassage: testPassage,
          initialPreset: 30,
          locale: "en",
        }),
      );
    });

    const textarea = container?.querySelector(
      "textarea",
    ) as HTMLTextAreaElement;

    // Type two characters
    act(() => {
      textarea.value = "H";
      textarea.dispatchEvent(
        new InputEvent("input", {
          inputType: "insertText",
          data: "H",
          bubbles: true,
        }),
      );
    });
    act(() => {
      textarea.value = "e";
      textarea.dispatchEvent(
        new InputEvent("input", {
          inputType: "insertText",
          data: "e",
          bubbles: true,
        }),
      );
    });

    const streakBadge = container?.querySelector(
      '[data-testid="streak-badge"]',
    );
    expect(streakBadge?.getAttribute("data-streak")).toBe("2");

    // Press Tab then Enter
    act(() => {
      textarea.dispatchEvent(
        new KeyboardEvent("keydown", { key: "Tab", bubbles: true }),
      );
      textarea.dispatchEvent(
        new KeyboardEvent("keydown", { key: "Enter", bubbles: true }),
      );
    });

    // Progress and streak reset
    const streakBadgeAfterReset = container?.querySelector(
      '[data-testid="streak-badge"]',
    );
    expect(streakBadgeAfterReset?.getAttribute("data-streak")).toBe("0");
    expect(container?.textContent).toContain("Start typing to begin");
  });

  it("handles simultaneous Tab + Enter combo hotkey restart", () => {
    act(() => {
      root?.render(
        React.createElement(FreeTypingView, {
          initialPassage: testPassage,
          initialPreset: 30,
          locale: "en",
        }),
      );
    });

    const textarea = container?.querySelector(
      "textarea",
    ) as HTMLTextAreaElement;

    // Type a character
    act(() => {
      textarea.value = "H";
      textarea.dispatchEvent(
        new InputEvent("input", {
          inputType: "insertText",
          data: "H",
          bubbles: true,
        }),
      );
    });

    // Press Enter with shiftKey / combo
    act(() => {
      textarea.dispatchEvent(
        new KeyboardEvent("keydown", {
          key: "Enter",
          shiftKey: true,
          bubbles: true,
        }),
      );
    });

    const streakBadge = container?.querySelector(
      '[data-testid="streak-badge"]',
    );
    expect(streakBadge?.getAttribute("data-streak")).toBe("0");
  });

  it("toggles Zen Mode on and off, hiding peripheral setup and metrics", () => {
    act(() => {
      root?.render(
        React.createElement(FreeTypingView, {
          initialPassage: testPassage,
          initialPreset: 30,
          locale: "en",
          initialShowKeyboard: true,
        }),
      );
    });

    // Initially peripheral widgets are present
    expect(
      container?.querySelector('[data-testid="free-typing-aside"]'),
    ).not.toBeNull();
    expect(
      container?.querySelector('[data-testid="visual-keyboard"]'),
    ).not.toBeNull();

    const zenButton = container?.querySelector(
      '[data-testid="toggle-zen-mode-button"]',
    ) as HTMLButtonElement;
    expect(zenButton).not.toBeNull();
    expect(zenButton.getAttribute("aria-pressed")).toBe("false");
    expect(zenButton.textContent).toContain("Zen Mode");

    // Toggle Zen mode on
    act(() => {
      zenButton.click();
    });

    expect(zenButton.getAttribute("aria-pressed")).toBe("true");
    expect(zenButton.textContent).toContain("Exit Zen Mode");
    // Aside metrics and visual keyboard should be hidden
    expect(
      container?.querySelector('[data-testid="free-typing-aside"]'),
    ).toBeNull();
    expect(
      container?.querySelector('[data-testid="visual-keyboard"]'),
    ).toBeNull();

    // Toggle Zen mode off
    act(() => {
      zenButton.click();
    });

    expect(zenButton.getAttribute("aria-pressed")).toBe("false");
    expect(zenButton.textContent).toContain("Zen Mode");
    expect(
      container?.querySelector('[data-testid="free-typing-aside"]'),
    ).not.toBeNull();
    expect(
      container?.querySelector('[data-testid="visual-keyboard"]'),
    ).not.toBeNull();
  });

  it("respects initialZenMode prop and renders bilingual strings in Spanish", () => {
    act(() => {
      root?.render(
        React.createElement(FreeTypingView, {
          initialPassage: testPassage,
          initialPreset: 30,
          locale: "es",
          initialZenMode: true,
        }),
      );
    });

    const zenButton = container?.querySelector(
      '[data-testid="toggle-zen-mode-button"]',
    ) as HTMLButtonElement;
    expect(zenButton.getAttribute("aria-pressed")).toBe("true");
    expect(zenButton.textContent).toContain("Salir del Modo Zen");
    expect(container?.textContent).toContain("Reinicio rápido: Tab + Enter");
    expect(
      container?.querySelector('[data-testid="free-typing-aside"]'),
    ).toBeNull();
  });
});
