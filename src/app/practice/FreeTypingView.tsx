import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";
import { getTranslation } from "../i18n";
import {
  getCatalogPassage,
  type CatalogCategory,
  type CatalogPassage,
} from "../../typing/catalogs";
import {
  consumeFreeTypingInput,
  createFreePracticeState,
  getExpectedGrapheme,
  pausePractice,
  resetPractice,
  resumePractice,
  tickTimer,
  type FreePracticeState,
  type TimerPreset,
} from "../../typing/free-practice";
import type {
  TypingSessionRecord,
  UiLocale,
} from "../../onboarding/repositories";
import type { LayoutProfileId } from "../../keyboard-layouts/types";
import { DEFAULT_SOUND_PROFILE, type SoundProfileId } from "../../styles/theme";
import { audioSynthesizer } from "../audio/audioSynthesizer";
import { VisualKeyboard } from "../keyboard/VisualKeyboard";
import { CatalogSelector } from "./CatalogSelector";
import { SessionSummaryModal } from "./SessionSummaryModal";
import { SmoothCaret } from "./SmoothCaret";
import { StreakBadge } from "./StreakBadge";
import { TimerSelector } from "./TimerSelector";
import { WpmSparkline } from "./WpmSparkline";

export interface FreeTypingViewProps {
  readonly profileId?: string;
  readonly locale?: UiLocale;
  readonly initialCategory?: CatalogCategory;
  readonly initialPreset?: TimerPreset;
  readonly initialPassage?: CatalogPassage;
  readonly soundProfile?: SoundProfileId;
  readonly layoutProfileId?: LayoutProfileId;
  readonly initialShowKeyboard?: boolean;
  readonly initialZenMode?: boolean;
  readonly onSessionComplete?: (
    record: TypingSessionRecord,
  ) => void | Promise<void>;
}

const GRAPHEME_STATE = {
  COMPLETE: "complete",
  CURRENT: "current",
  ERROR: "error",
  PENDING: "pending",
} as const;

type GraphemeState = (typeof GRAPHEME_STATE)[keyof typeof GRAPHEME_STATE];

export function FreeTypingView({
  profileId = "guest",
  locale = "en",
  initialCategory = "stories",
  initialPreset = 30,
  initialPassage,
  soundProfile = DEFAULT_SOUND_PROFILE,
  layoutProfileId,
  initialShowKeyboard = true,
  initialZenMode = false,
  onSessionComplete,
}: FreeTypingViewProps) {
  const t = getTranslation(locale);
  const ft = t.freeTyping;

  const [category, setCategory] = useState<CatalogCategory>(initialCategory);
  const [preset, setPreset] = useState<TimerPreset>(initialPreset);
  const [selectedPassage, setSelectedPassage] = useState<CatalogPassage>(
    () => initialPassage ?? getCatalogPassage(initialCategory, locale),
  );

  const [practiceState, setPracticeState] = useState<FreePracticeState>(() =>
    createFreePracticeState(selectedPassage, initialPreset),
  );

  const [showSetup, setShowSetup] = useState(false);
  const [showKeyboard, setShowKeyboard] = useState(initialShowKeyboard);
  const [zenMode, setZenMode] = useState(initialZenMode);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [wpmSamples, setWpmSamples] = useState<number[]>([0]);
  const [pressedKeys, setPressedKeys] = useState<Set<string>>(() => new Set());
  const [caretPos, setCaretPos] = useState({ x: 0, y: 0, height: 28 });
  const [announcement, setAnnouncement] = useState(ft.controls.startNotice);

  const inputRef = useRef<HTMLTextAreaElement>(null);
  const textContainerRef = useRef<HTMLDivElement>(null);
  const charRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const isComposing = useRef(false);
  const hasSavedSession = useRef(false);
  const isTabArmedRef = useRef(false);
  const tabArmedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync state if category/passage changes
  const handleSelectCategory = (newCategory: CatalogCategory) => {
    setCategory(newCategory);
    const newPassage = getCatalogPassage(newCategory, locale);
    setSelectedPassage(newPassage);
    setPracticeState(createFreePracticeState(newPassage, preset));
    setStreak(0);
    setBestStreak(0);
    setWpmSamples([0]);
    hasSavedSession.current = false;
  };

  const handleSelectPassage = (passage: CatalogPassage) => {
    setSelectedPassage(passage);
    setPracticeState(createFreePracticeState(passage, preset));
    setStreak(0);
    setBestStreak(0);
    setWpmSamples([0]);
    hasSavedSession.current = false;
  };

  const handleSelectPreset = (newPreset: TimerPreset) => {
    setPreset(newPreset);
    setPracticeState((prev) => resetPractice(prev, prev.passage, newPreset));
    setStreak(0);
    setBestStreak(0);
    setWpmSamples([0]);
    hasSavedSession.current = false;
  };

  // Timer tick interval and rolling WPM sample updates
  useEffect(() => {
    if (practiceState.status !== "running") return;

    const interval = setInterval(() => {
      setPracticeState((prev) => {
        const next = tickTimer(prev, Date.now());
        const currentNetWpm = Math.round(next.metrics.netWpm);
        setWpmSamples((samples) => {
          if (samples.length === 0) return [currentNetWpm];
          const lastSample = samples[samples.length - 1];
          if (lastSample === currentNetWpm && samples.length > 1)
            return samples;
          const nextSamples = [...samples, currentNetWpm];
          return nextSamples.slice(-40);
        });
        return next;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [practiceState.status]);

  // Focus capture textarea when active
  useEffect(() => {
    if (practiceState.status === "idle" || practiceState.status === "running") {
      inputRef.current?.focus();
    }
  }, [practiceState.status, practiceState.position]);

  // Caret sub-pixel tracking
  useEffect(() => {
    const container = textContainerRef.current;
    if (!container) return;

    const charIndex = practiceState.position;
    const charEl = charRefs.current[charIndex];

    if (charEl) {
      const containerRect = container.getBoundingClientRect();
      const charRect = charEl.getBoundingClientRect();

      if (charRect.width || charRect.height) {
        setCaretPos({
          x: charRect.left - containerRect.left,
          y: charRect.top - containerRect.top,
          height: charRect.height || 28,
        });
      } else {
        setCaretPos({
          x: charEl.offsetLeft,
          y: charEl.offsetTop,
          height: charEl.offsetHeight || 28,
        });
      }
    } else if (
      practiceState.graphemes.length > 0 &&
      charIndex >= practiceState.graphemes.length
    ) {
      const lastEl = charRefs.current[practiceState.graphemes.length - 1];
      if (lastEl) {
        setCaretPos({
          x: lastEl.offsetLeft + lastEl.offsetWidth,
          y: lastEl.offsetTop,
          height: lastEl.offsetHeight || 28,
        });
      }
    }
  }, [practiceState.position, practiceState.graphemes.length]);

  // Keyup listener for pressed keys release
  useEffect(() => {
    function handleWindowKeyUp(event: globalThis.KeyboardEvent) {
      setPressedKeys((prev) => {
        if (!prev.has(event.code)) return prev;
        const next = new Set(prev);
        next.delete(event.code);
        return next;
      });
    }

    window.addEventListener("keyup", handleWindowKeyUp);
    return () => window.removeEventListener("keyup", handleWindowKeyUp);
  }, []);

  // Cleanup tab armed timer on unmount
  useEffect(() => {
    return () => {
      if (tabArmedTimerRef.current) {
        clearTimeout(tabArmedTimerRef.current);
      }
    };
  }, []);

  // Session completion effect
  useEffect(() => {
    if (practiceState.status === "completed" && !hasSavedSession.current) {
      hasSavedSession.current = true;
      setAnnouncement(ft.controls.completedAnnouncement);

      const sessionRecord: TypingSessionRecord = {
        id: `session-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        profileId,
        timestamp: practiceState.endTime ?? Date.now(),
        completedAt: practiceState.endTime ?? Date.now(),
        category: practiceState.passage.category,
        locale: practiceState.passage.locale,
        durationPreset: practiceState.durationPreset,
        presetSeconds: practiceState.durationPreset,
        netWpm: practiceState.metrics.netWpm,
        grossWpm: practiceState.metrics.grossWpm,
        accuracy: practiceState.metrics.accuracy,
        characterCount: practiceState.committedGraphemes,
        errorCount: practiceState.totalErrors,
        elapsedSeconds: practiceState.elapsedSeconds,
      };

      if (onSessionComplete) {
        void onSessionComplete(sessionRecord);
      }
    }
  }, [
    practiceState,
    profileId,
    onSessionComplete,
    ft.controls.completedAnnouncement,
  ]);

  const handleInput = (event: FormEvent<HTMLTextAreaElement>) => {
    if (isComposing.current || !event.currentTarget.value) return;

    const val = event.currentTarget.value;
    event.currentTarget.value = "";

    // Trigger acoustic feedback
    audioSynthesizer.playKeyPressSound(soundProfile, val);

    const expected = getExpectedGrapheme(practiceState);
    if (val === expected) {
      setStreak((s) => {
        const next = s + 1;
        setBestStreak((b) => Math.max(b, next));
        return next;
      });
    } else {
      setStreak(0);
    }

    setPracticeState((prev) => {
      const next = consumeFreeTypingInput(prev, val, Date.now());
      return next;
    });
  };

  const handleRetry = () => {
    hasSavedSession.current = false;
    isTabArmedRef.current = false;
    if (tabArmedTimerRef.current) {
      clearTimeout(tabArmedTimerRef.current);
    }
    setPracticeState(createFreePracticeState(selectedPassage, preset));
    setStreak(0);
    setBestStreak(0);
    setWpmSamples([0]);
    setShowSetup(false);
    setAnnouncement(ft.controls.startNotice);
    inputRef.current?.focus();
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const handleKeyDown = (event: ReactKeyboardEvent<HTMLTextAreaElement>) => {
    if (event.code) {
      setPressedKeys((prev) => {
        if (prev.has(event.code)) return prev;
        const next = new Set(prev);
        next.add(event.code);
        return next;
      });
    }

    if (event.key === "Tab") {
      event.preventDefault();
      isTabArmedRef.current = true;
      if (tabArmedTimerRef.current) {
        clearTimeout(tabArmedTimerRef.current);
      }
      tabArmedTimerRef.current = setTimeout(() => {
        isTabArmedRef.current = false;
      }, 2000);
      return;
    }

    if (event.key === "Enter") {
      if (isTabArmedRef.current || pressedKeys.has("Tab") || event.shiftKey) {
        event.preventDefault();
        if (tabArmedTimerRef.current) {
          clearTimeout(tabArmedTimerRef.current);
        }
        isTabArmedRef.current = false;
        handleRetry();
        return;
      }
    }

    if (event.key === "Escape") {
      if (practiceState.status === "running") {
        setPracticeState((prev) => pausePractice(prev, Date.now()));
        setAnnouncement(ft.controls.pausedAnnouncement);
      } else if (practiceState.status === "paused") {
        setPracticeState((prev) => resumePractice(prev, Date.now()));
        setAnnouncement(ft.controls.resumedAnnouncement);
      }
      return;
    }

    if (event.key === "Backspace") {
      audioSynthesizer.playKeyPressSound(soundProfile, "Backspace");
      if (practiceState.isBlockedByError) {
        event.preventDefault();
        setPracticeState((prev) =>
          consumeFreeTypingInput(prev, "Backspace", Date.now()),
        );
      }
      return;
    }

    if (
      event.key === " " ||
      event.key === "Spacebar" ||
      event.code === "Space"
    ) {
      event.preventDefault();
      audioSynthesizer.playKeyPressSound(soundProfile, " ");

      const expected = getExpectedGrapheme(practiceState);
      if (expected === " ") {
        setStreak((s) => {
          const next = s + 1;
          setBestStreak((b) => Math.max(b, next));
          return next;
        });
      } else {
        setStreak(0);
      }

      setPracticeState((prev) => consumeFreeTypingInput(prev, " ", Date.now()));
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    }
  };

  const handleTogglePause = () => {
    if (practiceState.status === "running") {
      setPracticeState((prev) => pausePractice(prev, Date.now()));
      setAnnouncement(ft.controls.pausedAnnouncement);
    } else if (practiceState.status === "paused") {
      setPracticeState((prev) => resumePractice(prev, Date.now()));
      setAnnouncement(ft.controls.resumedAnnouncement);
      inputRef.current?.focus();
    }
  };

  const expectedChar = getExpectedGrapheme(practiceState);

  // Time display calculation
  const timeDisplay =
    practiceState.durationPreset !== null
      ? `${practiceState.remainingSeconds ?? practiceState.durationPreset}s`
      : `${practiceState.elapsedSeconds}s`;

  return (
    <div className="space-y-8">
      {/* Top Configuration & Timer Bar */}
      <div
        className={`flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-line bg-panel p-4 sm:px-6 transition-all duration-300 ${
          zenMode ? "opacity-90 py-3" : ""
        }`}
      >
        <div
          className={`flex items-center gap-4 transition-all duration-300 ${
            zenMode ? "hidden sm:flex" : ""
          }`}
        >
          <TimerSelector
            disabled={practiceState.status === "running"}
            locale={locale}
            onSelectPreset={handleSelectPreset}
            selectedPreset={preset}
          />
        </div>

        <div className="flex items-center gap-3">
          {!zenMode && (
            <>
              <button
                aria-pressed={showKeyboard}
                className={`rounded-full border px-4 py-1.5 text-xs font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
                  showKeyboard
                    ? "border-ink bg-ink text-paper"
                    : "border-line bg-paper text-muted hover:border-ink hover:text-ink"
                }`}
                onClick={() => setShowKeyboard((prev) => !prev)}
                type="button"
              >
                {showKeyboard
                  ? ft.controls.hideKeyboard
                  : ft.controls.showKeyboard}
              </button>
              <button
                className="rounded-full border border-line bg-paper px-4 py-1.5 text-xs font-semibold text-muted transition-colors hover:border-ink hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                onClick={() => setShowSetup((prev) => !prev)}
                type="button"
              >
                {showSetup ? "Hide Passages" : "Change Passage"}
              </button>
            </>
          )}
          <button
            aria-pressed={zenMode}
            className={`rounded-full border px-4 py-1.5 text-xs font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
              zenMode
                ? "border-accent bg-accent text-paper shadow-xs"
                : "border-line bg-paper text-muted hover:border-ink hover:text-ink"
            }`}
            data-testid="toggle-zen-mode-button"
            onClick={() => {
              setZenMode((prev) => !prev);
              inputRef.current?.focus();
            }}
            type="button"
          >
            {zenMode ? ft.controls.exitZenMode : ft.controls.zenMode}
          </button>
          <button
            className="rounded-full border border-ink bg-ink px-4 py-1.5 text-xs font-semibold text-paper transition-all hover:opacity-90 active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            onClick={handleRetry}
            type="button"
          >
            {ft.controls.reset}
          </button>
        </div>
      </div>

      {/* Catalog Selector Collapsible / Dropdown */}
      {!zenMode && showSetup && (
        <div className="rounded-3xl border border-line bg-panel/70 p-6 shadow-sm">
          <CatalogSelector
            disabled={practiceState.status === "running"}
            locale={locale}
            onSelectCategory={handleSelectCategory}
            onSelectPassage={(p) => {
              handleSelectPassage(p);
              setShowSetup(false);
            }}
            selectedCategory={category}
            selectedPassageId={selectedPassage.id}
          />
        </div>
      )}

      {/* Main Practice Container */}
      <main
        className={`grid gap-8 transition-all duration-300 ${
          zenMode
            ? "max-w-4xl mx-auto w-full"
            : "lg:grid-cols-[minmax(0,1fr)_17rem]"
        }`}
      >
        <section aria-labelledby="free-practice-heading" className="space-y-4">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-bold tracking-[0.2em] text-accent uppercase">
                {ft.categories[category]} • {selectedPassage.difficulty}
              </p>
              <h1
                className="font-display text-2xl font-semibold tracking-tight sm:text-3xl"
                id="free-practice-heading"
              >
                {selectedPassage.title}
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <StreakBadge locale={locale} streak={streak} />
              <span className="rounded-full bg-ink px-3 py-1 text-xs font-bold tracking-wider text-paper uppercase">
                {practiceState.passage.locale.toUpperCase()}
              </span>
            </div>
          </div>

          <div
            className="relative overflow-hidden rounded-3xl border border-line bg-panel p-6 shadow-[0_24px_70px_-45px_rgba(23,33,27,0.55)] sm:p-10 cursor-text"
            onClick={() => inputRef.current?.focus()}
          >
            {/* Live Text Surface */}
            <div
              aria-label={`Typing text: ${selectedPassage.title}`}
              className="relative flex min-h-48 flex-wrap content-start gap-x-0.5 font-display text-2xl font-medium leading-relaxed sm:text-3xl"
              ref={textContainerRef}
            >
              {/* Smooth Gliding Caret */}
              <SmoothCaret
                height={caretPos.height}
                isBlinking={
                  practiceState.status === "idle" ||
                  practiceState.status === "paused"
                }
                isError={practiceState.isBlockedByError}
                visible={practiceState.status !== "completed"}
                x={caretPos.x}
                y={caretPos.y}
              />

              {practiceState.graphemes.map((grapheme, index) => {
                const isComplete = index < practiceState.position;
                const isCurrent = index === practiceState.position;
                const state = isComplete
                  ? GRAPHEME_STATE.COMPLETE
                  : isCurrent && practiceState.isBlockedByError
                    ? GRAPHEME_STATE.ERROR
                    : isCurrent
                      ? GRAPHEME_STATE.CURRENT
                      : GRAPHEME_STATE.PENDING;

                return (
                  <span
                    aria-current={isCurrent ? "true" : undefined}
                    className={getGraphemeClass(state)}
                    key={`${index}-${grapheme}`}
                    ref={(el) => {
                      charRefs.current[index] = el;
                    }}
                  >
                    {grapheme === " " ? "\u00a0" : grapheme}
                  </span>
                );
              })}
            </div>

            {/* Invisible Input Area */}
            <textarea
              aria-describedby="free-capture-help"
              aria-label="Free typing practice input"
              autoCapitalize="off"
              autoComplete="off"
              autoCorrect="off"
              autoFocus
              className="sr-only"
              disabled={
                practiceState.status === "completed" ||
                practiceState.status === "paused"
              }
              onCompositionEnd={(event) => {
                isComposing.current = false;
                handleInput(event);
              }}
              onCompositionStart={() => {
                isComposing.current = true;
              }}
              onInput={handleInput}
              onKeyDown={handleKeyDown}
              onPaste={(e) => e.preventDefault()}
              ref={inputRef}
              rows={1}
              spellCheck={false}
            />

            {/* Control Strip */}
            <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-line pt-5">
              <div className="flex items-center gap-3">
                <p className="text-sm text-muted" id="free-capture-help">
                  {practiceState.status === "paused"
                    ? ft.controls.pausedAnnouncement
                    : practiceState.status === "idle"
                      ? ft.controls.startNotice
                      : ft.controls.pauseNotice}
                </p>
                <span className="hidden text-xs text-muted/60 sm:inline">
                  • {ft.controls.quickRestart}
                </span>
              </div>

              {practiceState.status !== "idle" &&
                practiceState.status !== "completed" && (
                  <button
                    className="rounded-full border border-ink px-4 py-1.5 text-sm font-semibold transition-colors hover:bg-ink hover:text-paper focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                    onClick={handleTogglePause}
                    type="button"
                  >
                    {practiceState.status === "paused"
                      ? ft.controls.resume
                      : ft.controls.pause}
                  </button>
                )}
            </div>
          </div>

          {/* Interactive Visual Keyboard below typing area */}
          {!zenMode && showKeyboard && (
            <div className="pt-2 animate-fade-in motion-reduce:animate-none">
              <VisualKeyboard
                activeKey={expectedChar}
                layoutProfileId={layoutProfileId}
                pressedKeys={pressedKeys}
                size="sm"
              />
            </div>
          )}

          <p aria-live="polite" className="sr-only">
            {announcement}
          </p>
        </section>

        {/* Live Gauges / Stats Aside */}
        {!zenMode && (
          <aside
            aria-label="Live typing metrics"
            className="grid content-start gap-5 animate-fade-in motion-reduce:animate-none"
            data-testid="free-typing-aside"
          >
            {/* Next Character Guidance */}
            <section className="rounded-2xl border border-line bg-panel p-5">
              <p className="mb-3 text-xs font-bold tracking-widest text-muted uppercase">
                Next Character
              </p>
              <div className="flex items-center gap-4">
                <kbd className="grid size-14 place-items-center rounded-xl border border-b-4 border-ink bg-paper font-display text-2xl font-semibold shadow-xs">
                  {expectedChar === " "
                    ? "Space"
                    : expectedChar === ""
                      ? "✓"
                      : expectedChar}
                </kbd>
                <p className="text-xs leading-5 text-muted">
                  {practiceState.isBlockedByError
                    ? "Press Backspace to correct the error."
                    : "Type the highlighted character."}
                </p>
              </div>
            </section>

            {/* Real-time Telemetry Card */}
            <section className="rounded-2xl border border-line bg-ink p-5 text-paper shadow-md">
              <div className="mb-4 flex items-center justify-between">
                <p className="text-xs font-bold tracking-widest text-paper/60 uppercase">
                  {ft.title}
                </p>
                <span className="font-mono text-xs font-semibold text-accent">
                  {timeDisplay}
                </span>
              </div>

              {/* Live WPM Sparkline */}
              <div className="mb-4 rounded-xl bg-paper/5 p-2.5">
                <div className="mb-1 flex items-center justify-between text-[10px] font-bold tracking-wider text-paper/60 uppercase">
                  <span>{ft.controls.cadence}</span>
                  <span className="text-accent font-mono">
                    {Math.round(practiceState.metrics.netWpm)} WPM
                  </span>
                </div>
                <WpmSparkline
                  currentWpm={Math.round(practiceState.metrics.netWpm)}
                  height={36}
                  samples={wpmSamples}
                  width={200}
                />
              </div>

              <dl className="grid grid-cols-2 gap-5">
                <div>
                  <dt className="text-xs text-paper/60">{ft.stats.netWpm}</dt>
                  <dd className="mt-1 font-display text-3xl font-semibold">
                    {Math.round(practiceState.metrics.netWpm)}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-paper/60">{ft.stats.accuracy}</dt>
                  <dd className="mt-1 font-display text-3xl font-semibold text-accent">
                    {Math.round(practiceState.metrics.accuracy)}%
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-paper/60">{ft.stats.grossWpm}</dt>
                  <dd className="mt-1 font-display text-xl font-medium">
                    {Math.round(practiceState.metrics.grossWpm)}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-paper/60">{ft.stats.errors}</dt>
                  <dd className="mt-1 font-display text-xl font-medium text-error">
                    {practiceState.totalErrors}
                  </dd>
                </div>
              </dl>
            </section>
          </aside>
        )}
      </main>

      {/* Completion Modal */}
      <SessionSummaryModal
        accuracy={practiceState.metrics.accuracy}
        bestStreak={bestStreak}
        characterCount={practiceState.committedGraphemes}
        elapsedSeconds={practiceState.elapsedSeconds}
        errorCount={practiceState.totalErrors}
        grossWpm={practiceState.metrics.grossWpm}
        isOpen={practiceState.status === "completed"}
        locale={locale}
        netWpm={practiceState.metrics.netWpm}
        onChangeSetup={() => {
          handleRetry();
          setShowSetup(true);
        }}
        onClose={handleRetry}
        onRetry={handleRetry}
      />
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
