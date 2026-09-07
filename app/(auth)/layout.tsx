import { PublicNavbar } from "@/components/aci/PublicNavbar";
import { isAuthenticated } from "@/lib/auth/session";

export default async function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="auth-layout h-[100dvh] overflow-hidden bg-slate-50 flex flex-col relative">
      {/* Premium Mesh Gradient Background */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 bg-slate-50">
        <div
          className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-aci-green-500/20 blur-[120px] mix-blend-multiply animate-pulse"
          style={{ animationDuration: "8s" }}
        ></div>
        <div
          className="absolute top-[10%] -right-[10%] w-[40%] h-[60%] rounded-full bg-aci-orange-500/10 blur-[150px] mix-blend-multiply animate-pulse"
          style={{ animationDuration: "12s", animationDelay: "2s" }}
        ></div>
        <div
          className="absolute -bottom-[20%] left-[20%] w-[60%] h-[50%] rounded-full bg-teal-400/20 blur-[130px] mix-blend-multiply animate-pulse"
          style={{ animationDuration: "10s", animationDelay: "1s" }}
        ></div>
      </div>

      <PublicNavbar isAuthenticated={await isAuthenticated()} />

      {/* Main Content Area */}
      <main className="auth-main min-h-0 flex-1 overflow-y-auto w-full relative z-10 flex flex-col p-4 pt-5 pb-6 sm:p-6 sm:pt-6 sm:pb-8 lg:p-8 lg:pt-7 lg:pb-10">
        <div className="mx-auto w-full flex justify-center shrink-0">{children}</div>
      </main>
    </div>
  );
}
