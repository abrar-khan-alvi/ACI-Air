"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  Activity,
  ArrowLeft,
  Mail,
  MapPin,
  Phone,
  BadgeCheck,
  BarChart3,
  Bell,
  Building2,
  Check,
  ChevronRight,
  CreditCard,
  Download,
  History,
  LayoutGrid,
  LifeBuoy,
  Menu,
  Megaphone,
  Percent,
  Plane,
  Plus,
  ScrollText,
  Search,
  Server,
  ShieldCheck,
  Ticket,
  TicketPercent,
  Trash2,
  Undo2,
  UserPlus,
  UserX,
  Users,
  Wallet,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
  BDT,
  agencyName,
  downloadCsv,
  ops,
  useOps,
  type AgencyStatus,
  type Channel,
} from "@/lib/ops-store";

const title = "Super Admin Console — ACI Air";
const description =
  "Operate ACI Air B2B and B2C from one console: agencies, deposits, bookings, refunds, airline markup, site content, staff roles and reports.";


type SectionId =
  | "overview"
  | "agencies"
  | "agent-requests"
  | "agents-inactive"
  | "deposits"
  | "payments"
  | "bookings"
  | "refunds"
  | "gds"
  | "segments"
  | "searches"
  | "fares"
  | "promos"
  | "content"
  | "notices"
  | "users"
  | "tickets"
  | "audit"
  | "reports";

type NavGroup = {
  group: string;
  items: { id: SectionId; label: string; icon: typeof LayoutGrid }[];
};

const navGroups: NavGroup[] = [
  { group: "Dashboard", items: [{ id: "overview", label: "Overview", icon: LayoutGrid }] },
  {
    group: "Agents (B2B)",
    items: [
      { id: "agencies", label: "All agents", icon: Building2 },
      { id: "agent-requests", label: "Agent requests", icon: UserPlus },
      { id: "agents-inactive", label: "Deactivated agents", icon: UserX },
    ],
  },
  {
    group: "Sales",
    items: [
      { id: "bookings", label: "All bookings", icon: Ticket },
      { id: "refunds", label: "Refund, void & reissue", icon: Undo2 },
    ],
  },
  {
    group: "Finance",
    items: [
      { id: "deposits", label: "Deposit approvals", icon: Wallet },
      { id: "payments", label: "Payment gateway", icon: CreditCard },
    ],
  },
  {
    group: "GDS & inventory",
    items: [
      { id: "gds", label: "GDS providers", icon: Server },
      { id: "segments", label: "Segment usage", icon: Activity },
      { id: "searches", label: "Search history", icon: History },
    ],
  },
  {
    group: "Pricing & marketing",
    items: [
      { id: "fares", label: "Airlines & markup", icon: Percent },
      { id: "promos", label: "Promo codes", icon: TicketPercent },
      { id: "content", label: "B2C site content", icon: Megaphone },
      { id: "notices", label: "Announcements", icon: Bell },
    ],
  },
  {
    group: "System",
    items: [
      { id: "users", label: "Staff & roles", icon: Users },
      { id: "tickets", label: "Support inbox", icon: LifeBuoy },
      { id: "audit", label: "Audit log", icon: ScrollText },
      { id: "reports", label: "Reports", icon: BarChart3 },
    ],
  },
];

const sections = navGroups.flatMap((g) => g.items);

function Card({ className, children }: { className?: string; children: React.ReactNode }) {
  return <section className={cn("rounded-2xl border border-border bg-card p-5 shadow-soft", className)}>{children}</section>;
}

function Pill({ tone, children }: { tone: "good" | "warn" | "bad" | "muted"; children: React.ReactNode }) {
  return (
    <span
      className={cn(
        "rounded-full px-2.5 py-1 text-[10px] font-semibold",
        tone === "good" && "bg-primary/10 text-primary",
        tone === "warn" && "bg-accent/15 text-accent",
        tone === "bad" && "bg-destructive/10 text-destructive",
        tone === "muted" && "bg-secondary text-foreground/70",
      )}
    >
      {children}
    </span>
  );
}

export function AdminConsole() {
  const [section, setSection] = useState<SectionId>("overview");
  const [menuOpen, setMenuOpen] = useState(false);
  const [notice, setNotice] = useState("");
  const active = sections.find((s) => s.id === section)!;

  const [openGroups, setOpenGroups] = useState<string[]>(["Agents (B2B)", "Sales", "Finance", "GDS & inventory"]);

  const go = (id: SectionId) => {
    setSection(id);
    setMenuOpen(false);
    setNotice("");
  };

  const toggleGroup = (group: string) =>
    setOpenGroups((g) => (g.includes(group) ? g.filter((x) => x !== group) : [...g, group]));

  const pendingDeposits = useOps((s) => s.deposits.filter((d) => d.status === "Under review").length);
  const pendingRefunds = useOps((s) => s.refunds.filter((r) => r.status === "Requested").length);
  const pendingRequests = useOps((s) => s.agentRequests.filter((r) => r.status === "Pending").length);
  const openTickets = useOps((s) => s.tickets.filter((t) => t.status === "Open").length);
  const badges = { deposits: pendingDeposits, refunds: pendingRefunds, requests: pendingRequests, tickets: openTickets };

  return (
    <div className="min-h-screen bg-secondary/40 pt-16">
      <div className="lg:grid lg:grid-cols-[248px_1fr]">
        <SideNav section={section} onGo={go} className="sticky top-16 hidden h-[calc(100vh-4rem)] lg:flex" badges={badges} openGroups={openGroups} onToggleGroup={toggleGroup} />

        {menuOpen ? (
          <div className="fixed inset-0 z-50 lg:hidden">
            <button aria-label="Close menu" onClick={() => setMenuOpen(false)} className="absolute inset-0 bg-foreground/30 backdrop-blur-sm" />
            <SideNav section={section} onGo={go} badges={badges} openGroups={openGroups} onToggleGroup={toggleGroup} className="absolute inset-y-0 left-0 flex h-full w-[264px] shadow-float">
              <button onClick={() => setMenuOpen(false)} aria-label="Close menu" className="absolute right-3 top-3 grid size-8 place-items-center rounded-full bg-secondary">
                <X className="size-4" />
              </button>
            </SideNav>
          </div>
        ) : null}

        <div className="min-w-0">
          <header className="sticky top-16 z-30 flex flex-wrap items-center gap-3 border-b border-border/70 bg-background/85 px-4 py-3 backdrop-blur-xl sm:px-6">
            <button onClick={() => setMenuOpen(true)} aria-label="Open menu" className="grid size-9 place-items-center rounded-full border border-border bg-card lg:hidden">
              <Menu className="size-4" />
            </button>
            <div className="min-w-0">
              <h1 className="font-display text-lg font-bold leading-tight">{active.label}</h1>
              <p className="truncate text-[11px] text-muted-foreground">ACI Air super admin · B2B & B2C control</p>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <span className="hidden rounded-full bg-primary/10 px-3 py-1.5 text-[11px] font-semibold text-primary sm:inline">
                {pendingDeposits + pendingRefunds} items need action
              </span>
              <div className="grid size-9 place-items-center rounded-full bg-primary text-[11px] font-bold text-primary-foreground">AC</div>
            </div>
          </header>

          <main className="space-y-6 px-4 py-6 sm:px-6 lg:px-8">
            {notice ? (
              <p role="status" className="rounded-xl border border-primary/15 bg-card px-4 py-3 text-xs text-primary">{notice}</p>
            ) : null}

            {section === "overview" ? <Overview onGo={go} /> : null}
            {section === "agencies" ? <Agencies onNotice={setNotice} /> : null}
            {section === "deposits" ? <Deposits onNotice={setNotice} /> : null}
            {section === "bookings" ? <AllBookings onNotice={setNotice} /> : null}
            {section === "refunds" ? <RefundQueue onNotice={setNotice} /> : null}
            {section === "fares" ? <Fares onNotice={setNotice} /> : null}
            {section === "content" ? <SiteContent onNotice={setNotice} /> : null}
            {section === "users" ? <Staff onNotice={setNotice} /> : null}
            {section === "reports" ? <Reports /> : null}
            {section === "notices" ? <Announcements onNotice={setNotice} /> : null}
            {section === "agent-requests" ? <AgentRequests onNotice={setNotice} /> : null}
            {section === "agents-inactive" ? <InactiveAgents onNotice={setNotice} /> : null}
            {section === "payments" ? <Payments /> : null}
            {section === "gds" ? <GdsProviders onNotice={setNotice} /> : null}
            {section === "segments" ? <Segments /> : null}
            {section === "searches" ? <SearchHistory /> : null}
            {section === "promos" ? <Promos onNotice={setNotice} /> : null}
            {section === "tickets" ? <SupportInbox onNotice={setNotice} /> : null}
            {section === "audit" ? <AuditLog /> : null}
          </main>
        </div>
      </div>
    </div>
  );
}

function SideNav({
  section,
  onGo,
  className,
  children,
  badges,
  openGroups,
  onToggleGroup,
}: {
  section: SectionId;
  onGo: (id: SectionId) => void;
  className?: string;
  children?: React.ReactNode;
  badges: { deposits: number; refunds: number; requests: number; tickets: number };
  openGroups: string[];
  onToggleGroup: (group: string) => void;
}) {
  return (
    <aside className={cn("z-50 flex flex-col overflow-y-auto border-r border-border/70 bg-background/90 px-3 py-5 backdrop-blur-xl", className)}>
      {children}
      <Link href="/" className="mb-6 flex items-center gap-2.5 px-2" aria-label="ACI Air home">
        <span className="grid size-9 place-items-center rounded-full bg-primary text-primary-foreground">
          <Plane className="size-4" strokeWidth={2.2} />
        </span>
        <span className="font-display text-[17px] font-extrabold italic text-primary">
          ACI <span className="font-semibold">air</span>
        </span>
      </Link>

      <p className="px-2.5 pb-2 text-[9px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">Super admin</p>
      <nav className="space-y-2">
        {navGroups.map((group) => {
          const single = group.items.length === 1;
          const open = openGroups.includes(group.group) || group.items.some((i) => i.id === section);
          return (
            <div key={group.group}>
              {single ? null : (
                <button
                  onClick={() => onToggleGroup(group.group)}
                  className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-[9px] font-semibold uppercase tracking-[0.18em] text-muted-foreground transition hover:text-primary"
                >
                  <ChevronRight className={cn("size-3 transition-transform", open && "rotate-90")} />
                  {group.group}
                </button>
              )}
              {open || single ? (
                <div className={cn("space-y-1", single ? "" : "ml-2 border-l border-border/70 pl-2")}>
                  {group.items.map(({ id, label, icon: Icon }) => {
                    const count =
                      id === "deposits" ? badges.deposits
                      : id === "refunds" ? badges.refunds
                      : id === "agent-requests" ? badges.requests
                      : id === "tickets" ? badges.tickets
                      : 0;
                    return (
                      <button
                        key={id}
                        onClick={() => onGo(id)}
                        className={cn(
                          "flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-[13px] font-medium transition",
                          section === id ? "bg-primary text-primary-foreground shadow-soft" : "text-foreground/70 hover:bg-secondary",
                        )}
                      >
                        <Icon className={cn("size-4", section === id ? "text-accent" : "text-muted-foreground")} strokeWidth={1.9} />
                        <span className="flex-1 text-left">{label}</span>
                        {count ? (
                          <span className={cn("rounded-full px-1.5 text-[10px] font-bold", section === id ? "bg-accent text-accent-foreground" : "bg-accent/20 text-accent")}>{count}</span>
                        ) : null}
                      </button>
                    );
                  })}
                </div>
              ) : null}
            </div>
          );
        })}
      </nav>

      <div className="mt-auto space-y-2 rounded-2xl border border-border bg-card p-3.5">
        <p className="flex items-center gap-2 font-display text-[13px] font-bold"><ShieldCheck className="size-4 text-accent" /> Demo console</p>
        <p className="text-[11px] leading-5 text-muted-foreground">Changes stay in this browser session until a live account system is connected.</p>
      </div>
      <Link href="/partner/dashboard" className="mt-3 px-3 text-[11px] text-muted-foreground hover:text-primary">Open partner portal</Link>
    </aside>
  );
}

function Overview({ onGo }: { onGo: (id: SectionId) => void }) {
  const state = useOps((s) => s);
  const gmv = state.bookings.filter((b) => b.status !== "Cancelled").reduce((s, b) => s + b.amount, 0);
  const b2b = state.bookings.filter((b) => b.channel === "B2B");
  const b2c = state.bookings.filter((b) => b.channel === "B2C");
  const pendingDeposits = state.deposits.filter((d) => d.status === "Under review");
  const pendingRefunds = state.refunds.filter((r) => r.status === "Requested");

  const stats = [
    { label: "Gross sales", value: BDT(gmv), hint: `${state.bookings.length} bookings` },
    { label: "B2B sales", value: BDT(b2b.reduce((s, b) => s + b.amount, 0)), hint: `${b2b.length} agency bookings` },
    { label: "B2C sales", value: BDT(b2c.reduce((s, b) => s + b.amount, 0)), hint: `${b2c.length} direct bookings` },
    { label: "Agency balance held", value: BDT(state.agencies.reduce((s, a) => s + a.balance, 0)), hint: `${state.agencies.length} agencies` },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label} className="space-y-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">{s.label}</p>
            <p className="font-display text-2xl font-bold">{s.value}</p>
            <p className="text-[11px] text-muted-foreground">{s.hint}</p>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-base font-bold">Deposits awaiting approval</h2>
            <button onClick={() => onGo("deposits")} className="text-[11px] font-semibold text-primary hover:text-accent">Review</button>
          </div>
          {pendingDeposits.length === 0 ? <p className="py-4 text-sm text-muted-foreground">Nothing pending.</p> : null}
          {pendingDeposits.map((d) => (
            <div key={d.id} className="flex items-center justify-between rounded-xl border border-border p-3.5">
              <div className="min-w-0">
                <p className="text-[13px] font-semibold">{agencyName(state, d.agencyId)}</p>
                <p className="truncate text-[11px] text-muted-foreground">{d.id} · {d.method}</p>
              </div>
              <p className="font-display text-[13px] font-bold">{BDT(d.amount)}</p>
            </div>
          ))}
        </Card>

        <Card className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-base font-bold">Refund & void queue</h2>
            <button onClick={() => onGo("refunds")} className="text-[11px] font-semibold text-primary hover:text-accent">Review</button>
          </div>
          {pendingRefunds.length === 0 ? <p className="py-4 text-sm text-muted-foreground">Queue is clear.</p> : null}
          {pendingRefunds.map((r) => (
            <div key={r.id} className="flex items-center justify-between rounded-xl border border-border p-3.5">
              <div className="min-w-0">
                <p className="text-[13px] font-semibold">{r.type} · {r.pnr}</p>
                <p className="truncate text-[11px] text-muted-foreground">{r.channel} · {r.reason}</p>
              </div>
              <p className="font-display text-[13px] font-bold">{BDT(r.amount)}</p>
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
}

function Agencies({ onNotice }: { onNotice: (v: string) => void }) {
  const agencies = useOps((s) => s.agencies);
  const [query, setQuery] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);
  const rows = agencies.filter((a) => `${a.name} ${a.id} ${a.city} ${a.owner}`.toLowerCase().includes(query.toLowerCase()));

  const tone = (s: AgencyStatus) => (s === "Active" ? "good" : s === "Pending" ? "warn" : "bad");

  if (openId && agencies.some((a) => a.id === openId)) {
    return <AgentDetail agencyId={openId} onBack={() => setOpenId(null)} onNotice={onNotice} />;
  }

  return (
    <Card className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <h2 className="font-display text-base font-bold">Registered agencies ({rows.length})</h2>
        <div className="ml-auto flex items-center gap-2 rounded-full border border-border px-3 py-1.5">
          <Search className="size-3.5 text-muted-foreground" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search agency, city, owner" className="w-52 bg-transparent text-[13px] outline-none" />
        </div>
        <Button
          variant="outline"
          size="sm"
          className="h-8 text-[11px]"
          onClick={() =>
            downloadCsv("aci-agencies.csv", [
              ["Partner ID", "Agency", "Owner", "Email", "City", "Status", "Balance", "Credit"],
              ...rows.map((a) => [a.id, a.name, a.owner, a.email, a.city, a.status, a.balance, a.credit]),
            ])
          }
        >
          <Download className="size-3.5" /> Export
        </Button>
      </div>

      <div className="space-y-3">
        {rows.map((a) => (
          <div key={a.id} className="rounded-xl border border-border p-4">
            <div className="flex flex-wrap items-center gap-3">
              <div className="min-w-0 flex-1">
                <p className="font-display text-[14px] font-bold">{a.name}</p>
                <p className="truncate text-[11px] text-muted-foreground">{a.id} · {a.owner} · {a.city} · joined {a.joined}</p>
                <p className="truncate text-[11px] text-muted-foreground">{a.email} · {a.phone}</p>
              </div>
              <div className="text-right">
                <p className="font-display text-[14px] font-bold">{BDT(a.balance)}</p>
                <p className="text-[11px] text-muted-foreground">Credit {BDT(a.credit)}</p>
              </div>
              <Pill tone={tone(a.status)}>{a.status}</Pill>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Button size="sm" className="h-8 text-[11px]" onClick={() => setOpenId(a.id)}>
                View full details <ChevronRight className="size-3.5" />
              </Button>
              {a.status !== "Active" ? (
                <Button size="sm" variant="outline" className="h-8 text-[11px]" onClick={() => { ops.setAgencyStatus(a.id, "Active"); onNotice(`${a.name} approved and activated.`); }}>
                  <BadgeCheck className="size-3.5" /> Approve
                </Button>
              ) : null}
              {a.status !== "Suspended" ? (
                <Button size="sm" variant="outline" className="h-8 text-[11px]" onClick={() => { ops.setAgencyStatus(a.id, "Suspended"); onNotice(`${a.name} suspended.`); }}>
                  Suspend
                </Button>
              ) : null}
            </div>
          </div>
        ))}
        {rows.length === 0 ? <p className="text-[12px] text-muted-foreground">No agency matched this search.</p> : null}
      </div>
    </Card>
  );
}

function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-xl border border-border bg-secondary/40 p-3">
      <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1 font-display text-[15px] font-bold">{value}</p>
      {hint ? <p className="text-[10px] text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

function AgentDetail({ agencyId, onBack, onNotice }: { agencyId: string; onBack: () => void; onNotice: (v: string) => void }) {
  const state = useOps((s) => s);
  const agency = state.agencies.find((a) => a.id === agencyId)!;
  const [tab, setTab] = useState<"bookings" | "deposits" | "refunds" | "searches" | "tickets">("bookings");

  const bookings = state.bookings.filter((b) => b.agencyId === agencyId);
  const deposits = state.deposits.filter((d) => d.agencyId === agencyId);
  const refunds = state.refunds.filter((r) => r.agencyId === agencyId);
  const searches = state.searches.filter((s) => s.agencyId === agencyId);
  const tickets = state.tickets.filter((t) => t.from === agency.name);

  const sales = bookings.filter((b) => b.status !== "Cancelled" && b.status !== "Refunded").reduce((n, b) => n + b.amount, 0);
  const commission = bookings.reduce((n, b) => n + b.commission, 0);
  const deposited = deposits.filter((d) => d.status === "Approved").reduce((n, d) => n + d.amount, 0);
  const pendingDeposits = deposits.filter((d) => d.status === "Under review").length;
  const booked = searches.filter((s) => s.booked).length;
  const tone = (s: AgencyStatus) => (s === "Active" ? "good" : s === "Pending" ? "warn" : "bad");

  const tabs = [
    { id: "bookings", label: `Bookings (${bookings.length})` },
    { id: "deposits", label: `Deposits (${deposits.length})` },
    { id: "refunds", label: `Refunds (${refunds.length})` },
    { id: "searches", label: `Searches (${searches.length})` },
    { id: "tickets", label: `Support (${tickets.length})` },
  ] as const;

  return (
    <div className="space-y-5">
      <Card className="space-y-4">
        <div className="flex flex-wrap items-start gap-3">
          <button onClick={onBack} className="grid size-9 place-items-center rounded-full border border-border bg-card" aria-label="Back to agencies">
            <ArrowLeft className="size-4" />
          </button>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="font-display text-lg font-bold">{agency.name}</h2>
              <Pill tone={tone(agency.status)}>{agency.status}</Pill>
            </div>
            <p className="text-[11px] text-muted-foreground">{agency.id} · Owner {agency.owner} · Joined {agency.joined}</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-[11px]"
            onClick={() =>
              downloadCsv(`${agency.id}-profile.csv`, [
                ["Field", "Value"],
                ["Partner ID", agency.id],
                ["Agency", agency.name],
                ["Owner", agency.owner],
                ["Email", agency.email],
                ["Phone", agency.phone],
                ["City", agency.city],
                ["Status", agency.status],
                ["Balance", agency.balance],
                ["Credit limit", agency.credit],
                ["Lifetime sales", sales],
                ["Commission earned", commission],
                ["Approved deposits", deposited],
              ])
            }
          >
            <Download className="size-3.5" /> Export profile
          </Button>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Stat label="Portal balance" value={BDT(agency.balance)} hint={`Credit limit ${BDT(agency.credit)}`} />
          <Stat label="Lifetime sales" value={BDT(sales)} hint={`${bookings.length} bookings`} />
          <Stat label="Commission earned" value={BDT(commission)} />
          <Stat label="Deposits approved" value={BDT(deposited)} hint={`${pendingDeposits} awaiting review`} />
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <div className="flex items-center gap-2 rounded-xl border border-border p-3 text-[12px]">
            <Mail className="size-3.5 text-muted-foreground" /> <span className="truncate">{agency.email}</span>
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-border p-3 text-[12px]">
            <Phone className="size-3.5 text-muted-foreground" /> {agency.phone}
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-border p-3 text-[12px]">
            <MapPin className="size-3.5 text-muted-foreground" /> {agency.city}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 border-t border-border pt-3">
          {agency.status !== "Active" ? (
            <Button size="sm" className="h-8 text-[11px]" onClick={() => { ops.setAgencyStatus(agency.id, "Active"); ops.logAudit("Super admin", `Activated ${agency.name}`); onNotice(`${agency.name} activated.`); }}>
              <BadgeCheck className="size-3.5" /> Activate
            </Button>
          ) : null}
          {agency.status !== "Suspended" ? (
            <Button size="sm" variant="outline" className="h-8 text-[11px]" onClick={() => { ops.setAgencyStatus(agency.id, "Suspended"); ops.logAudit("Super admin", `Suspended ${agency.name}`); onNotice(`${agency.name} suspended.`); }}>
              <UserX className="size-3.5" /> Suspend
            </Button>
          ) : null}
          <form
            className="flex items-center gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              const form = e.currentTarget;
              const value = Number(new FormData(form).get("credit") ?? 0);
              ops.setAgencyCredit(agency.id, value);
              onNotice(`Credit limit set to ${BDT(value)}.`);
              form.reset();
            }}
          >
            <Input name="credit" type="number" min={0} step={10000} placeholder="Credit limit" className="h-8 w-36 text-[12px]" required />
            <Button size="sm" variant="outline" type="submit" className="h-8 text-[11px]">Set credit</Button>
          </form>
          <form
            className="flex items-center gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              const form = e.currentTarget;
              const value = Number(new FormData(form).get("amount") ?? 0);
              ops.adjustBalance(agency.id, value);
              ops.logAudit("Super admin", `Balance adjusted ${BDT(value)} for ${agency.name}`);
              onNotice(`Balance adjusted by ${BDT(value)}.`);
              form.reset();
            }}
          >
            <Input name="amount" type="number" step={1000} placeholder="Adjust balance ±" className="h-8 w-40 text-[12px]" required />
            <Button size="sm" variant="outline" type="submit" className="h-8 text-[11px]"><Wallet className="size-3.5" /> Apply</Button>
          </form>
        </div>
      </Card>

      <Card className="space-y-4">
        <div className="flex flex-wrap gap-1 rounded-full bg-secondary p-1">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                "rounded-full px-3 py-1.5 text-[11px] font-semibold transition",
                tab === t.id ? "bg-card shadow-soft text-foreground" : "text-muted-foreground",
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === "bookings" ? (
          <div className="space-y-2">
            {bookings.map((b) => (
              <div key={b.id} className="flex flex-wrap items-center gap-3 rounded-xl border border-border p-3 text-[12px]">
                <div className="min-w-0 flex-1">
                  <p className="font-semibold">{b.pnr} · {b.route}</p>
                  <p className="text-[11px] text-muted-foreground">{b.airline} · {b.date} · {b.pax}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{BDT(b.amount)}</p>
                  <p className="text-[11px] text-muted-foreground">Commission {BDT(b.commission)}</p>
                </div>
                <Pill tone={b.status === "Ticketed" ? "good" : b.status === "On hold" ? "warn" : "bad"}>{b.status}</Pill>
              </div>
            ))}
            {bookings.length === 0 ? <p className="text-[12px] text-muted-foreground">No bookings yet.</p> : null}
          </div>
        ) : null}

        {tab === "deposits" ? (
          <div className="space-y-2">
            {deposits.map((d) => (
              <div key={d.id} className="flex flex-wrap items-center gap-3 rounded-xl border border-border p-3 text-[12px]">
                <div className="min-w-0 flex-1">
                  <p className="font-semibold">{d.id} · {d.method}</p>
                  <p className="text-[11px] text-muted-foreground">Ref {d.reference} · {d.proof} · {d.date}</p>
                </div>
                <p className="font-semibold">{BDT(d.amount)}</p>
                <Pill tone={d.status === "Approved" ? "good" : d.status === "Under review" ? "warn" : "bad"}>{d.status}</Pill>
                {d.status === "Under review" ? (
                  <div className="flex gap-2">
                    <Button size="sm" className="h-8 text-[11px]" onClick={() => { ops.setDepositStatus(d.id, "Approved"); onNotice(`${d.id} approved.`); }}><Check className="size-3.5" /> Approve</Button>
                    <Button size="sm" variant="outline" className="h-8 text-[11px]" onClick={() => { ops.setDepositStatus(d.id, "Rejected"); onNotice(`${d.id} rejected.`); }}>Reject</Button>
                  </div>
                ) : null}
              </div>
            ))}
            {deposits.length === 0 ? <p className="text-[12px] text-muted-foreground">No deposit requests.</p> : null}
          </div>
        ) : null}

        {tab === "refunds" ? (
          <div className="space-y-2">
            {refunds.map((r) => (
              <div key={r.id} className="flex flex-wrap items-center gap-3 rounded-xl border border-border p-3 text-[12px]">
                <div className="min-w-0 flex-1">
                  <p className="font-semibold">{r.id} · {r.type} · {r.pnr}</p>
                  <p className="text-[11px] text-muted-foreground">{r.reason} · {r.date}</p>
                </div>
                <p className="font-semibold">{BDT(r.amount)}</p>
                <Pill tone={r.status === "Approved" ? "good" : r.status === "Requested" ? "warn" : "bad"}>{r.status}</Pill>
                {r.status === "Requested" ? (
                  <div className="flex gap-2">
                    <Button size="sm" className="h-8 text-[11px]" onClick={() => { ops.setRefundStatus(r.id, "Approved"); onNotice(`${r.id} approved.`); }}>Approve</Button>
                    <Button size="sm" variant="outline" className="h-8 text-[11px]" onClick={() => { ops.setRefundStatus(r.id, "Rejected"); onNotice(`${r.id} rejected.`); }}>Reject</Button>
                  </div>
                ) : null}
              </div>
            ))}
            {refunds.length === 0 ? <p className="text-[12px] text-muted-foreground">No refund requests.</p> : null}
          </div>
        ) : null}

        {tab === "searches" ? (
          <div className="space-y-2">
            <p className="text-[11px] text-muted-foreground">Look-to-book: {searches.length ? Math.round((booked / searches.length) * 100) : 0}% ({booked} of {searches.length} searches booked)</p>
            {searches.map((s) => (
              <div key={s.id} className="flex flex-wrap items-center gap-3 rounded-xl border border-border p-3 text-[12px]">
                <div className="min-w-0 flex-1">
                  <p className="font-semibold">{s.route} · {s.trip}</p>
                  <p className="text-[11px] text-muted-foreground">{s.time} · {s.pax} pax · {s.cabin} · GDS {s.gds} · {s.results} results</p>
                </div>
                <Pill tone={s.booked ? "good" : "muted"}>{s.booked ? "Booked" : "Not booked"}</Pill>
              </div>
            ))}
            {searches.length === 0 ? <p className="text-[12px] text-muted-foreground">No search activity.</p> : null}
          </div>
        ) : null}

        {tab === "tickets" ? (
          <div className="space-y-2">
            {tickets.map((t) => (
              <div key={t.id} className="flex flex-wrap items-center gap-3 rounded-xl border border-border p-3 text-[12px]">
                <div className="min-w-0 flex-1">
                  <p className="font-semibold">{t.id} · {t.subject}</p>
                  <p className="text-[11px] text-muted-foreground">{t.priority} priority · {t.date}</p>
                </div>
                <Pill tone={t.status === "Open" ? "warn" : "good"}>{t.status}</Pill>
              </div>
            ))}
            {tickets.length === 0 ? <p className="text-[12px] text-muted-foreground">No support tickets.</p> : null}
          </div>
        ) : null}
      </Card>
    </div>
  );
}

function Deposits({ onNotice }: { onNotice: (v: string) => void }) {
  const state = useOps((s) => s);
  const [filter, setFilter] = useState<"Under review" | "Approved" | "Rejected" | "All">("Under review");
  const rows = state.deposits.filter((d) => filter === "All" || d.status === filter);


  return (
    <Card className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="font-display text-base font-bold">Deposit approvals</h2>
        <div className="ml-auto flex gap-1 rounded-full bg-secondary p-1">
          {(["Under review", "Approved", "Rejected", "All"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn("rounded-full px-3 py-1.5 text-[11px] font-semibold transition", filter === f ? "bg-card text-primary shadow-soft" : "text-muted-foreground")}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {rows.length === 0 ? <p className="py-8 text-center text-sm text-muted-foreground">Nothing here.</p> : null}
      {rows.map((d) => (
        <div key={d.id} className="flex flex-wrap items-center gap-3 rounded-xl border border-border p-4">
          <div className="min-w-0 flex-1">
            <p className="font-display text-[14px] font-bold">{agencyName(state, d.agencyId)}</p>
            <p className="truncate text-[11px] text-muted-foreground">{d.id} · {d.method} · Ref {d.reference} · {d.date}</p>
            <p className="truncate text-[11px] text-muted-foreground">Proof: {d.proof}</p>
          </div>
          <p className="font-display text-[15px] font-bold">{BDT(d.amount)}</p>
          {d.status === "Under review" ? (
            <div className="flex gap-2">
              <Button size="sm" className="h-8 text-[11px]" onClick={() => { ops.setDepositStatus(d.id, "Approved"); onNotice(`${d.id} approved · ${BDT(d.amount)} credited to ${agencyName(state, d.agencyId)}.`); }}>
                <Check className="size-3.5" /> Approve & credit
              </Button>
              <Button size="sm" variant="outline" className="h-8 text-[11px]" onClick={() => { ops.setDepositStatus(d.id, "Rejected"); onNotice(`${d.id} rejected.`); }}>
                Reject
              </Button>
            </div>
          ) : (
            <Pill tone={d.status === "Approved" ? "good" : "bad"}>{d.status}</Pill>
          )}
        </div>
      ))}
    </Card>
  );
}

function AllBookings({ onNotice }: { onNotice: (v: string) => void }) {
  const state = useOps((s) => s);
  const [channel, setChannel] = useState<Channel | "All">("All");
  const [query, setQuery] = useState("");
  const rows = state.bookings.filter(
    (b) =>
      (channel === "All" || b.channel === channel) &&
      `${b.pnr} ${b.pax} ${b.route} ${b.airline} ${b.customer}`.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <Card className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="font-display text-base font-bold">Bookings ({rows.length})</h2>
        <div className="flex gap-1 rounded-full bg-secondary p-1">
          {(["All", "B2B", "B2C"] as const).map((c) => (
            <button
              key={c}
              onClick={() => setChannel(c)}
              className={cn("rounded-full px-3 py-1.5 text-[11px] font-semibold transition", channel === c ? "bg-card text-primary shadow-soft" : "text-muted-foreground")}
            >
              {c}
            </button>
          ))}
        </div>
        <div className="ml-auto flex items-center gap-2 rounded-full border border-border px-3 py-1.5">
          <Search className="size-3.5 text-muted-foreground" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search PNR, passenger, airline" className="w-52 bg-transparent text-[13px] outline-none" />
        </div>
        <Button
          variant="outline"
          size="sm"
          className="h-8 text-[11px]"
          onClick={() => {
            downloadCsv("aci-bookings.csv", [
              ["PNR", "Channel", "Buyer", "Passenger", "Route", "Date", "Airline", "Amount", "Commission", "Status"],
              ...rows.map((b) => [b.pnr, b.channel, b.customer, b.pax, b.route, b.date, b.airline, b.amount, b.commission, b.status]),
            ]);
            onNotice("Bookings exported as CSV.");
          }}
        >
          <Download className="size-3.5" /> Export
        </Button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[820px] text-left text-[13px]">
          <thead>
            <tr className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
              <th className="pb-2 font-semibold">PNR</th>
              <th className="pb-2 font-semibold">Channel</th>
              <th className="pb-2 font-semibold">Buyer</th>
              <th className="pb-2 font-semibold">Route</th>
              <th className="pb-2 font-semibold">Travel</th>
              <th className="pb-2 text-right font-semibold">Amount</th>
              <th className="pb-2 text-right font-semibold">Status</th>
              <th className="pb-2 text-right font-semibold">Action</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((b) => (
              <tr key={b.pnr} className="border-t border-border/70">
                <td className="py-3 font-semibold text-primary">{b.pnr}</td>
                <td className="py-3"><Pill tone={b.channel === "B2B" ? "muted" : "warn"}>{b.channel}</Pill></td>
                <td className="py-3">{b.customer}</td>
                <td className="py-3 text-muted-foreground">{b.route}</td>
                <td className="py-3 text-muted-foreground">{b.date}</td>
                <td className="py-3 text-right font-semibold">{BDT(b.amount)}</td>
                <td className="py-3 text-right">
                  <Pill tone={b.status === "Ticketed" ? "good" : b.status === "On hold" ? "warn" : b.status === "Cancelled" ? "bad" : "muted"}>{b.status}</Pill>
                </td>
                <td className="py-3 text-right">
                  {b.status === "On hold" ? (
                    <button onClick={() => { ops.setBookingStatus(b.pnr, "Ticketed"); onNotice(`PNR ${b.pnr} issued.`); }} className="text-[11px] font-semibold text-primary hover:underline">
                      Issue ticket
                    </button>
                  ) : b.status === "Ticketed" ? (
                    <button onClick={() => { ops.setBookingStatus(b.pnr, "Cancelled"); onNotice(`PNR ${b.pnr} cancelled.`); }} className="text-[11px] font-semibold text-destructive hover:underline">
                      Cancel
                    </button>
                  ) : (
                    <span className="text-[11px] text-muted-foreground">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

function RefundQueue({ onNotice }: { onNotice: (v: string) => void }) {
  const state = useOps((s) => s);
  return (
    <Card className="space-y-3">
      <h2 className="font-display text-base font-bold">Refund, void & reissue requests</h2>
      {state.refunds.map((r) => (
        <div key={r.id} className="flex flex-wrap items-center gap-3 rounded-xl border border-border p-4">
          <div className="min-w-0 flex-1">
            <p className="font-display text-[14px] font-bold">{r.type} · {r.pnr}</p>
            <p className="truncate text-[11px] text-muted-foreground">{r.id} · {r.channel} · {agencyName(state, r.agencyId)} · {r.date}</p>
            <p className="truncate text-[11px] text-muted-foreground">{r.reason}</p>
          </div>
          <p className="font-display text-[15px] font-bold">{BDT(r.amount)}</p>
          {r.status === "Requested" ? (
            <div className="flex gap-2">
              <Button size="sm" className="h-8 text-[11px]" onClick={() => { ops.setRefundStatus(r.id, "Approved"); onNotice(`${r.id} approved · ${BDT(r.amount)} returned.`); }}>
                <Check className="size-3.5" /> Approve
              </Button>
              <Button size="sm" variant="outline" className="h-8 text-[11px]" onClick={() => { ops.setRefundStatus(r.id, "Rejected"); onNotice(`${r.id} rejected.`); }}>
                Reject
              </Button>
            </div>
          ) : (
            <Pill tone={r.status === "Approved" ? "good" : "bad"}>{r.status}</Pill>
          )}
        </div>
      ))}
    </Card>
  );
}

function Fares({ onNotice }: { onNotice: (v: string) => void }) {
  const airlines = useOps((s) => s.airlines);
  return (
    <Card className="space-y-4">
      <div>
        <h2 className="font-display text-base font-bold">Airline markup & agent commission</h2>
        <p className="text-[12px] text-muted-foreground">
          B2C markup is added to the public fare. Agent commission is the discount partners receive on their net agent fare.
        </p>
      </div>
      <div className="space-y-3">
        {airlines.map((a) => (
          <form
            key={a.code}
            className="flex flex-wrap items-end gap-3 rounded-xl border border-border p-4"
            onSubmit={(e) => {
              e.preventDefault();
              const form = new FormData(e.currentTarget);
              ops.updateAirline(a.code, {
                b2cMarkupPct: Number(form.get("markup") ?? a.b2cMarkupPct),
                agentCommissionPct: Number(form.get("commission") ?? a.agentCommissionPct),
              });
              onNotice(`${a.airline} fare rules updated.`);
            }}
          >
            <div className="min-w-0 flex-1">
              <p className="font-display text-[14px] font-bold">{a.airline}</p>
              <p className="text-[11px] text-muted-foreground">Carrier code {a.code}</p>
            </div>
            <div className="space-y-1">
              <Label htmlFor={`markup-${a.code}`} className="text-[11px]">B2C markup %</Label>
              <Input id={`markup-${a.code}`} name="markup" type="number" step={0.5} min={0} max={25} defaultValue={a.b2cMarkupPct} className="h-9 w-24 text-[12px]" />
            </div>
            <div className="space-y-1">
              <Label htmlFor={`commission-${a.code}`} className="text-[11px]">Agent commission %</Label>
              <Input id={`commission-${a.code}`} name="commission" type="number" step={0.5} min={0} max={25} defaultValue={a.agentCommissionPct} className="h-9 w-28 text-[12px]" />
            </div>
            <Button size="sm" type="submit" className="h-9 text-[11px]">Save</Button>
            <Button
              size="sm"
              type="button"
              variant="outline"
              className="h-9 text-[11px]"
              onClick={() => {
                ops.updateAirline(a.code, { active: !a.active });
                onNotice(`${a.airline} ${a.active ? "disabled" : "enabled"} for sale.`);
              }}
            >
              {a.active ? "Disable" : "Enable"}
            </Button>
            <Pill tone={a.active ? "good" : "muted"}>{a.active ? "Selling" : "Off"}</Pill>
          </form>
        ))}
      </div>
    </Card>
  );
}

function SiteContent({ onNotice }: { onNotice: (v: string) => void }) {
  const offers = useOps((s) => s.offers);
  return (
    <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
      <Card className="space-y-3">
        <h2 className="font-display text-base font-bold">B2C offers & banners</h2>
        {offers.map((o) => (
          <div key={o.id} className="flex flex-wrap items-center gap-3 rounded-xl border border-border p-4">
            <div className="min-w-0 flex-1">
              <p className="font-display text-[14px] font-bold">{o.title}</p>
              <p className="truncate text-[11px] text-muted-foreground">{o.detail}</p>
            </div>
            <Pill tone={o.published ? "good" : "muted"}>{o.published ? "Live" : "Draft"}</Pill>
            <Button size="sm" variant="outline" className="h-8 text-[11px]" onClick={() => { ops.toggleOffer(o.id); onNotice(`${o.title} ${o.published ? "unpublished" : "published"}.`); }}>
              {o.published ? "Unpublish" : "Publish"}
            </Button>
            <button onClick={() => { ops.removeOffer(o.id); onNotice(`${o.title} removed.`); }} aria-label="Remove offer" className="text-muted-foreground hover:text-destructive">
              <Trash2 className="size-4" />
            </button>
          </div>
        ))}
      </Card>

      <Card className="space-y-3">
        <h2 className="font-display text-base font-bold">Add an offer</h2>
        <form
          className="space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            const form = new FormData(e.currentTarget);
            const t = String(form.get("offer-title") ?? "").trim();
            const d = String(form.get("offer-detail") ?? "").trim();
            if (!t) return;
            ops.addOffer(t, d);
            onNotice(`Offer "${t}" created as a draft.`);
            e.currentTarget.reset();
          }}
        >
          <div className="space-y-2">
            <Label htmlFor="offer-title">Title</Label>
            <Input id="offer-title" name="offer-title" placeholder="Winter fares to Dubai" className="h-11" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="offer-detail">Description</Label>
            <Input id="offer-detail" name="offer-detail" placeholder="Up to 20% off return fares" className="h-11" />
          </div>
          <Button type="submit" className="h-11 w-full text-sm"><Plus className="size-4" /> Create offer</Button>
        </form>
      </Card>
    </div>
  );
}

function Staff({ onNotice }: { onNotice: (v: string) => void }) {
  const admins = useOps((s) => s.admins);
  return (
    <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
      <Card className="space-y-3">
        <h2 className="font-display text-base font-bold">Staff & roles ({admins.length})</h2>
        {admins.map((u) => (
          <div key={u.id} className="flex items-center gap-3 rounded-xl border border-border p-3.5">
            <span className="grid size-9 place-items-center rounded-full bg-primary/10 text-[11px] font-bold text-primary">
              {u.name.split(" ").map((p) => p[0]).join("").slice(0, 2)}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-semibold">{u.name}</p>
              <p className="truncate text-[11px] text-muted-foreground">{u.email}</p>
            </div>
            <Pill tone={u.status === "Active" ? "good" : "warn"}>{u.role}</Pill>
            {u.role === "Super admin" ? null : (
              <button onClick={() => { ops.removeAdmin(u.id); onNotice(`${u.name} removed.`); }} className="text-[11px] font-semibold text-destructive hover:underline">
                Remove
              </button>
            )}
          </div>
        ))}
      </Card>

      <Card className="space-y-3">
        <h2 className="font-display text-base font-bold">Invite staff</h2>
        <form
          className="space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            const form = new FormData(e.currentTarget);
            const name = String(form.get("staff-name") ?? "").trim();
            const email = String(form.get("staff-email") ?? "").trim();
            const role = String(form.get("staff-role") ?? "Support") as "Operations" | "Accounts" | "Support";
            if (!name || !email) return;
            ops.addAdmin({ name, email, role, status: "Invited" });
            onNotice(`Invitation prepared for ${email}.`);
            e.currentTarget.reset();
          }}
        >
          <div className="space-y-2">
            <Label htmlFor="staff-name">Full name</Label>
            <Input id="staff-name" name="staff-name" className="h-11" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="staff-email">Work email</Label>
            <Input id="staff-email" name="staff-email" type="email" className="h-11" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="staff-role">Role</Label>
            <select id="staff-role" name="staff-role" defaultValue="Support" className="h-11 w-full rounded-md border border-input bg-background px-3 text-sm">
              <option>Operations</option>
              <option>Accounts</option>
              <option>Support</option>
            </select>
          </div>
          <Button type="submit" className="h-11 w-full text-sm"><Plus className="size-4" /> Send invitation</Button>
        </form>
      </Card>
    </div>
  );
}

function Reports() {
  const state = useOps((s) => s);
  const byAirline = useMemo(() => {
    const map = new Map<string, number>();
    state.bookings.forEach((b) => map.set(b.airline, (map.get(b.airline) ?? 0) + b.amount));
    return [...map.entries()].sort((a, b) => b[1] - a[1]);
  }, [state.bookings]);
  const top = byAirline[0]?.[1] ?? 1;
  const commission = state.bookings.reduce((s, b) => s + b.commission, 0);

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "Total bookings", value: String(state.bookings.length) },
          { label: "Commission paid to agents", value: BDT(commission) },
          { label: "Deposits approved", value: BDT(state.deposits.filter((d) => d.status === "Approved").reduce((s, d) => s + d.amount, 0)) },
        ].map((s) => (
          <Card key={s.label} className="space-y-1">
            <p className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">{s.label}</p>
            <p className="font-display text-xl font-bold">{s.value}</p>
          </Card>
        ))}
      </div>

      <Card className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-base font-bold">Sales by airline</h2>
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-[11px]"
            onClick={() => downloadCsv("aci-sales-by-airline.csv", [["Airline", "Sales"], ...byAirline])}
          >
            <Download className="size-3.5" /> Export CSV
          </Button>
        </div>
        {byAirline.map(([airline, value]) => (
          <div key={airline} className="space-y-1">
            <div className="flex justify-between text-[12px] font-medium">
              <span>{airline}</span>
              <span>{BDT(value)}</span>
            </div>
            <div className="h-1.5 rounded-full bg-secondary">
              <div className="h-full rounded-full bg-accent" style={{ width: `${(value / top) * 100}%` }} />
            </div>
          </div>
        ))}
      </Card>
    </div>
  );
}

function Announcements({ onNotice }: { onNotice: (v: string) => void }) {
  const notices = useOps((s) => s.notices);
  return (
    <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
      <Card className="space-y-3">
        <h2 className="font-display text-base font-bold">Published announcements</h2>
        {notices.map((n) => (
          <div key={n.id} className="rounded-xl border border-border p-3.5">
            <p className="text-[13px] font-medium">{n.text}</p>
            <p className="text-[11px] text-muted-foreground">{n.date} · shown to {n.audience}</p>
          </div>
        ))}
      </Card>
      <Card className="space-y-3">
        <h2 className="font-display text-base font-bold">New announcement</h2>
        <form
          className="space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            const form = new FormData(e.currentTarget);
            const text = String(form.get("notice-text") ?? "").trim();
            const audience = String(form.get("notice-audience") ?? "All") as Channel | "All";
            if (!text) return;
            ops.addNotice(text, audience);
            onNotice("Announcement published.");
            e.currentTarget.reset();
          }}
        >
          <div className="space-y-2">
            <Label htmlFor="notice-text">Message</Label>
            <textarea id="notice-text" name="notice-text" rows={3} className="w-full rounded-md border border-input bg-background p-3 text-sm" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="notice-audience">Audience</Label>
            <select id="notice-audience" name="notice-audience" defaultValue="All" className="h-11 w-full rounded-md border border-input bg-background px-3 text-sm">
              <option value="All">Everyone</option>
              <option value="B2B">Agencies (B2B)</option>
              <option value="B2C">Customers (B2C)</option>
            </select>
          </div>
          <Button type="submit" className="h-11 w-full text-sm"><Megaphone className="size-4" /> Publish</Button>
        </form>
      </Card>
    </div>
  );
}

function AgentRequests({ onNotice }: { onNotice: (v: string) => void }) {
  const requests = useOps((s) => s.agentRequests);
  const [filter, setFilter] = useState<"Pending" | "Approved" | "Rejected" | "All">("Pending");
  const rows = requests.filter((r) => filter === "All" || r.status === filter);

  return (
    <Card className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="font-display text-base font-bold">Agent signup requests ({rows.length})</h2>
        <div className="ml-auto flex gap-1 rounded-full bg-secondary p-1">
          {(["Pending", "Approved", "Rejected", "All"] as const).map((f) => (
            <button key={f} onClick={() => setFilter(f)} className={cn("rounded-full px-3 py-1.5 text-[11px] font-semibold transition", filter === f ? "bg-card text-primary shadow-soft" : "text-muted-foreground")}>{f}</button>
          ))}
        </div>
      </div>

      {rows.length === 0 ? <p className="py-8 text-center text-sm text-muted-foreground">No requests here.</p> : null}
      {rows.map((r) => (
        <div key={r.id} className="rounded-xl border border-border p-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="min-w-0 flex-1">
              <p className="font-display text-[14px] font-bold">{r.agency}</p>
              <p className="truncate text-[11px] text-muted-foreground">{r.id} · {r.owner} · {r.city} · applied {r.date}</p>
              <p className="truncate text-[11px] text-muted-foreground">{r.email} · {r.phone} · Trade licence {r.license}</p>
            </div>
            <Pill tone={r.status === "Approved" ? "good" : r.status === "Pending" ? "warn" : "bad"}>{r.status}</Pill>
          </div>
          {r.status === "Pending" ? (
            <div className="mt-3 flex flex-wrap gap-2">
              <Button size="sm" className="h-8 text-[11px]" onClick={() => { ops.setAgentRequestStatus(r.id, "Approved"); ops.logAudit("Super admin", `Approved agent request ${r.id} (${r.agency})`); onNotice(`${r.agency} approved — agency account activated.`); }}>
                <BadgeCheck className="size-3.5" /> Approve & create account
              </Button>
              <Button size="sm" variant="outline" className="h-8 text-[11px]" onClick={() => { ops.setAgentRequestStatus(r.id, "Rejected"); ops.logAudit("Super admin", `Rejected agent request ${r.id}`); onNotice(`${r.agency} request rejected.`); }}>Reject</Button>
            </div>
          ) : null}
        </div>
      ))}
    </Card>
  );
}

function InactiveAgents({ onNotice }: { onNotice: (v: string) => void }) {
  const agencies = useOps((s) => s.agencies.filter((a) => a.status !== "Active"));
  return (
    <Card className="space-y-4">
      <h2 className="font-display text-base font-bold">Deactivated & pending agents ({agencies.length})</h2>
      {agencies.length === 0 ? <p className="py-8 text-center text-sm text-muted-foreground">All agents are active.</p> : null}
      {agencies.map((a) => (
        <div key={a.id} className="flex flex-wrap items-center gap-3 rounded-xl border border-border p-4">
          <div className="min-w-0 flex-1">
            <p className="font-display text-[14px] font-bold">{a.name}</p>
            <p className="truncate text-[11px] text-muted-foreground">{a.id} · {a.owner} · {a.city} · balance {BDT(a.balance)}</p>
          </div>
          <Pill tone={a.status === "Pending" ? "warn" : "bad"}>{a.status}</Pill>
          <Button size="sm" className="h-8 text-[11px]" onClick={() => { ops.setAgencyStatus(a.id, "Active"); ops.logAudit("Super admin", `Reactivated ${a.name}`); onNotice(`${a.name} reactivated.`); }}>
            <Check className="size-3.5" /> Reactivate
          </Button>
        </div>
      ))}
    </Card>
  );
}

function Payments() {
  const payments = useOps((s) => s.payments);
  const success = payments.filter((p) => p.status === "Success");
  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "Collected online", value: BDT(success.reduce((s, p) => s + p.amount, 0)) },
          { label: "Gateway fees", value: BDT(success.reduce((s, p) => s + p.fee, 0)) },
          { label: "Failed / refunded", value: String(payments.filter((p) => p.status !== "Success").length) },
        ].map((s) => (
          <Card key={s.label} className="space-y-1">
            <p className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">{s.label}</p>
            <p className="font-display text-xl font-bold">{s.value}</p>
          </Card>
        ))}
      </div>
      <Card className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-base font-bold">Gateway transactions</h2>
          <Button variant="outline" size="sm" className="h-8 text-[11px]" onClick={() => downloadCsv("aci-payments.csv", [["ID", "Gateway", "PNR", "Channel", "Amount", "Fee", "Status", "Date"], ...payments.map((p) => [p.id, p.gateway, p.pnr, p.channel, p.amount, p.fee, p.status, p.date])])}>
            <Download className="size-3.5" /> Export
          </Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-[13px]">
            <thead>
              <tr className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                <th className="pb-2 font-semibold">Txn</th><th className="pb-2 font-semibold">Gateway</th><th className="pb-2 font-semibold">PNR</th>
                <th className="pb-2 text-right font-semibold">Amount</th><th className="pb-2 text-right font-semibold">Fee</th><th className="pb-2 text-right font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((p) => (
                <tr key={p.id} className="border-t border-border/70">
                  <td className="py-3 font-semibold">{p.id}</td>
                  <td className="py-3 text-muted-foreground">{p.gateway}</td>
                  <td className="py-3 text-primary">{p.pnr}</td>
                  <td className="py-3 text-right font-semibold">{BDT(p.amount)}</td>
                  <td className="py-3 text-right text-muted-foreground">{BDT(p.fee)}</td>
                  <td className="py-3 text-right"><Pill tone={p.status === "Success" ? "good" : p.status === "Failed" ? "bad" : "muted"}>{p.status}</Pill></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

function GdsProviders({ onNotice }: { onNotice: (v: string) => void }) {
  const gds = useOps((s) => s.gds);
  return (
    <div className="space-y-4">
      {gds.map((g) => (
        <Card key={g.code} className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="min-w-0 flex-1">
              <p className="font-display text-[15px] font-bold">{g.name} <span className="text-muted-foreground">· {g.code}</span></p>
              <p className="text-[11px] text-muted-foreground">PCC {g.pcc} · queue {g.queue} pending · success {g.successRate}%</p>
            </div>
            <Pill tone={g.active ? "good" : "muted"}>{g.active ? "Connected" : "Disabled"}</Pill>
            <Button size="sm" variant="outline" className="h-8 text-[11px]" onClick={() => { ops.toggleGds(g.code); onNotice(`${g.name} ${g.active ? "disabled" : "enabled"}.`); }}>
              {g.active ? "Disable" : "Enable"}
            </Button>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              { label: "Segments booked", value: g.segments.toLocaleString("en-US") },
              { label: "Tickets issued", value: g.tickets.toLocaleString("en-US") },
              { label: "Segment cost", value: BDT(g.costPerSegment * g.segments) },
            ].map((s) => (
              <div key={s.label} className="rounded-xl border border-border p-3">
                <p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">{s.label}</p>
                <p className="font-display text-[15px] font-bold">{s.value}</p>
              </div>
            ))}
          </div>
          <form
            className="flex flex-wrap items-end gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              const form = new FormData(e.currentTarget);
              ops.updateGds(g.code, { pcc: String(form.get("pcc") ?? g.pcc), costPerSegment: Number(form.get("cost") ?? g.costPerSegment) });
              ops.logAudit("Super admin", `Updated ${g.name} PCC / segment cost`);
              onNotice(`${g.name} settings saved.`);
            }}
          >
            <div className="space-y-1">
              <Label className="text-[11px]" htmlFor={`pcc-${g.code}`}>PCC / office ID</Label>
              <Input id={`pcc-${g.code}`} name="pcc" defaultValue={g.pcc} className="h-9 w-40 text-[12px]" />
            </div>
            <div className="space-y-1">
              <Label className="text-[11px]" htmlFor={`cost-${g.code}`}>Cost per segment (৳)</Label>
              <Input id={`cost-${g.code}`} name="cost" type="number" min={0} defaultValue={g.costPerSegment} className="h-9 w-36 text-[12px]" />
            </div>
            <Button size="sm" type="submit" className="h-9 text-[11px]">Save</Button>
          </form>
        </Card>
      ))}
    </div>
  );
}

function Segments() {
  const gds = useOps((s) => s.gds);
  const total = gds.reduce((s, g) => s + g.segments, 0) || 1;
  const cost = gds.reduce((s, g) => s + g.segments * g.costPerSegment, 0);
  const tickets = gds.reduce((s, g) => s + g.tickets, 0);

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "Segments this month", value: total.toLocaleString("en-US") },
          { label: "Tickets issued", value: tickets.toLocaleString("en-US") },
          { label: "Segment cost", value: BDT(cost) },
        ].map((s) => (
          <Card key={s.label} className="space-y-1">
            <p className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">{s.label}</p>
            <p className="font-display text-xl font-bold">{s.value}</p>
          </Card>
        ))}
      </div>
      <Card className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-base font-bold">Segment share by GDS</h2>
          <Button variant="outline" size="sm" className="h-8 text-[11px]" onClick={() => downloadCsv("aci-gds-segments.csv", [["GDS", "Segments", "Tickets", "Cost per segment", "Success rate"], ...gds.map((g) => [g.name, g.segments, g.tickets, g.costPerSegment, g.successRate])])}>
            <Download className="size-3.5" /> Export
          </Button>
        </div>
        {gds.map((g) => (
          <div key={g.code} className="space-y-1">
            <div className="flex justify-between text-[12px] font-medium">
              <span>{g.name}</span>
              <span>{g.segments.toLocaleString("en-US")} seg · {Math.round((g.segments / total) * 100)}%</span>
            </div>
            <div className="h-1.5 rounded-full bg-secondary">
              <div className="h-full rounded-full bg-accent" style={{ width: `${(g.segments / total) * 100}%` }} />
            </div>
          </div>
        ))}
      </Card>
    </div>
  );
}

function SearchHistory() {
  const state = useOps((s) => s);
  const [channel, setChannel] = useState<Channel | "All">("All");
  const [query, setQuery] = useState("");
  const rows = state.searches.filter(
    (s) => (channel === "All" || s.channel === channel) && `${s.route} ${s.gds} ${s.id} ${agencyName(state, s.agencyId)}`.toLowerCase().includes(query.toLowerCase()),
  );
  const topRoutes = useMemo(() => {
    const map = new Map<string, number>();
    state.searches.forEach((s) => map.set(s.route, (map.get(s.route) ?? 0) + 1));
    return [...map.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);
  }, [state.searches]);
  const conversion = Math.round((state.searches.filter((s) => s.booked).length / (state.searches.length || 1)) * 100);

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "Searches logged", value: String(state.searches.length) },
          { label: "Look-to-book", value: `${conversion}%` },
          { label: "Top route", value: topRoutes[0]?.[0] ?? "—" },
        ].map((s) => (
          <Card key={s.label} className="space-y-1">
            <p className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">{s.label}</p>
            <p className="font-display text-xl font-bold">{s.value}</p>
          </Card>
        ))}
      </div>

      <Card className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="font-display text-base font-bold">Search history ({rows.length})</h2>
          <div className="flex gap-1 rounded-full bg-secondary p-1">
            {(["All", "B2B", "B2C"] as const).map((c) => (
              <button key={c} onClick={() => setChannel(c)} className={cn("rounded-full px-3 py-1.5 text-[11px] font-semibold transition", channel === c ? "bg-card text-primary shadow-soft" : "text-muted-foreground")}>{c}</button>
            ))}
          </div>
          <div className="ml-auto flex items-center gap-2 rounded-full border border-border px-3 py-1.5">
            <Search className="size-3.5 text-muted-foreground" />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search route, GDS, agency" className="w-48 bg-transparent text-[13px] outline-none" />
          </div>
          <Button variant="outline" size="sm" className="h-8 text-[11px]" onClick={() => downloadCsv("aci-search-history.csv", [["ID", "Time", "Channel", "Buyer", "Route", "Trip", "Pax", "Cabin", "GDS", "Results", "Booked"], ...rows.map((s) => [s.id, s.time, s.channel, agencyName(state, s.agencyId), s.route, s.trip, s.pax, s.cabin, s.gds, s.results, s.booked ? "Yes" : "No"])])}>
            <Download className="size-3.5" /> Export
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] text-left text-[13px]">
            <thead>
              <tr className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                <th className="pb-2 font-semibold">Time</th><th className="pb-2 font-semibold">Buyer</th><th className="pb-2 font-semibold">Route</th>
                <th className="pb-2 font-semibold">Trip</th><th className="pb-2 font-semibold">Pax</th><th className="pb-2 font-semibold">GDS</th>
                <th className="pb-2 text-right font-semibold">Results</th><th className="pb-2 text-right font-semibold">Outcome</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((s) => (
                <tr key={s.id} className="border-t border-border/70">
                  <td className="py-3 text-muted-foreground">{s.time}</td>
                  <td className="py-3">{s.channel === "B2B" ? agencyName(state, s.agencyId) : "Direct customer"}</td>
                  <td className="py-3 font-semibold">{s.route}</td>
                  <td className="py-3 text-muted-foreground">{s.trip}</td>
                  <td className="py-3 text-muted-foreground">{s.pax} · {s.cabin}</td>
                  <td className="py-3"><Pill tone="muted">{s.gds}</Pill></td>
                  <td className="py-3 text-right">{s.results}</td>
                  <td className="py-3 text-right"><Pill tone={s.booked ? "good" : "warn"}>{s.booked ? "Booked" : "No booking"}</Pill></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card className="space-y-3">
        <h2 className="font-display text-base font-bold">Most searched routes</h2>
        {topRoutes.map(([route, count]) => (
          <div key={route} className="flex items-center justify-between rounded-xl border border-border px-3.5 py-2.5 text-[13px]">
            <span className="font-semibold">{route}</span>
            <span className="text-muted-foreground">{count} searches</span>
          </div>
        ))}
      </Card>
    </div>
  );
}

function Promos({ onNotice }: { onNotice: (v: string) => void }) {
  const promos = useOps((s) => s.promos);
  return (
    <div className="grid gap-4 lg:grid-cols-[1.5fr_1fr]">
      <Card className="space-y-3">
        <h2 className="font-display text-base font-bold">Promo codes</h2>
        {promos.map((p) => (
          <div key={p.code} className="flex flex-wrap items-center gap-3 rounded-xl border border-border p-3.5">
            <div className="min-w-0 flex-1">
              <p className="font-display text-[14px] font-bold">{p.code}</p>
              <p className="truncate text-[11px] text-muted-foreground">{p.detail} · {p.type === "Percent" ? `${p.value}%` : BDT(p.value)} · {p.used}/{p.cap} used · {p.audience}</p>
            </div>
            <Pill tone={p.active ? "good" : "muted"}>{p.active ? "Live" : "Paused"}</Pill>
            <Button size="sm" variant="outline" className="h-8 text-[11px]" onClick={() => { ops.togglePromo(p.code); onNotice(`${p.code} ${p.active ? "paused" : "activated"}.`); }}>{p.active ? "Pause" : "Activate"}</Button>
            <Button size="sm" variant="outline" className="h-8 text-[11px]" onClick={() => { ops.removePromo(p.code); onNotice(`${p.code} deleted.`); }}><Trash2 className="size-3.5" /></Button>
          </div>
        ))}
      </Card>
      <Card className="space-y-3">
        <h2 className="font-display text-base font-bold">New promo code</h2>
        <form
          className="space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            const f = new FormData(e.currentTarget);
            const code = String(f.get("code") ?? "").trim().toUpperCase();
            if (!code) return;
            ops.addPromo({
              code,
              detail: String(f.get("detail") ?? ""),
              type: String(f.get("type")) === "Percent" ? "Percent" : "Flat",
              value: Number(f.get("value") ?? 0),
              cap: Number(f.get("cap") ?? 0),
              audience: String(f.get("audience") ?? "All") as Channel | "All",
              active: true,
            });
            onNotice(`${code} created and live.`);
            e.currentTarget.reset();
          }}
        >
          <div className="space-y-2"><Label htmlFor="promo-code">Code</Label><Input id="promo-code" name="code" className="h-11" required /></div>
          <div className="space-y-2"><Label htmlFor="promo-detail">Description</Label><Input id="promo-detail" name="detail" className="h-11" required /></div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="promo-type">Type</Label>
              <select id="promo-type" name="type" defaultValue="Percent" className="h-11 w-full rounded-md border border-input bg-background px-3 text-sm"><option>Percent</option><option>Flat</option></select>
            </div>
            <div className="space-y-2"><Label htmlFor="promo-value">Value</Label><Input id="promo-value" name="value" type="number" min={1} className="h-11" required /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2"><Label htmlFor="promo-cap">Usage cap</Label><Input id="promo-cap" name="cap" type="number" min={1} defaultValue={100} className="h-11" /></div>
            <div className="space-y-2">
              <Label htmlFor="promo-audience">Audience</Label>
              <select id="promo-audience" name="audience" defaultValue="All" className="h-11 w-full rounded-md border border-input bg-background px-3 text-sm"><option value="All">Everyone</option><option value="B2B">Agencies</option><option value="B2C">Customers</option></select>
            </div>
          </div>
          <Button type="submit" className="h-11 w-full text-sm"><Plus className="size-4" /> Create promo</Button>
        </form>
      </Card>
    </div>
  );
}

function SupportInbox({ onNotice }: { onNotice: (v: string) => void }) {
  const tickets = useOps((s) => s.tickets);
  return (
    <Card className="space-y-3">
      <h2 className="font-display text-base font-bold">Support inbox</h2>
      {tickets.map((t) => (
        <div key={t.id} className="flex flex-wrap items-center gap-3 rounded-xl border border-border p-4">
          <div className="min-w-0 flex-1">
            <p className="font-display text-[14px] font-bold">{t.subject}</p>
            <p className="truncate text-[11px] text-muted-foreground">{t.id} · {t.from} · {t.channel} · {t.date}</p>
          </div>
          <Pill tone={t.priority === "Urgent" ? "bad" : t.priority === "Normal" ? "warn" : "muted"}>{t.priority}</Pill>
          <Pill tone={t.status === "Open" ? "warn" : "good"}>{t.status}</Pill>
          {t.status === "Open" ? (
            <Button size="sm" className="h-8 text-[11px]" onClick={() => { ops.setTicketStatus(t.id, "Resolved"); ops.logAudit("Super admin", `Resolved ticket ${t.id}`); onNotice(`${t.id} marked resolved.`); }}>
              <Check className="size-3.5" /> Resolve
            </Button>
          ) : (
            <Button size="sm" variant="outline" className="h-8 text-[11px]" onClick={() => ops.setTicketStatus(t.id, "Open")}>Reopen</Button>
          )}
        </div>
      ))}
    </Card>
  );
}

function AuditLog() {
  const audit = useOps((s) => s.audit);
  return (
    <Card className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-base font-bold">Admin activity log</h2>
        <Button variant="outline" size="sm" className="h-8 text-[11px]" onClick={() => downloadCsv("aci-audit-log.csv", [["ID", "Actor", "Action", "Time"], ...audit.map((a) => [a.id, a.actor, a.action, a.time])])}>
          <Download className="size-3.5" /> Export
        </Button>
      </div>
      {audit.map((a) => (
        <div key={a.id} className="rounded-xl border border-border p-3.5">
          <p className="text-[13px] font-medium">{a.action}</p>
          <p className="text-[11px] text-muted-foreground">{a.actor} · {a.time}</p>
        </div>
      ))}
    </Card>
  );
}
