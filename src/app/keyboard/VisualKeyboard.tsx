import React from "react";
import type { LayoutProfileId } from "../../keyboard-layouts/types";
import {
  FINGER_COLOR_CLASSES,
  KEYBOARD_ROWS,
  getKeyInfoForProfile,
  getKeyUnitWidth,
  mapTargetToCode,
  type KeyDef,
} from "./keyboardModel";

export type { KeyDef };

export interface VisualKeyboardProps {
  readonly activeKey?: string;
  readonly activeCode?: string;
  readonly pressedKeys?: ReadonlySet<string> | readonly string[];
  readonly layoutProfileId?: LayoutProfileId;
  readonly showFingerColors?: boolean;
  readonly className?: string;
  readonly size?: "sm" | "md" | "lg";
}

export function VisualKeyboard({
  activeKey,
  activeCode,
  pressedKeys,
  layoutProfileId,
  showFingerColors = true,
  className = "",
  size = "md",
}: VisualKeyboardProps) {
  const targetCode =
    activeCode ||
    (activeKey ? mapTargetToCode(activeKey, layoutProfileId) : "");

  const pressedSet = React.useMemo(() => {
    if (!pressedKeys) return new Set<string>();
    if (pressedKeys instanceof Set) return pressedKeys;
    return new Set(pressedKeys);
  }, [pressedKeys]);

  const sizeClasses = {
    sm: "gap-1 p-2 text-xs",
    md: "gap-1.5 p-3 text-sm",
    lg: "gap-2 p-4 text-base",
  }[size];

  const keyHeightClasses = {
    sm: "h-8",
    md: "h-11",
    lg: "h-14",
  }[size];

  return (
    <div
      aria-label="Interactive Visual Keyboard"
      className={`select-none rounded-2xl border border-line bg-panel shadow-md ${sizeClasses} ${className}`}
      data-testid="visual-keyboard"
    >
      <div className="flex flex-col gap-1.5">
        {KEYBOARD_ROWS.map((row, rowIndex) => (
          <div
            className="flex w-full items-center gap-1 sm:gap-1.5"
            data-keyboard-row={rowIndex}
            key={`row-${rowIndex}`}
          >
            {row.map((k) => {
              const info = getKeyInfoForProfile(k.code, layoutProfileId);
              const isTarget = targetCode === k.code;
              const isPressed = pressedSet.has(k.code);
              const colorConfig = FINGER_COLOR_CLASSES[k.finger];
              const fingerColorStyle = showFingerColors
                ? colorConfig.border
                : "border-line";
              const unit = k.unitWidth ?? getKeyUnitWidth(k.code);

              return (
                <div
                  className={`relative flex min-w-0 ${keyHeightClasses} items-center justify-center rounded-lg border font-display font-semibold transition-all duration-100 select-none ${
                    isPressed
                      ? "scale-95 translate-y-0.5 border-b border-accent bg-accent text-paper shadow-inner"
                      : isTarget
                        ? `${colorConfig.glow} scale-105 border-2 border-accent bg-highlight text-ink font-bold z-10 animate-pulse ring-2 ring-accent ring-offset-1 ring-offset-panel`
                        : showFingerColors
                          ? `${fingerColorStyle} border-b-2 bg-paper text-ink/90 hover:border-line/90 shadow-xs`
                          : "border-line border-b-2 bg-paper text-ink/90 shadow-xs"
                  }`}
                  data-active-target={isTarget ? "true" : "false"}
                  data-finger={k.finger}
                  data-key-code={k.code}
                  data-pressed={isPressed ? "true" : "false"}
                  data-unit-width={unit}
                  key={k.code}
                  style={{
                    flex: `${unit} 1 0%`,
                  }}
                >
                  <span className="flex flex-col items-center justify-center leading-none pointer-events-none truncate px-0.5">
                    {info.secondary && (
                      <span className="text-[9px] sm:text-[10px] text-muted/70 mb-0.5">
                        {info.secondary}
                      </span>
                    )}
                    <span className="capitalize text-xs sm:text-sm">
                      {info.primary.length === 1
                        ? info.primary.toUpperCase()
                        : info.primary}
                    </span>
                  </span>

                  {/* Homing tactile bump indicator */}
                  {k.isHoming && (
                    <span
                      className="absolute bottom-1 sm:bottom-1.5 h-0.5 w-2.5 sm:w-3 rounded-full bg-ink/50"
                      data-homing-nub="true"
                    />
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
