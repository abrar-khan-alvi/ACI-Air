import { Percent, CreditCard, Luggage } from "lucide-react";
import { SectionHeader } from "./SectionHeader";

const offers = [
  {
    icon: Percent,
    title: "Monsoon Escape",
    body: "Flat 15% off on Southeast Asia return fares booked before 31 Aug.",
    code: "ACIMONSOON",
    className: "bg-forest text-primary-foreground",
    sub: "text-primary-foreground/70",
  },
  {
    icon: CreditCard,
    title: "0% EMI · 12 months",
    body: "Split any booking above ৳ 20,000 across 12 interest-free instalments.",
    code: "EMI12",
    className: "bg-lagoon text-primary-foreground",
    sub: "text-primary-foreground/70",
  },
  {
    icon: Luggage,
    title: "Free 10kg baggage",
    body: "Extra allowance on selected Gulf routes for Gold members and above.",
    code: "GOLDBAG",
    className: "bg-sun text-gold-foreground",
    sub: "text-gold-foreground/70",
  },
];

export function Offers() {
  return (
    <section>
      <SectionHeader
        title="Best offers"
        subtitle="Limited-time deals across flights, stays and add-ons."
        action="All offers"
      />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {offers.map((o) => (
          <article
            key={o.title}
            className={`lift relative overflow-hidden rounded-xl p-4 shadow-soft ${o.className}`}
          >
            <div className="absolute -right-8 -top-10 size-24 rounded-full bg-card/10" />
            <o.icon className="size-4.5" strokeWidth={1.7} />
            <h3 className="mt-3 font-display text-[14px] font-semibold">{o.title}</h3>
            <p className={`mt-1 text-[12px] leading-relaxed ${o.sub}`}>{o.body}</p>
            <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-dashed border-current/40 px-2.5 py-1 text-[10px] font-semibold tracking-[0.12em]">
              {o.code}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
