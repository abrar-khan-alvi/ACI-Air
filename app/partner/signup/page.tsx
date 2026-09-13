import type { Metadata } from "next";

import { PartnerSignup } from "./signup-page";

const title = "Become an ACI Air Partner";
const description =
  "Create an ACI Air partner account for agency fares, booking tools and dedicated support.";

export const metadata: Metadata = {
  title,
  description,
  openGraph: { title, description, type: "website" },
  twitter: { card: "summary_large_image" },
};

export default function Page() {
  return <PartnerSignup />;
}
