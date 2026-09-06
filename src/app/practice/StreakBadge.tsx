import type { UiLocale } from "../../onboarding/repositories";
import {
  getStreakMilestone,
  type StreakMilestone,
  type StreakTier,
} from "./practiceDelightModel";

export type { StreakMilestone, StreakTier };

export interface StreakBadgeProps {
  readonly streak: number;
  readonly locale?: UiLocale;
  readonly className?: string;
}

export function StreakBadge({
  streak,
  locale = "en",
  className = "",
}: StreakBadgeProps) {
  const milestone = getStreakMilestone(streak, locale);
  const isHighStreak = streak >= 25;

  return (
    <div
      aria-label={`Accuracy streak: ${streak}`}
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 font-display text-xs font-semibold tracking-wide transition-all duration-200 motion-reduce:transition-none ${milestone.colorClass} ${
        isHighStreak ? "scale-105" : ""
      } ${className}`}
      data-milestone={milestone.tier}
      data-streak={streak.toString()}
      data-testid="streak-badge"
      data-tier={milestone.tier}
    >
      {milestone.icon && (
        <span aria-hidden="true" className="text-sm leading-none">
          {milestone.icon}
        </span>
      )}
      <span>{milestone.label}</span>
    </div>
  );
}
