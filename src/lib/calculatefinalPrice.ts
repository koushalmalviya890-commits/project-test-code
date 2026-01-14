import { getFixedServiceFee } from "./pricing";
import Startup from "@/models/Startup";
import ServiceProvider from "@/models/ServiceProvider";
import Facility from "@/models/Facility";
import { getServerSession } from "next-auth";
import { authOptions } from '@/lib/auth'
import { getDistanceInKm } from "@/lib/getDistance";
import { el } from "date-fns/locale";
import { ObjectId } from 'mongodb'
import { connectToDatabase } from '@/lib/mongodb'

import mongoose from 'mongoose';
import FacilityStartups from '@/models/FacilityStartups'; 
export async function calculateFinalPrice({

  facilityId,
  basePrice,
}: {
  facilityId: string;
  basePrice: number;
}) {
  // 1. Fetch startup by userId

  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {


    const facility = await Facility.findById(facilityId);
    if (!facility) throw new Error("Facility not found");

    // 4. Get the service provider
    const serviceProvider = await ServiceProvider.findOne({
      userId: facility.serviceProviderId,
    });
    if (!serviceProvider) throw new Error("Service Provider not found");

    // 5. Check for GST number
    const hasGST = !!serviceProvider.gstNumber;

    // 6. Get fixed service fee based on facility type
    let fixedFee = 0; // e.g. 40 for meeting room

    // 7. Apply pricing logic
    let totalBeforeGST = basePrice + fixedFee;
    let finalPrice = totalBeforeGST;
    let finalPricebeforeGST = 0;
    let distanceInKm = 0;
    let gst = 0;
    const isExistingUser = true;




    const rate = 0.07
   // console.log("💰 Rate applied:", rate);

    fixedFee = basePrice * rate;
   // console.log("➕ additionalFee:", fixedFee);

    if (hasGST) {
     gst = basePrice * 0.18;  // GST only on base price, not on service fee
  finalPrice = basePrice + gst + fixedFee;  // Add components separately
  finalPricebeforeGST = basePrice + fixedFee;
    }
    else {
     gst = 0;  // No GST at all if no GST registration
  finalPrice = basePrice + fixedFee;
  finalPricebeforeGST = basePrice + fixedFee;
    }



    return {
      basePrice,
      fixedFee,
      hasGST,
      isExistingUser,
      gst: hasGST ? Math.round(gst) : 0,
      finalPrice: Math.round(finalPrice),
      finalPricebeforeGST: Math.round(finalPricebeforeGST),
      distanceInKm: Math.round(distanceInKm), // rounded for display
    };

  } else {


    const startup = await Startup.findOne({ userId: session.user.id });
    if (!startup) {
      const facility = await Facility.findById(facilityId);
      if (!facility) throw new Error("Facility not found");

      // 4. Get the service provider
      const serviceProvider = await ServiceProvider.findOne({
        userId: facility.serviceProviderId,
      });
      if (!serviceProvider) throw new Error("Service Provider not found");

      // 5. Check for GST number
      const hasGST = !!serviceProvider.gstNumber;

      // 6. Get fixed service fee based on facility type
      let fixedFee = 0; // e.g. 40 for meeting room

      // 7. Apply pricing logic
      let totalBeforeGST = basePrice + fixedFee;
      let finalPrice = totalBeforeGST;
      let distanceInKm = 0;
      let gst = 0;
      const isExistingUser = true;
      let finalPricebeforeGST = 0;




      const rate = 0.07
     // console.log("💰 Rate applied:", rate);

      fixedFee = basePrice * rate;
     // console.log("➕ additionalFee:", fixedFee);

      if (hasGST) {
       // Change from: gst = totalBeforeGST * 0.18;
  gst = basePrice * 0.18;  // GST only on base price, not on service fee
  finalPrice = basePrice + gst + fixedFee;  // Add components separately
  finalPricebeforeGST = basePrice + fixedFee;
}
else {
  // Change from: gst = fixedFee * 0.18;
  gst = 0;  // No GST at all if no GST registration
  finalPrice = basePrice + fixedFee;
  finalPricebeforeGST = basePrice + fixedFee;
}



      return {
        basePrice,
        fixedFee,
        hasGST,
        isExistingUser,
        gst: hasGST ? Math.round(gst) : 0,
        finalPrice: Math.round(finalPrice),
        finalPricebeforeGST: Math.round(finalPricebeforeGST),
        distanceInKm: Math.round(distanceInKm), // rounded for display
      };
    }

    // 2. Check if existing user
    // const isExistingUser = startup.isNewUser === false;





    const facility = await Facility.findById(facilityId);
    if (!facility) throw new Error("Facility not found");

    const serviceProvider = await ServiceProvider.findOne({
      userId: facility.serviceProviderId,
    });
    if (!serviceProvider) throw new Error("Service Provider not found");

      // console.log("siva",serviceProvider._id);
   // console.log("siva",startup._id);
   const data = await FacilityStartups.findOne({
  incubatorId: (serviceProvider.userId),
  startupId: startup.userId
});
const isExistingUser = !!data;



     // console.log("💰 isExistingUser:", isExistingUser);

    // if (!isExistingUser) {
    //   // throw new Error("Pricing logic is only for existing users");

    //   const facility = await Facility.findById(facilityId);
    //   if (!facility) throw new Error("Facility not found");

    //   // 4. Get the service provider
    //   const serviceProvider = await ServiceProvider.findOne({
    //     userId: facility.serviceProviderId,
    //   });
    //   if (!serviceProvider) throw new Error("Service Provider not found");

    //   // 5. Check for GST number
    //   const hasGST = !!serviceProvider.gstNumber;

    //   // 6. Get fixed service fee based on facility type
    //   let fixedFee = 0; // e.g. 40 for meeting room

    //   // 7. Apply pricing logic
    //   let totalBeforeGST = basePrice + fixedFee;
    //   let finalPrice = totalBeforeGST;
    //   let distanceInKm = 0;
    //   let gst = 0;
    //   const isExistingUser = true;




    //   const rate = 0.07
    //  // console.log("💰 Rate applied:", rate);

    //   fixedFee = basePrice * rate;
    //  // console.log("➕ additionalFee:", fixedFee);

    //   if (hasGST) {
    //     const totalBeforeGST = basePrice + fixedFee
    //     gst = totalBeforeGST * 0.18;
    //     finalPrice = totalBeforeGST;
    //   }
    //   else {
    //     gst = fixedFee * 0.18;
    //     finalPrice = basePrice + fixedFee;
    //   }



    //   return {
    //     basePrice,
    //     fixedFee,
    //     hasGST,
    //     isExistingUser,
    //     gst: hasGST ? Math.round(gst) : 0,
    //     finalPrice: Math.round(finalPrice),
    //     distanceInKm: Math.round(distanceInKm), // rounded for display
    //   };
    // }

    const hasGST = !!serviceProvider.gstNumber;

    // 6. Get fixed service fee based on facility type
    let fixedFee = 0; // e.g. 40 for meeting room

    // 7. Apply pricing logic
    let totalBeforeGST = basePrice + fixedFee;
    let finalPrice = totalBeforeGST;
    let finalPricebeforeGST = 0;
    let distanceInKm = 0;
    let gst = 0;

    if (isExistingUser) {

      fixedFee = getFixedServiceFee(facility.facilityType);

      if (hasGST) {
        // Change from: gst = totalBeforeGST * 0.18; finalPrice += fixedFee;
  gst = basePrice * 0.18;  // GST only on base price
  finalPrice = basePrice + gst + fixedFee;  // Add components separately
  finalPricebeforeGST = basePrice + fixedFee;
}
else {
  // Keep as is (no GST)
  finalPrice = basePrice + fixedFee;
  finalPricebeforeGST = basePrice + fixedFee;
}
    }
    else {

      const startupPincode = startup.pincode;
      const facilityPincode = facility.pincode;

      // distanceInKm = await getDistanceInKm(`${startupPincode}`, `${facilityPincode}`);

      //  const rate = distanceInKm <= 20 ? 0.07 : 0.07;
      const rate = 0.07;
     // console.log("💰 Rate applied:", rate);

      fixedFee = basePrice * rate;
     // console.log("➕ additionalFee:", fixedFee);

      if (hasGST) {
      // Change from: gst = totalBeforeGST * 0.18;
  gst = basePrice * 0.18;  // GST only on base price, not on service fee
  finalPrice = basePrice + gst + fixedFee;  // Add components separately
  finalPricebeforeGST = basePrice + fixedFee;
}
else {
  // Change from: gst = fixedFee * 0.18;
  gst = 0;  // No GST at all if no GST registration
  finalPrice = basePrice + fixedFee;
  finalPricebeforeGST = basePrice + fixedFee;
}
    }


    return {
      basePrice,
      fixedFee,
      hasGST,
      isExistingUser,
      gst: hasGST ? Math.round(gst) : 0,
      finalPrice: Math.round(finalPrice),
      finalPricebeforeGST: Math.round(finalPricebeforeGST),
      distanceInKm: Math.round(distanceInKm), // rounded for display
    };
  }
}
