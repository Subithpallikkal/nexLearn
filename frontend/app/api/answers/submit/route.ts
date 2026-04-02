import { NextResponse } from "next/server";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://nexlearn.noviindusdemosites.in";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { answers, token } = body;

    if (!answers) {
      return NextResponse.json(
        { success: false, message: "Answers are required" },
        { status: 400 }
      );
    }

    const authToken = token || request.headers.get("authorization")?.replace("Bearer ", "");

    if (!authToken) {
      return NextResponse.json(
        { success: false, message: "Authorization token is required" },
        { status: 401 }
      );
    }

    const response = await fetch(`${BASE_URL}/answers/submit`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({ answers }),
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Submit answers error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to submit answers" },
      { status: 500 }
    );
  }
}
