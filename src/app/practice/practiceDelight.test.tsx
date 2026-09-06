// @vitest-environment happy-dom
import React, { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { SmoothCaret } from "./SmoothCaret";
import { StreakBadge } from "./StreakBadge";
import { WpmSparkline } from "./WpmSparkline";
import {
  getStreakMilestone,
  generateSparklineSvgPath,
} from "./practiceDelightModel";

(
  globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;

describe("SmoothCaret microcomponent", () => {
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

  it("renders with sub-pixel transform translate3d coordinates", () => {
    act(() => {
      root?.render(
        React.createElement(SmoothCaret, {
          x: 42.5,
          y: 18.25,
          height: 32,
          visible: true,
          isError: false,
        }),
      );
    });

    const caret = container?.querySelector(
      '[data-testid="smooth-caret"]',
    ) as HTMLElement;
    expect(caret).not.toBeNull();
    expect(caret.style.transform).toContain(
      "translate3d(42.5px, 18.25px, 0px)",
    );
    expect(caret.style.height).toBe("32px");
    expect(caret.getAttribute("data-error")).toBe("false");
    expect(caret.getAttribute("data-visible")).toBe("true");
  });

  it("applies error styling when isError is true", () => {
    act(() => {
      root?.render(
        React.createElement(SmoothCaret, {
          x: 10,
          y: 20,
          height: 28,
          isError: true,
        }),
      );
    });

    const caret = container?.querySelector(
      '[data-testid="smooth-caret"]',
    ) as HTMLElement;
    expect(caret).not.toBeNull();
    expect(caret.getAttribute("data-error")).toBe("true");
    expect(caret.className).toContain("bg-error");
  });

  it("hides or sets opacity when visible is false", () => {
    act(() => {
      root?.render(
        React.createElement(SmoothCaret, {
          x: 0,
          y: 0,
          visible: false,
        }),
      );
    });

    const caret = container?.querySelector(
      '[data-testid="smooth-caret"]',
    ) as HTMLElement;
    expect(caret).not.toBeNull();
    expect(caret.getAttribute("data-visible")).toBe("false");
    expect(caret.className).toContain("opacity-0");
  });

  it("renders idle blinking state", () => {
    act(() => {
      root?.render(
        React.createElement(SmoothCaret, {
          x: 0,
          y: 0,
          isBlinking: true,
        }),
      );
    });

    const caret = container?.querySelector(
      '[data-testid="smooth-caret"]',
    ) as HTMLElement;
    expect(caret.getAttribute("data-blinking")).toBe("true");
  });

  it("applies smooth transition during intra-line horizontal movement", () => {
    act(() => {
      root?.render(
        React.createElement(SmoothCaret, {
          x: 0,
          y: 10,
        }),
      );
    });

    const caret1 = container?.querySelector(
      '[data-testid="smooth-caret"]',
    ) as HTMLElement;
    expect(caret1.getAttribute("data-line-wrap")).toBe("false");
    expect(caret1.className).toContain("transition-transform");

    // Intra-line advance (same y, different x)
    act(() => {
      root?.render(
        React.createElement(SmoothCaret, {
          x: 24,
          y: 10,
        }),
      );
    });

    const caret2 = container?.querySelector(
      '[data-testid="smooth-caret"]',
    ) as HTMLElement;
    expect(caret2.getAttribute("data-line-wrap")).toBe("false");
    expect(caret2.classList.contains("transition-transform")).toBe(true);
    expect(caret2.classList.contains("transition-none")).toBe(false);
  });

  it("suppresses transitions on line wrap (vertical y delta) and restores smoothly", () => {
    // Initial position on line 1
    act(() => {
      root?.render(
        React.createElement(SmoothCaret, {
          x: 500,
          y: 10,
        }),
      );
    });

    const caretInitial = container?.querySelector(
      '[data-testid="smooth-caret"]',
    ) as HTMLElement;
    expect(caretInitial.getAttribute("data-line-wrap")).toBe("false");

    // Line wrap to beginning of line 2 (y changes from 10 to 46)
    act(() => {
      root?.render(
        React.createElement(SmoothCaret, {
          x: 0,
          y: 46,
        }),
      );
    });

    const caretWrapped = container?.querySelector(
      '[data-testid="smooth-caret"]',
    ) as HTMLElement;
    expect(caretWrapped.getAttribute("data-line-wrap")).toBe("true");
    expect(caretWrapped.classList.contains("transition-none")).toBe(true);
    expect(caretWrapped.style.transform).toContain(
      "translate3d(0px, 46px, 0px)",
    );

    // Subsequent typing on line 2 (same y = 46, advancing x)
    act(() => {
      root?.render(
        React.createElement(SmoothCaret, {
          x: 18,
          y: 46,
        }),
      );
    });

    const caretAdvancing = container?.querySelector(
      '[data-testid="smooth-caret"]',
    ) as HTMLElement;
    expect(caretAdvancing.getAttribute("data-line-wrap")).toBe("false");
    expect(caretAdvancing.classList.contains("transition-transform")).toBe(
      true,
    );
    expect(caretAdvancing.classList.contains("transition-none")).toBe(false);
    expect(caretAdvancing.style.transform).toContain(
      "translate3d(18px, 46px, 0px)",
    );
  });
});

describe("StreakBadge microcomponent and milestone logic", () => {
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

  it("calculates milestones correctly in English and Spanish", () => {
    // English
    expect(getStreakMilestone(0, "en").tier).toBe("none");
    expect(getStreakMilestone(5, "en").tier).toBe("warmup");
    expect(getStreakMilestone(10, "en").tier).toBe("streak");
    expect(getStreakMilestone(10, "en").label).toContain("Streak");
    expect(getStreakMilestone(25, "en").tier).toBe("combo");
    expect(getStreakMilestone(25, "en").label).toContain("Combo");
    expect(getStreakMilestone(50, "en").tier).toBe("flawless");
    expect(getStreakMilestone(50, "en").label).toContain("Flawless");
    expect(getStreakMilestone(100, "en").tier).toBe("godlike");
    expect(getStreakMilestone(100, "en").label).toContain("Godlike");

    // Spanish
    expect(getStreakMilestone(10, "es").tier).toBe("streak");
    expect(getStreakMilestone(10, "es").label).toContain("Racha");
    expect(getStreakMilestone(25, "es").tier).toBe("combo");
    expect(getStreakMilestone(25, "es").label).toContain("Combo");
    expect(getStreakMilestone(50, "es").tier).toBe("flawless");
    expect(getStreakMilestone(50, "es").label).toContain("Impecable");
    expect(getStreakMilestone(100, "es").tier).toBe("godlike");
    expect(getStreakMilestone(100, "es").label).toContain("Maestría");
  });

  it("renders streak badge with milestone styling and icon", () => {
    act(() => {
      root?.render(
        React.createElement(StreakBadge, {
          streak: 25,
          locale: "en",
        }),
      );
    });

    const badge = container?.querySelector(
      '[data-testid="streak-badge"]',
    ) as HTMLElement;
    expect(badge).not.toBeNull();
    expect(badge.getAttribute("data-streak")).toBe("25");
    expect(badge.getAttribute("data-tier")).toBe("combo");
    expect(badge.textContent).toContain("25");
    expect(badge.textContent).toContain("Combo");
  });

  it("handles 0 streak cleanly without crashing", () => {
    act(() => {
      root?.render(
        React.createElement(StreakBadge, {
          streak: 0,
          locale: "en",
        }),
      );
    });

    const badge = container?.querySelector(
      '[data-testid="streak-badge"]',
    ) as HTMLElement;
    expect(badge).not.toBeNull();
    expect(badge.getAttribute("data-streak")).toBe("0");
    expect(badge.getAttribute("data-tier")).toBe("none");
  });
});

describe("WpmSparkline microcomponent and path generator", () => {
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

  it("generates smooth SVG path and area data from samples", () => {
    const samples = [30, 45, 55, 50, 65];
    const result = generateSparklineSvgPath(samples, 160, 40);

    expect(result.points.length).toBe(5);
    expect(result.min).toBe(30);
    expect(result.max).toBe(65);
    expect(result.pathData.startsWith("M")).toBe(true);
    expect(result.areaData.startsWith("M")).toBe(true);
    expect(result.areaData.endsWith("Z")).toBe(true);
    expect(result.lastPoint).not.toBeNull();
    expect(result.lastPoint?.value).toBe(65);
  });

  it("handles empty or single sample gracefully", () => {
    const emptyResult = generateSparklineSvgPath([], 160, 40);
    expect(emptyResult.points.length).toBe(0);
    expect(emptyResult.pathData).toBe("");
    expect(emptyResult.areaData).toBe("");
    expect(emptyResult.lastPoint).toBeNull();

    const singleResult = generateSparklineSvgPath([50], 160, 40);
    expect(singleResult.points.length).toBe(1);
    expect(singleResult.pathData.startsWith("M")).toBe(true);
    expect(singleResult.lastPoint?.value).toBe(50);
  });

  it("handles flat/uniform samples without division by zero", () => {
    const flatResult = generateSparklineSvgPath([40, 40, 40], 160, 40);
    expect(flatResult.points.length).toBe(3);
    expect(flatResult.min).toBe(40);
    expect(flatResult.max).toBe(40);
    expect(flatResult.points.every((p) => !Number.isNaN(p.y))).toBe(true);
  });

  it("renders SVG sparkline component with paths and current WPM indicator", () => {
    act(() => {
      root?.render(
        React.createElement(WpmSparkline, {
          samples: [20, 35, 45, 60],
          currentWpm: 60,
          width: 160,
          height: 40,
        }),
      );
    });

    const sparkline = container?.querySelector(
      '[data-testid="wpm-sparkline"]',
    ) as HTMLElement;
    expect(sparkline).not.toBeNull();

    const svg = sparkline.querySelector("svg");
    expect(svg).not.toBeNull();

    const paths = svg?.querySelectorAll("path");
    expect(paths?.length).toBeGreaterThanOrEqual(2); // stroke path + area fill

    const circle = svg?.querySelector("circle");
    expect(circle).not.toBeNull();
  });
});
