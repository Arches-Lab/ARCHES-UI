import { useMemo } from 'react';

interface ChartComponentProps {
  labels: string[];
  values: number[];
  /** When true, show a sample chart when there is no data so the chart area is visible */
  showSampleWhenEmpty?: boolean;
}

const SAMPLE_LABELS = ['No data', 'Sample', 'Chart'];
const SAMPLE_VALUES = [30, 70, 45];

// Wide viewBox (3:1) so chart fills page width with correct proportions
const VIEWBOX_W = 300;
const VIEWBOX_H = 100;
const MARGIN_LEFT = 28;
const MARGIN_RIGHT = 12;
const MARGIN_TOP = 8;
const MARGIN_BOTTOM = 32;
const CHART_WIDTH = VIEWBOX_W - MARGIN_LEFT - MARGIN_RIGHT;
const CHART_HEIGHT = VIEWBOX_H - MARGIN_TOP - MARGIN_BOTTOM;

function toChartX(index: number, count: number): number {
  if (count <= 1) return MARGIN_LEFT + CHART_WIDTH / 2;
  return MARGIN_LEFT + (index / (count - 1)) * CHART_WIDTH;
}

export default function ChartComponent({ labels, values, showSampleWhenEmpty = true }: ChartComponentProps) {
  const hasData = labels.length > 0 && values.length > 0;
  const displayLabels = hasData ? labels : SAMPLE_LABELS;
  const displayValues = hasData ? values : SAMPLE_VALUES;

  const { points, minVal, maxVal, range, yTicks } = useMemo(() => {
    if (displayLabels.length === 0 || displayValues.length === 0) {
      return { points: '', minVal: 0, maxVal: 0, range: 1, yTicks: [0] };
    }
    const maxValue = Math.max(...displayValues, 0);
    const minValue = Math.min(...displayValues, 0);
    const r = maxValue - minValue || 1;
    const n = displayValues.length;
    const pts = displayValues
      .map((value, index) => {
        const x = toChartX(index, n);
        const y = MARGIN_TOP + CHART_HEIGHT - ((value - minValue) / r) * CHART_HEIGHT;
        return `${x},${y}`;
      })
      .join(' ');
    const pointsStr = n === 1
      ? `${pts} ${MARGIN_LEFT + CHART_WIDTH},${pts.split(',')[1]}`
      : pts;
    // Y-axis ticks: min, max, and up to 3 steps
    const tickCount = Math.min(5, Math.max(2, Math.ceil(CHART_HEIGHT / 15)));
    const yTicks: number[] = [];
    for (let i = 0; i < tickCount; i++) {
      const t = minValue + (r * i) / (tickCount - 1);
      yTicks.push(Math.round(t * 10) / 10);
    }
    return { points: pointsStr, minVal: minValue, maxVal: maxValue, range: r, yTicks };
  }, [displayLabels.length, displayValues]);

  if (!hasData && !showSampleWhenEmpty) {
    return (
      <div className="min-h-64 flex items-center justify-center p-6 text-center text-gray-500">
        No trend data available. Add metric log entries to see the chart.
      </div>
    );
  }

  const n = displayValues.length;
  return (
    <div className="w-full min-w-0 min-h-64">
      {!hasData && (
        <p className="text-sm text-amber-600 mb-2">No trend data from server — showing sample chart.</p>
      )}
      <svg
        viewBox={`0 0 ${VIEWBOX_W} ${VIEWBOX_H}`}
        className="w-full block"
        style={{ width: '100%', height: 'auto', minHeight: 180, display: 'block' }}
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Y-axis label */}
        <text x={12} y={VIEWBOX_H / 2} textAnchor="middle" fill="#6b7280" fontSize="2.8" transform={`rotate(-90, 12, ${VIEWBOX_H / 2})`}>
          Amount
        </text>
        {/* Y-axis ticks and grid */}
        {yTicks.map((tick, i) => {
          const y = MARGIN_TOP + CHART_HEIGHT - ((tick - minVal) / range) * CHART_HEIGHT;
          return (
            <g key={`y-${i}-${tick}`}>
              <line x1={MARGIN_LEFT} y1={y} x2={MARGIN_LEFT + CHART_WIDTH} y2={y} stroke="#e5e7eb" strokeWidth="0.3" />
              <text x={MARGIN_LEFT - 2} y={y} textAnchor="end" fill="#4b5563" fontSize="2.5" dominantBaseline="middle">
                {tick}
              </text>
            </g>
          );
        })}
        {/* X-axis: month labels */}
        {displayLabels.map((label, index) => (
          <text
            key={`${label}-${index}`}
            x={toChartX(index, n)}
            y={VIEWBOX_H - 8}
            textAnchor="middle"
            fill="#4b5563"
            fontSize="2.8"
          >
            {label}
          </text>
        ))}
        {/* Chart line and points */}
        <polyline
          fill="none"
          stroke="#2563eb"
          strokeWidth="0.4"
          points={points}
        />
        {displayValues.map((value, index) => {
          const x = toChartX(index, n);
          const y = MARGIN_TOP + CHART_HEIGHT - ((value - minVal) / range) * CHART_HEIGHT;
          return (
            <circle key={`${displayLabels[index]}-${index}`} cx={x} cy={y} r="0.8" fill="#1d4ed8">
              <title>{displayLabels[index] ?? ''}: {value}</title>
            </circle>
          );
        })}
      </svg>
    </div>
  );
}
