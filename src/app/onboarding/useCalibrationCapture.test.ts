// @vitest-environment happy-dom
import React, { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { CalibrationEvidence } from "../../keyboard-layouts/types";
import { useCalibrationCapture } from "./useCalibrationCapture";

(
  globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;

describe("useCalibrationCapture", () => {
  let container: HTMLDivElement | null = null;
  let root: ReturnType<typeof createRoot> | null = null;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    if (root) {
      act(() => root?.unmount());
    }
    if (container) {
      container.remove();
    }
    container = null;
    root = null;
  });

  function TestHarness({
    onEvidence,
    onEscape,
    disabled = false,
  }: {
    readonly onEvidence: (evidence: CalibrationEvidence) => void;
    readonly onEscape?: () => void;
    readonly disabled?: boolean;
  }) {
    const capture = useCalibrationCapture({ onEvidence, onEscape, disabled });
    return React.createElement("input", {
      "aria-label": "Calibration Input",
      disabled,
      onBeforeInput: capture.handleBeforeInput,
      onCompositionEnd: capture.handleCompositionEnd,
      onCompositionStart: capture.handleCompositionStart,
      onInput: capture.handleInput,
      onKeyDown: capture.handleKeyDown,
      onPaste: capture.handlePaste,
      ref: capture.inputRef,
    });
  }

  it("captures physical key metadata and committed text for normal input", () => {
    const onEvidence = vi.fn();
    act(() => {
      root?.render(React.createElement(TestHarness, { onEvidence }));
    });

    const input = container?.querySelector("input") as HTMLInputElement;
    expect(input).not.toBeNull();

    act(() => {
      input.dispatchEvent(
        new KeyboardEvent("keydown", {
          code: "KeyA",
          altKey: false,
          ctrlKey: false,
          metaKey: false,
          shiftKey: true,
          bubbles: true,
        }),
      );
      input.value = "A";
      input.dispatchEvent(
        new InputEvent("input", {
          inputType: "insertText",
          data: "A",
          bubbles: true,
        }),
      );
    });

    expect(onEvidence).toHaveBeenCalledTimes(1);
    expect(onEvidence).toHaveBeenCalledWith({
      code: "KeyA",
      altKey: false,
      ctrlKey: false,
      metaKey: false,
      shiftKey: true,
      committed: "A",
      inputType: "insertText",
      composing: false,
      cancelled: false,
      repeat: false,
    });
  });

  it("deduplicates compositionend and the immediately following input event", () => {
    const onEvidence = vi.fn();
    act(() => {
      root?.render(React.createElement(TestHarness, { onEvidence }));
    });

    const input = container?.querySelector("input") as HTMLInputElement;

    act(() => {
      input.dispatchEvent(
        new KeyboardEvent("keydown", { code: "Quote", bubbles: true }),
      );
      input.dispatchEvent(
        new CompositionEvent("compositionstart", { bubbles: true }),
      );
      input.dispatchEvent(
        new InputEvent("input", {
          inputType: "insertCompositionText",
          data: "´",
          bubbles: true,
        }),
      );
    });

    // During composition, input emitted composing: true evidence
    expect(onEvidence).toHaveBeenCalledWith(
      expect.objectContaining({ composing: true }),
    );
    onEvidence.mockClear();

    act(() => {
      const compEnd = new CompositionEvent("compositionend", {
        data: "á",
        bubbles: true,
      });
      Object.defineProperty(compEnd, "data", { value: "á" });
      input.dispatchEvent(compEnd);
      // Immediately following input event from browser
      input.value = "á";
      input.dispatchEvent(
        new InputEvent("input", {
          inputType: "insertText",
          data: "á",
          bubbles: true,
        }),
      );
    });

    // Should only emit ONCE for compositionend (deduplicated against input)
    expect(onEvidence).toHaveBeenCalledTimes(1);
    expect(onEvidence).toHaveBeenCalledWith({
      code: "Quote",
      altKey: false,
      ctrlKey: false,
      metaKey: false,
      shiftKey: false,
      committed: "á",
      inputType: "insertText",
      composing: false,
      cancelled: false,
      repeat: false,
    });
  });

  it("recovers on Escape key by blurring input, clearing buffers, and calling onEscape", () => {
    const onEvidence = vi.fn();
    const onEscape = vi.fn();
    act(() => {
      root?.render(React.createElement(TestHarness, { onEscape, onEvidence }));
    });

    const input = container?.querySelector("input") as HTMLInputElement;
    input.focus();
    expect(document.activeElement).toBe(input);

    act(() => {
      input.dispatchEvent(
        new KeyboardEvent("keydown", { code: "KeyA", bubbles: true }),
      );
      input.dispatchEvent(
        new KeyboardEvent("keydown", {
          key: "Escape",
          code: "Escape",
          bubbles: true,
        }),
      );
    });

    expect(onEscape).toHaveBeenCalledTimes(1);
    expect(document.activeElement).not.toBe(input);

    // Further input after Escape should have cleared pending key code
    act(() => {
      input.value = "a";
      input.dispatchEvent(
        new InputEvent("input", {
          inputType: "insertText",
          data: "a",
          bubbles: true,
        }),
      );
    });

    expect(onEvidence).toHaveBeenCalledWith(
      expect.objectContaining({ code: "" }),
    );
  });

  it("handles key repeat by emitting repeat evidence immediately", () => {
    const onEvidence = vi.fn();
    act(() => {
      root?.render(React.createElement(TestHarness, { onEvidence }));
    });

    const input = container?.querySelector("input") as HTMLInputElement;

    act(() => {
      input.dispatchEvent(
        new KeyboardEvent("keydown", {
          code: "KeyA",
          repeat: true,
          bubbles: true,
        }),
      );
    });

    expect(onEvidence).toHaveBeenCalledTimes(1);
    expect(onEvidence).toHaveBeenCalledWith(
      expect.objectContaining({ repeat: true, code: "KeyA" }),
    );
  });

  it("handles paste by preventing default and emitting insertFromPaste evidence", () => {
    const onEvidence = vi.fn();
    act(() => {
      root?.render(React.createElement(TestHarness, { onEvidence }));
    });

    const input = container?.querySelector("input") as HTMLInputElement;

    act(() => {
      const pasteEvent = new Event("paste", {
        bubbles: true,
        cancelable: true,
      });
      input.dispatchEvent(pasteEvent);
    });

    expect(onEvidence).toHaveBeenCalledWith(
      expect.objectContaining({ inputType: "insertFromPaste" }),
    );
  });

  it("handles deletion and multi-grapheme input by emitting evidence with their raw properties", () => {
    const onEvidence = vi.fn();
    act(() => {
      root?.render(React.createElement(TestHarness, { onEvidence }));
    });

    const input = container?.querySelector("input") as HTMLInputElement;

    act(() => {
      input.dispatchEvent(
        new InputEvent("input", {
          inputType: "deleteContentBackward",
          data: null,
          bubbles: true,
        }),
      );
    });

    expect(onEvidence).toHaveBeenCalledWith(
      expect.objectContaining({ inputType: "deleteContentBackward" }),
    );

    onEvidence.mockClear();

    act(() => {
      input.value = "abc";
      input.dispatchEvent(
        new InputEvent("input", {
          inputType: "insertText",
          data: "abc",
          bubbles: true,
        }),
      );
    });

    expect(onEvidence).toHaveBeenCalledWith(
      expect.objectContaining({ committed: "abc" }),
    );
  });
});
