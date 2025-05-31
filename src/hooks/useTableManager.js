import { useState, useMemo } from 'react';

// --- Custom Hook for managing table data (unchanged) ---
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
