import React from 'react';

// --- SVG Tooltip Component (unchanged) ---
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
