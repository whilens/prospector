export type Lead = {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  website: string | null;
  address: string | null;
  niche: string;
  nicheId: string;
  city: string;
  lat: number | null;
  lon: number | null;
  osmUrl: string | null;
  source: "osm" | "sample";
};

export type SearchLeadsRequest = {
  nicheId: string;
  city: string;
  radiusKm?: number;
  limit?: number;
  onlyWithPhone?: boolean;
  demo?: boolean;
};

export type SearchLeadsResponse = {
  ok: true;
  leads: Lead[];
  meta: {
    city: string;
    nicheId: string;
    nicheLabel: string;
    count: number;
    withPhone: number;
    radiusKm: number;
    source: "osm" | "sample";
    note?: string;
  };
};

export type SearchLeadsError = {
  ok: false;
  error: string;
};
