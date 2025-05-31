/**
 * appConfig.js
 * Centralized configuration for the application.
 */

export const appConfig = {
  charts: {
    defaultMinRecords: 5, // Default minimum records to render a chart
    colors: {
      primary: "#63B3ED", // Blue
      secondary: "#4A5568", // Gray
      accent: "#A78BFA",  // Purple
      text: "#A0AEC0",     // Default text/axis color
      // Specific chart colors (can be overridden by props)
      barChart: "#63B3ED",
      lineChartVal1: "#63B3ED",
      lineChartVal2: "#4A5568",
      horizontalBarChart: "#A78BFA",
      scatterPlot: "#818cf8", // Indigo
      deviceDesktop: "#48BB78", // Green for Desktop in Device Chart
      deviceMobile: "#F6AD55",  // Orange for Mobile
      deviceTablet: "#E9D8FD",  // Light Purple for Tablet
      brandQueryClicks: "#4FD1C5", // Teal
      nonBrandQueryClicks: "#F6AD55", // Orange
      brandQueryImpressions: "#F687B3", // Pink
    },
    dimensions: {
      defaultWidth: 550,
      defaultHeight: 350,
      scatterPlotHeight: 400, // Specific height for scatter
    },
    // Other chart-specific defaults can be added here
  },
  table: {
    defaultItemsPerPage: 10,
    itemsPerPageOptions: [10, 25, 50, 100],
  },
  // Add other global configurations if needed
};

// Export individual configs for easier access if preferred
export const chartConfig = appConfig.charts;
export const tableConfig = appConfig.table;
