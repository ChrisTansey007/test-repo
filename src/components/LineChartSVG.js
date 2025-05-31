import React, { useState, useMemo, useRef } from 'react';
import { TooltipSVG } from './TooltipSVG';

// --- New SVG Line Chart Component (unchanged)---
/**
 * Renders an SVG-based line chart, typically used for time-series data.
 * This component can display two distinct lines on the same chart, with independent styling.
 * It includes features like tooltips on hover, customizable colors, and automatic scaling of axes.
 *
 * @param {Object} props - The component's props.
 * @param {Object[]} props.data - An array of data objects to be plotted. Each object should contain a date key and value keys.
 * @param {string} [props.dateKey="Date_val"] - The key in each data object that holds the date value (should be parseable by `new Date()`).
 * @param {string} [props.val1Key="Clicks"] - The key in each data object for the first line's numerical values.
 * @param {string} [props.val2Key="Impressions"] - The key in each data object for the second line's numerical values.
 * @param {string} [props.val1Color="#63B3ED"] - The stroke color for the first line.
 * @param {string} [props.val2Color="#4A5568"] - The stroke color for the second line.
 * @param {number} [props.width=400] - The total width of the chart component in pixels.
 * @param {number} [props.height=300] - The total height of the chart component in pixels.
 * @param {string} [props.textColor="#A0AEC0"] - The color for text elements like axes labels and ticks.
 * @param {number} [props.minRecordsForChart=5] - The minimum number of data records required to render the chart.
 *                                               A minimum of 2 is always enforced for line charts.
 *                                               If data length is less than this, a "Not enough data" message is shown.
 * @returns {JSX.Element} The rendered line chart component or a message if data is insufficient.
 */
export const LineChartSVG = ({
    data,
    dateKey = "Date_val",
    val1Key = "Clicks",
    val2Key = "Impressions",
    val1Color = "#63B3ED",
    val2Color = "#4A5568",
    width = 400,
    height = 300,
    textColor = "#A0AEC0",
    minRecordsForChart = 5
}) => {
    const [tooltip, setTooltip] = useState({ visible: false, content: null, x: 0, y: 0 });
    const chartContainerRef = useRef(null);

    if (!data || data.length < Math.max(2, minRecordsForChart) ) {
        return <div className="flex items-center justify-center h-full text-gray-500 p-4 text-sm">Not enough data for time-series chart (min {Math.max(2, minRecordsForChart)} items required).</div>;
    }

    const padding = { top: 20, right: 40, bottom: 50, left: 60 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    const sortedData = useMemo(() =>
        data.map(d => ({ ...d, [dateKey]: new Date(d[dateKey]) }))
           .sort((a, b) => a[dateKey] - b[dateKey]),
    [data, dateKey]);

    const minDate = sortedData[0][dateKey];
    const maxDate = sortedData[sortedData.length - 1][dateKey];

    const maxVal1 = Math.max(...sortedData.map(d => d[val1Key]), 0);
    const maxVal2 = Math.max(...sortedData.map(d => d[val2Key]), 0);
    const overallMaxValue = Math.max(maxVal1, maxVal2);

    const getX = (date) => {
        if (maxDate - minDate === 0) return padding.left; // Avoid division by zero if all dates are the same
        return padding.left + ((date - minDate) / (maxDate - minDate)) * chartWidth;
    };
    const getY = (value) => padding.top + chartHeight - (value / overallMaxValue) * chartHeight;

    const createPath = (valueKey) =>
        sortedData.map((d, i) => {
            const x = getX(d[dateKey]);
            const y = getY(d[valueKey]);
            return `${i === 0 ? 'M' : 'L'} ${x.toFixed(2)},${y.toFixed(2)}`;
        }).join(' ');

    const path1 = createPath(val1Key);
    const path2 = createPath(val2Key);

    const handleMouseMove = (e, pointData, valueKey) => {
        if (!chartContainerRef.current) return;
        const rect = chartContainerRef.current.getBoundingClientRect();
        setTooltip({
            visible: true,
            content: {
                name: pointData[dateKey].toLocaleDateString(),
                details: {
                    [val1Key]: pointData[val1Key],
                    [val2Key]: pointData[val2Key]
                }
            },
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
        });
    };
    const handleMouseLeave = () => setTooltip({ visible: false, content: null, x: 0, y: 0 });

    const xTicks = [
        sortedData[0],
        sortedData[Math.floor(sortedData.length / 2)],
        sortedData[sortedData.length - 1]
    ].filter(Boolean);

    const numYTicks = 5;
    const yTicks = Array.from({ length: numYTicks + 1 }, (_, i) => Math.round(overallMaxValue / numYTicks * i));


    return (
        <div ref={chartContainerRef} className="relative">
            <svg width={width} height={height} className="font-sans">
                {/* Y Axis */}
                <line x1={padding.left} y1={padding.top} x2={padding.left} y2={padding.top + chartHeight} stroke={textColor} strokeWidth="1" />
                {yTicks.map(tick => (
                    <text key={`y-${tick}`} x={padding.left - 8} y={getY(tick) + 3} fill={textColor} fontSize="10" textAnchor="end">{tick.toLocaleString()}</text>
                ))}
                 <text x={padding.left - 45} y={padding.top + chartHeight / 2} fill={textColor} fontSize="10" transform={`rotate(-90, ${padding.left - 45}, ${padding.top + chartHeight / 2})`} textAnchor="middle">Value</text>

                {/* X Axis */}
                <line x1={padding.left} y1={padding.top + chartHeight} x2={padding.left + chartWidth} y2={padding.top + chartHeight} stroke={textColor} strokeWidth="1" />
                {xTicks.map(tickData => (
                    <text key={tickData[dateKey].getTime()} x={getX(tickData[dateKey])} y={padding.top + chartHeight + 15} fill={textColor} fontSize="10" textAnchor="middle">
                        {`${tickData[dateKey].getMonth()+1}/${tickData[dateKey].getDate()}`}
                    </text>
                ))}
                 <text x={padding.left + chartWidth/2} y={padding.top + chartHeight + 35} fill={textColor} fontSize="10" textAnchor="middle">Date</text>

                {/* Data Lines */}
                <path d={path2} stroke={val2Color} strokeWidth="2" fill="none" opacity="0.7" />
                <path d={path1} stroke={val1Color} strokeWidth="2" fill="none" />

                {/* Data Points & Tooltip Triggers */}
                {sortedData.map((d, i) => {
                    const x = getX(d[dateKey]);
                    const y1 = getY(d[val1Key]);
                    const y2 = getY(d[val2Key]);
                    return (
                        <g key={`point-group-${i}`}>
                            {/* Larger invisible circles for easier mouseover */}
                            <circle cx={x} cy={y1} r="6" fill="transparent" onMouseMove={(e) => handleMouseMove(e, d, val1Key)} onMouseLeave={handleMouseLeave} />
                            <circle cx={x} cy={y2} r="6" fill="transparent" onMouseMove={(e) => handleMouseMove(e, d, val2Key)} onMouseLeave={handleMouseLeave} />
                            {/* Visible points */}
                            <circle cx={x} cy={y1} r="3" fill={val1Color} pointerEvents="none"/>
                            <circle cx={x} cy={y2} r="3" fill={val2Color} pointerEvents="none"/>
                        </g>
                    );
                })}
            </svg>
            <TooltipSVG {...tooltip} />
        </div>
    );
};
