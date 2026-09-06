import React from "react";

export interface SmoothCaretProps {
  readonly x?: number;
  readonly y?: number;
  readonly height?: number;
  readonly visible?: boolean;
  readonly isError?: boolean;
  readonly isBlinking?: boolean;
  readonly className?: string;
}

export function SmoothCaret({
  x = 0,
  y = 0,
  height = 28,
  visible = true,
  isError = false,
  isBlinking = false,
  className = "",
}: SmoothCaretProps) {
  const prevYRef = React.useRef(y);
  // eslint-disable-next-line react-hooks/refs
  const isLineWrap = prevYRef.current !== y;

  React.useEffect(() => {
    prevYRef.current = y;
  }, [y]);

  const transformStyle = `translate3d(${x}px, ${y}px, 0px)`;

  const colorClasses = isError
    ? "bg-error shadow-[0_0_10px_var(--color-error)]"
    : "bg-accent shadow-[0_0_10px_var(--color-accent)]";

  const visibilityClass = visible ? "opacity-100" : "opacity-0";
  const blinkClass = isBlinking ? "animate-pulse" : "";
  const transitionClass = isLineWrap
    ? "transition-none"
    : "transition-transform duration-75 ease-out motion-reduce:transition-none";

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute left-0 top-0 z-20 w-[2.5px] rounded-full ${transitionClass} ${colorClasses} ${visibilityClass} ${blinkClass} ${className}`}
      data-blinking={isBlinking ? "true" : "false"}
      data-error={isError ? "true" : "false"}
      data-line-wrap={isLineWrap ? "true" : "false"}
      data-testid="smooth-caret"
      data-visible={visible ? "true" : "false"}
      style={{
        height: `${height}px`,
        transform: transformStyle,
      }}
    />
  );
}
