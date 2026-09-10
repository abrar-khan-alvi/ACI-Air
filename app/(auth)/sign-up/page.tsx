import { RegistrationForm } from "@/components/auth/RegistrationForm";
import { AuthShowcase, MobileAuthLogo } from "@/components/auth/AuthShowcase";

export default function SignUpTravelAgentPage() {
  return (
    <div className="registration-page grid min-h-screen w-full bg-white lg:h-screen lg:grid-cols-[42%_58%] lg:overflow-hidden">
      <AuthShowcase registration />
      <section className="registration-card min-w-0 overflow-y-auto px-5 py-8 sm:px-8 lg:px-10 xl:px-12">
        <div className="mx-auto w-full max-w-[820px]">
        <MobileAuthLogo />
        <div className="registration-heading mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <span className="mb-2 inline-block text-xs font-bold uppercase tracking-[0.2em] text-aci-blue-600">Become a partner</span>
          <h1 className="mb-2 text-3xl font-extrabold tracking-tight text-slate-900">
            Partner Registration
          </h1>
          <p className="text-slate-500 font-medium">
            Tell us about your business. Your progress stays with you between steps.
          </p>
          </div>
          <span className="shrink-0 rounded-full bg-aci-blue-50 px-3 py-1.5 text-xs font-bold text-aci-blue-700">Takes about 5 minutes</span>
        </div>

        <RegistrationForm />
        </div>
      </section>
    </div>
  );
}
