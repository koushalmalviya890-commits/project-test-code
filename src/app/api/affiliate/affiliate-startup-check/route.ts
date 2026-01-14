import { NextRequest, NextResponse } from "next/server";
import { checkAffiliateEmail } from "@/lib/actions/auth";

export async function POST(req: NextRequest) {
 const requestData = await req.json();
    const { email } = requestData;

  try {
    const result = await checkAffiliateEmail(email);
    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    console.error("API error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}

