import type { UiLocale } from "../../onboarding/repositories";
import {
  FINGER_COLOR_CLASSES,
  LEFT_FINGERS,
  RIGHT_FINGERS,
  getFingerForKey,
  type FingerType,
  type HandFingerDef,
} from "./keyboardModel";

export type { FingerType };

export interface HandFingerGuideProps {
  readonly activeFinger?: FingerType;
  readonly activeKey?: string;
  readonly locale?: UiLocale;
  readonly className?: string;
}

export function HandFingerGuide({
  activeFinger,
  activeKey,
  locale = "en",
  className = "",
}: HandFingerGuideProps) {
  const resolvedActiveFinger =
    activeFinger || (activeKey ? getFingerForKey(activeKey) : undefined);
  const isEs = locale === "es";

  const renderHandSvg = (
    hand: "left" | "right",
    fingers: readonly HandFingerDef[],
  ) => {
    const isLeft = hand === "left";
    const title = isLeft
      ? isEs
        ? "Mano izquierda"
        : "Left Hand"
      : isEs
        ? "Mano derecha"
        : "Right Hand";

    return (
      <div
        className="flex flex-col items-center rounded-2xl border border-line bg-panel p-4"
        data-testid={`${hand}-hand`}
      >
        <span className="mb-2 font-display text-xs font-bold tracking-wider text-muted uppercase">
          {title}
        </span>
        <svg
          aria-hidden="true"
          className="size-36 drop-shadow-sm"
          viewBox="0 0 106 130"
        >
          {/* Palm base */}
          <path
            className="transition-colors"
            d={
              isLeft
                ? "M 12 75 C 10 95, 20 120, 52 122 C 80 120, 92 100, 88 80 C 84 75, 78 72, 70 72 C 60 72, 54 75, 48 75 C 40 75, 30 72, 22 72 C 16 72, 13 74, 12 75 Z"
                : "M 94 75 C 96 95, 86 120, 54 122 C 26 120, 14 100, 18 80 C 22 75, 28 72, 36 72 C 46 72, 52 75, 58 75 C 66 75, 76 72, 84 72 C 90 72, 93 74, 94 75 Z"
            }
            fill="var(--color-paper)"
            stroke="var(--color-line)"
            strokeWidth="2"
          />

          {/* Fingers */}
          {fingers.map((f) => {
            const isActive = resolvedActiveFinger === f.id;
            const colorConfig = FINGER_COLOR_CLASSES[f.id];

            return (
              <g
                data-active-finger={isActive ? "true" : "false"}
                data-finger-id={f.id}
                key={`${hand}-${f.id}-${f.x}`}
              >
                <rect
                  className="transition-all duration-200"
                  fill={isActive ? colorConfig.fill : "var(--color-panel)"}
                  height={f.height}
                  rx={f.rx}
                  stroke={isActive ? colorConfig.fill : "var(--color-line)"}
                  strokeWidth={isActive ? "2.5" : "1.5"}
                  width={f.width}
                  x={f.x}
                  y={f.y}
                />
                {isActive && (
                  <circle
                    cx={f.x + f.width / 2}
                    cy={f.y + 10}
                    fill="#ffffff"
                    r="2.5"
                  />
                )}
              </g>
            );
          })}
        </svg>

        {/* Finger pill badges */}
        <div className="mt-3 flex flex-wrap justify-center gap-1.5">
          {fingers
            .filter((f) => f.id !== "thumb")
            .map((f) => {
              const isActive = resolvedActiveFinger === f.id;
              const colorConfig = FINGER_COLOR_CLASSES[f.id];
              const label = isEs ? f.labelEs : f.labelEn;

              return (
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-semibold transition-all ${
                    isActive
                      ? `${colorConfig.bg} ${colorConfig.border} ${colorConfig.text} border font-bold scale-105`
                      : "border border-line/60 bg-paper text-muted"
                  }`}
                  key={`pill-${hand}-${f.id}`}
                >
                  {label}
                </span>
              );
            })}
        </div>
      </div>
    );
  };

  return (
    <div
      aria-label="Hand Finger Guide"
      className={`flex flex-col items-center justify-center gap-4 sm:flex-row ${className}`}
      data-testid="hand-finger-guide"
    >
      {renderHandSvg("left", LEFT_FINGERS)}
      {renderHandSvg("right", RIGHT_FINGERS)}
    </div>
  );
}
