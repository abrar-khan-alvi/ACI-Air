"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import {
  BedDouble,
  Globe,
  Menu,
  Package,
  Plane,
  Search,
  Smartphone,
  UserRound,
  X,
} from "lucide-react";

import logoImg from "@/assets/logo.webp";
import logoLightImg from "@/assets/logo-light.png";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const services = [
  { label: "Flights", href: "/search", icon: Plane, activeOn: ["/search", "/booking"], available: true },
  { label: "Hotels", href: "/hotels", icon: BedDouble, activeOn: ["/hotels"], available: true },
  { label: "eSIM", href: "/esim", icon: Smartphone, activeOn: ["/esim"], available: false },
  { label: "Packages", href: "/packages", icon: Package, activeOn: ["/packages"], available: false },
] as const;

export function GlobalNavbar() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isHome = pathname === "/";
  // Hide global navbar entirely on auth pages to minimize distraction
  const isAuth = pathname.startsWith("/partner/login") || pathname.startsWith("/partner/signup");
  const isLoggedIn = pathname.startsWith("/partner/user") || pathname.startsWith("/partner/dashboard") || pathname.startsWith("/admin");
  const isPortal = pathname.startsWith("/partner") || pathname.startsWith("/admin");
  const showServices = !isHome && !isPortal;
  
  if (isAuth) return null;

  return (
    <>
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 w-full transition-all duration-300",
          isHome && !scrolled
            ? "bg-transparent text-primary-foreground"
            : "glass-bar border-b border-border/60 text-foreground shadow-sm"
        )}
      >
        <div className="mx-auto flex h-16 max-w-[1440px] items-center gap-6 px-4 sm:px-7 lg:px-12">
          {/* Logo */}
          <Link href="/" className="flex shrink-0 items-center">
            <Image
              src={isHome && !scrolled ? logoLightImg : logoImg}
              alt="ACI Air"
              height={36}
              style={{ width: "auto" }}
              className="h-9 object-contain"
            />
          </Link>

          {showServices ? (
            <nav aria-label="Travel services" className="ml-2 hidden items-center gap-1 md:flex">
              {services.map((service) => {
                const Icon = service.icon;
                const active = service.activeOn.some((path) => pathname.startsWith(path));
                const className = cn(
                  "inline-flex h-9 items-center gap-1.5 rounded-full px-3.5 text-[13px] font-semibold transition-colors",
                  active
                    ? "bg-primary text-primary-foreground shadow-soft"
                    : "text-foreground/70 hover:bg-secondary hover:text-primary",
                  !service.available && "cursor-not-allowed opacity-55 hover:bg-transparent hover:text-foreground/70",
                );

                return service.available ? (
                  <Link key={service.label} href={service.href} aria-current={active ? "page" : undefined} className={className}>
                    <Icon className="size-3.5" />
                    {service.label}
                  </Link>
                ) : (
                  <span key={service.label} aria-disabled="true" title={`${service.label} coming soon`} className={className}>
                    <Icon className="size-3.5" />
                    {service.label}
                  </span>
                );
              })}
            </nav>
          ) : null}

          {/* Desktop Right Side */}
          <div className="ml-auto hidden items-center gap-3 sm:flex">
            {showServices && (
              <div className="hidden lg:flex items-center gap-2 rounded-full border border-border/80 bg-card/50 px-3 py-1.5 transition focus-within:border-primary/40">
                <Search className="size-3.5 shrink-0 text-muted-foreground" />
                <input
                  placeholder="Search trips"
                  className="w-32 bg-transparent text-[13px] outline-none placeholder:text-muted-foreground"
                />
              </div>
            )}
            
            <button 
              className={cn(
                "hidden items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-semibold transition md:flex",
                isHome && !scrolled ? "border-white/20 bg-white/10 hover:bg-white/20 text-white backdrop-blur-md" : "border-border/60 hover:bg-foreground/5"
              )}
            >
              <Globe className="size-3.5" /> BDT · EN
            </button>
            
            {isLoggedIn ? (
              <button className={cn(
                "grid size-9 place-items-center rounded-full transition text-[13px] font-bold",
                isHome && !scrolled ? "border border-white/20 bg-white/10 text-white hover:bg-white/20 backdrop-blur-md" : "bg-primary/10 text-primary hover:bg-primary/20"
              )}>
                N
              </button>
            ) : (
              <Button 
                asChild 
                variant={isHome && !scrolled ? "ghost" : "default"} 
                className={cn(
                  "h-9 rounded-full px-5 text-[12px]",
                  isHome && !scrolled ? "border border-white/20 bg-white/10 hover:bg-white/20 text-white hover:text-white backdrop-blur-md" : ""
                )}
              >
                <Link href="/partner/login"><UserRound className="size-4 mr-2" /> Sign In</Link>
              </Button>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMenuOpen(true)}
            className={cn(
              "ml-auto grid size-9 place-items-center rounded-full border sm:hidden",
              isHome && !scrolled ? "border-primary-foreground/20 bg-primary-foreground/10 text-white" : "border-border/60 bg-card text-foreground"
            )}
          >
            <Menu className="size-4" />
          </button>
        </div>
      </header>

      {/* Mobile Menu Drawer */}
      {menuOpen && (
        <div className="fixed inset-0 z-[100] flex justify-end lg:hidden">
          <div className="absolute inset-0 bg-foreground/40 backdrop-blur-sm" onClick={() => setMenuOpen(false)} />
          <aside className="relative flex w-[280px] flex-col bg-card px-5 py-6 shadow-float">
            <button onClick={() => setMenuOpen(false)} className="absolute right-4 top-4 grid size-8 place-items-center rounded-full bg-secondary">
              <X className="size-4 text-foreground/70" />
            </button>
            <div className="mb-8 px-1">
              <Image src={logoImg} alt="ACI Air" height={32} style={{ width: "auto" }} className="h-8 object-contain object-left" />
            </div>
            <nav className="flex flex-col gap-1">
              {showServices ? (
                <>
                  <p className="px-4 pb-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                    Services
                  </p>
                  {services.map((service) => {
                    const Icon = service.icon;
                    const active = service.activeOn.some((path) => pathname.startsWith(path));
                    const className = cn(
                      "flex items-center gap-2 rounded-xl px-4 py-3 text-[13px] font-semibold transition-colors",
                      active ? "bg-primary text-primary-foreground" : "hover:bg-secondary",
                      !service.available && "cursor-not-allowed opacity-50 hover:bg-transparent",
                    );

                    return service.available ? (
                      <Link
                        key={service.label}
                        href={service.href}
                        onClick={() => setMenuOpen(false)}
                        aria-current={active ? "page" : undefined}
                        className={className}
                      >
                        <Icon className="size-4" />
                        {service.label}
                      </Link>
                    ) : (
                      <span key={service.label} aria-disabled="true" className={className}>
                        <Icon className="size-4" />
                        {service.label}
                        <span className="ml-auto text-[10px] font-medium">Soon</span>
                      </span>
                    );
                  })}
                  <span className="my-3 h-px bg-border" />
                </>
              ) : null}
              <Link href="/partner/dashboard" onClick={() => setMenuOpen(false)} className="rounded-xl px-4 py-3 text-[13px] font-semibold hover:bg-secondary">Partner Portal</Link>
              <Link href="/partner/user" onClick={() => setMenuOpen(false)} className="rounded-xl px-4 py-3 text-[13px] font-semibold hover:bg-secondary">Manage Bookings</Link>
            </nav>
            {isLoggedIn ? (
              <div className="mt-8 flex items-center gap-3 rounded-xl border border-border p-3">
                <div className="grid size-10 place-items-center rounded-full bg-primary/10 text-primary font-bold">N</div>
                <div>
                  <p className="text-[13px] font-semibold text-foreground">Nabil Rahman</p>
                  <p className="text-[11px] text-muted-foreground">Manage profile</p>
                </div>
              </div>
            ) : (
              <Button asChild className="mt-8 w-full bg-primary text-primary-foreground h-11 rounded-xl">
                <Link href="/partner/login" onClick={() => setMenuOpen(false)}>Sign In</Link>
              </Button>
            )}
          </aside>
        </div>
      )}
    </>
  );
}
