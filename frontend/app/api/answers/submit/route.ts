import { NextResponse } from "next/server";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://nexlearn.noviindusdemosites.in";

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get("content-type") || "";
    let answers: unknown;
    let tokenFromBody: string | undefined;

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const answersRaw = formData.get("answers");
      if (typeof answersRaw !== "string") {
        return NextResponse.json(
          { success: false, message: "answers must be a JSON string in form data" },
          { status: 400 }
        );
      }
      try {
        answers = JSON.parse(answersRaw);
      } catch {
        return NextResponse.json(
          { success: false, message: "answers must be valid JSON" },
          { status: 400 }
        );
      }
    } else {
      const body = await request.json();
      answers = body.answers;
      tokenFromBody = body.token;
    }

    if (!answers || !Array.isArray(answers)) {
      return NextResponse.json(
        { success: false, message: "answers array is required" },
        { status: 400 }
      );
    }

    const authToken =
      tokenFromBody ||
      request.headers.get("authorization")?.replace("Bearer ", "");

    if (!authToken) {
      return NextResponse.json(
        { success: false, message: "Authorization token is required" },
        { status: 401 }
      );
    }

    const apiFormData = new FormData();
    apiFormData.append("answers", JSON.stringify(answers));

    const response = await fetch(`${BASE_URL}/answers/submit`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
      body: apiFormData,
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
