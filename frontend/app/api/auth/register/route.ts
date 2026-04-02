import { NextResponse } from "next/server";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://nexlearn.noviindusdemosites.in";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const mobile = formData.get("mobile") as string;
    const firstName = formData.get("firstName") as string;
    const lastName = formData.get("lastName") as string;
    const email = formData.get("email") as string;
    const qualification = formData.get("qualification") as string;
    const profile_image = formData.get("profile_image") as File | null;

    const apiFormData = new FormData();
    apiFormData.append("mobile", mobile);
    apiFormData.append("name", `${firstName} ${lastName}`.trim());
    apiFormData.append("email", email);
    apiFormData.append("qualification", qualification || "");
    if (profile_image) {
      apiFormData.append("profile_image", profile_image);
    }

    const response = await fetch(`${BASE_URL}/auth/create-profile`, {
      method: "POST",
      body: apiFormData,
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Create profile error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create profile" },
      { status: 500 }
    );
  }
}
