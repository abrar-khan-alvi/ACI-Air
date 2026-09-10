import type { Metadata } from "next";
import InsurancePage from "@/routes/insurance";
import { isAuthenticated } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: "Travel Insurance - ACI Air",
  description: "Find comprehensive travel insurance plans for your journey.",
};

export default async function Page() {
  return <InsurancePage isAuthenticated={await isAuthenticated()} />;
}
