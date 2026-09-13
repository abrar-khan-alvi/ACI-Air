import type { Metadata } from "next";

import { MainHomepage } from "./home-page";

const title = "ACI Air — Your Next Journey Starts Here";
const description = "Search and book flights, hotels, packages and holidays with ACI Air.";

export const metadata: Metadata = {
  title,
  description,
  openGraph: { title, description, type: "website" },
  twitter: { card: "summary_large_image" },
};

export default function Page() {
  return <MainHomepage />;
}
