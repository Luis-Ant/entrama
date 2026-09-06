import { useRef, type SyntheticEvent } from "react";
import type { CalibrationEvidence } from "../../keyboard-layouts/types";

export interface UseCalibrationCaptureOptions<
  T extends HTMLInputElement | HTMLTextAreaElement = HTMLInputElement,
> {
  readonly inputRef?: React.RefObject<T | null>;
  readonly onEvidence: (evidence: CalibrationEvidence) => void;
  readonly onEscape?: () => void;
  readonly disabled?: boolean;
}

interface PendingKeyState {
  readonly code: string;
  readonly altKey: boolean;
  readonly ctrlKey: boolean;
  readonly metaKey: boolean;
  readonly shiftKey: boolean;
  readonly repeat: boolean;
}

export function useCalibrationCapture<
  T extends HTMLInputElement | HTMLTextAreaElement = HTMLInputElement,
>({
  inputRef: externalInputRef,
  onEvidence,
  onEscape,
  disabled = false,
}: UseCalibrationCaptureOptions<T>) {
  const internalInputRef = useRef<T | null>(null);
  const inputRef = externalInputRef || internalInputRef;
  const pendingKey = useRef<PendingKeyState | null>(null);
  const lastNonModifierKey = useRef<PendingKeyState | null>(null);
  const isComposing = useRef<boolean>(false);
  const justEndedComposition = useRef<boolean>(false);

  const modifierCodes = new Set([
    "AltLeft",
    "AltRight",
    "ControlLeft",
    "ControlRight",
    "MetaLeft",
    "MetaRight",
    "ShiftLeft",
    "ShiftRight",
  ]);

  const clearBuffers = () => {
    pendingKey.current = null;
    lastNonModifierKey.current = null;
    isComposing.current = false;
    justEndedComposition.current = false;
  };

  const handleKeyDown = (event: React.KeyboardEvent | KeyboardEvent) => {
    if (disabled) return;

    if (event.key === "Escape") {
      if (
        "preventDefault" in event &&
        typeof event.preventDefault === "function"
      ) {
        event.preventDefault();
      }
      clearBuffers();
      if (inputRef.current) {
        inputRef.current.blur();
      } else if (
        event.target &&
        "blur" in event.target &&
        typeof (event.target as HTMLElement).blur === "function"
      ) {
        (event.target as HTMLElement).blur();
      }
      onEscape?.();
      return;
    }

    const state: PendingKeyState = {
      code: event.code || "",
      altKey: !!event.altKey,
      ctrlKey: !!event.ctrlKey,
      metaKey: !!event.metaKey,
      shiftKey: !!event.shiftKey,
      repeat: !!event.repeat,
    };

    if (event.code && !modifierCodes.has(event.code)) {
      lastNonModifierKey.current = state;
    }

    if (event.repeat) {
      clearBuffers();
      onEvidence({
        ...state,
        committed: "",
        inputType: "insertText",
        composing: false,
        cancelled: false,
        repeat: true,
      });
      return;
    }

    pendingKey.current = state;
  };

  const handleCompositionStart = () => {
    if (disabled) return;
    isComposing.current = true;
    justEndedComposition.current = false;
  };

  const handleCompositionEnd = (
    event: React.CompositionEvent | CompositionEvent,
  ) => {
    if (disabled) return;
    isComposing.current = false;
    justEndedComposition.current = true;

    const key =
      pendingKey.current && pendingKey.current.code
        ? pendingKey.current
        : lastNonModifierKey.current || {
            code: "",
            altKey: false,
            ctrlKey: false,
            metaKey: false,
            shiftKey: false,
            repeat: false,
          };

    const evidence: CalibrationEvidence = {
      code: key.code,
      altKey: key.altKey,
      ctrlKey: key.ctrlKey,
      metaKey: key.metaKey,
      shiftKey: key.shiftKey,
      committed: event.data || "",
      inputType: "insertText",
      composing: false,
      cancelled: false,
      repeat: key.repeat,
    };

    pendingKey.current = null;
    onEvidence(evidence);
  };

  const handleBeforeInput = (
    event: React.FormEvent | InputEvent | SyntheticEvent,
  ) => {
    if (disabled) return;
    const inputType =
      "inputType" in event ? (event as InputEvent).inputType : "";
    if (
      inputType &&
      (inputType.startsWith("delete") ||
        inputType.startsWith("insertFromDrop") ||
        inputType.startsWith("insertReplacement"))
    ) {
      const key = pendingKey.current || {
        code: "",
        altKey: false,
        ctrlKey: false,
        metaKey: false,
        shiftKey: false,
        repeat: false,
      };
      pendingKey.current = null;
      onEvidence({
        code: key.code,
        altKey: key.altKey,
        ctrlKey: key.ctrlKey,
        metaKey: key.metaKey,
        shiftKey: key.shiftKey,
        committed: "",
        inputType,
        composing: false,
        cancelled: false,
        repeat: false,
      });
    }
  };

  const handleInput = (
    event: React.FormEvent | InputEvent | SyntheticEvent,
  ) => {
    if (disabled) return;

    if (isComposing.current) {
      const key = pendingKey.current || {
        code: "",
        altKey: false,
        ctrlKey: false,
        metaKey: false,
        shiftKey: false,
        repeat: false,
      };
      onEvidence({
        code: key.code,
        altKey: key.altKey,
        ctrlKey: key.ctrlKey,
        metaKey: key.metaKey,
        shiftKey: key.shiftKey,
        committed: "",
        inputType: "insertCompositionText",
        composing: true,
        cancelled: false,
        repeat: false,
      });
      return;
    }

    if (justEndedComposition.current) {
      justEndedComposition.current = false;
      if (
        event.currentTarget &&
        "value" in event.currentTarget &&
        typeof (event.currentTarget as HTMLInputElement).value === "string"
      ) {
        (event.currentTarget as HTMLInputElement).value = "";
      }
      return;
    }

    const nativeEvent = "nativeEvent" in event ? event.nativeEvent : event;
    const inputType =
      "inputType" in nativeEvent
        ? (nativeEvent as InputEvent).inputType
        : "insertText";
    const data =
      "data" in nativeEvent ? (nativeEvent as InputEvent).data : null;
    let targetValue = "";
    if (
      event.currentTarget &&
      "value" in event.currentTarget &&
      typeof (event.currentTarget as HTMLInputElement).value === "string"
    ) {
      targetValue = (event.currentTarget as HTMLInputElement).value;
      (event.currentTarget as HTMLInputElement).value = "";
    }

    const committed = data ?? targetValue ?? "";
    const key =
      pendingKey.current && pendingKey.current.code
        ? pendingKey.current
        : lastNonModifierKey.current || {
            code: "",
            altKey: false,
            ctrlKey: false,
            metaKey: false,
            shiftKey: false,
            repeat: false,
          };
    pendingKey.current = null;

    onEvidence({
      code: key.code,
      altKey: key.altKey,
      ctrlKey: key.ctrlKey,
      metaKey: key.metaKey,
      shiftKey: key.shiftKey,
      committed,
      inputType,
      composing: false,
      cancelled: false,
      repeat: key.repeat,
    });
  };

  const handlePaste = (
    event: React.ClipboardEvent | ClipboardEvent | SyntheticEvent,
  ) => {
    if (disabled) return;
    if (
      "preventDefault" in event &&
      typeof event.preventDefault === "function"
    ) {
      event.preventDefault();
    }
    pendingKey.current = null;
    onEvidence({
      code: "",
      altKey: false,
      ctrlKey: false,
      metaKey: false,
      shiftKey: false,
      committed: "",
      inputType: "insertFromPaste",
      composing: false,
      cancelled: false,
      repeat: false,
    });
  };

  return {
    inputRef,
    handleKeyDown,
    handleCompositionStart,
    handleCompositionEnd,
    handleBeforeInput,
    handleInput,
    handlePaste,
    clearBuffers,
  } as const;
}
