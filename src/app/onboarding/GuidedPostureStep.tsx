import { useState } from "react";
import type { UiLocale } from "../../onboarding/repositories";
import { getTranslation } from "../i18n";

export interface GuidedPostureStepProps {
  readonly locale: UiLocale;
  readonly onConfirm: () => void;
}

type CheckpointKey = "back" | "feet" | "elbows" | "wrists";

const CHECKPOINT_KEYS: readonly CheckpointKey[] = [
  "back",
  "feet",
  "elbows",
  "wrists",
];

function PostureIcon({ kind }: { kind: CheckpointKey }) {
  switch (kind) {
    case "back":
      return (
        <svg
          aria-hidden="true"
          className="size-6 text-accent"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          {/* Straight spine / torso */}
          <path d="M12 3v18" />
          <path d="M8 8h8" />
          <path d="M7 13h10" />
          <path d="M8 18h8" />
          <circle cx="12" cy="3" fill="currentColor" r="1.5" />
        </svg>
      );
    case "feet":
      return (
        <svg
          aria-hidden="true"
          className="size-6 text-accent"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          {/* Feet flat on floor */}
          <path d="M4 20h16" />
          <path d="M7 16l2-8h4l2 8" />
          <path d="M6 20c0-2 2-4 5-4h2c3 0 5 2 5 4" />
        </svg>
      );
    case "elbows":
      return (
        <svg
          aria-hidden="true"
          className="size-6 text-accent"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          {/* 90 degree elbow */}
          <path d="M6 4v8a4 4 0 0 0 4 4h8" />
          <polyline points="15 13 18 16 15 19" />
        </svg>
      );
    case "wrists":
      return (
        <svg
          aria-hidden="true"
          className="size-6 text-accent"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          {/* Neutral wrists */}
          <path d="M3 12h18" />
          <rect height="8" rx="2" width="10" x="7" y="8" />
          <path d="M10 8v8" />
          <path d="M14 8v8" />
        </svg>
      );
    default:
      return null;
  }
}

export function GuidedPostureStep({
  locale,
  onConfirm,
}: GuidedPostureStepProps) {
  const t = getTranslation(locale).guided.posture;
  const isEs = locale === "es";
  const [checkedMap, setCheckedMap] = useState<Record<CheckpointKey, boolean>>({
    back: false,
    feet: false,
    elbows: false,
    wrists: false,
  });

  const confirmedCount = CHECKPOINT_KEYS.filter(
    (key) => checkedMap[key],
  ).length;
  const isAllConfirmed = confirmedCount === CHECKPOINT_KEYS.length;

  const handleToggle = (key: CheckpointKey) => {
    setCheckedMap((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSelectAll = () => {
    setCheckedMap({
      back: true,
      feet: true,
      elbows: true,
      wrists: true,
    });
  };

  return (
    <section
      aria-labelledby="posture-heading"
      className="mx-auto max-w-2xl p-6 sm:p-10"
    >
      <div className="mb-6 text-center sm:text-left">
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
          <p className="text-xs font-bold tracking-[0.2em] text-accent uppercase">
            {t.progress(confirmedCount, CHECKPOINT_KEYS.length)}
          </p>
          {/* Progress bar pill */}
          <div className="flex items-center gap-1.5">
            {CHECKPOINT_KEYS.map((key) => (
              <span
                className={`h-1.5 w-6 rounded-full transition-all duration-300 ${
                  checkedMap[key] ? "bg-accent" : "bg-line"
                }`}
                key={`pill-${key}`}
              />
            ))}
          </div>
        </div>

        <h1
          className="font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl"
          id="posture-heading"
        >
          {t.title}
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          {t.description}
        </p>
      </div>

      <div className="rounded-3xl border border-line bg-panel p-6 shadow-[0_24px_70px_-45px_rgba(23,33,27,0.55)] sm:p-8">
        <div className="grid gap-4 sm:grid-cols-2">
          {CHECKPOINT_KEYS.map((key) => {
            const cp = t.checkpoints[key];
            const isChecked = checkedMap[key];

            return (
              <label
                className={`group relative flex cursor-pointer select-none items-start gap-4 rounded-2xl border p-4 transition-all duration-200 ${
                  isChecked
                    ? "border-accent bg-highlight/60 text-ink shadow-xs"
                    : "border-line bg-paper text-ink hover:border-line/80 hover:bg-panel"
                }`}
                key={key}
              >
                <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-xl border border-line bg-paper shadow-xs group-hover:scale-105 transition-transform">
                  <PostureIcon kind={key} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-display text-base font-semibold text-ink">
                      {cp.title}
                    </h3>
                    <input
                      aria-label={cp.title}
                      checked={isChecked}
                      className="size-5 rounded border-line text-accent accent-accent focus:ring-accent"
                      onChange={() => handleToggle(key)}
                      type="checkbox"
                    />
                  </div>
                  <p className="mt-1 text-xs leading-relaxed text-muted">
                    {cp.description}
                  </p>
                </div>
              </label>
            );
          })}
        </div>

        <div className="mt-8 flex flex-col items-center justify-between gap-4 border-t border-line pt-6 sm:flex-row">
          <div className="flex items-center gap-3">
            <p className="text-xs font-medium text-muted">
              {t.progress(confirmedCount, CHECKPOINT_KEYS.length)}
            </p>
            {!isAllConfirmed && (
              <button
                className="text-xs font-semibold text-accent underline decoration-line underline-offset-4 hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                onClick={handleSelectAll}
                type="button"
              >
                {isEs ? "Marcar todos" : "Check all"}
              </button>
            )}
          </div>

          <div className="flex w-full items-center justify-end gap-4 sm:w-auto">
            <button
              className="text-xs font-semibold text-muted underline decoration-line underline-offset-4 hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              onClick={onConfirm}
              type="button"
            >
              {isEs ? "Omitir (Bypass)" : "Skip Posture (Bypass)"}
            </button>
            <button
              className={`w-full rounded-full px-6 py-3 text-sm font-semibold transition-all sm:w-auto ${
                isAllConfirmed
                  ? "bg-ink text-paper hover:bg-ink/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                  : "cursor-not-allowed bg-line/60 text-muted"
              }`}
              disabled={!isAllConfirmed}
              onClick={onConfirm}
              type="button"
            >
              {t.confirmButton}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
