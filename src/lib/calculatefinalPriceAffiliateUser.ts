import { connectToDatabase } from "@/lib/mongodb";
export async function calculateFinalPrice({
  facilityId,
  basePrice,
}: {
  facilityId: string;
  basePrice: number;
}) {
  try {
    const { db } = await connectToDatabase();
    // Fetch facility
    const { ObjectId } = require("mongodb");
    const facility = await db.collection("Facilities").findOne({ _id: new ObjectId(facilityId) });
   // console.log(facility , `for getting coorect facilities`)
    if (!facility) throw new Error("Facility not found");

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
    let gst = 0;
    let finalPrice = totalBeforeGST;

    if (hasGST) {
      gst = totalBeforeGST * 0.18;
      finalPrice = totalBeforeGST;
    } else {
      finalPrice = basePrice + fixedFee;
    }

    return {
      basePrice,
      fixedFee,
      hasGST,
      isExistingUser: false, // Always assume new user
      gst: hasGST ? Math.round(gst) : 0,
      finalPrice: Math.round(finalPrice),
      distanceInKm: 0, // Distance not used for new users
    };
  } catch (error) {
    console.error("Error calculating final price:", error);
    throw error;
  }
}
