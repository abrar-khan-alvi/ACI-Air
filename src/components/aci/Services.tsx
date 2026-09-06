import { Car, FileCheck2, Signal, ShieldCheck, Luggage, Utensils } from "lucide-react";
import { SectionHeader } from "./SectionHeader";

const services = [
  { icon: FileCheck2, title: "Visa assistance", desc: "Docs, appointments & tracking" },
  { icon: Signal, title: "Travel eSIM", desc: "190+ countries, instant QR" },
  { icon: ShieldCheck, title: "Travel insurance", desc: "Schengen-compliant cover" },
  { icon: Car, title: "Airport transfer", desc: "Meet & greet chauffeur" },
  { icon: Luggage, title: "Extra baggage", desc: "Prebook up to 40% cheaper" },
  { icon: Utensils, title: "Lounge access", desc: "Priority Pass · 1,300 lounges" },
];

export function Services() {
  return (
    <section>
      <SectionHeader
        title="Travel services"
        subtitle="Everything around the journey, bundled at checkout."
      />
      <div className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-3">
        {services.map((s) => (
          <button
            key={s.title}
            className="surface-card lift group flex items-center gap-3 p-3 text-left"
          >
            <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-secondary text-primary transition-colors duration-300 group-hover:bg-forest group-hover:text-primary-foreground">
              <s.icon className="size-4" strokeWidth={1.7} />
            </span>
            <span className="min-w-0">
              <span className="block truncate font-display text-[13px] font-semibold">
                {s.title}
              </span>
              <span className="block truncate text-[11px] text-muted-foreground">{s.desc}</span>
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}
