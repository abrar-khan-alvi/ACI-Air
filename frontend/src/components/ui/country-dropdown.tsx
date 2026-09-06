import * as React from "react"
import { cn } from "@/lib/utils"

export type Country = {
  name: string
  alpha3: string
  emoji: string
  dialCode: string
}

export const COUNTRIES: Country[] = [
  { name: "Bangladesh", alpha3: "BGD", emoji: "🇧🇩", dialCode: "+880" },
  { name: "United States", alpha3: "USA", emoji: "🇺🇸", dialCode: "+1" },
  { name: "United Kingdom", alpha3: "GBR", emoji: "🇬🇧", dialCode: "+44" },
  { name: "Australia", alpha3: "AUS", emoji: "🇦🇺", dialCode: "+61" },
  { name: "India", alpha3: "IND", emoji: "🇮🇳", dialCode: "+91" },
  { name: "Canada", alpha3: "CAN", emoji: "🇨🇦", dialCode: "+1" },
  { name: "United Arab Emirates", alpha3: "ARE", emoji: "🇦🇪", dialCode: "+971" },
  { name: "Singapore", alpha3: "SGP", emoji: "🇸🇬", dialCode: "+65" },
]

export interface CountryDropdownProps {
  placeholder?: string
  defaultValue?: string
  onChange: (country: Country) => void
  className?: string
  "aria-invalid"?: boolean
}

export function CountryDropdown({
  placeholder = "Select a country",
  defaultValue,
  onChange,
  className,
  "aria-invalid": ariaInvalid,
}: CountryDropdownProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const [selected, setSelected] = React.useState<Country | null>(
    COUNTRIES.find(c => c.name === defaultValue || c.alpha3 === defaultValue) || null
  )

  const dropdownRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <div className={cn("relative w-full", className)} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex h-12 w-full items-center justify-between rounded-xl border border-slate-200 bg-white/50 px-4 py-2 text-sm text-slate-800 shadow-sm transition-all duration-300 hover:bg-white hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-aci-green-500 aria-[invalid=true]:border-red-500 aria-[invalid=true]:bg-red-50/50",
          isOpen && "ring-2 ring-aci-green-500 border-transparent bg-white"
        )}
        aria-invalid={ariaInvalid}
      >
        <span className="flex items-center gap-2">
          {selected ? (
            <>
              <span className="text-lg">{selected.emoji}</span>
              <span>{selected.name}</span>
            </>
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
        <div className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-xl border border-slate-200 bg-white py-1 shadow-lg animate-in fade-in zoom-in-95">
          {COUNTRIES.map((country) => (
            <button
              key={country.alpha3}
              type="button"
              className="flex w-full items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 focus:bg-slate-100 focus:outline-none"
              onClick={() => {
                setSelected(country)
                onChange(country)
                setIsOpen(false)
              }}
            >
              <span className="text-lg">{country.emoji}</span>
              <span>{country.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
