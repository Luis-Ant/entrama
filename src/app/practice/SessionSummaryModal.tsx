import { useEffect, useRef } from "react";
import { getTranslation } from "../i18n";
import type { UiLocale } from "../../onboarding/repositories";

export interface SessionSummaryModalProps {
  readonly isOpen: boolean;
  readonly netWpm: number;
  readonly grossWpm: number;
  readonly accuracy: number;
  readonly characterCount: number;
  readonly errorCount: number;
  readonly elapsedSeconds: number;
  readonly bestStreak?: number;
  readonly isPersonalBest?: boolean;
  readonly locale?: UiLocale;
  readonly onRetry?: () => void;
  readonly onChangeSetup?: () => void;
  readonly onClose?: () => void;
}

export function SessionSummaryModal({
  isOpen,
  netWpm,
  grossWpm,
  accuracy,
  characterCount,
  errorCount,
  elapsedSeconds,
  bestStreak,
  isPersonalBest = false,
  locale = "en",
  onRetry,
  onChangeSetup,
  onClose,
}: SessionSummaryModalProps) {
  const t = getTranslation(locale);
  const ft = t.freeTyping;
  const primaryButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isOpen) {
      primaryButtonRef.current?.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose?.();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  const formattedMinutes = Math.floor(elapsedSeconds / 60);
  const formattedSeconds = elapsedSeconds % 60;
  const timeFormatted =
    formattedMinutes > 0
      ? `${formattedMinutes}m ${formattedSeconds}s`
      : `${formattedSeconds}s`;

  // Celebratory status
  const celebrationTitle =
    accuracy >= 98
      ? ft.modal.celebrationFlawless
      : netWpm >= 60
        ? ft.modal.celebrationSpeed
        : ft.modal.celebrationGreat;

  return (
    <div
      aria-describedby="session-summary-desc"
      aria-labelledby="session-summary-title"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/60 backdrop-blur-sm animate-fade-in motion-reduce:animate-none"
      data-testid="session-summary-modal"
      role="dialog"
    >
      <div className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-line bg-panel p-6 shadow-2xl sm:p-8">
        {/* Subtle celebratory background particles */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-6 -top-6 flex size-32 items-center justify-center opacity-25 motion-reduce:hidden"
        >
          <div className="size-28 rounded-full bg-accent/40 blur-2xl" />
        </div>

        <div className="text-center">
          <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full border border-accent/30 bg-highlight text-accent shadow-inner">
            {accuracy >= 98 ? (
              <span aria-hidden="true" className="text-2xl">
                ✨
              </span>
            ) : netWpm >= 60 ? (
              <span aria-hidden="true" className="text-2xl">
                ⚡
              </span>
            ) : (
              <svg
                aria-hidden="true"
                className="size-7"
                fill="none"
                stroke="currentColor"
                strokeWidth={2.5}
                viewBox="0 0 24 24"
              >
                <path
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </div>

          <div className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-accent/40 bg-accent/10 px-3 py-0.5 text-xs font-semibold tracking-wide text-accent">
            <span>{celebrationTitle}</span>
            {isPersonalBest && <span>🏆</span>}
          </div>

          <h2
            className="font-display text-2xl font-semibold tracking-tight text-ink sm:text-3xl"
            id="session-summary-title"
          >
            {ft.modal.title}
          </h2>
          <p className="mt-1 text-sm text-muted" id="session-summary-desc">
            {ft.modal.summarySubtitle}
          </p>
        </div>

        {/* Primary Metrics */}
        <div className="my-6 grid grid-cols-2 gap-4 rounded-2xl border border-line bg-paper p-5 shadow-xs">
          <div className="text-center">
            <dt className="text-xs font-bold tracking-widest text-muted uppercase">
              {ft.stats.netWpm}
            </dt>
            <dd className="mt-1 font-display text-4xl font-semibold text-ink">
              {Math.round(netWpm)}
            </dd>
          </div>
          <div className="text-center">
            <dt className="text-xs font-bold tracking-widest text-muted uppercase">
              {ft.stats.accuracy}
            </dt>
            <dd className="mt-1 font-display text-4xl font-semibold text-accent">
              {Math.round(accuracy)}%
            </dd>
          </div>
        </div>

        {/* Secondary Metrics */}
        <dl className="grid grid-cols-4 gap-2 rounded-2xl border border-line bg-paper/60 p-4 text-center">
          <div>
            <dt className="text-[10px] font-bold tracking-wider text-muted uppercase">
              {ft.stats.grossWpm}
            </dt>
            <dd className="mt-0.5 font-display text-lg font-medium text-ink">
              {Math.round(grossWpm)}
            </dd>
          </div>
          <div>
            <dt className="text-[10px] font-bold tracking-wider text-muted uppercase">
              {bestStreak !== undefined && bestStreak > 0
                ? ft.controls.bestStreak
                : ft.stats.characters}
            </dt>
            <dd className="mt-0.5 font-display text-lg font-medium text-ink">
              {bestStreak !== undefined && bestStreak > 0
                ? `🔥 ${bestStreak}`
                : characterCount}
            </dd>
          </div>
          <div>
            <dt className="text-[10px] font-bold tracking-wider text-muted uppercase">
              {ft.stats.errors}
            </dt>
            <dd className="mt-0.5 font-display text-lg font-medium text-error">
              {errorCount}
            </dd>
          </div>
          <div>
            <dt className="text-[10px] font-bold tracking-wider text-muted uppercase">
              {ft.stats.elapsed}
            </dt>
            <dd className="mt-0.5 font-display text-lg font-medium text-ink">
              {timeFormatted}
            </dd>
          </div>
        </dl>

        {/* Actions */}
        <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          {onClose && (
            <button
              className="rounded-full border border-line px-5 py-2.5 text-sm font-semibold text-muted transition-colors hover:border-ink hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              onClick={onClose}
              type="button"
            >
              {ft.modal.close}
            </button>
          )}
          {onChangeSetup && (
            <button
              className="rounded-full border border-line bg-paper px-5 py-2.5 text-sm font-semibold text-ink transition-colors hover:border-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              onClick={onChangeSetup}
              type="button"
            >
              {ft.modal.changeSetup}
            </button>
          )}
          {onRetry && (
            <button
              className="rounded-full bg-ink px-6 py-2.5 text-sm font-semibold text-paper shadow-md transition-transform hover:opacity-90 active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              onClick={onRetry}
              ref={primaryButtonRef}
              type="button"
            >
              {ft.modal.practiceAgain}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
