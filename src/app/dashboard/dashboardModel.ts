import type {
  TypingSessionRecord,
  UiLocale,
} from "../../onboarding/repositories";
import { getTranslation } from "../i18n";

export interface PersonalBestsStats {
  readonly highestNetWpm: number;
  readonly bestAccuracy: number;
  readonly totalWords: number;
  readonly totalPracticeTime: number; // in seconds
  readonly totalSessions: number;
}

export function calculatePersonalBests(
  sessions: readonly TypingSessionRecord[] = [],
): PersonalBestsStats {
  if (!sessions || sessions.length === 0) {
    return {
      highestNetWpm: 0,
      bestAccuracy: 0,
      totalWords: 0,
      totalPracticeTime: 0,
      totalSessions: 0,
    };
  }

  const highestNetWpm = Math.max(...sessions.map((s) => s.netWpm));
  const bestAccuracy = Math.max(...sessions.map((s) => s.accuracy));
  const totalCharacters = sessions.reduce(
    (sum, s) => sum + (s.characterCount || 0),
    0,
  );
  const totalWords = Math.round(totalCharacters / 5);
  const totalPracticeTime = sessions.reduce(
    (sum, s) => sum + (s.elapsedSeconds || 0),
    0,
  );

  return {
    highestNetWpm: Math.round(highestNetWpm * 10) / 10,
    bestAccuracy: Math.round(bestAccuracy * 10) / 10,
    totalWords,
    totalPracticeTime: Math.round(totalPracticeTime),
    totalSessions: sessions.length,
  };
}

export function formatPracticeDuration(totalSeconds: number): string {
  if (totalSeconds <= 0) return "0s";
  const seconds = Math.floor(totalSeconds % 60);
  const minutes = Math.floor((totalSeconds / 60) % 60);
  const hours = Math.floor(totalSeconds / 3600);

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  }
  return `${seconds}s`;
}

export interface SessionBadge {
  readonly id: string;
  readonly label: string;
  readonly variant: "accent" | "success" | "warning" | "info" | "neutral";
}

export function deriveSessionBadges(
  session: TypingSessionRecord,
  locale: UiLocale,
): readonly SessionBadge[] {
  const t = getTranslation(locale);
  const badges: SessionBadge[] = [];

  if (session.accuracy === 100) {
    badges.push({
      id: "flawless",
      label: t.dashboard.badges.flawless,
      variant: "accent",
    });
  } else if (session.accuracy >= 98) {
    badges.push({
      id: "highAccuracy",
      label: t.dashboard.badges.highAccuracy,
      variant: "success",
    });
  }

  if (session.netWpm >= 80) {
    badges.push({
      id: "blazing",
      label: t.dashboard.badges.blazing,
      variant: "warning",
    });
  } else if (session.netWpm >= 60) {
    badges.push({
      id: "fast",
      label: t.dashboard.badges.fast,
      variant: "info",
    });
  } else if (session.netWpm >= 40) {
    badges.push({
      id: "steady",
      label: t.dashboard.badges.steady,
      variant: "neutral",
    });
  }

  return badges;
}

export function formatSessionDate(timestamp: number, locale: UiLocale): string {
  try {
    const date = new Date(timestamp);
    return new Intl.DateTimeFormat(locale === "es" ? "es-ES" : "en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  } catch {
    return new Date(timestamp).toLocaleString();
  }
}
