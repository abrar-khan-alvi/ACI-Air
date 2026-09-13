"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Banknote,
  BarChart3,
  Bell,
  Building2,
  CreditCard,
  Download,
  KeyRound,
  LayoutGrid,
  LifeBuoy,
  Menu,
  Plane,
  Plus,
  Receipt,
  Search,
  Settings,
  ShieldCheck,
  Smartphone,
  Ticket,
  TrendingUp,
  Undo2,
  Users,
  Wallet,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FlightSearchForm } from "@/components/aci/FlightSearchForm";
import { cn } from "@/lib/utils";
import { BDT, CURRENT_AGENCY_ID, downloadCsv, ops, useOps, type Booking } from "@/lib/ops-store";

const title = "Partner Dashboard — ACI Air";
const description =
  "Manage your ACI Air partner balance, ticket issuance, deposits, team members and company profile from one workspace.";


type SectionId =
  | "overview"
  | "book"
  | "bookings"
  | "refunds"
  | "deposit"
  | "transactions"
  | "reports"
  | "team"
  | "company"
  | "notifications"
  | "security"
  | "support";

const sections: { id: SectionId; label: string; icon: typeof LayoutGrid }[] = [
  { id: "overview", label: "Overview", icon: LayoutGrid },
  { id: "book", label: "Search & book", icon: Plane },
  { id: "bookings", label: "Bookings", icon: Ticket },
  { id: "refunds", label: "Refund & void", icon: Undo2 },
  { id: "deposit", label: "Add balance", icon: Wallet },
  { id: "transactions", label: "Transactions", icon: Receipt },
  { id: "reports", label: "Reports", icon: BarChart3 },
  { id: "team", label: "Team members", icon: Users },
  { id: "company", label: "Company profile", icon: Building2 },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "security", label: "Security & API", icon: ShieldCheck },
  { id: "support", label: "Support", icon: LifeBuoy },
];

function BookPanel({ expanded = false }: { expanded?: boolean }) {
  return (
    <Card className="space-y-3 p-0">
      <div className="flex flex-wrap items-center gap-2 px-4 pt-4 sm:px-5">
        <div>
          <h2 className="font-display text-base font-bold">Search & book on agent fare</h2>
          <p className="text-[12px] text-muted-foreground">
            Fares shown are net agent fares. Ticket price is deducted from your portal balance on issuance.
          </p>
        </div>
        <span className="ml-auto rounded-full bg-primary/10 px-3 py-1 text-[11px] font-semibold text-primary">
          Signed in as SkyReach Travels
        </span>
      </div>
      <FlightSearchForm initialTrip="oneway" compact={!expanded} channel="agent" />
    </Card>
  );
}


function useAgency() {
  return useOps((s) => s.agencies.find((a) => a.id === CURRENT_AGENCY_ID))!;
}
function usePartnerBookings() {
  return useOps((s) => s.bookings.filter((b) => b.agencyId === CURRENT_AGENCY_ID));
}
function usePartnerDeposits() {
  return useOps((s) => s.deposits.filter((d) => d.agencyId === CURRENT_AGENCY_ID));
}
function usePartnerRefunds() {
  return useOps((s) => s.refunds.filter((r) => r.agencyId === CURRENT_AGENCY_ID));
}

type Ledger = { id: string; type: string; detail: string; date: string; amount: number };

function useLedger(): Ledger[] {
  const deposits = usePartnerDeposits();
  const bookings = usePartnerBookings();
  const refunds = usePartnerRefunds();
  return [
    ...deposits.filter((d) => d.status === "Approved").map((d) => ({ id: d.id, type: "Deposit", detail: `${d.method} · ${d.reference}`, date: d.date, amount: d.amount })),
    ...bookings.filter((b) => b.status === "Ticketed" || b.status === "On hold").map((b) => ({ id: b.pnr, type: "Ticket", detail: `PNR ${b.pnr} · ${b.airline}`, date: b.date, amount: -b.amount })),
    ...refunds.filter((r) => r.status === "Approved").map((r) => ({ id: r.id, type: "Refund", detail: `PNR ${r.pnr} · ${r.type.toLowerCase()}`, date: r.date, amount: r.amount })),
  ];
}


export function PartnerDashboard() {
  const [section, setSection] = useState<SectionId>("overview");
  const [menuOpen, setMenuOpen] = useState(false);
  const [notice, setNotice] = useState("");
  const [query, setQuery] = useState("");

  const agency = useAgency();
  const ledger = useLedger();
  const deposits = usePartnerDeposits();

  const balance = agency?.balance ?? 0;
  const credit = agency?.credit ?? 0;
  const pending = deposits.filter((d) => d.status === "Under review").reduce((s, d) => s + d.amount, 0);

  const active = sections.find((s) => s.id === section)!;

  const spent = useMemo(
    () => ledger.filter((t) => t.amount < 0).reduce((sum, t) => sum + Math.abs(t.amount), 0),
    [ledger],
  );

  const go = (id: SectionId) => {
    setSection(id);
    setMenuOpen(false);
    setNotice("");
  };

  return (
    <div className="min-h-screen bg-secondary/40">
      <div className="lg:grid lg:grid-cols-[248px_1fr]">
        <SideNav section={section} onGo={go} className="sticky top-0 hidden h-screen lg:flex" />

        {menuOpen ? (
          <div className="fixed inset-0 z-50 lg:hidden">
            <button aria-label="Close menu" onClick={() => setMenuOpen(false)} className="absolute inset-0 bg-foreground/30 backdrop-blur-sm" />
            <SideNav section={section} onGo={go} className="absolute inset-y-0 left-0 flex h-full w-[260px] shadow-float">
              <button onClick={() => setMenuOpen(false)} aria-label="Close menu" className="absolute right-3 top-3 grid size-8 place-items-center rounded-full bg-secondary">
                <X className="size-4" />
              </button>
            </SideNav>
          </div>
        ) : null}

        <div className="min-w-0">
          <header className="sticky top-0 z-30 flex flex-wrap items-center gap-3 border-b border-border/70 bg-background/85 px-4 py-3 backdrop-blur-xl sm:px-6">
            <button onClick={() => setMenuOpen(true)} aria-label="Open menu" className="grid size-9 place-items-center rounded-full border border-border bg-card lg:hidden">
              <Menu className="size-4" />
            </button>

            <div className="min-w-0">
              <h1 className="font-display text-lg font-bold leading-tight text-foreground">{active.label}</h1>
              <p className="truncate text-[11px] text-muted-foreground">{agency?.name} · Partner ID {CURRENT_AGENCY_ID}</p>
            </div>

            <div className="ml-auto flex items-center gap-2">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setSection("bookings");
                }}
                className="hidden items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 md:flex"
              >
                <Search className="size-3.5 text-muted-foreground" />
                <input
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    if (e.target.value) setSection("bookings");
                  }}
                  placeholder="Search PNR, passenger, airline…"
                  className="w-44 bg-transparent text-[13px] outline-none placeholder:text-muted-foreground"
                />
              </form>

              <div className="flex items-center gap-3 rounded-2xl border border-primary/15 bg-primary px-3.5 py-2 text-primary-foreground shadow-card">
                <Wallet className="size-4 text-accent" />
                <div className="leading-tight">
                  <p className="text-[9px] uppercase tracking-[0.16em] text-primary-foreground/70">Portal balance</p>
                  <p className="font-display text-[15px] font-bold">{BDT(balance)}</p>
                </div>
                <Button size="sm" onClick={() => go("deposit")} className="h-7 rounded-full bg-accent px-3 text-[11px] font-semibold text-accent-foreground hover:opacity-90">
                  <Plus className="size-3.5" /> Add
                </Button>
              </div>

              <div className="hidden size-9 place-items-center rounded-full bg-primary/10 text-[11px] font-bold text-primary sm:grid">NR</div>
            </div>
          </header>

          <main className="space-y-6 px-4 py-6 sm:px-6 lg:px-8">
            {notice ? (
              <p role="status" className="rounded-xl border border-primary/15 bg-card px-4 py-3 text-xs text-primary">{notice}</p>
            ) : null}

            {section === "overview" ? (
              <>
                <BookPanel />
                <Overview balance={balance} credit={credit} pending={pending} spent={spent} onGo={go} />
              </>
            ) : null}
            {section === "book" ? <BookPanel expanded /> : null}
            {section === "bookings" ? <Bookings query={query} setQuery={setQuery} onNotice={setNotice} /> : null}
            {section === "refunds" ? <Refunds onNotice={setNotice} /> : null}
            {section === "deposit" ? <Deposit onNotice={setNotice} /> : null}
            {section === "transactions" ? <Transactions /> : null}
            {section === "reports" ? <Reports /> : null}
            {section === "team" ? <Team onNotice={setNotice} /> : null}
            {section === "company" ? <Company onNotice={setNotice} /> : null}
            {section === "notifications" ? <Notifications onNotice={setNotice} /> : null}
            {section === "security" ? <Security onNotice={setNotice} /> : null}
            {section === "support" ? <Support /> : null}
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
}: {
  section: SectionId;
  onGo: (id: SectionId) => void;
  className?: string;
  children?: React.ReactNode;
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

      <p className="px-2.5 pb-2 text-[9px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">Partner portal</p>
      <nav className="space-y-1">
        {sections.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => onGo(id)}
            className={cn(
              "flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-[13px] font-medium transition",
              section === id ? "bg-primary text-primary-foreground shadow-soft" : "text-foreground/70 hover:bg-secondary",
            )}
          >
            <Icon className={cn("size-4", section === id ? "text-accent" : "text-muted-foreground")} strokeWidth={1.9} />
            {label}
          </button>
        ))}
      </nav>

      <div className="mt-auto space-y-2 rounded-2xl border border-border bg-card p-3.5">
        <p className="font-display text-[13px] font-bold text-foreground">Need more credit?</p>
        <p className="text-[11px] leading-5 text-muted-foreground">Upgrade your agency limit with a quick review from your account manager.</p>
        <Button size="sm" variant="outline" className="h-8 w-full text-[11px]">Request limit</Button>
      </div>
      <Link href="/" className="mt-3 flex items-center gap-2 px-3 text-[11px] text-muted-foreground hover:text-primary">
        <Settings className="size-3.5" /> Back to ACI Air
      </Link>
    </aside>
  );
}

function Card({ className, children }: { className?: string; children: React.ReactNode }) {
  return <section className={cn("rounded-2xl border border-border bg-card p-5 shadow-soft", className)}>{children}</section>;
}

function Overview({
  balance,
  credit,
  pending,
  spent,
  onGo,
}: {
  balance: number;
  credit: number;
  pending: number;
  spent: number;
  onGo: (id: SectionId) => void;
}) {
  const stats = [
    { label: "Available balance", value: BDT(balance), icon: Wallet, hint: "Usable for ticket issuance" },
    { label: "Credit limit", value: BDT(credit), icon: TrendingUp, hint: "Approved agency credit" },
    { label: "Pending deposit", value: BDT(pending), icon: ArrowDownLeft, hint: "1 transfer under review" },
    { label: "Issued this month", value: BDT(spent), icon: Ticket, hint: "12 tickets issued" },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(({ label, value, icon: Icon, hint }) => (
          <Card key={label} className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">{label}</p>
              <Icon className="size-4 text-accent" />
            </div>
            <p className="font-display text-2xl font-bold text-foreground">{value}</p>
            <p className="text-[11px] text-muted-foreground">{hint}</p>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.6fr_1fr]">
        <Card className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-base font-bold">Recent bookings</h2>
            <button onClick={() => onGo("bookings")} className="text-[11px] font-semibold text-primary hover:text-accent">View all</button>
          </div>
          <RecentBookings />
        </Card>

        <Card className="space-y-3">
          <h2 className="font-display text-base font-bold">Quick actions</h2>
          <button onClick={() => onGo("book")} className="flex w-full items-center gap-3 rounded-xl border border-border p-3 text-left transition hover:border-primary/40">
            <Plane className="size-4 text-accent" />
            <span>
              <span className="block text-[13px] font-semibold">Issue a new ticket</span>
              <span className="block text-[11px] text-muted-foreground">Search flights and book instantly</span>
            </span>
          </button>
          <button onClick={() => onGo("deposit")} className="flex w-full items-center gap-3 rounded-xl border border-border p-3 text-left transition hover:border-primary/40">
            <Banknote className="size-4 text-accent" />
            <span>
              <span className="block text-[13px] font-semibold">Deposit balance</span>
              <span className="block text-[11px] text-muted-foreground">Bank transfer or MFS</span>
            </span>
          </button>
          <button onClick={() => onGo("team")} className="flex w-full items-center gap-3 rounded-xl border border-border p-3 text-left transition hover:border-primary/40">
            <Users className="size-4 text-accent" />
            <span>
              <span className="block text-[13px] font-semibold">Invite a team member</span>
              <span className="block text-[11px] text-muted-foreground">Set roles and access</span>
            </span>
          </button>
        </Card>
      </div>
    </div>
  );
}

function RecentBookings() {
  const rows = usePartnerBookings().slice(0, 3);
  return <BookingTable rows={rows} />;
}

function BookingTable({ rows }: { rows: Booking[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[560px] text-left text-[13px]">
        <thead>
          <tr className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
            <th className="pb-2 font-semibold">PNR</th>
            <th className="pb-2 font-semibold">Passenger</th>
            <th className="pb-2 font-semibold">Route</th>
            <th className="pb-2 font-semibold">Travel date</th>
            <th className="pb-2 text-right font-semibold">Amount</th>
            <th className="pb-2 text-right font-semibold">Status</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((b) => (
            <tr key={b.pnr} className="border-t border-border/70">
              <td className="py-3 font-semibold text-primary">{b.pnr}</td>
              <td className="py-3">{b.pax}</td>
              <td className="py-3 text-muted-foreground">{b.route}</td>
              <td className="py-3 text-muted-foreground">{b.date}</td>
              <td className="py-3 text-right font-semibold">{BDT(b.amount)}</td>
              <td className="py-3 text-right">
                <span
                  className={cn(
                    "rounded-full px-2.5 py-1 text-[10px] font-semibold",
                    b.status === "Ticketed" && "bg-primary/10 text-primary",
                    b.status === "On hold" && "bg-accent/15 text-accent",
                    b.status === "Cancelled" && "bg-destructive/10 text-destructive",
                    b.status === "Refunded" && "bg-secondary text-foreground/70",
                  )}
                >
                  {b.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Bookings({
  query,
  setQuery,
  onNotice,
}: {
  query: string;
  setQuery: (v: string) => void;
  onNotice: (v: string) => void;
}) {
  const all = usePartnerBookings();
  const rows = all.filter((b) => `${b.pnr} ${b.pax} ${b.route} ${b.airline}`.toLowerCase().includes(query.toLowerCase()));

  return (
    <Card className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <h2 className="font-display text-base font-bold">All bookings ({rows.length})</h2>
        <div className="ml-auto flex items-center gap-2 rounded-full border border-border px-3 py-1.5">
          <Search className="size-3.5 text-muted-foreground" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search PNR or passenger" className="w-48 bg-transparent text-[13px] outline-none" />
        </div>
        <Button
          variant="outline"
          size="sm"
          className="h-8 text-[11px]"
          onClick={() => {
            downloadCsv("aci-partner-bookings.csv", [
              ["PNR", "Passenger", "Route", "Travel date", "Airline", "Amount", "Status"],
              ...rows.map((b) => [b.pnr, b.pax, b.route, b.date, b.airline, b.amount, b.status]),
            ]);
            onNotice("Booking list exported as CSV.");
          }}
        >
          <Download className="size-3.5" /> Export
        </Button>
      </div>
      {rows.length ? <BookingTable rows={rows} /> : <p className="py-8 text-center text-sm text-muted-foreground">No bookings match your search.</p>}
    </Card>
  );
}


const bankAccounts = [
  { bank: "City Bank PLC", account: "1402 3398 4471 001", branch: "Gulshan Avenue", name: "ACI Air Travels Ltd." },
  { bank: "BRAC Bank PLC", account: "2051 7788 9012 003", branch: "Banani", name: "ACI Air Travels Ltd." },
];

const mfsAccounts = [
  { name: "bKash Merchant", number: "01755 000 918", type: "Merchant payment" },
  { name: "Nagad", number: "01711 442 087", type: "Send money" },
  { name: "Rocket", number: "017554420876", type: "Send money" },
];

function Deposit({ onNotice }: { onNotice: (v: string) => void }) {
  const [method, setMethod] = useState<"bank" | "mfs">("bank");
  const [proof, setProof] = useState("");


  return (
    <div className="grid gap-4 lg:grid-cols-[1.3fr_1fr]">
      <Card className="space-y-5">
        <div>
          <h2 className="font-display text-base font-bold">Add balance to your portal</h2>
          <p className="mt-1 text-[12px] text-muted-foreground">Deposits are verified by our accounts team, usually within 30 minutes during business hours.</p>
        </div>

        <div className="flex gap-2 rounded-full bg-secondary p-1">
          {(["bank", "mfs"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMethod(m)}
              className={cn(
                "flex flex-1 items-center justify-center gap-2 rounded-full px-3 py-2 text-[12px] font-semibold transition",
                method === m ? "bg-card text-primary shadow-soft" : "text-muted-foreground",
              )}
            >
              {m === "bank" ? <Banknote className="size-4" /> : <Smartphone className="size-4" />}
              {m === "bank" ? "Bank transfer" : "Mobile financial services"}
            </button>
          ))}
        </div>

        <div className="space-y-3">
          {method === "bank"
            ? bankAccounts.map((b) => (
                <div key={b.account} className="rounded-xl border border-border p-3.5">
                  <p className="font-display text-[13px] font-bold">{b.bank}</p>
                  <p className="mt-1 text-[13px] tracking-wide">{b.account}</p>
                  <p className="text-[11px] text-muted-foreground">{b.name} · {b.branch} branch</p>
                </div>
              ))
            : mfsAccounts.map((m) => (
                <div key={m.number} className="flex items-center justify-between rounded-xl border border-border p-3.5">
                  <div>
                    <p className="font-display text-[13px] font-bold">{m.name}</p>
                    <p className="text-[11px] text-muted-foreground">{m.type}</p>
                  </div>
                  <p className="text-[13px] font-semibold tracking-wide">{m.number}</p>
                </div>
              ))}
        </div>

        <form
          className="space-y-4 border-t border-border pt-4"
          onSubmit={(e) => {
            e.preventDefault();
            const form = new FormData(e.currentTarget);
            const amount = Number(form.get("amount") ?? 0);
            const reference = String(form.get("reference") ?? "").trim();
            const from = String(form.get("from") ?? "").trim();
            if (!amount || !reference || !proof) return;
            const created = ops.submitDeposit({
              agencyId: CURRENT_AGENCY_ID,
              method: method === "bank" ? `Bank transfer · ${from}` : `MFS · ${from}`,
              reference,
              proof,
              amount,
            });
            onNotice(`Deposit request ${created.id} submitted for ${BDT(amount)}. Our accounts team will verify the slip.`);
            e.currentTarget.reset();
            setProof("");
          }}
        >

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="amount">Deposit amount (BDT)</Label>
              <Input id="amount" name="amount" type="number" min={1000} placeholder="50000" required className="h-11" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reference">{method === "bank" ? "Transaction / slip no." : "MFS transaction ID"}</Label>
              <Input id="reference" name="reference" placeholder={method === "bank" ? "Deposit slip number" : "e.g. 9F7KJ2M1QX"} required className="h-11" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="from">{method === "bank" ? "Sender bank & account" : "Sender mobile number"}</Label>
              <Input id="from" name="from" placeholder={method === "bank" ? "City Bank · 1402…" : "01XXXXXXXXX"} required className="h-11" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="slip">Deposit slip / transaction screenshot <span className="text-destructive">*</span></Label>
              <Input
                id="slip"
                name="slip"
                type="file"
                accept="image/*,application/pdf"
                required
                onChange={(e) => setProof(e.target.files?.[0]?.name ?? "")}
                className="h-11 pt-2.5"
              />
              <p className="text-[11px] text-muted-foreground">
                {proof ? `Attached: ${proof}` : "JPG, PNG or PDF · required for verification"}
              </p>
            </div>
          </div>
          <Button type="submit" className="h-11 w-full bg-primary font-display text-sm font-semibold text-primary-foreground sm:w-auto sm:px-8">
            Submit deposit request
          </Button>
        </form>
      </Card>

      <DepositRequests />
    </div>
  );
}

function DepositRequests() {
  const deposits = usePartnerDeposits();
  return (
    <Card className="space-y-4">
      <h2 className="font-display text-base font-bold">Deposit requests</h2>
      {deposits.map((d) => (
        <div key={d.id} className="flex items-center justify-between rounded-xl border border-border p-3.5">
          <div className="min-w-0">
            <p className="text-[13px] font-semibold">{d.id}</p>
            <p className="truncate text-[11px] text-muted-foreground">{d.method} · {d.date}</p>
            <p className="truncate text-[11px] text-muted-foreground">Ref {d.reference} · {d.proof}</p>
          </div>
          <div className="text-right">
            <p className="text-[13px] font-bold">{BDT(d.amount)}</p>
            <p
              className={cn(
                "text-[10px] font-semibold",
                d.status === "Approved" ? "text-primary" : d.status === "Rejected" ? "text-destructive" : "text-accent",
              )}
            >
              {d.status}
            </p>
          </div>
        </div>
      ))}
      <p className="rounded-xl bg-secondary p-3 text-[11px] leading-5 text-muted-foreground">
        Always use your Partner ID <span className="font-semibold text-foreground">{CURRENT_AGENCY_ID}</span> as the payment reference so we can match your deposit quickly.
      </p>
    </Card>
  );
}

function Transactions() {
  const ledger = useLedger();
  return (
    <Card className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-base font-bold">Account statement</h2>
        <Button
          variant="outline"
          size="sm"
          className="h-8 text-[11px]"
          onClick={() =>
            downloadCsv("aci-partner-statement.csv", [
              ["Reference", "Type", "Detail", "Date", "Amount"],
              ...ledger.map((t) => [t.id, t.type, t.detail, t.date, t.amount]),
            ])
          }
        >
          <Download className="size-3.5" /> Download statement
        </Button>
      </div>
      <div className="divide-y divide-border/70">
        {ledger.map((t) => (
          <div key={`${t.type}-${t.id}`} className="flex items-center gap-3 py-3">
            <span className={cn("grid size-9 place-items-center rounded-full", t.amount > 0 ? "bg-primary/10 text-primary" : "bg-accent/15 text-accent")}>
              {t.amount > 0 ? <ArrowDownLeft className="size-4" /> : <ArrowUpRight className="size-4" />}
            </span>
            <div className="min-w-0">
              <p className="text-[13px] font-semibold">{t.type} · {t.id}</p>
              <p className="truncate text-[11px] text-muted-foreground">{t.detail} · {t.date}</p>
            </div>
            <p className={cn("ml-auto text-[13px] font-bold", t.amount > 0 ? "text-primary" : "text-foreground")}>
              {t.amount > 0 ? "+" : "−"} {BDT(Math.abs(t.amount))}
            </p>
          </div>
        ))}
      </div>
    </Card>
  );
}


function Team({ onNotice }: { onNotice: (v: string) => void }) {
  const team = useOps((s) => s.team);

  return (
    <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
      <Card className="space-y-4">
        <h2 className="font-display text-base font-bold">Team members ({team.length})</h2>
        <div className="divide-y divide-border/70">
          {team.map((m) => (
            <div key={m.email} className="flex items-center gap-3 py-3">
              <span className="grid size-9 place-items-center rounded-full bg-primary/10 text-[11px] font-bold text-primary">
                {m.name.split(" ").map((p) => p[0]).join("").slice(0, 2)}
              </span>
              <div className="min-w-0">
                <p className="text-[13px] font-semibold">{m.name}</p>
                <p className="truncate text-[11px] text-muted-foreground">{m.email}</p>
              </div>
              <div className="ml-auto flex items-center gap-3">
                <span className="rounded-full bg-secondary px-2.5 py-1 text-[10px] font-semibold text-foreground/75">{m.role}</span>
                <span className={cn("text-[10px] font-semibold", m.status === "Active" ? "text-primary" : "text-accent")}>{m.status}</span>
                {m.role === "Owner" ? null : (
                  <button
                    onClick={() => ops.removeTeamMember(m.email)}
                    className="text-[11px] font-semibold text-destructive hover:underline"
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card className="space-y-4">
        <h2 className="font-display text-base font-bold">Invite a member</h2>
        <form
          className="space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            const form = new FormData(e.currentTarget);
            const name = String(form.get("member-name") ?? "").trim();
            const email = String(form.get("member-email") ?? "").trim();
            const role = String(form.get("member-role") ?? "Booking agent");
            if (!name || !email) return;
            ops.addTeamMember({ name, email, role, status: "Invited" });
            onNotice(`Invitation prepared for ${email}.`);
            e.currentTarget.reset();
          }}
        >
          <div className="space-y-2">
            <Label htmlFor="member-name">Full name</Label>
            <Input id="member-name" name="member-name" placeholder="Member name" className="h-11" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="member-email">Work email</Label>
            <Input id="member-email" name="member-email" type="email" placeholder="name@agency.com" className="h-11" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="member-role">Role</Label>
            <select id="member-role" name="member-role" defaultValue="Booking agent" className="h-11 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:border-primary">
              <option>Manager</option>
              <option>Booking agent</option>
              <option>Accounts</option>
              <option>Read only</option>
            </select>
          </div>
          <Button type="submit" className="h-11 w-full bg-primary text-sm font-semibold text-primary-foreground">
            <Plus className="size-4" /> Send invitation
          </Button>
        </form>
        <p className="text-[11px] leading-5 text-muted-foreground">
          Roles control who can issue tickets, request deposits and view the account statement.
        </p>
      </Card>
    </div>
  );
}

function Company({ onNotice }: { onNotice: (v: string) => void }) {
  return (
    <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
      <Card className="space-y-4">
        <h2 className="font-display text-base font-bold">Company profile</h2>
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            onNotice("Company profile changes saved for review.");
          }}
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <Field id="company" label="Registered company" defaultValue="SkyReach Travels Ltd." />
            <Field id="agency-type" label="Agency type" defaultValue="Travel agency" />
            <Field id="licence" label="Trade licence no." defaultValue="TRAD/DNCC/094471/2023" />
            <Field id="iata" label="IATA / TIN" defaultValue="TIN 4471 8890 2211" />
            <Field id="contact" label="Contact person" defaultValue="Nabil Rahman" />
            <Field id="phone" label="Phone" defaultValue="+880 1712 345678" />
            <Field id="email" label="Billing email" defaultValue="accounts@skyreach.travel" />
            <Field id="country" label="Country" defaultValue="Bangladesh" />
          </div>
          <Field id="address" label="Business address" defaultValue="House 42, Road 11, Banani, Dhaka 1213" />
          <Button type="submit" className="h-11 bg-primary px-8 text-sm font-semibold text-primary-foreground">Save changes</Button>
        </form>
      </Card>

      <Card className="space-y-4">
        <h2 className="font-display text-base font-bold">Verification & documents</h2>
        {[
          { label: "Trade licence", status: "Verified" },
          { label: "TIN certificate", status: "Verified" },
          { label: "Owner NID", status: "Verified" },
          { label: "Bank cheque copy", status: "Pending" },
        ].map((d) => (
          <div key={d.label} className="flex items-center justify-between rounded-xl border border-border p-3.5">
            <p className="text-[13px] font-semibold">{d.label}</p>
            <span className={cn("text-[11px] font-semibold", d.status === "Verified" ? "text-primary" : "text-accent")}>{d.status}</span>
          </div>
        ))}
        <div className="space-y-2">
          <Label htmlFor="doc">Upload a document</Label>
          <Input id="doc" type="file" accept="image/*,application/pdf" className="h-11 pt-2.5" />
        </div>
        <div className="rounded-xl bg-secondary p-3.5">
          <p className="flex items-center gap-2 text-[12px] font-semibold"><CreditCard className="size-4 text-accent" /> Fare & commission</p>
          <p className="mt-1 text-[11px] leading-5 text-muted-foreground">You book on agent net fare · Commission settled weekly every Sunday.</p>
        </div>
      </Card>
    </div>
  );
}

function Support() {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card className="space-y-3">
        <h2 className="font-display text-base font-bold">Partner support</h2>
        <p className="text-[12px] leading-6 text-muted-foreground">
          Your dedicated account manager is available Sunday to Thursday, 9:00 – 20:00 (GMT+6).
        </p>
        <div className="rounded-xl border border-border p-3.5 text-[13px]">
          <p className="font-semibold">Farhan Karim · Account manager</p>
          <p className="text-[11px] text-muted-foreground">partners@aciair.com · +880 9666 123 456</p>
        </div>
        <Button asChild variant="outline" className="h-11 w-full text-sm">
          <a href="mailto:partners@aciair.com?subject=Partner%20support%20request">
            <LifeBuoy className="size-4" /> Open a support ticket
          </a>
        </Button>
      </Card>
      <Card className="space-y-3">
        <h2 className="font-display text-base font-bold">Helpful guides</h2>
        {["How ticket issuance deducts your balance", "Deposit verification timelines", "Managing roles and permissions", "Refund and void policy"].map((g) => (
          <div key={g} className="rounded-xl border border-border p-3.5 text-[13px]">{g}</div>
        ))}
      </Card>
    </div>
  );
}

function Field({ id, label, defaultValue }: { id: string; label: string; defaultValue: string }) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} name={id} defaultValue={defaultValue} className="h-11" />
    </div>
  );
}

function Refunds({ onNotice }: { onNotice: (v: string) => void }) {
  const requests = usePartnerRefunds();
  const bookings = usePartnerBookings();

  return (
    <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
      <Card className="space-y-3">
        <h2 className="font-display text-base font-bold">Refund, void & reissue requests</h2>
        {requests.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">No requests yet.</p>
        ) : null}
        {requests.map((r) => (
          <div key={r.id} className="flex flex-wrap items-center gap-3 rounded-xl border border-border p-3.5">
            <div className="min-w-0 flex-1">
              <p className="font-display text-[13px] font-bold">{r.type} · {r.pnr}</p>
              <p className="text-[11px] text-muted-foreground">{r.reason} · {r.id} · {r.date}</p>
            </div>
            <p className="font-display text-[13px] font-bold">{BDT(r.amount)}</p>
            <span
              className={cn(
                "rounded-full px-2.5 py-1 text-[10px] font-semibold",
                r.status === "Approved" ? "bg-primary/10 text-primary" : r.status === "Rejected" ? "bg-destructive/10 text-destructive" : "bg-accent/15 text-accent",
              )}
            >
              {r.status}
            </span>
          </div>
        ))}
      </Card>
      <Card className="space-y-3">
        <h2 className="font-display text-base font-bold">New request</h2>
        <form
          className="space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            const form = new FormData(e.currentTarget);
            const pnr = String(form.get("rf-pnr") ?? "").trim().toUpperCase();
            const type = String(form.get("rf-type") ?? "Refund") as "Refund" | "Void" | "Reissue";
            const reason = String(form.get("rf-note") ?? "").trim() || "No reason provided";
            const booking = bookings.find((b) => b.pnr === pnr);
            if (!booking) {
              onNotice(`No booking found for PNR ${pnr || "—"}. Check the PNR and try again.`);
              return;
            }
            const created = ops.submitRefund({
              pnr,
              agencyId: CURRENT_AGENCY_ID,
              channel: "B2B",
              type,
              reason,
              amount: type === "Reissue" ? Math.round(booking.amount * 0.12) : booking.amount,
            });
            onNotice(`${type} request ${created.id} submitted for PNR ${pnr}. Reviewed within 24 business hours.`);
            e.currentTarget.reset();
          }}
        >
          <Field id="rf-pnr" label="PNR / Booking ID" defaultValue="" />
          <div className="space-y-2">
            <Label htmlFor="rf-type">Request type</Label>
            <select id="rf-type" name="rf-type" defaultValue="Refund" className="h-11 w-full rounded-md border border-input bg-background px-3 text-sm">
              <option value="Void">Void (same day)</option>
              <option value="Refund">Refund</option>
              <option value="Reissue">Date change / reissue</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="rf-note">Reason</Label>
            <textarea id="rf-note" name="rf-note" rows={3} className="w-full rounded-md border border-input bg-background p-3 text-sm" placeholder="Tell us what happened" />
          </div>
          <Button type="submit" className="h-11 w-full text-sm">Submit request</Button>
        </form>
      </Card>
    </div>
  );
}




const monthly = [
  { m: "Apr", v: 48 }, { m: "May", v: 62 }, { m: "Jun", v: 55 },
  { m: "Jul", v: 74 }, { m: "Aug", v: 81 }, { m: "Sep", v: 39 },
];

function Reports() {
  const top = Math.max(...monthly.map((x) => x.v));
  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "Tickets issued (YTD)", value: "412" },
          { label: "Gross sales (YTD)", value: BDT(28640000) },
          { label: "Earned commission", value: BDT(742800) },
        ].map((s) => (
          <Card key={s.label} className="space-y-1">
            <p className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">{s.label}</p>
            <p className="font-display text-xl font-bold">{s.value}</p>
          </Card>
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <Card className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-base font-bold">Monthly ticket volume</h2>
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-[11px]"
              onClick={() => downloadCsv("aci-partner-monthly-volume.csv", [["Month", "Tickets"], ...monthly.map((m) => [m.m, m.v])])}
            >
              <Download className="size-3.5" /> Export CSV
            </Button>
          </div>
          <div className="flex h-40 items-end gap-3">
            {monthly.map((b) => (
              <div key={b.m} className="flex flex-1 flex-col items-center gap-2">
                <div className="w-full rounded-t-lg bg-primary/85 transition-all" style={{ height: `${(b.v / top) * 100}%` }} />
                <span className="text-[10px] text-muted-foreground">{b.m}</span>
              </div>
            ))}
          </div>
        </Card>
        <Card className="space-y-3">
          <h2 className="font-display text-base font-bold">Top airlines</h2>
          {[
            { a: "Emirates", p: 28 }, { a: "Saudia", p: 22 },
            { a: "Qatar Airways", p: 18 }, { a: "US-Bangla", p: 16 },
          ].map((x) => (
            <div key={x.a} className="space-y-1">
              <div className="flex justify-between text-[12px] font-medium"><span>{x.a}</span><span>{x.p}%</span></div>
              <div className="h-1.5 rounded-full bg-secondary"><div className="h-full rounded-full bg-accent" style={{ width: `${x.p * 3}%` }} /></div>
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
}

const alertTypes = [
  { id: "booking", label: "Booking & ticketing confirmations" },
  { id: "balance", label: "Low balance warning (below ৳ 50,000)" },
  { id: "deposit", label: "Deposit approved or rejected" },
  { id: "refund", label: "Refund & void status updates" },
  { id: "offer", label: "Airline fare deals and promotions" },
];

function Notifications({ onNotice }: { onNotice: (v: string) => void }) {
  const [on, setOn] = useState<Record<string, boolean>>({ booking: true, balance: true, deposit: true, refund: true, offer: false });
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card className="space-y-3">
        <h2 className="font-display text-base font-bold">Alert preferences</h2>
        {alertTypes.map((a) => (
          <button
            key={a.id}
            type="button"
            onClick={() => {
              setOn((p) => ({ ...p, [a.id]: !p[a.id] }));
              onNotice("Notification preferences updated.");
            }}
            className="flex w-full items-center gap-3 rounded-xl border border-border p-3.5 text-left"
          >
            <Bell className="size-4 text-accent" />
            <span className="flex-1 text-[13px] font-medium">{a.label}</span>
            <span className={cn("h-5 w-9 rounded-full p-0.5 transition", on[a.id] ? "bg-primary" : "bg-secondary")}>
              <span className={cn("block size-4 rounded-full bg-background transition", on[a.id] ? "translate-x-4" : "")} />
            </span>
          </button>
        ))}
      </Card>
      <Card className="space-y-3">
        <h2 className="font-display text-base font-bold">Recent alerts</h2>
        {[
          { t: "Deposit DEP-4471 is under review", d: "Today, 11:06" },
          { t: "PNR ACI3MF9 hold expires in 6 hours", d: "Today, 09:20" },
          { t: "Emirates DAC–DXB fare dropped 8%", d: "Yesterday, 17:44" },
          { t: "Team invite sent to shafiq@skyreach.travel", d: "05 Sep 2026" },
        ].map((n) => (
          <div key={n.t} className="rounded-xl border border-border p-3.5">
            <p className="text-[13px] font-medium">{n.t}</p>
            <p className="text-[11px] text-muted-foreground">{n.d}</p>
          </div>
        ))}
      </Card>
    </div>
  );
}

function Security({ onNotice }: { onNotice: (v: string) => void }) {
  const [twoFa, setTwoFa] = useState(true);
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card className="space-y-3">
        <h2 className="font-display text-base font-bold">Account security</h2>
        <form
          className="space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            onNotice("Password change requires a connected account system, so this is a preview only.");
          }}
        >
          <div className="space-y-2">
            <Label htmlFor="cur-pass">Current password</Label>
            <Input id="cur-pass" type="password" className="h-11" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="new-pass">New password</Label>
            <Input id="new-pass" type="password" className="h-11" />
          </div>
          <Button type="submit" className="h-11 w-full text-sm">Update password</Button>
        </form>
        <button
          type="button"
          onClick={() => setTwoFa((v) => !v)}
          className="flex w-full items-center gap-3 rounded-xl border border-border p-3.5 text-left"
        >
          <ShieldCheck className="size-4 text-accent" />
          <span className="flex-1 text-[13px] font-medium">Two-factor authentication (SMS OTP)</span>
          <span className={cn("h-5 w-9 rounded-full p-0.5 transition", twoFa ? "bg-primary" : "bg-secondary")}>
            <span className={cn("block size-4 rounded-full bg-background transition", twoFa ? "translate-x-4" : "")} />
          </span>
        </button>
      </Card>
      <Card className="space-y-3">
        <h2 className="font-display text-base font-bold">API access & login activity</h2>
        <div className="rounded-xl border border-border p-3.5">
          <p className="flex items-center gap-2 text-[12px] font-semibold"><KeyRound className="size-4 text-accent" /> Live API key</p>
          <p className="mt-1 break-all font-mono text-[11px] text-muted-foreground">aci_live_••••••••••••••••4f2b</p>
          <Button variant="outline" size="sm" className="mt-2 h-8 text-[11px]" onClick={() => onNotice("A new API key can be issued once your account system is connected.")}>Regenerate key</Button>
        </div>
        {[
          { d: "Dhaka, Bangladesh · Chrome", t: "Today, 10:02 · current session" },
          { d: "Chattogram, Bangladesh · Android", t: "07 Sep 2026, 19:40" },
          { d: "Dhaka, Bangladesh · Edge", t: "04 Sep 2026, 12:11" },
        ].map((s) => (
          <div key={s.t} className="rounded-xl border border-border p-3.5">
            <p className="text-[13px] font-medium">{s.d}</p>
            <p className="text-[11px] text-muted-foreground">{s.t}</p>
          </div>
        ))}
      </Card>
    </div>
  );
}
