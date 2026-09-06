import { useId } from "react";
import {
  generateSparklineSvgPath,
  type SparklinePathResult,
  type SparklinePoint,
} from "./practiceDelightModel";

export type { SparklinePathResult, SparklinePoint };

export interface WpmSparklineProps {
  readonly samples: readonly number[];
  readonly currentWpm?: number;
  readonly width?: number;
  readonly height?: number;
  readonly className?: string;
  readonly label?: string;
}

export function WpmSparkline({
  samples,
  currentWpm,
  width = 160,
  height = 40,
  className = "",
  label = "WPM Cadence",
}: WpmSparklineProps) {
  const gradientId = useId();
  const sparkline = generateSparklineSvgPath(samples, width, height);

  return (
    <div
      aria-label={`${label}: ${currentWpm ?? sparkline.lastPoint?.value ?? 0} WPM`}
      className={`flex flex-col gap-1 ${className}`}
      data-testid="wpm-sparkline"
    >
      <svg
        aria-hidden="true"
        className="overflow-visible text-accent"
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        width={width}
      >
        <defs>
          <linearGradient id={gradientId} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="currentColor" stopOpacity="0.35" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {sparkline.areaData && (
          <path
            className="transition-all duration-300 motion-reduce:transition-none"
            d={sparkline.areaData}
            fill={`url(#${gradientId})`}
          />
        )}

        {sparkline.pathData && (
          <path
            className="transition-all duration-300 motion-reduce:transition-none"
            d={sparkline.pathData}
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
          />
        )}

        {sparkline.lastPoint && (
          <g>
            <circle
              className="animate-ping text-accent/40 motion-reduce:animate-none"
              cx={sparkline.lastPoint.x}
              cy={sparkline.lastPoint.y}
              fill="currentColor"
              r={4}
            />
            <circle
              className="text-accent"
              cx={sparkline.lastPoint.x}
              cy={sparkline.lastPoint.y}
              fill="currentColor"
              r={2.5}
            />
          </g>
        )}
      </svg>
    </div>
  );
}
