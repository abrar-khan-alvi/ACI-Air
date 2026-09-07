import Link from "next/link";

export default function RegistrationSubmittedPage() {
  return (
    <div className="w-full max-w-[560px]">
      <div className="bg-card shadow-[0_16px_40px_rgb(0_59_36_/_12%)] rounded-2xl p-8 md:p-12 text-center">
        <div className="w-16 h-16 bg-aci-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-2xl font-semibold text-foreground mb-4">Registration Submitted</h1>
        <p className="text-muted-foreground mb-8">
          Thank you for applying to partner with ACI Air. Your registration is currently under review. We will notify you via email once your account has been approved.
        </p>

        <div className="mt-4">
          <Link href="/sign-in" className="text-aci-green-700 hover:text-aci-green-900 font-medium">
            Return to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
