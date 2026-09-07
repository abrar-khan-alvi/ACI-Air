"use client";

import Image from "next/image";
import {
  ArrowRight,
  Hotel,
  MapPin,
  Menu,
  Phone,
  Plane,
  ShieldCheck,
  Signal,
  X,
} from "lucide-react";
import { useState } from "react";

import { Link } from "@/components/navigation";

const navLinks = [
  { label: "Flights", to: "/search", icon: Plane },
  { label: "Hotels", to: "/hotels", icon: Hotel },
  { label: "eSIM", to: "/", icon: Signal },
  { label: "Insurance", to: "/", icon: ShieldCheck },
  { label: "Destinations", to: "/", icon: MapPin },
];

export function BrandLogo() {
  return (
    <span className="flex items-center gap-2.5">
      <span className="relative size-8 shrink-0 overflow-hidden rounded-full bg-[#003b24] shadow-soft">
        <Image
          src="/logo.jpg"
          alt=""
          width={1600}
          height={1600}
          priority
          className="size-full object-contain"
        />
      </span>
      <span className="leading-tight">
        <span className="block font-display text-[17px] font-semibold text-foreground">
          ACI Air
        </span>
        <span className="block text-[9px] uppercase tracking-[0.18em] text-muted-foreground">
          Travel Suite
        </span>
      </span>
    </span>
  );
}

export function PublicNavbar({ isAuthenticated = false }: { isAuthenticated?: boolean }) {
  const [mobileMenu, setMobileMenu] = useState(false);
  const accountHref = isAuthenticated ? "/user" : "/sign-in";
  const accountLabel = isAuthenticated ? "My Dashboard" : "Sign in";

  return (
    <>
      <header className="glass-bar sticky top-0 z-40 border-b border-border/60 px-4 py-3 font-sans text-base sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-[1360px] items-center gap-3">
          <Link to="/" aria-label="ACI Air home" className="flex items-center">
            <BrandLogo />
          </Link>

          <nav className="ml-8 hidden items-center gap-1 lg:flex" aria-label="Main navigation">
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
            <Link
              to={accountHref}
              className="flex items-center gap-1.5 rounded-full bg-forest px-4 py-2 text-[12px] font-semibold text-primary-foreground shadow-soft transition hover:shadow-card"
            >
              {accountLabel} <ArrowRight className="size-3.5" />
            </Link>
          </div>

          <button
            type="button"
            onClick={() => setMobileMenu(true)}
            aria-label="Open menu"
            className="ml-auto grid size-9 place-items-center rounded-full border border-border bg-card text-foreground/70 sm:ml-0 lg:hidden"
          >
            <Menu className="size-4" />
          </button>
        </div>
      </header>

      {mobileMenu && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setMobileMenu(false)}
            className="absolute inset-0 bg-foreground/25 backdrop-blur-sm"
          />
          <aside className="glass-panel absolute inset-y-0 right-0 flex w-[280px] flex-col gap-2 p-4 shadow-float">
            <button
              type="button"
              onClick={() => setMobileMenu(false)}
              aria-label="Close menu"
              className="absolute right-3 top-3 grid size-8 place-items-center rounded-full bg-secondary text-foreground/70"
            >
              <X className="size-4" />
            </button>
            <Link to="/" onClick={() => setMobileMenu(false)} className="mb-4 mt-8 w-fit">
              <BrandLogo />
            </Link>
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
            <div className="mt-auto border-t border-border pt-4">
              <Link
                to={accountHref}
                onClick={() => setMobileMenu(false)}
                className="flex items-center justify-center gap-1.5 rounded-xl bg-forest py-2.5 text-[13px] font-semibold text-primary-foreground"
              >
                {accountLabel} <ArrowRight className="size-4" />
              </Link>
            </div>
          </aside>
        </div>
      )}

      <a
        href="tel:+8801234567890"
        aria-label="Contact support"
        className="fixed bottom-5 right-5 z-40 flex size-12 items-center justify-center rounded-full bg-forest text-primary-foreground shadow-float transition hover:-translate-y-0.5 hover:shadow-card sm:bottom-6 sm:right-6 sm:h-11 sm:w-auto sm:px-4"
      >
        <Phone className="size-4" />
        <span className="ml-2 hidden text-[12px] font-semibold sm:inline">Support</span>
      </a>
    </>
  );
}
