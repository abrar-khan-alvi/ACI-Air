import Link from "next/link";

export default function VerifyEmailPage() {
  return (
    <div className="w-full max-w-[560px]">
      <div className="bg-card shadow-[0_16px_40px_rgb(0_59_36_/_12%)] rounded-2xl p-8 md:p-12 text-center">
        <h1 className="text-2xl font-semibold text-foreground mb-4">Verify your email</h1>
        <p className="text-muted-foreground mb-8">
          We&apos;ve sent a verification link to your email address. Please click the link to verify
          your account.
        </p>

        <div className="flex flex-col gap-4">
          <button className="h-12 border border-border hover:bg-muted text-foreground rounded-md font-medium transition-colors">
            Resend Verification Email
          </button>
        </div>

        <div className="mt-8 text-sm text-muted-foreground">
          <Link href="/sign-in" className="text-aci-green-700 hover:text-aci-green-900 font-medium">
            Return to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
