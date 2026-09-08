import { Bell, Globe, LogOut, Menu } from "lucide-react";

export function Topbar({ onMenu }: { onMenu: () => void }) {
  return (
    <header className="bg-aci-blue-800 sticky top-0 z-30 border-b border-white/10">
      <div className="mx-auto flex min-h-14 w-full max-w-[1360px] items-center gap-1.5 px-3 py-2 sm:gap-3 sm:px-5 sm:py-2.5 lg:px-7">
        <button
          onClick={onMenu}
          aria-label="Open menu"
          className="grid size-8 shrink-0 place-items-center rounded-full border border-white/20 bg-white/10 text-white transition hover:bg-white/20 sm:size-9 lg:hidden"
        >
          <Menu className="size-4" />
        </button>

      <div className="ml-auto flex min-w-0 items-center gap-1.5 sm:gap-2">
        <button className="hidden items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-[11px] font-semibold text-white transition hover:bg-white/20 md:flex">
          <Globe className="size-3.5 text-white/90" /> BDT · EN
        </button>
        <button className="relative grid size-8 shrink-0 place-items-center rounded-full border border-white/20 bg-white/10 transition hover:bg-white/20 sm:size-9">
          <Bell className="size-4 text-white" />
          <span className="absolute right-2 top-2 size-1.5 rounded-full bg-clay" />
        </button>
        <div className="flex shrink-0 items-center gap-2 rounded-full border border-white/20 bg-white/10 py-1 pl-1 pr-1 sm:pr-3 text-white">
          <div className="grid size-6 place-items-center rounded-full bg-[#f16b6d] text-[9px] font-bold text-white sm:size-7 sm:text-[10px]">
            NR
          </div>
          <div className="hidden leading-tight sm:block">
            <p className="text-[11px] font-semibold text-white">Nabil Rahman</p>
            <p className="text-[9px] text-white/70">Gold member</p>
          </div>
        </div>
        <form action="/api/auth/sign-out" method="post">
          <button
            type="submit"
            title="Sign out"
            aria-label="Sign out"
            className="flex size-8 items-center justify-center gap-1.5 rounded-full bg-[#f16b6d] text-[11px] font-semibold text-white transition hover:brightness-110 sm:h-9 sm:w-auto sm:px-2.5"
          >
            <LogOut className="size-4" />
            <span className="hidden xl:inline">Log out</span>
          </button>
        </form>
      </div>
      </div>
    </header>
  );
}
