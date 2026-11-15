/**
 * Safe, zero-dependency CSV exporter compliant with RFC 4180.
 * Replaces insecure third-party sheet parsers to eliminate prototype pollution and ReDoS CVEs.
 * Includes UTF-8 Byte Order Mark (BOM) for native opening in Microsoft Excel, Numbers, and Google Sheets.
 */
export function exportToCSV(filename: string, rows: Record<string, any>[]): void {
  if (!rows || rows.length === 0) return;

  const headers = Object.keys(rows[0]);
  const escapeCell = (val: any): string => {
    if (val === null || val === undefined) return '""';
    const str = String(val);
    // Prevent CSV Formula Injection (=, +, -, @, \t, \r)
    let safeStr = str;
    if (/^[=+\-@\t\r]/.test(safeStr)) {
      safeStr = `'${safeStr}`;
    }
    return `"${safeStr.replace(/"/g, '""')}"`;
  };

  const csvRows = [
    headers.map((h) => escapeCell(h)).join(","),
    ...rows.map((row) => headers.map((h) => escapeCell(row[h])).join(",")),
  ];

  const csvContent = "\uFEFF" + csvRows.join("\r\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename.endsWith(".csv") ? filename : `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

