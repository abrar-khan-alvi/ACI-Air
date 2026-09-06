import bangkok from "@/assets/dest-bangkok.jpg";
import dubai from "@/assets/dest-dubai.jpg";
import singapore from "@/assets/dest-singapore.jpg";
import maldives from "@/assets/dest-maldives.jpg";
import { ArrowUpRight } from "lucide-react";
import { SectionHeader } from "./SectionHeader";

const destinations = [
  { city: "Bangkok", country: "Thailand", price: "৳ 24,900", img: bangkok, tag: "Trending" },
  { city: "Dubai", country: "UAE", price: "৳ 38,400", img: dubai, tag: "Visa on arrival" },
  {
    city: "Singapore",
    country: "Singapore",
    price: "৳ 41,200",
    img: singapore,
    tag: "Family pick",
  },
  { city: "Maldives", country: "Maldives", price: "৳ 52,750", img: maldives, tag: "Honeymoon" },
];

export function Destinations() {
  return (
    <section>
      <SectionHeader
        title="Popular destinations"
        subtitle="Handpicked routes from Dhaka with the best availability this month."
        action="View all"
      />
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        {destinations.map((d) => (
          <article
            key={d.city}
            className="lift group relative h-40 overflow-hidden rounded-xl shadow-soft sm:h-48"
          >
            <img
              src={d.img}
              alt={`${d.city}, ${d.country}`}
              width={800}
              height={1000}
              loading="lazy"
              className="absolute inset-0 size-full object-cover transition-transform duration-[900ms] ease-out group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-[linear-gradient(to_top,oklch(0.2_0.05_160/0.9)_0%,oklch(0.2_0.05_160/0.2)_55%,transparent_100%)]" />
            <span className="absolute left-2.5 top-2.5 rounded-full bg-card/85 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.12em] text-primary backdrop-blur">
              {d.tag}
            </span>
            <div className="absolute inset-x-3 bottom-2.5 text-primary-foreground">
              <p className="font-display text-[15px] font-semibold">{d.city}</p>
              <p className="text-[10px] text-primary-foreground/70">{d.country}</p>
              <div className="mt-1.5 flex items-center justify-between">
                <span className="text-[11px]">
                  <span className="text-primary-foreground/60">from </span>
                  <span className="font-display font-semibold text-gold">{d.price}</span>
                </span>
                <span className="grid size-6 place-items-center rounded-full bg-card/90 text-primary transition-transform duration-300 group-hover:translate-x-0.5">
                  <ArrowUpRight className="size-3" />
                </span>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
