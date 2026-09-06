export type HotelDestination = {
  id: string;
  city: string;
  country: string;
  area?: string;
  label: string;
};

export const hotelDestinations: HotelDestination[] = [
  { id: "dhaka", city: "Dhaka", country: "Bangladesh", area: "Gulshan · Banani" },
  { id: "coxsbazar", city: "Cox's Bazar", country: "Bangladesh", area: "Kolatoli Beach" },
  { id: "sylhet", city: "Sylhet", country: "Bangladesh", area: "Tea gardens" },
  { id: "chattogram", city: "Chattogram", country: "Bangladesh", area: "Agrabad" },
  { id: "bangkok", city: "Bangkok", country: "Thailand", area: "Sukhumvit · Silom" },
  { id: "phuket", city: "Phuket", country: "Thailand", area: "Patong · Kata" },
  { id: "chiangmai", city: "Chiang Mai", country: "Thailand", area: "Old City" },
  { id: "singapore", city: "Singapore", country: "Singapore", area: "Marina Bay · Orchard" },
  { id: "kualalumpur", city: "Kuala Lumpur", country: "Malaysia", area: "Bukit Bintang" },
  { id: "bali", city: "Bali", country: "Indonesia", area: "Seminyak · Ubud" },
  { id: "jakarta", city: "Jakarta", country: "Indonesia", area: "Sudirman" },
  { id: "dubai", city: "Dubai", country: "UAE", area: "Downtown · Marina" },
  { id: "abudhabi", city: "Abu Dhabi", country: "UAE", area: "Corniche" },
  { id: "doha", city: "Doha", country: "Qatar", area: "West Bay" },
  { id: "male", city: "Malé & Atolls", country: "Maldives", area: "Overwater villas" },
  { id: "kathmandu", city: "Kathmandu", country: "Nepal", area: "Thamel" },
  { id: "colombo", city: "Colombo", country: "Sri Lanka", area: "Galle Face" },
  { id: "delhi", city: "Delhi", country: "India", area: "Aerocity · CP" },
  { id: "mumbai", city: "Mumbai", country: "India", area: "Colaba · BKC" },
  { id: "kolkata", city: "Kolkata", country: "India", area: "Park Street" },
  { id: "istanbul", city: "Istanbul", country: "Türkiye", area: "Sultanahmet" },
  { id: "london", city: "London", country: "United Kingdom", area: "Mayfair · Soho" },
  { id: "paris", city: "Paris", country: "France", area: "Le Marais" },
  { id: "tokyo", city: "Tokyo", country: "Japan", area: "Shinjuku · Ginza" },
  { id: "newyork", city: "New York", country: "USA", area: "Manhattan" },
].map((d) => ({ ...d, label: `${d.city}, ${d.country}` }));

export function destinationById(id: string): HotelDestination | null {
  return hotelDestinations.find((d) => d.id === id) ?? null;
}

export function searchDestinations(query: string, limit = 8): HotelDestination[] {
  const q = query.trim().toLowerCase();
  if (!q) return hotelDestinations.slice(0, limit);
  const scored = hotelDestinations
    .map((d) => {
      const hay = `${d.city} ${d.country} ${d.area ?? ""}`.toLowerCase();
      if (d.city.toLowerCase().startsWith(q)) return { d, s: 0 };
      if (hay.includes(q)) return { d, s: 1 };
      return null;
    })
    .filter((x): x is { d: HotelDestination; s: number } => x !== null)
    .sort((a, b) => a.s - b.s);
  return scored.slice(0, limit).map((x) => x.d);
}

export type Guests = { rooms: number; adults: number; children: number };

export function guestLabel(g: Guests) {
  const parts = [
    `${g.rooms} room${g.rooms > 1 ? "s" : ""}`,
    `${g.adults} adult${g.adults > 1 ? "s" : ""}`,
  ];
  if (g.children) parts.push(`${g.children} child${g.children > 1 ? "ren" : ""}`);
  return parts.join(" · ");
}

export const hotelAmenities = [
  "Free WiFi",
  "Breakfast included",
  "Swimming pool",
  "Airport shuttle",
  "Fitness centre",
  "Spa",
  "Restaurant",
  "Parking",
  "Family rooms",
  "Pet friendly",
] as const;

export type Amenity = (typeof hotelAmenities)[number];

export const propertyTypes = ["Hotel", "Resort", "Apartment", "Boutique", "Villa"] as const;
export type PropertyType = (typeof propertyTypes)[number];

export type RoomOption = {
  id: string;
  name: string;
  bed: string;
  board: string;
  refundable: boolean;
  perNight: number;
  left: number;
};

export type Hotel = {
  id: string;
  name: string;
  type: PropertyType;
  area: string;
  city: string;
  distanceKm: number;
  stars: number;
  rating: number;
  reviews: number;
  imageIndex: number;
  amenities: Amenity[];
  perNight: number;
  strikePerNight: number;
  taxesPerNight: number;
  freeCancellation: boolean;
  breakfast: boolean;
  rooms: RoomOption[];
  badge?: string | undefined;
};

const brands = [
  "Aurora",
  "The Emerald",
  "Solace",
  "Marlowe",
  "Lagoon House",
  "Verdant",
  "Nova",
  "Cedar & Stone",
  "Amber Court",
  "The Meridian",
  "Palm Quarter",
  "Sanctum",
  "Bluebird",
  "Rivage",
  "Orient Grand",
];

const suffixes = ["Hotel", "Residences", "Suites", "Retreat", "Grand", "Boutique", "Bay Resort"];

const areasFallback = [
  "City Centre",
  "Riverside",
  "Old Town",
  "Business District",
  "Beachfront",
  "Airport Zone",
];

const ratingWords = (r: number) =>
  r >= 9.2
    ? "Exceptional"
    : r >= 8.6
      ? "Excellent"
      : r >= 8
        ? "Very good"
        : r >= 7.2
          ? "Good"
          : "Pleasant";

export function ratingLabel(r: number) {
  return ratingWords(r);
}

function seedFrom(text: string) {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return () => {
    h += 0x6d2b79f5;
    let t = h;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const pick = <T>(rand: () => number, list: readonly T[]): T =>
  list[Math.floor(rand() * list.length)]!;

export function nightsBetween(checkin: string, checkout: string) {
  const a = new Date(`${checkin}T00:00:00`).getTime();
  const b = new Date(`${checkout}T00:00:00`).getTime();
  if (Number.isNaN(a) || Number.isNaN(b)) return 1;
  return Math.max(1, Math.round((b - a) / 86400000));
}

export function buildHotels(dest: HotelDestination, checkin: string): Hotel[] {
  const rand = seedFrom(`${dest.id}-${checkin}`);
  const areaPool = dest.area ? [...dest.area.split(" · "), ...areasFallback] : areasFallback;

  return Array.from({ length: 14 }, (_, i) => {
    const stars = 3 + Math.floor(rand() * 3);
    const type = pick(rand, propertyTypes);
    const name = `${pick(rand, brands)} ${pick(rand, suffixes)}`;
    const rating = Math.round((6.9 + rand() * 3 + (stars - 3) * 0.25) * 10) / 10;
    const base = Math.round((5200 + rand() * 9000) * (1 + (stars - 3) * 0.45));
    const discount = 0.08 + rand() * 0.28;
    const amenities = hotelAmenities.filter(() => rand() > 0.45);
    if (!amenities.includes("Free WiFi")) amenities.unshift("Free WiFi");
    const breakfast = amenities.includes("Breakfast included");
    const freeCancellation = rand() > 0.35;

    const perNight = Math.round(base / 50) * 50;
    const rooms: RoomOption[] = [
      {
        id: `${i}-std`,
        name: type === "Apartment" ? "Studio apartment" : "Deluxe room",
        bed: rand() > 0.5 ? "1 king bed" : "2 twin beds",
        board: breakfast ? "Breakfast included" : "Room only",
        refundable: freeCancellation,
        perNight,
        left: 1 + Math.floor(rand() * 5),
      },
      {
        id: `${i}-club`,
        name: type === "Resort" ? "Pool access villa" : "Club room · lounge access",
        bed: "1 king bed",
        board: "Breakfast + evening cocktails",
        refundable: true,
        perNight: Math.round((perNight * 1.34) / 50) * 50,
        left: 1 + Math.floor(rand() * 3),
      },
      {
        id: `${i}-suite`,
        name: "Executive suite",
        bed: "1 king bed + sofa bed",
        board: "Breakfast + airport pickup",
        refundable: true,
        perNight: Math.round((perNight * 1.85) / 50) * 50,
        left: 1 + Math.floor(rand() * 2),
      },
    ];

    return {
      id: `${dest.id}-${i}`,
      name,
      type,
      area: pick(rand, areaPool) ?? "City Centre",
      city: dest.city,
      distanceKm: Math.round(rand() * 90) / 10,
      stars,
      rating: Math.min(9.8, rating),
      reviews: 120 + Math.floor(rand() * 3400),
      imageIndex: i % 4,
      amenities,
      perNight,
      strikePerNight: Math.round(perNight / (1 - discount) / 50) * 50,
      taxesPerNight: Math.round((perNight * 0.14) / 10) * 10,
      freeCancellation,
      breakfast,
      rooms,
      badge: rand() > 0.78 ? "Genius-level deal" : rand() > 0.7 ? "Only a few left" : undefined,
    };
  });
}

export function hotelTotal(h: Hotel, nights: number, rooms: number, perNight = h.perNight) {
  const stay = perNight * nights * rooms;
  const taxes = h.taxesPerNight * nights * rooms;
  return { stay, taxes, total: stay + taxes };
}

export const bdt = (n: number) => `৳ ${Math.round(n).toLocaleString("en-US")}`;

export type HotelSearchParams = {
  dest: string;
  checkin: string;
  checkout: string;
  rooms: number;
  adults: number;
  children: number;
};

const clampInt = (v: unknown, min: number, max: number, fallback: number) => {
  const n = Number(v);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, Math.round(n)));
};

const isoDate = (v: unknown) => (typeof v === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v) ? v : "");

export function validateHotelSearch(search: Record<string, unknown>): HotelSearchParams {
  return {
    dest: typeof search["dest"] === "string" ? search["dest"] : "",
    checkin: isoDate(search["checkin"]),
    checkout: isoDate(search["checkout"]),
    rooms: clampInt(search["rooms"], 1, 6, 1),
    adults: clampInt(search["adults"], 1, 12, 2),
    children: clampInt(search["children"], 0, 8, 0),
  };
}
