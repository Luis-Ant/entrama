import type { UiLocale } from "../../onboarding/repositories";

export type StreakTier =
  "none" | "warmup" | "streak" | "combo" | "flawless" | "godlike";

export interface StreakMilestone {
  readonly tier: StreakTier;
  readonly label: string;
  readonly icon: string;
  readonly colorClass: string;
  readonly minStreak: number;
}

export function getStreakMilestone(
  streak: number,
  locale: UiLocale = "en",
): StreakMilestone {
  if (streak >= 100) {
    return {
      tier: "godlike",
      icon: "👑",
      label: locale === "es" ? `${streak} ¡Maestría!` : `${streak} Godlike!`,
      colorClass:
        "border-amber-400/60 bg-amber-400/10 text-amber-500 shadow-sm",
      minStreak: 100,
    };
  }

  if (streak >= 50) {
    return {
      tier: "flawless",
      icon: "✨",
      label: locale === "es" ? `${streak} ¡Impecable!` : `${streak} Flawless!`,
      colorClass:
        "border-purple-400/60 bg-purple-400/10 text-purple-400 shadow-sm",
      minStreak: 50,
    };
  }

  if (streak >= 25) {
    return {
      tier: "combo",
      icon: "⚡",
      label: locale === "es" ? `${streak} ¡Combo!` : `${streak} Combo!`,
      colorClass: "border-cyan-400/60 bg-cyan-400/10 text-cyan-400 shadow-sm",
      minStreak: 25,
    };
  }

  if (streak >= 10) {
    return {
      tier: "streak",
      icon: "🔥",
      label: locale === "es" ? `${streak} Racha` : `${streak} Streak`,
      colorClass:
        "border-orange-500/60 bg-orange-500/10 text-orange-500 shadow-sm",
      minStreak: 10,
    };
  }

  if (streak >= 5) {
    return {
      tier: "warmup",
      icon: "⚡",
      label: locale === "es" ? `${streak} Racha` : `${streak} Streak`,
      colorClass: "border-accent/50 bg-highlight/50 text-accent",
      minStreak: 5,
    };
  }

  return {
    tier: "none",
    icon: "",
    label: `${streak}`,
    colorClass: "border-line bg-paper/60 text-muted/80",
    minStreak: 0,
  };
}

export interface SparklinePoint {
  readonly x: number;
  readonly y: number;
  readonly value: number;
}

export interface SparklinePathResult {
  readonly pathData: string;
  readonly areaData: string;
  readonly points: readonly SparklinePoint[];
  readonly min: number;
  readonly max: number;
  readonly lastPoint: SparklinePoint | null;
}

export function generateSparklineSvgPath(
  samples: readonly number[],
  width: number = 160,
  height: number = 40,
  paddingY: number = 4,
  paddingX: number = 4,
): SparklinePathResult {
  if (!samples || samples.length === 0) {
    return {
      pathData: "",
      areaData: "",
      points: [],
      min: 0,
      max: 0,
      lastPoint: null,
    };
  }

  const min = Math.min(...samples);
  const max = Math.max(...samples);
  const range = max - min;

  const usableWidth = Math.max(1, width - 2 * paddingX);
  const usableHeight = Math.max(1, height - 2 * paddingY);

  const points: SparklinePoint[] = samples.map((val, idx) => {
    const x =
      samples.length === 1
        ? paddingX + usableWidth / 2
        : paddingX + (idx / (samples.length - 1)) * usableWidth;

    const normalizedY = range === 0 ? 0.5 : (val - min) / range;
    const y = height - paddingY - normalizedY * usableHeight;

    return {
      x: Math.round(x * 100) / 100,
      y: Math.round(y * 100) / 100,
      value: val,
    };
  });

  const lastPoint = points[points.length - 1] ?? null;

  if (points.length === 1 && lastPoint) {
    const pathData = `M ${lastPoint.x - 2},${lastPoint.y} L ${lastPoint.x + 2},${lastPoint.y}`;
    const areaData = `M ${lastPoint.x - 2},${lastPoint.y} L ${lastPoint.x + 2},${lastPoint.y} L ${lastPoint.x + 2},${height} L ${lastPoint.x - 2},${height} Z`;
    return { pathData, areaData, points, min, max, lastPoint };
  }

  // Smooth bezier curve path generation
  let pathData = `M ${points[0].x},${points[0].y}`;

  for (let i = 0; i < points.length - 1; i++) {
    const curr = points[i];
    const next = points[i + 1];
    const cpX = (curr.x + next.x) / 2;
    pathData += ` C ${cpX},${curr.y} ${cpX},${next.y} ${next.x},${next.y}`;
  }

  const firstX = points[0].x;
  const lastX = lastPoint ? lastPoint.x : width;
  const areaData = `${pathData} L ${lastX},${height} L ${firstX},${height} Z`;

  return {
    pathData,
    areaData,
    points,
    min,
    max,
    lastPoint,
  };
}
