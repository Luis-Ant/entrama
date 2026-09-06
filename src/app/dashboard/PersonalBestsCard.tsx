import type { FC } from "react";
import type {
  TypingSessionRecord,
  UiLocale,
} from "../../onboarding/repositories";
import { getTranslation } from "../i18n";
import {
  calculatePersonalBests,
  formatPracticeDuration,
  type PersonalBestsStats,
} from "./dashboardModel";

export interface PersonalBestsCardProps {
  readonly stats?: PersonalBestsStats;
  readonly sessions?: readonly TypingSessionRecord[];
  readonly locale?: UiLocale;
}

export const PersonalBestsCard: FC<PersonalBestsCardProps> = ({
  stats,
  sessions,
  locale = "en",
}) => {
  const t = getTranslation(locale);
  const effectiveStats = stats ?? calculatePersonalBests(sessions ?? []);

  const numberFormatter = new Intl.NumberFormat(
    locale === "es" ? "es-ES" : "en-US",
  );

  return (
    <section
      aria-labelledby="personal-bests-heading"
      className="rounded-2xl border border-line bg-panel p-6 shadow-xs sm:p-8"
      data-testid="personal-bests-card"
    >
      <div className="mb-6 flex items-center justify-between">
        <h2
          className="font-display text-lg font-bold tracking-tight text-ink sm:text-xl"
          id="personal-bests-heading"
        >
          {t.dashboard.personalBestsTitle}
        </h2>
        <span className="rounded-full bg-paper px-3 py-1 text-xs font-semibold text-muted border border-line">
          {effectiveStats.totalSessions}{" "}
          {effectiveStats.totalSessions === 1
            ? locale === "es"
              ? "sesión"
              : "session"
            : locale === "es"
              ? "sesiones"
              : "sessions"}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5 sm:gap-6">
        {/* Highest Net WPM */}
        <div
          className="flex flex-col justify-between rounded-xl border border-line bg-paper/60 p-4 transition-colors"
          data-testid="stat-highest-wpm"
        >
          <dt className="text-xs font-semibold tracking-wider text-muted uppercase">
            {t.dashboard.stats.highestNetWpm}
          </dt>
          <dd className="mt-2 font-display text-2xl font-bold text-accent sm:text-3xl">
            {effectiveStats.highestNetWpm > 0
              ? effectiveStats.highestNetWpm
              : "--"}
            {effectiveStats.highestNetWpm > 0 && (
              <span className="ml-1 text-xs font-normal text-muted">
                {locale === "es" ? "PPM" : "WPM"}
              </span>
            )}
          </dd>
        </div>

        {/* Best Accuracy */}
        <div
          className="flex flex-col justify-between rounded-xl border border-line bg-paper/60 p-4 transition-colors"
          data-testid="stat-best-accuracy"
        >
          <dt className="text-xs font-semibold tracking-wider text-muted uppercase">
            {t.dashboard.stats.bestAccuracy}
          </dt>
          <dd className="mt-2 font-display text-2xl font-bold text-ink sm:text-3xl">
            {effectiveStats.bestAccuracy > 0
              ? `${effectiveStats.bestAccuracy}%`
              : "--"}
          </dd>
        </div>

        {/* Total Words */}
        <div
          className="flex flex-col justify-between rounded-xl border border-line bg-paper/60 p-4 transition-colors"
          data-testid="stat-total-words"
        >
          <dt className="text-xs font-semibold tracking-wider text-muted uppercase">
            {t.dashboard.stats.totalWords}
          </dt>
          <dd className="mt-2 font-display text-2xl font-bold text-ink sm:text-3xl">
            {numberFormatter.format(effectiveStats.totalWords)}
          </dd>
        </div>

        {/* Practice Time */}
        <div
          className="flex flex-col justify-between rounded-xl border border-line bg-paper/60 p-4 transition-colors"
          data-testid="stat-practice-time"
        >
          <dt className="text-xs font-semibold tracking-wider text-muted uppercase">
            {t.dashboard.stats.totalPracticeTime}
          </dt>
          <dd className="mt-2 font-display text-2xl font-bold text-ink sm:text-3xl">
            {formatPracticeDuration(effectiveStats.totalPracticeTime)}
          </dd>
        </div>

        {/* Completed Sessions */}
        <div
          className="flex flex-col justify-between rounded-xl border border-line bg-paper/60 p-4 transition-colors col-span-2 sm:col-span-1"
          data-testid="stat-total-sessions"
        >
          <dt className="text-xs font-semibold tracking-wider text-muted uppercase">
            {t.dashboard.stats.totalSessions}
          </dt>
          <dd className="mt-2 font-display text-2xl font-bold text-ink sm:text-3xl">
            {numberFormatter.format(effectiveStats.totalSessions)}
          </dd>
        </div>
      </div>
    </section>
  );
};
