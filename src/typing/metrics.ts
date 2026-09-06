export interface TypingMetrics {
  readonly grossWpm: number;
  readonly netWpm: number;
  readonly accuracy: number;
}

const segmenter = new Intl.Segmenter(undefined, { granularity: "grapheme" });

export function segmentGraphemes(value: string): string[] {
  return Array.from(
    segmenter.segment(value.normalize("NFC")),
    ({ segment }) => segment,
  );
}

export function countGraphemes(value: string): number {
  return segmentGraphemes(value).length;
}

export function calculateGrossWpm(
  totalCharacters: number,
  elapsedSeconds: number,
): number {
  if (elapsedSeconds <= 0 || totalCharacters <= 0) {
    return 0;
  }
  const minutes = elapsedSeconds / 60;
  const words = totalCharacters / 5;
  return Math.round((words / minutes) * 10) / 10;
}

export function calculateNetWpm(
  grossWpm: number,
  unfixedErrors: number,
  elapsedSeconds: number,
): number {
  if (elapsedSeconds <= 0) {
    return 0;
  }
  const minutes = elapsedSeconds / 60;
  const errorPenalty = Math.max(0, unfixedErrors) / minutes;
  const net = Math.max(0, grossWpm - errorPenalty);
  return Math.round(net * 10) / 10;
}

export function calculateAccuracy(
  totalCharacters: number,
  totalErrors: number,
): number {
  if (totalCharacters <= 0) {
    return 100;
  }
  const correct = Math.max(0, totalCharacters - Math.max(0, totalErrors));
  const rawAccuracy = (correct / totalCharacters) * 100;
  const clamped = Math.max(0, Math.min(100, rawAccuracy));
  return Math.round(clamped * 10) / 10;
}

export function calculateWpmMetrics(
  totalCharacters: number,
  totalErrors: number,
  unfixedErrors: number,
  elapsedSeconds: number,
): TypingMetrics;
export function calculateWpmMetrics(
  totalCharacters: number,
  totalErrors: number,
  elapsedSeconds: number,
): TypingMetrics;
export function calculateWpmMetrics(
  totalCharacters: number,
  totalErrors: number,
  arg3: number,
  arg4?: number,
): TypingMetrics {
  const unfixedErrors = arg4 === undefined ? 0 : Math.max(0, arg3);
  const elapsedSeconds = arg4 === undefined ? arg3 : arg4;

  const grossWpm = calculateGrossWpm(totalCharacters, elapsedSeconds);
  const netWpm = calculateNetWpm(grossWpm, unfixedErrors, elapsedSeconds);
  const accuracy = calculateAccuracy(totalCharacters, totalErrors);

  return {
    grossWpm,
    netWpm,
    accuracy,
  };
}
