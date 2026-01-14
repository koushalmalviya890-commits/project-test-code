import { getFixedServiceFee } from "./pricing";
import Startup from "@/models/Startup";
import ServiceProvider from "@/models/ServiceProvider";
import Facility from "@/models/Facility";
import { getServerSession } from "next-auth";
import { authOptions } from '@/lib/auth'
import { getDistanceInKm } from "@/lib/getDistance"; 
import { el } from "date-fns/locale";
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
  let distanceInKm = 0;
  let gst = 0;
 const isExistingUser=true;




 const rate =  0.07 
 // console.log("💰 Rate applied:", rate);

 fixedFee = basePrice * rate;
// console.log("➕ additionalFee:", fixedFee);

   if (hasGST) {
    const totalBeforeGST = basePrice + fixedFee
    gst = totalBeforeGST * 0.18;
    finalPrice = totalBeforeGST + gst;
  }
  else {
      gst = fixedFee * 0.18;
      finalPrice = basePrice + fixedFee + gst;
    }


// fixedFee = getFixedServiceFee(facility.facilityType);

//   if (hasGST) {
//     gst = totalBeforeGST * 0.18;
//     finalPrice += gst;
//   }
//   else {
//       gst = fixedFee * 0.18;
//       finalPrice = basePrice + fixedFee+ gst;
//     }


return {
  basePrice,
  fixedFee,
  hasGST,
  isExistingUser,
  gst: hasGST ? Math.round(gst) : 0,
  finalPrice: Math.round(finalPrice),
  distanceInKm: Math.round(distanceInKm), // rounded for display
};

    }else{


  const startup = await Startup.findOne({ userId:  session.user.id });
  if (!startup) throw new Error("Startup not found");

  // 2. Check if existing user
  const isExistingUser = startup.isNewUser === false;

  // if (!isExistingUser) {
  //   throw new Error("Pricing logic is only for existing users");
  // }

  // 3. Get the facility
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

if(isExistingUser){
 
fixedFee = getFixedServiceFee(facility.facilityType);

  if (hasGST) {
    gst = totalBeforeGST * 0.18;
    finalPrice += gst;
  }
  else {
      gst = fixedFee * 0.18;
      finalPrice = basePrice + fixedFee+ gst;
    }
}
else{

const startupPincode = startup.pincode;
const facilityPincode = facility.pincode;

distanceInKm = await getDistanceInKm(`${startupPincode}`, `${facilityPincode}`);

 const rate = distanceInKm <= 20 ? 0.07 : 0.07;
 // console.log("💰 Rate applied:", rate);

 fixedFee = basePrice * rate;
// console.log("➕ additionalFee:", fixedFee);

   if (hasGST) {
    const totalBeforeGST = basePrice + fixedFee
    gst = totalBeforeGST * 0.18;
    finalPrice = totalBeforeGST + gst;
  }
  else {
      gst = fixedFee * 0.18;
      finalPrice = basePrice + fixedFee + gst;
    }
}


return {
  basePrice,
  fixedFee,
  hasGST,
  isExistingUser,
  gst: hasGST ? Math.round(gst) : 0,
  finalPrice: Math.round(finalPrice),
  distanceInKm: Math.round(distanceInKm), // rounded for display
};
    }
}
