import Image from "next/image";
import heroFlight from "@/assets/hero-flight.jpg";
import { CheckCircle2 } from "lucide-react";

export function AuthShowcase({ registration = false }: { registration?: boolean }) {
  return (
    <aside className="relative hidden min-h-screen overflow-hidden lg:block">
      <Image
        src={heroFlight}
        alt="Aircraft wing flying above a tropical island"
        fill
        priority
        sizes="50vw"
        className="object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-aci-blue-950/90 via-aci-blue-900/30 to-black/10" />
      <div className="absolute inset-0 flex flex-col justify-between p-10 xl:p-14">
        <Image src="/logo_white.png" alt="ACI Air" width={165} height={48} priority className="h-auto w-36 xl:w-40" />

        <div className="max-w-xl text-white">
          <span className="mb-4 inline-flex rounded-full border border-white/25 bg-white/10 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.2em] backdrop-blur-md">
            ACI Air Partner Portal
          </span>
          <h2 className="text-4xl font-extrabold leading-tight tracking-[-0.04em] xl:text-5xl">
            {registration ? "Grow your travel business with us." : "Your next booking starts here."}
          </h2>
          <p className="mt-4 max-w-lg text-sm leading-7 text-white/80 xl:text-base">
            {registration
              ? "Join our trusted partner network and unlock competitive fares, smarter tools and dedicated support."
              : "Access global inventory, manage every journey and serve your customers from one trusted workspace."}
          </p>
          <div className="mt-7 flex flex-wrap gap-x-6 gap-y-3 text-xs font-semibold text-white/90 xl:text-sm">
            <span className="flex items-center gap-2"><CheckCircle2 className="size-4 text-aci-orange-500" /> Secure access</span>
            <span className="flex items-center gap-2"><CheckCircle2 className="size-4 text-aci-orange-500" /> Global inventory</span>
            <span className="flex items-center gap-2"><CheckCircle2 className="size-4 text-aci-orange-500" /> Partner support</span>
          </div>
        </div>
      </div>
    </aside>
  );
}

export function MobileAuthLogo() {
  return (
    <div className="mb-8 flex justify-center lg:hidden">
      <Image src="/logo.png" alt="ACI Air" width={150} height={44} priority className="h-auto w-32" />
    </div>
  );
}
