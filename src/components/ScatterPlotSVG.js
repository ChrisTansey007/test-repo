import React, { useState, useRef, useMemo } from 'react';
import { TooltipSVG } from './TooltipSVG';
import { chartConfig } from '../config/appConfig.js';

/**
 * ScatterPlotSVG Component
 * Renders an SVG scatter plot, adaptable as a bubble chart.
 *
 * @param {object} props - The component's props.
 * @param {Array<object>} props.data - Array of data objects. Expected keys: props.xKey, props.yKey, props.bubbleKey, props.nameKey.
 * @param {string} props.xKey - Key in data objects for the x-axis value (e.g., 'Position').
 * @param {string} props.yKey - Key in data objects for the y-axis value (e.g., 'CTR').
 * @param {string} props.bubbleKey - Key in data objects for the bubble size value (e.g., 'Impressions').
 * @param {string} props.nameKey - Key in data objects for the item name/label (e.g., 'queries').
 * @param {number} [props.width=500] - Width of the SVG container.
 * @param {number} [props.height=350] - Height of the SVG container.
 * @param {string} [props.pointColor="#8884d8"] - Color of the scatter points/bubbles.
 * @param {string} [props.textColor="#A0AEC0"] - Color for axis labels and text.
 * @param {number} [props.minBubbleSize=3] - Minimum radius for bubbles.
 * @param {number} [props.maxBubbleSize=20] - Maximum radius for bubbles.
 * @param {Function} [props.onItemClick] - Optional callback when a point is clicked. Receives the data item.
 * @param {number} [props.minRecordsForChart=5] - Minimum number of records to render the chart.
 * @param {string} [props.xAxisLabel='X-Axis'] - Label for the X-axis.
 * @param {string} [props.yAxisLabel='Y-Axis'] - Label for the Y-axis.
 */
export const ScatterPlotSVG = ({
  data,
  xKey,
  yKey,
  bubbleKey,
  nameKey,
  width = chartConfig.dimensions.defaultWidth,
  height = chartConfig.dimensions.scatterPlotHeight,
  pointColor = chartConfig.colors.scatterPlot,
  textColor = chartConfig.colors.text,
  minBubbleSize = 3, // Could be moved to config
  maxBubbleSize = 20, // Could be moved to config
  onItemClick,
  minRecordsForChart = chartConfig.defaultMinRecords,
  xAxisLabel = 'X-Axis', // Specific labels should ideally be passed as props
  yAxisLabel = 'Y-Axis'  // Specific labels should ideally be passed as props
}) => {
  const [tooltip, setTooltip] = useState({ visible: false, content: null, x: 0, y: 0 });
  const chartContainerRef = useRef(null);

  const processedData = useMemo(() => {
    if (!data || data.length === 0) return [];
    return data.map(d => ({
      ...d,
      x: parseFloat(d[xKey]),
      y: parseFloat(d[yKey]),
      size: parseFloat(d[bubbleKey]),
      name: d[nameKey]
    })).filter(d => !isNaN(d.x) && !isNaN(d.y) && !isNaN(d.size));
  }, [data, xKey, yKey, bubbleKey, nameKey]);

  if (processedData.length < minRecordsForChart) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500 p-4 text-sm">
        Not enough data to display scatter plot (min {minRecordsForChart} items required).
      </div>
    );
  }

  const padding = { top: 20, right: 30, bottom: 60, left: 70 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  const xDomain = useMemo(() => {
    const values = processedData.map(d => d.x);
    return [Math.min(...values), Math.max(...values)];
  }, [processedData]);

  const yDomain = useMemo(() => {
    const values = processedData.map(d => d.y);
    return [Math.min(...values), Math.max(...values)];
  }, [processedData]);

  const sizeDomain = useMemo(() => {
    const values = processedData.map(d => d.size);
    const minVal = Math.min(...values);
    const maxVal = Math.max(...values);
    return [minVal === maxVal ? 0 : minVal, maxVal]; // Avoid division by zero if all sizes are same
  }, [processedData]);

  const xScale = (value) => {
    const domainWidth = xDomain[1] - xDomain[0];
    if (domainWidth === 0) return padding.left + chartWidth / 2;
    return padding.left + ((value - xDomain[0]) / domainWidth) * chartWidth;
  };

  const yScale = (value) => {
    const domainHeight = yDomain[1] - yDomain[0];
    if (domainHeight === 0) return padding.top + chartHeight / 2;
    // Y-axis is inverted in SVG
    return padding.top + chartHeight - ((value - yDomain[0]) / domainHeight) * chartHeight;
  };

  const rScale = (value) => {
    const domainSize = sizeDomain[1] - sizeDomain[0];
    if (domainSize === 0) return minBubbleSize;
    const proportion = (value - sizeDomain[0]) / domainSize;
    return minBubbleSize + proportion * (maxBubbleSize - minBubbleSize);
  };

  const handleMouseMove = (e, item) => {
    if (!chartContainerRef.current) return;
    const rect = chartContainerRef.current.getBoundingClientRect();
    setTooltip({
      visible: true,
      content: {
        name: item.name,
        details: {
          [xKey]: item.x.toFixed(2),
          [yKey]: item.y.toFixed(2),
          [bubbleKey]: item.size.toLocaleString(),
        },
      },
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const handleMouseLeave = () => {
    setTooltip({ visible: false, content: null, x: 0, y: 0 });
  };

  // Axis Ticks (simplified)
  const numXTicks = 5;
  const xTicks = Array.from({ length: numXTicks + 1 }, (_, i) =>
    xDomain[0] + (i * (xDomain[1] - xDomain[0])) / numXTicks
  );
  const numYTicks = 5;
  const yTicks = Array.from({ length: numYTicks + 1 }, (_, i) =>
    yDomain[0] + (i * (yDomain[1] - yDomain[0])) / numYTicks
  );

  return (
    <div ref={chartContainerRef} className="relative" style={{ width: `${width}px`, height: `${height}px` }}>
      <svg width={width} height={height} className="font-sans">
        {/* X Axis */}
        <line x1={padding.left} y1={padding.top + chartHeight} x2={padding.left + chartWidth} y2={padding.top + chartHeight} stroke={textColor} strokeWidth="1" />
        {xTicks.map((tick, i) => (
          <g key={`x-tick-${i}`} transform={`translate(${xScale(tick)}, ${padding.top + chartHeight})`}>
            <line y2="5" stroke={textColor} strokeWidth="1" />
            <text y="20" textAnchor="middle" fill={textColor} fontSize="10">
              {tick.toFixed(xKey === 'Position' ? 1 : 2)}
            </text>
          </g>
        ))}
        <text x={padding.left + chartWidth / 2} y={height - padding.bottom / 2 + 15} textAnchor="middle" fill={textColor} fontSize="12">
          {xAxisLabel}
        </text>

        {/* Y Axis */}
        <line x1={padding.left} y1={padding.top} x2={padding.left} y2={padding.top + chartHeight} stroke={textColor} strokeWidth="1" />
        {yTicks.map((tick, i) => (
          <g key={`y-tick-${i}`} transform={`translate(${padding.left}, ${yScale(tick)})`}>
            <line x2="-5" stroke={textColor} strokeWidth="1" />
            <text x="-10" dy="3" textAnchor="end" fill={textColor} fontSize="10">
              {tick.toFixed(yKey === 'CTR' ? 2 : 1)}
            </text>
          </g>
        ))}
        <text
            transform={`translate(${padding.left / 2 - 10}, ${padding.top + chartHeight / 2}) rotate(-90)`}
            textAnchor="middle"
            fill={textColor}
            fontSize="12"
        >
          {yAxisLabel}
        </text>

        {/* Data Points */}
        {processedData.map((item, index) => (
          <circle
            key={index}
            cx={xScale(item.x)}
            cy={yScale(item.y)}
            r={rScale(item.size)}
            fill={pointColor}
            opacity="0.6"
            onMouseMove={(e) => handleMouseMove(e, item)}
            onMouseLeave={handleMouseLeave}
            onClick={() => onItemClick && onItemClick(item)}
            style={onItemClick ? { cursor: 'pointer' } : {}}
          />
        ))}
      </svg>
      <TooltipSVG {...tooltip} />
    </div>
  );
};
