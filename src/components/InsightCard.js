import React from 'react';

// Insight Card Component (unchanged)
/**
 * A reusable card component for displaying insights or key metrics.
 * It features a title, an optional icon next to the title, primary content area,
 * and an optional recommendation section with its own icon.
 *
 * @param {Object} props - The component's props.
 * @param {string} props.title - The title of the insight card.
 * @param {React.ElementType} [props.icon] - Optional React component to be used as an icon next to the title.
 *                                           (e.g., a Lucide icon component).
 * @param {React.ReactNode} props.children - The main content to be displayed within the card.
 * @param {string} [props.recommendation] - Optional string containing a recommendation or further action.
 *                                          If provided, a recommendation section is displayed.
 * @param {React.ElementType} [props.recommendationIcon] - Optional React component for an icon in the recommendation section.
 * @returns {JSX.Element} The rendered insight card component.
 */
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
