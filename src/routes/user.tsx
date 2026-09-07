"use client";

import { useState } from "react";
import { Sidebar } from "@/components/aci/Sidebar";
import { Topbar } from "@/components/aci/Topbar";
import { HeroSearch } from "@/components/aci/HeroSearch";
import { Destinations } from "@/components/aci/Destinations";
import { Offers } from "@/components/aci/Offers";
import { Services } from "@/components/aci/Services";
import { RightRail } from "@/components/aci/RightRail";

export default function UserHomepage() {
  const [menu, setMenu] = useState(false);

  return (
    <div className="dashboard-enter flex min-h-screen bg-background">
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
