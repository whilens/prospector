import type { Lead } from "./types";

/** Демо-лиды для офлайн/fallback — помечены как sample. */
export function buildSampleLeads(nicheId: string, nicheLabel: string, city: string): Lead[] {
  const base: Omit<Lead, "id" | "niche" | "nicheId">[] = [
    {
      name: `${nicheLabel} «Север»`,
      phone: "+7 (495) 123-45-67",
      email: "hello@sever-demo.ru",
      website: "https://example.com",
      address: `ул. Тверская, 12, ${city}`,
      city,
      lat: 55.757,
      lon: 37.615,
      osmUrl: null,
      source: "sample",
    },
    {
      name: `${nicheLabel} на Арбате`,
      phone: "+7 (499) 987-65-43",
      email: null,
      website: null,
      address: `ул. Арбат, 24, ${city}`,
      city,
      lat: 55.752,
      lon: 37.591,
      osmUrl: null,
      source: "sample",
    },
    {
      name: `Мастерская «${nicheLabel}»`,
      phone: "+7 (903) 111-22-33",
      email: "info@master-demo.ru",
      website: "https://example.org",
      address: `пр. Мира, 88, ${city}`,
      city,
      lat: 55.78,
      lon: 37.63,
      osmUrl: null,
      source: "sample",
    },
    {
      name: `${city} ${nicheLabel} Pro`,
      phone: null,
      email: "sales@pro-demo.ru",
      website: "https://example.net",
      address: `ул. Ленина, 3, ${city}`,
      city,
      lat: 55.74,
      lon: 37.62,
      osmUrl: null,
      source: "sample",
    },
    {
      name: `Студия «Лайт»`,
      phone: "+7 (812) 555-01-02",
      email: null,
      website: null,
      address: `Невский пр., 50, ${city}`,
      city,
      lat: 55.75,
      lon: 37.6,
      osmUrl: null,
      source: "sample",
    },
  ];

  return base.map((lead, i) => ({
    ...lead,
    id: `sample-${nicheId}-${i}`,
    niche: nicheLabel,
    nicheId,
  }));
}
