import { useState } from "react";
import {
  Plane,
  Hotel,
  Signal,
  ShieldCheck,
  Compass,
  Ticket,
  Gift,
  LifeBuoy,
  Settings,
  LayoutGrid,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { BrandLogo } from "@/components/aci/PublicNavbar";

export const primary = [
  { label: "Explore", icon: LayoutGrid },
  { label: "Flights", icon: Plane },
  { label: "Hotels", icon: Hotel },
  { label: "eSIM", icon: Signal },
  { label: "Insurance", icon: ShieldCheck },
  { label: "Destinations", icon: Compass },
];

const secondary = [
  { label: "My Trips", icon: Ticket },
  { label: "Rewards", icon: Gift },
  { label: "Support", icon: LifeBuoy },
  { label: "Settings", icon: Settings },
];

function Nav({ onNavigate }: { onNavigate?: () => void }) {
  const [active, setActive] = useState("Explore");

  const Item = ({ label, icon: Icon }: { label: string; icon: typeof Plane }) => (
    <button
      onClick={() => {
        setActive(label);
        onNavigate?.();
      }}
      className={cn(
        "flex w-full items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-[13px] font-medium transition-all duration-300",
        active === label
          ? "bg-white/20 text-white shadow-soft"
          : "text-white/70 hover:bg-white/10 hover:text-white",
      )}
    >
      <Icon
        className={cn("size-4", active === label ? "text-white/90" : "text-white/50")}
        strokeWidth={1.8}
      />
      {label}
    </button>
  );

  return (
    <>
      <div className="flex items-center gap-2.5 px-1">
        <BrandLogo />
      </div>

      <nav className="mt-6 space-y-0.5">
        <p className="px-2.5 pb-1.5 text-[9px] font-semibold uppercase tracking-[0.2em] text-white/50">
          Discover
        </p>
        {primary.map((i) => (
          <Item key={i.label} {...i} />
        ))}
      </nav>

      <nav className="mt-5 space-y-0.5">
        <p className="px-2.5 pb-1.5 text-[9px] font-semibold uppercase tracking-[0.2em] text-white/50">
          Account
        </p>
        {secondary.map((i) => (
          <Item key={i.label} {...i} />
        ))}
      </nav>

      <div className="mt-auto rounded-xl border border-white/10 bg-white/5 p-3">
        <p className="font-display text-[13px] font-semibold text-white">
          Green Miles Gold
        </p>
        <p className="mt-0.5 text-[11px] text-white/70">
          8,420 pts · 1,580 to Platinum
        </p>
        <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-white/20">
          <div className="h-full w-[84%] rounded-full bg-[#f16b6d]" />
        </div>
      </div>
    </>
  );
}

export function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <>
      <aside className="bg-aci-blue-800 sticky top-0 hidden h-screen w-[212px] shrink-0 flex-col border-r border-white/10 px-3 py-5 lg:flex">
        <Nav />
      </aside>

      {open ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            aria-label="Close menu"
            onClick={onClose}
            className="absolute inset-0 bg-foreground/25 backdrop-blur-sm"
          />
          <aside className="bg-aci-blue-800 absolute inset-y-0 left-0 flex w-[240px] max-w-[86vw] flex-col overflow-y-auto px-3 py-5 shadow-float">
            <button
              onClick={onClose}
              aria-label="Close menu"
              className="absolute right-3 top-3 grid size-7 place-items-center rounded-full bg-white/10 text-white/70 hover:bg-white/20 hover:text-white transition"
            >
              <X className="size-3.5" />
            </button>
            <Nav onNavigate={onClose} />
          </aside>
        </div>
      ) : null}
    </>
  );
}
