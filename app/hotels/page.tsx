import type { Metadata } from "next";
import { Suspense } from "react";

import { HotelSearchPage } from "./hotels-page";

const title = "Hotel search results — ACI Air";
const description =
  "Compare handpicked hotels, resorts and apartments worldwide with free cancellation, live room availability and all-in BDT pricing.";

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
      <HotelSearchPage />
    </Suspense>
  );
}
