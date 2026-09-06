export type Airport = {
  code: string;
  name: string;
  city: string;
  country: string;
};

/** A selectable place: either a single airport or a whole city (all airports). */
export type Place = {
  code: string;
  name: string;
  city: string;
  country: string;
  isCity?: boolean;
  codes: string[];
};

export const airports: Airport[] = [
  // Bangladesh
  { code: "DAC", name: "Hazrat Shahjalal Intl", city: "Dhaka", country: "Bangladesh" },
  { code: "CGP", name: "Shah Amanat Intl", city: "Chattogram", country: "Bangladesh" },
  { code: "ZYL", name: "Osmani Intl", city: "Sylhet", country: "Bangladesh" },
  { code: "CXB", name: "Cox's Bazar Airport", city: "Cox's Bazar", country: "Bangladesh" },
  // South Asia
  { code: "DEL", name: "Indira Gandhi Intl", city: "Delhi", country: "India" },
  { code: "BOM", name: "Chhatrapati Shivaji Intl", city: "Mumbai", country: "India" },
  { code: "CCU", name: "Netaji Subhas Chandra Bose Intl", city: "Kolkata", country: "India" },
  { code: "BLR", name: "Kempegowda Intl", city: "Bengaluru", country: "India" },
  { code: "MAA", name: "Chennai Intl", city: "Chennai", country: "India" },
  { code: "KTM", name: "Tribhuvan Intl", city: "Kathmandu", country: "Nepal" },
  { code: "CMB", name: "Bandaranaike Intl", city: "Colombo", country: "Sri Lanka" },
  { code: "MLE", name: "Velana Intl", city: "Malé", country: "Maldives" },
  { code: "KHI", name: "Jinnah Intl", city: "Karachi", country: "Pakistan" },
  { code: "LHE", name: "Allama Iqbal Intl", city: "Lahore", country: "Pakistan" },
  // Southeast & East Asia
  { code: "SIN", name: "Changi Intl", city: "Singapore", country: "Singapore" },
  { code: "BKK", name: "Suvarnabhumi", city: "Bangkok", country: "Thailand" },
  { code: "DMK", name: "Don Mueang Intl", city: "Bangkok", country: "Thailand" },
  { code: "HKT", name: "Phuket Intl", city: "Phuket", country: "Thailand" },
  { code: "CNX", name: "Chiang Mai Intl", city: "Chiang Mai", country: "Thailand" },
  { code: "KUL", name: "Kuala Lumpur Intl", city: "Kuala Lumpur", country: "Malaysia" },
  {
    code: "SZB",
    name: "Sultan Abdul Aziz Shah (Subang)",
    city: "Kuala Lumpur",
    country: "Malaysia",
  },
  { code: "CGK", name: "Soekarno–Hatta Intl", city: "Jakarta", country: "Indonesia" },
  { code: "HLP", name: "Halim Perdanakusuma", city: "Jakarta", country: "Indonesia" },
  { code: "DPS", name: "Ngurah Rai Intl", city: "Bali (Denpasar)", country: "Indonesia" },
  { code: "MNL", name: "Ninoy Aquino Intl", city: "Manila", country: "Philippines" },
  { code: "CRK", name: "Clark Intl", city: "Manila", country: "Philippines" },
  { code: "SGN", name: "Tan Son Nhat Intl", city: "Ho Chi Minh City", country: "Vietnam" },
  { code: "HAN", name: "Noi Bai Intl", city: "Hanoi", country: "Vietnam" },
  { code: "HKG", name: "Hong Kong Intl", city: "Hong Kong", country: "Hong Kong" },
  { code: "NRT", name: "Narita Intl", city: "Tokyo", country: "Japan" },
  { code: "HND", name: "Haneda", city: "Tokyo", country: "Japan" },
  { code: "KIX", name: "Kansai Intl", city: "Osaka", country: "Japan" },
  { code: "ITM", name: "Itami (Osaka Intl)", city: "Osaka", country: "Japan" },
  { code: "ICN", name: "Incheon Intl", city: "Seoul", country: "South Korea" },
  { code: "GMP", name: "Gimpo Intl", city: "Seoul", country: "South Korea" },
  { code: "PEK", name: "Capital Intl", city: "Beijing", country: "China" },
  { code: "PKX", name: "Daxing Intl", city: "Beijing", country: "China" },
  { code: "PVG", name: "Pudong Intl", city: "Shanghai", country: "China" },
  { code: "SHA", name: "Hongqiao Intl", city: "Shanghai", country: "China" },
  { code: "CAN", name: "Baiyun Intl", city: "Guangzhou", country: "China" },
  // Middle East
  { code: "DXB", name: "Dubai Intl", city: "Dubai", country: "UAE" },
  { code: "DWC", name: "Al Maktoum Intl", city: "Dubai", country: "UAE" },
  { code: "SHJ", name: "Sharjah Intl", city: "Sharjah", country: "UAE" },
  { code: "AUH", name: "Zayed Intl", city: "Abu Dhabi", country: "UAE" },
  { code: "DOH", name: "Hamad Intl", city: "Doha", country: "Qatar" },
  { code: "KWI", name: "Kuwait Intl", city: "Kuwait City", country: "Kuwait" },
  { code: "BAH", name: "Bahrain Intl", city: "Manama", country: "Bahrain" },
  { code: "MCT", name: "Muscat Intl", city: "Muscat", country: "Oman" },
  { code: "JED", name: "King Abdulaziz Intl", city: "Jeddah", country: "Saudi Arabia" },
  { code: "RUH", name: "King Khalid Intl", city: "Riyadh", country: "Saudi Arabia" },
  { code: "MED", name: "Prince Mohammad Bin Abdulaziz", city: "Medina", country: "Saudi Arabia" },
  { code: "IST", name: "Istanbul Airport", city: "Istanbul", country: "Türkiye" },
  { code: "SAW", name: "Sabiha Gökçen Intl", city: "Istanbul", country: "Türkiye" },
  // Europe
  { code: "LHR", name: "Heathrow", city: "London", country: "United Kingdom" },
  { code: "LGW", name: "Gatwick", city: "London", country: "United Kingdom" },
  { code: "STN", name: "Stansted", city: "London", country: "United Kingdom" },
  { code: "LCY", name: "London City", city: "London", country: "United Kingdom" },
  { code: "MAN", name: "Manchester", city: "Manchester", country: "United Kingdom" },
  { code: "CDG", name: "Charles de Gaulle", city: "Paris", country: "France" },
  { code: "ORY", name: "Orly", city: "Paris", country: "France" },
  { code: "FRA", name: "Frankfurt am Main", city: "Frankfurt", country: "Germany" },
  { code: "MUC", name: "Franz Josef Strauss", city: "Munich", country: "Germany" },
  { code: "BER", name: "Brandenburg", city: "Berlin", country: "Germany" },
  { code: "AMS", name: "Schiphol", city: "Amsterdam", country: "Netherlands" },
  { code: "MXP", name: "Malpensa", city: "Milan", country: "Italy" },
  { code: "LIN", name: "Linate", city: "Milan", country: "Italy" },
  { code: "BGY", name: "Orio al Serio (Bergamo)", city: "Milan", country: "Italy" },
  { code: "FCO", name: "Fiumicino – Leonardo da Vinci", city: "Rome", country: "Italy" },
  { code: "CIA", name: "Ciampino", city: "Rome", country: "Italy" },
  { code: "MAD", name: "Adolfo Suárez Barajas", city: "Madrid", country: "Spain" },
  { code: "BCN", name: "El Prat", city: "Barcelona", country: "Spain" },
  { code: "ZRH", name: "Zurich", city: "Zurich", country: "Switzerland" },
  { code: "VIE", name: "Vienna Intl", city: "Vienna", country: "Austria" },
  { code: "CPH", name: "Kastrup", city: "Copenhagen", country: "Denmark" },
  { code: "ARN", name: "Arlanda", city: "Stockholm", country: "Sweden" },
  { code: "DUB", name: "Dublin", city: "Dublin", country: "Ireland" },
  { code: "LIS", name: "Humberto Delgado", city: "Lisbon", country: "Portugal" },
  { code: "ATH", name: "Eleftherios Venizelos", city: "Athens", country: "Greece" },
  // North America
  { code: "JFK", name: "John F. Kennedy Intl", city: "New York", country: "USA" },
  { code: "EWR", name: "Newark Liberty Intl", city: "New York", country: "USA" },
  { code: "LGA", name: "LaGuardia", city: "New York", country: "USA" },
  { code: "ORD", name: "O'Hare Intl", city: "Chicago", country: "USA" },
  { code: "MDW", name: "Midway Intl", city: "Chicago", country: "USA" },
  { code: "LAX", name: "Los Angeles Intl", city: "Los Angeles", country: "USA" },
  { code: "BUR", name: "Hollywood Burbank", city: "Los Angeles", country: "USA" },
  { code: "SFO", name: "San Francisco Intl", city: "San Francisco", country: "USA" },
  { code: "OAK", name: "Oakland Intl", city: "San Francisco", country: "USA" },
  { code: "IAD", name: "Dulles Intl", city: "Washington", country: "USA" },
  { code: "DCA", name: "Ronald Reagan National", city: "Washington", country: "USA" },
  { code: "MIA", name: "Miami Intl", city: "Miami", country: "USA" },
  { code: "BOS", name: "Logan Intl", city: "Boston", country: "USA" },
  { code: "DFW", name: "Dallas/Fort Worth Intl", city: "Dallas", country: "USA" },
  { code: "IAH", name: "George Bush Intercontinental", city: "Houston", country: "USA" },
  { code: "SEA", name: "Seattle–Tacoma Intl", city: "Seattle", country: "USA" },
  { code: "ATL", name: "Hartsfield–Jackson Intl", city: "Atlanta", country: "USA" },
  { code: "YYZ", name: "Toronto Pearson Intl", city: "Toronto", country: "Canada" },
  { code: "YTZ", name: "Billy Bishop City", city: "Toronto", country: "Canada" },
  { code: "YVR", name: "Vancouver Intl", city: "Vancouver", country: "Canada" },
  { code: "YUL", name: "Montréal–Trudeau", city: "Montreal", country: "Canada" },
  // Oceania & Africa
  { code: "SYD", name: "Kingsford Smith", city: "Sydney", country: "Australia" },
  { code: "MEL", name: "Tullamarine", city: "Melbourne", country: "Australia" },
  { code: "AKL", name: "Auckland Intl", city: "Auckland", country: "New Zealand" },
  { code: "CAI", name: "Cairo Intl", city: "Cairo", country: "Egypt" },
  { code: "JNB", name: "O. R. Tambo Intl", city: "Johannesburg", country: "South Africa" },
  { code: "NBO", name: "Jomo Kenyatta Intl", city: "Nairobi", country: "Kenya" },
];

export function toPlace(a: Airport): Place {
  return { code: a.code, name: a.name, city: a.city, country: a.country, codes: [a.code] };
}

export function cityPlace(city: string, country: string): Place {
  const list = airports.filter((a) => a.city === city && a.country === country);
  return {
    code: list.map((a) => a.code).join(","),
    name: `All airports · ${list.map((a) => a.code).join(", ")}`,
    city,
    country,
    isCity: true,
    codes: list.map((a) => a.code),
  };
}

function score(text: string, q: string) {
  const t = text.toLowerCase();
  if (t === q) return 0;
  if (t.startsWith(q)) return 1;
  if (t.includes(q)) return 3;
  return -1;
}

/**
 * Search that groups by city: when a city has multiple airports, a
 * "All airports" row is returned first, followed by each airport.
 */
export function searchPlaces(query: string, exclude?: string, limit = 8): Place[] {
  const q = query.trim().toLowerCase();
  const pool = airports.filter((a) => a.code !== exclude);

  const matched = q
    ? pool
        .map((a) => {
          const s = Math.min(
            ...[
              score(a.code, q) < 0 ? 99 : score(a.code, q),
              score(a.city, q) < 0 ? 99 : score(a.city, q) + 0.1,
              score(a.name, q) < 0 ? 99 : score(a.name, q) + 1,
              score(a.country, q) < 0 ? 99 : score(a.country, q) + 2,
            ],
          );
          return { a, s };
        })
        .filter((x) => x.s < 99)
        .sort((x, y) => x.s - y.s)
    : pool.slice(0, 12).map((a, i) => ({ a, s: i }));

  const out: Place[] = [];
  const seenCity = new Set<string>();
  for (const { a } of matched) {
    const key = `${a.city}|${a.country}`;
    if (!seenCity.has(key)) {
      seenCity.add(key);
      const all = airports.filter((x) => x.city === a.city && x.country === a.country);
      if (all.length > 1) {
        out.push(cityPlace(a.city, a.country));
        for (const x of all) {
          if (x.code !== exclude) out.push(toPlace(x));
        }
        continue;
      }
    } else {
      continue;
    }
    out.push(toPlace(a));
  }
  return out.slice(0, limit);
}

export function placeByCode(code: string): Place | undefined {
  const a = airports.find((x) => x.code === code);
  return a ? toPlace(a) : undefined;
}
