import type { FC } from "react";
import type { UiLocale } from "../../onboarding/repositories";
import {
  DEFAULT_SOUND_PROFILE,
  SOUND_PROFILES,
  type SoundProfileId,
} from "../../styles/theme";
import { getTranslation } from "../i18n";
import {
  AudioSynthesizer,
  audioSynthesizer as defaultAudioSynthesizer,
} from "./audioSynthesizer";

export interface SoundSelectorProps {
  readonly activeProfile?: SoundProfileId;
  readonly muted?: boolean;
  readonly locale?: UiLocale;
  readonly synthesizer?: AudioSynthesizer;
  readonly onProfileChange?: (profile: SoundProfileId) => void;
  readonly onMuteToggle?: (muted: boolean) => void;
}

export const SoundSelector: FC<SoundSelectorProps> = ({
  activeProfile = DEFAULT_SOUND_PROFILE,
  muted = false,
  locale = "en",
  synthesizer = defaultAudioSynthesizer,
  onProfileChange,
  onMuteToggle,
}) => {
  const t = getTranslation(locale);

  const handleProfileSelect = (profile: SoundProfileId) => {
    synthesizer.setProfile(profile);
    if (!muted && profile !== "mute") {
      synthesizer.playKeyPressSound(profile);
    }
    onProfileChange?.(profile);
  };

  const handleMuteToggle = () => {
    const nextMuted = !muted;
    synthesizer.setMuted(nextMuted);
    onMuteToggle?.(nextMuted);
  };

  const handlePreview = () => {
    synthesizer.playKeyPressSound(activeProfile);
  };

  return (
    <div className="flex flex-col gap-3 text-xs font-medium">
      <div className="flex items-center justify-between">
        <span className="text-muted uppercase tracking-wider text-[10px] font-semibold">
          {t.audio.title}
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            data-testid="preview-sound-button"
            onClick={handlePreview}
            className="text-[11px] px-2 py-1 rounded bg-paper border border-line text-ink hover:bg-panel cursor-pointer transition-colors"
            title={t.audio.previewSound}
          >
            {t.audio.previewSound}
          </button>
          <button
            type="button"
            data-testid="mute-toggle-button"
            role="switch"
            aria-checked={!muted}
            aria-pressed={muted}
            onClick={handleMuteToggle}
            className={`text-[11px] px-2.5 py-1 rounded border transition-colors cursor-pointer ${
              muted
                ? "bg-error-soft/30 border-error/40 text-error font-semibold"
                : "bg-paper border-line text-muted hover:text-ink hover:bg-panel"
            }`}
          >
            {muted ? t.audio.soundMuted : t.audio.soundActive}
          </button>
        </div>
      </div>

      <div
        role="radiogroup"
        aria-label={t.audio.title}
        className="flex flex-wrap gap-1.5 p-1 bg-paper/60 border border-line rounded-lg"
      >
        {SOUND_PROFILES.map((profileId) => {
          const isSelected = activeProfile === profileId;
          return (
            <button
              key={profileId}
              type="button"
              role="radio"
              aria-checked={isSelected}
              aria-pressed={isSelected}
              onClick={() => handleProfileSelect(profileId)}
              className={`px-3 py-1.5 rounded-md transition-all duration-150 cursor-pointer ${
                isSelected
                  ? "bg-accent text-white font-semibold shadow-xs"
                  : "text-muted hover:text-ink hover:bg-panel"
              }`}
            >
              {t.audio.profiles[profileId]}
            </button>
          );
        })}
      </div>
    </div>
  );
};
