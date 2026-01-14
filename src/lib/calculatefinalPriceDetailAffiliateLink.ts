
import { connectToDatabase } from "@/lib/mongodb";
export async function calculateFinalPriceDetail({
  facilityId,
  rentalPlan,
  unitCount,
  bookingSeats,
}: {
  facilityId: string;
  rentalPlan: string;
  unitCount: number;
  bookingSeats: number;
}) {
  try {
    const { db } = await connectToDatabase();
    const { ObjectId } = require("mongodb");

    // Fetch facility
    const facility = await db.collection("Facilities").findOne({ _id: new ObjectId(facilityId) });
   // console.log(facility, `for getting correct facilities`);
    if (!facility) throw new Error("Facility not found");

    // Find rental plan
    const plan = facility.details?.rentalPlans?.find(
      (p: { name: string }) =>
        p.name.toLowerCase().trim() === rentalPlan.toLowerCase().trim()
    );
    if (!plan) throw new Error("Rental plan not found");

    // Calculate basePrice with unitCount and bookingSeats
    const basePrice = plan.price * unitCount * bookingSeats;
   // console.log("🟡 basePrice:", basePrice);

    // Fetch service provider
    const serviceProvider = await db.collection("Service Provider").findOne({
      userId: facility.serviceProviderId,
    });
    if (!serviceProvider) throw new Error("Service Provider not found");

    // Check for GST number
    const hasGST = !!serviceProvider.gstNumber;

    // Apply pricing logic for new user
    const rate = 0.07;
   // console.log("💰 Rate applied:", rate);

    const fixedFee = basePrice * rate;
   // console.log("➕ additionalFee:", fixedFee);

    let totalBeforeGST = basePrice + fixedFee;
    let gstAmount = 0;
    let finalPrice = totalBeforeGST;

    if (hasGST) {
      gstAmount = totalBeforeGST * 0.18;
      finalPrice = totalBeforeGST + gstAmount;
    } else {
      finalPrice = basePrice + fixedFee;
    }


   // console.log("🧾 gstAmount:", gstAmount);
   // console.log("✅ Final price:", finalPrice);

    return {
      basePrice,
      fixedFee,
      gstAmount,
      finalPrice: Math.round(finalPrice),
      isExistingUser: false, // Always assume new user
      hasGST,
      distanceInKm: 0, // Distance not used for new users
      bookingSeats,
    };
  } catch (error) {
    console.error("Error calculating final price detail:", error);
    throw error;
  }
}
