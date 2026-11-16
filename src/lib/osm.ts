import type { Niche } from "./niches";
import type { Lead } from "./types";

const NOMINATIM_URL = "https://nominatim.openstreetmap.org/search";
const OVERPASS_URLS = [
  "https://overpass-api.de/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
] as const;

const USER_AGENT = "LeadScout/1.0 (local lead research tool; contact: local-dev)";

export type GeoPoint = {
  lat: number;
  lon: number;
  displayName: string;
};

type OsmTags = Record<string, string | undefined>;

type OsmElement = {
  type: "node" | "way" | "relation";
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: OsmTags;
};

function truncate(s: string, max: number): string {
  return s.length > max ? s.slice(0, max) : s;
}

export async function geocodeCity(city: string): Promise<GeoPoint> {
  const q = truncate(city.trim(), 120);
  if (q.length < 2) {
    throw new Error("Укажите город (минимум 2 символа).");
  }

  const url = new URL(NOMINATIM_URL);
  url.searchParams.set("q", q);
  url.searchParams.set("format", "json");
  url.searchParams.set("limit", "1");
  url.searchParams.set("addressdetails", "0");

  const res = await fetch(url.toString(), {
    headers: {
      Accept: "application/json",
      "User-Agent": USER_AGENT,
    },
    signal: AbortSignal.timeout(15_000),
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Геокодер недоступен (${res.status}).`);
  }

  const data = (await res.json()) as Array<{
    lat: string;
    lon: string;
    display_name: string;
  }>;

  if (!data.length) {
    throw new Error(`Город «${q}» не найден. Попробуйте уточнить название.`);
  }

  return {
    lat: Number(data[0].lat),
    lon: Number(data[0].lon),
    displayName: data[0].display_name,
  };
}

function buildOverpassQuery(niche: Niche, lat: number, lon: number, radiusM: number, limit: number): string {
  const clauses = niche.filters
    .map((f) => `  nwr["${f.key}"="${f.value}"](around:${radiusM},${lat},${lon});`)
    .join("\n");

  return `[out:json][timeout:25];
(
${clauses}
);
out center tags ${Math.min(limit * 3, 300)};`;
}

async function queryOverpass(query: string): Promise<OsmElement[]> {
  let lastError: Error | null = null;

  for (const endpoint of OVERPASS_URLS) {
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
          Accept: "application/json",
          "User-Agent": USER_AGENT,
        },
        body: `data=${encodeURIComponent(query)}`,
        signal: AbortSignal.timeout(35_000),
        cache: "no-store",
      });

      if (!res.ok) {
        lastError = new Error(`Overpass ${res.status}`);
        continue;
      }

      const data = (await res.json()) as { elements?: OsmElement[] };
      return data.elements ?? [];
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
    }
  }

  throw lastError ?? new Error("Overpass недоступен.");
}

function pickPhone(tags: OsmTags): string | null {
  const raw =
    tags.phone ||
    tags["contact:phone"] ||
    tags["contact:mobile"] ||
    tags.mobile ||
    null;
  if (!raw) return null;
  return raw.split(/[;,/]/)[0]?.trim() || null;
}

function pickEmail(tags: OsmTags): string | null {
  const raw = tags.email || tags["contact:email"] || null;
  return raw?.trim() || null;
}

function pickWebsite(tags: OsmTags): string | null {
  const raw = tags.website || tags["contact:website"] || tags.url || null;
  if (!raw) return null;
  const w = raw.trim();
  if (!w) return null;
  if (w.startsWith("http://") || w.startsWith("https://")) return w;
  return `https://${w}`;
}

function pickAddress(tags: OsmTags): string | null {
  const street = tags["addr:street"];
  const house = tags["addr:housenumber"];
  const city = tags["addr:city"] || tags["addr:town"] || tags["addr:suburb"];
  const full = tags["addr:full"];

  if (full) return full;
  const parts = [street && house ? `${street}, ${house}` : street || house, city].filter(Boolean);
  return parts.length ? parts.join(", ") : null;
}

function elementToLead(
  el: OsmElement,
  niche: Niche,
  city: string,
): Lead | null {
  const tags = el.tags ?? {};
  const name = tags.name || tags["name:ru"] || tags.brand || tags.operator;
  if (!name) return null;

  const lat = el.lat ?? el.center?.lat ?? null;
  const lon = el.lon ?? el.center?.lon ?? null;

  return {
    id: `osm-${el.type}-${el.id}`,
    name: name.trim(),
    phone: pickPhone(tags),
    email: pickEmail(tags),
    website: pickWebsite(tags),
    address: pickAddress(tags),
    niche: niche.label,
    nicheId: niche.id,
    city,
    lat,
    lon,
    osmUrl: `https://www.openstreetmap.org/${el.type}/${el.id}`,
    source: "osm",
  };
}

export async function searchOsmLeads(options: {
  niche: Niche;
  city: string;
  radiusKm: number;
  limit: number;
  onlyWithPhone: boolean;
}): Promise<{ leads: Lead[]; geo: GeoPoint }> {
  const geo = await geocodeCity(options.city);
  const radiusM = Math.round(options.radiusKm * 1000);
  const query = buildOverpassQuery(options.niche, geo.lat, geo.lon, radiusM, options.limit);
  const elements = await queryOverpass(query);

  const seen = new Set<string>();
  const leads: Lead[] = [];

  for (const el of elements) {
    const lead = elementToLead(el, options.niche, options.city.trim());
    if (!lead) continue;
    if (options.onlyWithPhone && !lead.phone) continue;

    const dedupeKey = `${lead.name.toLowerCase()}|${lead.phone ?? ""}|${lead.address ?? ""}`;
    if (seen.has(dedupeKey)) continue;
    seen.add(dedupeKey);

    leads.push(lead);
    if (leads.length >= options.limit) break;
  }

  leads.sort((a, b) => {
    const ap = a.phone ? 0 : 1;
    const bp = b.phone ? 0 : 1;
    if (ap !== bp) return ap - bp;
    return a.name.localeCompare(b.name, "ru");
  });

  return { leads, geo };
}
