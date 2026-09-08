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
import { usePathname } from "next/navigation";

import { Link } from "@/components/navigation";
import { cn } from "@/lib/utils";

const navLinks = [
  { label: "Flights", to: "/search", icon: Plane },
  { label: "Hotels", to: "/hotels", icon: Hotel },
  { label: "eSIM", to: "/esim", icon: Signal },
  { label: "Insurance", to: "/insurance", icon: ShieldCheck },
  { label: "Destinations", to: "/destinations", icon: MapPin },
];

export function BrandLogo() {
  return (
    <span className="flex items-center gap-2.5">
      <span className="relative h-7 w-[100px] shrink-0 flex items-center">
        <Image
          src="/logo_white.png"
          alt="ACI Air Logo"
          width={457}
          height={133}
          priority
          className="h-full w-auto object-contain"
        />
      </span>
    </span>
  );
}

export function PublicNavbar({ isAuthenticated = false }: { isAuthenticated?: boolean }) {
  const [mobileMenu, setMobileMenu] = useState(false);
  const pathname = usePathname();
  const accountHref = isAuthenticated ? "/user" : "/sign-in";
  const accountLabel = isAuthenticated ? "My Dashboard" : "Sign in";

  return (
    <>
      <header className="bg-aci-blue-800 sticky top-0 z-40 border-b border-white/10 px-4 py-3 font-sans text-base sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-[1360px] items-center gap-3">
          <Link to="/" aria-label="ACI Air home" className="flex items-center">
            <BrandLogo />
          </Link>

          <nav className="ml-8 hidden items-center gap-1 lg:flex" aria-label="Main navigation">
            {navLinks.map((link) => {
              const isActive = link.to !== '/' && pathname?.startsWith(link.to);
              return (
                <Link
                  key={link.label}
                  to={link.to}
                  className={cn(
                    "flex items-center gap-1.5 rounded-lg px-3 py-2 text-[13px] font-medium transition",
                    isActive
                      ? "bg-white/20 text-white"
                      : "text-white/80 hover:bg-white/10 hover:text-white"
                  )}
                >
                  <link.icon className="size-3.5 text-white/90" strokeWidth={1.8} />
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className="ml-auto hidden items-center gap-2 sm:flex">
            <Link
              to={accountHref}
              className="flex items-center gap-1.5 rounded-full bg-[#f16b6d] px-4 py-2 text-[12px] font-semibold text-white shadow-soft transition hover:shadow-card hover:brightness-110"
            >
              {accountLabel} <ArrowRight className="size-3.5" />
            </Link>
          </div>

          <button
            type="button"
            onClick={() => setMobileMenu(true)}
            aria-label="Open menu"
            className="ml-auto grid size-9 place-items-center rounded-full border border-white/20 bg-white/10 text-white transition hover:bg-white/20 sm:ml-0 lg:hidden"
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
          <aside className="bg-aci-blue-800 absolute inset-y-0 right-0 flex w-[280px] flex-col gap-2 p-4 shadow-float">
            <button
              type="button"
              onClick={() => setMobileMenu(false)}
              aria-label="Close menu"
              className="absolute right-3 top-3 grid size-8 place-items-center rounded-full bg-white/10 text-white/70 transition hover:bg-white/20 hover:text-white"
            >
              <X className="size-4" />
            </button>
            <Link to="/" onClick={() => setMobileMenu(false)} className="mb-4 mt-8 w-fit">
              <BrandLogo />
            </Link>
            {navLinks.map((link) => {
              const isActive = link.to !== '/' && pathname?.startsWith(link.to);
              return (
                <Link
                  key={link.label}
                  to={link.to}
                  onClick={() => setMobileMenu(false)}
                  className={cn(
                    "flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-[14px] font-medium transition",
                    isActive
                      ? "bg-white/20 text-white"
                      : "text-white/80 hover:bg-white/10 hover:text-white"
                  )}
                >
                  <link.icon className="size-4 text-white/90" strokeWidth={1.8} />
                  {link.label}
                </Link>
              );
            })}
            <div className="mt-auto border-t border-white/20 pt-4">
              <Link
                to={accountHref}
                onClick={() => setMobileMenu(false)}
                className="flex items-center justify-center gap-1.5 rounded-xl bg-[#f16b6d] py-2.5 text-[13px] font-semibold text-white transition hover:brightness-110"
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
