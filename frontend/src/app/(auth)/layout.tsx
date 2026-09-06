import Image from "next/image";

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="auth-layout min-h-screen bg-slate-50 flex flex-col relative overflow-x-hidden font-sans">
      {/* Premium Mesh Gradient Background */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 bg-slate-50">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-aci-green-500/20 blur-[120px] mix-blend-multiply animate-pulse" style={{ animationDuration: '8s' }}></div>
        <div className="absolute top-[10%] -right-[10%] w-[40%] h-[60%] rounded-full bg-aci-orange-500/10 blur-[150px] mix-blend-multiply animate-pulse" style={{ animationDuration: '12s', animationDelay: '2s' }}></div>
        <div className="absolute -bottom-[20%] left-[20%] w-[60%] h-[50%] rounded-full bg-teal-400/20 blur-[130px] mix-blend-multiply animate-pulse" style={{ animationDuration: '10s', animationDelay: '1s' }}></div>
      </div>

      {/* Floating Header */}
      <header className="auth-header w-full absolute top-0 left-0 px-6 sm:px-12 py-8 flex justify-between items-center z-20">
        <div className="flex items-center backdrop-blur-md bg-white/60 p-2 pr-4 rounded-2xl shadow-sm border border-white/40 transition-all hover:bg-white/80">
          <div className="w-[48px] h-[48px] rounded-xl overflow-hidden flex items-center justify-center bg-white mr-3 shadow-inner">
            <Image src="/logo.jpg" alt="ACI Air Logo" width={48} height={48} className="object-cover" priority />
          </div>
          <span className="font-bold text-xl tracking-tight text-slate-800">ACI Air</span>
          <span className="ml-2 px-2 py-0.5 rounded-full bg-aci-green-100 text-aci-green-700 text-xs font-semibold uppercase tracking-wider">Partner</span>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="auth-main flex-1 flex flex-col justify-center items-center p-4 pt-24 sm:p-6 sm:pt-28 lg:p-8 lg:pt-32 relative z-10 w-full">
        {children}
      </main>
    </div>
  );
}
