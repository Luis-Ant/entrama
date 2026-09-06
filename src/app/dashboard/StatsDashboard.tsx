import { useCallback, useEffect, useMemo, useState, type FC } from "react";
import type {
  TypingSessionRecord,
  TypingSessionRepository,
  UiLocale,
} from "../../onboarding/repositories";
import { DexieTypingSessionRepository } from "../../storage-dexie/repositories";
import type { CatalogCategory } from "../../typing/catalogs";
import { getTranslation } from "../i18n";
import { deriveSessionBadges, formatSessionDate } from "./dashboardModel";
import { PersonalBestsCard } from "./PersonalBestsCard";

export interface StatsDashboardProps {
  readonly profileId?: string;
  readonly typingSessionRepository?: TypingSessionRepository;
  readonly locale?: UiLocale;
  readonly onStartPractice?: () => void;
}

type FilterCategory = CatalogCategory | "all";

export const StatsDashboard: FC<StatsDashboardProps> = ({
  profileId = "guest",
  typingSessionRepository,
  locale = "en",
  onStartPractice,
}) => {
  const t = getTranslation(locale);
  const defaultRepo = useMemo(() => new DexieTypingSessionRepository(), []);
  const repo = typingSessionRepository ?? defaultRepo;

  const [sessions, setSessions] = useState<readonly TypingSessionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] =
    useState<FilterCategory>("all");
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const refreshSessions = useCallback(async () => {
    try {
      const records = await repo.listRecentSessions(profileId, 100);
      setSessions(records);
    } catch {
      setSessions([]);
    } finally {
      setLoading(false);
    }
  }, [repo, profileId]);

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const records = await repo.listRecentSessions(profileId, 100);
        if (!active) return;
        setSessions(records);
      } catch {
        if (!active) return;
        setSessions([]);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }
    void load();
    return () => {
      active = false;
    };
  }, [repo, profileId]);

  const filteredSessions = useMemo(() => {
    if (selectedCategory === "all") return sessions;
    return sessions.filter((s) => s.category === selectedCategory);
  }, [sessions, selectedCategory]);

  const handleExportData = () => {
    try {
      const exportJson = JSON.stringify(sessions, null, 2);
      if (typeof window !== "undefined" && typeof document !== "undefined") {
        const blob = new Blob([exportJson], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `entrama-sessions-${profileId}-${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
      setFeedback(t.dashboard.actions.exportSuccess);
      setTimeout(() => setFeedback(null), 3000);
    } catch {
      setFeedback("Export failed.");
      setTimeout(() => setFeedback(null), 3000);
    }
  };

  const handleClearHistory = async () => {
    if (repo.clearSessions) {
      await repo.clearSessions(profileId);
    }
    setShowClearConfirm(false);
    await refreshSessions();
    setFeedback(t.dashboard.actions.clearSuccess);
    setTimeout(() => setFeedback(null), 3000);
  };

  const categories: readonly { id: FilterCategory; label: string }[] = [
    { id: "all", label: t.dashboard.filterAll },
    { id: "stories", label: t.dashboard.filterStories },
    { id: "technology", label: t.dashboard.filterTechnology },
    { id: "literature", label: t.dashboard.filterLiterature },
    { id: "code", label: t.dashboard.filterCode },
  ];

  return (
    <div className="flex flex-col gap-8 pb-12" data-testid="stats-dashboard">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">
              {t.dashboard.title}
            </h1>
            <p className="mt-1 text-sm text-muted">{t.dashboard.subtitle}</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              data-testid="export-json-button"
              onClick={handleExportData}
              disabled={sessions.length === 0}
              className="rounded-lg border border-line bg-paper px-3.5 py-2 text-xs font-semibold text-ink transition-colors hover:bg-panel focus-visible:outline-2 focus-visible:outline-accent disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              {t.dashboard.actions.exportData}
            </button>
            <button
              type="button"
              data-testid="clear-history-button"
              onClick={() => setShowClearConfirm(true)}
              disabled={sessions.length === 0}
              className="rounded-lg border border-error/30 bg-error-soft/20 px-3.5 py-2 text-xs font-semibold text-error transition-colors hover:bg-error-soft/40 focus-visible:outline-2 focus-visible:outline-error disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              {t.dashboard.actions.clearData}
            </button>
          </div>
        </div>

        {feedback && (
          <div
            role="status"
            className="mt-2 rounded-lg border border-accent/30 bg-accent/10 px-4 py-2 text-xs font-medium text-ink transition-all"
            data-testid="feedback-message"
          >
            {feedback}
          </div>
        )}

        {/* Clear Confirmation Modal / Banner */}
        {showClearConfirm && (
          <div
            role="alertdialog"
            aria-labelledby="clear-confirm-title"
            aria-describedby="clear-confirm-desc"
            className="mt-2 rounded-xl border border-error/40 bg-paper p-4 shadow-md"
            data-testid="clear-confirmation-dialog"
          >
            <h3 id="clear-confirm-title" className="text-sm font-bold text-ink">
              {t.dashboard.actions.clearData}
            </h3>
            <p id="clear-confirm-desc" className="mt-1 text-xs text-muted">
              {t.dashboard.actions.confirmClear}
            </p>
            <div className="mt-4 flex items-center gap-3">
              <button
                type="button"
                data-testid="confirm-clear-button"
                onClick={() => void handleClearHistory()}
                className="rounded-md bg-error px-3 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-error/90 cursor-pointer"
              >
                {t.dashboard.actions.clearData}
              </button>
              <button
                type="button"
                data-testid="cancel-clear-button"
                onClick={() => setShowClearConfirm(false)}
                className="rounded-md border border-line bg-paper px-3 py-1.5 text-xs font-semibold text-muted hover:text-ink cursor-pointer"
              >
                {t.dashboard.actions.cancelClear}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Personal Bests & Totals Card */}
      <PersonalBestsCard sessions={sessions} locale={locale} />

      {/* Category Breakdown & Session History Table */}
      <section
        aria-labelledby="history-heading"
        className="flex flex-col gap-5"
      >
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2
            id="history-heading"
            className="font-display text-xl font-bold tracking-tight text-ink"
          >
            {t.dashboard.historyTitle}
          </h2>

          {/* Category Filter Tabs */}
          <div
            role="tablist"
            aria-label="Category filter tabs"
            className="flex flex-wrap gap-1 rounded-xl border border-line bg-panel p-1 text-xs font-semibold"
          >
            {categories.map((cat) => {
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  role="tab"
                  aria-selected={isSelected}
                  data-testid={`filter-${cat.id}`}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`rounded-lg px-3 py-1.5 transition-colors cursor-pointer ${
                    isSelected
                      ? "bg-ink font-bold text-paper shadow-xs"
                      : "text-muted hover:text-ink hover:bg-paper/50"
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Loading state */}
        {loading ? (
          <div className="rounded-2xl border border-line bg-panel p-12 text-center text-sm text-muted">
            Loading session history...
          </div>
        ) : sessions.length === 0 ? (
          /* Empty State */
          <div
            className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-line bg-panel/50 p-12 text-center"
            data-testid="dashboard-empty-state"
          >
            <div className="mb-4 grid size-12 place-items-center rounded-full bg-paper border border-line text-xl">
              ⌨️
            </div>
            <h3 className="font-display text-lg font-bold text-ink">
              {t.dashboard.emptyState.title}
            </h3>
            <p className="mt-1 max-w-md text-xs leading-relaxed text-muted">
              {t.dashboard.emptyState.description}
            </p>
            {onStartPractice && (
              <button
                type="button"
                data-testid="empty-state-cta-button"
                onClick={onStartPractice}
                className="mt-5 rounded-full bg-accent px-5 py-2.5 text-xs font-bold text-white shadow-sm transition-transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
              >
                {t.dashboard.emptyState.cta}
              </button>
            )}
          </div>
        ) : filteredSessions.length === 0 ? (
          <div
            className="rounded-2xl border border-line bg-panel p-8 text-center text-sm text-muted"
            data-testid="no-category-sessions"
          >
            No sessions recorded in this category.
          </div>
        ) : (
          /* Sessions Table */
          <div className="overflow-x-auto rounded-2xl border border-line bg-panel shadow-xs">
            <table
              className="w-full text-left text-xs border-collapse"
              data-testid="sessions-history-table"
            >
              <thead>
                <tr className="border-b border-line bg-paper/60 text-[11px] font-bold uppercase tracking-wider text-muted">
                  <th scope="col" className="px-5 py-3.5">
                    {t.dashboard.table.date}
                  </th>
                  <th scope="col" className="px-5 py-3.5">
                    {t.dashboard.table.category}
                  </th>
                  <th scope="col" className="px-5 py-3.5">
                    {t.dashboard.table.duration}
                  </th>
                  <th scope="col" className="px-5 py-3.5">
                    {t.dashboard.table.netWpm}
                  </th>
                  <th scope="col" className="px-5 py-3.5">
                    {t.dashboard.table.grossWpm}
                  </th>
                  <th scope="col" className="px-5 py-3.5">
                    {t.dashboard.table.accuracy}
                  </th>
                  <th scope="col" className="px-5 py-3.5">
                    {t.dashboard.table.errors}
                  </th>
                  <th scope="col" className="px-5 py-3.5">
                    {t.dashboard.table.badges}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line/60">
                {filteredSessions.map((session) => {
                  const badges = deriveSessionBadges(session, locale);
                  const categoryName =
                    t.freeTyping.categories[session.category] ||
                    session.category;
                  const sessionTime =
                    session.timestamp ?? session.completedAt ?? 0;

                  return (
                    <tr
                      key={session.id}
                      className="transition-colors hover:bg-paper/40"
                      data-testid={`session-row-${session.id}`}
                    >
                      <td className="px-5 py-4 font-medium text-ink whitespace-nowrap">
                        {formatSessionDate(sessionTime, locale)}
                      </td>
                      <td className="px-5 py-4 font-semibold text-ink capitalize whitespace-nowrap">
                        <span className="rounded-md bg-paper px-2 py-1 border border-line">
                          {categoryName}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-muted whitespace-nowrap">
                        {session.elapsedSeconds}s
                      </td>
                      <td className="px-5 py-4 font-display text-sm font-bold text-accent whitespace-nowrap">
                        {session.netWpm}
                      </td>
                      <td className="px-5 py-4 text-muted whitespace-nowrap">
                        {session.grossWpm}
                      </td>
                      <td className="px-5 py-4 font-semibold text-ink whitespace-nowrap">
                        {session.accuracy}%
                      </td>
                      <td className="px-5 py-4 text-muted whitespace-nowrap">
                        {session.errorCount}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex flex-wrap gap-1">
                          {badges.length > 0 ? (
                            badges.map((badge) => (
                              <span
                                key={badge.id}
                                className={`rounded px-1.5 py-0.5 text-[10px] font-bold tracking-wide uppercase ${
                                  badge.variant === "accent"
                                    ? "bg-accent/15 text-accent border border-accent/30"
                                    : badge.variant === "success"
                                      ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                                      : badge.variant === "warning"
                                        ? "bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30"
                                        : badge.variant === "info"
                                          ? "bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/30"
                                          : "bg-muted/15 text-muted border border-muted/30"
                                }`}
                              >
                                {badge.label}
                              </span>
                            ))
                          ) : (
                            <span className="text-[11px] text-muted/60">
                              {t.dashboard.table.noBadges}
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
};
