import React from 'react';

// Insight Card Component (unchanged)
export const InsightCard = ({ title, icon, children, recommendation, recommendationIcon }) => {
  const IconComponent = icon;
  const RecIconComponent = recommendationIcon;
  return (
    <div className="bg-gray-800 p-6 rounded-xl shadow-2xl flex flex-col">
      <h3 className="text-lg font-semibold text-yellow-300 mb-3 flex items-center">
        {IconComponent && <IconComponent className="mr-2 h-5 w-5" />}
        {title}
      </h3>
      <div className="text-sm text-gray-300 space-y-2 flex-grow">
        {children}
      </div>
      {recommendation && (
        <div className="mt-4 pt-3 border-t border-gray-700">
          <h4 className="text-xs font-semibold text-yellow-400 mb-1 flex items-center">
            {RecIconComponent && <RecIconComponent className="mr-1.5 h-4 w-4" />}
            Recommendations:
          </h4>
          <div className="text-xs text-gray-400 whitespace-pre-line">{recommendation}</div>
        </div>
      )}
    </div>
  );
};
