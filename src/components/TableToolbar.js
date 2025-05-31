import React, { useState, useEffect } from 'react';
import { Filter, XCircle, Eye } from 'lucide-react';

/**
 * TableToolbar Component
 * Provides controls for filtering table data, managing column visibility, and items per page.
 *
 * @param {object} props - The component's props.
 * @param {Function} props.updateFilter - Function from useTableManager to update a filter value.
 * @param {Function} props.clearFilter - Function from useTableManager to clear a filter value.
 * @param {object} props.filters - The current filters object from useTableManager.
 * @param {Array<object>} props.allColumns - Array of all possible column objects (key, header).
 * @param {Array<string>} props.visibleColumns - Array of keys for currently visible columns.
 * @param {Function} props.setVisibleColumns - Setter function for visibleColumns state.
 * @param {number} props.itemsPerPage - Current number of items per page.
 * @param {Function} props.setItemsPerPage - Function to set items per page.
 */
export const TableToolbar = ({
  updateFilter,
  clearFilter,
  filters,
  allColumns,
  visibleColumns,
  setVisibleColumns,
  itemsPerPage,
  setItemsPerPage
}) => {
  const [textFilter, setTextFilter] = useState(filters['queries'] || '');
  const [numericFilters, setNumericFilters] = useState({
    Clicks: { min: filters['Clicks']?.min || '', max: filters['Clicks']?.max || '' },
    Impressions: { min: filters['Impressions']?.min || '', max: filters['Impressions']?.max || '' },
    CTR: { min: filters['CTR']?.min || '', max: filters['CTR']?.max || '' },
    Position: { min: filters['Position']?.min || '', max: filters['Position']?.max || '' },
  });
  const [showColumnSelector, setShowColumnSelector] = useState(false);

  useEffect(() => {
    setTextFilter(filters['queries'] || '');
    setNumericFilters({
      Clicks: { min: filters['Clicks']?.min || '', max: filters['Clicks']?.max || '' },
      Impressions: { min: filters['Impressions']?.min || '', max: filters['Impressions']?.max || '' },
      CTR: { min: filters['CTR']?.min || '', max: filters['CTR']?.max || '' },
      Position: { min: filters['Position']?.min || '', max: filters['Position']?.max || '' },
    });
  }, [filters]);

  const handleTextFilterChange = (e) => {
    setTextFilter(e.target.value);
    if (e.target.value === '') {
      clearFilter('queries');
    } else {
      updateFilter('queries', e.target.value);
    }
  };

  const handleNumericFilterChange = (columnKey, rangeKey, value) => {
    const updatedVal = value === '' ? '' : parseFloat(value);
    const newNumericFilters = {
      ...numericFilters,
      [columnKey]: {
        ...numericFilters[columnKey],
        [rangeKey]: updatedVal,
      },
    };
    setNumericFilters(newNumericFilters);

    const currentFilter = newNumericFilters[columnKey];
    if (currentFilter.min === '' && currentFilter.max === '') {
      clearFilter(columnKey);
    } else {
      updateFilter(columnKey, {
        min: currentFilter.min !== '' ? currentFilter.min : null,
        max: currentFilter.max !== '' ? currentFilter.max : null
      });
    }
  };

  const handleColumnToggle = (columnKey) => {
    setVisibleColumns(prev =>
      prev.includes(columnKey) ? prev.filter(c => c !== columnKey) : [...prev, columnKey]
    );
  };

  const numericFilterFields = [
    { key: 'Clicks', header: 'Clicks' },
    { key: 'Impressions', header: 'Impressions' },
    { key: 'CTR', header: 'CTR (%)' },
    { key: 'Position', header: 'Position' },
  ];

  return (
    <div className="p-4 bg-gray-850 rounded-t-lg space-y-4">
      {/* Text Filter */}
      <div className="flex items-center space-x-2">
        <Filter size={18} className="text-gray-400" />
        <input
          type="text"
          placeholder="Filter queries..."
          value={textFilter}
          onChange={handleTextFilterChange}
          className="px-3 py-2 bg-gray-700 text-gray-200 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 sm:text-sm w-full md:w-1/3"
        />
      </div>

      {/* Numeric Range Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {numericFilterFields.map(field => (
          <div key={field.key}>
            <label className="block text-xs font-medium text-gray-400 mb-1">{field.header}</label>
            <div className="flex space-x-2">
              <input
                type="number"
                placeholder="Min"
                value={numericFilters[field.key]?.min ?? ''}
                onChange={(e) => handleNumericFilterChange(field.key, 'min', e.target.value)}
                className="px-3 py-2 bg-gray-700 text-gray-200 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 sm:text-sm w-1/2"
              />
              <input
                type="number"
                placeholder="Max"
                value={numericFilters[field.key]?.max ?? ''}
                onChange={(e) => handleNumericFilterChange(field.key, 'max', e.target.value)}
                className="px-3 py-2 bg-gray-700 text-gray-200 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 sm:text-sm w-1/2"
              />
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Items Per Page Selector */}
        <div>
          <label htmlFor="itemsPerPage" className="text-xs font-medium text-gray-400 mr-2">Show:</label>
          <select
            id="itemsPerPage"
            value={itemsPerPage}
            onChange={(e) => setItemsPerPage(Number(e.target.value))}
            className="px-3 py-2 bg-gray-700 text-gray-200 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 sm:text-sm"
          >
            {[10, 25, 50, 100].map(size => (
              <option key={size} value={size}>{size} per page</option>
            ))}
          </select>
        </div>

        {/* Column Visibility Toggle */}
        <div className="relative">
          <button
            onClick={() => setShowColumnSelector(!showColumnSelector)}
            className="inline-flex items-center px-3 py-2 border border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-300 bg-gray-700 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-yellow-500"
          >
            <Eye size={16} className="mr-2" />
            Show/Hide Columns
          </button>
          {showColumnSelector && (
            <div className="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-gray-700 ring-1 ring-black ring-opacity-5 z-10 py-1">
              {allColumns.map(col => (
                <label key={col.key} className="flex items-center px-3 py-2 text-sm text-gray-200 hover:bg-gray-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={visibleColumns.includes(col.key)}
                    onChange={() => handleColumnToggle(col.key)}
                    className="form-checkbox h-4 w-4 text-yellow-500 bg-gray-600 border-gray-500 rounded focus:ring-yellow-600"
                  />
                  <span className="ml-2">{col.header}</span>
                </label>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
