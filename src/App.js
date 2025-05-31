import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { ChevronDown, ChevronUp, Search, BarChart2, Table, Filter, XCircle, ChevronLeft, ChevronRight, Eye, TrendingUp, Lightbulb, AlertTriangle, CheckCircle, Briefcase, BarChartHorizontalBig, CalendarDays, Smartphone, FileText, Info } from 'lucide-react';

// Data Imports
import { queriesCsvDataText } from './data/queries.data.js';
import { datesCsvDataText } from './data/dates.data.js';
import { devicesCsvDataText } from './data/devices.data.js';
import { pagesCsvDataText } from './data/pages.data.js';
import { searchAppearanceCsvDataText } from './data/searchAppearance.data.js';
import { filtersCsvDataText } from './data/filters.data.js';

// Utility Imports
import { parseCSV } from './utils/parseCSV.js';

// Hook Imports
import { useTableManager } from './hooks/useTableManager.js';

// Component Imports
import { TooltipSVG } from './components/TooltipSVG.js';
import { BarChartSVG } from './components/BarChartSVG.js';
import { LineChartSVG } from './components/LineChartSVG.js';
import { HorizontalBarChartSVG } from './components/HorizontalBarChartSVG.js';
import { InsightCard } from './components/InsightCard.js';
import { CollapsibleChartSection } from './components/CollapsibleChartSection.js';
import { DataTable } from './components/DataTable.js';
import { TableToolbar } from './components/TableToolbar.js';
import { TablePagination } from './components/TablePagination.js';

// Main App Component
/**
 * The main application component for the Search Performance Dashboard.
 * It orchestrates the overall layout and functionality of the dashboard.
 * Responsibilities include:
 *  - Loading and parsing initial CSV data for queries, dates, devices, pages, etc.
 *  - Managing global state such as loading status and visibility of UI elements.
 *  - Performing calculations and memoizations for derived data (e.g., summary metrics, keyword themes, brand/non-brand query filtering).
 *  - Rendering the main dashboard structure, including the header, summary metric cards,
 *    various chart sections (e.g., performance over time, device breakdown, top pages/queries),
 *    and insight sections (e.g., keyword themes, under-leveraged opportunities).
 *  - Utilizing custom hooks and components for specific functionalities like table management and chart rendering.
 *
 * @returns {JSX.Element} The rendered main application.
 */
const App = () => {
  const [queriesRawData, setQueriesRawData] = useState({ headers: [], rows: [] });
  const [datesRawData, setDatesRawData] = useState({ headers: [], rows: [] });
  const [devicesRawData, setDevicesRawData] = useState({ headers: [], rows: [] });
  const [pagesRawData, setPagesRawData] = useState({ headers: [], rows: [] });
  const [searchAppearanceRawData, setSearchAppearanceRawData] = useState({ headers: [], rows: [] });
  const [filtersContextData, setFiltersContextData] = useState({ headers: [], rows: [] });

  const [isLoading, setIsLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  // const [visibleColumns, setVisibleColumns] = useState({}); // Renamed or replaced
  const [mainTableVisibleColumns, setMainTableVisibleColumns] = useState([]);
  const [activeChartFilter, setActiveChartFilter] = useState(null);


  // Initialize useTableManager with queries data
  const {
    paginatedData,
    requestSort,
    sortConfig,
    updateFilter,
    clearFilter,
    filters,
    currentPage,
    totalPages,
    nextPage,
    prevPage,
    goToPage,
    setItemsPerPage,
    itemsPerPage,
    totalFilteredRows,
  } = useTableManager(queriesRawData.rows, 10); // Provide initialItemsPerPage

  const MIN_RECORDS_FOR_BRAND_CLICKS_CHART = 2;
  const MIN_RECORDS_FOR_OTHER_TOP_CHARTS = 5;


  const brandTerms = useMemo(() => [
    "port city", "alamo", "vanderbilt", "cityfence",
    "cape fear fence", "long fence", "us fence nc",
    "heritage fence", "ideal aluminum"
  ], []);

  const stopWords = useMemo(() => new Set([
    'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from', 'has', 'he',
    'in', 'is', 'it', 'its', 'of', 'on', 'that', 'the', 'to', 'was', 'were',
    'will', 'with', 'nc', 'me', 'near', 'my', 'company', 'companies', 'contractor',
    'contractors', 'services', 'installation', 'installers', 'builder', 'builders',
    'fencing', 'fence',
    'wilmington',
    'leland', 'southport', 'astor', 'beach', 'carolina', 'north', 'city', 'port'
  ]), []);


  useEffect(() => {
    const parsedQueries = parseCSV(queriesCsvDataText);
    const parsedDates = parseCSV(datesCsvDataText);
    const parsedDevices = parseCSV(devicesCsvDataText);
    const parsedPages = parseCSV(pagesCsvDataText, false);
    const parsedSearchAppearance = parseCSV(searchAppearanceCsvDataText, false);
    const parsedFiltersContext = parseCSV(filtersCsvDataText, false);

    setQueriesRawData(parsedQueries);
    setDatesRawData(parsedDates);
    setDevicesRawData(parsedDevices);
    setPagesRawData(parsedPages);
    setSearchAppearanceRawData(parsedSearchAppearance);
    setFiltersContextData(parsedFiltersContext);

    const initialVisible = {};
    if (parsedQueries.headers.length > 0) {
      // This was for a generic visibleColumns, might not be needed if mainTableVisibleColumns is specific enough
      // parsedQueries.headers.forEach(header => initialVisible[header] = true);
      // setVisibleColumns(initialVisible);

      // Initialize visible columns for the main data table
      setMainTableVisibleColumns(parsedQueries.headers.map(h => h.replace(/\s+/g, '_').replace(/^Top_/, '')));
    }
    setIsLoading(false);
  }, []);

  const columnConfigs = useMemo(() => {
    if (!queriesRawData.headers || queriesRawData.headers.length === 0) {
      return [];
    }
    return queriesRawData.headers.map(header => ({
      key: header, // Key from data object (after parseCSV)
      header: header.replace(/_/g, ' '), // Display-friendly header
      sortable: true
    }));
  }, [queriesRawData.headers]);

  const handleQueryChartClick = (item) => {
    if (item && item.name) {
      updateFilter('queries', item.name);
      setActiveChartFilter(`Query: "${item.name}"`);
      const tableSection = document.getElementById('allQueryDataSection');
      if (tableSection) {
        tableSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  const handleGenericChartClick = (item, chartName) => {
    console.log(`Clicked item from ${chartName}: `, item);
    setActiveChartFilter(`From ${chartName}: ${item.name || item.Date || item.Device || item.pages}`);
    // No direct filtering on main table for these as per plan
  };

  // --- Insight Calculations ---
  const summaryMetrics = useMemo(() => {
    if (!queriesRawData.rows || queriesRawData.rows.length === 0) {
      return { totalClicks: 0, totalImpressions: 0, overallCTR: 0, averagePosition: 0, totalQueries: 0 };
    }
    const totalClicks = queriesRawData.rows.reduce((sum, row) => sum + row.Clicks, 0);
    const totalImpressions = queriesRawData.rows.reduce((sum, row) => sum + row.Impressions, 0);
    const overallCTR = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;
    const averagePosition = queriesRawData.rows.length > 0 ? queriesRawData.rows.reduce((sum, row) => sum + row.Position, 0) / queriesRawData.rows.length : 0;
    return {
      totalClicks,
      totalImpressions,
      overallCTR,
      averagePosition,
      totalQueries: queriesRawData.rows.length
    };
  }, [queriesRawData.rows]);

  const underLeveragedOpportunities = useMemo(() => {
    if (!queriesRawData.rows || queriesRawData.rows.length === 0 || summaryMetrics.overallCTR === undefined) return [];
    const impressionThreshold = 150;
    const ctrBenchmark = summaryMetrics.overallCTR > 0.1 ? summaryMetrics.overallCTR : 0.5;

    return queriesRawData.rows
      .filter(row => row.Impressions > impressionThreshold && row.CTR < ctrBenchmark)
      .sort((a, b) => b.Impressions - a.Impressions)
      .slice(0, 20);
  }, [queriesRawData.rows, summaryMetrics.overallCTR]);

  const topKeywordThemes = useMemo(() => {
    if (!queriesRawData.rows || queriesRawData.rows.length === 0) return [];
    const wordFrequencies = {};

    queriesRawData.rows.forEach(row => {
      const words = row.queries.toLowerCase().split(/\s+/);
      words.forEach(word => {
        const cleanWord = word.replace(/[^a-z0-9]/gi, '');
        if (cleanWord && !stopWords.has(cleanWord) && cleanWord.length > 2) {
          wordFrequencies[cleanWord] = (wordFrequencies[cleanWord] || 0) + 1;
        }
      });
    });

    const sortedKeywords = Object.entries(wordFrequencies)
      .sort(([,a],[,b]) => b-a)
      .slice(0, 5);

    return sortedKeywords.map(([keyword, frequency]) => {
      const queriesWithKeyword = queriesRawData.rows.filter(row => row.queries.toLowerCase().includes(keyword));
      const totalImpressions = queriesWithKeyword.reduce((sum, row) => sum + row.Impressions, 0);
      const totalClicks = queriesWithKeyword.reduce((sum, row) => sum + row.Clicks, 0);
      const avgCTR = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;
      return { keyword, totalImpressions, avgCTR, frequency };
    });

  }, [queriesRawData.rows, stopWords]);

  // --- Chart Data Preparations ---
  const topBrandQueriesByClicks = useMemo(() => {
    if (!queriesRawData.rows || queriesRawData.rows.length === 0) return [];
    const brandData = queriesRawData.rows.filter(row => {
        const queryLower = row.queries.toLowerCase();
        return brandTerms.some(term => queryLower.includes(term.toLowerCase())) && row.Clicks > 0;
    });
    return [...brandData]
      .sort((a, b) => b.Clicks - a.Clicks)
      .map(item => ({ name: item.queries, Clicks: item.Clicks }));
  }, [queriesRawData.rows, brandTerms]);

  const topBrandQueriesByImpressions = useMemo(() => {
    if (!queriesRawData.rows || queriesRawData.rows.length === 0) return [];
    const brandData = queriesRawData.rows.filter(row => {
        const queryLower = row.queries.toLowerCase();
        return brandTerms.some(term => queryLower.includes(term.toLowerCase())) && row.Impressions > 0;
    });
    return [...brandData]
      .sort((a,b) => b.Impressions - a.Impressions)
      .slice(0, 50)
      .map(item => ({ name: item.queries, Impressions: item.Impressions}));
  }, [queriesRawData.rows, brandTerms]);

  const topNonBrandQueriesByClicks = useMemo(() => {
    if (!queriesRawData.rows || queriesRawData.rows.length === 0) return [];
    const nonBrandData = queriesRawData.rows.filter(row => {
      const queryLower = row.queries.toLowerCase();
      return !brandTerms.some(term => queryLower.includes(term.toLowerCase())) && row.Clicks > 0;
    });
     return [...nonBrandData]
      .sort((a, b) => b.Clicks - a.Clicks)
      .map(item => ({ name: item.queries, Clicks: item.Clicks }));
  }, [queriesRawData.rows, brandTerms]);

  // Placeholder for the rest of the App component's JSX structure
  // This will be complex and will use the imported components and prepared data.
  // For brevity in this subtask, we'll just return a placeholder.
  // The actual UI rendering logic from the original file would go here.

  if (isLoading) {
    return <div className="bg-gray-900 text-white min-h-screen flex items-center justify-center">Loading data...</div>;
  }

  return (
    <div className="bg-gray-900 text-white min-h-screen p-4 md:p-8 font-sans">
      <header className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-yellow-400">Search Performance Dashboard</h1>
        {filtersContextData.rows.length > 0 && (
          <p className="text-sm text-gray-400 mt-2">
            Displaying data for: {filtersContextData.rows.map(f => `${f.Filter}: ${f.Value}`).join(' | ')}
          </p>
        )}
      </header>

      {/* Summary Metrics Section */}
      <section className="mb-10 grid grid-cols-2 md:grid-cols-4 gap-4">
        <InsightCard title="Total Clicks" icon={TrendingUp} recommendationIcon={CheckCircle} recommendation="Overall click volume is healthy.">
          <p className="text-3xl font-bold">{summaryMetrics.totalClicks.toLocaleString()}</p>
        </InsightCard>
        <InsightCard title="Total Impressions" icon={Eye} recommendationIcon={Lightbulb} recommendation="Consider SEO for low impression terms.">
          <p className="text-3xl font-bold">{summaryMetrics.totalImpressions.toLocaleString()}</p>
        </InsightCard>
        <InsightCard title="Overall CTR" icon={BarChart2} recommendationIcon={TrendingUp} recommendation="Good CTR! Maintain title/meta quality.">
          <p className="text-3xl font-bold">{summaryMetrics.overallCTR.toFixed(2)}%</p>
        </InsightCard>
        <InsightCard title="Avg. Position" icon={TrendingUp} recommendationIcon={AlertTriangle} recommendation="Improve rankings for terms beyond page 1.">
          <p className="text-3xl font-bold">{summaryMetrics.averagePosition.toFixed(2)}</p>
        </InsightCard>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Dates Trend Chart */}
        <CollapsibleChartSection title="Performance Over Time" icon={CalendarDays} iconColor="text-blue-400" initialExpanded={true}>
          <LineChartSVG
            data={datesRawData.rows}
            dateKey="Date"
            val1Key="Clicks"
            val2Key="Impressions"
            width={550} height={350}
            minRecordsForChart={MIN_RECORDS_FOR_OTHER_TOP_CHARTS}
            onItemClick={(item) => handleGenericChartClick(item, 'Time Trend')}
          />
        </CollapsibleChartSection>

        {/* Device Breakdown Chart */}
        <CollapsibleChartSection title="Performance by Device" icon={Smartphone} iconColor="text-green-400" initialExpanded={true}>
            <BarChartSVG
                data={devicesRawData.rows}
                dataKey="Clicks"
                nameKey="Device"
                width={550} height={350}
                barColor="#48BB78"
                minRecordsForChart={MIN_RECORDS_FOR_OTHER_TOP_CHARTS}
                onItemClick={(item) => handleGenericChartClick(item, 'Device Breakdown')}
            />
        </CollapsibleChartSection>

        {/* Top Pages by Clicks Chart */}
        <CollapsibleChartSection title="Top Pages (by Clicks)" icon={FileText} iconColor="text-purple-400" initialExpanded={true}>
            <HorizontalBarChartSVG
                data={pagesRawData.rows}
                valueKey="Clicks"
                nameKey="pages"
                width={550} height={350}
                barColor="#A78BFA"
                topN={15}
                isScrollable={true}
                minRecordsForChart={MIN_RECORDS_FOR_OTHER_TOP_CHARTS}
                onItemClick={(item) => handleGenericChartClick(item, 'Top Pages')}
            />
        </CollapsibleChartSection>

        {/* Top Brand Queries by Clicks */}
        <CollapsibleChartSection title="Top Brand Queries (Clicks)" icon={Briefcase} iconColor="text-teal-400">
          <BarChartSVG
            data={topBrandQueriesByClicks}
            dataKey="Clicks"
            nameKey="name"
            width={550} height={350}
            barColor="#4FD1C5"
            isScrollable={true}
            minRecordsForChart={MIN_RECORDS_FOR_BRAND_CLICKS_CHART}
            onItemClick={handleQueryChartClick}
          />
        </CollapsibleChartSection>

        {/* Top Non-Brand Queries by Clicks */}
        <CollapsibleChartSection title="Top Non-Brand Queries (Clicks)" icon={Search} iconColor="text-orange-400">
          <BarChartSVG
            data={topNonBrandQueriesByClicks}
            dataKey="Clicks"
            nameKey="name"
            width={550} height={350}
            barColor="#F6AD55"
            isScrollable={true}
            minRecordsForChart={MIN_RECORDS_FOR_OTHER_TOP_CHARTS}
            onItemClick={handleQueryChartClick}
          />
        </CollapsibleChartSection>

        {/* Top Brand Queries by Impressions */}
        <CollapsibleChartSection title="Top Brand Queries (Impressions)" icon={Briefcase} iconColor="text-pink-400">
          <BarChartSVG
            data={topBrandQueriesByImpressions}
            dataKey="Impressions"
            nameKey="name"
            width={550} height={350}
            barColor="#F687B3"
            isScrollable={true}
            minRecordsForChart={MIN_RECORDS_FOR_OTHER_TOP_CHARTS}
            onItemClick={handleQueryChartClick}
          />
        </CollapsibleChartSection>
      </div>

      {/* Keyword Themes & Opportunities Section */}
      <section className="mt-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InsightCard title="Top Keyword Themes" icon={Lightbulb} recommendationIcon={Info} recommendation="Focus content creation around these themes.">
            {topKeywordThemes.length > 0 ? (
              <ul className="space-y-1 text-sm">
                {topKeywordThemes.map(theme => (
                  <li key={theme.keyword}>
                    <span className="font-semibold">{theme.keyword}</span>: {theme.frequency} mentions, {theme.totalImpressions.toLocaleString()} impr., {theme.avgCTR.toFixed(2)}% CTR
                  </li>
                ))}
              </ul>
            ) : <p>Not enough data for keyword themes.</p>}
          </InsightCard>

          <InsightCard title="Under-leveraged Opportunities" icon={AlertTriangle} recommendationIcon={TrendingUp} recommendation="Improve CTR for these high-impression, low-CTR queries. Consider refining page titles, meta descriptions, or content.">
             {underLeveragedOpportunities.length > 0 ? (
              <div className="overflow-auto max-h-60">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr>
                      <th className="py-1">Query</th>
                      <th className="py-1">Impressions</th>
                      <th className="py-1">CTR</th>
                    </tr>
                  </thead>
                  <tbody>
                    {underLeveragedOpportunities.slice(0,10).map(row => (
                      <tr key={row.queries} className="border-b border-gray-700">
                        <td className="py-1 pr-2">{row.queries}</td>
                        <td className="py-1">{row.Impressions.toLocaleString()}</td>
                        <td className="py-1">{row.CTR.toFixed(2)}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : <p>No significant under-leveraged opportunities identified based on current thresholds.</p>}
          </InsightCard>
        </div>
      </section>

      {/* Full Data Table Section */}
      <section className="mt-12" id="allQueryDataSection">
        <CollapsibleChartSection title="All Query Data" icon={Table} iconColor="text-gray-300" initialExpanded={true}>
          {activeChartFilter && (
            <div className="mb-2 p-2 bg-yellow-500/20 text-yellow-300 rounded-md text-sm">
              Filtering by: {activeChartFilter}{' '}
              <button
                onClick={() => {
                  clearFilter('queries');
                  setActiveChartFilter(null);
                }}
                className="ml-2 text-yellow-500 hover:text-yellow-400 underline"
              >
                Clear
              </button>
            </div>
          )}
          {queriesRawData.rows.length > 0 && columnConfigs.length > 0 ? (
            <>
              <TableToolbar
                updateFilter={updateFilter}
                clearFilter={clearFilter}
                filters={filters}
                allColumns={columnConfigs}
                visibleColumns={mainTableVisibleColumns}
                setVisibleColumns={setMainTableVisibleColumns}
                itemsPerPage={itemsPerPage}
                setItemsPerPage={setItemsPerPage}
              />
              <DataTable
                data={paginatedData}
                columns={columnConfigs}
                requestSort={requestSort}
                sortConfig={sortConfig}
                visibleColumns={mainTableVisibleColumns}
              />
              <TablePagination
                currentPage={currentPage}
                totalPages={totalPages}
                goToPage={goToPage}
                nextPage={nextPage}
                prevPage={prevPage}
                totalFilteredRows={totalFilteredRows}
                itemsPerPage={itemsPerPage}
              />
            </>
          ) : (
            <p className="text-center p-8 text-gray-500">
              {isLoading ? "Loading data..." : "No query data available to display."}
            </p>
          )}
        </CollapsibleChartSection>
      </section>
    </div>
  );
};

export default App;
