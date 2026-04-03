import type { CountryOption } from "../constants";
import { countryCodes } from "../constants";
import { formatPhoneDisplay } from "../formatters";
import CountryFlag from "./CountryFlag";

type Props = {
  phoneNumber: string;
  phoneError: string;
  selectedCountry: CountryOption;
  showCountryDropdown: boolean;
  onPhoneDigitsChange: (digits: string) => void;
  onToggleCountryDropdown: () => void;
  onSelectCountry: (country: CountryOption) => void;
};

export default function PhoneStep({
  phoneNumber,
  phoneError,
  selectedCountry,
  showCountryDropdown,
  onPhoneDigitsChange,
  onToggleCountryDropdown,
  onSelectCountry,
}: Props) {
  return (
    <div className="flex min-h-0 flex-1 flex-col md:h-full animate-fadeIn">
      <div className="flex flex-col gap-6 md:gap-7">
        <div className="space-y-1.5 shrink-0">
          <h2 className="font-sans text-2xl font-semibold leading-8 tracking-normal text-[#0f172a]">
            Enter your phone number
          </h2>
          <p className="text-sm leading-relaxed text-[#64748b]">
            We use your mobile number to identify your account
          </p>
        </div>

        <div className="relative pt-2">
          <label
            htmlFor="phone-input"
            className="absolute left-3 top-2.75 z-10 -translate-y-1/2 bg-white px-1 text-[11px] font-medium text-[#64748b]"
          >
            Phone number
          </label>
          <div
            className={`flex items-stretch rounded-lg border bg-white transition-colors ${
              phoneError
                ? "border-red-400 ring-1 ring-red-400/30"
                : "border-[#d1d5db] focus-within:border-[#94a3b8]"
            }`}
          >
            <div className="relative shrink-0">
              <button
                type="button"
                onClick={onToggleCountryDropdown}
                className="flex h-full items-center gap-2 rounded-l-lg py-3.5 pl-3.5 pr-3 text-[#0f172a] transition-colors hover:bg-slate-50/90"
                aria-expanded={showCountryDropdown}
                aria-haspopup="listbox"
              >
                <CountryFlag iso2={selectedCountry.iso2} />
                <span className="text-[15px] font-semibold tabular-nums tracking-tight">
                  {selectedCountry.code}
                </span>
              </button>
              {showCountryDropdown && (
                <div
                  className="scrollbar-minimal absolute top-full left-0 z-20 mt-1 max-h-64 w-52 overflow-y-auto rounded-xl border border-[#e5e7eb] bg-white shadow-lg"
                  role="listbox"
                >
                  {countryCodes.map((country) => (
                    <button
                      key={country.code}
                      type="button"
                      role="option"
                      onClick={() => onSelectCountry(country)}
                      className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors text-left"
                    >
                      <CountryFlag iso2={country.iso2} />
                      <span className="text-gray-700 text-sm">{country.country}</span>
                      <span className="text-gray-400 text-sm ml-auto tabular-nums">
                        {country.code}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <input
              id="phone-input"
              type="tel"
              inputMode="numeric"
              autoComplete="tel-national"
              placeholder="1234 567891"
              value={formatPhoneDisplay(phoneNumber)}
              onChange={(e) => {
                const v = e.target.value.replace(/\D/g, "").slice(0, 10);
                onPhoneDigitsChange(v);
              }}
              className="min-w-0 flex-1 rounded-r-lg border-0 border-l border-[#e5e7eb] bg-transparent py-3.5 pr-4 text-[15px] text-[#0f172a] outline-none placeholder:text-[#94a3b8]"
              maxLength={12}
              aria-invalid={!!phoneError}
              aria-describedby={phoneError ? "phone-err" : undefined}
            />
          </div>
          {phoneError && (
            <p id="phone-err" className="mt-1.5 text-sm text-red-500" role="alert">
              {phoneError}
            </p>
          )}
        </div>

        <p className="text-xs leading-relaxed text-[#64748b]">
          By tapping Get started, you agree to the{" "}
          <a
            href="/terms"
            className="font-semibold text-[#334155] hover:text-[#0f172a]"
          >
            Terms &amp; Conditions
          </a>
        </p>
      </div>
    </div>
  );
}
