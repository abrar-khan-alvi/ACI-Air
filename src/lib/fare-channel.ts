import type { FlightResult } from "./flight-results";

export type FareChannel = "b2c" | "agent";

export function isFareChannel(v: unknown): v is FareChannel {
  return v === "b2c" || v === "agent";
}

/** Deterministic agent discount (agent fare = customer fare minus agency commission). */
export function agentPctFor(id: string) {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return 4 + (h % 5);
}

/** Returns the fare priced for the given sales channel. */
export function applyChannel<T extends FlightResult>(fare: T, channel: FareChannel): T {
  if (channel !== "agent") return fare;
  const pct = agentPctFor(fare.id);
  const factor = 1 - pct / 100;
  return {
    ...fare,
    price: Math.round((fare.price * factor) / 100) * 100,
    perAdult: Math.round(fare.perAdult * factor),
    customerPrice: fare.price,
    agentPct: pct,
  };
}

export function customerPriceOf(fare: FlightResult) {
  return fare.customerPrice ?? fare.price;
}

export function commissionOf(fare: FlightResult) {
  return Math.max(customerPriceOf(fare) - fare.price, 0);
}
