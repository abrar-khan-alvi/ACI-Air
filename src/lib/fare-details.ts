import { buildFlightResults, paxTotal, type Pax } from "./flight-results";

export type Fare = ReturnType<typeof buildFlightResults>[number];

export const money = (n: number) => `৳ ${n.toLocaleString("en-US")}`;

export function fareBreakdown(f: Fare, pax: Pax) {
  const baseAdult = Math.round(f.perAdult / 1.18);
  const taxAdult = f.perAdult - baseAdult;
  const rows = [
    {
      label: `Base fare · ${pax.adults} adult${pax.adults > 1 ? "s" : ""}`,
      value: baseAdult * pax.adults,
    },
    ...(pax.children
      ? [
          {
            label: `Base fare · ${pax.children} child${pax.children > 1 ? "ren" : ""}`,
            value: Math.round(baseAdult * 0.75) * pax.children,
          },
        ]
      : []),
    ...(pax.infants
      ? [
          {
            label: `Base fare · ${pax.infants} infant${pax.infants > 1 ? "s" : ""}`,
            value: Math.round(baseAdult * 0.1) * pax.infants,
          },
        ]
      : []),
    { label: "Taxes & carrier surcharges", value: taxAdult * paxTotal(pax) },
  ];
  const sum = rows.reduce((t, r) => t + r.value, 0);
  const adjust = f.price - sum;
  if (adjust) rows.push({ label: "Fees & rounding", value: adjust });
  return rows;
}

export function mealFor(cabin: string) {
  if (cabin === "Economy") return "Complimentary hot meal + beverage";
  if (cabin === "Premium Economy") return "Upgraded meal, welcome drink";
  return "Multi-course dining, à la carte, premium bar";
}

export function fareRulesFor(f: Fare) {
  return {
    refund: f.refundable
      ? {
          label: "Refundable",
          detail:
            "Cancellation permitted with airline fee. Refund to original payment within 14–21 business days.",
        }
      : {
          label: "Non-refundable",
          detail: "This fare does not permit refunds. Unused segments have no residual value.",
        },
    change: f.refundable
      ? {
          label: "Changes allowed",
          detail:
            "Date/time changes permitted. Fare difference + change fee applies per passenger.",
        }
      : {
          label: "Changes with fee",
          detail:
            "Date changes allowed up to 24h before departure. Fare difference + higher change fee applies.",
        },
    noShow: {
      label: "No-show",
      detail: "Failure to check in forfeits the fare. Rebooking requires a new ticket.",
    },
    carryOn: {
      label: "Carry-on allowance",
      detail:
        "1 piece up to 7 kg. Max dimensions 56 × 36 × 23 cm. Personal item allowed separately.",
    },
    checked: {
      label: "Checked baggage",
      detail: `${f.baggage} allowance included per passenger. Excess baggage charged at airport rates.`,
    },
  };
}

export const aircraftTypes = [
  "Boeing 787-9",
  "Airbus A350-900",
  "Boeing 777-300ER",
  "Airbus A330-300",
  "Boeing 737 MAX 8",
];

export function flightFacts(f: Fare) {
  let h = 0;
  for (let i = 0; i < f.id.length; i++) h = (h * 31 + f.id.charCodeAt(i)) >>> 0;
  const discountPct = 6 + (h % 12);
  const listPrice = Math.round(f.price / (1 - discountPct / 100) / 100) * 100;
  return {
    aircraft: aircraftTypes[h % aircraftTypes.length]!,
    onTime: 78 + (h % 20),
    seatsLeft: 2 + (h % 7),
    terminalFrom: 1 + (h % 3),
    terminalTo: 1 + ((h >> 3) % 4),
    discountPct,
    listPrice,
    saving: listPrice - f.price,
    pnrHint: `ACI${(h % 90000) + 10000}`,
  };
}
