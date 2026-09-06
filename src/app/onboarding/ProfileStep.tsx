import { useState } from "react";
import {
  LAYOUT_PROFILE_ID,
  type LayoutProfileId,
} from "../../keyboard-layouts/types";
import type { UiLocale } from "../../onboarding/repositories";
import { getTranslation } from "../i18n";

export interface ProfileStepProps {
  readonly suggestedProfileId?: LayoutProfileId;
  readonly confirmedProfileId?: LayoutProfileId;
  readonly locale: UiLocale;
  readonly onConfirmProfile: (profileId: LayoutProfileId) => void;
}

const PROFILES: readonly LayoutProfileId[] = [
  LAYOUT_PROFILE_ID.WINDOWS_US_INTERNATIONAL,
  LAYOUT_PROFILE_ID.WINDOWS_LATIN_AMERICAN_QWERTY,
  LAYOUT_PROFILE_ID.MACOS_US_INTERNATIONAL,
  LAYOUT_PROFILE_ID.MACOS_LATIN_AMERICAN_QWERTY,
];

export function ProfileStep({
  suggestedProfileId,
  confirmedProfileId,
  locale,
  onConfirmProfile,
}: ProfileStepProps) {
  const t = getTranslation(locale).profile;
  const [selected, setSelected] = useState<LayoutProfileId | undefined>(
    () => confirmedProfileId || suggestedProfileId || PROFILES[0],
  );

  const handleConfirm = () => {
    if (selected) {
      onConfirmProfile(selected);
    }
  };

  return (
    <section
      aria-labelledby="profile-heading"
      className="mx-auto max-w-xl p-6 sm:p-10"
    >
      <div className="mb-6">
        <p className="mb-2 text-xs font-bold tracking-[0.2em] text-accent uppercase">
          Onboarding
        </p>
        <h1
          className="font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl"
          id="profile-heading"
        >
          {t.title}
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          {t.description}
        </p>
      </div>

      {suggestedProfileId && (
        <div
          aria-label="Suggestion notice"
          className="mb-6 rounded-2xl border border-line bg-panel p-4 text-xs leading-relaxed text-muted"
          role="note"
        >
          <strong className="font-semibold text-ink">
            {t.profiles[suggestedProfileId] || suggestedProfileId}:{" "}
          </strong>
          {t.suggestionWarning}
        </div>
      )}

      <fieldset className="grid gap-3">
        <legend className="sr-only">{t.title}</legend>
        {PROFILES.map((profileId) => {
          const isSelected = selected === profileId;
          return (
            <label
              className={`flex cursor-pointer items-center justify-between rounded-2xl border p-4 transition-colors motion-reduce:transition-none focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-accent ${
                isSelected
                  ? "border-accent bg-highlight text-ink"
                  : "border-line bg-panel text-ink hover:border-ink"
              }`}
              key={profileId}
            >
              <div className="flex items-center gap-3">
                <input
                  checked={isSelected}
                  className="size-4 accent-accent"
                  name="keyboard-profile"
                  onChange={() => setSelected(profileId)}
                  type="radio"
                  value={profileId}
                />
                <span className="font-display text-sm font-medium">
                  {t.profiles[profileId] || profileId}
                </span>
              </div>
              {suggestedProfileId === profileId && (
                <span className="rounded-full bg-paper px-2.5 py-0.5 text-[10px] font-bold tracking-wider text-muted uppercase">
                  Suggested
                </span>
              )}
            </label>
          );
        })}
      </fieldset>

      <div className="mt-8 flex justify-end">
        <button
          className="rounded-full bg-ink px-6 py-3 text-sm font-semibold text-paper transition-colors hover:bg-ink/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:cursor-not-allowed disabled:opacity-50"
          disabled={!selected}
          onClick={handleConfirm}
          type="button"
        >
          {t.confirmButton}
        </button>
      </div>
    </section>
  );
}
