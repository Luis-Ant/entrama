// @vitest-environment happy-dom
import React, { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getTranslation } from "../i18n";
import { audioSynthesizer } from "../audio/audioSynthesizer";
import { GuidedFingerPlacementStep } from "./GuidedFingerPlacementStep";
import { GuidedPostureStep } from "./GuidedPostureStep";
import { GuidedSequenceStep } from "./GuidedSequenceStep";

(
  globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;

describe("Guided i18n translations", () => {
  it("provides posture, finger placement, and sequence translations for en and es", () => {
    const en = getTranslation("en").guided;
    const es = getTranslation("es").guided;

    expect(en.posture.title).toBe("Ergonomic Posture Orientation");
    expect(es.posture.title).toBe("Orientación de postura ergonómica");

    expect(en.fingerPlacement.title).toBe("Home-Row Finger Placement");
    expect(es.fingerPlacement.title).toBe("Posición de dedos en fila guía");

    expect(en.sequence.title).toBe("Guided Typing Sequence");
    expect(es.sequence.title).toBe("Secuencia de mecanografía guiada");
  });
});

describe("GuidedPostureStep view", () => {
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

  it("renders 4 posture checkpoints, disables confirm button until all checked, and calls onConfirm", () => {
    const onConfirm = vi.fn();

    act(() => {
      root?.render(
        React.createElement(GuidedPostureStep, {
          locale: "en",
          onConfirm,
        }),
      );
    });

    expect(container?.textContent).toContain("Ergonomic Posture Orientation");
    expect(container?.textContent).toContain("Straight Back");
    expect(container?.textContent).toContain("Feet Flat");
    expect(container?.textContent).toContain("90° Elbows");
    expect(container?.textContent).toContain("Neutral Wrists");

    const confirmButton = Array.from(
      container?.querySelectorAll("button") || [],
    ).find((b) => b.textContent?.includes("Continue to Finger Placement"));
    expect(confirmButton).not.toBeUndefined();
    expect((confirmButton as HTMLButtonElement).disabled).toBe(true);

    const checkboxes = container?.querySelectorAll(
      "input[type='checkbox']",
    ) as NodeListOf<HTMLInputElement>;
    expect(checkboxes.length).toBe(4);

    // Check first 3 checkpoints
    for (let i = 0; i < 3; i++) {
      act(() => {
        checkboxes[i].click();
      });
      expect((confirmButton as HTMLButtonElement).disabled).toBe(true);
    }

    // Check 4th checkpoint
    act(() => {
      checkboxes[3].click();
    });

    expect((confirmButton as HTMLButtonElement).disabled).toBe(false);

    act(() => {
      confirmButton?.click();
    });

    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it("allows bypass / skip directly via the bypass button", () => {
    const onConfirm = vi.fn();

    act(() => {
      root?.render(
        React.createElement(GuidedPostureStep, {
          locale: "en",
          onConfirm,
        }),
      );
    });

    const skipButton = Array.from(
      container?.querySelectorAll("button") || [],
    ).find((b) => b.textContent?.includes("Skip Posture (Bypass)"));
    expect(skipButton).not.toBeUndefined();

    act(() => {
      skipButton?.click();
    });

    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it("supports Check all button to instantly check all checkpoints", () => {
    const onConfirm = vi.fn();

    act(() => {
      root?.render(
        React.createElement(GuidedPostureStep, {
          locale: "en",
          onConfirm,
        }),
      );
    });

    const checkAllButton = Array.from(
      container?.querySelectorAll("button") || [],
    ).find((b) => b.textContent?.includes("Check all"));
    expect(checkAllButton).not.toBeUndefined();

    act(() => {
      checkAllButton?.click();
    });

    const confirmButton = Array.from(
      container?.querySelectorAll("button") || [],
    ).find((b) => b.textContent?.includes("Continue to Finger Placement"));
    expect((confirmButton as HTMLButtonElement).disabled).toBe(false);

    act(() => {
      confirmButton?.click();
    });

    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it("renders correctly in Spanish locale with Spanish bypass button", () => {
    const onConfirm = vi.fn();

    act(() => {
      root?.render(
        React.createElement(GuidedPostureStep, {
          locale: "es",
          onConfirm,
        }),
      );
    });

    expect(container?.textContent).toContain(
      "Orientación de postura ergonómica",
    );
    expect(container?.textContent).toContain("Espalda recta");
    expect(container?.textContent).toContain("Pies apoyados");
    expect(container?.textContent).toContain("Codos a 90°");
    expect(container?.textContent).toContain("Muñecas neutras");

    const bypassBtn = Array.from(
      container?.querySelectorAll("button") || [],
    ).find((b) => b.textContent?.includes("Omitir (Bypass)"));
    expect(bypassBtn).not.toBeUndefined();
  });
});

describe("GuidedFingerPlacementStep view", () => {
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

  it("renders home-row key diagram with finger labels and triggers onConfirm on button click", () => {
    const onConfirm = vi.fn();

    act(() => {
      root?.render(
        React.createElement(GuidedFingerPlacementStep, {
          locale: "en",
          onConfirm,
        }),
      );
    });

    expect(container?.textContent).toContain("Home-Row Finger Placement");
    expect(container?.textContent).toContain("Left Hand (ASDF)");
    expect(container?.textContent).toContain("Right Hand (JKL;)");

    // Finger labels
    expect(container?.textContent).toContain("Pinky");
    expect(container?.textContent).toContain("Ring");
    expect(container?.textContent).toContain("Middle");
    expect(container?.textContent).toContain("Index");

    // Key values
    expect(container?.textContent).toContain("A");
    expect(container?.textContent).toContain("S");
    expect(container?.textContent).toContain("D");
    expect(container?.textContent).toContain("F");
    expect(container?.textContent).toContain("J");
    expect(container?.textContent).toContain("K");
    expect(container?.textContent).toContain("L");

    // HandFingerGuide and VisualKeyboard integration
    expect(
      container?.querySelector("[data-testid='hand-finger-guide']"),
    ).not.toBeNull();
    expect(
      container?.querySelector("[data-testid='visual-keyboard']"),
    ).not.toBeNull();

    const confirmButton = Array.from(
      container?.querySelectorAll("button") || [],
    ).find((b) => b.textContent?.includes("Acknowledge & Start Exercises"));
    expect(confirmButton).not.toBeUndefined();

    act(() => {
      confirmButton?.click();
    });

    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it("updates selected home-row key on click", () => {
    const onConfirm = vi.fn();

    act(() => {
      root?.render(
        React.createElement(GuidedFingerPlacementStep, {
          locale: "en",
          onConfirm,
        }),
      );
    });

    const keyDButton = Array.from(
      container?.querySelectorAll("button") || [],
    ).find(
      (b) => b.textContent?.includes("D") && b.textContent?.includes("Middle"),
    );
    expect(keyDButton).not.toBeUndefined();

    act(() => {
      keyDButton?.click();
    });

    const keyD = container?.querySelector("[data-key-code='KeyD']");
    expect(keyD?.getAttribute("data-active-target")).toBe("true");
  });

  it("renders correctly in Spanish locale", () => {
    const onConfirm = vi.fn();

    act(() => {
      root?.render(
        React.createElement(GuidedFingerPlacementStep, {
          locale: "es",
          onConfirm,
        }),
      );
    });

    expect(container?.textContent).toContain("Posición de dedos en fila guía");
    expect(container?.textContent).toContain("Mano izquierda (ASDF)");
    expect(container?.textContent).toContain("Mano derecha (JKL;)");
    expect(container?.textContent).toContain("Meñique");
    expect(container?.textContent).toContain("Anular");
  });
});

describe("GuidedSequenceStep view", () => {
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

  it("progresses through 3 exercise steps on matching inputs and fires onComplete", () => {
    const onComplete = vi.fn();

    act(() => {
      root?.render(
        React.createElement(GuidedSequenceStep, {
          locale: "en",
          onComplete,
        }),
      );
    });

    const input = container?.querySelector("input") as HTMLInputElement;
    expect(input).not.toBeNull();

    expect(container?.textContent).toContain("Step 1 of 3");
    expect(container?.textContent).toContain("Step 1: Home Row");

    // VisualKeyboard is embedded
    expect(
      container?.querySelector("[data-testid='visual-keyboard']"),
    ).not.toBeNull();

    // Type wrong key
    act(() => {
      input.dispatchEvent(
        new KeyboardEvent("keydown", { key: "z", code: "KeyZ", bubbles: true }),
      );
    });
    expect(container?.textContent).toContain("Incorrect key. Try again.");

    // Function to type a string of characters into input
    const typeString = (str: string) => {
      for (const char of str) {
        act(() => {
          input.dispatchEvent(
            new KeyboardEvent("keydown", {
              key: char,
              code: char === " " ? "Space" : `Key${char.toUpperCase()}`,
              bubbles: true,
            }),
          );
        });
      }
    };

    // Complete Step 1: "asdf jkl;"
    typeString("asdf jkl;");

    expect(container?.textContent).toContain("Step 2 of 3");
    expect(container?.textContent).toContain("Step 2: Top Row");

    // Complete Step 2: "qwer uiop"
    typeString("qwer uiop");

    expect(container?.textContent).toContain("Step 3 of 3");
    expect(container?.textContent).toContain("Step 3: Bottom Row");

    // Complete Step 3: "zxcv bnmg"
    typeString("zxcv bnmg");

    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it("renders correctly in Spanish locale", () => {
    const onComplete = vi.fn();

    act(() => {
      root?.render(
        React.createElement(GuidedSequenceStep, {
          locale: "es",
          onComplete,
        }),
      );
    });

    expect(container?.textContent).toContain("Paso 1 de 3");
    expect(container?.textContent).toContain("Paso 1: Fila guía");
  });

  it("triggers audio synthesizer on keystroke and backspace during guided sequence", () => {
    const playSpy = vi.spyOn(audioSynthesizer, "playKeyPressSound");
    const onComplete = vi.fn();

    act(() => {
      root?.render(
        React.createElement(GuidedSequenceStep, {
          locale: "en",
          onComplete,
        }),
      );
    });

    const input = container?.querySelector("input") as HTMLInputElement;
    expect(input).not.toBeNull();

    // Key down normal character
    act(() => {
      input.dispatchEvent(
        new KeyboardEvent("keydown", { key: "a", code: "KeyA", bubbles: true }),
      );
    });
    expect(playSpy).toHaveBeenCalledWith(undefined, "a");

    // Key down backspace
    act(() => {
      input.dispatchEvent(
        new KeyboardEvent("keydown", {
          key: "Backspace",
          code: "Backspace",
          bubbles: true,
        }),
      );
    });
    expect(playSpy).toHaveBeenCalledWith(undefined, "Backspace");
  });
});
