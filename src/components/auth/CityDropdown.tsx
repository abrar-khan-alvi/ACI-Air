"use client";

import * as React from "react";
import { City } from "country-state-city";
import { cn } from "@/lib/utils";

interface CityDropdownProps {
  countryCode?: string;
  value?: string;
  onChange: (city: string) => void;
  "aria-invalid"?: boolean;
}

export function CityDropdown({
  countryCode,
  value,
  onChange,
  "aria-invalid": ariaInvalid,
}: CityDropdownProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const dropdownRef = React.useRef<HTMLDivElement>(null);
  const cities = React.useMemo(() => {
    if (!countryCode) return [];
    return Array.from(
      new Set((City.getCitiesOfCountry(countryCode) ?? []).map((city) => city.name)),
    ).sort((a, b) => a.localeCompare(b));
  }, [countryCode]);
  const filteredCities = cities.filter((city) =>
    city.toLowerCase().includes(query.trim().toLowerCase()),
  );

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node))
        setIsOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <button
        id="city"
        type="button"
        disabled={!countryCode}
        onClick={() => {
          setIsOpen(!isOpen);
          setQuery("");
        }}
        data-invalid={ariaInvalid}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        className={cn(
          "flex h-12 w-full items-center justify-between rounded-xl border border-slate-200 bg-white/50 px-4 py-2 text-sm text-slate-800 shadow-sm transition-all hover:border-slate-300 hover:bg-white focus:outline-none focus:ring-2 focus:ring-aci-green-500 disabled:cursor-not-allowed disabled:opacity-50 data-[invalid=true]:border-red-500 data-[invalid=true]:bg-red-50/50",
          isOpen && "border-transparent bg-white ring-2 ring-aci-green-500",
        )}
      >
        <span className={cn("truncate", !value && "text-slate-400")}>
          {value || (countryCode ? "Select city or area" : "Select country first")}
        </span>
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className={cn("shrink-0 text-slate-400 transition-transform", isOpen && "rotate-180")}
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {isOpen && (
        <div className="country-dropdown-menu absolute z-50 mt-1 w-full overflow-hidden rounded-xl border border-slate-200 bg-white p-2 shadow-lg">
          <div className="pb-2">
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search cities..."
              aria-label="Search cities"
              className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm outline-none placeholder:text-slate-400 focus:border-aci-green-500 focus:bg-white focus:ring-2 focus:ring-aci-green-500/20"
              autoFocus
            />
          </div>
          <div
            className="country-dropdown-list max-h-52 overflow-y-auto overscroll-contain"
            role="listbox"
          >
            {filteredCities.map((city) => (
              <button
                key={city}
                type="button"
                role="option"
                aria-selected={value === city}
                onClick={() => {
                  onChange(city);
                  setIsOpen(false);
                }}
                className="w-full truncate rounded-lg px-3 py-2 text-left text-sm font-medium text-slate-700 hover:bg-slate-50 focus:bg-slate-50 focus:outline-none aria-selected:bg-aci-green-50 aria-selected:text-aci-green-800"
              >
                {city}
              </button>
            ))}
            {filteredCities.length === 0 && (
              <p className="px-3 py-3 text-sm text-slate-500">No cities found</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
