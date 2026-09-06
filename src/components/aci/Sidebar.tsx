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
          ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-soft"
          : "text-sidebar-foreground/75 hover:bg-sidebar-accent/70 hover:text-sidebar-accent-foreground",
      )}
    >
      <Icon
        className={cn("size-4", active === label ? "text-primary" : "text-sidebar-foreground/55")}
        strokeWidth={1.8}
      />
      {label}
    </button>
  );

  return (
    <>
      <div className="flex items-center gap-2.5 px-1">
        <div className="grid size-8 place-items-center rounded-xl bg-lagoon shadow-soft">
          <Plane className="size-4 text-primary-foreground" strokeWidth={2} />
        </div>
        <div className="leading-tight">
          <p className="font-display text-[15px] font-semibold text-sidebar-accent-foreground">
            ACI Air
          </p>
          <p className="text-[9px] uppercase tracking-[0.18em] text-sidebar-foreground/50">
            Travel Suite
          </p>
        </div>
      </div>

      <nav className="mt-6 space-y-0.5">
        <p className="px-2.5 pb-1.5 text-[9px] font-semibold uppercase tracking-[0.2em] text-sidebar-foreground/45">
          Discover
        </p>
        {primary.map((i) => (
          <Item key={i.label} {...i} />
        ))}
      </nav>

      <nav className="mt-5 space-y-0.5">
        <p className="px-2.5 pb-1.5 text-[9px] font-semibold uppercase tracking-[0.2em] text-sidebar-foreground/45">
          Account
        </p>
        {secondary.map((i) => (
          <Item key={i.label} {...i} />
        ))}
      </nav>

      <div className="mt-auto rounded-xl border border-sidebar-border bg-sidebar-accent/80 p-3">
        <p className="font-display text-[13px] font-semibold text-sidebar-accent-foreground">
          Green Miles Gold
        </p>
        <p className="mt-0.5 text-[11px] text-sidebar-foreground/65">
          8,420 pts · 1,580 to Platinum
        </p>
        <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-secondary">
          <div className="h-full w-[84%] rounded-full bg-sun" />
        </div>
      </div>
    </>
  );
}

export function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <>
      <aside className="glass-panel sticky top-0 hidden h-screen w-[212px] shrink-0 flex-col border-y-0 border-l-0 px-3 py-5 lg:flex">
        <Nav />
      </aside>

      {open ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            aria-label="Close menu"
            onClick={onClose}
            className="absolute inset-0 bg-foreground/25 backdrop-blur-sm"
          />
          <aside className="glass-panel absolute inset-y-0 left-0 flex w-[240px] flex-col px-3 py-5 shadow-float">
            <button
              onClick={onClose}
              aria-label="Close menu"
              className="absolute right-3 top-3 grid size-7 place-items-center rounded-full bg-secondary text-foreground/70"
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
