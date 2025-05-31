import React, { useState, useMemo, useRef } from 'react';
import { TooltipSVG } from './TooltipSVG';

// --- New Horizontal Bar Chart SVG Component (unchanged) ---
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

    const padding = { top: 20, right: 30, bottom: 30, left: 150 };
    const chartWidth = width - padding.left - padding.right;
    const numBars = displayData.length;
    const barHeightUser = Math.max(5, (height - padding.top - padding.bottom) / numBars * 0.7);
    const barSpacing = barHeightUser * 0.3;
    const individualBarTotalSpace = barHeightUser + barSpacing;
    const calculatedSvgHeight = (numBars * individualBarTotalSpace) + padding.top + padding.bottom;
    const dynamicSvgHeight = isScrollable ? calculatedSvgHeight : height;

    const maxValue = Math.max(...displayData.map(d => d[valueKey]), 0);

    const getX = (value) => padding.left + (value / maxValue) * chartWidth;
    const getY = (index) => padding.top + index * individualBarTotalSpace + barSpacing / 2;

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
        <div ref={chartContainerRef} className="relative" style={{ width: `${width}px`, height: `${height}px`, overflowY: isScrollable ? 'auto' : 'hidden', overflowX: 'hidden' }}>
            <svg width={width} height={dynamicSvgHeight} className="font-sans">
                <line x1={padding.left} y1={height - padding.bottom} x2={padding.left + chartWidth} y2={height - padding.bottom} stroke={textColor} strokeWidth="1" />
                {xTicks.map(tick => (
                    <g key={`x-${tick}`}>
                        <line x1={getX(tick)} y1={height - padding.bottom} x2={getX(tick)} y2={height - padding.bottom + 5} stroke={textColor} strokeWidth="1" />
                        <text x={getX(tick)} y={height - padding.bottom + 15} fill={textColor} fontSize="10" textAnchor="middle">{tick.toLocaleString()}</text>
                    </g>
                ))}
                 <text x={padding.left + chartWidth/2} y={height - padding.bottom + 28} fill={textColor} fontSize="10" textAnchor="middle">{valueKey}</text>

                {displayData.map((item, index) => {
                    const barW = maxValue > 0 ? (item[valueKey] / maxValue) * chartWidth : 0;
                    const yPos = getY(index);
                    let label = (item[nameKey] || '').toString();
                    try {
                        const url = new URL(label);
                        label = url.pathname + url.search + url.hash;
                        if (label === "/" || label === "") label = "Homepage";
                    } catch (e) { /* Not a valid URL, use as is */ }
                    if (label.length > 25) label = label.substring(0, 22) + '...';

                    return (
                        <g key={index} onMouseMove={(e) => handleMouseMove(e, item)} onMouseLeave={handleMouseLeave}>
                            <text x={padding.left - 8} y={yPos + barHeightUser / 2 + 3} fill={textColor} fontSize="9" textAnchor="end" title={item[nameKey]}>
                                {label}
                            </text>
                            <rect
                                x={padding.left}
                                y={yPos}
                                width={barW > 0 ? barW : 0}
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
