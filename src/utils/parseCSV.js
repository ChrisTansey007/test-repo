/**
 * @fileoverview Utility for parsing CSV text data into a structured JavaScript object.
 * This module provides a robust CSV parser that handles various data types commonly found
 * in search console exports, such as numbers, percentages, and dates.
 */

// --- Helper to parse CSV data ---
/**
 * Parses a CSV string into an object containing headers and rows.
 * It automatically converts 'Clicks' and 'Impressions' to integers,
 * 'CTR' (Click-Through Rate) to a float (after removing '%'),
 * and 'Position' to a float if `hasPosition` is true.
 * Dates are kept as strings. Other values are also kept as strings.
 * Headers are sanitized by replacing spaces with underscores and removing a "Top_" prefix.
 *
 * @param {string} csvText The raw CSV string data to parse.
 * @param {boolean} [hasPosition=true] Indicates whether the CSV data includes a 'Position' column
 *                                     that should be parsed as a float. Set to false if no such
 *                                     column exists or if it should be treated as a generic string.
 * @returns {{headers: string[], rows: Object[]}} An object where `headers` is an array of
 *                                                sanitized header strings, and `rows` is an array
 *                                                of objects, each representing a row with keys
 *                                                corresponding to the headers. Returns an empty
 *                                                `headers` and `rows` array if the input is empty.
 */
export const parseCSV = (csvText, hasPosition = true) => {
  const lines = csvText.trim().split('\n');
  if (lines.length < 1) return { headers: [], rows: [] };
  const headerLine = lines[0];

  const headers = headerLine.split(',').map(h =>
    h.trim().replace(/\s+/g, '_').replace(/^Top_/, '')
  );

  const rows = lines.slice(1).map(line => {
    const values = line.match(/(".*?"|[^",]+)(?=\s*,|\s*$)/g) || [];
    let rowData = {};
    headers.forEach((header, index) => {
      let value = (values[index] || '').trim().replace(/^"|"$/g, '');
      const lowerHeader = header.toLowerCase();

      if (lowerHeader === 'clicks' || lowerHeader === 'impressions') {
        rowData[header] = parseInt(value, 10) || 0;
      } else if (lowerHeader === 'ctr') {
        rowData[header] = parseFloat(value.replace('%', '')) || 0;
      } else if (lowerHeader === 'position' && hasPosition) {
        rowData[header] = parseFloat(value) || 0;
      } else if (lowerHeader === 'date') {
        rowData[header] = value;
      }
      else {
        rowData[header] = value;
      }
    });
    return rowData;
  });
  return { headers, rows };
};
