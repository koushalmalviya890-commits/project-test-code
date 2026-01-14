import { getFixedServiceFee } from "./pricing";
import { getDistanceInKm } from "@/lib/getDistance";
import Startup from "@/models/Startup";
import ServiceProvider from "@/models/ServiceProvider";
import Facility from "@/models/Facility";
import { ObjectId } from "mongodb";
import mongoose from "mongoose";
import { getServerSession } from "next-auth";
import { connectToDatabase } from "@/lib/mongodb";
import FacilityStartups from "@/models/FacilityStartups";
import { authOptions } from "@/lib/auth";

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
  const session = await getServerSession(authOptions);
 // console.log(bookingSeats, "bookingSeats in calculateFinalPriceDetail");

  const startup = await Startup.findOne({ userId: session?.user?.id });
  // if (!startup) throw new Error("Startup not found");
  if (!startup) {
    const isExistingUser = false;
    const facility = await Facility.findById(facilityId);
    if (!facility) throw new Error("Facility not found");

    const plan = facility.details?.rentalPlans?.find(
      (p: { name: string }) =>
        p.name.toLowerCase().trim() === rentalPlan.toLowerCase().trim()
    );
    if (!plan) throw new Error("Rental plan not found");
    // Multiply by unitCount * bookingSeats
    const basePrice = plan.price * unitCount * bookingSeats;

    const serviceProvider = await ServiceProvider.findOne({
      userId: facility.serviceProviderId,
    });
    if (!serviceProvider) throw new Error("Service Provider not found");

    const hasGST = !!serviceProvider.gstNumber;

    let finalPrice = 0;
    let gstAmount = 0;
    let fixedFee = 0;
    let distanceInKm = 0;

    const rate = 0.07;
   // console.log("💰 Rate applied:", rate);

   // console.log("🟡 basePrice:", basePrice);
    fixedFee = basePrice * rate;
   // console.log("➕ additionalFee (distance based):", fixedFee);

    if (hasGST) {
  gstAmount = basePrice * 0.18;  // ✅ GST only on base price
  finalPrice = basePrice + gstAmount + fixedFee;  // ✅ Add components separately
} else {
  gstAmount = 0;  // ✅ No GST if no registration
  finalPrice = basePrice + fixedFee;
}

   // console.log("🧾 gstAmount:", gstAmount);
   // console.log("✅ Final price:", finalPrice);

    return {
      basePrice,
      fixedFee,
      gstAmount,
      finalPrice: Math.round(finalPrice),
      isExistingUser,
      hasGST,
      distanceInKm: Math.round(distanceInKm),
      bookingSeats, // Include bookingSlots in the result
    };
  }

  // const isExistingUser = startup.isNewUser === false;

  const facility = await Facility.findById(facilityId);
  if (!facility) throw new Error("Facility not found");

  const plan = facility.details?.rentalPlans?.find(
    (p: { name: string }) =>
      p.name.toLowerCase().trim() === rentalPlan.toLowerCase().trim()
  );
  if (!plan) throw new Error("Rental plan not found");

  // Multiply by unitCount * bookingSeats
  const basePrice = plan.price * unitCount * bookingSeats;

  const serviceProvider = await ServiceProvider.findOne({
    userId: facility.serviceProviderId,
  });
  if (!serviceProvider) throw new Error("Service Provider not found");

 // console.log("siva", serviceProvider._id);
 // console.log("siva", startup._id);
  const data = await FacilityStartups.findOne({
    incubatorId: serviceProvider.userId,
    startupId: startup.userId,
  });
  const isExistingUser = !!data;

  //   const { db } = await connectToDatabase();

  // const isExistingUser = await db.collection('FacilityStartups').findOne({
  //   incubatorId: new ObjectId(serviceProvider._id),
  //   startupId: new ObjectId(startup._id),
  // });

  const hasGST = serviceProvider.applyGst === 'yes';

  let finalPrice = 0;
  let gstAmount = 0;
  let fixedFee = 0;
  let distanceInKm = 0;

  if (isExistingUser) {
   // console.log("📦 New user pincode check:");
    // Existing user logic
    const fixedFeePerUnit = getFixedServiceFee(facility.facilityType);
    // fixedFee = fixedFeePerUnit * unitCount * bookingSeats;
    fixedFee = fixedFeePerUnit * unitCount * bookingSeats;

    if (hasGST) {
  gstAmount = basePrice * 0.18;  // ✅ GST only on base price
  finalPrice = basePrice + gstAmount + fixedFee;  // ✅ Add components separately
} else {
  gstAmount = 0;  // ✅ No GST if no registration
  finalPrice = basePrice + fixedFee;
}
  } else {
    // New user logic
    const startupPincode = startup.pincode;
    const facilityPincode = facility.pincode;

   // console.log("📦 New user pincode check:", startupPincode, facilityPincode);

    distanceInKm = await getDistanceInKm(
      `${startupPincode}`,
      `${facilityPincode}`
    );
   // console.log("📍 Distance in KM:", distanceInKm);

    const rate = distanceInKm <= 20 ? 0.07 : 0.07;
   // console.log("💰 Rate applied:", rate);

   // console.log("🟡 basePrice:", basePrice);
    fixedFee = basePrice * rate;
   // console.log("➕ additionalFee (distance based):", fixedFee);

   if (hasGST) {
  gstAmount = basePrice * 0.18;  // ✅ GST only on base price
  finalPrice = basePrice + gstAmount + fixedFee;  // ✅ Add components separately
} else {
  gstAmount = 0;  // ✅ No GST if no registration
  finalPrice = basePrice + fixedFee;
}

   // console.log("🧾 gstAmount:", gstAmount);
   // console.log("✅ Final price:", finalPrice);
  }

  return {
    basePrice,
    fixedFee,
    gstAmount,
    finalPrice: Math.round(finalPrice),
    isExistingUser,
    hasGST,
    distanceInKm: Math.round(distanceInKm),
    bookingSeats, // Include bookingSlots in the result
  };
}
