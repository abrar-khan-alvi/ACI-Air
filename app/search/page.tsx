import type { Metadata } from "next";
import { Suspense } from "react";

import { SearchPage } from "./search-page";

const title = "Flight search results — ACI Air";
const description =
  "Compare live-style fares, filter by stops, airline, departure time and budget, and pick the best flight for your trip with ACI Air.";

export const metadata: Metadata = {
  title,
  description,
  openGraph: { title, description, type: "website" },
  twitter: { card: "summary_large_image" },
};

// Rendered per request so the results are in the initial HTML rather than
// appearing only after the client reads the query string.
export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <SearchPage />
    </Suspense>
  );
}
