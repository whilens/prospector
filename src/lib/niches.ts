export type OsmFilter = {
  key: string;
  value: string;
};

export type Niche = {
  id: string;
  label: string;
  group: string;
  filters: OsmFilter[];
};

/** Ниши → теги OpenStreetMap. Без LLM: словарь вместо токенов. */
export const NICHES: Niche[] = [
  {
    id: "beauty-salon",
    label: "Салоны красоты",
    group: "Красота",
    filters: [
      { key: "shop", value: "beauty" },
      { key: "shop", value: "hairdresser" },
      { key: "amenity", value: "beauty_salon" },
    ],
  },
  {
    id: "barbershop",
    label: "Барбершопы",
    group: "Красота",
    filters: [{ key: "shop", value: "hairdresser" }],
  },
  {
    id: "nail",
    label: "Ногтевой сервис",
    group: "Красота",
    filters: [
      { key: "shop", value: "beauty" },
      { key: "craft", value: "nail" },
    ],
  },
  {
    id: "cafe",
    label: "Кафе",
    group: "Еда",
    filters: [
      { key: "amenity", value: "cafe" },
      { key: "amenity", value: "coffee_shop" },
    ],
  },
  {
    id: "restaurant",
    label: "Рестораны",
    group: "Еда",
    filters: [{ key: "amenity", value: "restaurant" }],
  },
  {
    id: "bakery",
    label: "Пекарни",
    group: "Еда",
    filters: [
      { key: "shop", value: "bakery" },
      { key: "shop", value: "pastry" },
    ],
  },
  {
    id: "fast-food",
    label: "Фастфуд",
    group: "Еда",
    filters: [{ key: "amenity", value: "fast_food" }],
  },
  {
    id: "auto-repair",
    label: "Автосервисы",
    group: "Авто",
    filters: [
      { key: "shop", value: "car_repair" },
      { key: "craft", value: "car_repair" },
      { key: "amenity", value: "vehicle_inspection" },
    ],
  },
  {
    id: "car-wash",
    label: "Автомойки",
    group: "Авто",
    filters: [{ key: "amenity", value: "car_wash" }],
  },
  {
    id: "dentist",
    label: "Стоматологии",
    group: "Медицина",
    filters: [
      { key: "amenity", value: "dentist" },
      { key: "healthcare", value: "dentist" },
    ],
  },
  {
    id: "clinic",
    label: "Клиники",
    group: "Медицина",
    filters: [
      { key: "amenity", value: "clinic" },
      { key: "healthcare", value: "clinic" },
    ],
  },
  {
    id: "pharmacy",
    label: "Аптеки",
    group: "Медицина",
    filters: [{ key: "amenity", value: "pharmacy" }],
  },
  {
    id: "vet",
    label: "Ветклиники",
    group: "Медицина",
    filters: [{ key: "amenity", value: "veterinary" }],
  },
  {
    id: "fitness",
    label: "Фитнес / спортзалы",
    group: "Спорт",
    filters: [
      { key: "leisure", value: "fitness_centre" },
      { key: "leisure", value: "sports_centre" },
    ],
  },
  {
    id: "yoga",
    label: "Йога-студии",
    group: "Спорт",
    filters: [{ key: "leisure", value: "fitness_centre" }],
  },
  {
    id: "real-estate",
    label: "Недвижимость (агентства)",
    group: "Услуги",
    filters: [{ key: "office", value: "estate_agent" }],
  },
  {
    id: "lawyer",
    label: "Юристы / нотариусы",
    group: "Услуги",
    filters: [
      { key: "office", value: "lawyer" },
      { key: "office", value: "notary" },
    ],
  },
  {
    id: "accountant",
    label: "Бухгалтерия",
    group: "Услуги",
    filters: [
      { key: "office", value: "accountant" },
      { key: "office", value: "tax_advisor" },
    ],
  },
  {
    id: "cleaning",
    label: "Клининг",
    group: "Услуги",
    filters: [{ key: "craft", value: "cleaner" }],
  },
  {
    id: "laundry",
    label: "Химчистки / прачечные",
    group: "Услуги",
    filters: [
      { key: "shop", value: "laundry" },
      { key: "shop", value: "dry_cleaning" },
    ],
  },
  {
    id: "florist",
    label: "Цветочные магазины",
    group: "Ритейл",
    filters: [{ key: "shop", value: "florist" }],
  },
  {
    id: "furniture",
    label: "Мебель",
    group: "Ритейл",
    filters: [{ key: "shop", value: "furniture" }],
  },
  {
    id: "electronics",
    label: "Электроника",
    group: "Ритейл",
    filters: [
      { key: "shop", value: "electronics" },
      { key: "shop", value: "computer" },
      { key: "shop", value: "mobile_phone" },
    ],
  },
  {
    id: "pet",
    label: "Зоомагазины",
    group: "Ритейл",
    filters: [{ key: "shop", value: "pet" }],
  },
  {
    id: "hotel",
    label: "Отели / гостевые дома",
    group: "Туризм",
    filters: [
      { key: "tourism", value: "hotel" },
      { key: "tourism", value: "guest_house" },
      { key: "tourism", value: "hostel" },
    ],
  },
  {
    id: "travel-agency",
    label: "Турагентства",
    group: "Туризм",
    filters: [{ key: "shop", value: "travel_agency" }],
  },
];

export function getNicheById(id: string): Niche | undefined {
  return NICHES.find((n) => n.id === id);
}

export function nicheGroups(): string[] {
  return [...new Set(NICHES.map((n) => n.group))];
}
