import type { Metadata } from "next";

import { UserHomepage } from "./user-page";

const title = "User Homepage — ACI Air";
const description =
  "Your personal ACI Air travel dashboard. Search flights, hotels, eSIM and insurance, track trips, bookings, and Green Miles rewards.";

export const metadata: Metadata = {
  title,
  description,
  openGraph: { title, description, type: "website" },
  twitter: { card: "summary_large_image" },
};

export default function Page() {
  return <UserHomepage />;
}
