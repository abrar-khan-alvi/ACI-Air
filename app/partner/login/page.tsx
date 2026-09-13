import type { Metadata } from "next";

import { PartnerLogin } from "./login-page";

const title = "Partner Login — ACI Air";
const description = "Sign in to the ACI Air partner portal to manage agency bookings and fares.";

export const metadata: Metadata = {
  title,
  description,
  openGraph: { title, description, type: "website" },
  twitter: { card: "summary_large_image" },
};

export default function Page() {
  return <PartnerLogin />;
}
