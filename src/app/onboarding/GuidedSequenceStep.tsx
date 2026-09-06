import React, { useEffect, useRef, useState } from "react";
import type { UiLocale } from "../../onboarding/repositories";
import { audioSynthesizer } from "../audio/audioSynthesizer";
import { getTranslation } from "../i18n";
import { VisualKeyboard } from "../keyboard/VisualKeyboard";

export interface GuidedSequenceStepProps {
  readonly locale: UiLocale;
  readonly onComplete: () => void;
}

type StepKey = "homeRow" | "topRow" | "bottomRow";

const SEQUENCE_STEPS: readonly StepKey[] = ["homeRow", "topRow", "bottomRow"];

const IGNORED_KEYS = new Set([
  "Shift",
  "Control",
  "Alt",
  "Meta",
  "CapsLock",
  "Tab",
  "Escape",
  "ArrowLeft",
  "ArrowRight",
  "ArrowUp",
  "ArrowDown",
]);

export function GuidedSequenceStep({
  locale,
  onComplete,
}: GuidedSequenceStepProps) {
  const t = getTranslation(locale).guided.sequence;
  const [stepIndex, setStepIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [feedback, setFeedback] = useState<"idle" | "match" | "mismatch">(
    "idle",
  );
  const [announcement, setAnnouncement] = useState("");
  const [pressedKeyCodes, setPressedKeyCodes] = useState<readonly string[]>([]);

  const inputRef = useRef<HTMLInputElement | null>(null);

  const currentStepKey = SEQUENCE_STEPS[stepIndex];
  const stepInfo = t.steps[currentStepKey];
  const targetString = stepInfo.target;
  const expectedChar = targetString[charIndex] || "";

  useEffect(() => {
    inputRef.current?.focus();
  }, [stepIndex]);

  const processInputChar = (inputChar: string) => {
    audioSynthesizer.playKeyPressSound(undefined, inputChar);
    if (!expectedChar) return;

    const isMatch =
      inputChar.toLowerCase() === expectedChar.toLowerCase() ||
      inputChar === expectedChar;

    if (isMatch) {
      setFeedback("match");
      setAnnouncement(t.matchNotice);

      if (charIndex + 1 < targetString.length) {
        setCharIndex(charIndex + 1);
      } else {
        // Step completed
        if (stepIndex + 1 < SEQUENCE_STEPS.length) {
          setStepIndex(stepIndex + 1);
          setCharIndex(0);
          setFeedback("idle");
        } else {
          setAnnouncement(t.completeAnnouncement);
          onComplete();
        }
      }
    } else {
      setFeedback("mismatch");
      setAnnouncement(t.mismatchNotice);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (IGNORED_KEYS.has(e.key)) return;

    if (e.code) {
      setPressedKeyCodes([e.code]);
    }

    if (e.key === "Backspace") {
      audioSynthesizer.playKeyPressSound(undefined, "Backspace");
      return;
    }

    if (e.key === " " || e.key === "Spacebar" || e.code === "Space") {
      e.preventDefault();
      processInputChar(" ");
      if (inputRef.current) {
        inputRef.current.value = "";
      }
      return;
    }

    processInputChar(e.key);
  };

  const handleKeyUp = () => {
    setPressedKeyCodes([]);
  };

  const handleInput = (e: React.FormEvent<HTMLInputElement>) => {
    const val = e.currentTarget.value;
    e.currentTarget.value = "";
    if (val) {
      processInputChar(val);
    }
  };

  return (
    <section
      aria-labelledby="sequence-heading"
      className="mx-auto max-w-3xl p-6 sm:p-10"
    >
      <div className="mb-6 text-center sm:text-left">
        <p className="mb-2 text-xs font-bold tracking-[0.2em] text-accent uppercase">
          {t.stepProgress(stepIndex + 1, SEQUENCE_STEPS.length)}
        </p>
        <h1
          className="font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl"
          id="sequence-heading"
        >
          {t.title}
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          {t.description}
        </p>
      </div>

      <div
        className="relative overflow-hidden rounded-3xl border border-line bg-panel p-6 shadow-[0_24px_70px_-45px_rgba(23,33,27,0.55)] sm:p-8"
        onClick={() => inputRef.current?.focus()}
      >
        <input
          aria-label="Guided sequence input"
          autoCapitalize="off"
          autoComplete="off"
          autoCorrect="off"
          autoFocus
          className="sr-only"
          onInput={handleInput}
          onKeyDown={handleKeyDown}
          onKeyUp={handleKeyUp}
          ref={inputRef}
          spellCheck={false}
        />

        <div className="mb-4 text-center">
          <h2 className="font-display text-xl font-bold text-ink">
            {stepInfo.title}
          </h2>
          <p className="mt-1 text-xs font-semibold text-accent uppercase">
            {t.keyProgress(charIndex + 1, targetString.length)}
          </p>
        </div>

        {/* Key Sequence Row Display */}
        <div className="my-6 flex flex-wrap items-center justify-center gap-2">
          {Array.from(targetString).map((char, idx) => {
            const isPassed = idx < charIndex;
            const isCurrent = idx === charIndex;
            const displayChar = char === " " ? "␣" : char;

            return (
              <kbd
                className={`grid size-12 place-items-center rounded-xl border font-display text-lg font-bold transition-all ${
                  isPassed
                    ? "border-line bg-paper text-accent"
                    : isCurrent
                      ? "scale-110 border-2 border-accent bg-highlight text-ink shadow-md"
                      : "border-line/60 bg-paper/40 text-muted/50"
                }`}
                key={`${stepIndex}-${idx}-${char}`}
              >
                {displayChar}
              </kbd>
            );
          })}
        </div>

        {/* Live Visual Keyboard */}
        <div className="my-6 overflow-x-auto">
          <VisualKeyboard
            activeKey={expectedChar}
            className="mx-auto max-w-2xl"
            pressedKeys={pressedKeyCodes}
            showFingerColors={true}
            size="sm"
          />
        </div>

        {/* Prompt and Feedback */}
        <div className="mt-6 text-center">
          <p className="text-sm font-semibold text-ink">
            {t.prompt(expectedChar === " " ? "Space" : expectedChar)}
          </p>

          {feedback === "mismatch" && (
            <p className="mt-2 text-xs font-semibold text-ink/90 animate-shake">
              ⚠️ {t.mismatchNotice}
            </p>
          )}

          {feedback === "match" && (
            <p className="mt-2 text-xs font-semibold text-accent">
              ✓ {t.matchNotice}
            </p>
          )}
        </div>
      </div>

      <div aria-live="polite" className="sr-only">
        {announcement}
      </div>
    </section>
  );
}
