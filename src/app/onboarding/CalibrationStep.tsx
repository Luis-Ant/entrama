import { useEffect, useRef, useState } from "react";
import {
  CALIBRATION_RESULT,
  evaluateCalibration,
} from "../../keyboard-layouts/calibration";
import type { LayoutDefinitionV1 } from "../../keyboard-layouts/types";
import type { UiLocale } from "../../onboarding/repositories";
import { getTranslation } from "../i18n";
import { VisualKeyboard } from "../keyboard/VisualKeyboard";
import { useCalibrationCapture } from "./useCalibrationCapture";

export interface CalibrationStepProps {
  readonly definition: LayoutDefinitionV1;
  readonly passedStepIds: readonly string[];
  readonly locale: UiLocale;
  readonly onComplete: (passedStepIds: readonly string[]) => void;
  readonly onRetry: () => void;
}

export function CalibrationStep({
  definition,
  passedStepIds,
  locale,
  onComplete,
  onRetry,
}: CalibrationStepProps) {
  const t = getTranslation(locale).calibration;
  const isEs = locale === "es";
  const mandatorySteps = definition.steps.filter((s) => s.mandatory);
  const [currentPassed, setCurrentPassed] = useState<readonly string[]>(
    () => passedStepIds,
  );
  const [isPaused, setIsPaused] = useState(false);
  const [failed, setFailed] = useState(false);
  const [announcement, setAnnouncement] = useState("");
  const [lastCaptured, setLastCaptured] = useState("");
  const [lastPressedCode, setLastPressedCode] = useState<string>("");

  const resumeBtnRef = useRef<HTMLButtonElement | null>(null);
  const retryBtnRef = useRef<HTMLButtonElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const currentStepIndex = currentPassed.length;
  const activeStep = mandatorySteps[currentStepIndex];

  const capture = useCalibrationCapture({
    inputRef,
    disabled: isPaused || failed || currentStepIndex >= mandatorySteps.length,
    onEscape: () => {
      setIsPaused(true);
      setAnnouncement(t.pausedAnnouncement);
      setTimeout(() => resumeBtnRef.current?.focus(), 0);
    },
    onEvidence: (evidence) => {
      setLastCaptured(
        `code="${evidence.code || "none"}", inputType="${evidence.inputType}", committed="${evidence.committed}"`,
      );
      if (evidence.code) {
        setLastPressedCode(evidence.code);
      }
      const evaluation = evaluateCalibration(
        definition,
        currentPassed,
        evidence,
      );
      if (evaluation.result === CALIBRATION_RESULT.IGNORED) return;

      if (evaluation.result === CALIBRATION_RESULT.FAILED) {
        setFailed(true);
        setAnnouncement(t.failedAnnouncement);
        setTimeout(() => retryBtnRef.current?.focus(), 0);
      } else if (evaluation.result === CALIBRATION_RESULT.PASSED) {
        setCurrentPassed(evaluation.passedStepIds);
        setAnnouncement(t.stepPassedAnnouncement);
        inputRef.current?.focus();
      } else if (evaluation.result === CALIBRATION_RESULT.COMPLETE) {
        setCurrentPassed(evaluation.passedStepIds);
        setAnnouncement(t.completeAnnouncement);
        onComplete(evaluation.passedStepIds);
      }
    },
  });

  useEffect(() => {
    if (!isPaused && !failed && currentStepIndex < mandatorySteps.length) {
      inputRef.current?.focus();
    }
  }, [isPaused, failed, currentStepIndex, mandatorySteps.length]);

  const handleResume = () => {
    setIsPaused(false);
    setAnnouncement(
      t.prompt(activeStep?.code || "", activeStep?.expected || ""),
    );
    inputRef.current?.focus();
  };

  const handleRetryClick = () => {
    setFailed(false);
    setIsPaused(false);
    setCurrentPassed([]);
    setLastPressedCode("");
    onRetry();
    inputRef.current?.focus();
  };

  function formatModifiers(step?: (typeof mandatorySteps)[number]): string {
    if (!step) return "";
    const mods: string[] = [];
    if (step.shiftKey) mods.push("Shift");
    if (step.altKey) mods.push("Alt / Option");
    if (step.ctrlKey) mods.push("Ctrl");
    if (step.metaKey) mods.push("Cmd / Meta");
    return mods.join(" + ");
  }

  function formatKeyCodeLabel(code: string): string {
    if (code.startsWith("Key")) return code.slice(3);
    if (code.startsWith("Digit")) return code.slice(5);
    switch (code) {
      case "BracketLeft":
        return "[ / ´";
      case "Semicolon":
        return "; / Ñ";
      case "Slash":
        return "/";
      case "Equal":
        return "= / ¿";
      case "Minus":
        return "- / ?";
      default:
        return code;
    }
  }

  return (
    <section
      aria-labelledby="calibration-heading"
      className="mx-auto max-w-3xl p-6 sm:p-10"
    >
      <div className="mb-6">
        <p className="mb-2 text-xs font-bold tracking-[0.2em] text-accent uppercase">
          {t.stepProgress(
            Math.min(currentStepIndex + 1, mandatorySteps.length),
            mandatorySteps.length,
          )}
        </p>
        <h1
          className="font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl"
          id="calibration-heading"
        >
          {t.title}
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          {t.description}
        </p>
      </div>

      <div
        className="relative overflow-hidden rounded-3xl border border-line bg-panel p-6 shadow-[0_24px_70px_-45px_rgba(23,33,27,0.55)] sm:p-8"
        onClick={() => capture.inputRef.current?.focus()}
      >
        <input
          aria-describedby="calibration-help"
          aria-label="Calibration Input"
          autoCapitalize="off"
          autoComplete="off"
          autoCorrect="off"
          autoFocus
          className="sr-only"
          disabled={
            isPaused || failed || currentStepIndex >= mandatorySteps.length
          }
          onBeforeInput={capture.handleBeforeInput}
          onCompositionEnd={capture.handleCompositionEnd}
          onCompositionStart={capture.handleCompositionStart}
          onInput={capture.handleInput}
          onKeyDown={capture.handleKeyDown}
          onPaste={capture.handlePaste}
          ref={inputRef}
          spellCheck={false}
        />

        {activeStep && !failed && (
          <div className="my-6 text-center">
            <p className="text-xs font-bold tracking-widest text-muted uppercase">
              {formatModifiers(activeStep)
                ? t.modifiers(formatModifiers(activeStep))
                : t.modifiers("")}
            </p>
            <div className="my-4 flex items-center justify-center gap-4">
              <kbd className="grid min-w-16 place-items-center rounded-2xl border border-b-4 border-ink bg-paper px-4 py-3 font-display text-3xl font-bold text-ink">
                {formatKeyCodeLabel(activeStep.code)}
              </kbd>
              <span className="text-2xl font-bold text-muted">→</span>
              <span className="grid min-w-16 place-items-center rounded-2xl border border-line bg-highlight px-4 py-3 font-display text-4xl font-semibold text-accent">
                {activeStep.expected}
              </span>
            </div>
            <p className="text-sm font-medium text-ink">
              {t.prompt(
                formatKeyCodeLabel(activeStep.code),
                activeStep.expected,
              )}
            </p>
          </div>
        )}

        {/* Embedded Interactive Visual Keyboard */}
        <div className="my-6 overflow-x-auto">
          <VisualKeyboard
            activeCode={activeStep?.code}
            className="mx-auto max-w-2xl"
            layoutProfileId={definition.layoutProfileId}
            pressedKeys={lastPressedCode ? [lastPressedCode] : []}
            showFingerColors={true}
            size="sm"
          />
        </div>

        {failed && (
          <div className="my-6 rounded-2xl border border-line bg-panel p-6 text-center">
            <p className="font-display text-lg font-bold text-ink">
              {t.statusFailed}
            </p>
            <p className="mt-2 text-sm text-muted">{t.failedAnnouncement}</p>
            {lastCaptured && (
              <p className="mt-2 font-mono text-xs text-muted/80">
                Detalle capturado: {lastCaptured}
              </p>
            )}
            {lastCaptured.includes('committed="a"') && (
              <p className="mt-3 text-xs leading-relaxed text-accent font-medium">
                💡 Tu navegador recibió una &quot;a&quot; simple sin acento.
                Verifica que tu sistema operativo tenga activada la tilde
                (teclado Español o EE. UU. Internacional) o usa &quot;Change
                profile&quot; arriba a la derecha.
              </p>
            )}
            <button
              className="mt-4 rounded-full bg-ink px-6 py-2.5 text-sm font-semibold text-paper transition-colors hover:bg-ink/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              onClick={handleRetryClick}
              ref={retryBtnRef}
              type="button"
            >
              {t.retryButton}
            </button>
          </div>
        )}

        {isPaused && !failed && (
          <div className="my-6 rounded-2xl border border-line bg-paper p-6 text-center">
            <p className="font-display text-base font-semibold text-ink">
              {t.pausedAnnouncement}
            </p>
            <button
              className="mt-4 rounded-full bg-ink px-6 py-2.5 text-sm font-semibold text-paper transition-colors hover:bg-ink/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              onClick={handleResume}
              ref={resumeBtnRef}
              type="button"
            >
              {t.resumeButton}
            </button>
          </div>
        )}

        <div className="mt-6 flex flex-col items-center justify-between gap-3 border-t border-line pt-4 sm:flex-row">
          <p className="text-xs text-muted" id="calibration-help">
            {t.pauseNotice}
          </p>
          <div className="flex items-center gap-4">
            <button
              className="text-xs font-semibold text-accent underline decoration-line underline-offset-4 hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              onClick={() => onComplete(mandatorySteps.map((s) => s.id))}
              type="button"
            >
              {isEs
                ? "Omitir calibración (Bypass)"
                : "Skip Calibration (Bypass)"}
            </button>
            <button
              className="text-xs font-semibold text-muted underline decoration-line underline-offset-4 hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              onClick={handleRetryClick}
              type="button"
            >
              {t.retryButton}
            </button>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="mb-4 text-xs font-bold tracking-widest text-muted uppercase">
          {isEs
            ? "Pasos de calibración requeridos"
            : "Required calibration steps"}
        </h2>
        <ol className="grid gap-2">
          {mandatorySteps.map((step, index) => {
            const isDone = currentPassed.includes(step.id);
            const isCurrent = index === currentStepIndex && !failed;
            const isFailedStep = index === currentStepIndex && failed;

            return (
              <li
                className={`flex items-center justify-between rounded-xl border px-4 py-3 text-sm transition-colors motion-reduce:transition-none ${
                  isDone
                    ? "border-line bg-paper text-ink"
                    : isCurrent
                      ? "border-accent bg-highlight font-semibold text-ink"
                      : isFailedStep
                        ? "border-line bg-panel font-semibold text-ink"
                        : "border-line/60 bg-paper/40 text-muted/60"
                }`}
                key={step.id}
              >
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs font-bold text-muted">
                    {index + 1}.
                  </span>
                  <span>{step.id}</span>
                </div>
                <span className="text-xs font-semibold">
                  {isDone ? (
                    <span className="text-accent">{t.statusPassed}</span>
                  ) : isFailedStep ? (
                    <span className="text-ink">{t.statusFailed}</span>
                  ) : (
                    <span className="text-muted">{t.statusPending}</span>
                  )}
                </span>
              </li>
            );
          })}
        </ol>
      </div>

      <div aria-live="polite" className="sr-only">
        {announcement}
      </div>
    </section>
  );
}
