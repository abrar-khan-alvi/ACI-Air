import * as React from "react";
import { getCountries, getCountryCallingCode } from "libphonenumber-js";
import { cn } from "@/lib/utils";

export type Country = {
  name: string;
  code?: string;
  /** @deprecated Legacy seed data only; generated countries use ISO alpha-2 `code`. */
  alpha3?: string;
  emoji: string;
  dialCode: string;
};

export const COUNTRIES: Country[] = [
  { name: "Bangladesh", alpha3: "BGD", emoji: "🇧🇩", dialCode: "+880" },
  { name: "United States", alpha3: "USA", emoji: "🇺🇸", dialCode: "+1" },
  { name: "United Kingdom", alpha3: "GBR", emoji: "🇬🇧", dialCode: "+44" },
  { name: "Australia", alpha3: "AUS", emoji: "🇦🇺", dialCode: "+61" },
  { name: "India", alpha3: "IND", emoji: "🇮🇳", dialCode: "+91" },
  { name: "Canada", alpha3: "CAN", emoji: "🇨🇦", dialCode: "+1" },
  { name: "United Arab Emirates", alpha3: "ARE", emoji: "🇦🇪", dialCode: "+971" },
  { name: "Singapore", alpha3: "SGP", emoji: "🇸🇬", dialCode: "+65" },
];

const regionNames = new Intl.DisplayNames(["en"], { type: "region" });

function countryFlag(code: string) {
  return String.fromCodePoint(...code.split("").map((letter) => 127397 + letter.charCodeAt(0)));
}

export const ALL_COUNTRIES: Country[] = getCountries()
  .map((code) => ({
    name: regionNames.of(code) ?? code,
    code,
    emoji: countryFlag(code),
    dialCode: `+${getCountryCallingCode(code)}`,
  }))
  .sort((a, b) => a.name.localeCompare(b.name));

export interface CountryDropdownProps {
  placeholder?: string;
  defaultValue?: string;
  onChange: (country: Country) => void;
  className?: string;
  "aria-invalid"?: boolean;
}

export function CountryDropdown({
  placeholder = "Select a country",
  defaultValue,
  onChange,
  className,
  "aria-invalid": ariaInvalid,
}: CountryDropdownProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [selected, setSelected] = React.useState<Country | null>(
    ALL_COUNTRIES.find((c) => c.name === defaultValue || c.code === defaultValue) || null,
  );

  const dropdownRef = React.useRef<HTMLDivElement>(null);
  const filteredCountries = ALL_COUNTRIES.filter((country) =>
    `${country.name} ${country.code ?? country.alpha3 ?? ""} ${country.dialCode}`
      .toLowerCase()
      .includes(query.trim().toLowerCase()),
  );

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className={cn("country-dropdown relative w-full", className)} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => {
          setIsOpen(!isOpen);
          setQuery("");
        }}
        className={cn(
          "flex h-12 w-full items-center justify-between rounded-xl border border-slate-200 bg-white/50 px-4 py-2 text-sm text-slate-800 shadow-sm transition-all duration-300 hover:bg-white hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-aci-blue-500 data-[invalid=true]:border-red-500 data-[invalid=true]:bg-red-50/50",
          isOpen && "ring-2 ring-aci-blue-500 border-transparent bg-white",
        )}
        data-invalid={ariaInvalid}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <span className="min-w-0">
          {selected ? (
            <span className="block truncate">{selected.name}</span>
          ) : (
            <span className="text-slate-400">{placeholder}</span>
          )}
        </span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={cn("text-slate-400 transition-transform", isOpen && "rotate-180")}
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {isOpen && (
        <div className="country-dropdown-menu absolute z-50 mt-1 w-full overflow-hidden rounded-xl border border-slate-200 bg-white p-2 shadow-lg animate-in fade-in zoom-in-95">
          <div className="pb-2">
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={(event) => event.stopPropagation()}
              placeholder="Search countries..."
              aria-label="Search countries"
              className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm outline-none placeholder:text-slate-400 focus:border-aci-blue-500 focus:bg-white focus:ring-2 focus:ring-aci-blue-500/20"
              autoFocus
            />
          </div>
          <div
            className="country-dropdown-list max-h-52 overflow-y-auto overscroll-contain"
            role="listbox"
          >
            {filteredCountries.map((country) => (
              <button
                key={country.code ?? country.alpha3 ?? country.name}
                type="button"
                role="option"
                aria-selected={(selected?.code ?? selected?.alpha3) === (country.code ?? country.alpha3)}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 focus:bg-slate-50 focus:outline-none aria-selected:bg-aci-blue-50 aria-selected:text-aci-blue-800"
                onClick={() => {
                  setSelected(country);
                  onChange(country);
                  setIsOpen(false);
                }}
              >
                <span className="min-w-0 flex-1 truncate text-left font-medium">
                  {country.name}
                </span>
                <span className="shrink-0 text-xs text-slate-400">{country.dialCode}</span>
              </button>
            ))}
            {filteredCountries.length === 0 && (
              <p className="px-3 py-3 text-sm text-slate-500">No countries found</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
