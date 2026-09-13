"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowRight, Eye, EyeOff, KeyRound, Mail } from "lucide-react";
import { z } from "zod";
import { PartnerAuthShell } from "@/components/aci/PartnerAuthShell";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const title = "Partner Login — ACI Air";
const description = "Sign in to the ACI Air partner portal to manage agency bookings and fares.";


const loginSchema = z.object({
  email: z.string().trim().email("Enter a valid business email").max(255),
  password: z.string().min(8, "Password must be at least 8 characters").max(128),
});

export function PartnerLogin() {
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [notice, setNotice] = useState("");
  const router = useRouter();

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const parsed = loginSchema.safeParse({ email: form.get("email"), password: form.get("password") });
    if (!parsed.success) {
      setErrors(Object.fromEntries(parsed.error.issues.map((issue) => [String(issue.path[0]), issue.message])));
      setNotice("");
      return;
    }
    setErrors({});
    setNotice("Opening your dashboard (demo preview — real sign-in activates with Lovable Cloud).");
    router.push("/partner/user");
  }

  return (
    <PartnerAuthShell mode="login">
      <div className="mb-8">
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-clay">Partner portal</p>
        <h2 className="mt-2 font-display text-3xl font-bold text-foreground sm:text-[38px]">Welcome back</h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Sign in to manage bookings, travellers, payments and agency fares.
        </p>
      </div>

      <form onSubmit={submit} noValidate className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="email">Business email</Label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input id="email" name="email" type="email" autoComplete="email" placeholder="name@agency.com" className="h-12 pl-10" aria-invalid={Boolean(errors["email"])} />
          </div>
          {errors["email"] ? <p className="text-xs text-destructive">{errors["email"]}</p> : null}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <button type="button" className="text-xs font-semibold text-primary hover:text-clay" onClick={() => setNotice("Password recovery will activate when Lovable Cloud is connected.")}>Forgot password?</button>
          </div>
          <div className="relative">
            <KeyRound className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input id="password" name="password" type={showPassword ? "text" : "password"} autoComplete="current-password" placeholder="Enter your password" className="h-12 px-10" aria-invalid={Boolean(errors["password"])} />
            <button type="button" aria-label={showPassword ? "Hide password" : "Show password"} onClick={() => setShowPassword((value) => !value)} className="absolute right-3 top-1/2 grid size-7 -translate-y-1/2 place-items-center text-muted-foreground hover:text-primary">
              {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
          {errors["password"] ? <p className="text-xs text-destructive">{errors["password"]}</p> : null}
        </div>

        <div className="flex items-center gap-2">
          <Checkbox id="remember" />
          <Label htmlFor="remember" className="text-xs font-normal text-muted-foreground">Keep me signed in on this device</Label>
        </div>

        {notice ? <p role="status" className="rounded-md border border-primary/15 bg-secondary px-3.5 py-3 text-xs leading-5 text-primary">{notice}</p> : null}

        <Button type="submit" className="h-12 w-full bg-lagoon font-display text-sm font-semibold text-primary-foreground shadow-card hover:opacity-95">
          Sign in to partner portal <ArrowRight className="size-4" />
        </Button>

        <div className="flex items-center gap-3 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
          <span className="h-px flex-1 bg-border" /> or continue with <span className="h-px flex-1 bg-border" />
        </div>

        <Button type="button" variant="outline" className="h-12 w-full" onClick={() => setNotice("Google sign-in will activate when Lovable Cloud is connected.")}>
          <span className="font-display text-base font-bold text-primary">G</span> Continue with Google
        </Button>
      </form>

      <p className="mt-7 text-center text-xs text-muted-foreground">
        Need an agency account?{" "}
        <Link href="/partner/signup" className="font-semibold text-primary hover:text-clay">Apply to become a partner</Link>
      </p>
    </PartnerAuthShell>
  );
}