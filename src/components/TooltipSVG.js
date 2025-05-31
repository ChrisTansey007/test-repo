import React from 'react';

// --- SVG Tooltip Component (unchanged) ---
/**
 * A React component that displays a tooltip, typically for SVG charts.
 * The tooltip's content can be a simple string or an object with a name and details.
 * It positions itself absolutely based on x and y coordinates.
 *
 * @param {Object} props - The component's props.
 * @param {string|{name: string, details: Object}} props.content - The content to display in the tooltip.
 *   If a string, it's displayed directly. If an object, it should have a `name` property for the title
 *   and a `details` object where each key-value pair is displayed on a new line.
 * @param {number} props.x - The x-coordinate (e.g., mouse position) for placing the tooltip.
 *                           The tooltip will appear slightly offset from this point.
 * @param {number} props.y - The y-coordinate (e.g., mouse position) for placing the tooltip.
 *                           The tooltip will appear slightly offset from this point.
 * @param {boolean} props.visible - Controls whether the tooltip is visible or not.
 * @returns {JSX.Element|null} The rendered tooltip component or null if not visible or no content.
 */
export const TooltipSVG = ({ content, x, y, visible }) => {
  if (!visible || !content) return null;
  return (
    <div
      className="absolute bg-gray-900 text-white text-xs p-2 rounded-md shadow-lg pointer-events-none z-50 border border-gray-600"
      style={{ left: x + 10, top: y + 10, transition: 'opacity 0.1s', opacity: visible ? 1 : 0 }}
    >
      {typeof content === 'string' ? content : (
        <>
          <div className="font-bold break-all max-w-xs">{content.name}</div>
          {Object.entries(content.details).map(([key, value]) => (
            <div key={key}>{key.replace(/_val$/, '').replace(/_name$/, '').replace(/_bin$/, '')}: {typeof value === 'number' ? value.toLocaleString() : value}</div>
          ))}
        </>
      )}
    </div>
  );
};
