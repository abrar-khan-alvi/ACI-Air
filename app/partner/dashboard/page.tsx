import type { Metadata } from "next";

import { PartnerDashboard } from "./dashboard-page";

const title = "Partner Dashboard — ACI Air";
const description =
  "Manage your ACI Air partner balance, ticket issuance, deposits, team members and company profile from one workspace.";

export const metadata: Metadata = {
  title,
  description,
  openGraph: { title, description, type: "website" },
  twitter: { card: "summary_large_image" },
};

export default function Page() {
  return <PartnerDashboard />;
}
