import { NextResponse } from "next/server";
import { z } from "zod";

const addressSchema = z.object({
  city: z.string().trim().min(1).max(100),
  postalCode: z.string().trim().min(1).max(12),
  countryCode: z.string().trim().length(2),
});

type ZippopotamPlace = {
  "place name"?: string;
  state?: string;
};

function normalizePlace(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/gi, "")
    .toLowerCase();
}

export async function POST(request: Request) {
  const json: unknown = await request.json().catch(() => null);
  const parsed = addressSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Country, city, and postal code are required." },
      { status: 400 },
    );
  }

  const body = parsed.data;

  const countryCode = body.countryCode.toLowerCase();
  const postalCode = body.postalCode.trim();
  const response = await fetch(
    `https://api.zippopotam.us/${encodeURIComponent(countryCode)}/${encodeURIComponent(postalCode)}`,
    {
      headers: { Accept: "application/json" },
      cache: "no-store",
    },
  );

  if (response.status === 404) {
    return NextResponse.json({
      configured: true,
      valid: false,
      reason: "postal_code_not_found",
      places: [],
    });
  }

  if (!response.ok) {
    return NextResponse.json(
      { error: "Postal-code verification is temporarily unavailable." },
      { status: 502 },
    );
  }

  const data = await response.json();
  const places: ZippopotamPlace[] = Array.isArray(data.places) ? data.places : [];
  const enteredCity = normalizePlace(body.city);
  const cityMatches = places.some((place) => {
    const returnedCity = normalizePlace(place["place name"] ?? "");
    return (
      Boolean(returnedCity) &&
      (returnedCity === enteredCity ||
        returnedCity.includes(enteredCity) ||
        enteredCity.includes(returnedCity))
    );
  });

  return NextResponse.json({
    configured: true,
    valid: places.length > 0,
    cityMatches,
    reason: null,
    country: data.country,
    postalCode: data["post code"],
    places: places.map((place) => ({
      city: place["place name"],
      state: place.state,
    })),
  });
}
