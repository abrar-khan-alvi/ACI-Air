import type { Metadata } from "next";
import HotelSearchPage from "@/routes/hotels";
import { validateHotelSearch } from "@/lib/hotels";
import { isAuthenticated } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: "Hotel search results",
  description:
    "Compare handpicked hotels, resorts and apartments worldwide with free cancellation, live room availability and all-in BDT pricing.",
};

type SearchValue = string | string[] | undefined;

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<Record<string, SearchValue>>;
}) {
  const raw = await searchParams;
  const normalized = Object.fromEntries(
    Object.entries(raw).map(([key, value]) => [key, Array.isArray(value) ? value[0] : value]),
  );
  return (
    <HotelSearchPage
      key={JSON.stringify(normalized)}
      params={validateHotelSearch(normalized)}
      isAuthenticated={await isAuthenticated()}
    />
  );
}
