import type { UiLocale } from "../../onboarding/repositories";
import { getTranslation } from "../i18n";

export interface GuidedExerciseRequiredProps {
  readonly locale: UiLocale;
  readonly onBypassToPractice?: () => void;
}

export function GuidedExerciseRequired({
  locale,
  onBypassToPractice,
}: GuidedExerciseRequiredProps) {
  const t = getTranslation(locale).guided;

  return (
    <section
      aria-labelledby="guided-heading"
      className="mx-auto max-w-xl p-6 sm:p-10"
    >
      <div className="rounded-3xl border border-line bg-panel p-8 text-center shadow-[0_24px_70px_-45px_rgba(23,33,27,0.55)]">
        <div className="mx-auto mb-4 grid size-12 place-items-center rounded-2xl bg-highlight font-bold text-accent">
          ✓
        </div>
        <h1
          className="font-display text-2xl font-semibold tracking-tight text-ink sm:text-3xl"
          id="guided-heading"
        >
          {t.title}
        </h1>
        <p className="mt-2 text-sm font-semibold tracking-wider text-accent uppercase">
          {t.subtitle}
        </p>
        <p className="mt-4 text-sm leading-relaxed text-muted">
          {t.description}
        </p>

        <div className="mt-6 rounded-2xl border border-line bg-paper p-4 text-xs font-medium leading-relaxed text-ink">
          {t.lockedNotice}
        </div>

        {onBypassToPractice && (
          <button
            className="mt-6 rounded-full bg-ink px-6 py-2.5 text-sm font-semibold text-paper transition-colors hover:bg-ink/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            onClick={onBypassToPractice}
            type="button"
          >
            Probar consola de práctica (Modo de prueba)
          </button>
        )}
      </div>
    </section>
  );
}
