import { describe, expect, it } from "vitest";
import {
  CATALOG_CATEGORIES,
  getCatalogPassage,
  listCatalogPassages,
} from "./catalogs";
import { countGraphemes } from "./metrics";

describe("catalogs", () => {
  const locales = ["en", "es"] as const;

  it("defines all 4 expected categories", () => {
    expect(CATALOG_CATEGORIES).toEqual([
      "stories",
      "technology",
      "literature",
      "code",
    ]);
  });

  describe("listCatalogPassages", () => {
    it("returns all passages when no filter is provided", () => {
      const passages = listCatalogPassages();
      expect(passages.length).toBeGreaterThanOrEqual(8);
    });

    it("filters passages by category", () => {
      for (const category of CATALOG_CATEGORIES) {
        const filtered = listCatalogPassages(category);
        expect(filtered.length).toBeGreaterThan(0);
        expect(filtered.every((p) => p.category === category)).toBe(true);
      }
    });

    it("filters passages by category and locale", () => {
      for (const category of CATALOG_CATEGORIES) {
        for (const locale of locales) {
          const filtered = listCatalogPassages(category, locale);
          expect(filtered.length).toBeGreaterThan(0);
          expect(
            filtered.every(
              (p) => p.category === category && p.locale === locale,
            ),
          ).toBe(true);
        }
      }
    });
  });

  describe("getCatalogPassage", () => {
    it("retrieves a valid passage for each category and locale", () => {
      for (const category of CATALOG_CATEGORIES) {
        for (const locale of locales) {
          const passage = getCatalogPassage(category, locale);
          expect(passage).toBeDefined();
          expect(passage.category).toBe(category);
          expect(passage.locale).toBe(locale);
          expect(passage.title.trim().length).toBeGreaterThan(0);
          expect(passage.text.trim().length).toBeGreaterThan(0);
          expect(countGraphemes(passage.text)).toBeGreaterThan(20);
        }
      }
    });

    it("retrieves a specific passage by id if provided", () => {
      const all = listCatalogPassages();
      const first = all[0];
      const found = getCatalogPassage(first.category, first.locale, first.id);
      expect(found.id).toBe(first.id);
      expect(found.text).toBe(first.text);
    });

    it("falls back to default passage if unknown id is provided", () => {
      const fallback = getCatalogPassage("technology", "en", "non-existent-id");
      expect(fallback).toBeDefined();
      expect(fallback.category).toBe("technology");
      expect(fallback.locale).toBe("en");
    });
  });

  describe("content quality", () => {
    it("ensures Spanish passages include punctuation like commas and periods", () => {
      const esPassages = listCatalogPassages(undefined, "es");
      const combinedText = esPassages.map((p) => p.text).join(" ");
      expect(/[,.]/.test(combinedText)).toBe(true);
    });

    it("ensures Code passages contain valid syntax characters", () => {
      const codeEn = getCatalogPassage("code", "en");
      const codeEs = getCatalogPassage("code", "es");
      expect(/[{}();=><]/.test(codeEn.text)).toBe(true);
      expect(/[{}();=><]/.test(codeEs.text)).toBe(true);
    });

    it("ensures all text is NFC normalized", () => {
      const all = listCatalogPassages();
      for (const p of all) {
        expect(p.text).toBe(p.text.normalize("NFC"));
        expect(p.title).toBe(p.title.normalize("NFC"));
      }
    });
  });
});
