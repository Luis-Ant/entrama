import { useRef, useState, type FormEvent, type KeyboardEvent } from "react";

import {
  INPUT_OUTCOME,
  PRACTICE_PHASE,
  consumeCommittedText,
  createPracticeState,
  getActiveSurface,
  getExpectedGrapheme,
  segmentGraphemes,
  type PracticeUnit,
} from "../typing/practice";

interface AppProps {
  readonly updateServiceWorker: (reloadPage?: boolean) => Promise<void>;
}

const STARTER_UNITS: readonly PracticeUnit[] = [
  { id: "hello-hola", english: "hello", spanish: "hola" },
  { id: "home-casa", english: "home", spanish: "casa" },
];

const GRAPHEME_STATE = {
  COMPLETE: "complete",
  CURRENT: "current",
  ERROR: "error",
  PENDING: "pending",
} as const;

type GraphemeState = (typeof GRAPHEME_STATE)[keyof typeof GRAPHEME_STATE];

export function App({ updateServiceWorker }: AppProps) {
  const [practice, setPractice] = useState(() =>
    createPracticeState(STARTER_UNITS),
  );
  const [announcement, setAnnouncement] = useState(
    "Practice ready. Type the highlighted character.",
  );
  const [isPaused, setIsPaused] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const isComposing = useRef(false);
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

  return (
    <div className="min-h-screen bg-paper text-ink">
      <header className="border-b border-line px-5 py-4 sm:px-8">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-6">
          <a
            className="font-display text-xl font-semibold tracking-tight focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
            href="/"
          >
            Entrama
          </a>
          <div className="flex items-center gap-2 text-xs font-semibold tracking-widest text-muted uppercase">
            <span
              className="size-2 rounded-full bg-online"
              aria-hidden="true"
            />
            Local practice
          </div>
        </div>
      </header>

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
              className="flex min-h-32 flex-wrap content-center gap-x-1 font-display text-5xl leading-tight font-medium sm:text-7xl"
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
              autoFocus
              autoCapitalize="off"
              autoComplete="off"
              autoCorrect="off"
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
          className="grid content-start gap-5"
          aria-label="Practice guidance"
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
            onClick={() => void updateServiceWorker(true)}
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
