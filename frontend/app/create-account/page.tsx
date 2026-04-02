"use client";

import { useState } from "react";
import { useAppDispatch, useAppSelector } from "@/app/store/hooks";
import {
  setStep,
  setPhoneNumber,
  setOtp,
  setUserDetails,
  setLoading,
  setError,
} from "@/app/store/authSlice";
import ProgressSteps from "@/app/components/ui/ProgressSteps";
import Input from "@/app/components/ui/Input";
import Button from "@/app/components/ui/Button";
import OtpInput from "@/app/components/ui/OtpInput";
import { Phone, Mail, User, ArrowLeft, ArrowRight, ChevronDown } from "lucide-react";
import axios from "axios";

const steps = [
  { id: 1, label: "Phone" },
  { id: 2, label: "Verify" },
  { id: 3, label: "Details" },
];

const countryCodes = [
  { code: "+91", country: "India", flag: "🇮🇳" },
  { code: "+1", country: "USA", flag: "🇺🇸" },
  { code: "+44", country: "UK", flag: "🇬🇧" },
  { code: "+61", country: "Australia", flag: "🇦🇺" },
  { code: "+971", country: "UAE", flag: "🇦🇪" },
  { code: "+966", country: "Saudi Arabia", flag: "🇸🇦" },
  { code: "+65", country: "Singapore", flag: "🇸🇬" },
  { code: "+60", country: "Malaysia", flag: "🇲🇾" },
];

export default function CreateAccountPage() {
  const dispatch = useAppDispatch();
  const { step, phoneNumber, otp, userDetails, isLoading, error } =
    useAppSelector((state) => state.auth);

  const [phoneError, setPhoneError] = useState("");
  const [otpError, setOtpError] = useState("");
  const [detailsError, setDetailsError] = useState<Record<string, string>>({});
  const [resendTimer, setResendTimer] = useState(0);
  const [selectedCountry, setSelectedCountry] = useState(countryCodes[0]);
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);

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
    } catch (err) {
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
      await axios.post("/api/auth/verify-otp", {
        mobile: `${selectedCountry.code}${phoneNumber}`,
        otp,
      });
      dispatch(setStep(3));
    } catch (err) {
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
    } catch (err) {
      setOtpError("Failed to resend OTP. Please try again.");
    }
  };

  const validateDetails = (): boolean => {
    const errors: Record<string, string> = {};

    if (!userDetails.firstName.trim()) {
      errors.firstName = "First name is required";
    }
    if (!userDetails.lastName.trim()) {
      errors.lastName = "Last name is required";
    }
    if (!userDetails.email.trim()) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userDetails.email)) {
      errors.email = "Please enter a valid email";
    }

    setDetailsError(errors);
    return Object.keys(errors).length === 0;
  };

  const handleRegister = async () => {
    if (!validateDetails()) return;

    dispatch(setLoading(true));
    try {
      const formData = new FormData();
      formData.append("mobile", `+91${phoneNumber}`);
      formData.append("firstName", userDetails.firstName);
      formData.append("lastName", userDetails.lastName);
      formData.append("email", userDetails.email);
      await axios.post("/api/auth/register", formData);
      alert("Account created successfully!");
    } catch (err) {
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

  return (
    <main className="min-h-screen flex flex-col lg:flex-row bg-[url('/dark-nature-blue-abstract-creative-background.svg')] bg-cover bg-center">
      <div className="flex-1 hidden lg:flex items-center justify-center p-8">
          <div className="text-center space-y-6">
            <img 
              src="/namelogo.svg" 
              alt="Logo" 
              className="w-64 mx-auto"
            />
            <img 
              src="/create_form_sticker.svg" 
              alt="Sticker" 
              className="w-80 mx-auto mt-8"
            />
          </div>
        </div>
      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-gray-900 text-center mb-2">
                Create Account
              </h1>
              <p className="text-gray-500 text-center text-sm">
                Join us to get started with your journey
              </p>
            </div>

            <div className="mb-8">
              <ProgressSteps steps={steps} currentStep={step} />
            </div>

            {error && (
              <div
                className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm"
                role="alert"
              >
                {error}
              </div>
            )}

            <div className="min-h-[280px]">
              {step === 1 && (
                <div className="space-y-6 animate-fadeIn">
                  <div className="text-center mb-6">
                    <h2 className="text-lg font-semibold text-gray-900">
                      Enter your phone number
                    </h2>
                    <p className="text-gray-500 text-sm mt-1">
                      We will send you a verification code
                    </p>
                  </div>

                  <div className="relative">
                    <div className="flex">
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                          className="flex items-center gap-2 px-4 py-3 bg-gray-50 border border-r-0 border-gray-200 rounded-l-xl text-gray-700 hover:bg-gray-100 transition-colors"
                        >
                          <span>{selectedCountry.flag}</span>
                          <span className="font-medium">{selectedCountry.code}</span>
                          <ChevronDown className="w-4 h-4" />
                        </button>
                        {showCountryDropdown && (
                          <div className="absolute z-10 top-full left-0 mt-1 w-48 bg-white border border-gray-200 rounded-xl shadow-lg max-h-64 overflow-y-auto">
                            {countryCodes.map((country) => (
                              <button
                                key={country.code}
                                type="button"
                                onClick={() => {
                                  setSelectedCountry(country);
                                  setShowCountryDropdown(false);
                                }}
                                className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-50 transition-colors"
                              >
                                <span>{country.flag}</span>
                                <span className="text-gray-700">{country.country}</span>
                                <span className="text-gray-400 ml-auto">{country.code}</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                      <Input
                        type="tel"
                        placeholder="Enter phone number"
                        value={phoneNumber}
                        onChange={(e) => {
                          dispatch(setPhoneNumber(e.target.value));
                          setPhoneError("");
                        }}
                        leftIcon={<Phone className="w-5 h-5" />}
                        error={phoneError}
                        maxLength={10}
                        aria-label="Phone number"
                        className="rounded-l-none"
                      />
                    </div>
                  </div>

                  <Button
                    onClick={handleSendOtp}
                    isLoading={isLoading}
                    className="w-full"
                    size="lg"
                    rightIcon={<ArrowRight className="w-5 h-5" />}
                  >
                    Send OTP
                  </Button>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-6 animate-fadeIn">
                  <div className="text-center mb-6">
                    <h2 className="text-lg font-semibold text-gray-900">
                      Verify your phone number
                    </h2>
                    <p className="text-gray-500 text-sm mt-1">
                      Enter the 4-digit code sent to{" "}
                      <span className="font-medium text-gray-700">
                        {selectedCountry.code} {phoneNumber}
                      </span>
                    </p>
                  </div>

                  <OtpInput
                    length={6}
                    value={otp}
                    onChange={(value) => {
                      dispatch(setOtp(value));
                      setOtpError("");
                    }}
                    error={otpError}
                    disabled={isLoading}
                  />

                  <div className="text-center">
                    <button
                      onClick={handleResendOtp}
                      disabled={resendTimer > 0}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium disabled:text-gray-400 disabled:cursor-not-allowed"
                    >
                      {resendTimer > 0
                        ? `Resend OTP in ${resendTimer}s`
                        : "Didn't receive code? Resend"}
                    </button>
                  </div>

                  <div className="flex gap-3">
                    <Button
                      onClick={goBack}
                      variant="outline"
                      className="flex-1"
                      leftIcon={<ArrowLeft className="w-5 h-5" />}
                    >
                      Back
                    </Button>
                    <Button
                      onClick={handleVerifyOtp}
                      isLoading={isLoading}
                      className="flex-1"
                      rightIcon={<ArrowRight className="w-5 h-5" />}
                    >
                      Verify
                    </Button>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-6 animate-fadeIn">
                  <div className="text-center mb-6">
                    <h2 className="text-lg font-semibold text-gray-900">
                      Add your details
                    </h2>
                    <p className="text-gray-500 text-sm mt-1">
                      Complete your profile information
                    </p>
                  </div>

                  <Input
                    type="text"
                    placeholder="First name"
                    value={userDetails.firstName}
                    onChange={(e) => {
                      dispatch(
                        setUserDetails({ firstName: e.target.value })
                      );
                      setDetailsError((prev) => ({
                        ...prev,
                        firstName: "",
                      }));
                    }}
                    leftIcon={<User className="w-5 h-5" />}
                    error={detailsError.firstName}
                    aria-label="First name"
                  />

                  <Input
                    type="text"
                    placeholder="Last name"
                    value={userDetails.lastName}
                    onChange={(e) => {
                      dispatch(setUserDetails({ lastName: e.target.value }));
                      setDetailsError((prev) => ({
                        ...prev,
                        lastName: "",
                      }));
                    }}
                    leftIcon={<User className="w-5 h-5" />}
                    error={detailsError.lastName}
                    aria-label="Last name"
                  />

                  <Input
                    type="email"
                    placeholder="Email address"
                    value={userDetails.email}
                    onChange={(e) => {
                      dispatch(setUserDetails({ email: e.target.value }));
                      setDetailsError((prev) => ({ ...prev, email: "" }));
                    }}
                    leftIcon={<Mail className="w-5 h-5" />}
                    error={detailsError.email}
                    aria-label="Email address"
                  />

                  <div className="flex gap-3">
                    <Button
                      onClick={goBack}
                      variant="outline"
                      className="flex-1"
                      leftIcon={<ArrowLeft className="w-5 h-5" />}
                    >
                      Back
                    </Button>
                    <Button
                      onClick={handleRegister}
                      isLoading={isLoading}
                      className="flex-1"
                      rightIcon={<ArrowRight className="w-5 h-5" />}
                    >
                      Create Account
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <p className="text-center text-gray-500 text-sm mt-6">
            Already have an account?{" "}
            <a
              href="/login"
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Sign in
            </a>
          </p>
        </div>
      </div>
    </main>
  );
}
