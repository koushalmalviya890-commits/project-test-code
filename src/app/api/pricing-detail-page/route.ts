import { NextRequest, NextResponse } from "next/server";
import { calculateFinalPriceDetail } from "@/lib/calculatefinalPriceDetail";
import { getServerSession } from "next-auth";
import { connectToDatabase } from "@/lib/mongodb";
import { authOptions } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    // const session = await getServerSession(authOptions);
    const { facilityId, rentalPlan, unitCount, bookingSeats } = await req.json();

    // if (!session?.user?.id) {
    //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    // }

    if (!facilityId || !rentalPlan || !unitCount) {
      return NextResponse.json({ error: "Missing input fields" }, { status: 400 });
    }

    // const bookingSlots = 1; // Default booking slots to 1, can be adjusted based on your logic
    const result = await calculateFinalPriceDetail({
      facilityId,
      rentalPlan,
      unitCount,
      bookingSeats,
    });
    return NextResponse.json({ success: true, data: result });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
