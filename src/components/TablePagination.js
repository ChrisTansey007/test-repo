import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

/**
 * TablePagination Component
 * Renders pagination controls for a table.
 *
 * @param {object} props - The component's props.
 * @param {number} props.currentPage - The current active page number.
 * @param {number} props.totalPages - The total number of pages.
 * @param {Function} props.goToPage - Function to navigate to a specific page.
 * @param {Function} props.nextPage - Function to navigate to the next page.
 * @param {Function} props.prevPage - Function to navigate to the previous page.
 * @param {number} props.totalFilteredRows - Total number of rows after filtering.
 * @param {number} props.itemsPerPage - Current number of items per page.
 */
export const TablePagination = ({
  currentPage,
  totalPages,
  goToPage,
  nextPage,
  prevPage,
  totalFilteredRows,
  itemsPerPage
}) => {
  if (totalPages <= 1) {
    return null; // Don't render pagination if there's only one page or less
  }

  const handlePageInputChange = (e) => {
    const pageNumber = Number(e.target.value);
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      goToPage(pageNumber);
    }
  };

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalFilteredRows);

  return (
    <div className="py-3 px-4 flex items-center justify-between border-t border-gray-700 bg-gray-850 rounded-b-lg">
      <div className="text-sm text-gray-400">
        Showing <span className="font-medium text-gray-200">{startItem}</span> to <span className="font-medium text-gray-200">{endItem}</span> of <span className="font-medium text-gray-200">{totalFilteredRows.toLocaleString()}</span> results
      </div>
      <div className="flex-1 flex justify-end items-center space-x-2">
        <button
          onClick={() => goToPage(1)}
          disabled={currentPage === 1}
          className="relative inline-flex items-center px-2 py-2 rounded-md border border-gray-600 bg-gray-700 text-sm font-medium text-gray-300 hover:bg-gray-600 disabled:opacity-50"
        >
          <ChevronsLeft size={18} />
        </button>
        <button
          onClick={() => prevPage()}
          disabled={currentPage === 1}
          className="relative inline-flex items-center px-2 py-2 rounded-md border border-gray-600 bg-gray-700 text-sm font-medium text-gray-300 hover:bg-gray-600 disabled:opacity-50"
        >
          <ChevronLeft size={18} />
        </button>
        <span className="text-sm text-gray-400">
          Page{' '}
          <input
            type="number"
            value={currentPage}
            onChange={handlePageInputChange}
            min="1"
            max={totalPages}
            className="mx-1 px-2 py-1 w-16 bg-gray-700 text-gray-200 border border-gray-600 rounded-md text-center focus:outline-none focus:ring-yellow-500 focus:border-yellow-500"
          />{' '}
          of {totalPages}
        </span>
        <button
          onClick={() => nextPage()}
          disabled={currentPage === totalPages}
          className="relative inline-flex items-center px-2 py-2 rounded-md border border-gray-600 bg-gray-700 text-sm font-medium text-gray-300 hover:bg-gray-600 disabled:opacity-50"
        >
          <ChevronRight size={18} />
        </button>
        <button
          onClick={() => goToPage(totalPages)}
          disabled={currentPage === totalPages}
          className="relative inline-flex items-center px-2 py-2 rounded-md border border-gray-600 bg-gray-700 text-sm font-medium text-gray-300 hover:bg-gray-600 disabled:opacity-50"
        >
          <ChevronsRight size={18} />
        </button>
      </div>
    </div>
  );
};
