"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, ArrowRight, Building2, Check, Eye, EyeOff, FileCheck2, Mail, Phone, UploadCloud, UserRound } from "lucide-react";
import { z } from "zod";
import { PartnerAuthShell } from "@/components/aci/PartnerAuthShell";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { COUNTRIES, REGIONS, type CountryCode } from "@/lib/regions";

const title = "Become an ACI Air Partner";
const description = "Create an ACI Air partner account for agency fares, booking tools and dedicated support.";


const accountSchema = z.object({
  name: z.string().trim().min(2, "Enter your full name").max(100),
  email: z.string().trim().email("Enter a valid business email").max(255),
  phone: z.string().trim().min(7, "Enter a valid phone number").max(24),
  password: z.string().min(8, "Use at least 8 characters").max(128),
});

const agencySchema = z.object({
  company: z.string().trim().min(2, "Enter your registered company name").max(140),
  type: z.string().min(1, "Select an agency type"),
  country: z.string().min(1, "Select a country"),
  district: z.string().min(1, "Select a state or district"),
  address: z.string().trim().min(5, "Enter your business address").max(240),
  caab: z
    .string()
    .trim()
    .min(4, "CAAB / Travel Agency License number is required")
    .max(40, "License number is too long"),
});

const MAX_FILE_MB = 5;
const ACCEPTED = ["image/jpeg", "image/png", "application/pdf"];

const documents = [
  { id: "nid", label: "NID copy (owner)", hint: "Front & back in one file" },
  { id: "trade", label: "Trade licence", hint: "Valid, current year" },
  { id: "caabDoc", label: "CAAB / Travel Agency License", hint: "Mandatory for air ticketing" },
  { id: "tinDoc", label: "TIN / BIN certificate", hint: "Optional but speeds up approval", optional: true },
] as const;

export function PartnerSignup() {
  const [step, setStep] = useState<1 | 2>(1);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [notice, setNotice] = useState("");
  const [account, setAccount] = useState<Record<string, string>>({});
  const [files, setFiles] = useState<Record<string, File | null>>({});
  const [country, setCountry] = useState<CountryCode | "">("");
  const [district, setDistrict] = useState("");

  function pickFile(id: string, file: File | null) {
    setFiles((current) => ({ ...current, [id]: file }));
    setErrors((current) => {
      const next = { ...current };
      delete next[id];
      return next;
    });
  }

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const values = Object.fromEntries(
      Array.from(new FormData(event.currentTarget).entries()).filter(([, value]) => typeof value === "string"),
    );
    const parsed = step === 1 ? accountSchema.safeParse(values) : agencySchema.safeParse(values);
    const fieldErrors: Record<string, string> = parsed.success
      ? {}
      : Object.fromEntries(parsed.error.issues.map((issue) => [String(issue.path[0]), issue.message]));

    if (step === 2) {
      for (const doc of documents) {
        const file = files[doc.id];
        if (!file) {
          if (!("optional" in doc && doc.optional)) fieldErrors[doc.id] = `${doc.label} is required`;
          continue;
        }
        if (!ACCEPTED.includes(file.type)) fieldErrors[doc.id] = "Upload a JPG, PNG or PDF file";
        else if (file.size > MAX_FILE_MB * 1024 * 1024) fieldErrors[doc.id] = `Keep the file under ${MAX_FILE_MB}MB`;
      }
    }

    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors);
      return;
    }
    setErrors({});
    if (step === 1) {
      setAccount((parsed.success ? parsed.data : {}) as Record<string, string>);
      setStep(2);
      return;
    }
    setNotice("Your partner application with CAAB licence and documents is ready to submit once Lovable Cloud is connected.");
  }

  return (
    <PartnerAuthShell mode="signup">
      <div className="mb-7">
        <div className="flex items-center justify-between gap-4">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-clay">Become a partner</p>
          <span className="text-xs font-semibold text-muted-foreground">Step {step} of 2</span>
        </div>
        <div className="mt-3 flex gap-2" aria-label={`Step ${step} of 2`}>
          <span className="h-1 flex-1 rounded-full bg-lagoon" />
          <span className={`h-1 flex-1 rounded-full transition-colors ${step === 2 ? "bg-lagoon" : "bg-secondary"}`} />
        </div>
        <h2 className="mt-6 font-display text-3xl font-bold text-foreground sm:text-[36px]">
          {step === 1 ? "Create your access" : "Tell us about your agency"}
        </h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          {step === 1 ? "Start with the person who will manage this partner account." : "These details help our team verify and activate your partner benefits."}
        </p>
      </div>

      <form key={step} onSubmit={submit} noValidate className="space-y-4">
        {step === 1 ? (
          <>
            <Field icon={UserRound} id="name" label="Full name" placeholder="Your full name" error={errors["name"]} defaultValue={account["name"]} />
            <Field icon={Mail} id="email" label="Business email" placeholder="name@agency.com" type="email" error={errors["email"]} defaultValue={account["email"]} />
            <Field icon={Phone} id="phone" label="Phone number" placeholder="+880 1XXX XXXXXX" type="tel" error={errors["phone"]} defaultValue={account["phone"]} />
            <div className="space-y-2">
              <Label htmlFor="password">Create password</Label>
              <div className="relative">
                <Input id="password" name="password" type={showPassword ? "text" : "password"} autoComplete="new-password" placeholder="At least 8 characters" className="h-11 pr-10" aria-invalid={Boolean(errors["password"])} defaultValue={account["password"]} />
                <button type="button" aria-label={showPassword ? "Hide password" : "Show password"} onClick={() => setShowPassword((value) => !value)} className="absolute right-3 top-1/2 grid size-7 -translate-y-1/2 place-items-center text-muted-foreground hover:text-primary">
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
              {errors["password"] ? <p className="text-xs text-destructive">{errors["password"]}</p> : <p className="text-[10px] text-muted-foreground">Use letters, numbers and a symbol for a stronger password.</p>}
            </div>
          </>
        ) : (
          <>
            <Field icon={Building2} id="company" label="Registered company name" placeholder="Your agency or company" error={errors["company"]} />
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="type">Agency type</Label>
                <select id="type" name="type" defaultValue="" className="h-11 w-full rounded-md border border-input bg-background px-3 text-sm outline-none transition focus:border-primary focus:ring-1 focus:ring-ring" aria-invalid={Boolean(errors["type"])}>
                  <option value="" disabled>Select type</option>
                  <option value="travel-agency">Travel agency</option>
                  <option value="corporate">Corporate travel desk</option>
                  <option value="tour-operator">Tour operator</option>
                  <option value="freelance">Independent agent</option>
                </select>
                {errors["type"] ? <p className="text-xs text-destructive">{errors["type"]}</p> : null}
              </div>
              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <select
                  id="country"
                  name="country"
                  value={country}
                  onChange={(event) => { setCountry(event.currentTarget.value as CountryCode | ""); setDistrict(""); }}
                  className="h-11 w-full rounded-md border border-input bg-background px-3 text-sm outline-none transition focus:border-primary focus:ring-1 focus:ring-ring"
                  aria-invalid={Boolean(errors["country"])}
                >
                  <option value="" disabled>Select country</option>
                  {COUNTRIES.map((item) => (
                    <option key={item.code} value={item.code}>{item.name}</option>
                  ))}
                </select>
                {errors["country"] ? <p className="text-xs text-destructive">{errors["country"]}</p> : null}
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="district">State / District</Label>
                {country && REGIONS[country] ? (
                  <select
                    id="district"
                    name="district"
                    value={district}
                    onChange={(event) => setDistrict(event.currentTarget.value)}
                    className="h-11 w-full rounded-md border border-input bg-background px-3 text-sm outline-none transition focus:border-primary focus:ring-1 focus:ring-ring"
                    aria-invalid={Boolean(errors["district"])}
                  >
                    <option value="" disabled>Select state or district</option>
                    {(REGIONS[country] ?? []).map((name) => (
                      <option key={name} value={name}>{name}</option>
                    ))}
                  </select>
                ) : (
                  <Input
                    id="district"
                    name="district"
                    value={district}
                    disabled={!country}
                    onChange={(event) => setDistrict(event.currentTarget.value)}
                    placeholder={country ? "Enter state or district" : "Select a country first"}
                    className="h-11"
                    aria-invalid={Boolean(errors["district"])}
                  />
                )}
                {errors["district"] ? <p className="text-xs text-destructive">{errors["district"]}</p> : null}
              </div>
              <Field id="caab" label="CAAB / Agency License No. *" placeholder="CAAB/TA/XXXX" error={errors["caab"]} />
            </div>
            <Field id="address" label="Business address" placeholder="Office address" error={errors["address"]} />

            <div className="space-y-3 rounded-lg border border-border bg-card/60 p-4">
              <div>
                <p className="text-sm font-semibold text-foreground">Verification documents</p>
                <p className="text-[11px] text-muted-foreground">JPG, PNG or PDF · up to {MAX_FILE_MB}MB each</p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {documents.map((doc) => (
                  <Upload
                    key={doc.id}
                    id={doc.id}
                    label={doc.label}
                    hint={doc.hint}
                    file={files[doc.id] ?? null}
                    error={errors[doc.id]}
                    onPick={pickFile}
                  />
                ))}
              </div>
            </div>
            <div className="flex items-start gap-2.5 rounded-md bg-secondary/70 p-3">
              <Checkbox id="terms" required className="mt-0.5" />
              <Label htmlFor="terms" className="text-[11px] font-normal leading-5 text-muted-foreground">
                I confirm these business details are accurate and agree to the partner terms and privacy policy.
              </Label>
            </div>
          </>
        )}

        {notice ? <p role="status" className="rounded-md border border-primary/15 bg-secondary px-3.5 py-3 text-xs leading-5 text-primary">{notice}</p> : null}

        <div className="flex gap-3 pt-1">
          {step === 2 ? (
            <Button type="button" variant="outline" className="h-12 px-5" onClick={() => { setStep(1); setNotice(""); }} aria-label="Back to account details">
              <ArrowLeft className="size-4" /> Back
            </Button>
          ) : null}
          <Button type="submit" className="h-12 flex-1 bg-lagoon font-display text-sm font-semibold text-primary-foreground shadow-card hover:opacity-95">
            {step === 1 ? <>Continue <ArrowRight className="size-4" /></> : <>Submit application <Check className="size-4" /></>}
          </Button>
        </div>
      </form>

      <p className="mt-6 text-center text-xs text-muted-foreground">
        Already registered? <Link href="/partner/login" className="font-semibold text-primary hover:text-clay">Sign in to your account</Link>
      </p>
    </PartnerAuthShell>
  );
}

function Field({ icon: Icon, id, label, error, ...props }: { icon?: typeof UserRound; id: string; label: string; error?: string | undefined } & React.ComponentProps<typeof Input>) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        {Icon ? <Icon className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /> : null}
        <Input id={id} name={id} className={`h-11 ${Icon ? "pl-10" : ""}`} aria-invalid={Boolean(error)} {...props} />
      </div>
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  );
}
function Upload({ id, label, hint, file, error, onPick }: { id: string; label: string; hint: string; file: File | null; error?: string | undefined; onPick: (id: string, file: File | null) => void }) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-xs">{label}</Label>
      <label
        htmlFor={id}
        className={`flex cursor-pointer items-center gap-2.5 rounded-md border border-dashed px-3 py-2.5 text-xs transition hover:border-primary ${error ? "border-destructive" : file ? "border-primary/50 bg-secondary/60" : "border-input"}`}
      >
        {file ? <FileCheck2 className="size-4 shrink-0 text-primary" /> : <UploadCloud className="size-4 shrink-0 text-muted-foreground" />}
        <span className="min-w-0 flex-1 truncate text-muted-foreground">{file ? file.name : "Choose file"}</span>
      </label>
      <input
        id={id}
        name={id}
        type="file"
        accept="image/jpeg,image/png,application/pdf"
        className="sr-only"
        onChange={(event) => onPick(id, event.currentTarget.files?.[0] ?? null)}
      />
      {error ? <p className="text-[11px] text-destructive">{error}</p> : <p className="text-[10px] text-muted-foreground">{hint}</p>}
    </div>
  );
}
