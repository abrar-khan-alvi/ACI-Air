import { useSyncExternalStore } from "react";

/**
 * Shared demo operations store used by the partner portal and the super admin
 * console. Data lives in memory (mirrored to sessionStorage) so both surfaces
 * stay in sync during a session. No backend is connected yet.
 */

export type DepositStatus = "Under review" | "Approved" | "Rejected";
export type BookingStatus = "Ticketed" | "On hold" | "Cancelled" | "Refunded";
export type RefundStatus = "Requested" | "Approved" | "Rejected";
export type AgencyStatus = "Active" | "Pending" | "Suspended";
export type Channel = "B2B" | "B2C";

export type Agency = {
  id: string;
  name: string;
  owner: string;
  email: string;
  phone: string;
  city: string;
  status: AgencyStatus;
  balance: number;
  credit: number;
  joined: string;
};

export type Deposit = {
  id: string;
  agencyId: string;
  method: string;
  reference: string;
  proof: string;
  amount: number;
  status: DepositStatus;
  date: string;
};

export type Booking = {
  id: string;
  pnr: string;
  channel: Channel;
  agencyId?: string;
  customer: string;
  pax: string;
  route: string;
  date: string;
  airline: string;
  amount: number;
  commission: number;
  status: BookingStatus;
};

export type RefundRequest = {
  id: string;
  pnr: string;
  agencyId?: string;
  channel: Channel;
  type: "Refund" | "Void" | "Reissue";
  reason: string;
  amount: number;
  status: RefundStatus;
  date: string;
};

export type AirlineRule = {
  code: string;
  airline: string;
  b2cMarkupPct: number;
  agentCommissionPct: number;
  active: boolean;
};

export type AdminUser = {
  id: string;
  name: string;
  email: string;
  role: "Super admin" | "Operations" | "Accounts" | "Support";
  status: "Active" | "Invited";
};

export type CmsOffer = {
  id: string;
  title: string;
  detail: string;
  published: boolean;
};

export type TeamMember = {
  name: string;
  email: string;
  role: string;
  status: "Active" | "Invited";
};

export type Notice = {
  id: string;
  text: string;
  date: string;
  audience: Channel | "All";
};

export type GdsProvider = {
  code: string;
  name: string;
  pcc: string;
  active: boolean;
  segments: number;
  tickets: number;
  costPerSegment: number;
  successRate: number;
  queue: number;
};

export type SearchLog = {
  id: string;
  time: string;
  channel: Channel;
  agencyId?: string;
  route: string;
  trip: "One way" | "Round trip" | "Multi city";
  pax: number;
  cabin: string;
  gds: string;
  results: number;
  booked: boolean;
};

export type AgentRequest = {
  id: string;
  agency: string;
  owner: string;
  email: string;
  phone: string;
  city: string;
  license: string;
  date: string;
  status: "Pending" | "Approved" | "Rejected";
};

export type PaymentTxn = {
  id: string;
  gateway: string;
  pnr: string;
  channel: Channel;
  amount: number;
  fee: number;
  status: "Success" | "Failed" | "Refunded";
  date: string;
};

export type PromoCode = {
  code: string;
  detail: string;
  type: "Flat" | "Percent";
  value: number;
  used: number;
  cap: number;
  audience: Channel | "All";
  active: boolean;
};

export type SupportTicket = {
  id: string;
  from: string;
  channel: Channel;
  subject: string;
  priority: "Low" | "Normal" | "Urgent";
  status: "Open" | "Resolved";
  date: string;
};

export type AuditEntry = { id: string; actor: string; action: string; time: string };

export type OpsState = {
  agencies: Agency[];
  deposits: Deposit[];
  bookings: Booking[];
  refunds: RefundRequest[];
  airlines: AirlineRule[];
  admins: AdminUser[];
  offers: CmsOffer[];
  team: TeamMember[];
  notices: Notice[];
  gds: GdsProvider[];
  searches: SearchLog[];
  agentRequests: AgentRequest[];
  payments: PaymentTxn[];
  promos: PromoCode[];
  tickets: SupportTicket[];
  audit: AuditEntry[];
};

export const CURRENT_AGENCY_ID = "ACI-BD-10428";

const today = "08 Sep 2026";

const initialState: OpsState = {
  agencies: [
    { id: CURRENT_AGENCY_ID, name: "SkyReach Travels Ltd.", owner: "Nabil Rahman", email: "nabil@skyreach.travel", phone: "+880 1712 445566", city: "Dhaka", status: "Active", balance: 742600, credit: 250000, joined: "12 Feb 2025" },
    { id: "ACI-BD-10431", name: "Bengal Voyage", owner: "Farhana Akter", email: "ops@bengalvoyage.com", phone: "+880 1811 220044", city: "Chattogram", status: "Active", balance: 318400, credit: 100000, joined: "03 Apr 2025" },
    { id: "ACI-BD-10455", name: "Padma Air Services", owner: "Imran Hossain", email: "imran@padmaair.com", phone: "+880 1911 776655", city: "Sylhet", status: "Pending", balance: 0, credit: 0, joined: "06 Sep 2026" },
    { id: "ACI-BD-10402", name: "Meghna Holidays", owner: "Sadia Islam", email: "sadia@meghnaholidays.com", phone: "+880 1611 909012", city: "Khulna", status: "Suspended", balance: 12500, credit: 0, joined: "22 Nov 2024" },
  ],
  deposits: [
    { id: "DEP-4471", agencyId: CURRENT_AGENCY_ID, method: "bKash", reference: "9F7KJ2M1QX", proof: "bkash-slip.jpg", amount: 150000, status: "Under review", date: today },
    { id: "DEP-4468", agencyId: "ACI-BD-10431", method: "Bank transfer · BRAC", reference: "DS-88120", proof: "brac-slip.pdf", amount: 240000, status: "Under review", date: "07 Sep 2026" },
    { id: "DEP-4460", agencyId: CURRENT_AGENCY_ID, method: "Bank transfer · City Bank", reference: "DS-77219", proof: "city-slip.pdf", amount: 500000, status: "Approved", date: "04 Sep 2026" },
    { id: "DEP-4432", agencyId: "ACI-BD-10431", method: "Nagad", reference: "NG-55210", proof: "nagad.png", amount: 80000, status: "Approved", date: "29 Aug 2026" },
  ],
  bookings: [
    { id: "BK-9001", pnr: "ACI7QK2", channel: "B2B", agencyId: CURRENT_AGENCY_ID, customer: "SkyReach Travels", pax: "Nabil Rahman +1", route: "DAC → DXB", date: "12 Sep 2026", airline: "Emirates", amount: 84200, commission: 4200, status: "Ticketed" },
    { id: "BK-9002", pnr: "ACI3MF9", channel: "B2B", agencyId: CURRENT_AGENCY_ID, customer: "SkyReach Travels", pax: "Farhana Akter", route: "DAC → BKK", date: "18 Sep 2026", airline: "Thai Airways", amount: 46800, commission: 2100, status: "On hold" },
    { id: "BK-9003", pnr: "ACI9TZ4", channel: "B2B", agencyId: CURRENT_AGENCY_ID, customer: "SkyReach Travels", pax: "Imran Hossain +2", route: "CGP → JED", date: "22 Sep 2026", airline: "Saudia", amount: 152400, commission: 7600, status: "Ticketed" },
    { id: "BK-9004", pnr: "ACI5LW1", channel: "B2B", agencyId: CURRENT_AGENCY_ID, customer: "SkyReach Travels", pax: "Sadia Islam", route: "DAC → SIN", date: "29 Sep 2026", airline: "Singapore Airlines", amount: 61250, commission: 2900, status: "Cancelled" },
    { id: "BK-9005", pnr: "ACI2QP8", channel: "B2B", agencyId: "ACI-BD-10431", customer: "Bengal Voyage", pax: "Tanvir Ahmed", route: "CGP → KUL", date: "16 Sep 2026", airline: "Malaysia Airlines", amount: 52300, commission: 2400, status: "Ticketed" },
    { id: "BK-9101", pnr: "ACI8XR3", channel: "B2C", customer: "Rumana Khan", pax: "Rumana Khan +1", route: "DAC → DOH", date: "14 Sep 2026", airline: "Qatar Airways", amount: 96400, commission: 0, status: "Ticketed" },
    { id: "BK-9102", pnr: "ACI4NB6", channel: "B2C", customer: "Shafiq Alam", pax: "Shafiq Alam", route: "DAC → SIN", date: "21 Sep 2026", airline: "Singapore Airlines", amount: 58900, commission: 0, status: "Ticketed" },
    { id: "BK-9103", pnr: "ACI6VD2", channel: "B2C", customer: "Ayesha Noor", pax: "Ayesha Noor +2", route: "DAC → BKK", date: "02 Oct 2026", airline: "Thai Airways", amount: 132800, commission: 0, status: "On hold" },
  ],
  refunds: [
    { id: "RF-2201", pnr: "ACI5LW1", agencyId: CURRENT_AGENCY_ID, channel: "B2B", type: "Refund", reason: "Passenger cancelled the trip", amount: 58900, status: "Requested", date: "06 Sep 2026" },
    { id: "RF-2198", pnr: "ACI4NB6", channel: "B2C", type: "Reissue", reason: "Date change to 25 Sep", amount: 6200, status: "Requested", date: "05 Sep 2026" },
    { id: "RF-2190", pnr: "ACI2QP8", agencyId: "ACI-BD-10431", channel: "B2B", type: "Void", reason: "Duplicate booking", amount: 52300, status: "Approved", date: "01 Sep 2026" },
  ],
  airlines: [
    { code: "EK", airline: "Emirates", b2cMarkupPct: 4, agentCommissionPct: 5, active: true },
    { code: "QR", airline: "Qatar Airways", b2cMarkupPct: 4.5, agentCommissionPct: 5.5, active: true },
    { code: "SQ", airline: "Singapore Airlines", b2cMarkupPct: 3.5, agentCommissionPct: 4.5, active: true },
    { code: "TG", airline: "Thai Airways", b2cMarkupPct: 3, agentCommissionPct: 4, active: true },
    { code: "MH", airline: "Malaysia Airlines", b2cMarkupPct: 3, agentCommissionPct: 4, active: false },
    { code: "AC", airline: "ACI Air", b2cMarkupPct: 2, agentCommissionPct: 6, active: true },
  ],
  admins: [
    { id: "AD-1", name: "Arif Chowdhury", email: "arif@aciair.com", role: "Super admin", status: "Active" },
    { id: "AD-2", name: "Nusrat Jahan", email: "nusrat@aciair.com", role: "Operations", status: "Active" },
    { id: "AD-3", name: "Kamrul Hasan", email: "kamrul@aciair.com", role: "Accounts", status: "Active" },
    { id: "AD-4", name: "Sabina Yasmin", email: "sabina@aciair.com", role: "Support", status: "Invited" },
  ],
  offers: [
    { id: "OF-1", title: "Monsoon fares to Bangkok", detail: "Up to 32% off on selected Thai Airways fares", published: true },
    { id: "OF-2", title: "Dubai weekend escape", detail: "Free 20kg extra baggage on Emirates return fares", published: true },
    { id: "OF-3", title: "Umrah season packages", detail: "Group fares for Jeddah and Madinah", published: false },
  ],
  team: [
    { name: "Nabil Rahman", email: "nabil@skyreach.travel", role: "Owner", status: "Active" },
    { name: "Tanvir Ahmed", email: "tanvir@skyreach.travel", role: "Manager", status: "Active" },
    { name: "Rumana Khan", email: "rumana@skyreach.travel", role: "Booking agent", status: "Active" },
    { name: "Shafiq Alam", email: "shafiq@skyreach.travel", role: "Accounts", status: "Invited" },
  ],
  notices: [
    { id: "NT-1", text: "Emirates fare update effective 10 Sep 2026.", date: "08 Sep 2026", audience: "B2B" },
    { id: "NT-2", text: "Hajj booking window opens next week.", date: "05 Sep 2026", audience: "All" },
  ],
  gds: [
    { code: "1A", name: "Amadeus", pcc: "DAC1A2100", active: true, segments: 18420, tickets: 3120, costPerSegment: 42, successRate: 98.6, queue: 12 },
    { code: "1S", name: "Sabre", pcc: "DACS-7X4", active: true, segments: 11260, tickets: 1980, costPerSegment: 38, successRate: 97.4, queue: 6 },
    { code: "1G", name: "Travelport Galileo", pcc: "DAC-G88", active: true, segments: 7340, tickets: 1210, costPerSegment: 35, successRate: 96.2, queue: 3 },
    { code: "NDC", name: "NDC direct (EK, QR)", pcc: "ACI-NDC", active: true, segments: 5210, tickets: 1440, costPerSegment: 0, successRate: 99.1, queue: 0 },
    { code: "LCC", name: "LCC aggregator", pcc: "ACI-LCC", active: false, segments: 1640, tickets: 260, costPerSegment: 12, successRate: 92.8, queue: 1 },
  ],
  searches: [
    { id: "SR-88120", time: "08 Sep 2026 · 18:42", channel: "B2B", agencyId: CURRENT_AGENCY_ID, route: "DAC → DXB", trip: "Round trip", pax: 2, cabin: "Economy", gds: "1A", results: 46, booked: true },
    { id: "SR-88119", time: "08 Sep 2026 · 18:35", channel: "B2C", route: "DAC → BKK", trip: "One way", pax: 1, cabin: "Economy", gds: "1S", results: 38, booked: false },
    { id: "SR-88118", time: "08 Sep 2026 · 18:20", channel: "B2B", agencyId: "ACI-BD-10431", route: "CGP → KUL", trip: "Round trip", pax: 3, cabin: "Economy", gds: "1G", results: 21, booked: true },
    { id: "SR-88117", time: "08 Sep 2026 · 17:58", channel: "B2C", route: "DAC → JED", trip: "One way", pax: 4, cabin: "Economy", gds: "1A", results: 29, booked: false },
    { id: "SR-88116", time: "08 Sep 2026 · 17:31", channel: "B2B", agencyId: CURRENT_AGENCY_ID, route: "DAC → SIN", trip: "Multi city", pax: 2, cabin: "Business", gds: "NDC", results: 14, booked: false },
    { id: "SR-88115", time: "08 Sep 2026 · 16:47", channel: "B2C", route: "DAC → DOH", trip: "Round trip", pax: 1, cabin: "Economy", gds: "NDC", results: 33, booked: true },
    { id: "SR-88114", time: "08 Sep 2026 · 16:05", channel: "B2B", agencyId: "ACI-BD-10402", route: "DAC → KTM", trip: "One way", pax: 6, cabin: "Economy", gds: "1S", results: 11, booked: false },
  ],
  agentRequests: [
    { id: "AR-771", agency: "Padma Air Services", owner: "Imran Hossain", email: "imran@padmaair.com", phone: "+880 1911 776655", city: "Sylhet", license: "TL-SYL-99231", date: "06 Sep 2026", status: "Pending" },
    { id: "AR-772", agency: "Jamuna Fly Zone", owner: "Rakib Khan", email: "rakib@jamunafly.com", phone: "+880 1511 334455", city: "Rajshahi", license: "TL-RAJ-40112", date: "07 Sep 2026", status: "Pending" },
    { id: "AR-769", agency: "Coastline Tours", owner: "Nadia Sultana", email: "nadia@coastlinetours.com", phone: "+880 1711 998877", city: "Cox's Bazar", license: "TL-CXB-11002", date: "02 Sep 2026", status: "Approved" },
  ],
  payments: [
    { id: "PM-5521", gateway: "SSLCommerz", pnr: "ACI8XR3", channel: "B2C", amount: 96400, fee: 2410, status: "Success", date: "08 Sep 2026" },
    { id: "PM-5519", gateway: "bKash", pnr: "ACI4NB6", channel: "B2C", amount: 58900, fee: 1030, status: "Success", date: "07 Sep 2026" },
    { id: "PM-5514", gateway: "Card · Visa", pnr: "ACI6VD2", channel: "B2C", amount: 132800, fee: 3320, status: "Failed", date: "07 Sep 2026" },
    { id: "PM-5502", gateway: "SSLCommerz", pnr: "ACI5LW1", channel: "B2C", amount: 61250, fee: 1530, status: "Refunded", date: "05 Sep 2026" },
  ],
  promos: [
    { code: "ACIFLY10", detail: "10% off on international economy", type: "Percent", value: 10, used: 214, cap: 1000, audience: "B2C", active: true },
    { code: "AGENT500", detail: "৳500 instant discount for agencies", type: "Flat", value: 500, used: 88, cap: 500, audience: "B2B", active: true },
    { code: "UMRAH25", detail: "Umrah season fare cashback", type: "Flat", value: 2500, used: 12, cap: 300, audience: "All", active: false },
  ],
  tickets: [
    { id: "TK-3301", from: "SkyReach Travels Ltd.", channel: "B2B", subject: "Ticket not issued after balance deduction", priority: "Urgent", status: "Open", date: "08 Sep 2026" },
    { id: "TK-3299", from: "Rumana Khan", channel: "B2C", subject: "Need invoice copy for ACI8XR3", priority: "Normal", status: "Open", date: "07 Sep 2026" },
    { id: "TK-3288", from: "Bengal Voyage", channel: "B2B", subject: "Date change quote for ACI2QP8", priority: "Low", status: "Resolved", date: "04 Sep 2026" },
  ],
  audit: [
    { id: "AU-9001", actor: "Arif Chowdhury", action: "Approved deposit DEP-4460 (৳500,000)", time: "04 Sep 2026 · 11:20" },
    { id: "AU-9000", actor: "Kamrul Hasan", action: "Updated Emirates B2C markup to 4%", time: "03 Sep 2026 · 16:02" },
    { id: "AU-8999", actor: "Nusrat Jahan", action: "Suspended agency Meghna Holidays", time: "01 Sep 2026 · 09:41" },
  ],
};

const KEY = "aci-ops-store-v1";

function load(): OpsState {
  if (typeof window === "undefined") return initialState;
  try {
    const raw = window.sessionStorage.getItem(KEY);
    if (!raw) return initialState;
    return { ...initialState, ...(JSON.parse(raw) as Partial<OpsState>) };
  } catch {
    return initialState;
  }
}

let state: OpsState = initialState;
let hydrated = false;
const listeners = new Set<() => void>();

function emit() {
  if (typeof window !== "undefined") {
    try {
      window.sessionStorage.setItem(KEY, JSON.stringify(state));
    } catch {
      /* storage unavailable */
    }
  }
  listeners.forEach((l) => l());
}

function update(fn: (s: OpsState) => OpsState) {
  state = fn(state);
  emit();
}

function subscribe(listener: () => void) {
  if (!hydrated) {
    hydrated = true;
    state = load();
  }
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useOps<T>(select: (s: OpsState) => T): T {
  const snapshot = useSyncExternalStore(
    subscribe,
    () => state,
    () => initialState,
  );
  return select(snapshot);
}

const seq = (prefix: string, n: number) => `${prefix}-${n + Math.floor(Math.random() * 900) + 100}`;

export const ops = {
  get: () => state,

  submitDeposit(input: { agencyId: string; method: string; reference: string; proof: string; amount: number }) {
    const deposit: Deposit = {
      id: seq("DEP", 4500),
      status: "Under review",
      date: today,
      ...input,
    };
    update((s) => ({ ...s, deposits: [deposit, ...s.deposits] }));
    return deposit;
  },

  setDepositStatus(id: string, status: DepositStatus) {
    update((s) => {
      const deposit = s.deposits.find((d) => d.id === id);
      if (!deposit || deposit.status === status) return s;
      const credited = status === "Approved" && deposit.status !== "Approved";
      return {
        ...s,
        deposits: s.deposits.map((d) => (d.id === id ? { ...d, status } : d)),
        agencies: credited
          ? s.agencies.map((a) => (a.id === deposit.agencyId ? { ...a, balance: a.balance + deposit.amount } : a))
          : s.agencies,
      };
    });
  },

  submitRefund(input: { pnr: string; agencyId?: string; channel: Channel; type: RefundRequest["type"]; reason: string; amount: number }) {
    const request: RefundRequest = { id: seq("RF", 2200), status: "Requested", date: today, ...input };
    update((s) => ({ ...s, refunds: [request, ...s.refunds] }));
    return request;
  },

  setRefundStatus(id: string, status: RefundStatus) {
    update((s) => {
      const request = s.refunds.find((r) => r.id === id);
      if (!request) return s;
      const refunding = status === "Approved" && request.status !== "Approved";
      return {
        ...s,
        refunds: s.refunds.map((r) => (r.id === id ? { ...r, status } : r)),
        bookings: refunding ? s.bookings.map((b) => (b.pnr === request.pnr ? { ...b, status: "Refunded" as BookingStatus } : b)) : s.bookings,
        agencies:
          refunding && request.agencyId
            ? s.agencies.map((a) => (a.id === request.agencyId ? { ...a, balance: a.balance + request.amount } : a))
            : s.agencies,
      };
    });
  },

  setAgencyStatus(id: string, status: AgencyStatus) {
    update((s) => ({ ...s, agencies: s.agencies.map((a) => (a.id === id ? { ...a, status } : a)) }));
  },

  setAgencyCredit(id: string, credit: number) {
    update((s) => ({ ...s, agencies: s.agencies.map((a) => (a.id === id ? { ...a, credit } : a)) }));
  },

  adjustBalance(id: string, delta: number) {
    update((s) => ({ ...s, agencies: s.agencies.map((a) => (a.id === id ? { ...a, balance: Math.max(a.balance + delta, 0) } : a)) }));
  },

  setBookingStatus(pnr: string, status: BookingStatus) {
    update((s) => ({ ...s, bookings: s.bookings.map((b) => (b.pnr === pnr ? { ...b, status } : b)) }));
  },

  updateAirline(code: string, patch: Partial<AirlineRule>) {
    update((s) => ({ ...s, airlines: s.airlines.map((a) => (a.code === code ? { ...a, ...patch } : a)) }));
  },

  addAdmin(user: Omit<AdminUser, "id">) {
    update((s) => ({ ...s, admins: [...s.admins, { ...user, id: seq("AD", 100) }] }));
  },

  removeAdmin(id: string) {
    update((s) => ({ ...s, admins: s.admins.filter((a) => a.id !== id) }));
  },

  toggleOffer(id: string) {
    update((s) => ({ ...s, offers: s.offers.map((o) => (o.id === id ? { ...o, published: !o.published } : o)) }));
  },

  addOffer(title: string, detail: string) {
    update((s) => ({ ...s, offers: [...s.offers, { id: seq("OF", 10), title, detail, published: false }] }));
  },

  removeOffer(id: string) {
    update((s) => ({ ...s, offers: s.offers.filter((o) => o.id !== id) }));
  },

  addTeamMember(member: TeamMember) {
    update((s) => ({ ...s, team: [...s.team, member] }));
  },

  removeTeamMember(email: string) {
    update((s) => ({ ...s, team: s.team.filter((m) => m.email !== email) }));
  },

  addNotice(text: string, audience: Notice["audience"]) {
    update((s) => ({ ...s, notices: [{ id: seq("NT", 10), text, date: today, audience }, ...s.notices] }));
  },

  logAudit(actor: string, action: string) {
    update((s) => ({ ...s, audit: [{ id: seq("AU", 9000), actor, action, time: today }, ...s.audit] }));
  },

  toggleGds(code: string) {
    update((s) => ({ ...s, gds: s.gds.map((g) => (g.code === code ? { ...g, active: !g.active } : g)) }));
  },

  updateGds(code: string, patch: Partial<GdsProvider>) {
    update((s) => ({ ...s, gds: s.gds.map((g) => (g.code === code ? { ...g, ...patch } : g)) }));
  },

  setAgentRequestStatus(id: string, status: AgentRequest["status"]) {
    update((s) => {
      const request = s.agentRequests.find((r) => r.id === id);
      if (!request) return s;
      const exists = s.agencies.some((a) => a.email === request.email);
      const agencies =
        status === "Approved" && !exists
          ? [
              ...s.agencies,
              {
                id: seq("ACI-BD", 10500),
                name: request.agency,
                owner: request.owner,
                email: request.email,
                phone: request.phone,
                city: request.city,
                status: "Active" as AgencyStatus,
                balance: 0,
                credit: 0,
                joined: today,
              },
            ]
          : s.agencies;
      return {
        ...s,
        agencies,
        agentRequests: s.agentRequests.map((r) => (r.id === id ? { ...r, status } : r)),
      };
    });
  },

  togglePromo(code: string) {
    update((s) => ({ ...s, promos: s.promos.map((p) => (p.code === code ? { ...p, active: !p.active } : p)) }));
  },

  addPromo(promo: Omit<PromoCode, "used">) {
    update((s) => ({ ...s, promos: [{ ...promo, used: 0 }, ...s.promos] }));
  },

  removePromo(code: string) {
    update((s) => ({ ...s, promos: s.promos.filter((p) => p.code !== code) }));
  },

  setTicketStatus(id: string, status: SupportTicket["status"]) {
    update((s) => ({ ...s, tickets: s.tickets.map((t) => (t.id === id ? { ...t, status } : t)) }));
  },
};

export const BDT = (n: number) => `৳ ${Math.round(n).toLocaleString("en-US")}`;

export function agencyName(state: OpsState, id?: string) {
  return state.agencies.find((a) => a.id === id)?.name ?? "Direct customer";
}

/** Triggers a real CSV download in the browser. */
export function downloadCsv(filename: string, rows: (string | number)[][]) {
  const csv = rows
    .map((r) => r.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
    .join("\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8;" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
