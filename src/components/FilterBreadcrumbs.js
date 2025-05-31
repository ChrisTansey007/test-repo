import React from 'react';
import { X } from 'lucide-react';

/**
 * FilterBreadcrumbs Component
 * Displays active filters (from table and charts) as dismissible pills.
 *
 * @param {object} props - The component's props.
 * @param {object} props.tableFilters - The filters object from useTableManager (e.g., { queries: "search", Clicks: {min:10} }).
 * @param {string|null} props.activeChartFilter - String description of the active chart filter.
 * @param {Function} props.clearTableFilter - Function to clear a specific table filter (receives filter key).
 * @param {Function} props.clearChartFilter - Function to clear the active chart filter.
 * @param {Array<object>} props.columnConfigs - The configuration for table columns (key, header) to get display names.
 */
export const FilterBreadcrumbs = ({
  tableFilters,
  activeChartFilter,
  clearTableFilter,
  clearChartFilter,
  columnConfigs
}) => {
  const activeTableFilters = Object.entries(tableFilters)
    .filter(([key, value]) => {
      if (typeof value === 'string' && value !== '') return true;
      if (typeof value === 'object' && value !== null && (value.min !== null || value.max !== null)) {
        // Check if min or max is a non-empty string or a number
         return (value.min !== null && value.min !== '') || (value.max !== null && value.max !== '');
      }
      return false;
    })
    .map(([key, value]) => {
      const column = columnConfigs.find(c => c.key === key);
      const filterName = column ? column.header : key;
      let filterDisplayValue = '';
      if (typeof value === 'string') {
        filterDisplayValue = `"${value}"`;
      } else if (typeof value === 'object' && value !== null) {
        if (value.min !== null && value.min !== '' && value.max !== null && value.max !== '') {
          filterDisplayValue = `${value.min} - ${value.max}`;
        } else if (value.min !== null && value.min !== '') {
          filterDisplayValue = `>= ${value.min}`;
        } else if (value.max !== null && value.max !== '') {
          filterDisplayValue = `<= ${value.max}`;
        }
      }
      return { key, name: filterName, value: filterDisplayValue };
    });

  if (activeTableFilters.length === 0 && !activeChartFilter) {
    return null; // Don't render if no filters are active
  }

  return (
    <div className="py-2 px-1 mb-3 flex flex-wrap items-center gap-2 text-xs">
      <span className="text-gray-400 font-semibold">Active Filters:</span>
      {activeTableFilters.map(filter => (
        <span
          key={filter.key}
          className="flex items-center bg-gray-700 text-gray-200 px-2 py-1 rounded-full"
        >
          {filter.name}: {filter.value}
          <button
            onClick={() => clearTableFilter(filter.key)}
            className="ml-1.5 text-gray-400 hover:text-white"
            aria-label={`Clear filter for ${filter.name}`}
          >
            <X size={14} />
          </button>
        </span>
      ))}
      {activeChartFilter && (
        <span className="flex items-center bg-yellow-500/30 text-yellow-300 px-2 py-1 rounded-full">
          {activeChartFilter}
          <button
            onClick={clearChartFilter}
            className="ml-1.5 text-yellow-400 hover:text-yellow-200"
            aria-label="Clear chart filter"
          >
            <X size={14} />
          </button>
        </span>
      )}
    </div>
  );
};
