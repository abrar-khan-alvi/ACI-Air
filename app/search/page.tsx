import type { Metadata } from "next";
import SearchPage from "@/routes/search";
import { validateFlightSearch } from "@/lib/search-params";
import { isAuthenticated } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: "Flight search results",
  description:
    "Compare live-style fares, filter by stops, airline, departure time and budget, and pick the best flight for your trip with ACI Air.",
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
    <SearchPage
      key={JSON.stringify(normalized)}
      params={validateFlightSearch(normalized)}
      isAuthenticated={await isAuthenticated()}
    />
  );
}
