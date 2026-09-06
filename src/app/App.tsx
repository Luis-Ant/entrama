import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
} from "react";

import { KEYBOARD_DEFINITIONS } from "../keyboard-layouts/definitions";
import {
  LAYOUT_PROFILE_ID,
  type LayoutProfileId,
} from "../keyboard-layouts/types";
import type {
  OnboardingRepository,
  OnboardingSnapshot,
  PreferenceRepository,
  ProfileRepository,
  TypingSessionRecord,
  TypingSessionRepository,
  UiLocale,
} from "../onboarding/repositories";
import { createOnboardingService } from "../onboarding/service";
import {
  deriveOnboardingState,
  ONBOARDING_STATE,
  type DefinitionVersions,
  type OnboardingState,
} from "../onboarding/state";
import {
  DexieOnboardingRepository,
  DexiePreferenceRepository,
  DexieProfileRepository,
  DexieTypingSessionRepository,
} from "../storage-dexie/repositories";
import {
  consumeCommittedText,
  createPracticeState,
  getActiveSurface,
  getExpectedGrapheme,
  INPUT_OUTCOME,
  PRACTICE_PHASE,
  segmentGraphemes,
  type PracticeUnit,
} from "../typing/practice";
import {
  DEFAULT_SOUND_PROFILE,
  DEFAULT_THEME,
  DEFAULT_TYPOGRAPHY,
  applyTheme,
  type SoundProfileId,
  type ThemeId,
  type TypographyId,
} from "../styles/theme";
import { audioSynthesizer } from "./audio/audioSynthesizer";
import { SoundSelector } from "./audio/SoundSelector";
import { StatsDashboard } from "./dashboard/StatsDashboard";
import { getTranslation, setDocumentLanguage } from "./i18n";
import { CalibrationStep } from "./onboarding/CalibrationStep";
import { GuidedFingerPlacementStep } from "./onboarding/GuidedFingerPlacementStep";
import { GuidedPostureStep } from "./onboarding/GuidedPostureStep";
import { GuidedSequenceStep } from "./onboarding/GuidedSequenceStep";
import { LanguageStep } from "./onboarding/LanguageStep";
import { ProfileStep } from "./onboarding/ProfileStep";
import { FreeTypingView } from "./practice/FreeTypingView";
import { ThemeSelector } from "./theme/ThemeSelector";

type GuidedStep = "posture" | "fingerPlacement" | "sequence";

export interface AppProps {
  readonly updateServiceWorker?: (reloadPage?: boolean) => Promise<void>;
  readonly onboardingRepository?: OnboardingRepository;
  readonly profileRepository?: ProfileRepository;
  readonly preferenceRepository?: PreferenceRepository;
  readonly typingSessionRepository?: TypingSessionRepository;
}

const STARTER_UNITS: readonly PracticeUnit[] = [
  { id: "hello-hola", english: "hello", spanish: "hola" },
  { id: "home-casa", english: "home", spanish: "casa" },
  { id: "keyboard-teclado", english: "keyboard", spanish: "teclado" },
  { id: "practice-practica", english: "practice", spanish: "practica" },
  { id: "language-lenguaje", english: "language", spanish: "lenguaje" },
  { id: "computer-computadora", english: "computer", spanish: "computadora" },
  { id: "system-sistema", english: "system", spanish: "sistema" },
  { id: "screen-pantalla", english: "screen", spanish: "pantalla" },
  { id: "world-mundo", english: "world", spanish: "mundo" },
  {
    id: "application-aplicacion",
    english: "application",
    spanish: "aplicacion",
  },
  { id: "connection-conexion", english: "connection", spanish: "conexion" },
  { id: "learning-aprendizaje", english: "learning", spanish: "aprendizaje" },
];

const DEFINITION_VERSIONS: DefinitionVersions = {
  [LAYOUT_PROFILE_ID.MACOS_US_INTERNATIONAL]:
    KEYBOARD_DEFINITIONS[LAYOUT_PROFILE_ID.MACOS_US_INTERNATIONAL].version,
  [LAYOUT_PROFILE_ID.MACOS_LATIN_AMERICAN_QWERTY]:
    KEYBOARD_DEFINITIONS[LAYOUT_PROFILE_ID.MACOS_LATIN_AMERICAN_QWERTY].version,
  [LAYOUT_PROFILE_ID.WINDOWS_US_INTERNATIONAL]:
    KEYBOARD_DEFINITIONS[LAYOUT_PROFILE_ID.WINDOWS_US_INTERNATIONAL].version,
  [LAYOUT_PROFILE_ID.WINDOWS_LATIN_AMERICAN_QWERTY]:
    KEYBOARD_DEFINITIONS[LAYOUT_PROFILE_ID.WINDOWS_LATIN_AMERICAN_QWERTY]
      .version,
};

const GRAPHEME_STATE = {
  COMPLETE: "complete",
  CURRENT: "current",
  ERROR: "error",
  PENDING: "pending",
} as const;

type GraphemeState = (typeof GRAPHEME_STATE)[keyof typeof GRAPHEME_STATE];

export function App({
  updateServiceWorker,
  onboardingRepository,
  profileRepository,
  preferenceRepository,
  typingSessionRepository,
}: AppProps) {
  const defaultProfileRepo = useMemo(() => new DexieProfileRepository(), []);
  const defaultPrefRepo = useMemo(() => new DexiePreferenceRepository(), []);
  const defaultOnboardingRepo = useMemo(
    () => new DexieOnboardingRepository(),
    [],
  );
  const defaultTypingSessionRepo = useMemo(
    () => new DexieTypingSessionRepository(),
    [],
  );

  const profileRepo = profileRepository ?? defaultProfileRepo;
  const prefRepo = preferenceRepository ?? defaultPrefRepo;
  const onboardingRepo = onboardingRepository ?? defaultOnboardingRepo;
  const typingSessionRepo = typingSessionRepository ?? defaultTypingSessionRepo;

  const [loading, setLoading] = useState(true);
  const [snapshot, setSnapshot] = useState<OnboardingSnapshot>({});
  const [onboardingState, setOnboardingState] = useState<OnboardingState>(
    ONBOARDING_STATE.NEEDS_UI_LANGUAGE,
  );
  const [guidedStep, setGuidedStep] = useState<GuidedStep>("posture");
  const [practiceMode, setPracticeMode] = useState<
    "starter" | "free" | "dashboard"
  >("starter");

  const [activeTheme, setActiveTheme] = useState<ThemeId>(DEFAULT_THEME);
  const [activeTypography, setActiveTypography] =
    useState<TypographyId>(DEFAULT_TYPOGRAPHY);
  const [activeSoundProfile, setActiveSoundProfile] = useState<SoundProfileId>(
    DEFAULT_SOUND_PROFILE,
  );
  const [isSoundMuted, setIsSoundMuted] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);

  const [practice, setPractice] = useState(() =>
    createPracticeState(STARTER_UNITS),
  );
  const [announcement, setAnnouncement] = useState(
    "Practice ready. Type the highlighted character.",
  );
  const [isPaused, setIsPaused] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const isComposing = useRef(false);

  useEffect(() => {
    let active = true;
    async function init() {
      await profileRepo.ensureGuest();
      const snap = await onboardingRepo.load();
      if (!active) return;
      setSnapshot(snap);
      const state = deriveOnboardingState(snap, DEFINITION_VERSIONS);
      setOnboardingState(state);
      if (snap.preference?.locale) {
        setDocumentLanguage(snap.preference.locale);
      }
      const theme = snap.preference?.theme ?? DEFAULT_THEME;
      const typo =
        snap.preference?.typography ??
        snap.preference?.fontFamily ??
        DEFAULT_TYPOGRAPHY;
      const sound = snap.preference?.soundProfile ?? DEFAULT_SOUND_PROFILE;
      setActiveTheme(theme);
      setActiveTypography(typo);
      setActiveSoundProfile(sound);
      setIsSoundMuted(sound === "mute");
      applyTheme(theme, typo);
      audioSynthesizer.setProfile(sound);
      setLoading(false);
    }
    void init();
    return () => {
      active = false;
    };
  }, [profileRepo, onboardingRepo]);

  useEffect(() => {
    const unlockAudio = () => {
      audioSynthesizer.ensureAudioContext();
    };
    window.addEventListener("pointerdown", unlockAudio, {
      once: true,
      passive: true,
    });
    window.addEventListener("keydown", unlockAudio, {
      once: true,
      passive: true,
    });
    return () => {
      window.removeEventListener("pointerdown", unlockAudio);
      window.removeEventListener("keydown", unlockAudio);
    };
  }, []);

  const service = useMemo(
    () => createOnboardingService(onboardingRepo, DEFINITION_VERSIONS),
    [onboardingRepo],
  );

  async function refreshSnapshotAndState() {
    const snap = await onboardingRepo.load();
    setSnapshot(snap);
    const derived = deriveOnboardingState(snap, DEFINITION_VERSIONS);
    setOnboardingState(derived);
    return snap;
  }

  async function handleSelectLocale(locale: UiLocale) {
    const profile = snapshot.profile ?? (await profileRepo.ensureGuest());
    await prefRepo.saveLocale(profile.id, locale);
    setDocumentLanguage(locale);
    await refreshSnapshotAndState();
  }

  async function handleThemeChange(theme: ThemeId) {
    setActiveTheme(theme);
    applyTheme(theme, activeTypography);
    const profile = snapshot.profile ?? (await profileRepo.ensureGuest());
    await prefRepo.savePreferences(profile.id, {
      theme,
      typography: activeTypography,
      fontFamily: activeTypography,
    });
    await refreshSnapshotAndState();
  }

  async function handleTypographyChange(typography: TypographyId) {
    setActiveTypography(typography);
    applyTheme(activeTheme, typography);
    const profile = snapshot.profile ?? (await profileRepo.ensureGuest());
    await prefRepo.savePreferences(profile.id, {
      theme: activeTheme,
      typography,
      fontFamily: typography,
    });
    await refreshSnapshotAndState();
  }

  async function handleSoundProfileChange(soundProfile: SoundProfileId) {
    setActiveSoundProfile(soundProfile);
    audioSynthesizer.setProfile(soundProfile);
    const profile = snapshot.profile ?? (await profileRepo.ensureGuest());
    await prefRepo.savePreferences(profile.id, {
      soundProfile,
    });
    await refreshSnapshotAndState();
  }

  function handleMuteToggle(muted: boolean) {
    setIsSoundMuted(muted);
    audioSynthesizer.setMuted(muted);
  }

  async function handleConfirmProfile(layoutProfileId: LayoutProfileId) {
    const profile = snapshot.profile ?? (await profileRepo.ensureGuest());
    await prefRepo.confirmLayout(profile.id, layoutProfileId);
    await refreshSnapshotAndState();
  }

  async function handleCompleteCalibration(passedStepIds: readonly string[]) {
    const profile = snapshot.profile;
    const layoutProfileId = snapshot.preference?.layoutProfileId;
    if (!profile || !layoutProfileId) return;

    const definition = KEYBOARD_DEFINITIONS[layoutProfileId];
    if (!definition) return;

    const result = await service.complete({
      calibrationId: definition.definitionId,
      passedStepIds,
      completedAt: Date.now(),
    });
    setGuidedStep("posture");
    await refreshSnapshotAndState();
    setOnboardingState(result.state);
  }

  async function handleCompleteGuided() {
    const result = await service.completeGuided();
    await refreshSnapshotAndState();
    setOnboardingState(result.state);
  }

  async function handleRetryCalibration() {
    const result = await service.retry();
    await refreshSnapshotAndState();
    setOnboardingState(result.state);
  }

  function handleChangeProfileRequest() {
    setOnboardingState(ONBOARDING_STATE.NEEDS_PROFILE_CONFIRMATION);
  }

  const surface = getActiveSurface(practice);
  const expected = getExpectedGrapheme(practice);
  const accuracy =
    practice.committedGraphemes + practice.errors === 0
      ? 100
      : Math.round(
          (practice.committedGraphemes /
            (practice.committedGraphemes + practice.errors)) *
            100,
        );

  function consumeInput(value: string) {
    audioSynthesizer.playKeyPressSound(activeSoundProfile, value);
    const result = consumeCommittedText(practice, value);

    setPractice(result.state);

    if (result.outcome === INPUT_OUTCOME.CORRECT) {
      setAnnouncement("Correct. Continue typing.");
    } else if (result.outcome === INPUT_OUTCOME.INCORRECT) {
      setAnnouncement(`Incorrect. The expected character is ${expected}.`);
    } else {
      setAnnouncement("Enter one character at a time. Paste is not supported.");
    }
  }

  function handleInput(event: FormEvent<HTMLTextAreaElement>) {
    if (!isComposing.current && event.currentTarget.value) {
      consumeInput(event.currentTarget.value);
      event.currentTarget.value = "";
    }
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Escape") {
      event.currentTarget.blur();
      setIsPaused(true);
      setAnnouncement("Practice paused.");
      return;
    }

    if (event.key === "Backspace") {
      audioSynthesizer.playKeyPressSound(activeSoundProfile, "Backspace");
      return;
    }

    if (
      event.key === " " ||
      event.key === "Spacebar" ||
      event.code === "Space"
    ) {
      event.preventDefault();
      consumeInput(" ");
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    }
  }

  function resumePractice() {
    setIsPaused(false);
    inputRef.current?.focus();
    setAnnouncement("Practice resumed.");
  }

  function pausePractice() {
    inputRef.current?.blur();
    setIsPaused(true);
    setAnnouncement("Practice paused.");
  }

  const phaseLabel =
    practice.phase === PRACTICE_PHASE.ENGLISH ? "English" : "Spanish";

  const currentLocale = snapshot.preference?.locale ?? "en";
  const confirmedProfile = snapshot.preference?.layoutProfileId;
  const t = getTranslation(currentLocale);

  function renderHeader() {
    return (
      <header className="relative border-b border-line px-5 py-4 sm:px-8">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-6">
          <a
            className="font-display text-xl font-semibold tracking-tight focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent cursor-pointer"
            href="/"
            onClick={(e) => {
              e.preventDefault();
              if (
                onboardingState === ONBOARDING_STATE.GUIDED_EXERCISE_COMPLETE
              ) {
                setPracticeMode("starter");
              }
            }}
          >
            Entrama
          </a>
          <div className="flex flex-wrap items-center gap-3 sm:gap-4">
            {onboardingState === ONBOARDING_STATE.GUIDED_EXERCISE_COMPLETE && (
              <div
                aria-label="Practice mode switcher"
                className="flex items-center rounded-lg border border-line bg-panel p-0.5 text-xs font-semibold"
                role="group"
              >
                <button
                  aria-pressed={practiceMode === "starter"}
                  className={`rounded-md px-2.5 py-1 transition-colors cursor-pointer ${
                    practiceMode === "starter"
                      ? "bg-ink font-bold text-paper shadow-sm"
                      : "text-muted hover:text-ink"
                  }`}
                  onClick={() => setPracticeMode("starter")}
                  type="button"
                >
                  {t.modes.starter}
                </button>
                <button
                  aria-pressed={practiceMode === "free"}
                  className={`rounded-md px-2.5 py-1 transition-colors cursor-pointer ${
                    practiceMode === "free"
                      ? "bg-ink font-bold text-paper shadow-sm"
                      : "text-muted hover:text-ink"
                  }`}
                  onClick={() => setPracticeMode("free")}
                  type="button"
                >
                  {t.modes.freeTyping}
                </button>
                <button
                  aria-pressed={practiceMode === "dashboard"}
                  className={`rounded-md px-2.5 py-1 transition-colors cursor-pointer ${
                    practiceMode === "dashboard"
                      ? "bg-ink font-bold text-paper shadow-sm"
                      : "text-muted hover:text-ink"
                  }`}
                  onClick={() => setPracticeMode("dashboard")}
                  type="button"
                >
                  {t.modes.dashboard}
                </button>
              </div>
            )}

            {/* Quick Settings: Theme & Acoustics */}
            <div className="relative">
              <button
                type="button"
                data-testid="toggle-settings-button"
                aria-expanded={isSettingsOpen}
                aria-label={
                  currentLocale === "es"
                    ? "Ajustes de apariencia y sonido"
                    : "Appearance and audio settings"
                }
                onClick={() => setIsSettingsOpen((prev) => !prev)}
                className={`rounded-lg border border-line px-2.5 py-1 text-xs font-semibold transition-colors cursor-pointer ${
                  isSettingsOpen
                    ? "bg-ink text-paper"
                    : "bg-paper text-muted hover:text-ink hover:bg-panel"
                }`}
              >
                ⚙️ {currentLocale === "es" ? "Ajustes" : "Settings"}
              </button>

              {isSettingsOpen && (
                <div
                  data-testid="settings-panel"
                  className="absolute right-0 top-full mt-2 w-72 sm:w-80 rounded-2xl border border-line bg-panel p-5 shadow-xl z-50 flex flex-col gap-5 text-ink animate-in fade-in"
                >
                  <div className="flex items-center justify-between border-b border-line pb-3">
                    <span className="font-display font-bold text-sm">
                      {currentLocale === "es"
                        ? "Ajustes de Interfaz"
                        : "Display & Audio Settings"}
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsSettingsOpen(false)}
                      className="text-xs text-muted hover:text-ink cursor-pointer p-1"
                      aria-label="Close settings"
                    >
                      ✕
                    </button>
                  </div>

                  <ThemeSelector
                    activeTheme={activeTheme}
                    activeTypography={activeTypography}
                    locale={currentLocale}
                    onThemeChange={(theme) => void handleThemeChange(theme)}
                    onTypographyChange={(typo) =>
                      void handleTypographyChange(typo)
                    }
                  />

                  <div className="border-t border-line pt-4">
                    <SoundSelector
                      activeProfile={activeSoundProfile}
                      muted={isSoundMuted}
                      locale={currentLocale}
                      synthesizer={audioSynthesizer}
                      onProfileChange={(profile) =>
                        void handleSoundProfileChange(profile)
                      }
                      onMuteToggle={(muted) => handleMuteToggle(muted)}
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center gap-1 text-xs font-semibold text-muted">
              <button
                aria-label="Switch to English"
                className={`rounded px-2 py-1 transition-colors cursor-pointer ${
                  currentLocale === "en"
                    ? "bg-highlight font-bold text-ink"
                    : "hover:text-ink"
                }`}
                onClick={() => void handleSelectLocale("en")}
                type="button"
              >
                EN
              </button>
              <span aria-hidden="true">|</span>
              <button
                aria-label="Switch to Spanish"
                className={`rounded px-2 py-1 transition-colors cursor-pointer ${
                  currentLocale === "es"
                    ? "bg-highlight font-bold text-ink"
                    : "hover:text-ink"
                }`}
                onClick={() => void handleSelectLocale("es")}
                type="button"
              >
                ES
              </button>
            </div>

            {confirmedProfile && (
              <button
                className="text-xs text-muted underline decoration-line underline-offset-4 hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent cursor-pointer"
                onClick={handleChangeProfileRequest}
                type="button"
              >
                Change profile
              </button>
            )}

            <div className="hidden sm:flex items-center gap-2 text-xs font-semibold tracking-widest text-muted uppercase">
              <span
                aria-hidden="true"
                className="size-2 rounded-full bg-online"
              />
              Local practice
            </div>
          </div>
        </div>
      </header>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-paper text-ink">
        {renderHeader()}
        <main className="mx-auto max-w-6xl px-5 py-8 text-center sm:px-8 lg:py-14">
          <p className="text-muted">Loading...</p>
        </main>
      </div>
    );
  }

  if (onboardingState === ONBOARDING_STATE.NEEDS_UI_LANGUAGE) {
    return (
      <div className="min-h-screen bg-paper text-ink">
        {renderHeader()}
        <main className="mx-auto max-w-6xl px-5 py-8 sm:px-8 lg:py-14">
          <LanguageStep
            currentLocale={snapshot.preference?.locale}
            onSelectLocale={(loc) => void handleSelectLocale(loc)}
          />
        </main>
      </div>
    );
  }

  if (onboardingState === ONBOARDING_STATE.NEEDS_PROFILE_CONFIRMATION) {
    return (
      <div className="min-h-screen bg-paper text-ink">
        {renderHeader()}
        <main className="mx-auto max-w-6xl px-5 py-8 sm:px-8 lg:py-14">
          <ProfileStep
            confirmedProfileId={snapshot.preference?.layoutProfileId}
            locale={currentLocale}
            onConfirmProfile={(pid) => void handleConfirmProfile(pid)}
            suggestedProfileId={LAYOUT_PROFILE_ID.WINDOWS_US_INTERNATIONAL}
          />
        </main>
      </div>
    );
  }

  if (onboardingState === ONBOARDING_STATE.NEEDS_CALIBRATION) {
    const layoutProfileId = snapshot.preference?.layoutProfileId;
    const definition = layoutProfileId
      ? KEYBOARD_DEFINITIONS[layoutProfileId]
      : undefined;

    if (definition) {
      return (
        <div className="min-h-screen bg-paper text-ink">
          {renderHeader()}
          <main className="mx-auto max-w-6xl px-5 py-8 sm:px-8 lg:py-14">
            <CalibrationStep
              definition={definition}
              locale={currentLocale}
              onComplete={(passed) => void handleCompleteCalibration(passed)}
              onRetry={() => void handleRetryCalibration()}
              passedStepIds={snapshot.completion?.passedStepIds ?? []}
            />
          </main>
        </div>
      );
    }
  }

  if (onboardingState === ONBOARDING_STATE.NEEDS_GUIDED_EXERCISE) {
    return (
      <div className="min-h-screen bg-paper text-ink">
        {renderHeader()}
        <main className="mx-auto max-w-6xl px-5 py-8 sm:px-8 lg:py-14">
          {guidedStep === "posture" && (
            <GuidedPostureStep
              locale={currentLocale}
              onConfirm={() => setGuidedStep("fingerPlacement")}
            />
          )}
          {guidedStep === "fingerPlacement" && (
            <GuidedFingerPlacementStep
              locale={currentLocale}
              onConfirm={() => setGuidedStep("sequence")}
            />
          )}
          {guidedStep === "sequence" && (
            <GuidedSequenceStep
              locale={currentLocale}
              onComplete={() => void handleCompleteGuided()}
            />
          )}
        </main>
      </div>
    );
  }

  if (practiceMode === "dashboard") {
    return (
      <div className="min-h-screen bg-paper text-ink transition-opacity duration-200">
        {renderHeader()}
        <main className="mx-auto max-w-6xl px-5 py-8 sm:px-8 lg:py-14">
          <StatsDashboard
            key={currentLocale}
            locale={currentLocale}
            onStartPractice={() => setPracticeMode("free")}
            profileId={snapshot.profile?.id ?? "guest"}
            typingSessionRepository={typingSessionRepo}
          />
        </main>
      </div>
    );
  }

  if (practiceMode === "free") {
    return (
      <div className="min-h-screen bg-paper text-ink">
        {renderHeader()}
        <main className="mx-auto max-w-6xl px-5 py-8 sm:px-8 lg:py-14">
          <FreeTypingView
            key={currentLocale}
            locale={currentLocale}
            onSessionComplete={async (record: TypingSessionRecord) => {
              await typingSessionRepo.saveSession(record);
            }}
            profileId={snapshot.profile?.id ?? "guest"}
          />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-paper text-ink">
      {renderHeader()}

      <main className="mx-auto grid max-w-6xl gap-8 px-5 py-8 sm:px-8 lg:grid-cols-[minmax(0,1fr)_17rem] lg:py-14">
        <section aria-labelledby="practice-heading">
          <div className="mb-10 flex items-end justify-between gap-4">
            <div>
              <p className="mb-2 text-xs font-bold tracking-[0.2em] text-accent uppercase">
                Starter practice
              </p>
              <h1
                className="font-display text-3xl font-semibold tracking-tight sm:text-4xl"
                id="practice-heading"
              >
                Type what you see.
              </h1>
            </div>
            <p className="text-sm text-muted">
              Block {practice.completedBlocks + 1}
            </p>
          </div>

          <div
            className="relative overflow-hidden rounded-3xl border border-line bg-panel p-6 shadow-[0_24px_70px_-45px_rgba(23,33,27,0.55)] sm:p-10"
            onClick={() => inputRef.current?.focus()}
          >
            <div className="mb-8 flex items-center justify-between gap-4">
              <span className="rounded-full bg-ink px-3 py-1 text-xs font-bold tracking-wider text-paper uppercase">
                {phaseLabel}
              </span>
              <span className="text-sm text-muted">
                {practice.unitIndex + 1} / {practice.units.length}
              </span>
            </div>

            <div
              aria-label={`${phaseLabel} text: ${surface}`}
              className="flex min-h-32 flex-wrap content-center gap-x-1 font-display text-5xl font-medium leading-tight sm:text-7xl"
            >
              {segmentGraphemes(surface).map((grapheme, index) => {
                const isComplete = index < practice.position;
                const isCurrent = index === practice.position;
                const state = isComplete
                  ? GRAPHEME_STATE.COMPLETE
                  : isCurrent && practice.blockedByError
                    ? GRAPHEME_STATE.ERROR
                    : isCurrent
                      ? GRAPHEME_STATE.CURRENT
                      : GRAPHEME_STATE.PENDING;

                return (
                  <span
                    aria-current={isCurrent ? "true" : undefined}
                    className={getGraphemeClass(state)}
                    key={`${index}-${grapheme}`}
                  >
                    {grapheme === " " ? "\u00a0" : grapheme}
                  </span>
                );
              })}
            </div>

            <textarea
              aria-describedby="capture-help"
              aria-label="Typing practice input"
              autoCapitalize="off"
              autoComplete="off"
              autoCorrect="off"
              autoFocus
              className="sr-only"
              disabled={isPaused}
              onCompositionEnd={(event) => {
                isComposing.current = false;
                handleInput(event);
              }}
              onCompositionStart={() => {
                isComposing.current = true;
              }}
              onInput={handleInput}
              onKeyDown={handleKeyDown}
              onPaste={(event) => {
                event.preventDefault();
                setAnnouncement(
                  "Paste is not supported in this practice prototype.",
                );
              }}
              ref={inputRef}
              rows={1}
              spellCheck={false}
            />

            <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-line pt-5">
              <p className="text-sm text-muted" id="capture-help">
                {isPaused
                  ? "Practice is paused."
                  : "Type naturally. Press Escape to pause capture."}
              </p>
              <button
                className="rounded-full border border-ink px-4 py-2 text-sm font-semibold transition-colors hover:bg-ink hover:text-paper focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                onClick={isPaused ? resumePractice : pausePractice}
                type="button"
              >
                {isPaused ? "Resume practice" : "Pause practice"}
              </button>
            </div>
          </div>

          <p aria-live="polite" className="sr-only">
            {announcement}
          </p>
        </section>

        <aside
          aria-label="Practice guidance"
          className="grid content-start gap-5"
        >
          <section className="rounded-2xl border border-line bg-panel p-5">
            <p className="mb-4 text-xs font-bold tracking-widest text-muted uppercase">
              Next key
            </p>
            <div className="flex items-center gap-4">
              <kbd className="grid size-16 place-items-center rounded-xl border border-b-4 border-ink bg-paper font-display text-3xl font-semibold">
                {expected === " " ? "Space" : expected}
              </kbd>
              <p className="text-sm leading-6 text-muted">
                Layout guidance arrives after profile calibration.
              </p>
            </div>
          </section>

          <section className="rounded-2xl border border-line bg-ink p-5 text-paper">
            <p className="mb-5 text-xs font-bold tracking-widest text-paper/60 uppercase">
              Live practice
            </p>
            <dl className="grid grid-cols-2 gap-5">
              <div>
                <dt className="text-xs text-paper/60">Accuracy</dt>
                <dd className="mt-1 font-display text-3xl font-semibold">
                  {accuracy}%
                </dd>
              </div>
              <div>
                <dt className="text-xs text-paper/60">Errors</dt>
                <dd className="mt-1 font-display text-3xl font-semibold">
                  {practice.errors}
                </dd>
              </div>
            </dl>
          </section>

          <button
            className="text-left text-xs leading-5 text-muted underline decoration-line underline-offset-4 hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent disabled:cursor-not-allowed disabled:opacity-45"
            disabled={!isPaused}
            onClick={() =>
              updateServiceWorker && void updateServiceWorker(true)
            }
            type="button"
          >
            Check for a safe app update while paused
          </button>
        </aside>
      </main>
    </div>
  );
}

function getGraphemeClass(state: GraphemeState): string {
  const base =
    "relative rounded-sm px-0.5 transition-colors motion-reduce:transition-none";

  if (state === GRAPHEME_STATE.COMPLETE) {
    return `${base} text-accent`;
  }

  if (state === GRAPHEME_STATE.ERROR) {
    return `${base} bg-error-soft text-error underline decoration-2 underline-offset-8`;
  }

  if (state === GRAPHEME_STATE.CURRENT) {
    return `${base} bg-highlight text-ink underline decoration-2 underline-offset-8`;
  }

  return `${base} text-muted/45`;
}
