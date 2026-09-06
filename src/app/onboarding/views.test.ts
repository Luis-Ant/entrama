// @vitest-environment happy-dom
import React, { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { LayoutDefinitionV1 } from "../../keyboard-layouts/types";
import { getTranslation, setDocumentLanguage } from "../i18n";
import { CalibrationStep } from "./CalibrationStep";
import { GuidedExerciseRequired } from "./GuidedExerciseRequired";
import { LanguageStep } from "./LanguageStep";
import { ProfileStep } from "./ProfileStep";

(
  globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;

const testDefinition: LayoutDefinitionV1 = {
  schemaVersion: 1,
  definitionId: "test-def-v1",
  layoutProfileId: "windows-us-international",
  version: 1,
  steps: [
    {
      id: "step-1",
      mandatory: true,
      code: "KeyA",
      altKey: false,
      ctrlKey: false,
      metaKey: false,
      shiftKey: false,
      expected: "a",
      allowComposition: false,
    },
    {
      id: "step-2",
      mandatory: true,
      code: "KeyB",
      altKey: false,
      ctrlKey: false,
      metaKey: false,
      shiftKey: false,
      expected: "b",
      allowComposition: false,
    },
  ],
};

describe("i18n", () => {
  it("provides complete translations for en and es", () => {
    const en = getTranslation("en");
    const es = getTranslation("es");
    expect(en.language.title).toBeDefined();
    expect(es.language.title).toBeDefined();
    expect(en.profile.suggestionWarning).toBeDefined();
    expect(es.profile.suggestionWarning).toBeDefined();
  });

  it("updates document element lang attribute", () => {
    setDocumentLanguage("es");
    expect(document.documentElement.lang).toBe("es");
    setDocumentLanguage("en");
    expect(document.documentElement.lang).toBe("en");
  });
});

describe("LanguageStep view", () => {
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

  it("renders language options and invokes onSelectLocale", () => {
    const onSelectLocale = vi.fn();
    act(() => {
      root?.render(
        React.createElement(LanguageStep, {
          currentLocale: "en",
          onSelectLocale,
        }),
      );
    });

    const buttons = container?.querySelectorAll("button");
    expect(buttons?.length).toBeGreaterThanOrEqual(2);

    const esButton = Array.from(buttons || []).find((b) =>
      b.textContent?.includes("Español"),
    );
    expect(esButton).not.toBeUndefined();

    act(() => {
      esButton?.click();
    });

    expect(onSelectLocale).toHaveBeenCalledWith("es");
  });
});

describe("ProfileStep view", () => {
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

  it("displays suggestion warning and requires explicit confirmation click", () => {
    const onConfirmProfile = vi.fn();
    act(() => {
      root?.render(
        React.createElement(ProfileStep, {
          locale: "en",
          suggestedProfileId: "windows-us-international",
          onConfirmProfile,
        }),
      );
    });

    const warning = container?.textContent;
    expect(warning).toContain("potentially inaccurate");
    expect(onConfirmProfile).not.toHaveBeenCalled();

    const confirmButton = Array.from(
      container?.querySelectorAll("button") || [],
    ).find((b) => b.textContent?.includes("Confirm"));
    expect(confirmButton).not.toBeUndefined();

    act(() => {
      confirmButton?.click();
    });

    expect(onConfirmProfile).toHaveBeenCalledWith("windows-us-international");
  });
});

describe("CalibrationStep view", () => {
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

  it("advances steps, handles Escape pause/resume, and reports completion", () => {
    const onComplete = vi.fn();
    const onRetry = vi.fn();

    act(() => {
      root?.render(
        React.createElement(CalibrationStep, {
          definition: testDefinition,
          passedStepIds: [],
          locale: "en",
          onComplete,
          onRetry,
        }),
      );
    });

    // Embedded visual keyboard is rendered
    expect(
      container?.querySelector("[data-testid='visual-keyboard']"),
    ).not.toBeNull();

    const input = container?.querySelector(
      "input, textarea",
    ) as HTMLInputElement;
    expect(input).not.toBeNull();

    // Step 1: key A -> expected 'a'
    act(() => {
      input.dispatchEvent(
        new KeyboardEvent("keydown", { code: "KeyA", bubbles: true }),
      );
      input.value = "a";
      input.dispatchEvent(
        new InputEvent("input", {
          inputType: "insertText",
          data: "a",
          bubbles: true,
        }),
      );
    });

    expect(container?.textContent).toContain("step-1");

    // Pause on Escape
    act(() => {
      input.dispatchEvent(
        new KeyboardEvent("keydown", {
          key: "Escape",
          code: "Escape",
          bubbles: true,
        }),
      );
    });

    const resumeBtn = Array.from(
      container?.querySelectorAll("button") || [],
    ).find((b) => b.textContent?.includes("Resume"));
    expect(resumeBtn).not.toBeUndefined();

    act(() => {
      resumeBtn?.click();
    });

    // Step 2: key B -> expected 'b'
    act(() => {
      input.dispatchEvent(
        new KeyboardEvent("keydown", { code: "KeyB", bubbles: true }),
      );
      input.value = "b";
      input.dispatchEvent(
        new InputEvent("input", {
          inputType: "insertText",
          data: "b",
          bubbles: true,
        }),
      );
    });

    expect(onComplete).toHaveBeenCalledWith(["step-1", "step-2"]);
  });

  it("allows bypass directly via the bypass button", () => {
    const onComplete = vi.fn();
    const onRetry = vi.fn();

    act(() => {
      root?.render(
        React.createElement(CalibrationStep, {
          definition: testDefinition,
          passedStepIds: [],
          locale: "en",
          onComplete,
          onRetry,
        }),
      );
    });

    const bypassBtn = Array.from(
      container?.querySelectorAll("button") || [],
    ).find((b) => b.textContent?.includes("Skip Calibration (Bypass)"));
    expect(bypassBtn).not.toBeUndefined();

    act(() => {
      bypassBtn?.click();
    });

    expect(onComplete).toHaveBeenCalledWith(["step-1", "step-2"]);
  });

  it("displays failure status and focuses retry button on mismatched input", () => {
    const onComplete = vi.fn();
    const onRetry = vi.fn();

    act(() => {
      root?.render(
        React.createElement(CalibrationStep, {
          definition: testDefinition,
          passedStepIds: [],
          locale: "en",
          onComplete,
          onRetry,
        }),
      );
    });

    const input = container?.querySelector(
      "input, textarea",
    ) as HTMLInputElement;

    // Wrong key code
    act(() => {
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

    expect(container?.textContent).toContain("Failed");
    const retryBtn = Array.from(
      container?.querySelectorAll("button") || [],
    ).find((b) => b.textContent?.includes("Retry"));
    expect(retryBtn).not.toBeUndefined();

    act(() => {
      retryBtn?.click();
    });

    expect(onRetry).toHaveBeenCalled();
  });
});

describe("GuidedExerciseRequired view", () => {
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

  it("renders completion ceiling notice and locked practice status", () => {
    act(() => {
      root?.render(
        React.createElement(GuidedExerciseRequired, { locale: "en" }),
      );
    });

    expect(container?.textContent).toContain("Calibration Verified");
    expect(container?.textContent).toContain("locked");
  });
});
