"use client";

import { useMemo, useState } from "react";
import {
  Download,
  Loader2,
  MapPin,
  Phone,
  Search,
  Sparkles,
  Table2,
} from "lucide-react";
import { NICHES, nicheGroups } from "@/lib/niches";
import { downloadCsv, leadsToCsv } from "@/lib/csv";
import type { Lead, SearchLeadsResponse } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const DEFAULT_CITY = "Москва";

export function LeadScout() {
  const groups = useMemo(() => nicheGroups(), []);
  const [nicheId, setNicheId] = useState(NICHES[0]?.id ?? "cafe");
  const [city, setCity] = useState(DEFAULT_CITY);
  const [radiusKm, setRadiusKm] = useState(8);
  const [limit, setLimit] = useState(40);
  const [onlyWithPhone, setOnlyWithPhone] = useState(true);
  const [demo, setDemo] = useState(false);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [meta, setMeta] = useState<SearchLeadsResponse["meta"] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSearch() {
    setError(null);
    setPending(true);
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nicheId,
          city,
          radiusKm,
          limit,
          onlyWithPhone,
          demo,
        }),
      });
      const data = (await res.json()) as SearchLeadsResponse | { ok: false; error: string };
      if (!data.ok) {
        setLeads([]);
        setMeta(null);
        setError(data.error);
        return;
      }
      setLeads(data.leads);
      setMeta(data.meta);
    } catch {
      setError("Не удалось выполнить запрос. Проверьте сеть и попробуйте снова.");
      setLeads([]);
      setMeta(null);
    } finally {
      setPending(false);
    }
  }

  function onExport() {
    if (!leads.length) return;
    const slug = `${meta?.nicheId ?? nicheId}-${(meta?.city ?? city).replace(/\s+/g, "-")}`;
    downloadCsv(`leads-${slug}.csv`, leadsToCsv(leads));
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
      <header className="relative overflow-hidden rounded-2xl border border-teal-900/10 bg-gradient-to-br from-teal-950 via-slate-900 to-emerald-950 px-6 py-8 text-teal-50 shadow-xl sm:px-10 sm:py-10">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.18]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 20%, #5eead4 0%, transparent 40%), radial-gradient(circle at 80% 0%, #34d399 0%, transparent 35%), repeating-linear-gradient(0deg, transparent, transparent 23px, rgba(255,255,255,0.06) 24px), repeating-linear-gradient(90deg, transparent, transparent 23px, rgba(255,255,255,0.06) 24px)",
          }}
        />
        <div className="relative flex flex-col gap-4">
          <p className="font-[family-name:var(--font-display)] text-4xl tracking-tight sm:text-5xl">
            Lead Scout
          </p>
          <p className="max-w-2xl text-base text-teal-100/85 sm:text-lg">
            Таблица лидов МСБ по нише и городу — через OpenStreetMap, без траты
            LLM-токенов на парсинг.
          </p>
          <div className="flex flex-wrap gap-2 text-xs text-teal-200/80">
            <span className="inline-flex items-center gap-1 rounded-md bg-white/10 px-2.5 py-1 backdrop-blur">
              <Sparkles className="size-3.5" /> 0 токенов на извлечение
            </span>
            <span className="inline-flex items-center gap-1 rounded-md bg-white/10 px-2.5 py-1 backdrop-blur">
              <MapPin className="size-3.5" /> OSM + Nominatim
            </span>
            <span className="inline-flex items-center gap-1 rounded-md bg-white/10 px-2.5 py-1 backdrop-blur">
              <Table2 className="size-3.5" /> CSV экспорт
            </span>
          </div>
        </div>
      </header>

      <section className="rounded-2xl border border-slate-200/80 bg-white/80 p-5 shadow-sm backdrop-blur sm:p-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-2 sm:col-span-1">
            <Label htmlFor="niche">Ниша</Label>
            <Select
              value={nicheId}
              onValueChange={(v) => {
                if (v) setNicheId(v);
              }}
            >
              <SelectTrigger id="niche" className="w-full">
                <SelectValue placeholder="Выберите нишу" />
              </SelectTrigger>
              <SelectContent>
                {groups.map((group) => (
                  <SelectGroup key={group}>
                    <SelectLabel>{group}</SelectLabel>
                    {NICHES.filter((n) => n.group === group).map((n) => (
                      <SelectItem key={n.id} value={n.id}>
                        {n.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="city">Город</Label>
            <Input
              id="city"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Москва, Казань, Берлин…"
              maxLength={120}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="radius">Радиус, км</Label>
            <Input
              id="radius"
              type="number"
              min={1}
              max={30}
              value={radiusKm}
              onChange={(e) => setRadiusKm(Number(e.target.value) || 1)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="limit">Лимит строк</Label>
            <Input
              id="limit"
              type="number"
              min={1}
              max={100}
              value={limit}
              onChange={(e) => setLimit(Number(e.target.value) || 1)}
            />
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-5">
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <Checkbox
                checked={onlyWithPhone}
                onCheckedChange={(v) => setOnlyWithPhone(v === true)}
              />
              Только с телефоном
            </label>
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <Checkbox checked={demo} onCheckedChange={(v) => setDemo(v === true)} />
              Демо-данные (без OSM)
            </label>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button onClick={onSearch} disabled={pending || !city.trim()}>
              {pending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Search className="size-4" />
              )}
              Найти лиды
            </Button>
            <Button
              variant="outline"
              onClick={onExport}
              disabled={!leads.length || pending}
            >
              <Download className="size-4" />
              CSV
            </Button>
          </div>
        </div>
      </section>

      {error && (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
        >
          {error}
        </div>
      )}

      {meta && (
        <div className="flex flex-wrap items-center gap-2 text-sm text-slate-600">
          <Badge variant="secondary">
            {meta.count} лидов · {meta.withPhone} с телефоном
          </Badge>
          <Badge variant={meta.source === "osm" ? "default" : "outline"}>
            источник: {meta.source === "osm" ? "OpenStreetMap" : "демо"}
          </Badge>
          <span>
            {meta.nicheLabel} · {meta.city} · {meta.radiusKm} км
          </span>
          {meta.note && <span className="w-full text-amber-800">{meta.note}</span>}
        </div>
      )}

      <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white/90 shadow-sm">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Название</TableHead>
                <TableHead>Телефон</TableHead>
                <TableHead className="hidden md:table-cell">Email</TableHead>
                <TableHead className="hidden lg:table-cell">Сайт</TableHead>
                <TableHead className="hidden sm:table-cell">Адрес</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pending && (
                <TableRow>
                  <TableCell colSpan={5} className="py-12 text-center text-slate-500">
                    <span className="inline-flex items-center gap-2">
                      <Loader2 className="size-4 animate-spin" />
                      Ищем точки на карте…
                    </span>
                  </TableCell>
                </TableRow>
              )}
              {!pending && leads.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="py-12 text-center text-slate-500">
                    Выберите нишу и город, затем нажмите «Найти лиды».
                  </TableCell>
                </TableRow>
              )}
              {!pending &&
                leads.map((lead) => (
                  <TableRow key={lead.id}>
                    <TableCell className="font-medium">
                      <div className="flex flex-col gap-0.5">
                        {lead.osmUrl ? (
                          <a
                            href={lead.osmUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-teal-800 hover:underline"
                          >
                            {lead.name}
                          </a>
                        ) : (
                          <span>{lead.name}</span>
                        )}
                        {lead.source === "sample" && (
                          <span className="text-xs font-normal text-amber-700">sample</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {lead.phone ? (
                        <a
                          href={`tel:${lead.phone.replace(/[^\d+]/g, "")}`}
                          className="inline-flex items-center gap-1 text-slate-800 hover:text-teal-800"
                        >
                          <Phone className="size-3.5 opacity-60" />
                          {lead.phone}
                        </a>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {lead.email ? (
                        <a href={`mailto:${lead.email}`} className="hover:underline">
                          {lead.email}
                        </a>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </TableCell>
                    <TableCell className="hidden max-w-[12rem] truncate lg:table-cell">
                      {lead.website ? (
                        <a
                          href={lead.website}
                          target="_blank"
                          rel="noreferrer"
                          className="text-teal-800 hover:underline"
                        >
                          {lead.website.replace(/^https?:\/\//, "")}
                        </a>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </TableCell>
                    <TableCell className="hidden max-w-[14rem] truncate sm:table-cell text-slate-600">
                      {lead.address ?? "—"}
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </div>
      </section>

      <footer className="pb-8 text-sm leading-relaxed text-slate-500">
        <p>
          Данные берутся из открытой карты OSM (не Google Maps). Покрытие телефонов
          зависит от того, что волонтёры указали в тегах. Для продакшена можно
          подключить Google Places / 2ГИС / Yandex как платный слой поверх того же UI —
          без LLM на каждый лид.
        </p>
      </footer>
    </div>
  );
}
