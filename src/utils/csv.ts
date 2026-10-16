export function csvText(
  headers: string[],
  rows: (string | number)[][],
): string {
  const cell = (v: string | number) => {
    let value = String(v);
    if (/^[=+@\-\t\r]/.test(value) && typeof v === "string")
      value = "'" + value;
    return `"${value.replaceAll('"', '""')}"`;
  };
  return (
    "\uFEFF" +
    [headers, ...rows].map((row) => row.map(cell).join(",")).join("\r\n")
  );
}

export function downloadCsv(
  title: string,
  headers: string[],
  rows: (string | number)[][],
): void {
  const url = URL.createObjectURL(
    new Blob([csvText(headers, rows)], { type: "text/csv;charset=utf-8;" }),
  );
  const link = document.createElement("a");
  link.href = url;
  link.download = title + ".csv";
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
