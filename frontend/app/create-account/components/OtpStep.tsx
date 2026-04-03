import { clsx } from "clsx";
import type { CountryOption } from "../constants";
import { formatOtpDisplay, formatPhoneDisplay } from "../formatters";

type Props = {
  otp: string;
  otpError: string;
  isLoading: boolean;
  selectedCountry: CountryOption;
  phoneNumber: string;
  resendTimer: number;
  onOtpDigitsChange: (digits: string) => void;
  onResend: () => void;
  onBack: () => void;
};

export default function OtpStep({
  otp,
  otpError,
  isLoading,
  selectedCountry,
  phoneNumber,
  resendTimer,
  onOtpDigitsChange,
  onResend,
  onBack,
}: Props) {
  return (
    <div className="flex min-h-0 flex-1 flex-col md:h-full animate-fadeIn">
      <div className="flex flex-col gap-5 md:gap-6">
        <div className="space-y-1.5">
          <h2 className="font-sans text-2xl font-semibold leading-8 tracking-normal text-[#0f172a]">
            Enter the code we texted you
          </h2>
          <p className="text-sm leading-relaxed text-[#64748b]">
            We&apos;ve sent an SMS to{" "}
            <span className="font-medium text-[#334155]">
              {selectedCountry.code} {formatPhoneDisplay(phoneNumber)}
            </span>
          </p>
        </div>

        <div className="relative pt-2">
          <label
            htmlFor="sms-code-input"
            className="absolute left-3 top-2.75 z-10 -translate-y-1/2 bg-white px-1 text-[11px] font-medium text-[#64748b]"
          >
            SMS code
          </label>
          <input
            id="sms-code-input"
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            placeholder="123 456"
            value={formatOtpDisplay(otp)}
            onChange={(e) => {
              const v = e.target.value.replace(/\D/g, "").slice(0, 6);
              onOtpDigitsChange(v);
            }}
            maxLength={7}
            disabled={isLoading}
            className={clsx(
              "w-full rounded-lg border bg-white py-3.5 px-4 text-left text-lg font-semibold tracking-[0.15em] text-[#0f172a] outline-none transition-colors placeholder:font-normal placeholder:tracking-normal placeholder:text-[#94a3b8]",
              otpError
                ? "border-red-400 ring-1 ring-red-400/30"
                : "border-[#d1d5db] focus:border-[#94a3b8] focus:ring-2 focus:ring-slate-900/10"
            )}
            aria-invalid={!!otpError}
            aria-describedby="otp-helper-text"
          />
          {otpError && (
            <p className="mt-1.5 text-sm text-red-500" role="alert">
              {otpError}
            </p>
          )}
        </div>

        <p
          id="otp-helper-text"
          className="text-xs leading-relaxed text-[#64748b]"
        >
          Your 6 digit code is on its way. This can sometimes take a few moments
          to arrive.
        </p>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            onClick={onResend}
            disabled={resendTimer > 0}
            className="text-left text-sm font-semibold text-[#0f172a] underline underline-offset-2 decoration-[#0f172a] hover:text-[#1e2d3b] disabled:cursor-not-allowed disabled:font-medium disabled:text-[#94a3b8] disabled:no-underline"
          >
            {resendTimer > 0
              ? `Resend code in ${resendTimer}s`
              : "Resend code"}
          </button>
          <button
            type="button"
            onClick={onBack}
            className="text-left text-sm text-[#64748b] hover:text-[#0f172a] sm:text-right"
          >
            Back
          </button>
        </div>
      </div>
    </div>
  );
}
