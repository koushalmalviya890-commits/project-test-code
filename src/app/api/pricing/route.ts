// app/api/facility/price/route.ts
import { NextRequest, NextResponse } from "next/server";
import { calculateFinalPrice } from "@/lib/calculatefinalPrice";
import { getServerSession } from "next-auth";
import { connectToDatabase } from '@/lib/mongodb';
import { authOptions } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    const session = await getServerSession(authOptions)
    const { facilityId, basePrice } = await req.json();

    // if (!session?.user?.id) {
      // return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    // }

    // const result = await calculateFinalPrice({
    //   // sessionUserId: session.user.id,
    //   facilityId,
    //   basePrice,
    // });
     const result = await calculateFinalPrice({
      facilityId,
      basePrice,
    });

   // console.log("💵 Final Price Calculation Result:", result);

    return NextResponse.json({ success: true, data: result });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
