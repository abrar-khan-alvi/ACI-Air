"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2, LockKeyhole, Mail } from "lucide-react";
import { Button } from "@/components/auth/ui/button";
import { Input } from "@/components/auth/ui/input";
import { Label } from "@/components/auth/ui/label";
import { signInSchema, type SignInValues } from "@/lib/auth/schema";

export function SignInForm() {
  const [showPassword, setShowPassword] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [serverError, setServerError] = React.useState<string | null>(null);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: SignInValues) => {
    setIsLoading(true);
    setServerError(null);

    try {
      const response = await fetch("/api/auth/sign-in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = (await response.json()) as { message?: string };

      if (!response.ok) {
        setServerError(result.message ?? "Unable to sign in. Please try again.");
        return;
      }

      router.replace("/user");
      router.refresh();
    } catch {
      setServerError("Unable to reach the server. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form noValidate onSubmit={handleSubmit(onSubmit)} className="sign-in-form flex flex-col gap-5">
      {serverError && (
        <p
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {serverError}
        </p>
      )}
      <div className="flex flex-col gap-2">
        <Label htmlFor="email">Email</Label>
        <div className="relative">
          <Mail className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
        <Input
          id="email"
          type="email"
          autoComplete="email"
          placeholder="name@company.com"
          className="pl-11"
          {...register("email")}
          disabled={isLoading}
          aria-invalid={!!errors.email}
        /></div>
        {errors.email && <span className="text-sm text-destructive">{errors.email.message}</span>}
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="password">Password</Label>
        <div className="relative">
          <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="Enter your password"
            {...register("password")}
            disabled={isLoading}
            aria-invalid={!!errors.password}
            autoComplete="current-password"
            className="pl-11 pr-11"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-2 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-slate-100 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aci-blue-500"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        {errors.password && (
          <span className="text-sm text-destructive">{errors.password.message}</span>
        )}
      </div>

      <div className="flex justify-end">
        <Link
          href="/forgot-password"
          className="text-sm text-aci-blue-700 hover:text-aci-blue-900 font-medium"
        >
          Forgot password?
        </Link>
      </div>

      <Button type="submit" disabled={isLoading} className="h-12 w-full rounded-xl border-0 bg-gradient-to-r from-aci-blue-700 to-aci-blue-900 font-bold text-white shadow-lg shadow-aci-blue-900/15 transition-all hover:-translate-y-0.5 hover:shadow-xl">
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Sign In
      </Button>
    </form>
  );
}
