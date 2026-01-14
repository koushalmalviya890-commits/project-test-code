// "use client";
// import { useState, useEffect } from "react";
// import Image from "next/image";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { AMENITY_ICONS } from "@/components";
// import {
//   ChevronLeft,
//   ChevronRight,
//   X,
//   AlertCircle,
//   Clock,
//   CalendarIcon,
//   ChevronDown,
//   ChevronUp,
//   Mic,
//   Volume2,
//   Lightbulb,
// } from "lucide-react";
// import { BookingModal } from "@/components/booking/BookingModal";
// import { useSession } from "next-auth/react";
// import { toast } from "sonner";
// import Link from "next/link";
// import DatePicker from "react-datepicker";
// import "react-datepicker/dist/react-datepicker.css";
// import {
//   FacilityCard,
//   FacilityCardSkeleton,
// } from "@/components/ui/facility-card";
// import { Badge } from "@/components/ui/badge";
// import { AnimatePresence, motion } from "framer-motion";
// import PaymentFailedBanner from "@/components/payment/PaymentFailedBanner";
// import { useRouter } from "next/navigation";
// import { getFixedServiceFee } from "@/lib/pricing";
// import fetchDynamicPrice from "@/lib/helper-pricechange";
// // Add YouTube video extractor helper

// import Reviews from "@/components/dialogs/conditional.review";
// const getYouTubeVideoId = (url: string) => {
//   if (!url) return null;
//   const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
//   const match = url.match(regExp);
//   return match && match[2].length === 11 ? match[2] : null;
// };

// interface RentalPlan {
//   name: string;
//   price: number;
//   duration: string;
// }

// interface DayTiming {
//   isOpen: boolean;
//   openTime?: string;
//   closeTime?: string;
// }

// interface Timings {
//   monday: DayTiming;
//   tuesday: DayTiming;
//   wednesday: DayTiming;
//   thursday: DayTiming;
//   friday: DayTiming;
//   saturday: DayTiming;
//   sunday: DayTiming;
// }

// interface StudioEquipmentDetail {
//   name: string;
//   picture: string;
//   quantity: number;
//   model: string;
// }

// interface StudioDetails {
//   facilityName: string;
//   description: string;
//   suitableFor: Array<"video" | "podcast" | "audio" | "others">;
//   isSoundProof: boolean;
//   equipmentDetails: StudioEquipmentDetail[];
//   hasAmpleLighting: boolean;
//   rentalPlanTypes: Array<"Hourly" | "One-Day">;
// }

// interface Facility {
//   _id: string;
//   serviceProviderId: string;
//   facilityType: string;
//   status: string;
//   details: {
//     name: string;
//     description: string;
//     images: string[];
//     videoLink?: string;
//     rentalPlans: RentalPlan[];
//     equipment?: Array<{
//       labName?: string;
//       equipmentName?: string;
//       capacityAndMake?: string;
//       softwareName?: string;
//       version?: string;
//     }>;
//     totalCabins?: number;
//     availableCabins?: number;
//     totalSeats?: number;
//     availableSeats?: number;
//     totalRooms?: number;
//     seatingCapacity?: number;
//     totalTrainingRoomSeaters?: number;
//     areaDetails?: Array<{
//       area: number;
//       type: string;
//       furnishing: string;
//       customisation: string;
//     }>;
//     studioDetails?: StudioDetails;
//   };
//   features: string[];
//   relevantSectors: string[];

//   address: string;
//   city: string;
//   pincode: string;
//   state: string;
//   country: string;
//   isFeatured: boolean;
//   serviceProvider?: {
//     serviceName: string;
//     _id: string;
//     logoUrl?: string | null;
//   };
//   timings: Timings;
// }

// export default function ViewDetailsClient({
//   facilityId,
// }: {
//   facilityId: string;
// }) {
//   const { data: session } = useSession();
//   const [facility, setFacility] = useState<Facility | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [selectedImage, setSelectedImage] = useState<number>(0);
//   const [isFullscreen, setIsFullscreen] = useState(false);
//   const [fullscreenIndex, setFullscreenIndex] = useState(0);
//   const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
//   const [mapUrl, setMapUrl] = useState<string | null>(null);

//   // Booking related states
//   const [selectedPlan, setSelectedPlan] = useState<RentalPlan | null>(null);
//   const [selectedDate, setSelectedDate] = useState<Date | null>(null);
//   const [selectedTime, setSelectedTime] = useState<string>("");
//   const [contactNumber, setContactNumber] = useState<string>("");
//   const [bookingPeriod, setBookingPeriod] = useState<string>("");
//   const [isCustomDate, setIsCustomDate] = useState(false);
//   const [isProfileLoading, setIsProfileLoading] = useState(true);
//   const [unitCount, setUnitCount] = useState(1);
//   const [bookingSeats, setBookingSeats] = useState(1);
//   const [isExisting, setIsExisting] = useState<boolean | null>(null);
//   // Add state for related facilities
//   const [relatedFacilities, setRelatedFacilities] = useState<any[]>([]);
//   const [loadingRelatedFacilities, setLoadingRelatedFacilities] =
//     useState(false);
//   const [hoveredFacilityId, setHoveredFacilityId] = useState<string | null>(
//     null
//   );

//   // New state for venue timings
//   const [showAllTimings, setShowAllTimings] = useState(false);
//   const [currentDay, setCurrentDay] = useState<string>("monday"); // Default to Monday

//   // Add loading state for payment processing
//   const [processingPayment, setProcessingPayment] = useState(false);

//   // Add state for failed payment detection
//   const [failedBookingId, setFailedBookingId] = useState<string | null>(null);

//   const router = useRouter();
//   // Add this state to track calculated price details
//   const [priceDetails, setPriceDetails] = useState<{
//     isExistingUser: any;
//     basePrice: number;
//     fixedFee: number;
//     gstAmount: number;
//     finalPrice: number;
//     hasGST: boolean;
//     bookingSeats: number;
//   } | null>(null);

//   // Add this useEffect to calculate prices when selection changes
//   useEffect(() => {
//     const calculatePrices = async () => {
//       if (!selectedPlan) return;

//       try {
//         const details = await fetchDynamicPrice({
//           facilityId,
//           rentalPlan: selectedPlan.name,
//           unitCount,
//           bookingSeats,
//         });

//         setPriceDetails(details);
//        // console.log(details?.fixedFee, `jdnskdjnskdj`);
//       } catch (error) {
//         console.error("Error calculating price details:", error);
//         // Fallback to client-side calculation if API fails
//         const baseAmount = selectedPlan.price * unitCount;
//         const fixedServiceFee = getFixedServiceFee(
//           facility?.facilityType || ""
//         );
//         const totalBaseAmount = baseAmount + fixedServiceFee;
//         const gstAmount = 0;
//         const totalAmount = totalBaseAmount;

//         setPriceDetails({
//           basePrice: baseAmount,
//           fixedFee: fixedServiceFee,
//           gstAmount,
//           finalPrice: totalAmount,
//           isExistingUser: false,
//           hasGST: false,
//           bookingSeats: bookingSeats,
//         });
//       }
//     };

//     calculatePrices();
//   }, [selectedPlan, unitCount, facilityId, bookingSeats]);

//   // Update your price display to use priceDetails
//   const basePrice =
//     (priceDetails?.basePrice ?? 0) + (priceDetails?.fixedFee ?? 0);
//   const fixedFeePerUnit =
//     priceDetails?.fixedFee || getFixedServiceFee(facility?.facilityType || "");
//  // console.log(fixedFeePerUnit, "bdnbnbnbdfnmd");
//   const fixedServiceFee = priceDetails?.fixedFee;
//  // console.log(fixedServiceFee, `vshvchscvhjcv`);
//   const gstAmount = priceDetails?.gstAmount || 0;
//  // console.log(gstAmount, `for gast amount only`);
//   const totalAmount = priceDetails?.finalPrice || 0;

//   // Fetch facility data
//   useEffect(() => {
//     const fetchFacility = async () => {
//       try {
//         setLoading(true);
//         const response = await fetch(`/api/facilities/${facilityId}`);
//         if (!response.ok) {
//           throw new Error("Failed to fetch facility details");
//         }
//         const data = await response.json();

//         // Log the service provider data for debugging
//        // console.log("Facility data received:", {
//           facilityId: data._id,
//           facilityName: data.details?.name,
//           relevantSectors: data.relevantSectors,
//           serviceProviderId: data.serviceProviderId,
//           serviceProvider: data.serviceProvider,
//           serviceProviderLogo: data.serviceProvider?.logoUrl,
//         });

//         setFacility(data);

//         // Fetch the map URL once we have the facility data
//         if (data && data.address) {
//           const address = `${data.address}, ${data.city}, ${data.state}, ${data.pincode}, ${data.country}`;
//           const mapResponse = await fetch(
//             `/api/maps?query=${encodeURIComponent(address)}`
//           );
//           if (mapResponse.ok) {
//             const mapData = await mapResponse.json();
//             setMapUrl(mapData.embedUrl);
//           }
//         }
//       } catch (error) {
//         console.error("Error fetching facility:", error);
//         setError("Failed to load facility details");
//       } finally {
//         setLoading(false);
//       }
//     };

//     if (facilityId) {
//       fetchFacility();
//     }
//   }, [facilityId]);

//   // Sort rental plans in the specified order
//   const sortedRentalPlans = facility?.details?.rentalPlans
//     ? [...facility.details.rentalPlans].sort((a, b) => {
//         const order = [
//           "Hourly",
//           "One Day (24 Hours)",
//           "Weekly",
//           "Monthly",
//           "Annual",
//         ];
//         return order.indexOf(a.name) - order.indexOf(b.name);
//       })
//     : [];

//   // Set initial booking period if available
//   useEffect(() => {
//     if (sortedRentalPlans.length > 0) {
//       setBookingPeriod(sortedRentalPlans[0].name);
//     }
//   }, [sortedRentalPlans]);
//   const timeSlots = [
//     "9 AM",
//     "10 AM",
//     "11 AM",
//     "12 PM",
//     "1 PM",
//     "2 PM",
//     "3 PM",
//     "4 PM",
//     "5 PM",
//   ];

//   const handleDateChange = (date: Date | null) => {
//     if (date) {
//       setSelectedDate(date);
//       setIsCustomDate(false);
//     }
//   };

//   const handleDateTileClick = (date: Date) => {
//     setSelectedDate(date);
//   };

//   const toggleCustomDate = () => {
//     setIsCustomDate((prev) => !prev);
//   };

//   // Handle booking submission
//   const getMaxSeats = () => {
//     if (!facility?.facilityType || !facility.details) return 1;

//     switch (facility.facilityType) {
//       case "coworking-spaces":
//         return facility.details.availableSeats || 1;
//       case "meeting-rooms":
//         return facility.details.seatingCapacity || 1;
//       case "training-rooms":
//         return facility.details.totalTrainingRoomSeaters || 1;
//       default:
//         return 1;
//     }
//   };

//   const handleBookingSubmit = async () => {
//     if (
//       (facility?.facilityType === "individual-cabin" &&
//         (facility.details.availableCabins ?? 0) <= 0) ||
//       (facility?.facilityType === "coworking-spaces" &&
//         (facility.details.availableSeats ?? 0) <= 0) ||
//       (facility?.facilityType === "meeting-rooms" &&
//         ((facility.details.totalRooms ?? 0) <= 0 ||
//           (facility.details.seatingCapacity ?? 0) <= 0 ||
//           (facility.details.totalTrainingRoomSeaters ?? 0) <= 0))
//     ) {
//       toast.error("This facility is currently not available for booking", {
//         duration: 3000,
//         icon: <AlertCircle className="h-5 w-5 text-red-500" />,
//       });
//       return;
//     }

//     // Check if all required fields are filled
//     if (!selectedDate || !selectedTime || !contactNumber || !selectedPlan) {
//       toast.error("Please fill in all required fields", {
//         duration: 3000,
//         icon: <AlertCircle className="h-5 w-5 text-red-500" />,
//       });
//       return;
//     }

//     try {
//       setProcessingPayment(true);

//       // Format date and time for API
//       const startDateTime = new Date(selectedDate);
//       const [hours, minutes] =
//         selectedTime.split(" ")[0].split(":").length === 2
//           ? selectedTime.split(" ")[0].split(":")
//           : [selectedTime.split(" ")[0], "00"];

//       const isPM = selectedTime.includes("PM");
//       startDateTime.setHours(
//         isPM
//           ? parseInt(hours) === 12
//             ? 12
//             : parseInt(hours) + 12
//           : parseInt(hours) === 12
//             ? 0
//             : parseInt(hours),
//         parseInt(minutes) || 0,
//         0, // Set seconds to 0
//         0 // Set milliseconds to 0
//       );

//       // Calculate end date based on rental plan
//       const endDateTime = new Date(startDateTime.getTime()); // Clone the start date to preserve the time

//       // Calculate the end date while properly preserving the time component
//       switch (selectedPlan.name) {
//         case "Annual":
//           // For annual plans, set to the same time but years ahead
//           endDateTime.setFullYear(endDateTime.getFullYear() + unitCount);
//           break;
//         case "Monthly":
//           // For monthly plans, set to the same time but months ahead
//           endDateTime.setMonth(endDateTime.getMonth() + unitCount);
//           break;
//         case "Weekly":
//           // For weekly plans, set to the same time but 7*unitCount days ahead
//           endDateTime.setDate(endDateTime.getDate() + 7 * unitCount);
//           break;
//         case "One Day (24 Hours)":
//           // For daily plans, set to the same time but unitCount days ahead
//           endDateTime.setDate(endDateTime.getDate() + unitCount);
//           break;
//         case "Hourly":
//           // For hourly plans, set to unitCount hours ahead
//           endDateTime.setHours(endDateTime.getHours() + unitCount);
//           break;
//       }

//      // console.log("Booking duration calculation:", {
//         plan: selectedPlan.name,
//         unitCount,
//         startDateTime: startDateTime.toISOString(),
//         endDateTime: endDateTime.toISOString(),
//         startTime: startDateTime.toLocaleTimeString(),
//         endTime: endDateTime.toLocaleTimeString(),
//         pricing: {
//           basePrice,
//           originalBaseAmount: basePrice,
//           fixedServiceFee,
//           totalAmount,
//           gstAmount,
//         },
//       });

//       // Prepare booking details for confirmation page
//       const bookingDetails = {
//         facilityId: facilityId,
//         facility: facility,
//         rentalPlan: selectedPlan.name,
//         startDate: startDateTime.toISOString(),
//         endDate: endDateTime.toISOString(),
//         contactNumber: contactNumber,
//         unitCount: unitCount,
//         bookingSeats: bookingSeats, // Include booking slots in the booking details
//         // Using the updated pricing structure
//         originalBaseAmount: basePrice, // Original base amount (without service fee)
//         serviceFee: fixedServiceFee, // Fixed service fee
//         baseAmount: basePrice, // Base amount with service fee included
//         gstAmount: gstAmount, // GST amount
//         totalAmount: totalAmount, // Total including GST
//       };

//       // Redirect to booking details page
//       const encodedData = encodeURIComponent(JSON.stringify(bookingDetails));
//       router.push(`/bookingDetails?data=${encodedData}`);
//     } catch (error) {
//       console.error("Booking processing error:", error);
//       toast.error(
//         error instanceof Error ? error.message : "Booking processing failed",
//         {
//           duration: 5000,
//           icon: <AlertCircle className="h-5 w-5 text-red-500" />,
//         }
//       );
//       setProcessingPayment(false);
//     }
//   };

//   // Add keyboard event handler for fullscreen navigation - always define this hook
//   useEffect(() => {
//     const handleKeyDown = (e: KeyboardEvent) => {
//       if (!isFullscreen) return;

//       switch (e.key) {
//         case "ArrowRight":
//           if (facility?.details?.images) {
//             setFullscreenIndex(
//               (prev) => (prev + 1) % facility.details.images.length
//             );
//           }
//           break;
//         case "ArrowLeft":
//           if (facility?.details?.images) {
//             setFullscreenIndex(
//               (prev) =>
//                 (prev - 1 + facility.details.images.length) %
//                 facility.details.images.length
//             );
//           }
//           break;
//         case "Escape":
//           setIsFullscreen(false);
//           break;
//       }
//     };

//     window.addEventListener("keydown", handleKeyDown);
//     return () => window.removeEventListener("keydown", handleKeyDown);
//   }, [isFullscreen, facility]);

//   // Fetch related facilities from the same service provider
//   useEffect(() => {
//     const fetchRelatedFacilities = async () => {
//       if (!facility?.serviceProviderId) return;

//       try {
//         setLoadingRelatedFacilities(true);

//        // console.log(
//           "Fetching related facilities for service provider ID:",
//           facility.serviceProviderId
//         );

//         // Fetch facilities from the API using serviceProviderId
//         const response = await fetch(
//           `/api/facilities/by-provider/${facility.serviceProviderId}`
//         );

//         if (!response.ok) {
//           throw new Error(
//             `Failed to fetch related facilities: ${response.status}`
//           );
//         }

//         const data = await response.json();

//        // console.log(
//           `Found ${data.length} related facilities, first facility:`,
//           data.length > 0
//             ? {
//                 id: data[0]._id,
//                 name: data[0].details?.name,
//                 serviceProvider: data[0].serviceProvider,
//               }
//             : "No facilities found"
//         );

//         // Filter out the current facility and sort by featured status
//         const filteredFacilities = data
//           .filter((f: any) => f._id !== facilityId)
//           .sort((a: any, b: any) => {
//             // Sort by featured status first
//             if (a.isFeatured && !b.isFeatured) return -1;
//             if (!a.isFeatured && b.isFeatured) return 1;

//             // Then sort by most recently updated
//             return (
//               new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
//             );
//           });

//         setRelatedFacilities(filteredFacilities);
//       } catch (error) {
//         console.error("Error fetching related facilities:", error);
//         setRelatedFacilities([]); // Set empty array on error
//       } finally {
//         setLoadingRelatedFacilities(false);
//       }
//     };

//     if (facility) {
//       fetchRelatedFacilities();
//     }
//   }, [facility, facilityId]);

//   // Update the useEffect for initial plan selection
//   useEffect(() => {
//     if (sortedRentalPlans.length > 0 && !selectedPlan) {
//       setSelectedPlan(sortedRentalPlans[0]);
//     }
//   }, [sortedRentalPlans]);

//   // Set current day on component mount
//   useEffect(() => {
//     const days = [
//       "sunday",
//       "monday",
//       "tuesday",
//       "wednesday",
//       "thursday",
//       "friday",
//       "saturday",
//     ];
//     const today = new Date().getDay(); // 0 = Sunday, 1 = Monday, etc.
//     setCurrentDay(days[today]);
//   }, []);

//   // Helper function to format day name
//   const formatDayName = (day: string): string => {
//     return day.charAt(0).toUpperCase() + day.slice(1);
//   };

//   // Helper function to get timing display text
//   const getTimingText = (timing: DayTiming): string => {
//     if (!timing || !timing.isOpen) return "Closed";
//     return `${timing.openTime || ""} - ${timing.closeTime || ""}`;
//   };

//   // Check for failed payments related to this facility for the current user
//   useEffect(() => {
//     const checkFailedPayments = async () => {
//       if (!session?.user?.id) return;

//       try {
//         const response = await fetch(
//           `/api/bookings/failed?facilityId=${facilityId}`
//         );
//         if (response.ok) {
//           const data = await response.json();
//           if (data.bookingId) {
//             setFailedBookingId(data.bookingId);
//           }
//         }
//       } catch (error) {
//         console.error("Error checking for failed payments:", error);
//       }
//     };

//     checkFailedPayments();
//   }, [facilityId, session]);

//   if (loading) {
//     return (
//       <div className="container mx-auto px-4 py-8 max-w-6xl">
//         <div className="animate-pulse">
//           <div className="h-6 bg-gray-200 rounded w-1/3 mb-3"></div>
//           <div className="h-4 bg-gray-200 rounded w-1/2 mb-6"></div>
//           <div className="aspect-video bg-gray-200 rounded mb-6"></div>
//         </div>
//       </div>
//     );
//   }

//   if (error || !facility || !facility.details) {
//     return (
//       <div className="container mx-auto px-4 py-8 max-w-6xl">
//         <div className="text-center">
//           <h2 className="text-xl font-semibold text-gray-900 mb-3">Error</h2>
//           <p className="text-gray-600 mb-4">{error || "Facility not found"}</p>
//           <Button onClick={() => window.history.back()} size="sm">
//             Go Back
//           </Button>
//         </div>
//       </div>
//     );
//   }

//   const nextImage = () => {
//     if (!facility?.details.images) return;
//     setFullscreenIndex((prev) => (prev + 1) % facility.details.images.length);
//   };

//   const previousImage = () => {
//     if (!facility?.details.images) return;
//     setFullscreenIndex(
//       (prev) =>
//         (prev - 1 + facility.details.images.length) %
//         facility.details.images.length
//     );
//   };

//   const openFullscreen = (index: number) => {
//     // Make sure the index is valid and the image exists
//     if (
//       facility?.details?.images &&
//       index >= 0 &&
//       index < facility.details.images.length &&
//       facility.details.images[index]
//     ) {
//       setFullscreenIndex(index);
//       setIsFullscreen(true);
//     } else {
//       console.error("Invalid image index or missing image source");
//       toast.error("Could not display image");
//     }
//   };

//   const handleBookNowClick = () => {
//     // Check if user is a service provider
//     if (session?.user?.userType === "Service Provider") {
//       toast.error(
//         "Facility Partners cannot make bookings. Please use a startup account to book facilities.",
//         {
//           duration: 5000,
//           icon: <AlertCircle className="h-5 w-5 text-red-500" />,
//         }
//       );
//       return;
//     }

//     // Open booking modal for non-service provider users
//     setIsBookingModalOpen(true);
//   };

//   return (
//     <div className="container mx-auto px-8 py-12 max-w-7xl">
//       {/* Payment Failed Banner */}
//       {failedBookingId && <PaymentFailedBanner bookingId={failedBookingId} />}

//       {/* Image Grid - Full Width at Top */}
//       {facility.details.images && facility.details.images.length > 0 && (
//         <div className="mb-8">
//           {facility.details.images.length === 1 &&
//           !facility.details.videoLink ? (
//             // Single image layout - full width (only when no video)
//             <div className="relative aspect-[16/9] w-full">
//               <Image
//                 src={facility.details.images[0]}
//                 alt={facility.details.name}
//                 fill
//                 className="rounded-md object-cover cursor-pointer"
//                 onClick={() => openFullscreen(0)}
//               />
//             </div>
//           ) : (
//             // Grid layout for multiple images or when video is present
//             <div className="grid grid-cols-12 gap-3">
//               <div className="col-span-12 md:col-span-8 relative aspect-[16/9]">
//                 {facility.details.videoLink &&
//                 getYouTubeVideoId(facility.details.videoLink) ? (
//                   <iframe
//                     src={`https://www.youtube.com/embed/${getYouTubeVideoId(facility.details.videoLink)}`}
//                     title={`${facility.details.name} Video`}
//                     allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
//                     allowFullScreen
//                     className="absolute inset-0 w-full h-full rounded-md"
//                   />
//                 ) : (
//                   <Image
//                     src={facility.details.images[selectedImage]}
//                     alt={facility.details.name}
//                     fill
//                     className="rounded-md object-cover cursor-pointer"
//                     onClick={() => openFullscreen(selectedImage)}
//                   />
//                 )}
//               </div>

//               {/* Show images in the grid */}
//               <div className="col-span-12 md:col-span-4 grid grid-cols-2 gap-3 h-full">
//                 {facility.details.images.map((image, index) => {
//                   if (index >= 4) return null;

//                   if (
//                     facility.details.videoLink &&
//                     getYouTubeVideoId(facility.details.videoLink)
//                   ) {
//                     return (
//                       <div key={index} className="relative aspect-square">
//                         <Image
//                           src={image}
//                           alt={`${facility.details.name} - Image ${index + 1}`}
//                           fill
//                           className="rounded-md object-cover cursor-pointer hover:opacity-90 transition-opacity"
//                           onClick={() => openFullscreen(index)}
//                         />
//                       </div>
//                     );
//                   }

//                   if (index === selectedImage) return null;

//                   return (
//                     <div key={index} className="relative aspect-square">
//                       <Image
//                         src={image}
//                         alt={`${facility.details.name} - Image ${index + 1}`}
//                         fill
//                         className="rounded-md object-cover cursor-pointer hover:opacity-90 transition-opacity"
//                         onClick={() => openFullscreen(index)}
//                       />
//                     </div>
//                   );
//                 })}
//               </div>
//             </div>
//           )}
//         </div>
//       )}

//       {/* Two-column layout for the rest of the content */}
//       <div className="grid grid-cols-12 gap-8 mb-12">
//         {/* Main Content Column */}
//         <div className="col-span-12 lg:col-span-8">
//           {/* Facility Name and Address */}
//           <div className="mb-8">
//             <h1 className="text-3xl font-bold text-gray-900 mb-2">
//               {facility.details.name}
//             </h1>
//             <p className="text-gray-600">{facility.address}</p>
//           </div>

//           {/* Facility-Specific Details in Box Style */}
//           <div className="mb-10 flex flex-wrap gap-3">
//             {/* Individual Cabin */}
//             {facility.facilityType === "individual-cabin" && (
//               <>
//                 <div className="inline-block border border-gray-200 rounded-md p-3">
//                   <div className="flex items-center gap-2">
//                     <div>
//                       <div className="text-gray-500 text-xs mb-1">
//                         Total Cabins
//                       </div>
//                       <div className="text-lg font-medium text-gray-800">
//                         {facility.details.totalCabins || 0}
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//                 <div className="inline-block border border-gray-200 rounded-md p-3">
//                   <div className="flex items-center gap-2">
//                     <div>
//                       <div className="text-gray-500 text-xs mb-1">
//                         Available Cabins
//                       </div>
//                       <div className="text-lg font-medium text-gray-800">
//                         {facility.details.availableCabins || 0}
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               </>
//             )}

//             {/* Coworking Spaces */}
//             {facility.facilityType === "coworking-spaces" && (
//               <>
//                 <div className="inline-block border border-gray-200 rounded-md p-3">
//                   <div className="flex items-center gap-2">
//                     <div>
//                       <div className="text-gray-500 text-xs mb-1">
//                         Total Seaters
//                       </div>
//                       <div className="text-lg font-medium text-gray-800">
//                         {facility.details.totalSeats || 0}
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//                 <div className="inline-block border border-gray-200 rounded-md p-3">
//                   <div className="flex items-center gap-2">
//                     <div>
//                       <div className="text-gray-500 text-xs mb-1">
//                         Available Seats
//                       </div>
//                       <div className="text-lg font-medium text-gray-800">
//                         {facility.details.availableSeats || 0}
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               </>
//             )}

//             {/* Meeting Rooms */}
//             {facility.facilityType === "meeting-rooms" && (
//               <>
//                 <div className="inline-block border border-gray-200 rounded-md p-3">
//                   <div className="flex items-center gap-2">
//                     <div>
//                       <div className="text-gray-500 text-xs mb-1">
//                         Total Rooms
//                       </div>
//                       <div className="text-lg font-medium text-gray-800">
//                         {facility.details.totalRooms || 0}
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//                 <div className="inline-block border border-gray-200 rounded-md p-3">
//                   <div className="flex items-center gap-2">
//                     <div>
//                       <div className="text-gray-500 text-xs mb-1">
//                         Seating Capacity
//                       </div>
//                       <div className="text-lg font-medium text-gray-800">
//                         {facility.details.seatingCapacity || 0}
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//                 <div className="inline-block border border-gray-200 rounded-md p-3">
//                   <div className="flex items-center gap-2">
//                     <div>
//                       <div className="text-gray-500 text-xs mb-1">
//                         Training Room Seats
//                       </div>
//                       <div className="text-lg font-medium text-gray-800">
//                         {facility.details.totalTrainingRoomSeaters || 0}
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               </>
//             )}

//             {/* Bio Allied Labs, Manufacturing Labs, Prototyping Labs */}
//             {(facility.facilityType === "bio-allied-labs" ||
//               facility.facilityType === "manufacturing-labs" ||
//               facility.facilityType === "prototyping-labs") &&
//               facility.details.equipment &&
//               facility.details.equipment.length > 0 && (
//                 <>
//                   {facility.details.equipment.slice(0, 2).map((item, index) => (
//                     <div
//                       key={index}
//                       className="inline-block border border-gray-200 rounded-md p-3"
//                     >
//                       <div className="flex items-center gap-2">
//                         <div>
//                           <div className="text-gray-500 text-xs mb-1">
//                             {item.labName || "Lab"}
//                           </div>
//                           <div className="text-lg font-medium text-gray-800">
//                             {item.equipmentName || "Equipment"}
//                           </div>
//                           <div className="text-xs text-gray-500">
//                             {item.capacityAndMake || ""}
//                           </div>
//                         </div>
//                       </div>
//                     </div>
//                   ))}
//                   {facility.details.equipment.length > 2 && (
//                     <div className="inline-block border border-gray-200 rounded-md p-3">
//                       <div className="flex items-center gap-2">
//                         <div>
//                           <div className="text-gray-500 text-xs mb-1">
//                             More Equipment
//                           </div>
//                           <div className="text-lg font-medium text-gray-800">
//                             +{facility.details.equipment.length - 2}
//                           </div>
//                         </div>
//                       </div>
//                     </div>
//                   )}
//                 </>
//               )}

//             {/* Software */}
//             {facility.facilityType === "software" &&
//               facility.details.equipment &&
//               facility.details.equipment.length > 0 && (
//                 <>
//                   {facility.details.equipment.slice(0, 2).map((item, index) => (
//                     <div
//                       key={index}
//                       className="inline-block border border-gray-200 rounded-md p-3"
//                     >
//                       <div className="flex items-center gap-2">
//                         <div>
//                           <div className="text-gray-500 text-xs mb-1">
//                             Software
//                           </div>
//                           <div className="text-lg font-medium text-gray-800">
//                             {item.softwareName || "Software"}
//                           </div>
//                           <div className="text-xs text-gray-500">
//                             Version: {item.version || "N/A"}
//                           </div>
//                         </div>
//                       </div>
//                     </div>
//                   ))}
//                   {facility.details.equipment.length > 2 && (
//                     <div className="inline-block border border-gray-200 rounded-md p-3">
//                       <div className="flex items-center gap-2">
//                         <div>
//                           <div className="text-gray-500 text-xs mb-1">
//                             More Software
//                           </div>
//                           <div className="text-lg font-medium text-gray-800">
//                             +{facility.details.equipment.length - 2}
//                           </div>
//                         </div>
//                       </div>
//                     </div>
//                   )}
//                 </>
//               )}

//             {/* SaaS Allied */}
//             {facility.facilityType === "saas-allied" &&
//               facility.details.equipment &&
//               facility.details.equipment.length > 0 && (
//                 <>
//                   {facility.details.equipment.slice(0, 2).map((item, index) => (
//                     <div
//                       key={index}
//                       className="inline-block border border-gray-200 rounded-md p-3"
//                     >
//                       <div className="flex items-center gap-2">
//                         <div>
//                           <div className="text-gray-500 text-xs mb-1">
//                             Service
//                           </div>
//                           <div className="text-lg font-medium text-gray-800">
//                             {item.equipmentName || "Service"}
//                           </div>
//                           <div className="text-xs text-gray-500">
//                             {item.capacityAndMake || ""}
//                           </div>
//                         </div>
//                       </div>
//                     </div>
//                   ))}
//                   {facility.details.equipment.length > 2 && (
//                     <div className="inline-block border border-gray-200 rounded-md p-3">
//                       <div className="flex items-center gap-2">
//                         <div>
//                           <div className="text-gray-500 text-xs mb-1">
//                             More Services
//                           </div>
//                           <div className="text-lg font-medium text-gray-800">
//                             +{facility.details.equipment.length - 2}
//                           </div>
//                         </div>
//                       </div>
//                     </div>
//                   )}
//                 </>
//               )}

//             {/* Raw Space Office, Raw Space Lab */}
//             {(facility.facilityType === "raw-space-office" ||
//               facility.facilityType === "raw-space-lab") &&
//               facility.details.areaDetails &&
//               facility.details.areaDetails.length > 0 && (
//                 <>
//                   {facility.details.areaDetails.map((area, index) => (
//                     <div
//                       key={index}
//                       className="inline-block border border-gray-200 rounded-md p-3"
//                     >
//                       <div className="flex items-center gap-2">
//                         <div>
//                           <div className="text-gray-500 text-xs mb-1">
//                             {area.type || "Area"}
//                           </div>
//                           <div className="text-lg font-medium text-gray-800">
//                             {area.area}{" "}
//                             <span className="text-xs text-gray-500">sq.ft</span>
//                           </div>
//                         </div>
//                       </div>
//                     </div>
//                   ))}
//                   {facility.details.areaDetails[0]?.furnishing && (
//                     <div className="inline-block border border-gray-200 rounded-md p-3">
//                       <div className="flex items-center gap-2">
//                         <div>
//                           <div className="text-gray-500 text-xs mb-1">
//                             Furnishing
//                           </div>
//                           <div className="text-lg font-medium text-gray-800">
//                             {facility.details.areaDetails[0].furnishing}
//                           </div>
//                         </div>
//                       </div>
//                     </div>
//                   )}
//                   {facility.details.areaDetails[0]?.customisation && (
//                     <div className="inline-block border border-gray-200 rounded-md p-3">
//                       <div className="flex items-center gap-2">
//                         <div>
//                           <div className="text-gray-500 text-xs mb-1">
//                             Customisation
//                           </div>
//                           <div className="text-lg font-medium text-gray-800">
//                             {facility.details.areaDetails[0].customisation}
//                           </div>
//                         </div>
//                       </div>
//                     </div>
//                   )}
//                 </>
//               )}

//             {/* Studio */}
//             {facility.facilityType === "studio" &&
//               facility.details.studioDetails && (
//                 <>
//                   {/* Suitable For */}
//                   <div className="inline-block border border-gray-200 rounded-md p-3">
//                     <div className="flex items-center gap-2">
//                       <Mic className="h-5 w-5 text-gray-600" />
//                       <div>
//                         <div className="text-gray-500 text-xs mb-1">
//                           Suitable For
//                         </div>
//                         <div className="text-lg font-medium text-gray-800">
//                           {facility.details.studioDetails.suitableFor.join(
//                             ", "
//                           )}
//                         </div>
//                       </div>
//                     </div>
//                   </div>

//                   {/* Sound Proof */}
//                   {facility.details.studioDetails.isSoundProof && (
//                     <div className="inline-block border border-gray-200 rounded-md p-3">
//                       <div className="flex items-center gap-2">
//                         <Volume2 className="h-5 w-5 text-gray-600" />
//                         <div>
//                           <div className="text-gray-500 text-xs mb-1">
//                             Sound Proof
//                           </div>
//                           <div className="text-lg font-medium text-gray-800">
//                             Yes
//                           </div>
//                         </div>
//                       </div>
//                     </div>
//                   )}

//                   {/* Ample Lighting */}
//                   {facility.details.studioDetails.hasAmpleLighting && (
//                     <div className="inline-block border border-gray-200 rounded-md p-3">
//                       <div className="flex items-center gap-2">
//                         <Lightbulb className="h-5 w-5 text-gray-600" />
//                         <div>
//                           <div className="text-gray-500 text-xs mb-1">
//                             Ample Lighting
//                           </div>
//                           <div className="text-lg font-medium text-gray-800">
//                             Yes
//                           </div>
//                         </div>
//                       </div>
//                     </div>
//                   )}

//                   {/* Equipment Details */}
//                   {facility.details.studioDetails.equipmentDetails &&
//                     facility.details.studioDetails.equipmentDetails.length >
//                       0 && (
//                       <>
//                         {facility.details.studioDetails.equipmentDetails
//                           .slice(0, 2)
//                           .map((item, index) => (
//                             <div
//                               key={index}
//                               className="inline-block border border-gray-200 rounded-md p-3"
//                             >
//                               <div className="flex items-center gap-2">
//                                 <div>
//                                   <div className="text-gray-500 text-xs mb-1">
//                                     Equipment
//                                   </div>
//                                   <div className="text-lg font-medium text-gray-800">
//                                     {item.name}
//                                   </div>
//                                   <div className="text-xs text-gray-500">
//                                     {item.model} (Qty: {item.quantity})
//                                   </div>
//                                 </div>
//                               </div>
//                             </div>
//                           ))}
//                         {facility.details.studioDetails.equipmentDetails
//                           .length > 2 && (
//                           <div className="inline-block border border-gray-200 rounded-md p-3">
//                             <div className="flex items-center gap-2">
//                               <div>
//                                 <div className="text-gray-500 text-xs mb-1">
//                                   More Equipment
//                                 </div>
//                                 <div className="text-lg font-medium text-gray-800">
//                                   +
//                                   {facility.details.studioDetails
//                                     .equipmentDetails.length - 2}
//                                 </div>
//                               </div>
//                             </div>
//                           </div>
//                         )}
//                       </>
//                     )}
//                 </>
//               )}

//             {/* Default for other facility types */}
//             {!facility.facilityType ||
//               (facility.facilityType !== "individual-cabin" &&
//                 facility.facilityType !== "coworking-spaces" &&
//                 facility.facilityType !== "meeting-rooms" &&
//                 facility.facilityType !== "bio-allied-labs" &&
//                 facility.facilityType !== "manufacturing-labs" &&
//                 facility.facilityType !== "prototyping-labs" &&
//                 facility.facilityType !== "software" &&
//                 facility.facilityType !== "saas-allied" &&
//                 facility.facilityType !== "raw-space-office" &&
//                 facility.facilityType !== "raw-space-lab" &&
//                 facility.facilityType !== "studio" && (
//                   <div className="inline-block border border-gray-200 rounded-md p-3">
//                     <div className="flex items-center gap-2">
//                       <div>
//                         <div className="text-gray-500 text-xs mb-1">
//                           Facility Space
//                         </div>
//                         <div className="text-lg font-medium text-gray-800">
//                           1400{" "}
//                           <span className="text-xs text-gray-500">sq.ft</span>
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                 ))}
//           </div>

//           {/* Hosted By Section */}
//           <div className="flex items-center gap-3 mb-10 pb-6 border-b border-gray-100">
//             <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
//               {facility.serviceProvider?.logoUrl &&
//               typeof facility.serviceProvider.logoUrl === "string" ? (
//                 <Image
//                   src={facility.serviceProvider.logoUrl}
//                   alt={
//                     facility.serviceProvider.serviceName || "Service Provider"
//                   }
//                   width={48}
//                   height={48}
//                   className="w-full h-full object-cover"
//                 />
//               ) : (
//                 <span className="text-xl font-semibold text-green-600">
//                   {facility.serviceProvider?.serviceName
//                     ? facility.serviceProvider.serviceName.charAt(0)
//                     : "S"}
//                 </span>
//               )}
//             </div>
//             <div>
//               <p className="font-medium">
//                 Hosted by{" "}
//                 {facility.serviceProvider?.serviceName &&
//                 facility.serviceProvider?._id ? (
//                   <Link
//                     href={`/ViewProvider/${facility.serviceProvider._id}`}
//                     className="font-bold text-green-600 hover:text-green-700 hover:underline cursor-pointer"
//                   >
//                     {facility.serviceProvider.serviceName}
//                   </Link>
//                 ) : (
//                   <span>Service Provider</span>
//                 )}
//                 {!facility.serviceProvider?.serviceName && (
//                   <span className="text-xs text-gray-500 ml-2">
//                     (Service provider info unavailable)
//                   </span>
//                 )}
//               </p>
//               <p className="text-sm text-gray-600">
//                 {loadingRelatedFacilities ? (
//                   <span className="inline-flex items-center">
//                     <span className="h-2 w-2 bg-gray-300 rounded-full animate-pulse mr-2"></span>
//                     Loading facilities...
//                   </span>
//                 ) : relatedFacilities.length > 0 ? (
//                   `${relatedFacilities.length} more ${relatedFacilities.length === 1 ? "facility" : "facilities"}`
//                 ) : (
//                   "No other facilities"
//                 )}
//               </p>
//             </div>
//           </div>

//           {/* Description */}
//           <div className="mb-10">
//             <h2 className="text-xl font-semibold mb-4 text-gray-800">
//               About this space
//             </h2>
//             <p className="text-gray-600 whitespace-pre-line">
//               {facility.details.description}
//             </p>
//           </div>

//           {/* Amenities */}
//           {facility.features && facility.features.length > 0 && (
//             <div className="mb-10">
//               <h2 className="text-xl font-semibold mb-4 text-gray-800">
//                 Venue Amenities
//               </h2>
//               <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
//                 {facility.features.map((feature, index) => {
//                   const IconComponent =
//                     AMENITY_ICONS[feature as keyof typeof AMENITY_ICONS] ||
//                     AMENITY_ICONS["Other"];
//                   return (
//                     <div key={index} className="flex items-center gap-3">
//                       <IconComponent className="h-5 w-5 text-gray-600" />
//                       <span className="text-gray-700">{feature}</span>
//                     </div>
//                   );
//                 })}
//               </div>
//             </div>
//           )}

//           {facility.relevantSectors && facility.relevantSectors.length > 0 && (
//             <div className="mb-10">
//               {/* <h2 className="text-xl font-semibold mb-4 text-gray-800">
//                 Sector Things
//               </h2> */}

//               {facility.relevantSectors &&
//                 facility.relevantSectors.length > 0 && (
//                   <div className="space-y-2">
//                     <div className="border border-gray-200 rounded-md p-4">
//                       <h4 className="text-lg font-semibold mb-3">Sector</h4>
//                       <div className="flex flex-wrap gap-3">
//                         {facility.relevantSectors.map((sector, index) => (
//                           <span
//                             key={index}
//                             className="px-4 py-2 border border-green-600 text-black rounded-full text-sm font-medium whitespace-nowrap"
//                           >
//                             {sector
//                               .replace(/-/g, " ")
//                               .replace(/\b\w/g, (l) => l.toUpperCase())}
//                           </span>
//                         ))}
//                       </div>
//                     </div>
//                   </div>
//                 )}
//             </div>
//           )}

//           {/* Venue Timings */}
//           <div className="mb-10">
//             <h2 className="text-xl font-semibold mb-4 text-gray-800">
//               Venue Timings
//             </h2>

//             {facility.timings && (
//               <div className="space-y-2">
//                 <div className="border border-gray-200 rounded-md overflow-hidden">
//                   {/* Current day timing - always visible */}
//                   <div
//                     className="bg-gray-50 py-3 px-4 flex justify-between items-center cursor-pointer"
//                     onClick={() => setShowAllTimings(!showAllTimings)}
//                   >
//                     <div className="flex items-center gap-2">
//                       <Clock className="h-4 w-4 text-gray-600" />
//                       <span className="font-medium">
//                         {formatDayName(currentDay)}
//                       </span>
//                       <Badge
//                         variant="outline"
//                         className="ml-2 text-xs bg-blue-50 text-blue-700 border-blue-200"
//                       >
//                         Today
//                       </Badge>
//                     </div>
//                     <div className="flex items-center">
//                       <span className="text-gray-700 mr-2">
//                         {getTimingText(
//                           facility.timings[currentDay as keyof Timings]
//                         )}
//                       </span>
//                       {showAllTimings ? (
//                         <ChevronUp className="h-4 w-4 text-gray-500" />
//                       ) : (
//                         <ChevronDown className="h-4 w-4 text-gray-500" />
//                       )}
//                     </div>
//                   </div>

//                   {/* All other days - animated */}
//                   <AnimatePresence>
//                     {showAllTimings && (
//                       <motion.div
//                         initial={{ height: 0, opacity: 0 }}
//                         animate={{ height: "auto", opacity: 1 }}
//                         exit={{ height: 0, opacity: 0 }}
//                         transition={{ duration: 0.3, ease: "easeInOut" }}
//                         className="overflow-hidden"
//                       >
//                         <div className="divide-y divide-gray-200">
//                           {[
//                             "monday",
//                             "tuesday",
//                             "wednesday",
//                             "thursday",
//                             "friday",
//                             "saturday",
//                             "sunday",
//                           ]
//                             .filter((day) => day !== currentDay) // Filter out current day to avoid duplication
//                             .map((day) => (
//                               <div
//                                 key={day}
//                                 className="py-3 px-4 flex justify-between items-center"
//                               >
//                                 <span>{formatDayName(day)}</span>
//                                 <span className="text-gray-700">
//                                   {getTimingText(
//                                     facility.timings[day as keyof Timings]
//                                   )}
//                                 </span>
//                               </div>
//                             ))}
//                         </div>
//                       </motion.div>
//                     )}
//                   </AnimatePresence>
//                 </div>
//               </div>
//             )}
//           </div>

//           {/* Address and Map */}
//           <div className="mb-10">
//             <h2 className="text-xl font-semibold mb-4 text-gray-800">
//               Address
//             </h2>
//             <div className="space-y-6">
//               <div className="grid grid-cols-2 gap-2 text-sm">
//                 <span className="text-gray-600">City</span>
//                 <span>{facility.city}</span>
//                 <span className="text-gray-600">Pincode</span>
//                 <span>{facility.pincode}</span>
//                 <span className="text-gray-600">State</span>
//                 <span>{facility.state}</span>
//                 <span className="text-gray-600">Country</span>
//                 <span>{facility.country}</span>
//               </div>

//               <div
//                 className="w-full h-[250px] rounded-lg overflow-hidden cursor-pointer relative border border-gray-200"
//                 onClick={() => {
//                   const address = encodeURIComponent(
//                     `${facility.address}, ${facility.city}, ${facility.state}, ${facility.pincode}, ${facility.country}`
//                   );
//                   window.open(
//                     `https://www.google.com/maps/search/?api=1&query=${address}`,
//                     "_blank"
//                   );
//                 }}
//               >
//                 <iframe
//                   width="100%"
//                   height="100%"
//                   style={{ border: 0 }}
//                   loading="lazy"
//                   allowFullScreen
//                   referrerPolicy="no-referrer-when-downgrade"
//                   src={mapUrl || ""}
//                 />
//                 <div className="absolute inset-0 bg-transparent hover:bg-black/5 transition-colors" />
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Booking Section - Sticky */}
//         <div className="col-span-12 lg:col-span-4">
//           <div className="sticky top-8">
//             <div className="bg-white rounded-xl shadow-lg border overflow-hidden">
//               {/* Price Display */}
//               <div className="p-6 border-b">
//                 <div className="space-y-3 mb-6">
//                   {/* Base Price */}
//                   {/* Number of Slots */}
//                   <div className="flex justify-between text-sm text-gray-500">
//                     <span>Number of Seats</span>
//                     <span>{bookingSeats}</span>
//                   </div>
//                   <div className="flex justify-between">
//                     <span>
//                       Base Price{" "}
//                       {unitCount > 1 || bookingSeats > 1 ? (
//                         <>
//                           ({bookingSeats} × ₹
//                           {(basePrice / (unitCount * bookingSeats)).toFixed(2)})
//                         </>
//                       ) : (
//                         ""
//                       )}
//                     </span>
//                     <span>₹{basePrice?.toFixed(2) ?? "0.00"}</span>
//                   </div>

//                   {/* Service Fee */}
//                   {/* <div className="flex justify-between">
//     <span>Service Fee</span>
//     <span>₹{priceDetails?.fixedFee?.toFixed(2) ?? "0.00"}</span>
//   </div> */}

//                   {/* GST if applicable */}
//                   {gstAmount !== 0 && (
//                     <div className="flex justify-between">
//                       <span>GST (18%)</span>
//                       <span>₹{gstAmount?.toFixed(2) ?? "0.00"}</span>
//                     </div>
//                   )}

//                   {/* Total Fare */}
//                   <div className="flex justify-between font-semibold pt-3 border-t">
//                     <span>Total Fare</span>
//                     <span>₹{totalAmount?.toFixed(2) ?? "0.00"}</span>
//                   </div>
//                 </div>

//                 <div className="text-sm text-gray-600">
//                   {selectedPlan?.name === "Monthly" &&
//                     `for ${unitCount} month${unitCount > 1 ? "s" : ""}`}
//                   {selectedPlan?.name === "Annual" &&
//                     `for ${unitCount} year${unitCount > 1 ? "s" : ""}`}
//                   {selectedPlan?.name === "Weekly" &&
//                     `for ${unitCount} week${unitCount > 1 ? "s" : ""}`}
//                   {selectedPlan?.name === "One Day (24 Hours)" &&
//                     `for ${unitCount} day${unitCount > 1 ? "s" : ""}`}
//                   {selectedPlan?.name === "Hourly" &&
//                     `for ${unitCount} hour${unitCount > 1 ? "s" : ""}`}
//                 </div>
//               </div>

//               {/* Booking Form */}
//               <div className="p-6">
//                 {/* Booking Period Selection */}
//                 <div className="mb-6">
//                   <h3 className="text-sm font-medium mb-3">
//                     Choose Booking Duration
//                   </h3>
//                   {sortedRentalPlans.map((plan) => {
//                     const isSelected = selectedPlan?.name === plan.name;

//                     // Calculate fixed fee the same way as in calculateFinalPriceDetail
//                     const fixedFeePerUnit = getFixedServiceFee(
//                       facility?.facilityType || ""
//                     );

//                     // Calculate fallback price based on user type (matches calculateFinalPriceDetail logic)
//                     let fallbackPrice;
//                     if (session?.user) {
//                       if (
//                         session?.user &&
//                         !isProfileLoading &&
//                         isExisting === false
//                       ) {
//                         // Existing user logic - fixed fee per unit
//                         const distanceBasedFee =
//                           plan.price * unitCount * bookingSeats * 0.07;
//                         fallbackPrice =
//                           plan.price * unitCount * bookingSeats +
//                           distanceBasedFee;
//                       } else {
//                         // New user logic - distance-based fee (7% of base price)

//                         const fixedFee =
//                           fixedFeePerUnit * unitCount * bookingSeats;
//                         fallbackPrice =
//                           plan.price * unitCount * bookingSeats + fixedFee;
//                       }
//                     } else {
//                       const distanceBasedFee =
//                         plan.price * unitCount * bookingSeats * 0.07;
//                       fallbackPrice =
//                         plan.price * unitCount * bookingSeats +
//                         distanceBasedFee;
//                     }

//                     // Use dynamic price if selected and available
//                     const totalPrice = Math.round(fallbackPrice);

//                     return (
//                       <button
//                         key={plan.name}
//                         onClick={() => {
//                           setSelectedPlan(plan);
//                           setSelectedDate(null);
//                           setSelectedTime("");
//                           setUnitCount(1);
//                           setPriceDetails(null); // Reset old price while fetching new
//                         }}
//                         className={`w-full flex items-center justify-between p-3 mt-3 rounded-lg border transition-all ${
//                           isSelected
//                             ? "border-primary bg-primary/5 text-primary"
//                             : "border-gray-200 hover:border-primary/50"
//                         }`}
//                       >
//                         <span className="font-medium">
//                           {plan.name === "One Day (24 Hours)"
//                             ? "Daily"
//                             : plan.name}
//                         </span>

//                         {totalPrice.toLocaleString()}
//                       </button>
//                     );
//                   })}
//                 </div>

//                 {/* booking slots */}
//                 <div className="mb-6">
//                   <h3 className="text-sm font-medium mb-3">
//                     Choose Booking Seats
//                   </h3>

//                   <div className="space-y-4">
//                     {/* Slot Counter */}
//                     <div className="flex items-center justify-between p-3 rounded-lg border border-gray-200">
//                       <span className="text-sm font-medium">
//                         Number of Seats
//                       </span>
//                       <div className="flex items-center gap-3">
//                         <button
//                           onClick={() =>
//                             setBookingSeats(Math.max(1, bookingSeats - 1))
//                           }
//                           className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-200 hover:border-primary/50 transition-colors"
//                           type="button"
//                         >
//                           <span className="text-lg">-</span>
//                         </button>
//                         <span className="w-8 text-center font-medium">
//                           {bookingSeats}
//                         </span>
//                         <button
//                           onClick={() =>
//                             setBookingSeats((prev) =>
//                               Math.min(getMaxSeats(), prev + 1)
//                             )
//                           }
//                           disabled={bookingSeats >= getMaxSeats()}
//                           className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-200 hover:border-primary/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
//                           type="button"
//                         >
//                           <span className="text-lg">+</span>
//                         </button>
//                       </div>
//                     </div>

//                     {/* Price Display */}
//                     {priceDetails && (
//                       <div className="flex justify-between p-3 rounded-lg border border-gray-200">
//                         <span className="text-sm font-medium">Total Price</span>
//                         <span className="text-sm font-semibold text-primary">
//                           ₹{priceDetails.finalPrice.toLocaleString()}
//                         </span>
//                       </div>
//                     )}
//                   </div>
//                 </div>

//                 {/* Date and Time Selection */}
//                 <div className="grid grid-cols-2 gap-3 mb-6">
//                   <div>
//                     <Label
//                       htmlFor="date-select"
//                       className="text-sm font-medium mb-1.5 block"
//                     >
//                       Choose Date
//                     </Label>
//                     <div className="relative">
//                       <DatePicker
//                         selected={selectedDate}
//                         onChange={handleDateChange}
//                         minDate={new Date()}
//                         placeholderText="Select date"
//                         className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
//                         wrapperClassName="w-full"
//                         popperClassName="z-50"
//                         popperPlacement="bottom-start"
//                         customInput={
//                           <Input id="date-select" className="pl-3 pr-8" />
//                         }
//                       />
//                       <CalendarIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
//                     </div>
//                   </div>
//                   <div>
//                     <Label
//                       htmlFor="time-select"
//                       className="text-sm font-medium mb-1.5 block"
//                     >
//                       Choose Time
//                     </Label>
//                     <select
//                       id="time-select"
//                       value={selectedTime}
//                       onChange={(e) => setSelectedTime(e.target.value)}
//                       className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
//                     >
//                       <option value="">Select time</option>
//                       {timeSlots.map((time) => (
//                         <option key={time} value={time}>
//                           {time}
//                         </option>
//                       ))}
//                     </select>
//                   </div>
//                 </div>

//                 {/* Contact Number */}
//                 <div className="mb-6">
//                   <Label
//                     htmlFor="contact-number"
//                     className="text-sm font-medium mb-1.5 block"
//                   >
//                     Contact Number
//                   </Label>
//                   <Input
//                     id="contact-number"
//                     type="tel"
//                     value={contactNumber}
//                     onChange={(e) => setContactNumber(e.target.value)}
//                     placeholder="Enter your contact number"
//                     className="w-full"
//                   />
//                 </div>

//                 {/* Booking Summary */}
//                 {selectedDate && selectedTime && selectedPlan && (
//                   <div className="mb-6 p-4 bg-gray-50 rounded-lg">
//                     <h3 className="text-sm font-medium mb-2">
//                       Booking Summary
//                     </h3>
//                     <div className="space-y-2 text-sm">
//                       <div className="flex justify-between">
//                         <span className="text-gray-600">Start:</span>
//                         <span>
//                           {selectedDate.toLocaleDateString("en-US", {
//                             weekday: "short",
//                             day: "numeric",
//                             month: "short",
//                             year: "numeric",
//                           })}{" "}
//                           {selectedTime}
//                         </span>
//                       </div>
//                       <div className="flex justify-between">
//                         <span className="text-gray-600">End:</span>
//                         <span>
//                           {(() => {
//                             const startDate = new Date(selectedDate);
//                             const [hours, minutes] =
//                               selectedTime.split(" ")[0].split(":").length === 2
//                                 ? selectedTime.split(" ")[0].split(":")
//                                 : [selectedTime.split(" ")[0], "00"];
//                             const isPM = selectedTime.includes("PM");
//                             startDate.setHours(
//                               isPM
//                                 ? parseInt(hours) === 12
//                                   ? 12
//                                   : parseInt(hours) + 12
//                                 : parseInt(hours) === 12
//                                   ? 0
//                                   : parseInt(hours),
//                               parseInt(minutes) || 0
//                             );

//                             const endDate = new Date(startDate);
//                             switch (selectedPlan.name) {
//                               case "Annual":
//                                 endDate.setFullYear(
//                                   endDate.getFullYear() + unitCount
//                                 );
//                                 break;
//                               case "Monthly":
//                                 endDate.setMonth(
//                                   endDate.getMonth() + unitCount
//                                 );
//                                 break;
//                               case "Weekly":
//                                 endDate.setDate(
//                                   endDate.getDate() + 7 * unitCount
//                                 );
//                                 break;
//                               case "One Day (24 Hours)":
//                                 endDate.setDate(endDate.getDate() + unitCount);
//                                 break;
//                               case "Hourly":
//                                 endDate.setHours(
//                                   endDate.getHours() + unitCount
//                                 );
//                                 break;
//                             }

//                             return (
//                               endDate.toLocaleDateString("en-US", {
//                                 weekday: "short",
//                                 day: "numeric",
//                                 month: "short",
//                                 year: "numeric",
//                               }) +
//                               " " +
//                               endDate.toLocaleTimeString("en-US", {
//                                 hour: "numeric",
//                                 minute: "2-digit",
//                                 hour12: true,
//                               })
//                             );
//                           })()}
//                         </span>
//                       </div>
//                       <div className="flex justify-between">
//                         <span className="text-gray-600">Duration:</span>
//                         <span>
//                           {unitCount}{" "}
//                           {selectedPlan.name === "Annual"
//                             ? `year${unitCount > 1 ? "s" : ""}`
//                             : selectedPlan.name === "Monthly"
//                               ? `month${unitCount > 1 ? "s" : ""}`
//                               : selectedPlan.name === "Weekly"
//                                 ? `week${unitCount > 1 ? "s" : ""}`
//                                 : selectedPlan.name === "One Day (24 Hours)"
//                                   ? `day${unitCount > 1 ? "s" : ""}`
//                                   : `hour${unitCount > 1 ? "s" : ""}`}
//                         </span>
//                       </div>
//                     </div>
//                   </div>
//                 )}

//                 {/* Price Calculation - Update to show combined base price + service fee */}
//                 <div className="space-y-3 mb-6">
//                   {/* Booking Slot Info */}
//                   <div className="flex justify-between text-sm ">
//                     <span>Number of Seats</span>
//                     <span>{bookingSeats}</span>
//                   </div>
//                   {/* Base Price with units and slots shown */}
//                   <div className="flex justify-between">
//                     <span>
//                       Base Price{" "}
//                       {unitCount > 1 || bookingSeats > 1 ? (
//                         <>
//                           ({unitCount} × {bookingSeats} × ₹
//                           {(basePrice / (unitCount * bookingSeats)).toFixed(2)})
//                         </>
//                       ) : (
//                         ""
//                       )}
//                     </span>
//                     <span>₹{basePrice.toFixed(2)}</span>
//                   </div>

//                   {/* Service Fee */}
//                   {/* <div className="flex justify-between">
//     <span>Service Fee</span>
//     <span>₹{priceDetails?.fixedFee?.toFixed(2)}</span>
//   </div> */}

//                   {/* GST */}
//                   {gstAmount !== 0 && (
//                     <div className="flex justify-between">
//                       <span>GST (18%)</span>
//                       <span>₹{gstAmount.toFixed(2)}</span>
//                     </div>
//                   )}

//                   {/* Total */}
//                   <div className="flex justify-between font-semibold pt-3 border-t">
//                     <span>Total Fare</span>
//                     <span>₹{totalAmount.toFixed(2)}</span>
//                   </div>
//                 </div>

//                 {/* Book Now Button */}
//                 <Button
//                   className="w-full text-base font-semibold py-6"
//                   onClick={handleBookingSubmit}
//                   disabled={!selectedPlan || processingPayment}
//                 >
//                   {processingPayment ? (
//                     <span className="flex items-center justify-center">
//                       <span className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-white"></span>
//                       Processing...
//                     </span>
//                   ) : (
//                     "Book Now"
//                   )}
//                 </Button>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* More Facilities from this Provider - Full Width Section */}
//       {facility.serviceProviderId && (
//         <div className="mb-16">
//           <h2 className="text-2xl font-bold mb-6 text-gray-900">
//             More facilities from{" "}
//             {facility.serviceProvider?.serviceName &&
//             facility.serviceProvider?._id ? (
//               <Link
//                 href={`/ViewProvider/${facility.serviceProvider._id}`}
//                 className="font-bold text-green-600 hover:text-green-700 hover:underline cursor-pointer"
//               >
//                 {facility.serviceProvider.serviceName}
//               </Link>
//             ) : (
//               "this provider"
//             )}
//           </h2>

//           <div className="relative">
//             {loadingRelatedFacilities ? (
//               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
//                 {Array.from({ length: 4 }).map((_, index) => (
//                   <FacilityCardSkeleton key={index} />
//                 ))}
//               </div>
//             ) : relatedFacilities.length > 0 ? (
//               <div className="overflow-x-auto pb-4 hide-scrollbar">
//                 <div className="flex gap-4">
//                   {relatedFacilities.map((relatedFacility) => (
//                     <div
//                       key={relatedFacility._id}
//                       style={{ width: "300px", height: "400px" }}
//                       className="flex-shrink-0"
//                     >
//                       <FacilityCard
//                         facility={relatedFacility}
//                         isHovered={hoveredFacilityId === relatedFacility._id}
//                         onMouseEnter={() =>
//                           setHoveredFacilityId(relatedFacility._id)
//                         }
//                         onMouseLeave={() => setHoveredFacilityId(null)}
//                         isFeatured={relatedFacility.isFeatured}
//                         className="h-full"
//                       />
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             ) : (
//               <div className="bg-gray-50 rounded-lg p-8 text-center">
//                 <p className="text-gray-500">
//                   No other facilities available from this provider.
//                 </p>
//                 {facility.serviceProvider?.serviceName &&
//                   facility.serviceProvider?._id && (
//                     <p className="text-sm text-gray-400 mt-2">
//                       This is the only facility listed by{" "}
//                       <Link
//                         href={`/ViewProvider/${facility.serviceProvider._id}`}
//                         className="text-green-600 hover:text-green-700 hover:underline cursor-pointer"
//                       >
//                         {facility.serviceProvider.serviceName}
//                       </Link>
//                       .
//                     </p>
//                   )}
//               </div>
//             )}
//           </div>
//         </div>
//       )}

//       <Reviews
//         facilityId={facilityId}
//         serviceProvider={facility.serviceProviderId}
//       />

//       {/* Fullscreen Image Viewer */}
//       {isFullscreen &&
//         facility.details.images &&
//         facility.details.images.length > 0 && (
//           <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center">
//             <div className="relative w-full h-full flex items-center justify-center">
//               {/* Close button */}
//               <button
//                 className="absolute top-4 right-4 text-white p-2 rounded-full hover:bg-white/10 transition-colors z-10"
//                 onClick={() => setIsFullscreen(false)}
//               >
//                 <X className="h-8 w-8" />
//               </button>

//               {/* Navigation buttons */}
//               {facility.details.images.length > 1 && (
//                 <>
//                   <button
//                     className="absolute left-4 text-white p-2 rounded-full hover:bg-white/10 transition-colors z-10"
//                     onClick={previousImage}
//                   >
//                     <ChevronLeft className="h-8 w-8" />
//                   </button>
//                   <button
//                     className="absolute right-4 text-white p-2 rounded-full hover:bg-white/10 transition-colors z-10"
//                     onClick={nextImage}
//                   >
//                     <ChevronRight className="h-8 w-8" />
//                   </button>
//                 </>
//               )}

//               {/* Image */}
//               <div className="relative w-full h-full max-w-5xl max-h-[80vh] flex items-center justify-center">
//                 <Image
//                   src={facility.details.images[fullscreenIndex]}
//                   alt={`${facility.details.name} - Image ${fullscreenIndex + 1}`}
//                   fill
//                   className="object-contain"
//                 />
//               </div>

//               {/* Image counter */}
//               <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
//                 {fullscreenIndex + 1} / {facility.details.images.length}
//               </div>
//             </div>
//           </div>
//         )}

//       {/* Booking Modal */}
//       {facility && (
//         <BookingModal
//           isOpen={isBookingModalOpen}
//           onClose={() => setIsBookingModalOpen(false)}
//           facility={facility}
//         />
//       )}
//     </div>
//   );
// }


"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AMENITY_ICONS } from "@/components";
import {
  ChevronLeft,
  ChevronRight,
  X,
  AlertCircle,
  Clock,
  CalendarIcon,
  ChevronDown,
  ChevronUp,
  Mic,
  Volume2,
  Lightbulb,
} from "lucide-react";
import { BookingModal } from "@/components/booking/BookingModal";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import Link from "next/link";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {
  FacilityCard,
  FacilityCardSkeleton,
} from "@/components/ui/facility-card";
import { Badge } from "@/components/ui/badge";
import { AnimatePresence, motion } from "framer-motion";
import PaymentFailedBanner from "@/components/payment/PaymentFailedBanner";
import { useRouter } from "next/navigation";
import { getFixedServiceFee } from "@/lib/pricing";
import fetchDynamicPrice from "@/lib/helper-pricechange-affiliate";
import Reviews from "@/components/dialogs/conditional.review";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

const getYouTubeVideoId = (url: string) => {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
};

interface RentalPlan {
  name: string;
  price: number;
  duration: string;
}

interface DayTiming {
  isOpen: boolean;
  openTime?: string;
  closeTime?: string;
}

interface Timings {
  monday: DayTiming;
  tuesday: DayTiming;
  wednesday: DayTiming;
  thursday: DayTiming;
  friday: DayTiming;
  saturday: DayTiming;
  sunday: DayTiming;
}

interface StudioEquipmentDetail {
  name: string;
  picture: string;
  quantity: number;
  model: string;
}

interface StudioDetails {
  facilityName: string;
  description: string;
  suitableFor: Array<"video" | "podcast" | "audio" | "others">;
  isSoundProof: boolean;
  equipmentDetails: StudioEquipmentDetail[];
  hasAmpleLighting: boolean;
  rentalPlanTypes: Array<"Hourly" | "One-Day">;
}

interface Facility {
  _id: string;
  serviceProviderId: string;
  facilityType: string;
  status: string;
  details: {
    name: string;
    description: string;
    images: string[];
    videoLink?: string;
    rentalPlans: RentalPlan[];
    equipment?: Array<{
      labName?: string;
      equipmentName?: string;
      capacityAndMake?: string;
      softwareName?: string;
      version?: string;
    }>;
    totalCabins?: number;
    availableCabins?: number;
    totalSeats?: number;
    availableSeats?: number;
    totalRooms?: number;
    seatingCapacity?: number;
    totalTrainingRoomSeaters?: number;
    areaDetails?: Array<{
      area: number;
      type: string;
      furnishing: string;
      customisation: string;
    }>;
    studioDetails?: StudioDetails;
  };
  features: string[];
  relevantSectors: string[];
  address: string;
  city: string;
  pincode: string;
  state: string;
  country: string;
  isFeatured: boolean;
  serviceProvider?: {
    serviceName: string;
    _id: string;
    logoUrl?: string | null;
  };
  timings: Timings;
}

export default function ViewDetailsClient({
  facilityId,
  affiliateId
}: {
  facilityId: string;
  affiliateId: string;
}) {
  const { data: session } = useSession();
  const [facility, setFacility] = useState<Facility | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<number>(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [fullscreenIndex, setFullscreenIndex] = useState(0);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [mapUrl, setMapUrl] = useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<RentalPlan | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [contactNumber, setContactNumber] = useState<string>("");
  const [bookingPeriod, setBookingPeriod] = useState<string>("");
  const [isCustomDate, setIsCustomDate] = useState(false);
  const [isProfileLoading, setIsProfileLoading] = useState(true);
  const [unitCount, setUnitCount] = useState(1);
  const [bookingSeats, setBookingSeats] = useState(1);
  const [isExisting, setIsExisting] = useState<boolean | null>(null);
  const [relatedFacilities, setRelatedFacilities] = useState<any[]>([]);
  const [loadingRelatedFacilities, setLoadingRelatedFacilities] = useState(false);
  const [hoveredFacilityId, setHoveredFacilityId] = useState<string | null>(null);
  const [showAllTimings, setShowAllTimings] = useState(false);
  const [currentDay, setCurrentDay] = useState<string>("monday");
  const [processingPayment, setProcessingPayment] = useState(false);
  const [failedBookingId, setFailedBookingId] = useState<string | null>(null);
  const [isAffiliateDialogOpen, setIsAffiliateDialogOpen] = useState(false);
  const [affiliateMailId, setAffiliateMailId] = useState<string>("");
  const [affiliateContactNumber, setAffiliateContactNumber] = useState<string>("");
  const [affiliateContactName, setAffiliateContactName] = useState<string>("");
  const router = useRouter();
  const [priceDetails, setPriceDetails] = useState<{
    isExistingUser: any;
    basePrice: number;
    fixedFee: number;
    gstAmount: number;
    finalPrice: number;
    hasGST: boolean;
    bookingSeats: number;
  } | null>(null);

  useEffect(() => {
    const calculatePrices = async () => {
      if (!selectedPlan) return;

      try {
        const details = await fetchDynamicPrice({
          facilityId,
          rentalPlan: selectedPlan.name,
          unitCount,
          bookingSeats,
        });

        setPriceDetails(details);
      } catch (error) {
        console.error("Error calculating price details:", error);
        const baseAmount = selectedPlan.price * unitCount;
        const fixedServiceFee = getFixedServiceFee(facility?.facilityType || "");
        const totalBaseAmount = baseAmount + fixedServiceFee;
        const gstAmount = 0;
        const totalAmount = totalBaseAmount;

        setPriceDetails({
          basePrice: baseAmount,
          fixedFee: fixedServiceFee,
          gstAmount,
          finalPrice: totalAmount,
          isExistingUser: false,
          hasGST: false,
          bookingSeats: bookingSeats,
        });
      }
    };

    calculatePrices();
  }, [selectedPlan, unitCount, facilityId, bookingSeats]);

  const basePrice = (priceDetails?.basePrice ?? 0) + (priceDetails?.fixedFee ?? 0);
  const fixedFeePerUnit = priceDetails?.fixedFee || getFixedServiceFee(facility?.facilityType || "");
  const fixedServiceFee = priceDetails?.fixedFee;
  const gstAmount = priceDetails?.gstAmount || 0;
  const totalAmount = priceDetails?.finalPrice || 0;

  useEffect(() => {
    const fetchFacility = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/facilities/${facilityId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch facility details");
        }
        const data = await response.json();
        setFacility(data);

        if (data && data.address) {
          const address = `${data.address}, ${data.city}, ${data.state}, ${data.pincode}, ${data.country}`;
          const mapResponse = await fetch(`/api/maps?query=${encodeURIComponent(address)}`);
          if (mapResponse.ok) {
            const mapData = await mapResponse.json();
            setMapUrl(mapData.embedUrl);
          }
        }
      } catch (error) {
        console.error("Error fetching facility:", error);
        setError("Failed to load facility details");
      } finally {
        setLoading(false);
      }
    };

    if (facilityId) {
      fetchFacility();
    }
  }, [facilityId]);

  const sortedRentalPlans = facility?.details?.rentalPlans
    ? [...facility.details.rentalPlans].sort((a, b) => {
        const order = ["Hourly", "One Day (24 Hours)", "Weekly", "Monthly", "Annual"];
        return order.indexOf(a.name) - order.indexOf(b.name);
      })
    : [];

  useEffect(() => {
    if (sortedRentalPlans.length > 0) {
      setBookingPeriod(sortedRentalPlans[0].name);
    }
  }, [sortedRentalPlans]);

  const timeSlots = ["9 AM", "10 AM", "11 AM", "12 PM", "1 PM", "2 PM", "3 PM", "4 PM", "5 PM"];

  const handleDateChange = (date: Date | null) => {
    if (date) {
      setSelectedDate(date);
      setIsCustomDate(false);
    }
  };

  const handleDateTileClick = (date: Date) => {
    setSelectedDate(date);
  };

  const toggleCustomDate = () => {
    setIsCustomDate((prev) => !prev);
  };

  const getMaxSeats = () => {
    if (!facility?.facilityType || !facility.details) return 1;

    switch (facility.facilityType) {
      case "coworking-spaces":
        return facility.details.availableSeats || 1;
      case "meeting-rooms":
        return facility.details.seatingCapacity || 1;
      case "training-rooms":
        return facility.details.totalTrainingRoomSeaters || 1;
      default:
        return 1;
    }
  };

  const handleBookingSubmit = () => {
    if (
      (facility?.facilityType === "individual-cabin" && (facility.details.availableCabins ?? 0) <= 0) ||
      (facility?.facilityType === "coworking-spaces" && (facility.details.availableSeats ?? 0) <= 0) ||
      (facility?.facilityType === "meeting-rooms" &&
        ((facility.details.totalRooms ?? 0) <= 0 ||
          (facility.details.seatingCapacity ?? 0) <= 0 ||
          (facility.details.totalTrainingRoomSeaters ?? 0) <= 0))
    ) {
      toast.error("This facility is currently not available for booking", {
        duration: 3000,
        icon: <AlertCircle className="h-5 w-5 text-red-500" />,
      });
      return;
    }

    if (!selectedDate || !selectedTime || !selectedPlan) {
      toast.error("Please fill in all required fields", {
        duration: 3000,
        icon: <AlertCircle className="h-5 w-5 text-red-500" />,
      });
      return;
    }

    // Open the affiliate dialog instead of processing immediately
    setIsAffiliateDialogOpen(true);
  };

  const handleAffiliateSubmit = async () => {
    if (!affiliateMailId || affiliateContactNumber.length < 10) {
      toast.error("Please provide both email and contact number correctly ", {
        duration: 3000,
        icon: <AlertCircle className="h-5 w-5 text-red-500" />,
      });
      return;
    }

    try {
      setProcessingPayment(true);

      // Send affiliate data to API
      const affiliateResponse = await fetch("/api/affiliate/user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          mailId: affiliateMailId,
          contactNumber: affiliateContactNumber,
          contactName: affiliateContactName,
          affiliateId: affiliateId,
        }),
      });

      if (!affiliateResponse.ok) {
        const errorData = await affiliateResponse.json();
        throw new Error(errorData.error || "Failed to save affiliate user data");
      }

      // Proceed with booking logic
      const startDateTime = new Date(selectedDate!);
      const [hours, minutes] =
        selectedTime.split(" ")[0].split(":").length === 2
          ? selectedTime.split(" ")[0].split(":")
          : [selectedTime.split(" ")[0], "00"];

      const isPM = selectedTime.includes("PM");
      startDateTime.setHours(
        isPM ? (parseInt(hours) === 12 ? 12 : parseInt(hours) + 12) : parseInt(hours) === 12 ? 0 : parseInt(hours),
        parseInt(minutes) || 0,
        0,
        0
      );

      const endDateTime = new Date(startDateTime.getTime());
      switch (selectedPlan!.name) {
        case "Annual":
          endDateTime.setFullYear(endDateTime.getFullYear() + unitCount);
          break;
        case "Monthly":
          endDateTime.setMonth(endDateTime.getMonth() + unitCount);
          break;
        case "Weekly":
          endDateTime.setDate(endDateTime.getDate() + 7 * unitCount);
          break;
        case "One Day (24 Hours)":
          endDateTime.setDate(endDateTime.getDate() + unitCount);
          break;
        case "Hourly":
          endDateTime.setHours(endDateTime.getHours() + unitCount);
          break;
      }

      const bookingDetails = {
        facilityId: facilityId,
        email: affiliateMailId,
        facility: facility,
        rentalPlan: selectedPlan!.name,
        startDate: startDateTime.toISOString(),
        endDate: endDateTime.toISOString(),
        contactNumber: affiliateContactNumber,
        unitCount: unitCount,
        bookingSeats: bookingSeats,
        originalBaseAmount: basePrice,
        serviceFee: fixedServiceFee,
        baseAmount: basePrice,
        gstAmount: gstAmount,
        totalAmount: totalAmount,
      };

      const encodedData = encodeURIComponent(JSON.stringify(bookingDetails));
      router.push(`/bookingDetails?data=${encodedData}`);
      setIsAffiliateDialogOpen(false);
      setAffiliateMailId("");
      setAffiliateContactNumber("");
    } catch (error) {
      console.error("Error processing affiliate data:", error);
      toast.error(error instanceof Error ? error.message : "Failed to process booking", {
        duration: 5000,
        icon: <AlertCircle className="h-5 w-5 text-red-500" />,
      });
    } finally {
      setProcessingPayment(false);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isFullscreen) return;

      switch (e.key) {
        case "ArrowRight":
          if (facility?.details?.images) {
            setFullscreenIndex((prev) => (prev + 1) % facility.details.images.length);
          }
          break;
        case "ArrowLeft":
          if (facility?.details?.images) {
            setFullscreenIndex((prev) => (prev - 1 + facility.details.images.length) % facility.details.images.length);
          }
          break;
        case "Escape":
          setIsFullscreen(false);
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isFullscreen, facility]);

  useEffect(() => {
    const fetchRelatedFacilities = async () => {
      if (!facility?.serviceProviderId) return;

      try {
        setLoadingRelatedFacilities(true);
        const response = await fetch(`/api/facilities/by-provider/${facility.serviceProviderId}`);
        if (!response.ok) {
          throw new Error(`Failed to fetch related facilities: ${response.status}`);
        }
        const data = await response.json();
        const filteredFacilities = data
          .filter((f: any) => f._id !== facilityId)
          .sort((a: any, b: any) => {
            if (a.isFeatured && !b.isFeatured) return -1;
            if (!a.isFeatured && b.isFeatured) return 1;
            return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
          });
        setRelatedFacilities(filteredFacilities);
      } catch (error) {
        console.error("Error fetching related facilities:", error);
        setRelatedFacilities([]);
      } finally {
        setLoadingRelatedFacilities(false);
      }
    };

    if (facility) {
      fetchRelatedFacilities();
    }
  }, [facility, facilityId]);

  useEffect(() => {
    if (sortedRentalPlans.length > 0 && !selectedPlan) {
      setSelectedPlan(sortedRentalPlans[0]);
    }
  }, [sortedRentalPlans]);

  useEffect(() => {
    const days = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
    const today = new Date().getDay();
    setCurrentDay(days[today]);
  }, []);

  const formatDayName = (day: string): string => {
    return day.charAt(0).toUpperCase() + day.slice(1);
  };

  const getTimingText = (timing: DayTiming): string => {
    if (!timing || !timing.isOpen) return "Closed";
    return `${timing.openTime || ""} - ${timing.closeTime || ""}`;
  };

  useEffect(() => {
    const checkFailedPayments = async () => {
      if (!session?.user?.id) return;

      try {
        const response = await fetch(`/api/bookings/failed?facilityId=${facilityId}`);
        if (response.ok) {
          const data = await response.json();
          if (data.bookingId) {
            setFailedBookingId(data.bookingId);
          }
        }
      } catch (error) {
        console.error("Error checking for failed payments:", error);
      }
    };

    checkFailedPayments();
  }, [facilityId, session]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-3"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-6"></div>
          <div className="aspect-video bg-gray-200 rounded mb-6"></div>
        </div>
      </div>
    );
  }

  if (error || !facility || !facility.details) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-3">Error</h2>
          <p className="text-gray-600 mb-4">{error || "Facility not found"}</p>
          <Button onClick={() => window.history.back()} size="sm">
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  const nextImage = () => {
    if (!facility?.details.images) return;
    setFullscreenIndex((prev) => (prev + 1) % facility.details.images.length);
  };

  const previousImage = () => {
    if (!facility?.details.images) return;
    setFullscreenIndex((prev) => (prev - 1 + facility.details.images.length) % facility.details.images.length);
  };

  const openFullscreen = (index: number) => {
    if (facility?.details?.images && index >= 0 && index < facility.details.images.length && facility.details.images[index]) {
      setFullscreenIndex(index);
      setIsFullscreen(true);
    } else {
      console.error("Invalid image index or missing image source");
      toast.error("Could not display image");
    }
  };

  const handleBookNowClick = () => {
    if (session?.user?.userType === "Service Provider") {
      toast.error("Facility Partners cannot make bookings. Please use a startup account to book facilities.", {
        duration: 5000,
        icon: <AlertCircle className="h-5 w-5 text-red-500" />,
      });
      return;
    }
    setIsBookingModalOpen(true);
  };

  return (
    <div className="container mx-auto px-8 py-12 max-w-7xl">
      {failedBookingId && <PaymentFailedBanner bookingId={failedBookingId} />}
      {facility.details.images && facility.details.images.length > 0 && (
        <div className="mb-8">
          {facility.details.images.length === 1 && !facility.details.videoLink ? (
            <div className="relative aspect-[16/9] w-full">
              <Image
                src={facility.details.images[0]}
                alt={facility.details.name}
                fill
                className="rounded-md object-cover cursor-pointer"
                onClick={() => openFullscreen(0)}
              />
            </div>
          ) : (
            <div className="grid grid-cols-12 gap-3">
              <div className="col-span-12 md:col-span-8 relative aspect-[16/9]">
                {facility.details.videoLink && getYouTubeVideoId(facility.details.videoLink) ? (
                  <iframe
                    src={`https://www.youtube.com/embed/${getYouTubeVideoId(facility.details.videoLink)}`}
                    title={`${facility.details.name} Video`}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="absolute inset-0 w-full h-full rounded-md"
                  />
                ) : (
                  <Image
                    src={facility.details.images[selectedImage]}
                    alt={facility.details.name}
                    fill
                    className="rounded-md object-cover cursor-pointer"
                    onClick={() => openFullscreen(selectedImage)}
                  />
                )}
              </div>
              <div className="col-span-12 md:col-span-4 grid grid-cols-2 gap-3 h-full">
                {facility.details.images.map((image, index) => {
                  if (index >= 4) return null;
                  if (facility.details.videoLink && getYouTubeVideoId(facility.details.videoLink)) {
                    return (
                      <div key={index} className="relative aspect-square">
                        <Image
                          src={image}
                          alt={`${facility.details.name} - Image ${index + 1}`}
                          fill
                          className="rounded-md object-cover cursor-pointer hover:opacity-90 transition-opacity"
                          onClick={() => openFullscreen(index)}
                        />
                      </div>
                    );
                  }
                  if (index === selectedImage) return null;
                  return (
                    <div key={index} className="relative aspect-square">
                      <Image
                        src={image}
                        alt={`${facility.details.name} - Image ${index + 1}`}
                        fill
                        className="rounded-md object-cover cursor-pointer hover:opacity-90 transition-opacity"
                        onClick={() => openFullscreen(index)}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
      <div className="grid grid-cols-12 gap-8 mb-12">
        <div className="col-span-12 lg:col-span-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{facility.details.name}</h1>
            <p className="text-gray-600">{facility.address}</p>
          </div>
          <div className="mb-10 flex flex-wrap gap-3">
            {facility.facilityType === "individual-cabin" && (
              <>
                <div className="inline-block border border-gray-200 rounded-md p-3">
                  <div className="flex items-center gap-2">
                    <div>
                      <div className="text-gray-500 text-xs mb-1">Total Cabins</div>
                      <div className="text-lg font-medium text-gray-800">{facility.details.totalCabins || 0}</div>
                    </div>
                  </div>
                </div>
                <div className="inline-block border border-gray-200 rounded-md p-3">
                  <div className="flex items-center gap-2">
                    <div>
                      <div className="text-gray-500 text-xs mb-1">Available Cabins</div>
                      <div className="text-lg font-medium text-gray-800">{facility.details.availableCabins || 0}</div>
                    </div>
                  </div>
                </div>
              </>
            )}
            {facility.facilityType === "coworking-spaces" && (
              <>
                <div className="inline-block border border-gray-200 rounded-md p-3">
                  <div className="flex items-center gap-2">
                    <div>
                      <div className="text-gray-500 text-xs mb-1">Total Seaters</div>
                      <div className="text-lg font-medium text-gray-800">{facility.details.totalSeats || 0}</div>
                    </div>
                  </div>
                </div>
                <div className="inline-block border border-gray-200 rounded-md p-3">
                  <div className="flex items-center gap-2">
                    <div>
                      <div className="text-gray-500 text-xs mb-1">Available Seats</div>
                      <div className="text-lg font-medium text-gray-800">{facility.details.availableSeats || 0}</div>
                    </div>
                  </div>
                </div>
              </>
            )}
            {facility.facilityType === "meeting-rooms" && (
              <>
                <div className="inline-block border border-gray-200 rounded-md p-3">
                  <div className="flex items-center gap-2">
                    <div>
                      <div className="text-gray-500 text-xs mb-1">Total Rooms</div>
                      <div className="text-lg font-medium text-gray-800">{facility.details.totalRooms || 0}</div>
                    </div>
                  </div>
                </div>
                <div className="inline-block border border-gray-200 rounded-md p-3">
                  <div className="flex items-center gap-2">
                    <div>
                      <div className="text-gray-500 text-xs mb-1">Seating Capacity</div>
                      <div className="text-lg font-medium text-gray-800">{facility.details.seatingCapacity || 0}</div>
                    </div>
                  </div>
                </div>
                <div className="inline-block border border-gray-200 rounded-md p-3">
                  <div className="flex items-center gap-2">
                    <div>
                      <div className="text-gray-500 text-xs mb-1">Training Room Seats</div>
                      <div className="text-lg font-medium text-gray-800">{facility.details.totalTrainingRoomSeaters || 0}</div>
                    </div>
                  </div>
                </div>
              </>
            )}
            {(facility.facilityType === "bio-allied-labs" ||
              facility.facilityType === "manufacturing-labs" ||
              facility.facilityType === "prototyping-labs") &&
              facility.details.equipment &&
              facility.details.equipment.length > 0 && (
                <>
                  {facility.details.equipment.slice(0, 2).map((item, index) => (
                    <div key={index} className="inline-block border border-gray-200 rounded-md p-3">
                      <div className="flex items-center gap-2">
                        <div>
                          <div className="text-gray-500 text-xs mb-1">{item.labName || "Lab"}</div>
                          <div className="text-lg font-medium text-gray-800">{item.equipmentName || "Equipment"}</div>
                          <div className="text-xs text-gray-500">{item.capacityAndMake || ""}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                  {facility.details.equipment.length > 2 && (
                    <div className="inline-block border border-gray-200 rounded-md p-3">
                      <div className="flex items-center gap-2">
                        <div>
                          <div className="text-gray-500 text-xs mb-1">More Equipment</div>
                          <div className="text-lg font-medium text-gray-800">+{facility.details.equipment.length - 2}</div>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            {facility.facilityType === "software" &&
              facility.details.equipment &&
              facility.details.equipment.length > 0 && (
                <>
                  {facility.details.equipment.slice(0, 2).map((item, index) => (
                    <div key={index} className="inline-block border border-gray-200 rounded-md p-3">
                      <div className="flex items-center gap-2">
                        <div>
                          <div className="text-gray-500 text-xs mb-1">Software</div>
                          <div className="text-lg font-medium text-gray-800">{item.softwareName || "Software"}</div>
                          <div className="text-xs text-gray-500">Version: {item.version || "N/A"}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                  {facility.details.equipment.length > 2 && (
                    <div className="inline-block border border-gray-200 rounded-md p-3">
                      <div className="flex items-center gap-2">
                        <div>
                          <div className="text-gray-500 text-xs mb-1">More Software</div>
                          <div className="text-lg font-medium text-gray-800">+{facility.details.equipment.length - 2}</div>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            {facility.facilityType === "saas-allied" &&
              facility.details.equipment &&
              facility.details.equipment.length > 0 && (
                <>
                  {facility.details.equipment.slice(0, 2).map((item, index) => (
                    <div key={index} className="inline-block border border-gray-200 rounded-md p-3">
                      <div className="flex items-center gap-2">
                        <div>
                          <div className="text-gray-500 text-xs mb-1">Service</div>
                          <div className="text-lg font-medium text-gray-800">{item.equipmentName || "Service"}</div>
                          <div className="text-xs text-gray-500">{item.capacityAndMake || ""}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                  {facility.details.equipment.length > 2 && (
                    <div className="inline-block border border-gray-200 rounded-md p-3">
                      <div className="flex items-center gap-2">
                        <div>
                          <div className="text-gray-500 text-xs mb-1">More Services</div>
                          <div className="text-lg font-medium text-gray-800">+{facility.details.equipment.length - 2}</div>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            {(facility.facilityType === "raw-space-office" ||
              facility.facilityType === "raw-space-lab") &&
              facility.details.areaDetails &&
              facility.details.areaDetails.length > 0 && (
                <>
                  {facility.details.areaDetails.map((area, index) => (
                    <div key={index} className="inline-block border border-gray-200 rounded-md p-3">
                      <div className="flex items-center gap-2">
                        <div>
                          <div className="text-gray-500 text-xs mb-1">{area.type || "Area"}</div>
                          <div className="text-lg font-medium text-gray-800">{area.area} <span className="text-xs text-gray-500">sq.ft</span></div>
                        </div>
                      </div>
                    </div>
                  ))}
                  {facility.details.areaDetails[0]?.furnishing && (
                    <div className="inline-block border border-gray-200 rounded-md p-3">
                      <div className="flex items-center gap-2">
                        <div>
                          <div className="text-gray-500 text-xs mb-1">Furnishing</div>
                          <div className="text-lg font-medium text-gray-800">{facility.details.areaDetails[0].furnishing}</div>
                        </div>
                      </div>
                    </div>
                  )}
                  {facility.details.areaDetails[0]?.customisation && (
                    <div className="inline-block border border-gray-200 rounded-md p-3">
                      <div className="flex items-center gap-2">
                        <div>
                          <div className="text-gray-500 text-xs mb-1">Customisation</div>
                          <div className="text-lg font-medium text-gray-800">{facility.details.areaDetails[0].customisation}</div>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            {facility.facilityType === "studio" && facility.details.studioDetails && (
              <>
                <div className="inline-block border border-gray-200 rounded-md p-3">
                  <div className="flex items-center gap-2">
                    <Mic className="h-5 w-5 text-gray-600" />
                    <div>
                      <div className="text-gray-500 text-xs mb-1">Suitable For</div>
                      <div className="text-lg font-medium text-gray-800">{facility.details.studioDetails.suitableFor.join(", ")}</div>
                    </div>
                  </div>
                </div>
                {facility.details.studioDetails.isSoundProof && (
                  <div className="inline-block border border-gray-200 rounded-md p-3">
                    <div className="flex items-center gap-2">
                      <Volume2 className="h-5 w-5 text-gray-600" />
                      <div>
                        <div className="text-gray-500 text-xs mb-1">Sound Proof</div>
                        <div className="text-lg font-medium text-gray-800">Yes</div>
                      </div>
                    </div>
                  </div>
                )}
                {facility.details.studioDetails.hasAmpleLighting && (
                  <div className="inline-block border border-gray-200 rounded-md p-3">
                    <div className="flex items-center gap-2">
                      <Lightbulb className="h-5 w-5 text-gray-600" />
                      <div>
                        <div className="text-gray-500 text-xs mb-1">Ample Lighting</div>
                        <div className="text-lg font-medium text-gray-800">Yes</div>
                      </div>
                    </div>
                  </div>
                )}
                {facility.details.studioDetails.equipmentDetails &&
                  facility.details.studioDetails.equipmentDetails.length > 0 && (
                    <>
                      {facility.details.studioDetails.equipmentDetails.slice(0, 2).map((item, index) => (
                        <div key={index} className="inline-block border border-gray-200 rounded-md p-3">
                          <div className="flex items-center gap-2">
                            <div>
                              <div className="text-gray-500 text-xs mb-1">Equipment</div>
                              <div className="text-lg font-medium text-gray-800">{item.name}</div>
                              <div className="text-xs text-gray-500">{item.model} (Qty: {item.quantity})</div>
                            </div>
                          </div>
                        </div>
                      ))}
                      {facility.details.studioDetails.equipmentDetails.length > 2 && (
                        <div className="inline-block border border-gray-200 rounded-md p-3">
                          <div className="flex items-center gap-2">
                            <div>
                              <div className="text-gray-500 text-xs mb-1">More Equipment</div>
                              <div className="text-lg font-medium text-gray-800">+{facility.details.studioDetails.equipmentDetails.length - 2}</div>
                            </div>
                          </div>
                        </div>
                      )}
                    </>
                  )}
              </>
            )}
            {!facility.facilityType ||
              (facility.facilityType !== "individual-cabin" &&
                facility.facilityType !== "coworking-spaces" &&
                facility.facilityType !== "meeting-rooms" &&
                facility.facilityType !== "bio-allied-labs" &&
                facility.facilityType !== "manufacturing-labs" &&
                facility.facilityType !== "prototyping-labs" &&
                facility.facilityType !== "software" &&
                facility.facilityType !== "saas-allied" &&
                facility.facilityType !== "raw-space-office" &&
                facility.facilityType !== "raw-space-lab" &&
                facility.facilityType !== "studio" && (
                  <div className="inline-block border border-gray-200 rounded-md p-3">
                    <div className="flex items-center gap-2">
                      <div>
                        <div className="text-gray-500 text-xs mb-1">Facility Space</div>
                        <div className="text-lg font-medium text-gray-800">1400 <span className="text-xs text-gray-500">sq.ft</span></div>
                      </div>
                    </div>
                  </div>
                ))}
          </div>
          <div className="flex items-center gap-3 mb-10 pb-6 border-b border-gray-100">
            <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
              {facility.serviceProvider?.logoUrl && typeof facility.serviceProvider.logoUrl === "string" ? (
                <Image
                  src={facility.serviceProvider.logoUrl}
                  alt={facility.serviceProvider.serviceName || "Service Provider"}
                  width={48}
                  height={48}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-xl font-semibold text-green-600">{facility.serviceProvider?.serviceName ? facility.serviceProvider.serviceName.charAt(0) : "S"}</span>
              )}
            </div>
            <div>
              <p className="font-medium">
                Hosted by{" "}
                {facility.serviceProvider?.serviceName && facility.serviceProvider?._id ? (
                  <Link href={`/ViewProvider/${facility.serviceProvider._id}`} className="font-bold text-green-600 hover:text-green-700 hover:underline cursor-pointer">
                    {facility.serviceProvider.serviceName}
                  </Link>
                ) : (
                  <span>Service Provider</span>
                )}
                {!facility.serviceProvider?.serviceName && (
                  <span className="text-xs text-gray-500 ml-2">(Service provider info unavailable)</span>
                )}
              </p>
              <p className="text-sm text-gray-600">
                {loadingRelatedFacilities ? (
                  <span className="inline-flex items-center">
                    <span className="h-2 w-2 bg-gray-300 rounded-full animate-pulse mr-2"></span>
                    Loading facilities...
                  </span>
                ) : relatedFacilities.length > 0 ? (
                  `${relatedFacilities.length} more ${relatedFacilities.length === 1 ? "facility" : "facilities"}`
                ) : (
                  "No other facilities"
                )}
              </p>
            </div>
          </div>
          <div className="mb-10">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">About this space</h2>
            <p className="text-gray-600 whitespace-pre-line">{facility.details.description}</p>
          </div>
          {facility.features && facility.features.length > 0 && (
            <div className="mb-10">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">Venue Amenities</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {facility.features.map((feature, index) => {
                  const IconComponent = AMENITY_ICONS[feature as keyof typeof AMENITY_ICONS] || AMENITY_ICONS["Other"];
                  return (
                    <div key={index} className="flex items-center gap-3">
                      <IconComponent className="h-5 w-5 text-gray-600" />
                      <span className="text-gray-700">{feature}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          {facility.relevantSectors && facility.relevantSectors.length > 0 && (
            <div className="mb-10">
              <div className="space-y-2">
                <div className="border border-gray-200 rounded-md p-4">
                  <h4 className="text-lg font-semibold mb-3">Sector</h4>
                  <div className="flex flex-wrap gap-3">
                    {facility.relevantSectors.map((sector, index) => (
                      <span key={index} className="px-4 py-2 border border-green-600 text-black rounded-full text-sm font-medium whitespace-nowrap">
                        {sector.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
          <div className="mb-10">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Venue Timings</h2>
            {facility.timings && (
              <div className="space-y-2">
                <div className="border border-gray-200 rounded-md overflow-hidden">
                  <div className="bg-gray-50 py-3 px-4 flex justify-between items-center cursor-pointer" onClick={() => setShowAllTimings(!showAllTimings)}>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gray-600" />
                      <span className="font-medium">{formatDayName(currentDay)}</span>
                      <Badge variant="outline" className="ml-2 text-xs bg-blue-50 text-blue-700 border-blue-200">Today</Badge>
                    </div>
                    <div className="flex items-center">
                      <span className="text-gray-700 mr-2">{getTimingText(facility.timings[currentDay as keyof Timings])}</span>
                      {showAllTimings ? <ChevronUp className="h-4 w-4 text-gray-500" /> : <ChevronDown className="h-4 w-4 text-gray-500" />}
                    </div>
                  </div>
                  <AnimatePresence>
                    {showAllTimings && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3, ease: "easeInOut" }} className="overflow-hidden">
                        <div className="divide-y divide-gray-200">
                          {["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"].filter((day) => day !== currentDay).map((day) => (
                            <div key={day} className="py-3 px-4 flex justify-between items-center">
                              <span>{formatDayName(day)}</span>
                              <span className="text-gray-700">{getTimingText(facility.timings[day as keyof Timings])}</span>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            )}
          </div>
          <div className="mb-10">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Address</h2>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span className="text-gray-600">City</span>
                <span>{facility.city}</span>
                <span className="text-gray-600">Pincode</span>
                <span>{facility.pincode}</span>
                <span className="text-gray-600">State</span>
                <span>{facility.state}</span>
                <span className="text-gray-600">Country</span>
                <span>{facility.country}</span>
              </div>
              <div className="w-full h-[250px] rounded-lg overflow-hidden cursor-pointer relative border border-gray-200" onClick={() => {
                  const address = encodeURIComponent(`${facility.address}, ${facility.city}, ${facility.state}, ${facility.pincode}, ${facility.country}`);
                  window.open(`https://www.google.com/maps/search/?api=1&query=${address}`, "_blank");
                }}>
                <iframe width="100%" height="100%" style={{ border: 0 }} loading="lazy" allowFullScreen referrerPolicy="no-referrer-when-downgrade" src={mapUrl || ""} />
                <div className="absolute inset-0 bg-transparent hover:bg-black/5 transition-colors" />
              </div>
            </div>
          </div>
        </div>
        <div className="col-span-12 lg:col-span-4">
          <div className="sticky top-8">
            <div className="bg-white rounded-xl shadow-lg border overflow-hidden">
              <div className="p-6 border-b">
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>Number of Seats</span>
                    <span>{bookingSeats}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>
                      Base Price {unitCount > 1 || bookingSeats > 1 ? (
                        <>
                          ({bookingSeats} × ₹{(basePrice / (unitCount * bookingSeats)).toFixed(2)})
                        </>
                      ) : (
                        ""
                      )}
                    </span>
                    <span>₹{basePrice?.toFixed(2) ?? "0.00"}</span>
                  </div>
                  {gstAmount !== 0 && (
                    <div className="flex justify-between">
                      <span>GST (18%)</span>
                      <span>₹{gstAmount?.toFixed(2) ?? "0.00"}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-semibold pt-3 border-t">
                    <span>Total Fare</span>
                    <span>₹{totalAmount?.toFixed(2) ?? "0.00"}</span>
                  </div>
                </div>
                <div className="text-sm text-gray-600">
                  {selectedPlan?.name === "Monthly" && `for ${unitCount} month${unitCount > 1 ? "s" : ""}`}
                  {selectedPlan?.name === "Annual" && `for ${unitCount} year${unitCount > 1 ? "s" : ""}`}
                  {selectedPlan?.name === "Weekly" && `for ${unitCount} week${unitCount > 1 ? "s" : ""}`}
                  {selectedPlan?.name === "One Day (24 Hours)" && `for ${unitCount} day${unitCount > 1 ? "s" : ""}`}
                  {selectedPlan?.name === "Hourly" && `for ${unitCount} hour${unitCount > 1 ? "s" : ""}`}
                </div>
              </div>
              <div className="p-6">
                <div className="mb-6">
                  <h3 className="text-sm font-medium mb-3">
                    Choose Booking Duration
                  </h3>
                  {sortedRentalPlans.length > 0 ? (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        {sortedRentalPlans.map((plan) => {
                          const isSelected = selectedPlan?.name === plan.name;

                          // Fallback pricing for non-selected plans
                          const fallbackPrice =
                            plan.price


                          // Use dynamic price if selected and available
                          const totalPrice =
                            isSelected && priceDetails
                              ? priceDetails.finalPrice
                              : fallbackPrice;

                          return (
                            <button
                              key={plan.name}
                              onClick={() => {
                                setSelectedPlan(plan);
                                setSelectedDate(null);
                                setSelectedTime("");
                                setUnitCount(1);
                                setPriceDetails(null); // Reset old price while fetching new
                              }}
                              className={`w-full flex items-center justify-between p-3 rounded-lg border transition-all ${isSelected
                                ? "border-primary bg-primary/5 text-primary"
                                : "border-gray-200 hover:border-primary/50"
                                }`}
                            >
                              <span className="font-medium">
                                {plan.name === "One Day (24 Hours)"
                                  ? "Daily"
                                  : plan.name}
                              </span>

                              <span className="text-sm font-medium">
                                {isSelected && !priceDetails ? (
                                  <span className="text-gray-400 animate-pulse">
                                    Calculating...
                                  </span>
                                ) : (
                                  `₹${totalPrice.toLocaleString()}`
                                )}
                              </span>
                            </button>
                          );
                        })}
                      </div>

                      {/* Unit Counter */}
                      {selectedPlan && (
                        <div className="flex items-center justify-between p-3 rounded-lg border border-gray-200">
                          <span className="text-sm font-medium">
                            Number of{" "}
                            {selectedPlan.name === "Annual"
                              ? "years"
                              : selectedPlan.name === "Monthly"
                                ? "months"
                                : selectedPlan.name === "Weekly"
                                  ? "weeks"
                                  : selectedPlan.name === "One Day (24 Hours)"
                                    ? "days"
                                    : "hours"}
                          </span>
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() =>
                                setUnitCount(Math.max(1, unitCount - 1))
                              }
                              className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-200 hover:border-primary/50 transition-colors"
                              type="button"
                            >
                              <span className="text-lg">-</span>
                            </button>
                            <span className="w-8 text-center font-medium">
                              {unitCount}
                            </span>
                            <button
                              onClick={() => setUnitCount(unitCount + 1)}
                              className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-200 hover:border-primary/50 transition-colors"
                              type="button"
                            >
                              <span className="text-lg">+</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">
                      No rental plans available for this facility.
                    </p>
                  )}
                </div>
                <div className="mb-6">
                  <h3 className="text-sm font-medium mb-3">Choose Booking Seats</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 rounded-lg border border-gray-200">
                      <span className="text-sm font-medium">Number of Seats</span>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => setBookingSeats(Math.max(1, bookingSeats - 1))}
                          className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-200 hover:border-primary/50 transition-colors"
                          type="button"
                        >
                          <span className="text-lg">-</span>
                        </button>
                        <span className="w-8 text-center font-medium">{bookingSeats}</span>
                        <button
                          onClick={() => setBookingSeats((prev) => Math.min(getMaxSeats(), prev + 1))}
                          disabled={bookingSeats >= getMaxSeats()}
                          className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-200 hover:border-primary/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          type="button"
                        >
                          <span className="text-lg">+</span>
                        </button>
                      </div>
                    </div>
                    {priceDetails && (
                      <div className="flex justify-between p-3 rounded-lg border border-gray-200">
                        <span className="text-sm font-medium">Total Price</span>
                        <span className="text-sm font-semibold text-primary">₹{priceDetails.finalPrice.toLocaleString()}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 mb-6">
                  <div>
                    <Label htmlFor="date-select" className="text-sm font-medium mb-1.5 block">Choose Date</Label>
                    <div className="relative">
                      <DatePicker
                        selected={selectedDate}
                        onChange={handleDateChange}
                        minDate={new Date()}
                        placeholderText="Select date"
                        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                        wrapperClassName="w-full"
                        popperClassName="z-50"
                        popperPlacement="bottom-start"
                        customInput={<Input id="date-select" className="pl-3 pr-8" />}
                      />
                      <CalendarIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="time-select" className="text-sm font-medium mb-1.5 block">Choose Time</Label>
                    <select
                      id="time-select"
                      value={selectedTime}
                      onChange={(e) => setSelectedTime(e.target.value)}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                    >
                      <option value="">Select time</option>
                      {timeSlots.map((time) => (
                        <option key={time} value={time}>{time}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <Button
                  className="w-full text-base font-semibold py-6"
                  onClick={handleBookingSubmit}
                  disabled={!selectedPlan || processingPayment}
                >
                  {processingPayment ? (
                    <span className="flex items-center justify-center">
                      <span className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-white"></span>
                      Processing...
                    </span>
                  ) : (
                    "Book Now"
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
      {facility.serviceProviderId && (
        <div className="mb-16">
          <h2 className="text-2xl font-bold mb-6 text-gray-900">
            More facilities from{" "}
            {facility.serviceProvider?.serviceName && facility.serviceProvider?._id ? (
              <Link href={`/ViewProvider/${facility.serviceProvider._id}`} className="font-bold text-green-600 hover:text-green-700 hover:underline cursor-pointer">
                {facility.serviceProvider.serviceName}
              </Link>
            ) : (
              "this provider"
            )}
          </h2>
          <div className="relative">
            {loadingRelatedFacilities ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {Array.from({ length: 4 }).map((_, index) => (
                  <FacilityCardSkeleton key={index} />
                ))}
              </div>
            ) : relatedFacilities.length > 0 ? (
              <div className="overflow-x-auto pb-4 hide-scrollbar">
                <div className="flex gap-4">
                  {relatedFacilities.map((relatedFacility) => (
                    <div key={relatedFacility._id} style={{ width: "300px", height: "400px" }} className="flex-shrink-0">
                      <FacilityCard
                        facility={relatedFacility}
                        isHovered={hoveredFacilityId === relatedFacility._id}
                        onMouseEnter={() => setHoveredFacilityId(relatedFacility._id)}
                        onMouseLeave={() => setHoveredFacilityId(null)}
                        isFeatured={relatedFacility.isFeatured}
                        className="h-full"
                      />
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 rounded-lg p-8 text-center">
                <p className="text-gray-500">No other facilities available from this provider.</p>
                {facility.serviceProvider?.serviceName && facility.serviceProvider?._id && (
                  <p className="text-sm text-gray-400 mt-2">
                    This is the only facility listed by{" "}
                    <Link href={`/ViewProvider/${facility.serviceProvider._id}`} className="text-green-600 hover:text-green-700 hover:underline cursor-pointer">
                      {facility.serviceProvider.serviceName}
                    </Link>
                    .
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      )}
      <Reviews facilityId={facilityId} serviceProvider={facility.serviceProviderId} />
      {isFullscreen && facility.details.images && facility.details.images.length > 0 && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center">
          <div className="relative w-full h-full flex items-center justify-center">
            <button className="absolute top-4 right-4 text-white p-2 rounded-full hover:bg-white/10 transition-colors z-10" onClick={() => setIsFullscreen(false)}>
              <X className="h-8 w-8" />
            </button>
            {facility.details.images.length > 1 && (
              <>
                <button className="absolute left-4 text-white p-2 rounded-full hover:bg-white/10 transition-colors z-10" onClick={previousImage}>
                  <ChevronLeft className="h-8 w-8" />
                </button>
                <button className="absolute right-4 text-white p-2 rounded-full hover:bg-white/10 transition-colors z-10" onClick={nextImage}>
                  <ChevronRight className="h-8 w-8" />
                </button>
              </>
            )}
            <div className="relative w-full h-full max-w-5xl max-h-[80vh] flex items-center justify-center">
              <Image
                src={facility.details.images[fullscreenIndex]}
                alt={`${facility.details.name} - Image ${fullscreenIndex + 1}`}
                fill
                className="object-contain"
              />
            </div>
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
              {fullscreenIndex + 1} / {facility.details.images.length}
            </div>
          </div>
        </div>
      )}
      {facility && (
        <BookingModal
          isOpen={isBookingModalOpen}
          onClose={() => setIsBookingModalOpen(false)}
          facility={facility}
        />
      )}
      <Dialog open={isAffiliateDialogOpen} onOpenChange={(open) => {
        setIsAffiliateDialogOpen(open);
        if (!open) {
          setAffiliateMailId("");
          setAffiliateContactNumber("");
        }
      }}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Enter Your Details</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="affiliate-email">Email</Label>
              <Input
                id="affiliate-email"
                type="email"
                value={affiliateMailId}
                onChange={(e) => setAffiliateMailId(e.target.value)}
                placeholder="Enter your email"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="affiliate-contact">Contact Number</Label>
              <Input
  id="affiliate-contact"
  type="tel"
  value={affiliateContactNumber}
  onChange={(e) => {
    const value = e.target.value;
    // Allow only numbers up to 10 digits
    if (/^\d{0,10}$/.test(value)) {
      setAffiliateContactNumber(value);
    }
  }}
  min={10}
  placeholder="Enter your contact number"
  required
  pattern="^[6-9]\d{9}$"
  title="Please enter a valid 10-digit Indian mobile number"
/>

            </div>
             <div className="grid gap-2">
              <Label htmlFor="affiliate-contact">Contact Name</Label>
              <Input
                id="affiliate-contact"
                type="text"
                value={affiliateContactName}
                onChange={(e) => setAffiliateContactName(e.target.value)}
                placeholder="Enter your contact name"
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsAffiliateDialogOpen(false);
                setAffiliateMailId("");
                setAffiliateContactNumber("");
              }}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleAffiliateSubmit}
              disabled={processingPayment}
            >
              {processingPayment ? (
                <span className="flex items-center">
                  <span className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-white"></span>
                  Processing...
                </span>
              ) : (
                "Submit"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
