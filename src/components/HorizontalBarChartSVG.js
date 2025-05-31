import React, { useState, useMemo, useRef } from 'react';
import { TooltipSVG } from './TooltipSVG';

// --- New Horizontal Bar Chart SVG Component (unchanged) ---
/**
 * Renders an SVG-based horizontal bar chart.
 * This component is typically used to display ranked data, such as top pages or top queries by a specific metric.
 * Bars are drawn horizontally, with labels on the y-axis and values on the x-axis.
 * It includes features like tooltips, customizable colors, optional scrolling, and display of top N items.
 *
 * @param {Object} props - The component's props.
 * @param {Object[]} props.data - An array of data objects to be plotted.
 * @param {string} props.valueKey - The key in each data object that holds the numerical value for the bar length.
 * @param {string} props.nameKey - The key in each data object that holds the name/label for each bar (y-axis category).
 *                                Labels derived from URLs are processed to show pathnames, and long labels are truncated.
 * @param {number} [props.width=400] - The total width of the chart component in pixels.
 * @param {number} [props.height=300] - The total height of the chart component in pixels.
 * @param {string} [props.barColor="#A78BFA"] - The fill color for the bars.
 * @param {string} [props.textColor="#A0AEC0"] - The color for text elements like axes labels and ticks.
 * @param {boolean} [props.isScrollable=false] - If true, the SVG height will expand to accommodate all bars (up to `topN`)
 *                                             with a minimum height, and the parent div will allow vertical scrolling.
 *                                             If false, bars might become very thin if many are present.
 * @param {number} [props.topN=15] - The maximum number of top items to display in the chart, sorted by `valueKey`.
 * @param {number} [props.minRecordsForChart=5] - The minimum number of data records (after filtering for `valueKey > 0`)
 *                                               required to render the chart. If data length is less, a message is shown.
 * @returns {JSX.Element} The rendered horizontal bar chart or a message if data is insufficient.
 */
export const HorizontalBarChartSVG = ({
    data,
    valueKey,
    nameKey,
    width = 400,
    height = 300,
    barColor = "#A78BFA",
    textColor = "#A0AEC0",
    isScrollable = false,
    topN = 15,
    minRecordsForChart = 5
}) => {
    const [tooltip, setTooltip] = useState({ visible: false, content: null, x: 0, y: 0 });
    const chartContainerRef = useRef(null);

    const displayData = useMemo(() =>
        data.filter(d => d[valueKey] > 0)
            .sort((a,b) => b[valueKey] - a[valueKey])
            .slice(0, topN),
    [data, valueKey, topN]);

    if (!displayData || displayData.length < minRecordsForChart) {
         return <div className="flex items-center justify-center h-full text-gray-500 p-4 text-sm">Not enough data for Top Pages chart (min {minRecordsForChart} items required).</div>;
    }

    const padding = { top: 20, right: 30, bottom: 30, left: 150 }; // Increased left padding for labels
    const chartWidth = width - padding.left - padding.right;

    const numBars = displayData.length;
    // Calculate bar height based on available chart height, ensuring a minimum interactive size
    const barHeightUser = Math.max(5, (height - padding.top - padding.bottom) / numBars * 0.7);
    const barSpacing = barHeightUser * 0.3; // Relative spacing
    const individualBarTotalSpace = barHeightUser + barSpacing;

    // Calculate dynamic SVG height if scrollable
    const calculatedSvgHeight = (numBars * individualBarTotalSpace) + padding.top + padding.bottom;
    const dynamicSvgHeight = isScrollable ? calculatedSvgHeight : height;

    const maxValue = Math.max(...displayData.map(d => d[valueKey]), 0);

    const getX = (value) => padding.left + (value / maxValue) * chartWidth;
    const getY = (index) => padding.top + index * individualBarTotalSpace + barSpacing / 2; // Position for the top of the bar

    const handleMouseMove = (e, item) => {
        if (!chartContainerRef.current) return;
        const rect = chartContainerRef.current.getBoundingClientRect();
        const scrollX = chartContainerRef.current.scrollLeft || 0;
        const scrollY = chartContainerRef.current.scrollTop || 0;
        setTooltip({
            visible: true,
            content: { name: item[nameKey], details: { [valueKey]: item[valueKey] } },
            x: e.clientX - rect.left + scrollX,
            y: e.clientY - rect.top + scrollY,
        });
    };
    const handleMouseLeave = () => setTooltip({ visible: false, content: null, x: 0, y: 0 });

    const numXTicks = 5;
    const xTicks = Array.from({ length: numXTicks + 1 }, (_, i) => Math.round(maxValue / numXTicks * i));

    return (
        <div
            ref={chartContainerRef}
            className="relative"
            style={{ width: `${width}px`, height: `${height}px`, overflowY: isScrollable ? 'auto' : 'hidden', overflowX: 'hidden' }}
        >
            <svg width={width} height={dynamicSvgHeight} className="font-sans">
                {/* X Axis Line (at the bottom) */}
                <line x1={padding.left} y1={height - padding.bottom} x2={padding.left + chartWidth} y2={height - padding.bottom} stroke={textColor} strokeWidth="1" />
                {/* X Axis Ticks and Labels */}
                {xTicks.map(tick => (
                    <g key={`x-${tick}`}>
                        <line x1={getX(tick)} y1={height - padding.bottom} x2={getX(tick)} y2={height - padding.bottom + 5} stroke={textColor} strokeWidth="1" />
                        <text x={getX(tick)} y={height - padding.bottom + 15} fill={textColor} fontSize="10" textAnchor="middle">{tick.toLocaleString()}</text>
                    </g>
                ))}
                {/* X Axis Title */}
                 <text x={padding.left + chartWidth/2} y={height - padding.bottom + 28} fill={textColor} fontSize="10" textAnchor="middle">{valueKey}</text>

                {/* Bars and Y Axis Labels */}
                {displayData.map((item, index) => {
                    const barW = maxValue > 0 ? (item[valueKey] / maxValue) * chartWidth : 0;
                    const yPos = getY(index);
                    let label = (item[nameKey] || '').toString();

                    // Attempt to parse as URL and extract path, otherwise use original
                    try {
                        const url = new URL(label);
                        label = url.pathname + url.search + url.hash; // includes path, query params, hash
                        if (label === "/" || label === "") label = "Homepage"; // Special case for root
                    } catch (e) { /* Not a valid URL, use as is */ }

                    if (label.length > 25) label = label.substring(0, 22) + '...'; // Truncate long labels

                    return (
                        <g key={index} onMouseMove={(e) => handleMouseMove(e, item)} onMouseLeave={handleMouseLeave}>
                            {/* Y Axis Label for each bar */}
                            <text x={padding.left - 8} y={yPos + barHeightUser / 2 + 3} fill={textColor} fontSize="9" textAnchor="end" title={item[nameKey] /* Show full name on hover */}>
                                {label}
                            </text>
                            {/* Bar Rectangle */}
                            <rect
                                x={padding.left}
                                y={yPos}
                                width={barW > 0 ? barW : 0} // Ensure non-negative width
                                height={barHeightUser}
                                fill={barColor}
                                className="transition-opacity duration-150 hover:opacity-80"
                            />
                        </g>
                    );
                })}
            </svg>
            <TooltipSVG {...tooltip} />
        </div>
    );
};
