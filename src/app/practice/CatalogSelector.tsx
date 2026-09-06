import { useMemo } from "react";
import { getTranslation } from "../i18n";
import {
  CATALOG_CATEGORIES,
  listCatalogPassages,
  type CatalogCategory,
  type CatalogPassage,
} from "../../typing/catalogs";
import type { UiLocale } from "../../onboarding/repositories";

export interface CatalogSelectorProps {
  readonly selectedCategory: CatalogCategory;
  readonly onSelectCategory: (category: CatalogCategory) => void;
  readonly locale?: UiLocale;
  readonly passages?: readonly CatalogPassage[];
  readonly selectedPassageId?: string;
  readonly onSelectPassage?: (passage: CatalogPassage) => void;
  readonly disabled?: boolean;
}

export function CatalogSelector({
  selectedCategory,
  onSelectCategory,
  locale = "en",
  passages,
  selectedPassageId,
  onSelectPassage,
  disabled = false,
}: CatalogSelectorProps) {
  const t = getTranslation(locale);
  const ft = t.freeTyping;

  const currentPassages = useMemo(() => {
    if (passages && passages.length > 0) {
      return passages.filter((p) => p.category === selectedCategory);
    }
    return listCatalogPassages(selectedCategory, locale);
  }, [passages, selectedCategory, locale]);

  return (
    <section aria-labelledby="catalog-selector-heading" className="space-y-4">
      <div className="flex items-center justify-between">
        <h2
          className="text-xs font-bold tracking-widest text-muted uppercase"
          id="catalog-selector-heading"
        >
          {ft.subtitle}
        </h2>
      </div>

      {/* Category Tabs */}
      <div
        aria-label="Passage categories"
        className="flex flex-wrap gap-2 rounded-2xl border border-line bg-panel p-1.5"
        role="tablist"
      >
        {CATALOG_CATEGORIES.map((category) => {
          const isSelected = category === selectedCategory;
          const label = ft.categories[category];

          return (
            <button
              aria-controls={`panel-${category}`}
              aria-selected={isSelected}
              className={`flex-1 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
                isSelected
                  ? "bg-ink text-paper shadow-sm"
                  : "text-muted hover:bg-highlight hover:text-ink"
              } ${disabled ? "cursor-not-allowed opacity-50" : ""}`}
              disabled={disabled}
              id={`tab-${category}`}
              key={category}
              onClick={() => onSelectCategory(category)}
              role="tab"
              type="button"
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* Passage Cards / Selection */}
      <div
        aria-labelledby={`tab-${selectedCategory}`}
        className="grid gap-3 sm:grid-cols-2"
        id={`panel-${selectedCategory}`}
        role="tabpanel"
      >
        {currentPassages.map((passage) => {
          const isCurrent =
            selectedPassageId === passage.id ||
            (!selectedPassageId && passage === currentPassages[0]);

          return (
            <button
              aria-pressed={isCurrent}
              className={`group flex flex-col justify-between rounded-2xl border p-4 text-left transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
                isCurrent
                  ? "border-ink bg-paper shadow-sm ring-1 ring-ink"
                  : "border-line bg-panel hover:border-ink/40 hover:bg-paper"
              } ${disabled ? "cursor-not-allowed opacity-50" : ""}`}
              disabled={disabled}
              key={passage.id}
              onClick={() => onSelectPassage?.(passage)}
              type="button"
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-display font-medium text-ink">
                    {passage.title}
                  </h3>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-semibold uppercase tracking-wider ${
                      passage.difficulty === "easy"
                        ? "bg-online/15 text-online"
                        : passage.difficulty === "medium"
                          ? "bg-accent/15 text-accent"
                          : "bg-error/15 text-error"
                    }`}
                  >
                    {passage.difficulty}
                  </span>
                </div>
                <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-muted">
                  {passage.text}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
