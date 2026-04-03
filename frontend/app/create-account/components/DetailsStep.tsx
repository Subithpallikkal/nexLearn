import type { RefObject } from "react";
import { Camera, Plus } from "lucide-react";
import { clsx } from "clsx";
import type { UserDetails } from "@/app/store/authSlice";

type Props = {
  userDetails: UserDetails;
  detailsError: Record<string, string>;
  profilePreview: string | null;
  profileInputRef: RefObject<HTMLInputElement | null>;
  onProfileFileChange: (file: File | null) => void;
  onFirstNameChange: (value: string) => void;
  onEmailChange: (value: string) => void;
  onQualificationChange: (value: string) => void;
  onBack: () => void;
};

export default function DetailsStep({
  userDetails,
  detailsError,
  profilePreview,
  profileInputRef,
  onProfileFileChange,
  onFirstNameChange,
  onEmailChange,
  onQualificationChange,
  onBack,
}: Props) {
  return (
    <div className="flex min-h-0 flex-1 flex-col md:h-full animate-fadeIn">
      <div className="flex flex-col gap-5 md:gap-6">
        <h2 className="font-sans text-2xl font-semibold leading-8 tracking-normal text-[#0f172a]">
          Add Your Details
        </h2>

        <div>
          <input
            ref={profileInputRef}
            type="file"
            accept="image/*"
            className="sr-only"
            aria-label="Profile picture"
            onChange={(e) => {
              const f = e.target.files?.[0] ?? null;
              onProfileFileChange(f);
            }}
          />
          <button
            type="button"
            onClick={() => profileInputRef.current?.click()}
            className={clsx(
              "flex min-h-30 w-full flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed bg-slate-50/50 px-4 py-6 transition-colors hover:border-[#94a3b8] hover:bg-slate-50",
              detailsError.profile
                ? "border-red-400"
                : profilePreview
                  ? "border-[#cbd5e1]"
                  : "border-[#d1d5db]"
            )}
          >
            {profilePreview ? (
              <img
                src={profilePreview}
                alt=""
                className="max-h-24 max-w-full rounded-md object-cover"
              />
            ) : (
              <>
                <span className="relative flex h-12 w-12 items-center justify-center rounded-full bg-slate-200/80 text-[#64748b]">
                  <Camera className="h-6 w-6" strokeWidth={1.75} />
                  <span className="absolute -right-0.5 -bottom-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-[#1e2d3b] text-white">
                    <Plus className="h-3 w-3" strokeWidth={3} />
                  </span>
                </span>
                <span className="text-sm text-[#94a3b8]">
                  Add Your Profile picture
                </span>
              </>
            )}
          </button>
          {detailsError.profile && (
            <p className="mt-1.5 text-sm text-red-500" role="alert">
              {detailsError.profile}
            </p>
          )}
        </div>

        <div className="relative pt-2">
          <label
            htmlFor="details-name"
            className="absolute left-3 top-2.75 z-10 -translate-y-1/2 bg-white px-1 text-[11px] font-medium text-[#64748b]"
          >
            Name<span className="text-red-500">*</span>
          </label>
          <input
            id="details-name"
            type="text"
            autoComplete="name"
            placeholder="Enter your Full Name"
            value={userDetails.firstName}
            onChange={(e) => onFirstNameChange(e.target.value)}
            className={clsx(
              "w-full rounded-lg border bg-white py-3.5 px-4 text-[15px] text-[#0f172a] outline-none transition-colors placeholder:text-[#94a3b8]",
              detailsError.firstName
                ? "border-red-400 ring-1 ring-red-400/30"
                : "border-[#d1d5db] focus:border-[#94a3b8] focus:ring-2 focus:ring-slate-900/10"
            )}
            aria-invalid={!!detailsError.firstName}
          />
          {detailsError.firstName && (
            <p className="mt-1.5 text-sm text-red-500" role="alert">
              {detailsError.firstName}
            </p>
          )}
        </div>

        <div className="relative pt-2">
          <label
            htmlFor="details-email"
            className="absolute left-3 top-2.75 z-10 -translate-y-1/2 bg-white px-1 text-[11px] font-medium text-[#64748b]"
          >
            Email
          </label>
          <input
            id="details-email"
            type="email"
            autoComplete="email"
            placeholder="Enter your Email Address"
            value={userDetails.email}
            onChange={(e) => onEmailChange(e.target.value)}
            className={clsx(
              "w-full rounded-lg border bg-white py-3.5 px-4 text-[15px] text-[#0f172a] outline-none transition-colors placeholder:text-[#94a3b8]",
              detailsError.email
                ? "border-red-400 ring-1 ring-red-400/30"
                : "border-[#d1d5db] focus:border-[#94a3b8] focus:ring-2 focus:ring-slate-900/10"
            )}
            aria-invalid={!!detailsError.email}
          />
          {detailsError.email && (
            <p className="mt-1.5 text-sm text-red-500" role="alert">
              {detailsError.email}
            </p>
          )}
        </div>

        <div className="relative pt-2">
          <label
            htmlFor="details-qualification"
            className="absolute left-3 top-2.75 z-10 -translate-y-1/2 bg-white px-1 text-[11px] font-medium text-[#64748b]"
          >
            Your qualification<span className="text-red-500">*</span>
          </label>
          <input
            id="details-qualification"
            type="text"
            autoComplete="organization-title"
            placeholder="e.g. B.Tech, 12th pass"
            value={userDetails.qualification}
            onChange={(e) => onQualificationChange(e.target.value)}
            className={clsx(
              "w-full rounded-lg border bg-white py-3.5 px-4 text-[15px] text-[#0f172a] outline-none transition-colors placeholder:text-[#94a3b8]",
              detailsError.qualification
                ? "border-red-400 ring-1 ring-red-400/30"
                : "border-[#d1d5db] focus:border-[#94a3b8] focus:ring-2 focus:ring-slate-900/10"
            )}
            aria-invalid={!!detailsError.qualification}
          />
          {detailsError.qualification && (
            <p className="mt-1.5 text-sm text-red-500" role="alert">
              {detailsError.qualification}
            </p>
          )}
        </div>

        <button
          type="button"
          onClick={onBack}
          className="self-start text-sm text-[#64748b] hover:text-[#0f172a]"
        >
          Back
        </button>
      </div>
    </div>
  );
}
