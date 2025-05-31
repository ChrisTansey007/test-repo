// --- Helper to parse CSV data ---
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
