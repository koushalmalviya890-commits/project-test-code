// app/api/facility/price/route.ts
import { NextRequest, NextResponse } from "next/server";
import { calculateFinalPrice } from "../../../../../lib/calculatefinalPriceAffiliateUser";
import { connectToDatabase } from '@/lib/mongodb';
import { authOptions } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    
    const { facilityId, basePrice } = await req.json();

     const result = await calculateFinalPrice({
      facilityId,
      basePrice,
    });

    return NextResponse.json({ success: true, data: result });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
