// @vitest-environment happy-dom
import "fake-indexeddb/auto";
import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type {
  TypingSessionRecord,
  TypingSessionRepository,
} from "../../onboarding/repositories";
import {
  calculatePersonalBests,
  formatPracticeDuration,
} from "./dashboardModel";
import { PersonalBestsCard } from "./PersonalBestsCard";
import { StatsDashboard } from "./StatsDashboard";

(
  globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;

const SAMPLE_SESSIONS: readonly TypingSessionRecord[] = [
  {
    id: "session-1",
    profileId: "guest",
    timestamp: 1690000000000,
    category: "stories",
    locale: "en",
    durationPreset: 30,
    presetSeconds: 30,
    netWpm: 65.4,
    grossWpm: 68.0,
    accuracy: 98.5,
    characterCount: 200,
    errorCount: 1,
    elapsedSeconds: 30,
  },
  {
    id: "session-2",
    profileId: "guest",
    timestamp: 1690003600000,
    category: "technology",
    locale: "en",
    durationPreset: 60,
    presetSeconds: 60,
    netWpm: 82.1,
    grossWpm: 84.0,
    accuracy: 100,
    characterCount: 500,
    errorCount: 0,
    elapsedSeconds: 60,
  },
  {
    id: "session-3",
    profileId: "guest",
    timestamp: 1690007200000,
    category: "code",
    locale: "es",
    durationPreset: null,
    presetSeconds: null,
    netWpm: 45.0,
    grossWpm: 50.0,
    accuracy: 92.0,
    characterCount: 300,
    errorCount: 4,
    elapsedSeconds: 45,
  },
];

class MockTypingSessionRepository implements TypingSessionRepository {
  private sessions: TypingSessionRecord[] = [];

  constructor(initial: readonly TypingSessionRecord[] = []) {
    this.sessions = [...initial];
  }

  async saveSession(record: TypingSessionRecord): Promise<void> {
    this.sessions.push(record);
  }

  async listRecentSessions(
    profileId?: string,
    limit?: number,
  ): Promise<readonly TypingSessionRecord[]> {
    const list = profileId
      ? this.sessions.filter((s) => s.profileId === profileId)
      : this.sessions;
    return limit && limit > 0 ? list.slice(0, limit) : list;
  }

  async getRecentSessions(
    profileId?: string,
    limit?: number,
  ): Promise<readonly TypingSessionRecord[]> {
    return this.listRecentSessions(profileId, limit);
  }

  async clearSessions(profileId?: string): Promise<void> {
    if (profileId) {
      this.sessions = this.sessions.filter((s) => s.profileId !== profileId);
    } else {
      this.sessions = [];
    }
  }
}

describe("Dashboard: PersonalBestsCard & Calculations", () => {
  it("calculates personal bests from empty sessions safely", () => {
    const stats = calculatePersonalBests([]);
    expect(stats).toEqual({
      highestNetWpm: 0,
      bestAccuracy: 0,
      totalWords: 0,
      totalPracticeTime: 0,
      totalSessions: 0,
    });
  });

  it("calculates personal bests from multiple sessions accurately", () => {
    const stats = calculatePersonalBests(SAMPLE_SESSIONS);
    expect(stats.highestNetWpm).toBe(82.1);
    expect(stats.bestAccuracy).toBe(100);
    // Total characters = 200 + 500 + 300 = 1000 => 1000 / 5 = 200 words
    expect(stats.totalWords).toBe(200);
    // Total practice time = 30 + 60 + 45 = 135s
    expect(stats.totalPracticeTime).toBe(135);
    expect(stats.totalSessions).toBe(3);
  });

  it("formats practice duration correctly across seconds, minutes, and hours", () => {
    expect(formatPracticeDuration(0)).toBe("0s");
    expect(formatPracticeDuration(45)).toBe("45s");
    expect(formatPracticeDuration(135)).toBe("2m 15s");
    expect(formatPracticeDuration(3665)).toBe("1h 1m");
  });
});

describe("Dashboard UI Components", () => {
  let container: HTMLDivElement | null = null;
  let root: ReturnType<typeof createRoot> | null = null;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    if (root) act(() => root?.unmount());
    if (container) container.remove();
    container = null;
    root = null;
  });

  async function flush() {
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 20));
    });
  }

  describe("PersonalBestsCard", () => {
    it("renders empty state metrics when no sessions provided", async () => {
      await act(async () => {
        root?.render(<PersonalBestsCard sessions={[]} locale="en" />);
      });
      await flush();

      expect(container?.textContent).toContain("Personal Bests & Totals");
      expect(
        container?.querySelector("[data-testid='stat-highest-wpm']")
          ?.textContent,
      ).toContain("--");
      expect(
        container?.querySelector("[data-testid='stat-best-accuracy']")
          ?.textContent,
      ).toContain("--");
      expect(
        container?.querySelector("[data-testid='stat-total-words']")
          ?.textContent,
      ).toContain("0");
      expect(
        container?.querySelector("[data-testid='stat-practice-time']")
          ?.textContent,
      ).toContain("0s");
      expect(
        container?.querySelector("[data-testid='stat-total-sessions']")
          ?.textContent,
      ).toContain("0");
    });

    it("renders populated stats in English", async () => {
      await act(async () => {
        root?.render(
          <PersonalBestsCard sessions={SAMPLE_SESSIONS} locale="en" />,
        );
      });
      await flush();

      expect(
        container?.querySelector("[data-testid='stat-highest-wpm']")
          ?.textContent,
      ).toContain("82.1");
      expect(
        container?.querySelector("[data-testid='stat-highest-wpm']")
          ?.textContent,
      ).toContain("WPM");
      expect(
        container?.querySelector("[data-testid='stat-best-accuracy']")
          ?.textContent,
      ).toContain("100%");
      expect(
        container?.querySelector("[data-testid='stat-total-words']")
          ?.textContent,
      ).toContain("200");
      expect(
        container?.querySelector("[data-testid='stat-practice-time']")
          ?.textContent,
      ).toContain("2m 15s");
      expect(
        container?.querySelector("[data-testid='stat-total-sessions']")
          ?.textContent,
      ).toContain("3");
    });

    it("renders populated stats in Spanish", async () => {
      await act(async () => {
        root?.render(
          <PersonalBestsCard sessions={SAMPLE_SESSIONS} locale="es" />,
        );
      });
      await flush();

      expect(container?.textContent).toContain("Récords Personales y Totales");
      expect(
        container?.querySelector("[data-testid='stat-highest-wpm']")
          ?.textContent,
      ).toContain("PPM");
      expect(container?.textContent).toContain("3 sesiones");
    });
  });

  describe("StatsDashboard", () => {
    it("renders empty state and invokes onStartPractice when CTA clicked", async () => {
      const emptyRepo = new MockTypingSessionRepository([]);
      const onStartPractice = vi.fn();

      await act(async () => {
        root?.render(
          <StatsDashboard
            profileId="guest"
            typingSessionRepository={emptyRepo}
            locale="en"
            onStartPractice={onStartPractice}
          />,
        );
      });
      await flush();

      expect(container?.textContent).toContain("Performance & Statistics");
      expect(container?.textContent).toContain("No typing sessions yet");

      const ctaBtn = container?.querySelector(
        "[data-testid='empty-state-cta-button']",
      ) as HTMLButtonElement;
      expect(ctaBtn).not.toBeNull();

      await act(async () => {
        ctaBtn.click();
      });
      await flush();

      expect(onStartPractice).toHaveBeenCalledTimes(1);
    });

    it("renders populated table with session rows and performance badges", async () => {
      const repo = new MockTypingSessionRepository(SAMPLE_SESSIONS);

      await act(async () => {
        root?.render(
          <StatsDashboard
            profileId="guest"
            typingSessionRepository={repo}
            locale="en"
          />,
        );
      });
      await flush();

      expect(container?.textContent).toContain("Session History");
      const table = container?.querySelector(
        "[data-testid='sessions-history-table']",
      );
      expect(table).not.toBeNull();

      // Check session 2 with 100% accuracy and 82.1 WPM has Flawless & Blazing badges
      const row2 = container?.querySelector(
        "[data-testid='session-row-session-2']",
      );
      expect(row2?.textContent).toContain("82.1");
      expect(row2?.textContent).toContain("100%");
      expect(row2?.textContent).toContain("Flawless");
      expect(row2?.textContent).toContain("Blazing");

      // Check session 1 with 98.5% accuracy has High Accuracy & Fast
      const row1 = container?.querySelector(
        "[data-testid='session-row-session-1']",
      );
      expect(row1?.textContent).toContain("65.4");
      expect(row1?.textContent).toContain("High Accuracy");
      expect(row1?.textContent).toContain("Fast");
    });

    it("filters sessions by category tab", async () => {
      const repo = new MockTypingSessionRepository(SAMPLE_SESSIONS);

      await act(async () => {
        root?.render(
          <StatsDashboard
            profileId="guest"
            typingSessionRepository={repo}
            locale="en"
          />,
        );
      });
      await flush();

      // Click "Stories" filter tab
      const storiesTab = container?.querySelector(
        "[data-testid='filter-stories']",
      ) as HTMLButtonElement;
      expect(storiesTab).not.toBeNull();

      await act(async () => {
        storiesTab.click();
      });
      await flush();

      expect(
        container?.querySelector("[data-testid='session-row-session-1']"),
      ).not.toBeNull();
      expect(
        container?.querySelector("[data-testid='session-row-session-2']"),
      ).toBeNull();
      expect(
        container?.querySelector("[data-testid='session-row-session-3']"),
      ).toBeNull();

      // Click "Literature" filter tab (no sessions)
      const litTab = container?.querySelector(
        "[data-testid='filter-literature']",
      ) as HTMLButtonElement;
      await act(async () => {
        litTab.click();
      });
      await flush();

      expect(
        container?.querySelector("[data-testid='no-category-sessions']"),
      ).not.toBeNull();
    });

    it("handles export data action", async () => {
      const repo = new MockTypingSessionRepository(SAMPLE_SESSIONS);

      await act(async () => {
        root?.render(
          <StatsDashboard
            profileId="guest"
            typingSessionRepository={repo}
            locale="en"
          />,
        );
      });
      await flush();

      const exportBtn = container?.querySelector(
        "[data-testid='export-json-button']",
      ) as HTMLButtonElement;
      expect(exportBtn).not.toBeNull();
      expect(exportBtn.disabled).toBe(false);

      await act(async () => {
        exportBtn.click();
      });
      await flush();

      expect(
        container?.querySelector("[data-testid='feedback-message']")
          ?.textContent,
      ).toContain("Session data exported");
    });

    it("handles clear history confirmation flow", async () => {
      const repo = new MockTypingSessionRepository(SAMPLE_SESSIONS);

      await act(async () => {
        root?.render(
          <StatsDashboard
            profileId="guest"
            typingSessionRepository={repo}
            locale="en"
          />,
        );
      });
      await flush();

      const clearBtn = container?.querySelector(
        "[data-testid='clear-history-button']",
      ) as HTMLButtonElement;
      expect(clearBtn).not.toBeNull();

      // Click Clear History -> shows dialog
      await act(async () => {
        clearBtn.click();
      });
      await flush();

      expect(
        container?.querySelector("[data-testid='clear-confirmation-dialog']"),
      ).not.toBeNull();

      // Click confirm clear
      const confirmBtn = container?.querySelector(
        "[data-testid='confirm-clear-button']",
      ) as HTMLButtonElement;
      await act(async () => {
        confirmBtn.click();
      });
      await flush();

      // After clearing, empty state is displayed and repo is empty
      expect(
        container?.querySelector("[data-testid='dashboard-empty-state']"),
      ).not.toBeNull();
      const sessions = await repo.listRecentSessions("guest");
      expect(sessions.length).toBe(0);
    });

    it("renders dashboard in Spanish locale", async () => {
      const repo = new MockTypingSessionRepository(SAMPLE_SESSIONS);

      await act(async () => {
        root?.render(
          <StatsDashboard
            profileId="guest"
            typingSessionRepository={repo}
            locale="es"
          />,
        );
      });
      await flush();

      expect(container?.textContent).toContain("Rendimiento y Estadísticas");
      expect(container?.textContent).toContain("Historial de Sesiones");
      expect(container?.textContent).toContain("Todas las categorías");
      expect(container?.textContent).toContain("Impecable");
    });
  });
});
