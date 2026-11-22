// Neutralise cells that spreadsheet apps would treat as formulas.
function cell(value) {
  let text = String(value ?? "");
  if (/^[=+\-@]/.test(text)) text = `'${text}`;
  return `"${text.replace(/"/g, '""')}"`;
}

/** Downloads rows (array of arrays) as a CSV file that opens cleanly in Excel. */
export function downloadCSV(filename, rows) {
  const body = rows.map((row) => row.map(cell).join(",")).join("\r\n");
  const blob = new Blob(["\ufeff" + body], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
