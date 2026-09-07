import { Bell, Search, Globe, LogOut, Menu } from "lucide-react";

export function Topbar({ onMenu }: { onMenu: () => void }) {
  return (
    <header className="glass-bar sticky top-0 z-30 flex items-center gap-2.5 border-b border-border/60 px-4 py-2.5 sm:gap-3 sm:px-6 lg:px-8">
      <button
        onClick={onMenu}
        aria-label="Open menu"
        className="grid size-9 shrink-0 place-items-center rounded-full border border-border bg-card text-foreground/70 lg:hidden"
      >
        <Menu className="size-4" />
      </button>

      <div className="flex min-w-0 flex-1 items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 transition focus-within:border-primary/40 sm:max-w-md">
        <Search className="size-3.5 shrink-0 text-muted-foreground" />
        <input
          placeholder="Search flights, hotels, eSIM…"
          className="w-full bg-transparent text-[13px] outline-none placeholder:text-muted-foreground"
        />
      </div>

      <div className="ml-auto flex items-center gap-2">
        <button className="hidden items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-[11px] font-semibold text-foreground/80 transition hover:border-primary/40 md:flex">
          <Globe className="size-3.5 text-primary" /> BDT · EN
        </button>
        <button className="relative grid size-9 place-items-center rounded-full border border-border bg-card transition hover:border-primary/40">
          <Bell className="size-4 text-foreground/70" />
          <span className="absolute right-2 top-2 size-1.5 rounded-full bg-clay" />
        </button>
        <div className="flex items-center gap-2 rounded-full border border-border bg-card py-1 pl-1 pr-1 sm:pr-3">
          <div className="grid size-7 place-items-center rounded-full bg-forest text-[10px] font-bold text-primary-foreground">
            NR
          </div>
          <div className="hidden leading-tight sm:block">
            <p className="text-[11px] font-semibold">Nabil Rahman</p>
            <p className="text-[9px] text-muted-foreground">Gold member</p>
          </div>
        </div>
        <form action="/api/auth/sign-out" method="post">
          <button
            type="submit"
            title="Sign out"
            aria-label="Sign out"
            className="flex h-9 items-center justify-center gap-1.5 rounded-full border border-border bg-card px-2.5 text-[11px] font-semibold text-foreground/70 transition hover:border-primary/40 hover:text-primary"
          >
            <LogOut className="size-4" />
            <span className="hidden xl:inline">Log out</span>
          </button>
        </form>
      </div>
    </header>
  );
}
