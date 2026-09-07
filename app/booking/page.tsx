import type { Metadata } from "next";
import BookingPage from "@/routes/booking";
import { isAuthenticated } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: "Complete your booking",
  description:
    "Add traveller details, choose seats, baggage and meals, then confirm your ACI Air flight booking with secure checkout.",
};

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ ref?: string | string[] }>;
}) {
  const { ref } = await searchParams;
  return (
    <BookingPage
      bookingRef={typeof ref === "string" ? ref : ""}
      isAuthenticated={await isAuthenticated()}
    />
  );
}
