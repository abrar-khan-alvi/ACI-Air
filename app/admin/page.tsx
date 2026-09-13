import type { Metadata } from "next";

import { AdminConsole } from "./admin-page";

const title = "Super Admin Console — ACI Air";
const description =
  "Operate ACI Air B2B and B2C from one console: agencies, deposits, bookings, refunds, airline markup, site content, staff roles and reports.";

export const metadata: Metadata = {
  title,
  description,
  openGraph: { title, description, type: "website" },
  twitter: { card: "summary_large_image" },
};

export default function Page() {
  return <AdminConsole />;
}
