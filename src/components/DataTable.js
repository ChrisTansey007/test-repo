import React from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

/**
 * DataTable Component
 * Renders a table with sortable columns and paginated data.
 *
 * @param {object} props - The component's props.
 * @param {Array<object>} props.data - The array of data objects to display for the current page.
 * @param {Array<object>} props.columns - Array of column configuration objects. Each object should have:
 *   - `key` (string): The key in the data object.
 *   - `header` (string): The text to display in the table header.
 *   - `sortable` (boolean, optional): Whether the column is sortable.
 * @param {Function} props.requestSort - Function to call when a column header is clicked for sorting.
 * @param {object} props.sortConfig - Object containing the current sort key and direction.
 *   - `key` (string): The key of the currently sorted column.
 *   - `direction` (string): 'ascending' or 'descending'.
 * @param {Array<string>} props.visibleColumns - Array of column keys that are currently visible.
 */
export const DataTable = ({ data, columns, requestSort, sortConfig, visibleColumns }) => {
  if (!data) {
    return <p>No data to display.</p>;
  }

  const getSortIndicator = (columnKey) => {
    if (sortConfig && sortConfig.key === columnKey) {
      if (sortConfig.direction === 'ascending') {
        return <ChevronUp size={16} className="inline ml-1" />;
      }
      return <ChevronDown size={16} className="inline ml-1" />;
    }
    return null;
  };

  const filteredColumns = columns.filter(col => visibleColumns.includes(col.key));

  return (
    <div className="overflow-x-auto bg-gray-800 shadow-md rounded-lg">
      <table className="min-w-full divide-y divide-gray-700">
        <thead className="bg-gray-750">
          <tr>
            {filteredColumns.map((column) => (
              <th
                key={column.key}
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-700"
                onClick={() => column.sortable && requestSort(column.key)}
              >
                {column.header}
                {column.sortable && getSortIndicator(column.key)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-gray-800 divide-y divide-gray-700">
          {data.length > 0 ? (
            data.map((row, rowIndex) => (
              <tr key={rowIndex} className="hover:bg-gray-750">
                {filteredColumns.map((column) => (
                  <td key={column.key} className="px-6 py-4 whitespace-nowrap text-sm text-gray-200">
                    {/* Handle specific formatting if needed, e.g., for CTR (percentages) or Position (decimals) */}
                    {column.key === 'CTR' ? `${parseFloat(row[column.key]).toFixed(2)}%` :
                     column.key === 'Position' ? parseFloat(row[column.key]).toFixed(2) :
                     row[column.key]}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={filteredColumns.length} className="px-6 py-4 text-center text-sm text-gray-500">
                No matching records found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};
