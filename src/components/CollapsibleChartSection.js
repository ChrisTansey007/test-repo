import React, { useState, useRef } from 'react';
import { XCircle, BarChart2 } from 'lucide-react';

// CollapsibleChartSection Component
export const CollapsibleChartSection = ({ title, icon: Icon, children, initialExpanded = false, iconColor = "text-gray-400" }) => {
  const [isExpanded, setIsExpanded] = useState(initialExpanded);
  const contentRef = useRef(null);

  const IconComponent = Icon || BarChart2; // Default icon if none provided

  return (
    <div
      className={`bg-gray-800 rounded-xl shadow-2xl flex flex-col transition-all duration-500 ease-in-out relative ${
        isExpanded ? 'p-4 min-h-[400px]' : 'p-3 w-32 h-32 rounded-full items-center justify-center cursor-pointer hover:bg-gray-750'
      }`}
      onClick={!isExpanded ? () => setIsExpanded(true) : undefined}
    >
      <div
        className={`flex w-full ${isExpanded ? 'items-center justify-between mb-3' : 'flex-col items-center justify-center text-center'}`}
      >
        <div className={`flex items-center ${isExpanded ? '' : 'flex-col'}`}>
          <IconComponent className={`transition-all duration-300 ${isExpanded ? `h-6 w-6 ${iconColor} mr-2` : `h-10 w-10 ${iconColor} mb-1`}`} />
          <h2 className={`font-semibold transition-all duration-300 ${isExpanded ? `text-xl ${iconColor.replace('text-','text-')}` : 'text-xs text-gray-300 mt-1'}`}>
            {title}
          </h2>
        </div>
        {isExpanded && (
          <button onClick={() => setIsExpanded(false)} className="text-gray-400 hover:text-white ml-auto p-1 rounded-full hover:bg-gray-700">
            <XCircle size={20} />
          </button>
        )}
      </div>

      <div
        ref={contentRef}
        style={{ maxHeight: isExpanded ? (contentRef.current?.scrollHeight || 1000) + "px" : "0px" }}
        className={`transition-all duration-500 ease-in-out overflow-hidden flex-grow flex flex-col ${isExpanded ? 'opacity-100' : 'opacity-0'}`}
      >
        {isExpanded && <div className="flex-grow overflow-hidden">{children}</div>}
      </div>
    </div>
  );
};
