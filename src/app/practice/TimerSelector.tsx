import { getTranslation } from "../i18n";
import { TIMER_PRESETS, type TimerPreset } from "../../typing/free-practice";
import type { UiLocale } from "../../onboarding/repositories";

export interface TimerSelectorProps {
  readonly selectedPreset: TimerPreset;
  readonly onSelectPreset: (preset: TimerPreset) => void;
  readonly locale?: UiLocale;
  readonly disabled?: boolean;
}

export function TimerSelector({
  selectedPreset,
  onSelectPreset,
  locale = "en",
  disabled = false,
}: TimerSelectorProps) {
  const t = getTranslation(locale);
  const ft = t.freeTyping;

  const presetLabels: Record<string, string> = {
    "30": ft.timers.seconds30,
    "60": ft.timers.seconds60,
    "120": ft.timers.seconds120,
    free: ft.timers.free,
  };

  return (
    <div
      aria-label="Timer duration presets"
      className="flex flex-wrap items-center gap-2"
      role="group"
    >
      <span className="mr-1 text-xs font-bold tracking-widest text-muted uppercase">
        {ft.stats.time}:
      </span>
      {TIMER_PRESETS.map((preset) => {
        const isSelected = preset === selectedPreset;
        const key = preset === null ? "free" : String(preset);
        const label = presetLabels[key];

        return (
          <button
            aria-pressed={isSelected}
            className={`rounded-full px-3 py-1 text-xs font-semibold transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
              isSelected
                ? "bg-ink text-paper shadow-sm"
                : "border border-line bg-panel text-muted hover:border-ink/40 hover:text-ink"
            } ${disabled ? "cursor-not-allowed opacity-50" : ""}`}
            disabled={disabled}
            key={key}
            onClick={() => onSelectPreset(preset)}
            type="button"
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
