"use client";

import Image from "next/image";
import { Link } from "@/components/navigation";
import {
  Plane,
  ArrowRight,
  ShieldCheck,
  Signal,
  Hotel,
  MapPin,
  Phone,
  Menu,
  X,
  BadgeCheck,
  Headphones,
  Clock,
  Wallet,
} from "lucide-react";
import { Star, Quote, Search as SearchIcon, CreditCard, Ticket } from "lucide-react";
import { useState } from "react";
import { HeroSearch } from "@/components/aci/HeroSearch";
import { Destinations } from "@/components/aci/Destinations";
import { Offers } from "@/components/aci/Offers";
import { Services } from "@/components/aci/Services";
import { PublicNavbar } from "@/components/aci/PublicNavbar";
import { cn } from "@/lib/utils";

const navLinks = [
  { label: "Flights", to: "/search", icon: Plane },
  { label: "Hotels", to: "/hotels", icon: Hotel },
  { label: "eSIM", to: "/", icon: Signal },
  { label: "Insurance", to: "/", icon: ShieldCheck },
  { label: "Destinations", to: "/", icon: MapPin },
];

const steps = [
  {
    icon: SearchIcon,
    title: "Search once",
    desc: "Compare 500+ airlines and hotels in a single, fast search.",
  },
  {
    icon: CreditCard,
    title: "Pay your way",
    desc: "Cards, mobile wallets and 0% EMI across 12 partner banks.",
  },
  {
    icon: Ticket,
    title: "Fly relaxed",
    desc: "Instant e-tickets, free date changes and 24/7 human support.",
  },
];

const testimonials = [
  {
    initials: "SA",
    name: "Sadia Ahmed",
    role: "Dhaka → Singapore",
    quote:
      "Booked a round trip in under two minutes and the fare was lower than anywhere else I checked.",
  },
  {
    initials: "TR",
    name: "Tanvir Rahim",
    role: "Frequent flyer",
    quote:
      "The eSIM arrived by QR before I even reached the airport. Support answered in seconds at 2am.",
  },
  {
    initials: "NK",
    name: "Nadia Karim",
    role: "Family holiday",
    quote:
      "Insurance, baggage and hotels bundled at checkout — no juggling five different websites.",
  },
];

export default function MainHomepage({ isAuthenticated = false }: { isAuthenticated?: boolean }) {
  const [mobileMenu, setMobileMenu] = useState(false);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <PublicNavbar isAuthenticated={isAuthenticated} />
      <header className="hidden">
        <div className="mx-auto flex max-w-[1360px] items-center gap-3">
          <Link to="/" className="flex items-center gap-2.5">
            <Image
              src="/logo.jpg"
              alt="ACI Air"
              width={1600}
              height={1600}
              priority
              className="h-10 w-[132px] rounded-lg object-cover object-center shadow-soft"
            />
          </Link>

          <nav className="ml-8 hidden items-center gap-1 lg:flex">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                to={link.to}
                className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-[13px] font-medium text-foreground/80 transition hover:bg-secondary hover:text-foreground"
              >
                <link.icon className="size-3.5 text-primary" strokeWidth={1.8} />
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="ml-auto hidden items-center gap-2 sm:flex">
            <a
              href="tel:+8801234567890"
              className="flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-[12px] font-semibold text-foreground/80 transition hover:border-primary/40"
            >
              <Phone className="size-3.5 text-primary" /> Support
            </a>
            <Link
              to={isAuthenticated ? "/user" : "/sign-in"}
              className="flex items-center gap-1.5 rounded-full bg-forest px-4 py-2 text-[12px] font-semibold text-primary-foreground shadow-soft transition hover:shadow-card"
            >
              {isAuthenticated ? "My Dashboard" : "Sign in"} <ArrowRight className="size-3.5" />
            </Link>
          </div>

          <button
            onClick={() => setMobileMenu(true)}
            aria-label="Open menu"
            className="ml-auto grid size-9 place-items-center rounded-full border border-border bg-card text-foreground/70 sm:ml-0 lg:hidden"
          >
            <Menu className="size-4" />
          </button>
        </div>
      </header>

      {false && mobileMenu ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            aria-label="Close menu"
            onClick={() => setMobileMenu(false)}
            className="absolute inset-0 bg-foreground/25 backdrop-blur-sm"
          />
          <aside className="glass-panel absolute inset-y-0 right-0 flex w-[280px] flex-col gap-2 p-4 shadow-float">
            <button
              onClick={() => setMobileMenu(false)}
              aria-label="Close menu"
              className="absolute right-3 top-3 grid size-8 place-items-center rounded-full bg-secondary text-foreground/70"
            >
              <X className="size-4" />
            </button>
            <div className="mb-4 mt-8 flex items-center gap-2.5">
              <Image
                src="/logo.jpg"
                alt="ACI Air"
                width={1600}
                height={1600}
                className="h-10 w-[132px] rounded-lg object-cover object-center shadow-soft"
              />
            </div>
            {navLinks.map((link) => (
              <Link
                key={link.label}
                to={link.to}
                onClick={() => setMobileMenu(false)}
                className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-[14px] font-medium text-foreground/80 transition hover:bg-secondary"
              >
                <link.icon className="size-4 text-primary" strokeWidth={1.8} />
                {link.label}
              </Link>
            ))}
            <div className="mt-auto flex flex-col gap-2 border-t border-border pt-4">
              <Link
                to={isAuthenticated ? "/user" : "/sign-in"}
                onClick={() => setMobileMenu(false)}
                className="flex items-center justify-center gap-1.5 rounded-xl bg-forest py-2.5 text-[13px] font-semibold text-primary-foreground"
              >
                {isAuthenticated ? "My Dashboard" : "Sign in"} <ArrowRight className="size-4" />
              </Link>
            </div>
          </aside>
        </div>
      ) : null}

      <main className="flex-1">
        <section className="relative">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-[420px] hairline-grid opacity-70" />
          <div className="relative mx-auto max-w-[1360px] px-4 pt-5 pb-2 sm:px-6 sm:pt-8 lg:px-8 lg:pt-10">
            <div className="reveal-up">
              <HeroSearch />
            </div>
          </div>
        </section>

        <section className="border-y border-border/50 bg-secondary/40 px-4 py-5 sm:px-6 lg:px-8">
          <div className="mx-auto flex max-w-[1360px] flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Stat value="4.9" label="App Store rating" />
              <div className="h-8 w-px bg-border" />
              <Stat value="2M+" label="Happy travellers" />
              <div className="hidden h-8 w-px bg-border sm:block" />
              <Stat value="500+" label="Airlines & hotels" className="hidden sm:flex" />
            </div>
            <div className="flex flex-wrap items-center gap-3 text-[12px] text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <BadgeCheck className="size-4 text-primary" /> IATA accredited
              </span>
              <span className="inline-flex items-center gap-1.5">
                <ShieldCheck className="size-4 text-primary" /> SSL secured payments
              </span>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-[1360px] px-4 pt-10 sm:px-6 sm:pt-14 lg:px-8">
          <div className="grid gap-4 sm:grid-cols-3">
            {steps.map((s, i) => (
              <div
                key={s.title}
                className="lift group relative overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-soft"
              >
                <span className="absolute right-4 top-3 font-display text-[44px] font-bold leading-none text-secondary">
                  {i + 1}
                </span>
                <div className="grid size-10 place-items-center rounded-xl bg-secondary text-primary transition-colors group-hover:bg-lagoon group-hover:text-primary-foreground">
                  <s.icon className="size-4.5" strokeWidth={1.8} />
                </div>
                <p className="mt-4 font-display text-[16px] font-semibold">{s.title}</p>
                <p className="mt-1 max-w-[26ch] text-[12.5px] leading-relaxed text-muted-foreground">
                  {s.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-[1360px] px-4 py-10 sm:px-6 sm:py-14 lg:px-8 lg:py-18">
          <Destinations />
        </section>

        <section className="bg-secondary/30 px-4 py-10 sm:px-6 sm:py-14 lg:px-8 lg:py-18">
          <div className="mx-auto max-w-[1360px]">
            <Offers />
          </div>
        </section>

        <section className="mx-auto max-w-[1360px] px-4 py-10 sm:px-6 sm:py-14 lg:px-8 lg:py-18">
          <Services />
        </section>

        <section className="mx-auto max-w-[1360px] px-4 pb-10 sm:px-6 sm:pb-14 lg:px-8">
          <div className="mb-5">
            <p className="text-eyebrow text-primary">Traveller stories</p>
            <h2 className="mt-1 font-display text-[22px] font-semibold tracking-tight sm:text-[26px]">
              Loved by 2 million travellers
            </h2>
          </div>
          <div className="grid gap-4 lg:grid-cols-3">
            {testimonials.map((t) => (
              <figure
                key={t.name}
                className="lift relative rounded-2xl border border-border bg-card p-5 shadow-soft"
              >
                <Quote className="absolute right-4 top-4 size-6 text-secondary" />
                <div className="flex gap-0.5 text-gold">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="size-3.5 fill-current" />
                  ))}
                </div>
                <blockquote className="mt-3 text-[13.5px] leading-relaxed text-foreground/85">
                  “{t.quote}”
                </blockquote>
                <figcaption className="mt-4 flex items-center gap-2.5 border-t border-border pt-4">
                  <span className="grid size-8 place-items-center rounded-full bg-forest text-[11px] font-bold text-primary-foreground">
                    {t.initials}
                  </span>
                  <span className="leading-tight">
                    <span className="block text-[12.5px] font-semibold">{t.name}</span>
                    <span className="block text-[11px] text-muted-foreground">{t.role}</span>
                  </span>
                </figcaption>
              </figure>
            ))}
          </div>
        </section>

        <section className="bg-gradient-to-br from-primary-deep via-primary to-teal px-4 py-12 text-primary-foreground sm:px-6 sm:py-16 lg:px-8 lg:py-24">
          <div className="mx-auto max-w-[1360px]">
            <div className="grid items-center gap-10 lg:grid-cols-2">
              <div>
                <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] backdrop-blur-sm">
                  <BadgeCheck className="size-3.5" /> Why travellers choose us
                </p>
                <h2 className="font-display text-[26px] font-semibold leading-[1.1] tracking-tight sm:text-[34px]">
                  Travel smarter with ACI Air
                </h2>
                <p className="mt-3 max-w-lg text-[15px] leading-relaxed text-primary-foreground/85">
                  From instant bookings to 24/7 support, we handle the details so you can focus on
                  the journey.
                </p>
                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  <WhyItem
                    icon={Headphones}
                    title="24/7 support"
                    desc="Talk to a real human, anytime."
                  />
                  <WhyItem
                    icon={Wallet}
                    title="Best price promise"
                    desc="We match fares you find elsewhere."
                  />
                  <WhyItem
                    icon={Clock}
                    title="Flexible changes"
                    desc="Modify dates with a few taps."
                  />
                  <WhyItem
                    icon={ShieldCheck}
                    title="Secure checkout"
                    desc="Encrypted payments, always."
                  />
                </div>
              </div>
              <div className="rounded-2xl border border-white/15 bg-white/10 p-6 backdrop-blur-md sm:p-8">
                <p className="font-display text-[18px] font-semibold">Download the ACI Air app</p>
                <p className="mt-1 text-[13px] text-primary-foreground/80">
                  Get fare alerts, mobile boarding passes and exclusive app-only deals.
                </p>
                <div className="mt-5 flex flex-wrap gap-3">
                  <button className="rounded-xl bg-primary-foreground px-5 py-2.5 text-[13px] font-semibold text-primary shadow-soft transition hover:shadow-card">
                    App Store
                  </button>
                  <button className="rounded-xl border border-white/30 bg-white/10 px-5 py-2.5 text-[13px] font-semibold text-primary-foreground backdrop-blur-sm transition hover:bg-white/15">
                    Google Play
                  </button>
                </div>
                <div className="mt-6 grid grid-cols-3 gap-3 border-t border-white/15 pt-6">
                  <MiniStat value="4.9" label="Rating" />
                  <MiniStat value="1M+" label="Downloads" />
                  <MiniStat value="#1" label="Travel" />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-[1360px] px-4 py-10 sm:px-6 sm:py-14 lg:px-8 lg:py-18">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-soft sm:p-10">
            <div className="grid items-center gap-6 lg:grid-cols-[1fr_auto]">
              <div>
                <h2 className="font-display text-[22px] font-semibold tracking-tight sm:text-[26px]">
                  Subscribe to fare alerts
                </h2>
                <p className="mt-1 max-w-xl text-[13px] text-muted-foreground">
                  Be the first to know when prices drop on your favourite routes.
                </p>
              </div>
              <form
                onSubmit={(e) => e.preventDefault()}
                className="flex w-full flex-col gap-2 sm:flex-row lg:w-auto"
              >
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="h-11 rounded-lg border border-border bg-background px-4 text-[13px] outline-none transition focus:border-primary/40 sm:w-64"
                />
                <button className="h-11 shrink-0 rounded-lg bg-forest px-5 text-[13px] font-semibold text-primary-foreground shadow-soft transition hover:shadow-card">
                  Subscribe
                </button>
              </form>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border bg-card/50 px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[1360px]">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <div className="flex items-center gap-2.5">
                <div className="grid size-8 place-items-center rounded-lg bg-lagoon shadow-soft">
                  <Plane className="size-4 text-primary-foreground" strokeWidth={2} />
                </div>
                <p className="font-display text-[16px] font-semibold">ACI Air</p>
              </div>
              <p className="mt-3 max-w-xs text-[12px] leading-relaxed text-muted-foreground">
                Premium online travel agency for flights, hotels, eSIM, insurance and curated
                destinations.
              </p>
            </div>
            <FooterColumn
              title="Discover"
              links={["Flights", "Hotels", "eSIM", "Insurance", "Destinations"]}
            />
            <FooterColumn
              title="Company"
              links={["About us", "Careers", "Press", "Partner with us", "Sustainability"]}
            />
            <FooterColumn
              title="Support"
              links={["Help centre", "Contact us", "FAQs", "Terms", "Privacy"]}
            />
          </div>
          <div className="mt-8 flex flex-col items-center justify-between gap-3 border-t border-border pt-6 text-[12px] text-muted-foreground sm:flex-row">
            <p>© 2026 ACI Air. All rights reserved.</p>
            <p>Fares shown are indicative and include taxes.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function Stat({ value, label, className }: { value: string; label: string; className?: string }) {
  return (
    <div className={cn("flex flex-col", className)}>
      <span className="font-display text-[20px] font-semibold leading-none text-foreground sm:text-[24px]">
        {value}
      </span>
      <span className="text-[11px] text-muted-foreground">{label}</span>
    </div>
  );
}

function MiniStat({ value, label }: { value: string; label: string }) {
  return (
    <div className="text-center">
      <p className="font-display text-[18px] font-semibold">{value}</p>
      <p className="text-[11px] text-primary-foreground/70">{label}</p>
    </div>
  );
}

function WhyItem({ icon: Icon, title, desc }: { icon: typeof Plane; title: string; desc: string }) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/5 p-3 backdrop-blur-sm">
      <div className="grid size-9 shrink-0 place-items-center rounded-lg bg-white/10">
        <Icon className="size-4 text-gold" strokeWidth={1.8} />
      </div>
      <div>
        <p className="font-display text-[14px] font-semibold">{title}</p>
        <p className="text-[12px] text-primary-foreground/70">{desc}</p>
      </div>
    </div>
  );
}

function FooterColumn({ title, links }: { title: string; links: string[] }) {
  return (
    <div>
      <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
        {title}
      </p>
      <ul className="space-y-2">
        {links.map((link) => (
          <li key={link}>
            <span className="cursor-pointer text-[13px] text-foreground/80 transition hover:text-foreground">
              {link}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
