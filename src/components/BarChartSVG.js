import React, { useState, useRef } from 'react';
import { TooltipSVG } from './TooltipSVG';

// --- SVG Bar Chart Component (Simplified for single metric) ---
/**
 * Renders an SVG-based bar chart.
 * This component displays vertical bars, typically used for showing magnitudes of different categories.
 * It includes features like tooltips on hover, customizable colors, and optional scrolling for many bars.
 *
 * @param {Object} props - The component's props.
 * @param {Object[]} props.data - An array of data objects to be plotted. Each object should contain at least a name key and a data key.
 * @param {string} props.dataKey - The key in each data object that holds the numerical value for the bar height.
 * @param {string} props.nameKey - The key in each data object that holds the name/label for each bar (x-axis category).
 * @param {number} [props.width=400] - The total width of the chart component in pixels.
 * @param {number} [props.height=300] - The total height of the chart component in pixels.
 * @param {string} [props.barColor="#63B3ED"] - The fill color for the bars (hex, rgb, or color name).
 * @param {string} [props.textColor="#A0AEC0"] - The color for text elements like axes labels and ticks.
 * @param {boolean} [props.isScrollable=false] - If true, the SVG width will expand to accommodate all bars with a minimum width,
 *                                             and the parent div will allow horizontal scrolling. If false, bars might become very thin if many are present.
 * @param {number} [props.minRecordsForChart=5] - The minimum number of data records required to render the chart.
 *                                               If data length is less than this, a "Not enough data" message is shown.
 * @returns {JSX.Element} The rendered bar chart component or a message if data is insufficient.
 */
export const BarChartSVG = ({
    data,
    dataKey,
    nameKey,
    width = 400,
    height = 300,
    barColor = "#63B3ED",
    textColor = "#A0AEC0",
    isScrollable = false,
    minRecordsForChart = 5
}) => {
  const [tooltip, setTooltip] = useState({ visible: false, content: null, x: 0, y: 0 });
  const chartContainerRef = useRef(null);
  const svgRef = useRef(null);

  if (!data || data.length < minRecordsForChart) {
    return (
        <div className="flex items-center justify-center h-full text-gray-500 p-4 text-sm">
            Not enough data to display this chart (min {minRecordsForChart} items required).
        </div>
    );
  }

  const padding = { top: 20, right: 20, bottom: 90, left: 60 };
  const chartHeight = height - padding.top - padding.bottom;

  const maxValue = Math.max(...data.map(d => d[dataKey]), 0);

  const numBars = data.length;
  let barWidthUser = 20;
  if (!isScrollable) {
      barWidthUser = Math.max(5, (width - padding.left - padding.right) / numBars * 0.7);
  }
  const barSpacing = barWidthUser * 0.3;
  const individualBarSpace = barWidthUser + barSpacing;
  const calculatedSvgWidth = (numBars * individualBarSpace) + padding.left + padding.right;
  const dynamicSvgWidth = isScrollable ? calculatedSvgWidth : width;

  const handleMouseMove = (e, item) => {
    if (!chartContainerRef.current) return;
    const rect = chartContainerRef.current.getBoundingClientRect();
    const scrollX = chartContainerRef.current.scrollLeft || 0;
    const scrollY = chartContainerRef.current.scrollTop || 0;

    setTooltip({
      visible: true,
      content: {
        name: item[nameKey],
        details: {
            [dataKey]: item[dataKey]
        }
      },
      x: e.clientX - rect.left + scrollX,
      y: e.clientY - rect.top + scrollY,
    });
  };

  const handleMouseLeave = () => {
    setTooltip({ visible: false, content: null, x: 0, y: 0 });
  };

  const numYTicks = 5;
  const yTicks = Array.from({ length: numYTicks + 1 }, (_, i) => Math.round(maxValue / numYTicks * i));

  return (
    <div
        ref={chartContainerRef}
        className="relative"
        style={{ width: `${width}px`, height: `${height}px`, overflowX: isScrollable ? 'auto' : 'hidden', overflowY: 'hidden' }}
    >
      <svg ref={svgRef} width={dynamicSvgWidth} height={height} className="font-sans">
        <line x1={padding.left} y1={padding.top} x2={padding.left} y2={padding.top + chartHeight} stroke={textColor} strokeWidth="1" />
        {yTicks.map((tick, i) => (
          <g key={`y-tick-${i}`}>
            <line
              x1={padding.left - 5} y1={padding.top + chartHeight - (tick / maxValue * chartHeight)}
              x2={padding.left} y2={padding.top + chartHeight - (tick / maxValue * chartHeight)}
              stroke={textColor} strokeWidth="1"
            />
            <text
              x={padding.left - 10} y={padding.top + chartHeight - (tick / maxValue * chartHeight) + 4}
              fill={textColor} fontSize="10" textAnchor="end"
            >
              {tick.toLocaleString()}
            </text>
          </g>
        ))}
        <text x={padding.left - 45} y={padding.top + chartHeight / 2} fill={textColor} fontSize="10" transform={`rotate(-90, ${padding.left - 45}, ${padding.top + chartHeight / 2})`} textAnchor="middle">{dataKey}</text>

        <line x1={padding.left} y1={padding.top + chartHeight} x2={dynamicSvgWidth - padding.right} y2={padding.top + chartHeight} stroke={textColor} strokeWidth="1" />

        {data.map((item, index) => {
          const barH = maxValue > 0 ? (item[dataKey] / maxValue) * chartHeight : 0;
          const x = padding.left + index * individualBarSpace + barSpacing / 2;
          const y = padding.top + chartHeight - barH;
          const label = (item[nameKey] || '').toString();

          return (
            <g key={index} onMouseMove={(e) => handleMouseMove(e, item)} onMouseLeave={handleMouseLeave}>
              <rect
                x={x}
                y={y}
                width={barWidthUser}
                height={barH > 0 ? barH : 0}
                fill={barColor}
                className="transition-opacity duration-150 hover:opacity-80"
              />
              <text
                x={x + barWidthUser / 2}
                y={padding.top + chartHeight + 15}
                fill={textColor}
                fontSize="9"
                textAnchor="end"
                transform={`rotate(-60, ${x + barWidthUser / 2}, ${padding.top + chartHeight + 15})`}
              >
                {label.length > 10 ? label.substring(0,8) + '...' : label}
              </text>
            </g>
          );
        })}
      </svg>
      <TooltipSVG {...tooltip} />
    </div>
  );
};
