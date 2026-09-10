"use client";

import { useState } from "react";
import { PublicNavbar } from "@/components/aci/PublicNavbar";
import { Globe, CalendarDays, Users, Search, ChevronDown, ShieldCheck, Plane, HeartPulse } from "lucide-react";
import { cn } from "@/lib/utils";

const fields = [
  { icon: Globe, label: "Region", value: "Worldwide", hint: "Excl. US/CA" },
  { icon: CalendarDays, label: "Trip dates", value: "2 weeks", hint: "Flexible" },
  { icon: ShieldCheck, label: "Coverage", value: "Comprehensive", hint: "Medical & trip" },
  { icon: Users, label: "Travellers", value: "2 Adults", hint: "Aged 18-65" },
];

function Field({ icon: Icon, label, value, hint }: any) {
  return (
    <button className="group flex h-12 w-full items-center gap-2 rounded-lg bg-secondary/70 px-3 text-left transition-colors duration-200 hover:bg-secondary">
      <Icon className="size-4 shrink-0 text-muted-foreground" strokeWidth={1.9} />
      <span className="min-w-0">
        <span className="block text-[9.5px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          {label}
        </span>
        <span className="block truncate font-display text-[13px] font-semibold leading-tight">
          {value}
        </span>
      </span>
      {hint ? <span className="sr-only">{hint}</span> : null}
    </button>
  );
}

export default function InsurancePage({ isAuthenticated = false }: { isAuthenticated?: boolean }) {
  const [edit, setEdit] = useState(true);

  return (
    <div className="min-h-screen bg-background">
      <PublicNavbar isAuthenticated={isAuthenticated} />

      <div className="border-b border-border/60 bg-card">
        <div className="mx-auto max-w-[1240px] px-3 py-3 sm:px-5">
          <button
            type="button"
            onClick={() => setEdit((v) => !v)}
            aria-expanded={edit}
            className="group flex w-full items-stretch gap-0 overflow-hidden rounded-2xl border border-border bg-background text-left shadow-soft transition hover:border-primary/40 hover:shadow-float"
          >
            <span className="flex min-w-0 flex-1 items-center gap-3 px-3 py-2.5 sm:px-4">
              <span className="hidden size-8 shrink-0 place-items-center rounded-xl bg-secondary text-primary sm:grid">
                <ShieldCheck className="size-4" strokeWidth={1.9} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate font-display text-[14px] font-semibold leading-tight sm:text-[15.5px]">
                  Where are you traveling?
                </span>
                <span className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11.5px] text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    Select region
                  </span>
                </span>
              </span>
            </span>
            <span className="flex shrink-0 items-center gap-1.5 self-center rounded-xl bg-forest px-3.5 py-2 text-[12px] font-semibold text-primary-foreground shadow-soft transition group-hover:scale-[1.02] mr-2 sm:mr-3">
              <Search className="size-3.5" />
              <span className="hidden sm:inline">{edit ? "Close" : "Modify search"}</span>
              <ChevronDown className={cn("size-3.5 transition-transform", edit && "rotate-180")} />
            </span>
          </button>
        </div>
      </div>

      <main className="mx-auto max-w-[1240px] px-3 py-5 sm:px-5">
        {edit ? (
          <div className="mb-5 rounded-2xl border border-border/60 bg-card shadow-float">
            <div className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:px-5">
              <div className="grid flex-1 grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
                {fields.map((f) => (
                  <Field key={f.label} {...f} />
                ))}
              </div>
              <button className="flex h-12 shrink-0 items-center justify-center gap-1.5 rounded-lg bg-forest px-8 font-display text-[13.5px] font-semibold text-primary-foreground shadow-soft transition-transform duration-300 hover:scale-[1.02]">
                <Search className="size-4" /> Search
              </button>
            </div>
          </div>
        ) : null}

        <div className="surface-card grid place-items-center gap-2 rounded-2xl p-10 text-center">
          <ShieldCheck className="size-6 text-primary" />
          <p className="font-display text-[15px] font-semibold">Start a new insurance search</p>
          <p className="text-[12.5px] text-muted-foreground">
            Pick a region above to find the best coverage plans.
          </p>
        </div>

        <div className="mt-8 grid gap-2 rounded-2xl border border-border/60 bg-secondary/40 p-4 sm:grid-cols-3">
          {[
            { icon: ShieldCheck, t: "Secure payments", s: "3-D Secure & 0% EMI on 12 banks" },
            { icon: HeartPulse, t: "Comprehensive cover", s: "Medical, cancellation and baggage" },
            { icon: Plane, t: "24/7 support", s: "Changes and refunds handled by humans" },
          ].map((x) => (
            <div key={x.t} className="flex items-start gap-2.5">
              <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-card text-primary shadow-soft">
                <x.icon className="size-4" strokeWidth={1.9} />
              </span>
              <span>
                <span className="block font-display text-[13px] font-semibold">{x.t}</span>
                <span className="block text-[11.5px] text-muted-foreground">{x.s}</span>
              </span>
            </div>
          ))}
        </div>

        <footer className="mt-8 border-t border-border pt-4 text-[11px] text-muted-foreground">
          © 2026 ACI Air. Fares shown are indicative and include taxes.
        </footer>
      </main>
    </div>
  );
}
