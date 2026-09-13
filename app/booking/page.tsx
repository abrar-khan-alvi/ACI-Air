import type { Metadata } from "next";
import { Suspense } from "react";

import { BookingPage } from "./booking-page";

const title = "Complete your booking — ACI Air";
const description =
  "Add traveller details, choose seats, baggage and meals, then confirm your ACI Air flight booking with secure checkout.";

export const metadata: Metadata = {
  title,
  description,
  openGraph: { title, description, type: "website" },
  twitter: { card: "summary_large_image" },
};

export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <BookingPage />
    </Suspense>
  );
}
