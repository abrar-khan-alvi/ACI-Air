import type { ReactNode } from "react";
import Link from "next/link";
import { BadgeCheck, Headphones, LockKeyhole, ShieldCheck } from "lucide-react";
import Image from "next/image";
import heroImg from "@/assets/hero-flight.jpg";
import logoImg from "@/assets/logo.webp";
import logoLightImg from "@/assets/logo-light.png";

export function PartnerAuthShell({
  children,
  mode,
}: {
  children: ReactNode;
  mode: "login" | "signup";
}) {
  return (
    <main className="min-h-screen bg-background lg:grid lg:grid-cols-[minmax(360px,0.9fr)_minmax(540px,1.1fr)]">
      <section className="relative hidden min-h-screen overflow-hidden bg-primary text-primary-foreground lg:flex lg:flex-col">
        <Image
          src={heroImg}
          alt="Aircraft wing flying above a tropical coastline"
          priority
          className="absolute inset-0 size-full object-cover"
        />
        <div className="absolute inset-0 bg-[linear-gradient(145deg,oklch(0.20_0.085_277/0.98)_0%,oklch(0.31_0.105_276/0.88)_56%,oklch(0.69_0.17_23/0.42)_100%)]" />

        <div className="relative flex h-full min-h-screen flex-col p-10 xl:p-14">
          <Link href="/" className="flex w-fit items-center" aria-label="ACI Air home">
            <Image
              src={logoLightImg}
              alt="ACI Air"
              height={42}
              priority
              style={{ width: "auto" }}
              className="h-10 object-contain"
            />
          </Link>

          <div className="my-auto max-w-xl py-16">
            <p className="mb-4 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-primary-foreground/75">
              <BadgeCheck className="size-4 text-accent" /> ACI Air Partner Network
            </p>
            <h1 className="font-display text-4xl font-bold leading-[1.08] sm:text-5xl xl:text-[58px]">
              Built for travel businesses that move faster.
            </h1>
            <p className="mt-5 max-w-lg text-[15px] leading-7 text-primary-foreground/78">
              Access live inventory, agency fares, flexible payments and dedicated support from one trusted workspace.
            </p>

            <div className="mt-10 grid gap-3 sm:grid-cols-3">
              <TrustItem icon={ShieldCheck} label="Secure access" />
              <TrustItem icon={BadgeCheck} label="Verified rates" />
              <TrustItem icon={Headphones} label="Partner support" />
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-primary-foreground/15 pt-6 text-[11px] text-primary-foreground/65">
            <span>Trusted by travel partners worldwide</span>
            <span className="inline-flex items-center gap-1.5">
              <LockKeyhole className="size-3.5" /> Encrypted & protected
            </span>
          </div>
        </div>
      </section>

      <section className="flex min-h-screen flex-col">
        <header className="flex items-center justify-between border-b border-border/70 px-5 py-4 sm:px-8 lg:px-10">
          <Link href="/" className="flex items-center lg:hidden" aria-label="ACI Air home">
            <Image
              src={logoImg}
              alt="ACI Air"
              height={34}
              priority
              style={{ width: "auto" }}
              className="h-8 object-contain"
            />
          </Link>
          <p className="ml-auto text-[12px] text-muted-foreground">
            {mode === "login" ? "New partner?" : "Already a partner?"}{" "}
            <Link
              href={mode === "login" ? "/partner/signup" : "/partner/login"}
              className="font-semibold text-primary transition-colors hover:text-clay"
            >
              {mode === "login" ? "Create account" : "Sign in"}
            </Link>
          </p>
        </header>

        <div className="flex flex-1 items-center justify-center px-5 py-10 sm:px-8 lg:px-12">
          <div className="w-full max-w-[540px]">{children}</div>
        </div>

        <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-border/70 px-5 py-4 text-[10px] text-muted-foreground sm:px-8 lg:px-10">
          <span>© 2026 ACI Air</span>
          <span>Privacy · Terms · Partner support</span>
        </footer>
      </section>
    </main>
  );
}

function TrustItem({ icon: Icon, label }: { icon: typeof ShieldCheck; label: string }) {
  return (
    <div className="flex items-center gap-2 border-l-2 border-accent pl-3 text-[12px] font-medium">
      <Icon className="size-4 text-accent" strokeWidth={1.8} />
      {label}
    </div>
  );
}
