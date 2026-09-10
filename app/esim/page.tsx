import type { Metadata } from "next";
import EsimPage from "@/routes/esim";
import { isAuthenticated } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: "eSIM - ACI Air",
  description: "Find the best eSIM data plans for your next trip.",
};

export default async function Page() {
  return <EsimPage isAuthenticated={await isAuthenticated()} />;
}
