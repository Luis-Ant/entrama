import { useState } from "react";
import type { UiLocale } from "../../onboarding/repositories";
import { getTranslation } from "../i18n";
import { HandFingerGuide } from "../keyboard/HandFingerGuide";
import { VisualKeyboard } from "../keyboard/VisualKeyboard";

export interface GuidedFingerPlacementStepProps {
  readonly locale: UiLocale;
  readonly onConfirm: () => void;
}

export function GuidedFingerPlacementStep({
  locale,
  onConfirm,
}: GuidedFingerPlacementStepProps) {
  const t = getTranslation(locale).guided.fingerPlacement;
  const isEs = locale === "es";
  const [selectedKey, setSelectedKey] = useState<string>("F");

  const leftHandKeys = [
    { key: "A", finger: t.fingers.pinky, code: "KeyA" },
    { key: "S", finger: t.fingers.ring, code: "KeyS" },
    { key: "D", finger: t.fingers.middle, code: "KeyD" },
    { key: "F", finger: t.fingers.index, code: "KeyF" },
  ];

  const rightHandKeys = [
    { key: "J", finger: t.fingers.index, code: "KeyJ" },
    { key: "K", finger: t.fingers.middle, code: "KeyK" },
    { key: "L", finger: t.fingers.ring, code: "KeyL" },
    { key: ";", finger: t.fingers.pinky, code: "Semicolon" },
  ];

  return (
    <section
      aria-labelledby="finger-placement-heading"
      className="mx-auto max-w-4xl p-6 sm:p-10"
    >
      <div className="mb-6 text-center sm:text-left">
        <p className="mb-2 text-xs font-bold tracking-[0.2em] text-accent uppercase">
          {t.leftHandTitle} & {t.rightHandTitle}
        </p>
        <h1
          className="font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl"
          id="finger-placement-heading"
        >
          {t.title}
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          {t.description}
        </p>
      </div>

      <div className="rounded-3xl border border-line bg-panel p-6 shadow-[0_24px_70px_-45px_rgba(23,33,27,0.55)] sm:p-8">
        {/* Hand Finger Diagram Guide */}
        <div className="mb-8 flex flex-col items-center justify-center">
          <HandFingerGuide
            activeKey={selectedKey}
            className="w-full justify-center"
            locale={locale}
          />
        </div>

        {/* Home Row Cards */}
        <div className="grid gap-6 sm:grid-cols-2">
          {/* Left Hand Card */}
          <div className="rounded-2xl border border-line bg-paper p-5 shadow-xs">
            <h2 className="mb-4 text-center font-display text-base font-semibold text-ink">
              {t.leftHandTitle}
            </h2>
            <div className="grid grid-cols-4 gap-2">
              {leftHandKeys.map((item) => {
                const isSelected = selectedKey === item.key;
                return (
                  <button
                    className={`flex flex-col items-center justify-between rounded-xl border p-3 text-center transition-all cursor-pointer ${
                      isSelected
                        ? "border-accent bg-highlight/80 scale-105 shadow-sm"
                        : "border-line bg-panel hover:border-line/90 hover:bg-panel/80"
                    }`}
                    key={`left-${item.key}`}
                    onClick={() => setSelectedKey(item.key)}
                    type="button"
                  >
                    <kbd className="mb-2 grid size-12 place-items-center rounded-xl border border-b-2 border-ink bg-paper font-display text-xl font-bold text-ink shadow-xs">
                      {item.key}
                    </kbd>
                    <span className="text-[11px] font-semibold text-accent uppercase">
                      {item.finger}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Hand Card */}
          <div className="rounded-2xl border border-line bg-paper p-5 shadow-xs">
            <h2 className="mb-4 text-center font-display text-base font-semibold text-ink">
              {t.rightHandTitle}
            </h2>
            <div className="grid grid-cols-4 gap-2">
              {rightHandKeys.map((item) => {
                const isSelected = selectedKey === item.key;
                return (
                  <button
                    className={`flex flex-col items-center justify-between rounded-xl border p-3 text-center transition-all cursor-pointer ${
                      isSelected
                        ? "border-accent bg-highlight/80 scale-105 shadow-sm"
                        : "border-line bg-panel hover:border-line/90 hover:bg-panel/80"
                    }`}
                    key={`right-${item.key}`}
                    onClick={() => setSelectedKey(item.key)}
                    type="button"
                  >
                    <kbd className="mb-2 grid size-12 place-items-center rounded-xl border border-b-2 border-ink bg-paper font-display text-xl font-bold text-ink shadow-xs">
                      {item.key}
                    </kbd>
                    <span className="text-[11px] font-semibold text-accent uppercase">
                      {item.finger}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Embedded Visual Keyboard */}
        <div className="mt-8">
          <p className="mb-2 text-center text-xs font-bold tracking-wider text-muted uppercase">
            {isEs ? "Distribución Fila Guía" : "Home Row Keyboard Layout"}
          </p>
          <div className="overflow-x-auto">
            <VisualKeyboard
              activeKey={selectedKey}
              className="mx-auto max-w-2xl"
              showFingerColors={true}
              size="sm"
            />
          </div>
        </div>

        <div className="mt-8 flex justify-end border-t border-line pt-6">
          <button
            className="w-full rounded-full bg-ink px-6 py-3 text-sm font-semibold text-paper transition-colors hover:bg-ink/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent sm:w-auto"
            onClick={onConfirm}
            type="button"
          >
            {t.confirmButton}
          </button>
        </div>
      </div>
    </section>
  );
}
