// @vitest-environment happy-dom
import "fake-indexeddb/auto";
import React, { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { KEYBOARD_DEFINITIONS } from "../keyboard-layouts/definitions";
import { LAYOUT_PROFILE_ID } from "../keyboard-layouts/types";
import { UI_LOCALE } from "../onboarding/repositories";
import { OnboardingDatabase } from "../storage-dexie/database";
import {
  DexieCalibrationRepository,
  DexieOnboardingRepository,
  DexiePreferenceRepository,
  DexieProfileRepository,
  DexieTypingSessionRepository,
} from "../storage-dexie/repositories";
import { SOUND_PROFILE_ID, THEME_ID, TYPOGRAPHY_ID } from "../styles/theme";
import { getCatalogPassage } from "../typing/catalogs";
import { audioSynthesizer } from "./audio/audioSynthesizer";
import { App } from "./App";

(
  globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;

describe("App Onboarding & Runtime Integration", () => {
  let db: OnboardingDatabase;
  let onboardingRepo: DexieOnboardingRepository;
  let profileRepo: DexieProfileRepository;
  let preferenceRepo: DexiePreferenceRepository;
  let calibrationRepo: DexieCalibrationRepository;
  let typingSessionRepo: DexieTypingSessionRepository;
  let container: HTMLDivElement | null = null;
  let root: ReturnType<typeof createRoot> | null = null;

  beforeEach(async () => {
    db = new OnboardingDatabase(
      `app-test-db-${Math.random().toString(36).slice(2)}`,
    );
    await db.open();
    onboardingRepo = new DexieOnboardingRepository(db);
    profileRepo = new DexieProfileRepository(db);
    preferenceRepo = new DexiePreferenceRepository(db);
    calibrationRepo = new DexieCalibrationRepository(db);
    typingSessionRepo = new DexieTypingSessionRepository(db);

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

  async function renderApp() {
    await act(async () => {
      root?.render(
        React.createElement(App, {
          onboardingRepository: onboardingRepo,
          profileRepository: profileRepo,
          preferenceRepository: preferenceRepo,
          typingSessionRepository: typingSessionRepo,
          updateServiceWorker: vi.fn(),
        }),
      );
    });
    await flush();
  }

  async function flush() {
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 20));
    });
  }

  it("boots to LanguageStep when no preferences exist", async () => {
    await renderApp();
    expect(container?.textContent).toContain("Select UI Language");
    expect(container?.textContent).not.toContain("Starter practice");
  });

  it("progresses through complete onboarding flow: Language -> Profile -> Calibration -> Posture -> Finger Placement -> Sequence -> Practice Shell", async () => {
    await renderApp();

    // 1. Language Step: select English
    const enBtn = Array.from(container?.querySelectorAll("button") || []).find(
      (b) => b.textContent?.includes("English"),
    );
    expect(enBtn).not.toBeUndefined();
    await act(async () => {
      enBtn?.click();
    });
    await flush();

    // 2. Profile Step: confirm default layout (Windows US International)
    expect(container?.textContent).toContain("Select Keyboard Layout Profile");
    const confirmProfileBtn = Array.from(
      container?.querySelectorAll("button") || [],
    ).find((b) => b.textContent?.includes("Confirm"));
    expect(confirmProfileBtn).not.toBeUndefined();
    await act(async () => {
      confirmProfileBtn?.click();
    });
    await flush();

    // 3. Calibration Step: complete all 7 steps for Windows US International
    expect(container?.textContent).toContain("Keyboard Layout Calibration");
    const def =
      KEYBOARD_DEFINITIONS[LAYOUT_PROFILE_ID.WINDOWS_US_INTERNATIONAL];

    for (const step of def.steps) {
      const input = container?.querySelector("input") as HTMLInputElement;
      expect(input).not.toBeNull();

      await act(async () => {
        input.dispatchEvent(
          new KeyboardEvent("keydown", {
            code: step.code,
            shiftKey: step.shiftKey,
            altKey: step.altKey,
            ctrlKey: step.ctrlKey,
            metaKey: step.metaKey,
            bubbles: true,
          }),
        );
        if (step.allowComposition) {
          const compEnd = new CompositionEvent("compositionend", {
            data: step.expected,
            bubbles: true,
          });
          Object.defineProperty(compEnd, "data", { value: step.expected });
          input.dispatchEvent(compEnd);
        }
        input.value = step.expected;
        input.dispatchEvent(
          new InputEvent("input", {
            inputType: "insertText",
            data: step.expected,
            bubbles: true,
          }),
        );
      });
      await flush();
    }

    // 4. Guided Posture Step
    expect(container?.textContent).toContain("Ergonomic Posture Orientation");
    expect(container?.textContent).not.toContain("Starter practice");

    const postureConfirmBtn = Array.from(
      container?.querySelectorAll("button") || [],
    ).find((b) => b.textContent?.includes("Continue to Finger Placement")) as
      HTMLButtonElement | undefined;
    expect(postureConfirmBtn).not.toBeUndefined();
    expect(postureConfirmBtn?.disabled).toBe(true);

    const checkboxes = container?.querySelectorAll(
      "input[type='checkbox']",
    ) as NodeListOf<HTMLInputElement>;
    expect(checkboxes.length).toBe(4);

    for (const checkbox of Array.from(checkboxes)) {
      await act(async () => {
        checkbox.click();
      });
      await flush();
    }
    expect(postureConfirmBtn?.disabled).toBe(false);

    await act(async () => {
      postureConfirmBtn?.click();
    });
    await flush();

    // 5. Guided Finger Placement Step
    expect(container?.textContent).toContain("Home-Row Finger Placement");
    const fingerConfirmBtn = Array.from(
      container?.querySelectorAll("button") || [],
    ).find((b) => b.textContent?.includes("Acknowledge & Start Exercises"));
    expect(fingerConfirmBtn).not.toBeUndefined();

    await act(async () => {
      fingerConfirmBtn?.click();
    });
    await flush();

    // 6. Guided Sequence Step
    expect(container?.textContent).toContain("Guided Typing Sequence");
    expect(container?.textContent).toContain("Step 1: Home Row");

    const typeString = (str: string) => {
      const seqInput = container?.querySelector("input") as HTMLInputElement;
      for (const char of str) {
        act(() => {
          seqInput.dispatchEvent(
            new KeyboardEvent("keydown", {
              key: char,
              code: char === " " ? "Space" : `Key${char.toUpperCase()}`,
              bubbles: true,
            }),
          );
        });
      }
    };

    // Step 1: "asdf jkl;"
    typeString("asdf jkl;");
    await flush();

    expect(container?.textContent).toContain("Step 2: Top Row");
    // Step 2: "qwer uiop"
    typeString("qwer uiop");
    await flush();

    expect(container?.textContent).toContain("Step 3: Bottom Row");
    // Step 3: "zxcv bnmg"
    typeString("zxcv bnmg");
    await flush();

    // 7. Practice Shell Unlocked
    expect(container?.textContent).toContain("Starter practice");
    expect(container?.textContent).toContain("Type what you see.");

    const snapshot = await onboardingRepo.load();
    expect(snapshot.completion?.guidedCompletedAt).toBeTypeOf("number");
  });

  it("handles retry flow during calibration", async () => {
    await preferenceRepo.saveLocale("guest", UI_LOCALE.ENGLISH);
    await preferenceRepo.confirmLayout(
      "guest",
      LAYOUT_PROFILE_ID.MACOS_US_INTERNATIONAL,
    );

    await renderApp();
    expect(container?.textContent).toContain("Keyboard Layout Calibration");

    const input = container?.querySelector("input") as HTMLInputElement;
    // Dispatch wrong key
    await act(async () => {
      input.dispatchEvent(
        new KeyboardEvent("keydown", { code: "KeyZ", bubbles: true }),
      );
      input.value = "z";
      input.dispatchEvent(
        new InputEvent("input", {
          inputType: "insertText",
          data: "z",
          bubbles: true,
        }),
      );
    });
    await flush();

    expect(container?.textContent).toContain("Failed");
    const retryBtn = Array.from(
      container?.querySelectorAll("button") || [],
    ).find((b) => b.textContent?.includes("Retry"));
    expect(retryBtn).not.toBeUndefined();

    await act(async () => {
      retryBtn?.click();
    });
    await flush();

    // Should return to step 1 of calibration
    expect(container?.textContent).toContain("Keyboard Layout Calibration");
    expect(container?.textContent).not.toContain("Failed");
  });

  it("allows switching UI language during guided exercise without losing status", async () => {
    await preferenceRepo.saveLocale("guest", UI_LOCALE.ENGLISH);
    await preferenceRepo.confirmLayout(
      "guest",
      LAYOUT_PROFILE_ID.MACOS_US_INTERNATIONAL,
    );
    await calibrationRepo.replaceCompletion({
      id: "guest:cal1",
      profileId: "guest",
      layoutProfileId: LAYOUT_PROFILE_ID.MACOS_US_INTERNATIONAL,
      calibrationId: "macos-us-international-calibration",
      definitionVersion: 1,
      completedAt: Date.now(),
      passedStepIds: [
        "accent-acute-a",
        "letter-enye",
        "letter-udiaeresis",
        "punctuation-open-question",
        "punctuation-question",
        "punctuation-open-exclamation",
        "punctuation-exclamation",
      ],
    });

    await renderApp();
    expect(container?.textContent).toContain("Ergonomic Posture Orientation");

    // Switch language via header switcher
    const esHeaderBtn = Array.from(
      container?.querySelectorAll("button") || [],
    ).find((b) => b.textContent?.trim() === "ES");
    expect(esHeaderBtn).not.toBeUndefined();

    await act(async () => {
      esHeaderBtn?.click();
    });
    await flush();

    // Should update to Spanish strings and remain on posture step
    expect(container?.textContent).toContain(
      "Orientación de postura ergonómica",
    );
  });

  it("invalidates calibration when profile is changed", async () => {
    await preferenceRepo.saveLocale("guest", UI_LOCALE.ENGLISH);
    await preferenceRepo.confirmLayout(
      "guest",
      LAYOUT_PROFILE_ID.MACOS_US_INTERNATIONAL,
    );
    await calibrationRepo.replaceCompletion({
      id: "guest:cal1",
      profileId: "guest",
      layoutProfileId: LAYOUT_PROFILE_ID.MACOS_US_INTERNATIONAL,
      calibrationId: "macos-us-international-calibration",
      definitionVersion: 1,
      completedAt: Date.now(),
      passedStepIds: [
        "accent-acute-a",
        "letter-enye",
        "letter-udiaeresis",
        "punctuation-open-question",
        "punctuation-question",
        "punctuation-open-exclamation",
        "punctuation-exclamation",
      ],
    });

    await renderApp();
    expect(container?.textContent).toContain("Ergonomic Posture Orientation");

    // Click "Change profile" button in header
    const changeProfileBtn = Array.from(
      container?.querySelectorAll("button") || [],
    ).find((b) => b.textContent?.includes("Change profile"));
    expect(changeProfileBtn).not.toBeUndefined();

    await act(async () => {
      changeProfileBtn?.click();
    });
    await flush();

    // Renders ProfileStep
    expect(container?.textContent).toContain("Select Keyboard Layout Profile");

    // Select Windows US International and confirm
    const windowsRadio = Array.from(
      container?.querySelectorAll("input[type=radio]") || [],
    ).find(
      (input) =>
        (input as HTMLInputElement).value ===
        LAYOUT_PROFILE_ID.WINDOWS_US_INTERNATIONAL,
    ) as HTMLInputElement | undefined;
    expect(windowsRadio).not.toBeUndefined();

    await act(async () => {
      windowsRadio?.click();
    });
    await flush();

    const confirmBtn = Array.from(
      container?.querySelectorAll("button") || [],
    ).find((b) => b.textContent?.includes("Confirm"));

    await act(async () => {
      confirmBtn?.click();
    });
    await flush();

    // State becomes needs-calibration for new profile
    expect(container?.textContent).toContain("Keyboard Layout Calibration");
    const snapshot = await onboardingRepo.load();
    expect(snapshot.completion).toBeUndefined();
  });

  it("restores directly to GuidedPostureStep when calibration exists but guided exercise is incomplete offline", async () => {
    await preferenceRepo.saveLocale("guest", UI_LOCALE.SPANISH);
    await preferenceRepo.confirmLayout(
      "guest",
      LAYOUT_PROFILE_ID.WINDOWS_LATIN_AMERICAN_QWERTY,
    );
    await calibrationRepo.replaceCompletion({
      id: "guest:cal1",
      profileId: "guest",
      layoutProfileId: LAYOUT_PROFILE_ID.WINDOWS_LATIN_AMERICAN_QWERTY,
      calibrationId: "windows-latin-american-qwerty-calibration",
      definitionVersion: 1,
      completedAt: Date.now(),
      passedStepIds: [
        "accent-acute-a",
        "letter-enye",
        "letter-udiaeresis",
        "punctuation-open-question",
        "punctuation-question",
        "punctuation-open-exclamation",
        "punctuation-exclamation",
      ],
    });

    await renderApp();

    expect(container?.textContent).toContain(
      "Orientación de postura ergonómica",
    );
    expect(container?.textContent).not.toContain("Starter practice");
  });

  it("restores directly to Practice Shell when guided exercise is already completed offline", async () => {
    await preferenceRepo.saveLocale("guest", UI_LOCALE.ENGLISH);
    await preferenceRepo.confirmLayout(
      "guest",
      LAYOUT_PROFILE_ID.WINDOWS_US_INTERNATIONAL,
    );
    await calibrationRepo.replaceCompletion({
      id: "guest:cal1",
      profileId: "guest",
      layoutProfileId: LAYOUT_PROFILE_ID.WINDOWS_US_INTERNATIONAL,
      calibrationId: "windows-us-international-calibration",
      definitionVersion: 1,
      completedAt: Date.now(),
      guidedCompletedAt: Date.now(),
      passedStepIds: [
        "accent-acute-a",
        "letter-enye",
        "letter-udiaeresis",
        "punctuation-open-question",
        "punctuation-question",
        "punctuation-open-exclamation",
        "punctuation-exclamation",
      ],
    });

    await renderApp();

    expect(container?.textContent).toContain("Starter practice");
    expect(container?.textContent).toContain("Type what you see.");
  });

  it("switches between Starter Practice and Free Typing mode when onboarding is complete", async () => {
    await preferenceRepo.saveLocale("guest", UI_LOCALE.ENGLISH);
    await preferenceRepo.confirmLayout(
      "guest",
      LAYOUT_PROFILE_ID.WINDOWS_US_INTERNATIONAL,
    );
    await calibrationRepo.replaceCompletion({
      id: "guest:cal1",
      profileId: "guest",
      layoutProfileId: LAYOUT_PROFILE_ID.WINDOWS_US_INTERNATIONAL,
      calibrationId: "windows-us-international-calibration",
      definitionVersion: 1,
      completedAt: Date.now(),
      guidedCompletedAt: Date.now(),
      passedStepIds: [
        "accent-acute-a",
        "letter-enye",
        "letter-udiaeresis",
        "punctuation-open-question",
        "punctuation-question",
        "punctuation-open-exclamation",
        "punctuation-exclamation",
      ],
    });

    await renderApp();

    // Mode switcher should exist with Starter Practice active
    expect(container?.textContent).toContain("Starter practice");
    expect(container?.textContent).toContain("Type what you see.");

    const freeTypingModeBtn = Array.from(
      container?.querySelectorAll("button") || [],
    ).find((b) => b.textContent?.trim() === "Free Typing");
    expect(freeTypingModeBtn).not.toBeUndefined();

    // Switch to Free Typing
    await act(async () => {
      freeTypingModeBtn?.click();
    });
    await flush();

    expect(container?.textContent).toContain("Free Typing Practice");
    expect(container?.textContent).toContain("Net WPM");
    expect(container?.textContent).toContain("Accuracy");

    // Switch back to Starter Practice
    const starterModeBtn = Array.from(
      container?.querySelectorAll("button") || [],
    ).find((b) => b.textContent?.trim() === "Starter Practice");
    expect(starterModeBtn).not.toBeUndefined();

    await act(async () => {
      starterModeBtn?.click();
    });
    await flush();

    expect(container?.textContent).toContain("Starter practice");
    expect(container?.textContent).toContain("Type what you see.");
  });

  it("supports category and timer selection in Free Typing mode", async () => {
    await preferenceRepo.saveLocale("guest", UI_LOCALE.ENGLISH);
    await preferenceRepo.confirmLayout(
      "guest",
      LAYOUT_PROFILE_ID.WINDOWS_US_INTERNATIONAL,
    );
    await calibrationRepo.replaceCompletion({
      id: "guest:cal1",
      profileId: "guest",
      layoutProfileId: LAYOUT_PROFILE_ID.WINDOWS_US_INTERNATIONAL,
      calibrationId: "windows-us-international-calibration",
      definitionVersion: 1,
      completedAt: Date.now(),
      guidedCompletedAt: Date.now(),
      passedStepIds: [
        "accent-acute-a",
        "letter-enye",
        "letter-udiaeresis",
        "punctuation-open-question",
        "punctuation-question",
        "punctuation-open-exclamation",
        "punctuation-exclamation",
      ],
    });

    await renderApp();

    // Switch to Free Typing
    const freeTypingBtn = Array.from(
      container?.querySelectorAll("button") || [],
    ).find((b) => b.textContent?.trim() === "Free Typing");
    await act(async () => {
      freeTypingBtn?.click();
    });
    await flush();

    // Select 60s timer preset
    const preset60Btn = Array.from(
      container?.querySelectorAll("button") || [],
    ).find((b) => b.textContent?.trim() === "60s");
    expect(preset60Btn).not.toBeUndefined();

    await act(async () => {
      preset60Btn?.click();
    });
    await flush();

    expect(container?.textContent).toContain("60s");

    // Click "Change Passage" to open catalog selector
    const changePassageBtn = Array.from(
      container?.querySelectorAll("button") || [],
    ).find((b) => b.textContent?.includes("Change Passage"));
    expect(changePassageBtn).not.toBeUndefined();

    await act(async () => {
      changePassageBtn?.click();
    });
    await flush();

    // Switch to "Technology" tab
    const techTab = Array.from(
      container?.querySelectorAll('[role="tab"]') || [],
    ).find((t) => t.textContent?.includes("Technology"));
    expect(techTab).not.toBeUndefined();

    await act(async () => {
      techTab?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });
    await flush();

    // Select the technology passage
    const techPassageBtn = Array.from(
      container?.querySelectorAll("#panel-technology button") || [],
    ).find((b) => b.textContent?.includes("Keyboard Architecture"));
    expect(techPassageBtn).not.toBeUndefined();

    await act(async () => {
      techPassageBtn?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });
    await flush();

    expect(container?.textContent).toContain(
      "Keyboard Architecture & Ergonomics",
    );
  });

  it("handles typing input, updates real-time metrics, completes session, displays modal, and persists session to IndexedDB", async () => {
    await preferenceRepo.saveLocale("guest", UI_LOCALE.ENGLISH);
    await preferenceRepo.confirmLayout(
      "guest",
      LAYOUT_PROFILE_ID.WINDOWS_US_INTERNATIONAL,
    );
    await calibrationRepo.replaceCompletion({
      id: "guest:cal1",
      profileId: "guest",
      layoutProfileId: LAYOUT_PROFILE_ID.WINDOWS_US_INTERNATIONAL,
      calibrationId: "windows-us-international-calibration",
      definitionVersion: 1,
      completedAt: Date.now(),
      guidedCompletedAt: Date.now(),
      passedStepIds: [
        "accent-acute-a",
        "letter-enye",
        "letter-udiaeresis",
        "punctuation-open-question",
        "punctuation-question",
        "punctuation-open-exclamation",
        "punctuation-exclamation",
      ],
    });

    await renderApp();

    // Switch to Free Typing
    const freeTypingBtn = Array.from(
      container?.querySelectorAll("button") || [],
    ).find((b) => b.textContent?.trim() === "Free Typing");
    await act(async () => {
      freeTypingBtn?.click();
    });
    await flush();

    const textarea = container?.querySelector(
      "textarea[aria-label='Free typing practice input']",
    ) as HTMLTextAreaElement;
    expect(textarea).not.toBeNull();

    // Get the initial default passage text (The Mountain's Whisper)
    const passage = getCatalogPassage("stories", "en");
    expect(passage.text.length).toBeGreaterThan(0);

    // Type the complete passage
    for (const char of passage.text) {
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
    await flush();

    // Summary modal should be visible
    expect(container?.textContent).toContain("Session Summary");
    expect(container?.textContent).toContain("Practice Again");

    // Verify session persisted to Dexie
    const recentSessions = await typingSessionRepo.getRecentSessions("guest");
    expect(recentSessions.length).toBe(1);
    expect(recentSessions[0].profileId).toBe("guest");
    expect(recentSessions[0].category).toBe("stories");
    expect(recentSessions[0].locale).toBe("en");
    expect(recentSessions[0].characterCount).toBe(passage.text.length);
    expect(recentSessions[0].accuracy).toBe(100);
    expect(recentSessions[0].netWpm).toBeGreaterThanOrEqual(0);
  });

  it("switches UI language in Free Typing mode and updates text passage to selected locale", async () => {
    await preferenceRepo.saveLocale("guest", UI_LOCALE.ENGLISH);
    await preferenceRepo.confirmLayout(
      "guest",
      LAYOUT_PROFILE_ID.WINDOWS_US_INTERNATIONAL,
    );
    await calibrationRepo.replaceCompletion({
      id: "guest:cal1",
      profileId: "guest",
      layoutProfileId: LAYOUT_PROFILE_ID.WINDOWS_US_INTERNATIONAL,
      calibrationId: "windows-us-international-calibration",
      definitionVersion: 1,
      completedAt: Date.now(),
      guidedCompletedAt: Date.now(),
      passedStepIds: [
        "accent-acute-a",
        "letter-enye",
        "letter-udiaeresis",
        "punctuation-open-question",
        "punctuation-question",
        "punctuation-open-exclamation",
        "punctuation-exclamation",
      ],
    });

    await renderApp();

    // Switch to Free Typing
    const freeTypingBtn = Array.from(
      container?.querySelectorAll("button") || [],
    ).find((b) => b.textContent?.trim() === "Free Typing");
    await act(async () => {
      freeTypingBtn?.click();
    });
    await flush();

    expect(container?.textContent).toContain("The Mountain's Whisper");

    // Switch to Spanish via header
    const esHeaderBtn = Array.from(
      container?.querySelectorAll("button") || [],
    ).find((b) => b.textContent?.trim() === "ES");
    expect(esHeaderBtn).not.toBeUndefined();

    await act(async () => {
      esHeaderBtn?.click();
    });
    await flush();

    // Should now show Spanish passage and labels
    expect(container?.textContent).toContain("El susurro de la montana");
    expect(container?.textContent).toContain("Mecanografía libre");
  });

  it("loads and applies stored theme, font, and sound preferences from preferenceRepository on startup", async () => {
    await preferenceRepo.saveLocale("guest", UI_LOCALE.ENGLISH);
    await preferenceRepo.confirmLayout(
      "guest",
      LAYOUT_PROFILE_ID.WINDOWS_US_INTERNATIONAL,
    );
    await preferenceRepo.savePreferences("guest", {
      theme: THEME_ID.MIDNIGHT,
      typography: TYPOGRAPHY_ID.SERIF,
      soundProfile: SOUND_PROFILE_ID.CLICKY,
    });
    await calibrationRepo.replaceCompletion({
      id: "guest:cal1",
      profileId: "guest",
      layoutProfileId: LAYOUT_PROFILE_ID.WINDOWS_US_INTERNATIONAL,
      calibrationId: "windows-us-international-calibration",
      definitionVersion: 1,
      completedAt: Date.now(),
      guidedCompletedAt: Date.now(),
      passedStepIds: [
        "accent-acute-a",
        "letter-enye",
        "letter-udiaeresis",
        "punctuation-open-question",
        "punctuation-question",
        "punctuation-open-exclamation",
        "punctuation-exclamation",
      ],
    });

    await renderApp();

    expect(document.documentElement.getAttribute("data-theme")).toBe(
      "midnight",
    );
    expect(document.documentElement.getAttribute("data-font")).toBe("serif");
  });

  it("allows changing theme and sound profile from header quick settings and persists to IndexedDB", async () => {
    await preferenceRepo.saveLocale("guest", UI_LOCALE.ENGLISH);
    await preferenceRepo.confirmLayout(
      "guest",
      LAYOUT_PROFILE_ID.WINDOWS_US_INTERNATIONAL,
    );
    await calibrationRepo.replaceCompletion({
      id: "guest:cal1",
      profileId: "guest",
      layoutProfileId: LAYOUT_PROFILE_ID.WINDOWS_US_INTERNATIONAL,
      calibrationId: "windows-us-international-calibration",
      definitionVersion: 1,
      completedAt: Date.now(),
      guidedCompletedAt: Date.now(),
      passedStepIds: [
        "accent-acute-a",
        "letter-enye",
        "letter-udiaeresis",
        "punctuation-open-question",
        "punctuation-question",
        "punctuation-open-exclamation",
        "punctuation-exclamation",
      ],
    });

    await renderApp();

    // Toggle Settings dropdown open
    const settingsToggleBtn = container?.querySelector(
      "[data-testid='toggle-settings-button']",
    ) as HTMLButtonElement;
    expect(settingsToggleBtn).not.toBeNull();

    await act(async () => {
      settingsToggleBtn.click();
    });
    await flush();

    expect(
      container?.querySelector("[data-testid='settings-panel']"),
    ).not.toBeNull();

    // Select "Nordic" theme
    const nordicBtn = Array.from(
      container?.querySelectorAll<HTMLButtonElement>("button[role='radio']") ||
        [],
    ).find((b) => b.textContent?.trim() === "Nordic");
    expect(nordicBtn).not.toBeUndefined();

    await act(async () => {
      nordicBtn?.click();
    });
    await flush();

    expect(document.documentElement.getAttribute("data-theme")).toBe("nordic");
    const loadedPref = await preferenceRepo.load("guest");
    expect(loadedPref?.theme).toBe("nordic");

    // Select "Clicky" sound profile
    const clickyBtn = Array.from(
      container?.querySelectorAll<HTMLButtonElement>("button[role='radio']") ||
        [],
    ).find((b) => b.textContent?.trim() === "Clicky");
    expect(clickyBtn).not.toBeUndefined();

    await act(async () => {
      clickyBtn?.click();
    });
    await flush();

    const loadedSoundPref = await preferenceRepo.load("guest");
    expect(loadedSoundPref?.soundProfile).toBe("clicky");
  });

  it("switches to Dashboard view and displays empty state, then allows switching back to Free Typing via CTA", async () => {
    await preferenceRepo.saveLocale("guest", UI_LOCALE.ENGLISH);
    await preferenceRepo.confirmLayout(
      "guest",
      LAYOUT_PROFILE_ID.WINDOWS_US_INTERNATIONAL,
    );
    await calibrationRepo.replaceCompletion({
      id: "guest:cal1",
      profileId: "guest",
      layoutProfileId: LAYOUT_PROFILE_ID.WINDOWS_US_INTERNATIONAL,
      calibrationId: "windows-us-international-calibration",
      definitionVersion: 1,
      completedAt: Date.now(),
      guidedCompletedAt: Date.now(),
      passedStepIds: [
        "accent-acute-a",
        "letter-enye",
        "letter-udiaeresis",
        "punctuation-open-question",
        "punctuation-question",
        "punctuation-open-exclamation",
        "punctuation-exclamation",
      ],
    });

    await renderApp();

    // Click "Dashboard" tab in header navigation
    const dashboardTab = Array.from(
      container?.querySelectorAll("button") || [],
    ).find((b) => b.textContent?.trim() === "Dashboard");
    expect(dashboardTab).not.toBeUndefined();

    await act(async () => {
      dashboardTab?.click();
    });
    await flush();

    expect(container?.textContent).toContain("Performance & Statistics");
    expect(container?.textContent).toContain("No typing sessions yet");

    // Click CTA button to jump into Free Typing
    const startPracticeCta = container?.querySelector(
      "[data-testid='empty-state-cta-button']",
    ) as HTMLButtonElement;
    expect(startPracticeCta).not.toBeNull();

    await act(async () => {
      startPracticeCta.click();
    });
    await flush();

    expect(container?.textContent).toContain("Free Typing Practice");
  });

  it("reflects completed practice sessions immediately in the Dashboard statistics and history table", async () => {
    await preferenceRepo.saveLocale("guest", UI_LOCALE.ENGLISH);
    await preferenceRepo.confirmLayout(
      "guest",
      LAYOUT_PROFILE_ID.WINDOWS_US_INTERNATIONAL,
    );
    await calibrationRepo.replaceCompletion({
      id: "guest:cal1",
      profileId: "guest",
      layoutProfileId: LAYOUT_PROFILE_ID.WINDOWS_US_INTERNATIONAL,
      calibrationId: "windows-us-international-calibration",
      definitionVersion: 1,
      completedAt: Date.now(),
      guidedCompletedAt: Date.now(),
      passedStepIds: [
        "accent-acute-a",
        "letter-enye",
        "letter-udiaeresis",
        "punctuation-open-question",
        "punctuation-question",
        "punctuation-open-exclamation",
        "punctuation-exclamation",
      ],
    });

    await renderApp();

    // Switch to Free Typing mode
    const freeTypingBtn = Array.from(
      container?.querySelectorAll("button") || [],
    ).find((b) => b.textContent?.trim() === "Free Typing");
    await act(async () => {
      freeTypingBtn?.click();
    });
    await flush();

    const textarea = container?.querySelector(
      "textarea[aria-label='Free typing practice input']",
    ) as HTMLTextAreaElement;
    expect(textarea).not.toBeNull();

    const passage = getCatalogPassage("stories", "en");

    // Complete passage typing
    for (const char of passage.text) {
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
    await flush();

    // Close session summary modal
    const closeBtn = Array.from(
      container?.querySelectorAll("button") || [],
    ).find((b) => b.textContent?.includes("Close Summary"));
    await act(async () => {
      closeBtn?.click();
    });
    await flush();

    // Switch to Dashboard
    const dashboardTab = Array.from(
      container?.querySelectorAll("button") || [],
    ).find((b) => b.textContent?.trim() === "Dashboard");
    await act(async () => {
      dashboardTab?.click();
    });
    await flush();

    expect(container?.textContent).toContain("Performance & Statistics");
    expect(container?.textContent).toContain("Personal Bests & Totals");
    expect(
      container?.querySelector("[data-testid='stat-best-accuracy']")
        ?.textContent,
    ).toContain("100%");
    expect(container?.textContent).toContain("Flawless");
  });

  it("triggers audio synthesizer on keystroke input and backspace in starter practice", async () => {
    const playSpy = vi.spyOn(audioSynthesizer, "playKeyPressSound");

    await preferenceRepo.saveLocale("guest", UI_LOCALE.ENGLISH);
    await preferenceRepo.confirmLayout(
      "guest",
      LAYOUT_PROFILE_ID.WINDOWS_US_INTERNATIONAL,
    );
    await calibrationRepo.replaceCompletion({
      id: "guest:cal1",
      profileId: "guest",
      layoutProfileId: LAYOUT_PROFILE_ID.WINDOWS_US_INTERNATIONAL,
      calibrationId: "windows-us-international-calibration",
      definitionVersion: 1,
      completedAt: Date.now(),
      guidedCompletedAt: Date.now(),
      passedStepIds: [
        "accent-acute-a",
        "letter-enye",
        "letter-udiaeresis",
        "punctuation-open-question",
        "punctuation-question",
        "punctuation-open-exclamation",
        "punctuation-exclamation",
      ],
    });

    await renderApp();

    const textarea = container?.querySelector(
      "textarea[aria-label='Typing practice input']",
    ) as HTMLTextAreaElement;
    expect(textarea).not.toBeNull();

    // Type 'h'
    act(() => {
      textarea.value = "h";
      textarea.dispatchEvent(
        new InputEvent("input", {
          inputType: "insertText",
          data: "h",
          bubbles: true,
        }),
      );
    });
    expect(playSpy).toHaveBeenCalledWith(SOUND_PROFILE_ID.LINEAR, "h");

    // Press Backspace
    act(() => {
      textarea.dispatchEvent(
        new KeyboardEvent("keydown", {
          key: "Backspace",
          bubbles: true,
        }),
      );
    });
    expect(playSpy).toHaveBeenCalledWith(SOUND_PROFILE_ID.LINEAR, "Backspace");
  });

  it("supports Tab + Enter quick restart and Zen Mode toggle in Free Typing within the full App", async () => {
    await preferenceRepo.saveLocale("guest", UI_LOCALE.ENGLISH);
    await preferenceRepo.confirmLayout(
      "guest",
      LAYOUT_PROFILE_ID.WINDOWS_US_INTERNATIONAL,
    );
    await calibrationRepo.replaceCompletion({
      id: "guest:cal1",
      profileId: "guest",
      layoutProfileId: LAYOUT_PROFILE_ID.WINDOWS_US_INTERNATIONAL,
      calibrationId: "windows-us-international-calibration",
      definitionVersion: 1,
      completedAt: Date.now(),
      guidedCompletedAt: Date.now(),
      passedStepIds: [
        "accent-acute-a",
        "letter-enye",
        "letter-udiaeresis",
        "punctuation-open-question",
        "punctuation-question",
        "punctuation-open-exclamation",
        "punctuation-exclamation",
      ],
    });

    await renderApp();

    // Switch to Free Typing mode
    const freeTypingBtn = Array.from(
      container?.querySelectorAll("button") || [],
    ).find((b) => b.textContent?.trim() === "Free Typing");
    await act(async () => {
      freeTypingBtn?.click();
    });
    await flush();

    const textarea = container?.querySelector(
      "textarea[aria-label='Free typing practice input']",
    ) as HTMLTextAreaElement;
    expect(textarea).not.toBeNull();

    // Type a character ('E')
    act(() => {
      textarea.value = "E";
      textarea.dispatchEvent(
        new InputEvent("input", {
          inputType: "insertText",
          data: "E",
          bubbles: true,
        }),
      );
    });

    const streakBadge = container?.querySelector(
      '[data-testid="streak-badge"]',
    );
    expect(streakBadge?.getAttribute("data-streak")).toBe("1");

    // Quick restart with Tab then Enter
    act(() => {
      textarea.dispatchEvent(
        new KeyboardEvent("keydown", { key: "Tab", bubbles: true }),
      );
      textarea.dispatchEvent(
        new KeyboardEvent("keydown", { key: "Enter", bubbles: true }),
      );
    });

    expect(streakBadge?.getAttribute("data-streak")).toBe("0");

    // Toggle Zen Mode in practice toolbar
    const zenBtn = container?.querySelector(
      "[data-testid='toggle-zen-mode-button']",
    ) as HTMLButtonElement;
    expect(zenBtn).not.toBeNull();
    expect(zenBtn.textContent).toContain("Zen Mode");

    await act(async () => {
      zenBtn.click();
    });
    await flush();

    expect(zenBtn.textContent).toContain("Exit Zen Mode");
    expect(
      container?.querySelector("[data-testid='free-typing-aside']"),
    ).toBeNull();
  });

  it("handles seamless switching across themes, sounds, and views without losing application state", async () => {
    await preferenceRepo.saveLocale("guest", UI_LOCALE.ENGLISH);
    await preferenceRepo.confirmLayout(
      "guest",
      LAYOUT_PROFILE_ID.WINDOWS_US_INTERNATIONAL,
    );
    await calibrationRepo.replaceCompletion({
      id: "guest:cal1",
      profileId: "guest",
      layoutProfileId: LAYOUT_PROFILE_ID.WINDOWS_US_INTERNATIONAL,
      calibrationId: "windows-us-international-calibration",
      definitionVersion: 1,
      completedAt: Date.now(),
      guidedCompletedAt: Date.now(),
      passedStepIds: [
        "accent-acute-a",
        "letter-enye",
        "letter-udiaeresis",
        "punctuation-open-question",
        "punctuation-question",
        "punctuation-open-exclamation",
        "punctuation-exclamation",
      ],
    });

    await renderApp();

    // 1. Switch Theme to Forest
    const settingsToggleBtn = container?.querySelector(
      "[data-testid='toggle-settings-button']",
    ) as HTMLButtonElement;
    await act(async () => {
      settingsToggleBtn.click();
    });
    await flush();

    const forestBtn = Array.from(
      container?.querySelectorAll<HTMLButtonElement>("button[role='radio']") ||
        [],
    ).find((b) => b.textContent?.trim() === "Forest");
    await act(async () => {
      forestBtn?.click();
    });
    await flush();
    expect(document.documentElement.getAttribute("data-theme")).toBe("forest");

    // 2. Switch Sound Profile to Soft Bubble
    const softBubbleBtn = Array.from(
      container?.querySelectorAll<HTMLButtonElement>("button[role='radio']") ||
        [],
    ).find((b) => b.textContent?.trim() === "Soft Bubble");
    await act(async () => {
      softBubbleBtn?.click();
    });
    await flush();

    // Close settings dropdown
    await act(async () => {
      settingsToggleBtn.click();
    });
    await flush();

    // 3. Switch between Starter -> Free Typing -> Dashboard -> Free Typing
    const freeTypingBtn = Array.from(
      container?.querySelectorAll("button") || [],
    ).find((b) => b.textContent?.trim() === "Free Typing");
    await act(async () => {
      freeTypingBtn?.click();
    });
    await flush();
    expect(container?.textContent).toContain("Free Typing Practice");

    const dashboardBtn = Array.from(
      container?.querySelectorAll("button") || [],
    ).find((b) => b.textContent?.trim() === "Dashboard");
    await act(async () => {
      dashboardBtn?.click();
    });
    await flush();
    expect(container?.textContent).toContain("Performance & Statistics");

    await act(async () => {
      freeTypingBtn?.click();
    });
    await flush();
    expect(container?.textContent).toContain("Free Typing Practice");

    // Persisted preferences are preserved
    const pref = await preferenceRepo.load("guest");
    expect(pref?.theme).toBe("forest");
    expect(pref?.soundProfile).toBe("soft-bubble");
  });
});
