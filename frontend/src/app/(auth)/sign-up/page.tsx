import { RegistrationForm } from "./components/registration-form";

export default function SignUpTravelAgentPage() {
  return (
    <div className="registration-page w-full max-w-[900px] xl:max-w-[1000px] perspective-1000">
      <div className="registration-card backdrop-blur-xl bg-white/70 border border-white/50 shadow-[0_30px_60px_-15px_rgba(0,166,81,0.15)] rounded-3xl p-8 sm:p-12 transform-gpu transition-all duration-500 hover:shadow-[0_40px_80px_-20px_rgba(0,166,81,0.2)]">
        <div className="registration-heading text-center mb-10">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-3">Partner Registration</h1>
          <p className="text-slate-500 font-medium">Join ACI Air to access exclusive deals and manage your bookings</p>
        </div>

        <RegistrationForm />
      </div>
    </div>
  );
}
