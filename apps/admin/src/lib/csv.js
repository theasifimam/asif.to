// Client-side CSV export. Cells that start with a formula character are
// prefixed with a quote so spreadsheet apps don't execute search queries or
// URLs that happen to begin with =, +, - or @.
const cell = (value) => {
  let text = value === null || value === undefined ? "" : String(value);
  if (/^[=+\-@\t\r]/.test(text)) text = `'${text}`;
  return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
};

export function toCsv(columns, rows) {
  const header = columns.map((column) => cell(column.label)).join(",");
  const lines = rows.map((row) =>
    columns.map((column) => cell(column.value(row))).join(","),
  );
  return [header, ...lines].join("\r\n");
}

export function downloadCsv(filename, columns, rows) {
  const blob = new Blob([`﻿${toCsv(columns, rows)}`], {
    type: "text/csv;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
