/**
 * @fileoverview This file contains the useTableManager custom React hook,
 * which encapsulates logic for managing table state such as sorting,
 * filtering, and pagination.
 */

import { useState, useMemo } from 'react';

// --- Custom Hook for managing table data (unchanged) ---
/**
 * Custom hook to manage table state including sorting, filtering, and pagination.
 *
 * @param {Object[]} initialData An array of objects representing the initial dataset for the table.
 * @param {number} [initialItemsPerPage=10] The initial number of items to display per page.
 * @returns {{
 *   paginatedData: Object[],
 *   requestSort: Function,
 *   sortConfig: {key: string|null, direction: 'ascending'|'descending'},
 *   updateFilter: Function,
 *   clearFilter: Function,
 *   filters: Object,
 *   currentPage: number,
 *   totalPages: number,
 *   nextPage: Function,
 *   prevPage: Function,
 *   goToPage: Function,
 *   setItemsPerPage: Function,
 *   itemsPerPage: number,
 *   totalFilteredRows: number
 * }} An object containing:
 *  - `paginatedData`: Array of items for the current page after sorting and filtering.
 *  - `requestSort`: Function to request sorting by a specific key. Toggles direction on subsequent calls with the same key.
 *  - `sortConfig`: Object indicating the current sort key and direction.
 *  - `updateFilter`: Function to set or update a filter for a specific key.
 *  - `clearFilter`: Function to remove a filter for a specific key.
 *  - `filters`: Object representing the current active filters.
 *  - `currentPage`: The current active page number.
 *  - `totalPages`: The total number of pages based on filtered data and itemsPerPage.
 *  - `nextPage`: Function to navigate to the next page.
 *  - `prevPage`: Function to navigate to the previous page.
 *  - `goToPage`: Function to navigate to a specific page number.
 *  - `setItemsPerPage`: Function to update the number of items displayed per page.
 *  - `itemsPerPage`: The current number of items displayed per page.
 *  - `totalFilteredRows`: The total number of rows after applying filters (but before pagination).
 */
export const useTableManager = (initialData, initialItemsPerPage = 10) => {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });
  const [filters, setFilters] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(initialItemsPerPage);

  const sortedAndFilteredData = useMemo(() => {
    let processableData = [...initialData];
    Object.entries(filters).forEach(([key, filterValue]) => {
      if (filterValue === null || filterValue === undefined || filterValue === '') return;
      if (typeof filterValue === 'string') {
        processableData = processableData.filter(item =>
          item[key] && item[key].toString().toLowerCase().includes(filterValue.toLowerCase())
        );
      } else if (typeof filterValue === 'object' && ('min' in filterValue || 'max' in filterValue)) {
        processableData = processableData.filter(item => {
          const itemValue = parseFloat(item[key]);
          if (isNaN(itemValue)) return false;
          const { min, max } = filterValue;
          const minPass = (min === null || min === undefined || min === '') ? true : itemValue >= parseFloat(min);
          const maxPass = (max === null || max === undefined || max === '') ? true : itemValue <= parseFloat(max);
          return minPass && maxPass;
        });
      }
    });
    if (sortConfig.key) {
      processableData.sort((a, b) => {
        const valA = a[sortConfig.key];
        const valB = b[sortConfig.key];
        let comparison = 0;
        if (typeof valA === 'number' && typeof valB === 'number') {
          comparison = valA - valB;
        } else {
          comparison = (valA || '').toString().localeCompare((valB || '').toString());
        }
        return sortConfig.direction === 'ascending' ? comparison : -comparison;
      });
    }
    return processableData;
  }, [initialData, filters, sortConfig]);

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedAndFilteredData.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedAndFilteredData, currentPage, itemsPerPage]);

  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const updateFilter = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const clearFilter = (key) => {
    setFilters(prev => {
      const newFilters = {...prev};
      delete newFilters[key];
      return newFilters;
    });
    setCurrentPage(1);
  }

  const totalPages = Math.ceil(sortedAndFilteredData.length / itemsPerPage);
  const nextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));
  const prevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));
  const goToPage = (pageNumber) => setCurrentPage(Math.max(1, Math.min(pageNumber, totalPages)));

  return {
    paginatedData, requestSort, sortConfig, updateFilter, clearFilter, filters,
    currentPage, totalPages, nextPage, prevPage, goToPage, setItemsPerPage, itemsPerPage,
    totalFilteredRows: sortedAndFilteredData.length,
  };
};
