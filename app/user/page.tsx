import type { Metadata } from "next";
import UserHomepage from "@/routes/user";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: "User Homepage",
  description:
    "Your personal ACI Air travel dashboard. Search flights, hotels, eSIM and insurance, track trips, bookings, and Green Miles rewards.",
};

export default async function Page() {
  if (!(await getSession())) redirect("/sign-in");

  return <UserHomepage />;
}
