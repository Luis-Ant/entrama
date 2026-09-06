// @vitest-environment happy-dom
import React, { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { HandFingerGuide } from "./HandFingerGuide";
import {
  KEYBOARD_ROW_OFFSETS,
  PHYSICAL_ROW_STAGGER_OFFSETS,
  STANDARD_KEY_UNIT_WIDTHS,
  getFingerForKey,
  getKeyInfoForProfile,
  getKeyUnitWidth,
  type FingerType,
} from "./keyboardModel";
import { VisualKeyboard } from "./VisualKeyboard";

(
  globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;

describe("Finger mapping utilities", () => {
  it("maps characters and codes to correct finger zones", () => {
    // Left hand
    expect(getFingerForKey("a")).toBe("left-pinky");
    expect(getFingerForKey("q")).toBe("left-pinky");
    expect(getFingerForKey("1")).toBe("left-pinky");
    expect(getFingerForKey("KeyA")).toBe("left-pinky");

    expect(getFingerForKey("s")).toBe("left-ring");
    expect(getFingerForKey("w")).toBe("left-ring");
    expect(getFingerForKey("2")).toBe("left-ring");
    expect(getFingerForKey("KeyS")).toBe("left-ring");

    expect(getFingerForKey("d")).toBe("left-middle");
    expect(getFingerForKey("e")).toBe("left-middle");
    expect(getFingerForKey("3")).toBe("left-middle");
    expect(getFingerForKey("KeyD")).toBe("left-middle");

    expect(getFingerForKey("f")).toBe("left-index");
    expect(getFingerForKey("r")).toBe("left-index");
    expect(getFingerForKey("g")).toBe("left-index");
    expect(getFingerForKey("t")).toBe("left-index");
    expect(getFingerForKey("v")).toBe("left-index");
    expect(getFingerForKey("b")).toBe("left-index");
    expect(getFingerForKey("4")).toBe("left-index");
    expect(getFingerForKey("5")).toBe("left-index");

    // Thumbs
    expect(getFingerForKey(" ")).toBe("thumb");
    expect(getFingerForKey("Space")).toBe("thumb");

    // Right hand
    expect(getFingerForKey("j")).toBe("right-index");
    expect(getFingerForKey("u")).toBe("right-index");
    expect(getFingerForKey("h")).toBe("right-index");
    expect(getFingerForKey("y")).toBe("right-index");
    expect(getFingerForKey("n")).toBe("right-index");
    expect(getFingerForKey("m")).toBe("right-index");
    expect(getFingerForKey("6")).toBe("right-index");
    expect(getFingerForKey("7")).toBe("right-index");

    expect(getFingerForKey("k")).toBe("right-middle");
    expect(getFingerForKey("i")).toBe("right-middle");
    expect(getFingerForKey("8")).toBe("right-middle");
    expect(getFingerForKey(",")).toBe("right-middle");

    expect(getFingerForKey("l")).toBe("right-ring");
    expect(getFingerForKey("o")).toBe("right-ring");
    expect(getFingerForKey("9")).toBe("right-ring");
    expect(getFingerForKey(".")).toBe("right-ring");

    expect(getFingerForKey(";")).toBe("right-pinky");
    expect(getFingerForKey("p")).toBe("right-pinky");
    expect(getFingerForKey("0")).toBe("right-pinky");
    expect(getFingerForKey("-")).toBe("right-pinky");
    expect(getFingerForKey("=")).toBe("right-pinky");
    expect(getFingerForKey("/")).toBe("right-pinky");
    expect(getFingerForKey("ñ")).toBe("right-pinky");
  });

  it("handles uppercase characters and special accented graphemes", () => {
    expect(getFingerForKey("A")).toBe("left-pinky");
    expect(getFingerForKey("F")).toBe("left-index");
    expect(getFingerForKey("J")).toBe("right-index");
    expect(getFingerForKey("á")).toBe("left-pinky"); // 'a' key
    expect(getFingerForKey("ü")).toBe("right-index"); // 'u' key
    expect(getFingerForKey("¿")).toBe("right-pinky");
    expect(getFingerForKey("¡")).toBe("left-pinky");
  });

  it("resolves key info for layout profiles", () => {
    const usKey = getKeyInfoForProfile("Semicolon", "windows-us-international");
    expect(usKey.primary).toBe(";");

    const latamKey = getKeyInfoForProfile(
      "Semicolon",
      "windows-latin-american-qwerty",
    );
    expect(latamKey.primary).toBe("ñ");
  });

  it("defines physical keycap unit widths accurately", () => {
    expect(STANDARD_KEY_UNIT_WIDTHS.default).toBe(1);
    expect(getKeyUnitWidth("KeyA")).toBe(1);
    expect(getKeyUnitWidth("Digit1")).toBe(1);
    expect(getKeyUnitWidth("Tab")).toBe(1.5);
    expect(getKeyUnitWidth("Backslash")).toBe(1.5);
    expect(getKeyUnitWidth("CapsLock")).toBe(1.75);
    expect(getKeyUnitWidth("Enter")).toBe(2.25);
    expect(getKeyUnitWidth("ShiftLeft")).toBe(2.25);
    expect(getKeyUnitWidth("ShiftRight")).toBe(2.75);
    expect(getKeyUnitWidth("Space")).toBe(6.25);
    expect(getKeyUnitWidth("Backspace")).toBe(2);
    expect(getKeyUnitWidth("ControlLeft")).toBe(1.25);
    expect(getKeyUnitWidth("AltLeft")).toBe(1.25);
    expect(getKeyUnitWidth("MetaLeft")).toBe(1.25);
  });

  it("defines standard physical row offsets and stagger ratios", () => {
    expect(KEYBOARD_ROW_OFFSETS).toHaveLength(5);
    expect(KEYBOARD_ROW_OFFSETS.every((offset) => offset === 0)).toBe(true);
    expect(PHYSICAL_ROW_STAGGER_OFFSETS).toEqual([0, 0.5, 0.75, 0.25, 0]);
  });
});

describe("VisualKeyboard component", () => {
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

  it("renders 4 main keyboard rows plus space row", () => {
    act(() => {
      root?.render(React.createElement(VisualKeyboard, {}));
    });

    expect(
      container?.querySelector("[data-testid='visual-keyboard']"),
    ).not.toBeNull();
    const rows = container?.querySelectorAll("[data-keyboard-row]");
    expect(rows?.length).toBe(5);

    // Number row
    expect(container?.textContent).toContain("1");
    // Top row
    expect(container?.textContent).toContain("Q");
    // Home row
    expect(container?.textContent).toContain("A");
    expect(container?.textContent).toContain("F");
    expect(container?.textContent).toContain("J");
    // Bottom row
    expect(container?.textContent).toContain("Z");
    // Space bar
    expect(container?.querySelector("[data-key-code='Space']")).not.toBeNull();
  });

  it("renders homing nubs on F and J keys", () => {
    act(() => {
      root?.render(React.createElement(VisualKeyboard, {}));
    });

    const keyF = container?.querySelector("[data-key-code='KeyF']");
    const keyJ = container?.querySelector("[data-key-code='KeyJ']");

    expect(keyF?.querySelector("[data-homing-nub='true']")).not.toBeNull();
    expect(keyJ?.querySelector("[data-homing-nub='true']")).not.toBeNull();

    const keyD = container?.querySelector("[data-key-code='KeyD']");
    expect(keyD?.querySelector("[data-homing-nub='true']")).toBeNull();
  });

  it("highlights active key when activeKey is provided as character or code", () => {
    act(() => {
      root?.render(
        React.createElement(VisualKeyboard, {
          activeKey: "f",
        }),
      );
    });

    const keyF = container?.querySelector("[data-key-code='KeyF']");
    expect(keyF?.getAttribute("data-active-target")).toBe("true");

    const keyD = container?.querySelector("[data-key-code='KeyD']");
    expect(keyD?.getAttribute("data-active-target")).toBe("false");
  });

  it("highlights active key for space character", () => {
    act(() => {
      root?.render(
        React.createElement(VisualKeyboard, {
          activeKey: " ",
        }),
      );
    });

    const spaceKey = container?.querySelector("[data-key-code='Space']");
    expect(spaceKey?.getAttribute("data-active-target")).toBe("true");
  });

  it("applies pressed state when key is in pressedKeys", () => {
    act(() => {
      root?.render(
        React.createElement(VisualKeyboard, {
          pressedKeys: ["KeyA", "Space"],
        }),
      );
    });

    const keyA = container?.querySelector("[data-key-code='KeyA']");
    expect(keyA?.getAttribute("data-pressed")).toBe("true");

    const keyS = container?.querySelector("[data-key-code='KeyS']");
    expect(keyS?.getAttribute("data-pressed")).toBe("false");

    const spaceKey = container?.querySelector("[data-key-code='Space']");
    expect(spaceKey?.getAttribute("data-pressed")).toBe("true");
  });

  it("supports color-coded finger zones", () => {
    act(() => {
      root?.render(
        React.createElement(VisualKeyboard, {
          showFingerColors: true,
        }),
      );
    });

    const keyA = container?.querySelector("[data-key-code='KeyA']");
    expect(keyA?.getAttribute("data-finger")).toBe("left-pinky");

    const keyF = container?.querySelector("[data-key-code='KeyF']");
    expect(keyF?.getAttribute("data-finger")).toBe("left-index");

    const keyJ = container?.querySelector("[data-key-code='KeyJ']");
    expect(keyJ?.getAttribute("data-finger")).toBe("right-index");
  });

  it("adapts key labels to Latin American QWERTY profile", () => {
    act(() => {
      root?.render(
        React.createElement(VisualKeyboard, {
          layoutProfileId: "macos-latin-american-qwerty",
        }),
      );
    });

    const semicolonKey = container?.querySelector(
      "[data-key-code='Semicolon']",
    );
    expect(semicolonKey?.textContent).toContain("Ñ");
  });

  it("renders keys with proportional unit flex basis and unit-width data attributes", () => {
    act(() => {
      root?.render(React.createElement(VisualKeyboard, {}));
    });

    const spaceKey = container?.querySelector(
      "[data-key-code='Space']",
    ) as HTMLElement;
    expect(spaceKey).not.toBeNull();
    expect(spaceKey.getAttribute("data-unit-width")).toBe("6.25");
    expect(spaceKey.style.flex).toBe("6.25 1 0%");

    const tabKey = container?.querySelector(
      "[data-key-code='Tab']",
    ) as HTMLElement;
    expect(tabKey.getAttribute("data-unit-width")).toBe("1.5");
    expect(tabKey.style.flex).toBe("1.5 1 0%");

    const capsKey = container?.querySelector(
      "[data-key-code='CapsLock']",
    ) as HTMLElement;
    expect(capsKey.getAttribute("data-unit-width")).toBe("1.75");
    expect(capsKey.style.flex).toBe("1.75 1 0%");

    const enterKey = container?.querySelector(
      "[data-key-code='Enter']",
    ) as HTMLElement;
    expect(enterKey.getAttribute("data-unit-width")).toBe("2.25");
    expect(enterKey.style.flex).toBe("2.25 1 0%");

    const shiftRight = container?.querySelector(
      "[data-key-code='ShiftRight']",
    ) as HTMLElement;
    expect(shiftRight.getAttribute("data-unit-width")).toBe("2.75");
    expect(shiftRight.style.flex).toBe("2.75 1 0%");

    const backspaceKey = container?.querySelector(
      "[data-key-code='Backspace']",
    ) as HTMLElement;
    expect(backspaceKey.getAttribute("data-unit-width")).toBe("2");
    expect(backspaceKey.style.flex).toBe("2 1 0%");

    const keyA = container?.querySelector(
      "[data-key-code='KeyA']",
    ) as HTMLElement;
    expect(keyA.getAttribute("data-unit-width")).toBe("1");
    expect(keyA.style.flex).toBe("1 1 0%");
  });

  it("applies glowing ring styling when key is active target", () => {
    act(() => {
      root?.render(
        React.createElement(VisualKeyboard, {
          activeKey: "f",
        }),
      );
    });

    const keyF = container?.querySelector(
      "[data-key-code='KeyF']",
    ) as HTMLElement;
    expect(keyF.className).toContain("ring-2");
    expect(keyF.className).toContain("ring-accent");
    expect(keyF.className).toContain("animate-pulse");
  });
});

describe("HandFingerGuide component", () => {
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

  it("renders both left and right hand guides", () => {
    act(() => {
      root?.render(React.createElement(HandFingerGuide, { locale: "en" }));
    });

    expect(
      container?.querySelector("[data-testid='hand-finger-guide']"),
    ).not.toBeNull();
    expect(
      container?.querySelector("[data-testid='left-hand']"),
    ).not.toBeNull();
    expect(
      container?.querySelector("[data-testid='right-hand']"),
    ).not.toBeNull();
  });

  it("highlights the active finger when activeFinger prop is specified", () => {
    act(() => {
      root?.render(
        React.createElement(HandFingerGuide, {
          activeFinger: "left-index" as FingerType,
          locale: "en",
        }),
      );
    });

    const leftIndex = container?.querySelector("[data-finger-id='left-index']");
    expect(leftIndex?.getAttribute("data-active-finger")).toBe("true");

    const rightIndex = container?.querySelector(
      "[data-finger-id='right-index']",
    );
    expect(rightIndex?.getAttribute("data-active-finger")).toBe("false");
  });

  it("computes active finger automatically when activeKey is passed", () => {
    act(() => {
      root?.render(
        React.createElement(HandFingerGuide, {
          activeKey: "j",
          locale: "en",
        }),
      );
    });

    const rightIndex = container?.querySelector(
      "[data-finger-id='right-index']",
    );
    expect(rightIndex?.getAttribute("data-active-finger")).toBe("true");

    const leftIndex = container?.querySelector("[data-finger-id='left-index']");
    expect(leftIndex?.getAttribute("data-active-finger")).toBe("false");
  });

  it("renders bilingual labels for fingers", () => {
    act(() => {
      root?.render(
        React.createElement(HandFingerGuide, {
          activeFinger: "left-pinky",
          locale: "es",
        }),
      );
    });

    expect(container?.textContent).toContain("Mano izquierda");
    expect(container?.textContent).toContain("Meñique");
  });
});
