import { NextResponse } from "next/server";
import { getNicheById } from "@/lib/niches";
import { searchOsmLeads } from "@/lib/osm";
import { buildSampleLeads } from "@/lib/sample-leads";
import type { SearchLeadsError, SearchLeadsResponse } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 60;

const MAX_LIMIT = 100;
const MAX_RADIUS_KM = 30;

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Некорректный JSON." } satisfies SearchLeadsError,
      { status: 400 },
    );
  }

  const payload = body as Record<string, unknown>;
  const nicheId = typeof payload.nicheId === "string" ? payload.nicheId : "";
  const city = typeof payload.city === "string" ? payload.city.trim() : "";
  const radiusKm = clamp(Number(payload.radiusKm ?? 8) || 8, 1, MAX_RADIUS_KM);
  const limit = clamp(Number(payload.limit ?? 50) || 50, 1, MAX_LIMIT);
  const onlyWithPhone = Boolean(payload.onlyWithPhone);
  const demo = Boolean(payload.demo);

  const niche = getNicheById(nicheId);
  if (!niche) {
    return NextResponse.json(
      { ok: false, error: "Неизвестная ниша." } satisfies SearchLeadsError,
      { status: 400 },
    );
  }

  if (city.length < 2 || city.length > 120) {
    return NextResponse.json(
      { ok: false, error: "Укажите город (2–120 символов)." } satisfies SearchLeadsError,
      { status: 400 },
    );
  }

  if (demo) {
    let leads = buildSampleLeads(niche.id, niche.label, city);
    if (onlyWithPhone) leads = leads.filter((l) => l.phone);
    leads = leads.slice(0, limit);

    const response: SearchLeadsResponse = {
      ok: true,
      leads,
      meta: {
        city,
        nicheId: niche.id,
        nicheLabel: niche.label,
        count: leads.length,
        withPhone: leads.filter((l) => l.phone).length,
        radiusKm,
        source: "sample",
        note: "Демо-данные (не из карт). Включите живой поиск OSM для реальных лидов.",
      },
    };
    return NextResponse.json(response);
  }

  try {
    const { leads, geo } = await searchOsmLeads({
      niche,
      city,
      radiusKm,
      limit,
      onlyWithPhone,
    });

    const response: SearchLeadsResponse = {
      ok: true,
      leads,
      meta: {
        city: geo.displayName.split(",")[0]?.trim() || city,
        nicheId: niche.id,
        nicheLabel: niche.label,
        count: leads.length,
        withPhone: leads.filter((l) => l.phone).length,
        radiusKm,
        source: "osm",
        note:
          leads.length === 0
            ? "В OSM мало точек с тегами для этой ниши/города. Расширьте радиус или снимите фильтр «только с телефоном»."
            : undefined,
      },
    };
    return NextResponse.json(response);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Ошибка поиска.";

    // Fallback к sample, чтобы UI оставался usable при сбое Overpass
    let leads = buildSampleLeads(niche.id, niche.label, city);
    if (onlyWithPhone) leads = leads.filter((l) => l.phone);
    leads = leads.slice(0, limit);

    const response: SearchLeadsResponse = {
      ok: true,
      leads,
      meta: {
        city,
        nicheId: niche.id,
        nicheLabel: niche.label,
        count: leads.length,
        withPhone: leads.filter((l) => l.phone).length,
        radiusKm,
        source: "sample",
        note: `Живой OSM временно недоступен (${message}). Показаны демо-лиды.`,
      },
    };
    return NextResponse.json(response);
  }
}
