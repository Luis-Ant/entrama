import { describe, expect, it } from "vitest";
import {
  calculateAccuracy,
  calculateGrossWpm,
  calculateNetWpm,
  calculateWpmMetrics,
  countGraphemes,
  segmentGraphemes,
} from "./metrics";

describe("metrics", () => {
  describe("segmentGraphemes & countGraphemes", () => {
    it("correctly segments standard ascii text", () => {
      const text = "Hello World";
      expect(segmentGraphemes(text)).toEqual([
        "H",
        "e",
        "l",
        "l",
        "o",
        " ",
        "W",
        "o",
        "r",
        "l",
        "d",
      ]);
      expect(countGraphemes(text)).toBe(11);
    });

    it("correctly segments multi-byte and accented graphemes in NFC", () => {
      const text = "¡Hola, señor! ¿Cómo estás?";
      const segments = segmentGraphemes(text);
      expect(segments).toContain("¡");
      expect(segments).toContain("ñ");
      expect(segments).toContain("¿");
      expect(segments).toContain("ó");
      expect(segments).toContain("á");
      expect(countGraphemes(text)).toBe(text.length);
    });

    it("handles combined diacritics normalized to NFC graphemes", () => {
      // Combining acute accent: 'e' + '\u0301'
      const decomposed = "e\u0301";
      expect(decomposed.length).toBe(2);
      expect(segmentGraphemes(decomposed)).toEqual(["é"]);
      expect(countGraphemes(decomposed)).toBe(1);
    });

    it("handles empty string", () => {
      expect(segmentGraphemes("")).toEqual([]);
      expect(countGraphemes("")).toBe(0);
    });
  });

  describe("calculateGrossWpm", () => {
    it("returns 0 when elapsed time is zero or negative", () => {
      expect(calculateGrossWpm(50, 0)).toBe(0);
      expect(calculateGrossWpm(50, -5)).toBe(0);
    });

    it("returns 0 when characters count is zero or negative", () => {
      expect(calculateGrossWpm(0, 30)).toBe(0);
      expect(calculateGrossWpm(-10, 30)).toBe(0);
    });

    it("calculates standard Gross WPM: (chars / 5) / (seconds / 60)", () => {
      // 50 chars in 30s (0.5 min) = (50/5) / 0.5 = 10 / 0.5 = 20
      expect(calculateGrossWpm(50, 30)).toBe(20);
      // 150 chars in 60s (1.0 min) = (150/5) / 1.0 = 30
      expect(calculateGrossWpm(150, 60)).toBe(30);
    });

    it("rounds Gross WPM to 1 decimal place", () => {
      // 53 chars in 30s = 10.6 / 0.5 = 21.2
      expect(calculateGrossWpm(53, 30)).toBe(21.2);
    });
  });

  describe("calculateNetWpm", () => {
    it("returns 0 when elapsed time is zero or negative", () => {
      expect(calculateNetWpm(20, 2, 0)).toBe(0);
      expect(calculateNetWpm(20, 2, -10)).toBe(0);
    });

    it("subtracts unfixed errors penalty: Math.max(0, grossWpm - (unfixedErrors / (seconds / 60)))", () => {
      // Gross WPM 20, 2 unfixed errors in 30s (0.5 min) -> 20 - (2 / 0.5) = 20 - 4 = 16
      expect(calculateNetWpm(20, 2, 30)).toBe(16);
    });

    it("clamps negative Net WPM to 0", () => {
      // Gross WPM 10, 10 unfixed errors in 30s -> 10 - 20 = -10 -> 0
      expect(calculateNetWpm(10, 10, 30)).toBe(0);
    });

    it("rounds Net WPM to 1 decimal place", () => {
      // Gross WPM 20.5, 1 unfixed error in 45s (0.75 min) -> 20.5 - (1 / 0.75) = 20.5 - 1.333... = 19.166... -> 19.2
      expect(calculateNetWpm(20.5, 1, 45)).toBe(19.2);
    });
  });

  describe("calculateAccuracy", () => {
    it("returns 100 when total characters is 0", () => {
      expect(calculateAccuracy(0, 0)).toBe(100);
      expect(calculateAccuracy(0, 5)).toBe(100);
    });

    it("calculates accuracy percentage accurately: ((total - errors) / total) * 100", () => {
      // 50 chars, 2 errors -> 48 / 50 * 100 = 96%
      expect(calculateAccuracy(50, 2)).toBe(96);
      // 100 chars, 0 errors -> 100%
      expect(calculateAccuracy(100, 0)).toBe(100);
    });

    it("clamps accuracy between 0 and 100", () => {
      // More errors than characters typed (e.g. 5 errors on 2 chars) -> 0%
      expect(calculateAccuracy(2, 5)).toBe(0);
    });

    it("rounds accuracy to 1 decimal place", () => {
      // 30 chars, 1 error -> 29 / 30 * 100 = 96.666... -> 96.7%
      expect(calculateAccuracy(30, 1)).toBe(96.7);
    });
  });

  describe("calculateWpmMetrics", () => {
    it("matches Scenario 1 from specification", () => {
      // Scenario 1: 50 characters with 2 unfixed errors in 30 seconds (0.5 minutes)
      // Gross WPM = 20.0, Net WPM = 16.0, Accuracy = 96.0%
      const metrics = calculateWpmMetrics(50, 2, 2, 30);
      expect(metrics).toEqual({
        grossWpm: 20,
        netWpm: 16,
        accuracy: 96,
      });
    });

    it("supports 3-argument signature with 0 unfixed errors", () => {
      const metrics = calculateWpmMetrics(50, 2, 30);
      expect(metrics).toEqual({
        grossWpm: 20,
        netWpm: 20,
        accuracy: 96,
      });
    });

    it("handles initial state (0 characters, 0 errors, 0 elapsed time)", () => {
      const metrics = calculateWpmMetrics(0, 0, 0, 0);
      expect(metrics).toEqual({
        grossWpm: 0,
        netWpm: 0,
        accuracy: 100,
      });
    });
  });
});
