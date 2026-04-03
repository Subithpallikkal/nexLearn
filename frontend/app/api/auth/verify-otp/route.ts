import { NextResponse } from "next/server";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://nexlearn.noviindusdemosites.in";

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get("content-type") || "";
    let mobile: string;
    let otp: string;

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      mobile = (formData.get("mobile") as string) || "";
      otp = (formData.get("otp") as string) || "";
    } else {
      const body = await request.json();
      mobile = body.mobile ?? "";
      otp = body.otp ?? "";
    }

    if (!mobile || !otp) {
      return NextResponse.json(
        { success: false, message: "Mobile and OTP are required" },
        { status: 400 }
      );
    }

    const apiFormData = new FormData();
    apiFormData.append("mobile", mobile);
    apiFormData.append("otp", otp);

    const response = await fetch(`${BASE_URL}/auth/verify-otp`, {
      method: "POST",
      body: apiFormData,
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Verify OTP error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to verify OTP" },
      { status: 500 }
    );
  }
}
