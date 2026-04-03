"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/app/store/hooks";
import {
  setStep,
  setPhoneNumber,
  setOtp,
  setUserDetails,
  setLoading,
  setError,
} from "@/app/store/authSlice";
import axios from "axios";
import { authService } from "@/lib/auth";
import { countryCodes, type CountryOption } from "./constants";
import CreateAccountBranding from "./components/CreateAccountBranding";
import CreateAccountFooter from "./components/CreateAccountFooter";
import DetailsStep from "./components/DetailsStep";
import OtpStep from "./components/OtpStep";
import PhoneStep from "./components/PhoneStep";

export default function CreateAccountPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { step, phoneNumber, otp, userDetails, isLoading, error } =
    useAppSelector((state) => state.auth);

  const [phoneError, setPhoneError] = useState("");
  const [otpError, setOtpError] = useState("");
  const [detailsError, setDetailsError] = useState<Record<string, string>>({});
  const [resendTimer, setResendTimer] = useState(0);
  const [selectedCountry, setSelectedCountry] = useState<CountryOption>(
    countryCodes[0]
  );
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [profileFile, setProfileFile] = useState<File | null>(null);
  const [profilePreview, setProfilePreview] = useState<string | null>(null);
  const profileInputRef = useRef<HTMLInputElement>(null);
  const [authGateReady, setAuthGateReady] = useState(false);

  const validatePhone = (phone: string): boolean => {
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phone) {
      setPhoneError("Phone number is required");
      return false;
    }
    if (!phoneRegex.test(phone)) {
      setPhoneError("Please enter a valid phone number");
      return false;
    }
    setPhoneError("");
    return true;
  };

  const handleSendOtp = async () => {
    if (!validatePhone(phoneNumber)) return;

    dispatch(setLoading(true));
    try {
      const formData = new FormData();
      formData.append("mobile", `${selectedCountry.code}${phoneNumber}`);
      await axios.post("/api/auth/send-otp", formData);
      dispatch(setStep(2));
      setResendTimer(30);
    } catch {
      dispatch(setError("Failed to send OTP. Please try again."));
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleVerifyOtp = async () => {
    if (otp.length !== 6) {
      setOtpError("Please enter a valid 6-digit OTP");
      return;
    }
    setOtpError("");

    dispatch(setLoading(true));
    try {
      const fd = new FormData();
      fd.append("mobile", `${selectedCountry.code}${phoneNumber}`);
      fd.append("otp", otp);
      const { data } = await axios.post("/api/auth/verify-otp", fd);
      if (data.success === false) {
        setOtpError(data.message || "Invalid OTP. Please try again.");
        return;
      }
      if (data.login && data.access_token) {
        authService.setTokens({
          accessToken: data.access_token,
          refreshToken: data.refresh_token ?? "",
        });
        router.push("/exam/instructions");
        return;
      }
      dispatch(setStep(3));
    } catch {
      setOtpError("Invalid OTP. Please try again.");
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleResendOtp = async () => {
    if (resendTimer > 0) return;
    try {
      const formData = new FormData();
      formData.append("mobile", `${selectedCountry.code}${phoneNumber}`);
      await axios.post("/api/auth/send-otp", formData);
      setResendTimer(30);
      setOtpError("");
    } catch {
      setOtpError("Failed to resend OTP. Please try again.");
    }
  };

  const validateDetails = (): boolean => {
    const errors: Record<string, string> = {};

    if (!userDetails.firstName.trim()) {
      errors.firstName = "Name is required";
    }
    if (!userDetails.email.trim()) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userDetails.email)) {
      errors.email = "Please enter a valid email";
    }
    if (!userDetails.qualification.trim()) {
      errors.qualification = "Qualification is required";
    }
    if (!profileFile) {
      errors.profile = "Profile picture is required";
    }

    setDetailsError(errors);
    return Object.keys(errors).length === 0;
  };

  const handleRegister = async () => {
    if (!validateDetails()) return;
    if (!profileFile) return;

    dispatch(setLoading(true));
    try {
      const formData = new FormData();
      formData.append("mobile", `${selectedCountry.code}${phoneNumber}`);
      const nameParts = userDetails.firstName
        .trim()
        .split(/\s+/)
        .filter(Boolean);
      const firstName = nameParts[0] || "";
      const lastName =
        nameParts.slice(1).join(" ") || firstName || "User";
      formData.append("firstName", firstName);
      formData.append("lastName", lastName);
      formData.append("email", userDetails.email.trim());
      formData.append("qualification", userDetails.qualification.trim());
      formData.append("profile_image", profileFile);
      const { data } = await axios.post("/api/auth/register", formData);
      if (data.success === false) {
        dispatch(
          setError(data.message || "Failed to create account. Please try again.")
        );
        return;
      }
      if (data.access_token) {
        authService.setTokens({
          accessToken: data.access_token,
          refreshToken: data.refresh_token ?? "",
        });
      }
      router.push("/exam/instructions");
    } catch {
      dispatch(setError("Failed to create account. Please try again."));
    } finally {
      dispatch(setLoading(false));
    }
  };

  const goBack = () => {
    if (step > 1) {
      dispatch(setStep(step - 1));
      setOtpError("");
    }
  };

  useEffect(() => {
    if (authService.getAccessToken()) {
      router.replace("/exam/instructions");
      return;
    }
    setAuthGateReady(true);
  }, [router]);

  useEffect(() => {
    if (resendTimer <= 0) return;
    const id = setTimeout(() => setResendTimer((s) => s - 1), 1000);
    return () => clearTimeout(id);
  }, [resendTimer]);

  useEffect(() => {
    return () => {
      if (profilePreview) URL.revokeObjectURL(profilePreview);
    };
  }, [profilePreview]);

  if (!authGateReady) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-[#050508] text-sm text-slate-400">
        Loading…
      </div>
    );
  }

  return (
    <main className="relative flex min-h-dvh w-full flex-col items-center justify-center bg-[#050508] px-4 py-8 font-sans sm:py-10">
      <div
        className="pointer-events-none fixed inset-0 z-0 bg-[url('/dark-nature-blue-abstract-creative-background.svg')] bg-cover bg-center bg-no-repeat opacity-[0.38]"
        aria-hidden
      />
      <div
        className="scrollbar-minimal-on-dark relative z-20 flex w-full max-w-216.5 flex-col overflow-x-hidden overflow-y-auto rounded-2xl border border-slate-900/40 bg-linear-to-br from-[#1e2d3b] via-[#1a3d4a] to-[#0f1a24] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.35)] md:flex-row md:h-125.25 md:overflow-hidden max-md:max-h-[90vh]"
        role="dialog"
        aria-label="Create account"
      >
        <CreateAccountBranding />

        <div className="flex min-h-0 min-w-0 flex-1 flex-col bg-transparent p-1.5 sm:p-2 md:min-h-0 md:flex-none md:basis-[51%] md:py-2 md:pr-2 md:pl-1.5">
          <div className="flex min-h-0 min-w-0 flex-1 flex-col rounded-xl border border-slate-200/90 bg-white shadow-sm">
            <div className="scrollbar-minimal flex min-h-0 flex-1 flex-col overflow-y-auto px-5 pt-6 pb-4 sm:px-6 md:px-7 md:pt-8">
              {error && (
                <div
                  className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm"
                  role="alert"
                >
                  {error}
                </div>
              )}

              <div className="flex min-h-0 flex-1 flex-col md:min-h-0">
                {step === 1 && (
                  <PhoneStep
                    phoneNumber={phoneNumber}
                    phoneError={phoneError}
                    selectedCountry={selectedCountry}
                    showCountryDropdown={showCountryDropdown}
                    onPhoneDigitsChange={(v) => {
                      dispatch(setPhoneNumber(v));
                      setPhoneError("");
                    }}
                    onToggleCountryDropdown={() =>
                      setShowCountryDropdown((o) => !o)
                    }
                    onSelectCountry={(c) => {
                      setSelectedCountry(c);
                      setShowCountryDropdown(false);
                    }}
                  />
                )}

                {step === 2 && (
                  <OtpStep
                    otp={otp}
                    otpError={otpError}
                    isLoading={isLoading}
                    selectedCountry={selectedCountry}
                    phoneNumber={phoneNumber}
                    resendTimer={resendTimer}
                    onOtpDigitsChange={(v) => {
                      dispatch(setOtp(v));
                      setOtpError("");
                    }}
                    onResend={handleResendOtp}
                    onBack={goBack}
                  />
                )}

                {step === 3 && (
                  <DetailsStep
                    userDetails={userDetails}
                    detailsError={detailsError}
                    profilePreview={profilePreview}
                    profileInputRef={profileInputRef}
                    onProfileFileChange={(f) => {
                      if (!f) {
                        setProfileFile(null);
                        setProfilePreview(null);
                        return;
                      }
                      setProfileFile(f);
                      setProfilePreview(URL.createObjectURL(f));
                      setDetailsError((prev) => ({ ...prev, profile: "" }));
                    }}
                    onFirstNameChange={(value) => {
                      dispatch(setUserDetails({ firstName: value }));
                      setDetailsError((prev) => ({ ...prev, firstName: "" }));
                    }}
                    onEmailChange={(value) => {
                      dispatch(setUserDetails({ email: value }));
                      setDetailsError((prev) => ({ ...prev, email: "" }));
                    }}
                    onQualificationChange={(value) => {
                      dispatch(setUserDetails({ qualification: value }));
                      setDetailsError((prev) => ({
                        ...prev,
                        qualification: "",
                      }));
                    }}
                    onBack={goBack}
                  />
                )}
              </div>
            </div>

            <CreateAccountFooter
              step={step}
              isLoading={isLoading}
              onSendOtp={handleSendOtp}
              onVerifyOtp={handleVerifyOtp}
              onRegister={handleRegister}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
