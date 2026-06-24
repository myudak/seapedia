import { Fragment } from "react";

type ChartPoint = { label: string; value: number };

type AreaLineChartProps = {
  points: ChartPoint[];
  /** Optional comparison series (same length) drawn as a dashed line. */
  compare?: number[];
  height?: number;
  formatValue?: (value: number) => string;
  /** Accessible description. */
  caption?: string;
};

const WIDTH = 720;
const PAD_L = 56;
const PAD_R = 18;
const PAD_T = 18;
const PAD_B = 34;

function niceMax(value: number) {
  if (value <= 0) return 10;
  const magnitude = Math.pow(10, Math.floor(Math.log10(value)));
  const normalized = value / magnitude;
  const step =
    normalized <= 1 ? 1 : normalized <= 2 ? 2 : normalized <= 5 ? 5 : 10;
  return step * magnitude;
}

function compactNumber(value: number) {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}jt`;
  if (value >= 1_000) return `${Math.round(value / 1_000)}rb`;
  return `${Math.round(value)}`;
}

/**
 * Dependency-free responsive line/area chart rendered as inline SVG.
 * Renders on the server — no client JS required.
 */
export function AreaLineChart({
  points,
  compare,
  height = 260,
  formatValue = compactNumber,
  caption,
}: AreaLineChartProps) {
  const innerW = WIDTH - PAD_L - PAD_R;
  const innerH = height - PAD_T - PAD_B;

  const allValues = [
    ...points.map((point) => point.value),
    ...(compare ?? []),
  ];
  const max = niceMax(Math.max(1, ...allValues));
  const count = Math.max(points.length, 1);

  const x = (index: number) =>
    PAD_L + (count === 1 ? innerW / 2 : (index / (count - 1)) * innerW);
  const y = (value: number) => PAD_T + innerH - (value / max) * innerH;

  const linePath = points
    .map((point, index) => `${index === 0 ? "M" : "L"}${x(index)},${y(point.value)}`)
    .join(" ");
  const areaPath =
    points.length > 0
      ? `${linePath} L${x(points.length - 1)},${PAD_T + innerH} L${x(0)},${
          PAD_T + innerH
        } Z`
      : "";
  const comparePath = compare
    ? compare
        .map((value, index) => `${index === 0 ? "M" : "L"}${x(index)},${y(value)}`)
        .join(" ")
    : null;

  const gridLines = [0, 0.25, 0.5, 0.75, 1];

  return (
    <svg
      viewBox={`0 0 ${WIDTH} ${height}`}
      className="h-auto w-full"
      role="img"
      aria-label={caption ?? "Activity over time"}
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        <linearGradient id="area-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--danger)" stopOpacity="0.22" />
          <stop offset="100%" stopColor="var(--danger)" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* gridlines + Y labels */}
      {gridLines.map((ratio) => {
        const gy = PAD_T + innerH - ratio * innerH;
        return (
          <Fragment key={ratio}>
            <line
              x1={PAD_L}
              y1={gy}
              x2={WIDTH - PAD_R}
              y2={gy}
              stroke="var(--line)"
              strokeWidth={1}
            />
            <text
              x={PAD_L - 10}
              y={gy + 4}
              textAnchor="end"
              className="fill-[var(--muted)]"
              fontSize={11}
            >
              {formatValue(max * ratio)}
            </text>
          </Fragment>
        );
      })}

      {/* comparison (previous period) */}
      {comparePath ? (
        <path
          d={comparePath}
          fill="none"
          stroke="var(--muted)"
          strokeWidth={2}
          strokeDasharray="5 5"
          strokeLinecap="round"
          opacity={0.65}
        />
      ) : null}

      {/* current period area + line */}
      {areaPath ? <path d={areaPath} fill="url(#area-fill)" /> : null}
      {linePath ? (
        <path
          d={linePath}
          fill="none"
          stroke="var(--danger)"
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ) : null}

      {/* data dots + X labels */}
      {points.map((point, index) => (
        <Fragment key={point.label + index}>
          <circle
            cx={x(index)}
            cy={y(point.value)}
            r={3.5}
            fill="var(--surface)"
            stroke="var(--danger)"
            strokeWidth={2}
          />
          <text
            x={x(index)}
            y={height - 12}
            textAnchor="middle"
            className="fill-[var(--muted)]"
            fontSize={11}
          >
            {point.label}
          </text>
        </Fragment>
      ))}
    </svg>
  );
}
