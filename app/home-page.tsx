"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ArrowRight,
  BadgeCheck,
  CalendarDays,
  ChevronRight,
  CreditCard,
  Globe2,
  Headphones,
  Hotel,
  Menu,
  Package,
  Plane,
  Search,
  ShieldCheck,
  Star,
  UserRound,
  WalletCards,
  X,
  Zap,
} from "lucide-react";
import Image from "next/image";
import heroWorld from "@/assets/aci-air-world-hero.webp";
import bangkok from "@/assets/dest-bangkok.jpg";
import dubai from "@/assets/dest-dubai.jpg";
import singapore from "@/assets/dest-singapore.jpg";
import maldives from "@/assets/dest-maldives.jpg";
import { HomeSearch } from "@/components/aci/HomeSearch";
import { Button } from "@/components/ui/button";

const destinations = [
  { city: "Dubai", country: "UAE", image: dubai },
  { city: "Singapore", country: "Singapore", image: singapore },
  { city: "Bangkok", country: "Thailand", image: bangkok },
  { city: "Kuala Lumpur", country: "Malaysia", image: singapore },
  { city: "London", country: "UK", image: dubai },
];

const deals = [
  { route: "Dhaka → Dubai", date: "15 Sep – 22 Sep 2026", image: dubai },
  { route: "Dhaka → Singapore", date: "10 Sep – 18 Sep 2026", image: singapore },
  { route: "Dhaka → Bangkok", date: "05 Oct – 12 Oct 2026", image: bangkok },
];

const assurances = [
  { icon: Headphones, title: "Travel support", body: "We're here when you need us" },
  { icon: ShieldCheck, title: "Secure checkout", body: "Your data stays safe" },
  { icon: Zap, title: "Instant confirmation", body: "Get your tickets quickly" },
  { icon: CalendarDays, title: "Flexible options", body: "Change plans with ease" },
  { icon: Star, title: "Reward points", body: "Travel more, earn more" },
  { icon: WalletCards, title: "Easy payments", body: "Multiple secure methods" },
];

function Brand() {
  return (
    <Link href="/" className="inline-flex items-end text-primary-foreground" aria-label="ACI Air home">
      <span className="font-display text-[30px] font-extrabold italic leading-none sm:text-[34px]">ACI</span>
      <span className="relative -ml-0.5 font-display text-[25px] font-bold italic leading-none sm:text-[28px]">
        air
        <span className="absolute -top-1 left-1 h-0.5 w-7 rotate-[-9deg] bg-clay" />
      </span>
    </Link>
  );
}

export function MainHomepage() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <section className="relative min-h-[770px] overflow-visible bg-primary text-primary-foreground sm:min-h-[410px] lg:min-h-[448px]">
        <div className="absolute inset-0 z-0" aria-hidden>
          <Image
            src={heroWorld}
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover object-center"
          />
        </div>
        <div
          className="absolute inset-0 z-[1] bg-[linear-gradient(90deg,oklch(0.235_0.085_277/0.98)_0%,oklch(0.235_0.085_277/0.82)_27%,oklch(0.235_0.085_277/0.18)_58%,transparent_100%)]"
          aria-hidden
        />
        <span className="sr-only">ACI Air traveller overlooking world landmarks as an aircraft flies above</span>

        <header className="relative z-10 mx-auto flex h-16 max-w-[1440px] items-center gap-8 px-4 sm:px-7 lg:px-12">
          <Brand />
          <nav className="hidden items-center gap-8 lg:flex">
            <a href="#search" className="border-b-2 border-clay py-5 text-[12px] font-semibold">Flights</a>
            <a href="#search" className="py-5 text-[12px] font-medium text-primary-foreground/85">Hotels</a>
            <a href="#search" className="py-5 text-[12px] font-medium text-primary-foreground/85">Packages</a>
            <a href="#search" className="py-5 text-[12px] font-medium text-primary-foreground/85">Holidays</a>
            <Link href="/user" className="py-5 text-[12px] font-medium text-primary-foreground/85">Manage booking</Link>
          </nav>
          <div className="ml-auto hidden items-center gap-2 sm:flex">
            <Button variant="ghost" className="h-9 rounded-lg bg-primary/80 px-3 text-[11px] text-primary-foreground hover:bg-primary hover:text-primary-foreground">
              <Globe2 className="size-4" /> EN <span className="text-primary-foreground/60">⌄</span> বাংলা
            </Button>
            <Button asChild variant="secondary" className="h-9 rounded-lg bg-card px-4 text-[11px] text-primary hover:bg-card/90">
              <Link href="/user"><UserRound className="size-4" /> Sign in</Link>
            </Button>
            <Button asChild variant="secondary" className="h-9 rounded-lg bg-card px-4 text-[11px] text-primary hover:bg-card/90">
              <Link href="/user"><WalletCards className="size-4" /> My wallet</Link>
            </Button>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
            className="ml-auto text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground lg:hidden"
          >
            <Menu />
          </Button>
        </header>

        {menuOpen ? (
          <div className="fixed inset-0 z-50 lg:hidden">
            <Button type="button" variant="ghost" aria-label="Close menu" onClick={() => setMenuOpen(false)} className="absolute inset-0 h-full w-full rounded-none bg-foreground/35" />
            <aside className="absolute inset-y-0 right-0 w-[280px] bg-card p-5 text-foreground shadow-float">
              <Button type="button" variant="ghost" size="icon" onClick={() => setMenuOpen(false)} aria-label="Close menu" className="absolute right-3 top-3"><X /></Button>
              <p className="font-display text-xl font-bold italic text-primary">ACI air</p>
              <nav className="mt-8 grid gap-1">
                {["Flights", "Hotels", "Packages", "Holidays", "Manage booking"].map((item) => (
                  <a key={item} href="#search" onClick={() => setMenuOpen(false)} className="rounded-md px-3 py-3 text-sm font-semibold hover:bg-secondary">{item}</a>
                ))}
              </nav>
              <Button asChild className="mt-5 w-full bg-clay text-primary-foreground hover:bg-clay/90"><Link href="/user">Sign in</Link></Button>
            </aside>
          </div>
        ) : null}

        <div className="relative z-10 mx-auto max-w-[1440px] px-4 pt-4 sm:px-7 sm:pt-7 lg:px-12 lg:pt-6">
          <div className="max-w-xl">
            <h1 className="font-display text-[38px] font-extrabold leading-[0.98] sm:text-[48px] lg:text-[55px]">
              Your next journey<br />starts here<span className="text-clay">.</span>
            </h1>
            <p className="mt-3 text-[13px] text-primary-foreground/90 sm:text-[15px]">
              Search, compare and book your next trip with confidence.
            </p>
            <div className="mt-5 hidden flex-wrap gap-x-6 gap-y-3 sm:flex">
              <HeroPoint icon={Plane} title="Wide network" body="More destinations" />
              <HeroPoint icon={ShieldCheck} title="Trusted travel" body="A name you can rely on" />
              <HeroPoint icon={UserRound} title="For every journey" body="Leisure, business or family" />
            </div>
          </div>
          <p className="absolute right-[7%] top-12 hidden rotate-[-7deg] font-display text-[16px] italic leading-tight text-primary lg:block">
            Fly Further<br />Live <span className="underline decoration-clay decoration-2 underline-offset-4">Brighter</span>
          </p>
        </div>

        <div id="search" className="absolute inset-x-0 top-[285px] z-30 mx-auto max-w-[1370px] px-3 sm:top-[315px] sm:px-7 lg:top-[300px] lg:px-12">
          <HomeSearch />
        </div>
      </section>

      <main className="mx-auto max-w-[1346px] px-4 pb-8 pt-8 sm:px-7 sm:pt-[185px] lg:px-12 lg:pt-[110px]">
        <div className="grid min-w-0 gap-5 lg:grid-cols-[1.6fr_.72fr_.5fr]">
          <section className="min-w-0">
            <SectionTitle icon={Plane} title="Popular destinations" subtitle="Explore the world's most loved cities" action="View all" />
            <div className="no-scrollbar grid auto-cols-[145px] grid-flow-col gap-2 overflow-x-auto pb-1 sm:auto-cols-fr sm:grid-cols-5 sm:overflow-visible">
              {destinations.map((item) => (
                <article key={item.city} className="overflow-hidden rounded-md border border-border bg-card shadow-soft">
                  <Image src={item.image} alt={item.city} width={420} height={300} loading="lazy" className="h-28 w-full object-cover" />
                  <div className="flex items-center px-3 py-2.5">
                    <span className="min-w-0">
                      <span className="block truncate text-[11px] font-semibold text-primary">{item.city}</span>
                      <span className="block text-[9px] text-muted-foreground">{item.country}</span>
                    </span>
                    <Button type="button" variant="secondary" size="icon" aria-label={`Explore ${item.city}`} className="ml-auto size-7 rounded-full text-primary"><ChevronRight className="size-3" /></Button>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="min-w-0">
            <SectionTitle icon={Package} title="Top deals" subtitle="Handpicked fares for your next trip" action="View all" />
            <div className="grid gap-2">
              {deals.map((deal) => (
                <article key={deal.route} className="flex h-[62px] items-center gap-2 rounded-md border border-border bg-card p-2 shadow-soft">
                  <Image src={deal.image} alt="" width={90} height={90} loading="lazy" className="size-11 rounded object-cover" />
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate text-[10px] font-semibold text-primary">{deal.route}</h3>
                    <p className="truncate text-[8px] text-muted-foreground">{deal.date}</p>
                    <p className="text-[8px] text-muted-foreground">Economy</p>
                  </div>
                  <span className="rounded bg-accent px-1.5 py-1 text-[8px] font-semibold text-clay">Sample fare</span>
                  <Button type="button" variant="secondary" size="icon" aria-label={`View ${deal.route}`} className="size-7 rounded-full text-primary"><ArrowRight className="size-3" /></Button>
                </article>
              ))}
            </div>
          </section>

          <aside className="relative min-h-56 overflow-hidden rounded-lg bg-primary shadow-card lg:min-h-0">
            <div className="absolute inset-0 z-0" aria-hidden>
              <Image
                src={heroWorld}
                alt=""
                fill
                sizes="(max-width: 1024px) 100vw, 360px"
                loading="lazy"
                className="object-cover object-[64%_center]"
              />
            </div>
            <div
              className="absolute inset-0 z-[1] bg-[linear-gradient(to_top,oklch(0.235_0.085_277/0.98)_0%,oklch(0.235_0.085_277/0.2)_75%)]"
              aria-hidden
            />
            <span className="sr-only">Aircraft wing above the clouds</span>
            <div className="absolute inset-x-0 bottom-0 z-[2] p-4 text-primary-foreground">
              <h2 className="font-display text-[20px] font-bold leading-[1.05]">More journeys.<br />Better moments.</h2>
              <p className="mt-1.5 text-[9px] leading-relaxed text-primary-foreground/80">Exclusive offers, curated destinations and travel inspiration — all in one place.</p>
              <Button type="button" className="mt-3 h-8 bg-clay px-3 text-[10px] text-primary-foreground hover:bg-clay/90">Explore offers <ArrowRight /></Button>
            </div>
          </aside>
        </div>

        <section className="mt-4 grid gap-2 rounded-lg bg-secondary/70 p-3 sm:grid-cols-2 lg:grid-cols-6">
          {assurances.map((item, index) => (
            <div key={item.title} className="flex items-center gap-2.5 px-2 lg:border-r lg:border-border lg:last:border-r-0">
              <item.icon className="size-5 shrink-0 text-primary" strokeWidth={1.8} />
              <div>
                <p className="text-[9px] font-semibold text-primary">{item.title}</p>
                <p className="text-[7px] text-muted-foreground">{item.body}</p>
              </div>
            </div>
          ))}
        </section>

        <section className="relative mt-3 min-h-20 overflow-hidden rounded-lg bg-secondary">
          <div className="absolute inset-0 z-0 opacity-80" aria-hidden>
            <Image
              src={heroWorld}
              alt=""
              fill
              sizes="100vw"
              loading="lazy"
              className="object-cover object-[45%_44%]"
            />
          </div>
          <span className="sr-only">Clouds and ACI Air aircraft</span>
          <div className="absolute inset-0 bg-[linear-gradient(90deg,oklch(0.88_0.04_245/0.98)_0%,oklch(0.88_0.04_245/0.72)_38%,transparent_72%)]" />
          <div className="relative z-[2] p-4 sm:px-6">
            <h2 className="font-display text-xl font-bold text-primary">Travel smarter with ACI Air</h2>
            <p className="mt-1 text-[10px] text-primary/75">Plan, book and manage your journeys wherever you go.</p>
          </div>
        </section>
      </main>
    </div>
  );
}

function HeroPoint({ icon: Icon, title, body }: { icon: typeof Plane; title: string; body: string }) {
  return (
    <div className="flex items-center gap-2 border-r border-primary-foreground/30 pr-5 last:border-r-0">
      <span className="grid size-8 place-items-center rounded-full border border-primary-foreground/60"><Icon className="size-4" /></span>
      <span>
        <span className="block text-[10px] font-semibold">{title}</span>
        <span className="block text-[8px] text-primary-foreground/70">{body}</span>
      </span>
    </div>
  );
}

function SectionTitle({ icon: Icon, title, subtitle, action }: { icon: typeof Plane; title: string; subtitle: string; action: string }) {
  return (
    <div className="mb-2 flex items-end justify-between">
      <div className="flex items-start gap-2">
        <Icon className="mt-0.5 size-5 text-primary" />
        <div>
          <h2 className="text-[13px] font-semibold text-primary">{title}</h2>
          <p className="text-[8px] text-muted-foreground">{subtitle}</p>
        </div>
      </div>
      <Button type="button" variant="ghost" className="h-auto p-0 text-[8px] font-semibold text-primary hover:bg-transparent">{action} <ArrowRight className="size-3" /></Button>
    </div>
  );
}