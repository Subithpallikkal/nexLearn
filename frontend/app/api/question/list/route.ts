import { NextResponse } from "next/server";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://nexlearn.noviindusdemosites.in";

export async function GET(request: Request) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Authorization token is required" },
        { status: 401 }
      );
    }

    const response = await fetch(`${BASE_URL}/question/list`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const raw = await response.text();
    let data: unknown;
    try {
      data = raw ? JSON.parse(raw) : {};
    } catch {
      data = {
        success: false,
        message:
          raw.trim().slice(0, 300) ||
          `Upstream returned ${response.status} with non-JSON body`,
      };
    }

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("List questions error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch questions" },
      { status: 500 }
    );
  }
}
