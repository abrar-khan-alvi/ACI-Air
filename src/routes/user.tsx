import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Sidebar } from "@/components/aci/Sidebar";
import { Topbar } from "@/components/aci/Topbar";
import { HeroSearch } from "@/components/aci/HeroSearch";
import { Destinations } from "@/components/aci/Destinations";
import { Offers } from "@/components/aci/Offers";
import { Services } from "@/components/aci/Services";
import { RightRail } from "@/components/aci/RightRail";

const title = "User Homepage — ACI Air";
const description =
  "Your personal ACI Air travel dashboard. Search flights, hotels, eSIM and insurance, track trips, bookings, and Green Miles rewards.";

export const Route = createFileRoute("/user")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: UserHomepage,
});

function UserHomepage() {
  const [menu, setMenu] = useState(false);

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar open={menu} onClose={() => setMenu(false)} />
      <div className="min-w-0 flex-1">
        <Topbar onMenu={() => setMenu(true)} />
        <main className="mx-auto max-w-[1360px] px-3 py-4 sm:px-5 lg:px-7">
          <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_270px]">
            <div className="min-w-0 space-y-6">
              <HeroSearch />
              <Destinations />
              <Offers />
              <Services />
            </div>
            <RightRail />
          </div>
          <footer className="mt-8 border-t border-border pt-4 text-[11px] text-muted-foreground">
            © 2026 ACI Air. Fares shown are indicative and include taxes.
          </footer>
        </main>
      </div>
    </div>
  );
}
