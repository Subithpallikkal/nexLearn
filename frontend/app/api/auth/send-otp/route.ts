import { NextResponse } from "next/server";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://nexlearn.noviindusdemosites.in";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const mobile = formData.get("mobile") as string;

    console.log("📤 Forwarding to:", `${BASE_URL}/auth/send-otp`);
    console.log("📤 Payload:", { mobile });

    if (!mobile) {
      return NextResponse.json(
        { success: false, message: "Mobile number is required" },
        { status: 400 }
      );
    }

    const apiFormData = new FormData();
    apiFormData.append("mobile", mobile);

    const response = await fetch(`${BASE_URL}/auth/send-otp`, {
      method: "POST",
      body: apiFormData,
    });

    const data = await response.json();
    console.log("📥 API Response:", data);
    
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Send OTP error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to send OTP" },
      { status: 500 }
    );
  }
}
