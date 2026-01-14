"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { formatCurrency } from "@/lib/utils";
import { format } from "date-fns";

import {
  ArrowLeft,
  Download,
  Wifi,
  Power,
  Monitor,
  UserCircle,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";
import { Spinner } from "@/components/spinner";
import { AMENITY_ICONS } from "@/components";

interface BookingDetails {
  _id: string;
  bookingId: string;
  rentalPlan: string;
  status: string;
  paymentStatus: string;
  amount: number;
  baseAmount?: number;
  gstAmount?: number;
  serviceFee?: number;
  startDate: string;
  endDate: string;
  whatsappNumber: string;
  unitCount?: number;
  bookingSeats?: number; // Number of booking slots selected
  facility: {
    name: string;
    facilityType: string;
    images: string[];
    address: string;
    city: string;
    state: string;
  };
  startup: {
    startupName: string;
    logoUrl: string;
    founderName: string;
    primaryContactNumber: string;
    city: string;
    emailId: string;
  };
  serviceProvider: {
    serviceName: string;
    logoUrl: string;
    features?: string[];
  };
  invoiceUrl?: string | null;
  invoiceEmailHistory?: Array<{
    sentTo: string;
    sentAt: string;
    sentBy: string;
  }>;
}

export default function BookingDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [bookingDetails, setBookingDetails] = useState<BookingDetails | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBookingDetails = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch(`/api/bookings/${params.id}`);

        if (!response.ok) {
          throw new Error(
            `Failed to fetch booking details: ${response.status}`
          );
        }

        const data = await response.json();
        //// console.log(data, `for service provider booking detail`);
        // Fetch service provider details if serviceProviderId exists
        let serviceProviderData = null;
        if (data.serviceProviderId) {
          try {
            const spResponse = await fetch(
              `/api/service-providers/${data.serviceProviderId}`
            );
            if (spResponse.ok) {
              serviceProviderData = await spResponse.json();
            }
          } catch (error) {
            // Silent catch - continue with null data
          }
        }

        // Fetch startup details if bookedBy exists
        let startupData = null;
        if (data.bookedBy) {
          try {
            const startupResponse = await fetch(
              `/api/startup_by_userid?userId=${data.bookedBy}`
            );
            if (startupResponse.ok) {
              startupData = await startupResponse.json();
            }
          } catch (error) {
            // Silent catch - continue with null data
          }
        }

        // Fetch facility details to get complete data including images
        let facilityData = null;
        if (data.facilityId) {
          try {
            const facilityResponse = await fetch(
              `/api/facilities/${data.facilityId}`
            );
            if (facilityResponse.ok) {
              facilityData = await facilityResponse.json();
            }
          } catch (error) {
            // Silent catch - continue with null data
          }
        }

        // Get images from the API response
        let facilityImages: string[] = [];

        // Try to extract images from various possible paths in the data
        if (
          facilityData &&
          facilityData.details &&
          Array.isArray(facilityData.details.images)
        ) {
          // First priority: direct facility data if available
          facilityImages = facilityData.details.images;
        } else if (
          data.facility &&
          data.facility.details &&
          Array.isArray(data.facility.details.images)
        ) {
          // Second priority: nested facility.details.images
          facilityImages = data.facility.details.images;
        } else if (data.facility && Array.isArray(data.facility.images)) {
          // Third priority: facility.images (flattened structure)
          facilityImages = data.facility.images;
        }

        // Transform data to match BookingDetails interface if needed
        // This handles potential differences in API response structure
        const transformedData: BookingDetails = {
          _id: data._id || "",
          bookingId: data.bookingId || data._id || "",
          rentalPlan: data.rentalPlan || "",
          status: data.status || "",
          paymentStatus: data.paymentStatus || "",
          amount: data.amount || 0,
          baseAmount: data.baseAmount,
          gstAmount: data.gstAmount,
          startDate: data.startDate || "",
          endDate: data.endDate || "",
          whatsappNumber: data.whatsappNumber || "",
          invoiceUrl: data.invoiceUrl || null,
          invoiceEmailHistory: data.invoiceEmailHistory || [],
          serviceFee: data.serviceFee || 0,
          unitCount: data.unitCount || 1,
          bookingSeats: data.bookingSeats || 1, // Default to 1 if not provided
          // Handle nested facility data
          facility: {
            name:
              data.facilityName ||
              facilityData?.details?.name ||
              data.facility?.details?.name ||
              data.facility?.name ||
              "",
            facilityType:
              data.facilityType ||
              facilityData?.facilityType ||
              data.facility?.facilityType ||
              "",
            images: facilityImages,
            address:
              data.address ||
              facilityData?.address ||
              data.facility?.address ||
              "",
            city: data.city || facilityData?.city || data.facility?.city || "",
            state:
              data.state || facilityData?.state || data.facility?.state || "",
          },

          // Handle startup data, prioritizing the fetched startup details
          startup: {
            startupName: startupData?.startupName || "",
            logoUrl: startupData?.logoUrl || "",
            founderName: startupData?.contactName || "",
            primaryContactNumber:
              startupData?.contactNumber || data.whatsappNumber || "",
            city: startupData?.city || "",
            emailId: startupData?.email || "",
          },

          // Handle service provider data, prioritizing the fetched service provider details
          serviceProvider: {
            serviceName: serviceProviderData?.serviceName || "",
            logoUrl: serviceProviderData?.logoUrl || "",
            features: serviceProviderData?.features || [],
          },
        };

        setBookingDetails(transformedData);
      } catch (error) {
        console.error("Error fetching booking details:", error);
        setError("Failed to load booking details. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    if (params.id) {
      fetchBookingDetails();
    }
  }, [params.id]);

  // Format date to display in the format: Sun, 02 May 2025 by 02:00 PM
  const formatDateWithTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const formattedDate = format(date, "EEE, dd MMM yyyy");
      const formattedTime = format(date, "hh:mm a");
      return {
        date: formattedDate,
        time: formattedTime,
        fullDisplay: `${formattedDate} by ${formattedTime}`,
      };
    } catch (e) {
      return { date: "Invalid date", time: "", fullDisplay: "Invalid date" };
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !bookingDetails) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h2 className="text-xl font-semibold mb-4">Error</h2>
        <p className="text-gray-500 mb-6">
          {error || "Booking details not found"}
        </p>
        <button
          onClick={() => router.push("/service-provider/bookings")}
          className="flex items-center gap-2 text-primary font-medium"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Bookings
        </button>
      </div>
    );
  }

  const checkInInfo = formatDateWithTime(bookingDetails.startDate);
  const checkOutInfo = formatDateWithTime(bookingDetails.endDate);

  return (
    <div className="container max-w-7xl py-6 font-['Plus_Jakarta_Sans']">
      {/* Back button and page title */}
      <div className="flex items-center gap-4 mb-6">
        <Link
          href="/service-provider/bookings"
          className="flex items-center text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft className="h-5 w-5" />
          <span className="ml-2 text-lg">Back</span>
        </Link>
        <h1 className="text-3xl font-bold text-[#222222]">Booking Details</h1>
      </div>

      {/* Main Content - Two column layout */}
      <div className="flex flex-col lg:flex-row gap-6 justify-between">
        {/* Left Column - Main content */}
        <div className="flex-1">
          <div className="bg-white border border-[rgba(34,34,34,0.3)] border-opacity-30 rounded-[20px] p-5 h-full">
            {/* Top section with facility details */}
            <div className="flex flex-col md:flex-row gap-5 mb-6">
              {/* Facility image */}
              <div className="flex-shrink-0">
                {bookingDetails.facility &&
                bookingDetails.facility.images &&
                bookingDetails.facility.images.length > 0 ? (
                  <div className="relative h-[180px] w-[180px] rounded-[10px] overflow-hidden bg-[#f8f8f8]">
                    <Image
                      src={bookingDetails.facility.images[0]}
                      alt={bookingDetails.facility.name || "Facility"}
                      className="object-cover"
                      fill
                      onError={(e) => {
                        // Handle image loading errors by showing fallback image
                        const target = e.target as HTMLImageElement;
                        target.src = "/placeholder-facility.jpg"; // Fallback image
                      }}
                    />
                  </div>
                ) : (
                  <div className="h-[180px] w-[180px] bg-[#f8f8f8] rounded-[10px] flex items-center justify-center">
                    <span className="text-gray-400">No image available</span>
                  </div>
                )}
              </div>

              <div className="flex-1">
                {/* Facility details */}
                <div className="flex flex-col gap-1">
                  <h2 className="text-xl font-semibold text-[#222222] leading-tight tracking-tight">
                    {bookingDetails.facility?.name || "Facility"}
                  </h2>
                  <p className="text-[16px] text-[rgba(34,34,34,0.6)] font-normal leading-snug tracking-tight mb-3">
                    {bookingDetails.serviceProvider?.serviceName
                      ? bookingDetails.serviceProvider.serviceName
                      : "Service Provider"}
                    ,
                    {bookingDetails.facility?.city
                      ? ` ${bookingDetails.facility.city},`
                      : ""}
                    {bookingDetails.facility?.state
                      ? ` ${bookingDetails.facility.state}`
                      : ""}
                  </p>
                </div>

                {/* Facility type badge */}
                <div className="inline-flex items-center px-3 py-1 border border-[rgba(0,0,0,0.3)] border-opacity-30 rounded-[10px] text-sm mb-3">
                  <span className="text-[#222222] font-medium">
                    {(bookingDetails.facility?.facilityType || "")
                      .replace(/-/g, " ")
                      .replace(/\b\w/g, (c) => c.toUpperCase())}
                  </span>
                </div>

                {/* Key amenities */}
                <div>
                  <p className="font-medium text-[15px] text-[#222222] mb-2 tracking-tight">
                    Key Amenities
                  </p>
                  <div className="flex flex-wrap gap-[15px]">
                    {bookingDetails.serviceProvider?.features &&
                    bookingDetails.serviceProvider.features.length > 0 ? (
                      <>
                        {bookingDetails.serviceProvider.features
                          .slice(0, 5)
                          .map((feature, index) => {
                            const IconComponent =
                              AMENITY_ICONS[
                                feature as keyof typeof AMENITY_ICONS
                              ] || AMENITY_ICONS["Other"];
                            return (
                              <div
                                key={index}
                                className="flex items-center gap-2"
                              >
                                <IconComponent className="h-4 w-4 text-[#222222]" />
                                <span className="text-sm text-[#222222]">
                                  {feature}
                                </span>
                              </div>
                            );
                          })}
                        {bookingDetails.serviceProvider.features.length > 5 && (
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-primary">
                              +
                              {bookingDetails.serviceProvider.features.length -
                                5}{" "}
                              more
                            </span>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="text-sm text-gray-500">
                        No amenities listed
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Booking Details Section */}
            <div className="flex flex-col gap-5">
              {/* Facility Info Grid */}
              <div className="w-full">
                <div className="flex flex-wrap gap-4 mb-4">
                  <div className="w-[180px] bg-[#f8f8f8] p-3 rounded-md">
                    <p className="text-[15px] font-semibold text-[rgba(34,34,34,0.3)] mb-[2px]">
                      Facility Partner Name
                    </p>
                    <p className="text-[16px] font-semibold text-[#222222] tracking-tight">
                      {bookingDetails.serviceProvider?.serviceName ||
                        "Service Provider Name Not Available"}
                    </p>
                  </div>
                  <div className="w-[180px] bg-[#f8f8f8] p-3 rounded-md">
                    <p className="text-[15px] font-semibold text-[rgba(34,34,34,0.3)] mb-[2px]">
                      Facility Name
                    </p>
                    <p className="text-[16px] font-semibold text-[#222222] tracking-tight">
                      {bookingDetails.facility?.name || "N/A"}
                    </p>
                  </div>
                  <div className="w-[180px] bg-[#f8f8f8] p-3 rounded-md">
                    <p className="text-[15px] font-semibold text-[rgba(34,34,34,0.3)] mb-[2px]">
                      Facility Type
                    </p>
                    <p className="text-[16px] font-semibold text-[#222222] tracking-tight">
                      {(bookingDetails.facility?.facilityType || "")
                        .replace(/-/g, " ")
                        .replace(/\b\w/g, (c) => c.toUpperCase())}
                    </p>
                  </div>
                  <div className="w-[180px] bg-[#f8f8f8] p-3 rounded-md">
                    <p className="text-[15px] font-semibold text-[rgba(34,34,34,0.3)] mb-[2px]">
                      Rental Plan
                    </p>
                    <p className="text-[16px] font-semibold text-[#222222] tracking-tight">
                      {(bookingDetails.rentalPlan || "")
                        .replace(/-/g, " ")
                        .replace(/\b\w/g, (c) => c.toUpperCase())}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-4">
                  <div className="w-[180px] bg-[#f8f8f8] p-3 rounded-md">
                    <p className="text-[15px] font-semibold text-[rgba(34,34,34,0.3)] mb-[2px]">
                      Check In
                    </p>
                    <p className="text-[16px] font-semibold text-[#222222] tracking-tight leading-[1.55em] break-words">
                      {checkInInfo.fullDisplay}
                    </p>
                  </div>
                  <div className="w-[180px] bg-[#f8f8f8] p-3 rounded-md">
                    <p className="text-[15px] font-semibold text-[rgba(34,34,34,0.3)] mb-[2px]">
                      Check Out
                    </p>
                    <p className="text-[16px] font-semibold text-[#222222] tracking-tight leading-[1.55em] break-words">
                      {checkOutInfo.fullDisplay}
                    </p>
                  </div>
                  <div className="w-[180px] bg-[#f8f8f8] p-3 rounded-md">
                    <p className="text-[15px] font-semibold text-[rgba(34,34,34,0.3)] mb-[2px]">
                      Booking Number
                    </p>
                    <p className="text-[15px] font-extrabold text-[#222222] tracking-tight font-mono break-all">
                      {bookingDetails._id}
                    </p>
                  </div>
                  <div className="w-[180px] bg-[#f8f8f8] p-3 rounded-md">
                    <p className="text-[15px] font-semibold text-[rgba(34,34,34,0.3)] mb-[2px]">
                      Quantity
                    </p>
                    <p className="text-[15px] font-extrabold text-[#222222] tracking-tight font-mono break-all">
                      {bookingDetails.unitCount}
                    </p>
                  </div>

                   <div className="w-[180px] bg-[#f8f8f8] p-3 rounded-md">
                    <p className="text-[15px] font-semibold text-[rgba(34,34,34,0.3)] mb-[2px]">
                      Booked Seats
                    </p>
                    <p className="text-[15px] font-extrabold text-[#222222] tracking-tight font-mono break-all">
                      {bookingDetails.bookingSeats}
                    </p>
                  </div>
                </div>
              </div>

              {/* Divider */}
              <div className="w-full border-t border-[rgba(34,34,34,0.5)] border-opacity-30 my-2"></div>

              {/* Startup Details Section */}
              <div className="w-full">
                <h3 className="text-[18px] font-extrabold text-[#222222] tracking-tight mb-4">
                  Startup Details
                </h3>
                <div className="flex flex-wrap gap-4">
                  <div className="w-[180px]">
                    <p className="text-[15px] font-semibold text-[rgba(34,34,34,0.3)] mb-[2px]">
                      Startup Name
                    </p>
                    <p className="text-[18px] font-bold text-[#222222] tracking-tight">
                      {bookingDetails.startup?.startupName ||
                        "Startup Name Not Available"}
                    </p>
                  </div>
                  <div className="w-[180px]">
                    <p className="text-[15px] font-semibold text-[rgba(34,34,34,0.3)] mb-[2px]">
                      Founder Name
                    </p>
                    <p className="text-[16px] font-semibold text-[#222222] tracking-tight">
                      {bookingDetails.startup?.founderName || "Not specified"}
                    </p>
                  </div>
                  <div className="w-[180px]">
                    <p className="text-[15px] font-semibold text-[rgba(34,34,34,0.3)] mb-[2px]">
                      Mail Address
                    </p>
                    <p className="text-[16px] font-semibold text-[#222222] tracking-tight">
                      {bookingDetails.startup?.emailId || "N/A"}
                    </p>
                  </div>
                  <div className="w-[180px]">
                    <p className="text-[15px] font-semibold text-[rgba(34,34,34,0.3)] mb-[2px]">
                      Phone Number
                    </p>
                    <p className="text-[16px] font-semibold text-[#222222] tracking-tight">
                      {bookingDetails.startup?.primaryContactNumber ||
                        bookingDetails.whatsappNumber ||
                        "Not specified"}
                    </p>
                  </div>
                  <div className="w-[180px]">
                    <p className="text-[15px] font-semibold text-[rgba(34,34,34,0.3)] mb-[2px]">
                      City
                    </p>
                    <p className="text-[16px] font-semibold text-[#222222] tracking-tight">
                      {bookingDetails.startup?.city || "Not specified"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Sidebar */}
        <div className="w-full lg:w-[360px] lg:flex-shrink-0">
          <div className="bg-white border border-[rgba(34,34,34,0.3)] border-opacity-30 rounded-[30px] p-5 flex flex-col gap-5 h-full">
            {/* Invoice Download */}
            <div className="flex justify-between items-center">
              <h3 className="text-[16px] text-[rgba(34,34,34,0.5)] font-medium">
                Download Invoice (PDF)
              </h3>
              {bookingDetails.invoiceUrl ? (
                <Link
                  href={bookingDetails.invoiceUrl}
                  target="_blank"
                  // rel="noopener noreferrer"
                >
                  <Download className="h-5 w-5 text-[#222222]" />
                </Link>
        //          <a href={bookingDetails.invoiceUrl}>
        //   📥 View Invoice
        // </a>
              ) : (
                <span className="text-sm text-gray-400">Not available</span>
              )}
            </div>

            {/* Booking Reference Number */}
            <div className="mb-1">
              <h3 className="text-[16px] text-[rgba(34,34,34,0.5)] font-medium mb-1">
                Booking Reference Number
              </h3>
              <div className="max-w-full">
                <p className="text-[15px] font-extrabold font-mono break-all">
                  {bookingDetails._id}
                </p>
              </div>
            </div>

            {/* Check In/Out Box */}
            <div className="border border-[rgba(34,34,34,0.3)] rounded-lg p-4 bg-[#f8f8f8]">
              <div className="flex flex-col gap-3">
                <div className="text-center border-b border-[rgba(0,0,0,0.3)] pb-3">
                  <h4 className="text-center text-[rgba(34,34,34,0.3)] font-semibold text-[15px] mb-1">
                    Check In
                  </h4>
                  <p className="text-center font-semibold text-[16px] text-[#222222]">
                    {checkInInfo.date}
                  </p>
                  <p className="text-center text-[rgba(34,34,34,0.3)] text-sm">
                    by {checkInInfo.time}
                  </p>
                </div>

                <div className="text-center">
                  <h4 className="text-center text-[rgba(34,34,34,0.3)] font-semibold text-[15px] mb-1">
                    Check Out
                  </h4>
                  <p className="text-center font-semibold text-[16px] text-[#222222]">
                    {checkOutInfo.date}
                  </p>
                  <p className="text-center text-[rgba(34,34,34,0.3)] text-sm">
                    by {checkOutInfo.time}
                  </p>
                </div>
              </div>
            </div>

            {/* Price Section */}
            <div className="border-t border-[rgba(34,34,34,0.6)] border-opacity-30 pt-4">
              <h3 className="text-[16px] font-semibold text-[#222222] leading-tight mb-1">
                {bookingDetails.facility.name}
              </h3>



              <div className="flex justify-between items-start">
                <div>
                  <div className="text-sm text-[rgba(34,34,34,0.6)] space-y-1">
                    <div className="flex justify-between gap-6">
                      <span>Base Price</span>
                    </div>
                    {/* <div className="flex justify-between gap-6">
                      <span>Service Fee</span>
                    </div> */}
                    <div className="flex justify-between gap-6">
                      <span>GST</span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-right font-medium">
                    {formatCurrency(bookingDetails.baseAmount ?? 0)}
                  </div>
                  {/* <div className="text-right font-medium">
                    {formatCurrency(bookingDetails.serviceFee ?? 0)}
                  </div> */}
                  <div className="text-right font-medium">
                    {formatCurrency(bookingDetails.gstAmount ?? 0)}
                  </div>
                </div>
              </div>

              <div className="flex justify-between border-t border-[rgba(34,34,34,0.6)] border-opacity-30 pt-4 mt-3">
    <p className="text-xl text-black font-bold flex justify-between gap-6 ">
      Total
    </p>
<p className="text-xl font-bold ">
      {formatCurrency(bookingDetails.amount)}
    </p>

              </div>
            </div>

            {/* Support Section */}
            <div className="flex flex-col items-center mt-auto pt-4">
              <div className="w-10 h-10 bg-[#76D191] bg-opacity-20 rounded-full flex items-center justify-center mb-3">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M20 10.9696L11.9628 18.5497C11.9026 18.606 11.8139 18.637 11.7186 18.637C11.6233 18.637 11.5346 18.606 11.4744 18.5497L4 10.9696"
                    stroke="#76D191"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M2 8.7C2 7.87174 2.33714 7.07652 2.93726 6.49594C3.53737 5.91536 4.36131 5.59091 5.22222 5.59091H18.7778C19.6387 5.59091 20.4626 5.91536 21.0627 6.49594C21.6629 7.07652 22 7.87174 22 8.7V19.8909C22 20.7192 21.6629 21.5144 21.0627 22.095C20.4626 22.6756 19.6387 23 18.7778 23H5.22222C4.36131 23 3.53737 22.6756 2.93726 22.095C2.33714 21.5144 2 20.7192 2 19.8909V8.7Z"
                    stroke="#76D191"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M7.48315 5.59091V3C7.48315 2.46957 7.70719 1.96086 8.10559 1.58579C8.50398 1.21071 9.04845 1 9.61769 1H14.3823C14.9516 1 15.496 1.21071 15.8944 1.58579C16.2928 1.96086 16.5169 2.46957 16.5169 3V5.59091"
                    stroke="#76D191"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <h2 className="text-lg font-bold text-black text-center mb-2">
                Booking Related Queries
              </h2>
              <p className="text-center text-[#717171] text-[14px] max-w-[320px] mb-6 px-2">
                Send a whatsapp message to +91 87549 47666 (or) contact our
                customer team.
              </p>

              {/* Cumma Logo and Social Icons */}
              <div className="flex flex-col items-center">
                <Image
                  src="/logo.png"
                  alt="Cumma Logo"
                  width={100}
                  height={25}
                  className="mb-3"
                />
                <div className="flex gap-3 items-center">
                  <Link
                    href="https://linkedin.com"
                    className="text-[#222222] hover:text-gray-700"
                  >
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M4.47679 7.33489H1.37072V17.9912H4.47679V7.33489Z" />
                      <path d="M2.92377 5.99692C3.91775 5.99692 4.72362 5.19106 4.72362 4.19707C4.72362 3.20309 3.91775 2.39722 2.92377 2.39722C1.92979 2.39722 1.12392 3.20309 1.12392 4.19707C1.12392 5.19106 1.92979 5.99692 2.92377 5.99692Z" />
                      <path d="M10.8289 12.4652C10.8289 11.1032 11.5625 10.0906 13.1289 10.0906C14.5153 10.0906 15.1017 11.0539 15.1017 12.4652V17.9914H18.1956V11.6405C18.1956 8.91737 16.9562 7.09082 14.5525 7.09082C12.1488 7.09082 10.8289 8.91737 10.8289 8.91737V7.33506H7.84277V17.9914H10.8289V12.4652Z" />
                    </svg>
                  </Link>
                  <Link
                    href="https://instagram.com"
                    className="text-[#222222] hover:text-gray-700"
                  >
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M9.99957 6.87351C8.27807 6.87351 6.87307 8.27851 6.87307 10C6.87307 11.7215 8.27807 13.1265 9.99957 13.1265C11.7211 13.1265 13.1261 11.7215 13.1261 10C13.1261 8.27851 11.7211 6.87351 9.99957 6.87351ZM19.3711 10C19.3711 8.70577 19.3836 7.42404 19.3086 6.13231C19.2336 4.63481 18.8961 3.30108 17.7961 2.20108C16.6936 1.09858 15.3624 0.763554 13.8649 0.688554C12.5707 0.613554 11.289 0.626054 9.99957 0.626054C8.70766 0.626054 7.42594 0.613554 6.13422 0.688554C4.63672 0.763554 3.30297 1.10108 2.20297 2.20108C1.10047 3.30358 0.765438 4.63481 0.690438 6.13231C0.615438 7.42654 0.627938 8.70827 0.627938 10C0.627938 11.2918 0.615438 12.576 0.690438 13.8677C0.765438 15.3652 1.10297 16.699 2.20297 17.799C3.30547 18.9015 4.63672 19.2365 6.13422 19.3115C7.42844 19.3865 8.71016 19.374 10.0021 19.374C11.294 19.374 12.5757 19.3865 13.8674 19.3115C15.3649 19.2365 16.6986 18.899 17.7986 17.799C18.9011 16.6965 19.2361 15.3652 19.3111 13.8677C19.3886 12.576 19.3711 11.2943 19.3711 10ZM9.99957 14.807C7.33957 14.807 5.19257 12.66 5.19257 10C5.19257 7.34001 7.33957 5.19301 9.99957 5.19301C12.6596 5.19301 14.8066 7.34001 14.8066 10C14.8066 12.66 12.6596 14.807 9.99957 14.807ZM15.0036 6.11731C14.3766 6.11731 13.8724 5.61308 13.8724 4.98608C13.8724 4.35908 14.3766 3.85485 15.0036 3.85485C15.6306 3.85485 16.1349 4.35908 16.1349 4.98608C16.1351 5.13962 16.1055 5.29113 16.0478 5.43103C15.99 5.57092 15.9053 5.6963 15.7983 5.80326C15.6914 5.91022 15.566 5.99492 15.4261 6.05268C15.2862 6.11044 15.1347 6.14 14.9811 6.13981L15.0036 6.11731Z" />
                    </svg>
                  </Link>
                  <Link
                    href="https://twitter.com"
                    className="text-[#222222] hover:text-gray-700"
                  >
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M17.9442 5.92564C17.9569 6.1034 17.9569 6.28121 17.9569 6.45901C17.9569 11.8981 13.8325 18.1212 6.29451 18.1212C3.97026 18.1212 1.81507 17.4466 0 16.2845C0.33 16.3228 0.64732 16.336 0.99002 16.336C2.90809 16.336 4.67004 15.6867 6.07869 14.5882C4.27629 14.5499 2.7689 13.3622 2.24819 11.7107C2.50004 11.749 2.75183 11.7745 3.01644 11.7745C3.38382 11.7745 3.75126 11.7235 4.09402 11.6343C2.21087 11.2478 0.787798 9.59641 0.787798 7.61231V7.56131C1.33478 7.86693 1.96867 8.05743 2.6407 8.08277C1.54696 7.352 0.826277 6.10345 0.826277 4.69479C0.826277 3.93868 1.02679 3.24944 1.37685 2.65094C3.4092 5.12484 6.44608 6.72637 9.84749 6.90413C9.78374 6.59852 9.74643 6.28116 9.74643 5.96379C9.74643 3.73188 11.5735 1.8916 13.8451 1.8916C15.0266 1.8916 16.0829 2.40162 16.8262 3.22235C17.7421 3.04454 18.6202 2.70178 19.3889 2.23711C19.0835 3.18431 18.4496 3.9387 17.6189 4.42873C18.4243 4.34228 19.2044 4.12914 19.9223 3.82347C19.389 4.59053 18.7171 5.27971 17.9442 5.92564Z" />
                    </svg>
                  </Link>
                  <Link
                    href="https://facebook.com"
                    className="text-[#222222] hover:text-gray-700"
                  >
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M20 10.0611C20 4.50451 15.5229 0 10 0C4.47715 0 0 4.50451 0 10.0611C0 15.0828 3.65684 19.2452 8.4375 20V12.9694H5.89844V10.0611H8.4375V7.84452C8.4375 5.32296 9.93047 3.93012 12.2146 3.93012C13.3088 3.93012 14.4531 4.12663 14.4531 4.12663V6.60137H13.1922C11.95 6.60137 11.5625 7.37687 11.5625 8.17238V10.0611H14.3359L13.8926 12.9694H11.5625V20C16.3432 19.2452 20 15.0828 20 10.0611Z" />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
