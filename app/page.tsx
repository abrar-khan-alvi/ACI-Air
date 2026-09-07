import type { Metadata } from "next";
import MainHomepage from "@/routes/index";
import { isAuthenticated } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: "AIC Air - Book Flights, Hotels, eSIM & Travel Insurance",
  description:
    "ACI Air is a premium online travel agency for flights, hotels, eSIM, insurance, and curated destinations.",
};

export default async function Page() {
  return <MainHomepage isAuthenticated={await isAuthenticated()} />;
}
