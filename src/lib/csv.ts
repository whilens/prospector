import type { Lead } from "./types";

function escapeCsv(value: string): string {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function leadsToCsv(leads: Lead[]): string {
  const headers = [
    "name",
    "phone",
    "email",
    "website",
    "address",
    "city",
    "niche",
    "lat",
    "lon",
    "osm_url",
    "source",
  ];

  const rows = leads.map((l) =>
    [
      l.name,
      l.phone ?? "",
      l.email ?? "",
      l.website ?? "",
      l.address ?? "",
      l.city,
      l.niche,
      l.lat?.toString() ?? "",
      l.lon?.toString() ?? "",
      l.osmUrl ?? "",
      l.source,
    ]
      .map((v) => escapeCsv(v))
      .join(","),
  );

  return [headers.join(","), ...rows].join("\n");
}

export function downloadCsv(filename: string, csv: string) {
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
