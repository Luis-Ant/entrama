import type { UiLocale } from "../../onboarding/repositories";
import { getTranslation, setDocumentLanguage } from "../i18n";

export interface LanguageStepProps {
  readonly currentLocale?: UiLocale;
  readonly onSelectLocale: (locale: UiLocale) => void;
}

export function LanguageStep({
  currentLocale = "en",
  onSelectLocale,
}: LanguageStepProps) {
  const t = getTranslation(currentLocale).language;

  const handleSelect = (locale: UiLocale) => {
    setDocumentLanguage(locale);
    onSelectLocale(locale);
  };

  return (
    <section
      aria-labelledby="language-heading"
      className="mx-auto max-w-xl p-6 sm:p-10"
    >
      <div className="mb-8">
        <p className="mb-2 text-xs font-bold tracking-[0.2em] text-accent uppercase">
          Onboarding
        </p>
        <h1
          className="font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl"
          id="language-heading"
        >
          {t.title}
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          {t.description}
        </p>
      </div>

      <fieldset className="grid gap-4">
        <legend className="sr-only">{t.title}</legend>
        <button
          className={`flex items-center justify-between rounded-2xl border p-5 text-left transition-colors motion-reduce:transition-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
            currentLocale === "en"
              ? "border-accent bg-highlight text-ink"
              : "border-line bg-panel text-ink hover:border-ink"
          }`}
          onClick={() => handleSelect("en")}
          type="button"
        >
          <span className="font-display text-lg font-medium">
            {t.englishLabel}
          </span>
          {currentLocale === "en" && (
            <span aria-hidden="true" className="font-bold text-accent">
              ✓
            </span>
          )}
        </button>

        <button
          className={`flex items-center justify-between rounded-2xl border p-5 text-left transition-colors motion-reduce:transition-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
            currentLocale === "es"
              ? "border-accent bg-highlight text-ink"
              : "border-line bg-panel text-ink hover:border-ink"
          }`}
          onClick={() => handleSelect("es")}
          type="button"
        >
          <span className="font-display text-lg font-medium">
            {t.spanishLabel}
          </span>
          {currentLocale === "es" && (
            <span aria-hidden="true" className="font-bold text-accent">
              ✓
            </span>
          )}
        </button>
      </fieldset>

      <p className="mt-6 text-xs text-muted leading-relaxed">{t.note}</p>
    </section>
  );
}
