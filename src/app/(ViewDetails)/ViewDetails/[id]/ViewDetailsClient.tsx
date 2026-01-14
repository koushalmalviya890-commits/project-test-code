"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
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
  Check,
} from "lucide-react";
import { BookingModal } from "@/components/booking/BookingModal";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import Link from "next/link";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {
  isStartupProfileComplete,
  getStartupProfileCompletionPercentage,
  getStartupIncompleteFields,
} from "@/lib/utils/profile-completion";
import { IncompleteProfileModal } from "@/components/ui/incomplete-profile-modal";
import {
  FacilityCard,
  FacilityCardSkeleton,
} from "@/components/ui/facility-card";
import { Badge } from "@/components/ui/badge";
import { AnimatePresence, motion } from "framer-motion";
import PaymentFailedBanner from "@/components/payment/PaymentFailedBanner";
import { useRouter } from "next/navigation";
import { getFixedServiceFee } from "@/lib/pricing";
import fetchDynamicPrice from "@/lib/helper-pricechange";
// Add YouTube video extractor helper

import Reviews from "@/components/dialogs/conditional.review";
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
    bookingPlanType: string; // e.g., "per_seat", "per_cabin", "per_room", "per_slot", "per_sample"
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
    roomDetails: Array<{
      roomName?: string;
      seatingCapacity?: number;
      amenities?: string[];
    }>;
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
}: {
  facilityId: string;
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

  // Booking related states
  const [selectedPlan, setSelectedPlan] = useState<RentalPlan | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [contactNumber, setContactNumber] = useState<string>("");
  const [bookingPeriod, setBookingPeriod] = useState<string>("");
  const [isCustomDate, setIsCustomDate] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [isProfileLoading, setIsProfileLoading] = useState(true);
  const [showIncompleteProfileModal, setShowIncompleteProfileModal] =
    useState(false);
  const [completionPercentage, setCompletionPercentage] = useState(0);
  const [incompleteFields, setIncompleteFields] = useState<string[]>([]);
  const [unitCount, setUnitCount] = useState(1);

  const [bookingSeats, setBookingSeats] = useState(1);

  const [isExisting, setIsExisting] = useState<boolean | null>(null);

  // Add state for related facilities
  const [relatedFacilities, setRelatedFacilities] = useState<any[]>([]);
  const [loadingRelatedFacilities, setLoadingRelatedFacilities] =
    useState(false);
  const [hoveredFacilityId, setHoveredFacilityId] = useState<string | null>(
    null
  );

  // New state for venue timings
  const [showAllTimings, setShowAllTimings] = useState(false);
  const [currentDay, setCurrentDay] = useState<string>("monday"); // Default to Monday

  // Add loading state for payment processing
  const [processingPayment, setProcessingPayment] = useState(false);

  // Add state for failed payment detection
  const [failedBookingId, setFailedBookingId] = useState<string | null>(null);

  const router = useRouter();
  const [selectedRooms, setSelectedRooms] = useState<number[]>([]);

  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [couponCode, setCouponCode] = useState("");
  const [isCouponLoading, setIsCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState("");

  // Add this useEffect to auto-select if only one room
  // useEffect(() => {
  //   if (
  //     facility?.facilityType === "event-workspace" &&
  //     facility?.details?.roomDetails?.length === 1
  //   ) {
  //     setSelectedRooms([0]); // Auto-select the first (and only) room
  //     setBookingSeats(1); // Set booking seats to 1
  //   }
  // }, [facility]);

  // Add this function to handle room selection
  // const toggleRoomSelection = (roomIndex: number) => {
  //   setSelectedRooms((prev) => {
  //     if (prev.includes(roomIndex)) {
  //       // Remove room from selection
  //       const newSelection = prev.filter((idx) => idx !== roomIndex);
  //       setBookingSeats(newSelection.length || 1);
  //       return newSelection;
  //     } else {
  //       // Add room to selection
  //       const newSelection = [...prev, roomIndex];
  //       setBookingSeats(newSelection.length);
  //       return newSelection;
  //     }
  //   });
  // };

  // Function to load Razorpay script dynamically
  const loadRazorpayScript = () => {
    return new Promise<boolean>((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  // Add this state to track calculated price details
  const [priceDetails, setPriceDetails] = useState<{
    isExistingUser: any;
    basePrice: number;
    fixedFee: number;
    gstAmount: number;
    gstOnServiceFee: number;
    finalPrice: number;
    hasGST: boolean;
    bookingSeats: number;
  } | null>(null);

  // Add this useEffect to calculate prices when selection changes
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
        // Fallback to client-side calculation if API fails
        const basePrice = selectedPlan.price * unitCount * bookingSeats;
        const serviceFee =
          isExisting === true
            ? getFixedServiceFee(facility?.facilityType || "") *
              unitCount *
              bookingSeats
            : basePrice * 0.07;
        const gstOnServiceFee = serviceFee * 0.18;
        const subtotal = basePrice + serviceFee;
        // console.log("testing total", subtotal)
        const gstAmount = 0; // Fallback GST amount

        setPriceDetails({
          basePrice: subtotal,
          fixedFee: serviceFee,
          gstAmount,
          gstOnServiceFee: gstOnServiceFee,
          finalPrice: basePrice + serviceFee + gstOnServiceFee + gstAmount,
          isExistingUser: isExisting === true,
          hasGST: false,
          bookingSeats,
        });
      }
    };

    calculatePrices();
  }, [
    selectedPlan,
    unitCount,
    facilityId,
    bookingSeats,
    isExisting,
    facility?.facilityType,
  ]);
  // console.log("testing total", priceDetails);
  // Update your price display to use priceDetails
  const currentBaseRent = selectedPlan 
    ? selectedPlan.price * unitCount * bookingSeats 
    : 0;
  const basePrice =
    (priceDetails?.basePrice ?? 0) + (priceDetails?.fixedFee ?? 0);
  const fixedFeePerUnit =
    priceDetails?.fixedFee || getFixedServiceFee(facility?.facilityType || "");
  // console.log(fixedFeePerUnit, "bdnbnbnbdfnmd");
  const fixedServiceFee = priceDetails?.fixedFee || 0;
  const gstOnServiceFee =
    priceDetails?.gstOnServiceFee ?? fixedServiceFee * 0.18;
  // console.log(fixedServiceFee, `vshvchscvhjcv`);
const gstAmount = (priceDetails?.hasGST && priceDetails?.hasGST === true && (priceDetails?.gstAmount && priceDetails.gstAmount > 0)
    ? (priceDetails?.gstAmount && priceDetails.gstAmount > 0)
      ? priceDetails.gstAmount
      : (currentBaseRent * 0.18) : 0);
  console.log(gstAmount, `for gast amount only`);
  const displayTotalGst = gstAmount + gstOnServiceFee;
  console.log(displayTotalGst);
  const totalAmount = basePrice + displayTotalGst;

  // Fetch facility data
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

        // Fetch the map URL once we have the facility data
        if (data && data.address) {
          const address = `${data.address}, ${data.city}, ${data.state}, ${data.pincode}, ${data.country}`;
          const mapResponse = await fetch(
            `/api/maps?query=${encodeURIComponent(address)}`
          );
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

  useEffect(() => {
    const checkStartupExists = async () => {
      try {
        const res = await fetch("/api/checkuser", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            incubatorId: facility?.serviceProviderId,
          }),
        });
        const data = await res.json();

        if (res.ok) {
          setIsExisting(data.exists); // true or false
        } else {
          console.error("API siva:", data.error);
          setIsExisting(false);
        }
      } catch (err) {
        console.error("Request failed:", err);
        setIsExisting(false);
      } finally {
        setLoading(false);
      }
    };

    if (facility) {
      checkStartupExists();
    }
  }, [facility]);

  // Fetch startup profile
  useEffect(() => {
    const fetchProfile = async () => {
      if (!session) return;

      // Check if user is a service provider
      if (session.user?.userType === "Service Provider") {
        setIsProfileLoading(false);
        return; // Don't try to fetch startup profile for service providers
      }

      try {
        setIsProfileLoading(true);
        const response = await fetch("/api/startup/profile");
        if (!response.ok) throw new Error("Failed to fetch profile");

        const data = await response.json();
        setProfile(data);

        // Check if profile is complete
        const isComplete = isStartupProfileComplete(data);
        const percentage = getStartupProfileCompletionPercentage(data);
        const missingFields = getStartupIncompleteFields(data);

        setCompletionPercentage(percentage);
        setIncompleteFields(missingFields);

        if (!isComplete) {
          setShowIncompleteProfileModal(true);
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setIsProfileLoading(false);
      }
    };

    if (session) {
      fetchProfile();
    }
  }, [session]);

  // Reset coupon when booking period changes
  useEffect(() => {
    if (appliedCoupon) {
      setAppliedCoupon(null);
      setCouponCode("");
      setCouponError("");
    }
  }, [bookingPeriod]);

  // Sort rental plans in the specified order
  const sortedRentalPlans = facility?.details?.rentalPlans
    ? [...facility.details.rentalPlans].sort((a, b) => {
        const order = [
          "Hourly",
          "One Day (24 Hours)",
          "Weekly",
          "Monthly",
          "Annual",
        ];
        return order.indexOf(a.name) - order.indexOf(b.name);
      })
    : [];

  // Set initial booking period if available
  useEffect(() => {
    if (sortedRentalPlans.length > 0) {
      setBookingPeriod(sortedRentalPlans[0].name);
    }
  }, [sortedRentalPlans]);

  // Calculate end date based on selected date and booking period
  const calculateEndDate = (startDate: Date, period: string): Date => {
    const endDate = new Date(startDate);
    switch (period) {
      case "Annual":
        endDate.setFullYear(endDate.getFullYear() + 1);
        break;
      case "Monthly":
        endDate.setMonth(endDate.getMonth() + 1);
        break;
      case "Weekly":
        endDate.setDate(endDate.getDate() + 7);
        break;
      case "One Day (24 Hours)":
        endDate.setDate(endDate.getDate() + 1);
        break;
      case "Hourly":
        endDate.setHours(endDate.getHours() + 1);
        break;
    }
    return endDate;
  };

  // Calculate final amount with coupon

  const getFinalAmount = (): number => {
    if (!appliedCoupon) return totalAmount;

    const discountAmount = (totalAmount * appliedCoupon.discount) / 100;
    return totalAmount - discountAmount;
  };
  // Handle coupon application
  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponError("Please enter a coupon code");
      return;
    }

    setIsCouponLoading(true);
    setCouponError("");

    // console.log("facilityId check", facilityId);

    try {
      const res = await fetch(
        `/api/service-provider/${facilityId}/validate-coupon`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            couponCode: couponCode.toUpperCase(),
            bookingAmount: totalAmount,
          }),
        }
      );

      const data = await res.json();

      if (data.success) {
        setAppliedCoupon(data.data);
        setCouponError("");
      } else {
        setCouponError(data.message);
        setAppliedCoupon(null);
      }
    } catch (error) {
      setCouponError("Failed to apply coupon");
      setAppliedCoupon(null);
    } finally {
      setIsCouponLoading(false);
    }
  };

  // Handle coupon removal
  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
    setCouponError("");
  };

  // Get duration text based on booking period
  const getDurationText = (startDate: Date, period: string): string => {
    const endDate = calculateEndDate(startDate, period);
    const days = {
      Annual: 365,
      Monthly: 30,
      Weekly: 7,
      "One Day (24 Hours)": 1,
      Hourly: 0.0417, // 1/24 of a day
    }[period];

    const startDateStr = startDate.toLocaleDateString("en-US", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    const endDateStr = endDate.toLocaleDateString("en-US", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    // For hourly bookings, include the time
    if (period === "Hourly") {
      const startTimeStr = startDate.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "numeric",
      });

      const endTimeStr = endDate.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "numeric",
      });

      return `Booking Duration: ${startDateStr} ${startTimeStr} to ${endDateStr} ${endTimeStr} (1 Hour)`;
    }

    return `Booking Duration: ${startDateStr} to ${endDateStr} (${days} Days)`;
  };

  // Get selected plan price (base price without service fee)
  const getSelectedPlanPrice = () => {
    if (!selectedPlan) return 0;

    // Return the base price without adding service fee
    return selectedPlan.price;
  };

  // Generate dates for the next 7 days
  const nextSevenDays = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() + i);
    return date;
  });

  const timeSlots = [
    "9 AM",
    "10 AM",
    "11 AM",
    "12 PM",
    "1 PM",
    "2 PM",
    "3 PM",
    "4 PM",
    "5 PM",
  ];

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
  const getBookingUnitLabel = () => {
    const type = facility?.details?.bookingPlanType;
    if (type === "per_slot") return "Slot";
    if (type === "per_sample") return "Sample";
    return "Seat";
  };
  const bookingUnitLabel = getBookingUnitLabel();
  const bookingUnitLabelPlural =
    bookingUnitLabel + (bookingSeats > 1 ? "s" : "");

  // // Calculate amounts for display and payment
  // const basePrice = selectedPlan ? getSelectedPlanPrice() : 0;
  // const baseAmount = basePrice * unitCount;  // Base price multiplied by units (without service fee)

  // // Calculate fixed service fee - only applied once regardless of unit count
  // const fixedServiceFee = selectedPlan ? getFixedServiceFee(facility?.facilityType || '') : 0;

  // // Calculate total amount with service fee added once
  // const totalBaseAmount = baseAmount + fixedServiceFee;

  // // GST is set to 0 (removed the 18% calculation)
  // const gstAmount = 0;

  // // Total amount is now just the base amount + fixed service fee (without GST)
  // const totalAmount = totalBaseAmount;

  // Handle booking submission
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

  const handleBookingSubmit = async () => {
    // Check if user is signed in
    if (!session) {
      toast.error("Please sign in to book this facility", {
        duration: 3000,
        icon: <AlertCircle className="h-5 w-5 text-red-500" />,
      });
      return;
    }

    // Check if user is a service provider
    if (session.user?.userType === "Service Provider") {
      toast.error(
        "Facility Partners cannot make bookings. Please use a startup account to book facilities.",
        {
          duration: 5000,
          icon: <AlertCircle className="h-5 w-5 text-red-500" />,
        }
      );
      return;
    }

    // Check if profile is complete before allowing to book
    if (!isStartupProfileComplete(profile)) {
      setShowIncompleteProfileModal(true);
      return;
    }
    // console.log("Facility Type:", facility?.facilityType);
    // console.log("Available Cabins:", facility?.details?.availableCabins);
    // console.log("Available Seats:", facility?.details?.availableSeats);
    // Check facility availability
    // Check facility availability based on facility type
    if (
      (facility?.facilityType === "individual-cabin" &&
        (facility.details.availableCabins ?? 0) <= 0) ||
      (facility?.facilityType === "coworking-spaces" &&
        (facility.details.availableSeats ?? 0) <= 0) ||
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

    // Check if all required fields are filled
    if (!selectedDate || !selectedTime || !contactNumber || !selectedPlan) {
      toast.error("Please fill in all required fields", {
        duration: 3000,
        icon: <AlertCircle className="h-5 w-5 text-red-500" />,
      });
      return;
    }

    try {
      setProcessingPayment(true);

      // Format date and time for API
      const startDateTime = new Date(selectedDate);
      const [hours, minutes] =
        selectedTime.split(" ")[0].split(":").length === 2
          ? selectedTime.split(" ")[0].split(":")
          : [selectedTime.split(" ")[0], "00"];

      const isPM = selectedTime.includes("PM");
      startDateTime.setHours(
        isPM
          ? parseInt(hours) === 12
            ? 12
            : parseInt(hours) + 12
          : parseInt(hours) === 12
            ? 0
            : parseInt(hours),
        parseInt(minutes) || 0,
        0, // Set seconds to 0
        0 // Set milliseconds to 0
      );

      // Calculate end date based on rental plan
      const endDateTime = new Date(startDateTime.getTime()); // Clone the start date to preserve the time

      // Calculate the end date while properly preserving the time component
      switch (selectedPlan.name) {
        case "Annual":
          // For annual plans, set to the same time but years ahead
          endDateTime.setFullYear(endDateTime.getFullYear() + unitCount);
          break;
        case "Monthly":
          // For monthly plans, set to the same time but months ahead
          endDateTime.setMonth(endDateTime.getMonth() + unitCount);
          break;
        case "Weekly":
          // For weekly plans, set to the same time but 7*unitCount days ahead
          endDateTime.setDate(endDateTime.getDate() + 7 * unitCount);
          break;
        case "One Day (24 Hours)":
          // For daily plans, set to the same time but unitCount days ahead
          endDateTime.setDate(endDateTime.getDate() + unitCount);
          break;
        case "Hourly":
          // For hourly plans, set to unitCount hours ahead
          endDateTime.setHours(endDateTime.getHours() + unitCount);
          break;
      }
      // Calculate fixed service fee safely
      const calculatedFixedServiceFee =
        priceDetails?.fixedFee ||
        getFixedServiceFee(facility?.facilityType || "");

      // Prepare booking details for confirmation page
      const bookingDetails = {
        // Facility Information
        //  userId: session?.user?.id,
        facilityId: facilityId,
        // facility: facility,

        // Booking Duration Details
        // duration: {
        rentalPlan: selectedPlan.name,
        unitCount: unitCount,
        unitLabel:
          selectedPlan.name === "Annual"
            ? `year${unitCount > 1 ? "s" : ""}`
            : selectedPlan.name === "Monthly"
              ? `month${unitCount > 1 ? "s" : ""}`
              : selectedPlan.name === "Weekly"
                ? `week${unitCount > 1 ? "s" : ""}`
                : selectedPlan.name === "One Day (24 Hours)"
                  ? `day${unitCount > 1 ? "s" : ""}`
                  : `hour${unitCount > 1 ? "s" : ""}`,

        // Seating Details
        // seating: {
        bookingSeats: bookingSeats,
        // type: facility?.details?.bookingPlanType || 'seat',
        label: bookingUnitLabel,
        // },

        // Timing Details
        // timing: {
        startDate: startDateTime.toISOString(),
        endDate: endDateTime.toISOString(),
        // },

        // Contact Information
        contactNumber: contactNumber,
        hasGST: priceDetails?.hasGST,
        // Pricing Details
        // Pricing Details
        // pricing:{
        originalBaseAmount: selectedPlan.price * unitCount * bookingSeats,
        baseAmount: selectedPlan.price * unitCount * bookingSeats,
        perUnitPrice: selectedPlan.price,
        serviceFee: isExisting
          ? calculatedFixedServiceFee * unitCount * bookingSeats
          : selectedPlan.price * unitCount * bookingSeats * 0.07,
        gstOnServiceFee: isExisting
          ? calculatedFixedServiceFee * unitCount * bookingSeats * 0.18
          : selectedPlan.price * unitCount * bookingSeats * 0.07 * 0.18,
gstAmount: (priceDetails?.gstAmount && priceDetails.gstAmount > 0)
    ? priceDetails.gstAmount
    : (currentBaseRent * 0.18),
       totalBeforeDiscount: 
            (selectedPlan.price * unitCount * bookingSeats) + // Base
            (priceDetails?.fixedFee ?? (isExisting ? calculatedFixedServiceFee * unitCount * bookingSeats : selectedPlan.price * unitCount * bookingSeats * 0.07)) + // Fee
            (priceDetails?.gstOnServiceFee ?? (isExisting ? calculatedFixedServiceFee * unitCount * bookingSeats * 0.18 : selectedPlan.price * unitCount * bookingSeats * 0.07 * 0.18)) + // GST on Fee
            (priceDetails?.gstAmount ?? 0), // GST on Base
       discount: appliedCoupon ? appliedCoupon.discountAmount : 0,
        amount: getFinalAmount(),
        // }
        // Coupon Details
        couponApplied: appliedCoupon
          ? {
              couponCode: appliedCoupon.couponCode,
              discount: appliedCoupon.discount,
              discountAmount: appliedCoupon.discountAmount,
              couponId: appliedCoupon.couponId,
            }
          : null,
      };

      // console.log(bookingDetails)

      try {
        const response = await fetch("/api/bookings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(bookingDetails), // ✅ This is correct, bookingDetails already has coupon
        });

        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          const text = await response.text();
          console.error("Server Error (HTML):", text);
          throw new Error("Server returned an error. Check console.");
        }

        const result = await response.json();

        if (result.success) {
          const bookingDataForPayment = {
            ...bookingDetails,
            bookingId: result.bookingId, // Add the booking ID
          };

          // Redirect to booking details page
          const encodedData = encodeURIComponent(
            JSON.stringify(bookingDataForPayment)
          );
          router.push(`/BookingDetails?data=${encodedData}`);
        } else {
          toast.error(result.message || "Failed to create booking", {
            duration: 5000,
            icon: <AlertCircle className="h-5 w-5 text-red-500" />,
          });
        }
      } catch (error) {
        console.error("Booking error:", error);
        toast.error("Failed to create booking. Please try again.", {
          duration: 5000,
          icon: <AlertCircle className="h-5 w-5 text-red-500" />,
        });
      }

      // Redirect to booking details page
      const encodedData = encodeURIComponent(JSON.stringify(bookingDetails));
      router.push(`/BookingDetails?data=${encodedData}`);
    } catch (error) {
      console.error("Booking processing error:", error);
      toast.error(
        error instanceof Error ? error.message : "Booking processing failed",
        {
          duration: 5000,
          icon: <AlertCircle className="h-5 w-5 text-red-500" />,
        }
      );
      setProcessingPayment(false);
    }
  };

  // Add keyboard event handler for fullscreen navigation - always define this hook
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isFullscreen) return;

      switch (e.key) {
        case "ArrowRight":
          if (facility?.details?.images) {
            setFullscreenIndex(
              (prev) => (prev + 1) % facility.details.images.length
            );
          }
          break;
        case "ArrowLeft":
          if (facility?.details?.images) {
            setFullscreenIndex(
              (prev) =>
                (prev - 1 + facility.details.images.length) %
                facility.details.images.length
            );
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

  // Fetch related facilities from the same service provider
  useEffect(() => {
    const fetchRelatedFacilities = async () => {
      if (!facility?.serviceProviderId) return;

      try {
        setLoadingRelatedFacilities(true);

        // console.log(
        //   "Fetching related facilities for service provider ID:",
        //   facility.serviceProviderId
        // );

        // Fetch facilities from the API using serviceProviderId
        const response = await fetch(
          `/api/facilities/by-provider/${facility.serviceProviderId}`
        );

        if (!response.ok) {
          throw new Error(
            `Failed to fetch related facilities: ${response.status}`
          );
        }

        const data = await response.json();

        // console.log(
        //   `Found ${data.length} related facilities, first facility:`,
        //   data.length > 0
        //     ? {
        //         id: data[0]._id,
        //         name: data[0].details?.name,
        //         serviceProvider: data[0].serviceProvider,
        //       }
        //     : "No facilities found"
        // );

        // Filter out the current facility and sort by featured status
        const filteredFacilities = data
          .filter((f: any) => f._id !== facilityId)
          .sort((a: any, b: any) => {
            // Sort by featured status first
            if (a.isFeatured && !b.isFeatured) return -1;
            if (!a.isFeatured && b.isFeatured) return 1;

            // Then sort by most recently updated
            return (
              new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
            );
          });

        setRelatedFacilities(filteredFacilities);
      } catch (error) {
        console.error("Error fetching related facilities:", error);
        setRelatedFacilities([]); // Set empty array on error
      } finally {
        setLoadingRelatedFacilities(false);
      }
    };

    if (facility) {
      fetchRelatedFacilities();
    }
  }, [facility, facilityId]);

  // Update the useEffect for initial plan selection
  useEffect(() => {
    if (sortedRentalPlans.length > 0 && !selectedPlan) {
      setSelectedPlan(sortedRentalPlans[0]);
    }
  }, [sortedRentalPlans]);

  // Set current day on component mount
  useEffect(() => {
    const days = [
      "sunday",
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
    ];
    const today = new Date().getDay(); // 0 = Sunday, 1 = Monday, etc.
    setCurrentDay(days[today]);
  }, []);

  // Helper function to format day name
  const formatDayName = (day: string): string => {
    return day.charAt(0).toUpperCase() + day.slice(1);
  };

  // Helper function to get timing display text
  const getTimingText = (timing: DayTiming): string => {
    if (!timing || !timing.isOpen) return "Closed";
    return `${timing.openTime || ""} - ${timing.closeTime || ""}`;
  };

  // Check for failed payments related to this facility for the current user
  useEffect(() => {
    const checkFailedPayments = async () => {
      if (!session?.user?.id) return;

      try {
        const response = await fetch(
          `/api/bookings/failed?facilityId=${facilityId}`
        );
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
    setFullscreenIndex(
      (prev) =>
        (prev - 1 + facility.details.images.length) %
        facility.details.images.length
    );
  };

  const openFullscreen = (index: number) => {
    // Make sure the index is valid and the image exists
    if (
      facility?.details?.images &&
      index >= 0 &&
      index < facility.details.images.length &&
      facility.details.images[index]
    ) {
      setFullscreenIndex(index);
      setIsFullscreen(true);
    } else {
      console.error("Invalid image index or missing image source");
      toast.error("Could not display image");
    }
  };

  const handleBookNowClick = () => {
    // Check if user is a service provider
    if (session?.user?.userType === "Service Provider") {
      toast.error(
        "Facility Partners cannot make bookings. Please use a startup account to book facilities.",
        {
          duration: 5000,
          icon: <AlertCircle className="h-5 w-5 text-red-500" />,
        }
      );
      return;
    }

    // Open booking modal for non-service provider users
    setIsBookingModalOpen(true);
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12 max-w-7xl">
      {/* Payment Failed Banner */}
      {failedBookingId && <PaymentFailedBanner bookingId={failedBookingId} />}

      {/* Image Grid - Full Width at Top */}
      {facility.details.images && facility.details.images.length > 0 && (
        <div className="mb-6 sm:mb-8">
          {facility.details.images.length === 1 &&
          !facility.details.videoLink ? (
            // Single image layout - full width (only when no video)
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
            // Grid layout for multiple images or when video is present
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 sm:gap-3">
              <div className="col-span-1 sm:col-span-12 md:col-span-8 relative aspect-[16/9]">
                {facility.details.videoLink &&
                getYouTubeVideoId(facility.details.videoLink) ? (
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

              {/* Show images in the grid */}
              <div className="col-span-1 sm:col-span-12 md:col-span-4 grid grid-cols-2 gap-2 sm:gap-3 h-full mt-2 sm:mt-0">
                {facility.details.images.map((image, index) => {
                  if (index >= 4) return null;

                  if (
                    facility.details.videoLink &&
                    getYouTubeVideoId(facility.details.videoLink)
                  ) {
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

      {/* Two-column layout for the rest of the content - Stack on mobile */}
      <div className="flex flex-col lg:grid lg:grid-cols-12 gap-6 lg:gap-8 mb-8 sm:mb-12">
        {/* Main Content Column */}
        <div className="lg:col-span-8 order-2 lg:order-1">
          {/* Facility Name and Address */}
          <div className="mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
              {facility.details.name}
            </h1>
            <p className="text-gray-600 text-sm sm:text-base">
              {facility.address}
            </p>
          </div>

          {/* Facility-Specific Details in Box Style */}
          <div className="mb-8 sm:mb-10 flex flex-wrap gap-2 sm:gap-3">
            {/* Individual Cabin */}
            {facility.facilityType === "individual-cabin" && (
              <>
                <div className="inline-block border border-gray-200 rounded-md p-2 sm:p-3">
                  <div className="flex items-center gap-2">
                    <div>
                      <div className="text-gray-500 text-xs mb-1">
                        Total Cabins
                      </div>
                      <div className="text-base sm:text-lg font-medium text-gray-800">
                        {facility.details.totalCabins || 0}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="inline-block border border-gray-200 rounded-md p-2 sm:p-3">
                  <div className="flex items-center gap-2">
                    <div>
                      <div className="text-gray-500 text-xs mb-1">
                        Available Cabins
                      </div>
                      <div className="text-base sm:text-lg font-medium text-gray-800">
                        {facility.details.availableCabins || 0}
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Coworking Spaces */}
            {facility.facilityType === "coworking-spaces" && (
              <>
                <div className="inline-block border border-gray-200 rounded-md p-2 sm:p-3">
                  <div className="flex items-center gap-2">
                    <div>
                      <div className="text-gray-500 text-xs mb-1">
                        Total Seaters
                      </div>
                      <div className="text-base sm:text-lg font-medium text-gray-800">
                        {facility.details.totalSeats || 0}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="inline-block border border-gray-200 rounded-md p-2 sm:p-3">
                  <div className="flex items-center gap-2">
                    <div>
                      <div className="text-gray-500 text-xs mb-1">
                        Available Seats
                      </div>
                      <div className="text-base sm:text-lg font-medium text-gray-800">
                        {facility.details.availableSeats || 0}
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Meeting Rooms */}
            {facility.facilityType === "meeting-rooms" && (
              <>
                <div className="inline-block border border-gray-200 rounded-md p-2 sm:p-3">
                  <div className="flex items-center gap-2">
                    <div>
                      <div className="text-gray-500 text-xs mb-1">
                        Total Rooms
                      </div>
                      <div className="text-base sm:text-lg font-medium text-gray-800">
                        {facility.details.totalRooms || 0}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="inline-block border border-gray-200 rounded-md p-2 sm:p-3">
                  <div className="flex items-center gap-2">
                    <div>
                      <div className="text-gray-500 text-xs mb-1">
                        Seating Capacity
                      </div>
                      <div className="text-base sm:text-lg font-medium text-gray-800">
                        {facility.details.seatingCapacity || 0}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="inline-block border border-gray-200 rounded-md p-2 sm:p-3">
                  <div className="flex items-center gap-2">
                    <div>
                      <div className="text-gray-500 text-xs mb-1">
                        Training Room Seats
                      </div>
                      <div className="text-base sm:text-lg font-medium text-gray-800">
                        {facility.details.totalTrainingRoomSeaters || 0}
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Bio Allied Labs, Manufacturing Labs, Prototyping Labs */}
            {(facility.facilityType === "bio-allied-labs" ||
              facility.facilityType === "manufacturing-labs" ||
              facility.facilityType === "prototyping-labs") &&
              facility.details.equipment &&
              facility.details.equipment.length > 0 && (
                <>
                  {facility.details.equipment.slice(0, 2).map((item, index) => (
                    <div
                      key={index}
                      className="inline-block border border-gray-200 rounded-md p-2 sm:p-3"
                    >
                      <div className="flex items-center gap-2">
                        <div>
                          <div className="text-gray-500 text-xs mb-1">
                            {item.labName || "Lab"}
                          </div>
                          <div className="text-base sm:text-lg font-medium text-gray-800">
                            {item.equipmentName || "Equipment"}
                          </div>
                          <div className="text-xs text-gray-500">
                            {item.capacityAndMake || ""}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  {facility.details.equipment.length > 2 && (
                    <div className="inline-block border border-gray-200 rounded-md p-2 sm:p-3">
                      <div className="flex items-center gap-2">
                        <div>
                          <div className="text-gray-500 text-xs mb-1">
                            More Equipment
                          </div>
                          <div className="text-base sm:text-lg font-medium text-gray-800">
                            +{facility.details.equipment.length - 2}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}

            {/* Software */}
            {facility.facilityType === "software" &&
              facility.details.equipment &&
              facility.details.equipment.length > 0 && (
                <>
                  {facility.details.equipment.slice(0, 2).map((item, index) => (
                    <div
                      key={index}
                      className="inline-block border border-gray-200 rounded-md p-2 sm:p-3"
                    >
                      <div className="flex items-center gap-2">
                        <div>
                          <div className="text-gray-500 text-xs mb-1">
                            Software
                          </div>
                          <div className="text-base sm:text-lg font-medium text-gray-800">
                            {item.softwareName || "Software"}
                          </div>
                          <div className="text-xs text-gray-500">
                            Version: {item.version || "N/A"}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  {facility.details.equipment.length > 2 && (
                    <div className="inline-block border border-gray-200 rounded-md p-2 sm:p-3">
                      <div className="flex items-center gap-2">
                        <div>
                          <div className="text-gray-500 text-xs mb-1">
                            More Software
                          </div>
                          <div className="text-base sm:text-lg font-medium text-gray-800">
                            +{facility.details.equipment.length - 2}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}

            {/* SaaS Allied */}
            {facility.facilityType === "saas-allied" &&
              facility.details.equipment &&
              facility.details.equipment.length > 0 && (
                <>
                  {facility.details.equipment.slice(0, 2).map((item, index) => (
                    <div
                      key={index}
                      className="inline-block border border-gray-200 rounded-md p-2 sm:p-3"
                    >
                      <div className="flex items-center gap-2">
                        <div>
                          <div className="text-gray-500 text-xs mb-1">
                            Service
                          </div>
                          <div className="text-base sm:text-lg font-medium text-gray-800">
                            {item.equipmentName || "Service"}
                          </div>
                          <div className="text-xs text-gray-500">
                            {item.capacityAndMake || ""}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  {facility.details.equipment.length > 2 && (
                    <div className="inline-block border border-gray-200 rounded-md p-2 sm:p-3">
                      <div className="flex items-center gap-2">
                        <div>
                          <div className="text-gray-500 text-xs mb-1">
                            More Services
                          </div>
                          <div className="text-base sm:text-lg font-medium text-gray-800">
                            +{facility.details.equipment.length - 2}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}

            {/* Raw Space Office, Raw Space Lab */}
            {(facility.facilityType === "raw-space-office" ||
              facility.facilityType === "raw-space-lab") &&
              facility.details.areaDetails &&
              facility.details.areaDetails.length > 0 && (
                <>
                  {facility.details.areaDetails.map((area, index) => (
                    <div
                      key={index}
                      className="inline-block border border-gray-200 rounded-md p-2 sm:p-3"
                    >
                      <div className="flex items-center gap-2">
                        <div>
                          <div className="text-gray-500 text-xs mb-1">
                            {area.type || "Area"}
                          </div>
                          <div className="text-base sm:text-lg font-medium text-gray-800">
                            {area.area}{" "}
                            <span className="text-xs text-gray-500">sq.ft</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  {facility.details.areaDetails[0]?.furnishing && (
                    <div className="inline-block border border-gray-200 rounded-md p-2 sm:p-3">
                      <div className="flex items-center gap-2">
                        <div>
                          <div className="text-gray-500 text-xs mb-1">
                            Furnishing
                          </div>
                          <div className="text-base sm:text-lg font-medium text-gray-800">
                            {facility.details.areaDetails[0].furnishing}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  {facility.details.areaDetails[0]?.customisation && (
                    <div className="inline-block border border-gray-200 rounded-md p-2 sm:p-3">
                      <div className="flex items-center gap-2">
                        <div>
                          <div className="text-gray-500 text-xs mb-1">
                            Customisation
                          </div>
                          <div className="text-base sm:text-lg font-medium text-gray-800">
                            {facility.details.areaDetails[0].customisation}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}

            {/*Event workspace*/}
            {facility.facilityType === "event-workspace" && (
              <>
                {/* <div className="inline-block border border-gray-200 rounded-md p-2 sm:p-3">
                  <div className="flex items-center gap-2">
                    <div>
                      <div className="text-gray-500 text-xs mb-1">
                        Total Rooms
                      </div>
                      <div className="text-base sm:text-lg font-medium text-gray-800">
                        {facility.details.seatingCapacity || 0}
                      </div>
                    </div>
                  </div>
                </div> */}
                <div className="inline-block border border-gray-200 rounded-md p-2 sm:p-3">
                  <div className="flex items-center gap-2">
                    <div>
                      <div className="text-gray-500 text-xs mb-1">
                        Seating Capacity
                      </div>
                      <div className="text-base sm:text-lg font-medium text-gray-800">
                        {facility.details.seatingCapacity || 0}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="inline-block border border-gray-200 rounded-md p-2 sm:p-3">
                  <div className="flex items-center gap-2">
                    <div>
                      <div className="text-gray-500 text-xs mb-1">
                        Training Room Seats
                      </div>
                      <div className="text-base sm:text-lg font-medium text-gray-800">
                        {facility.details.totalTrainingRoomSeaters || 0}
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Studio */}
            {facility.facilityType === "studio" &&
              facility.details.studioDetails && (
                <>
                  {/* Suitable For */}
                  <div className="inline-block border border-gray-200 rounded-md p-2 sm:p-3">
                    <div className="flex items-center gap-2">
                      <Mic className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600" />
                      <div>
                        <div className="text-gray-500 text-xs mb-1">
                          Suitable For
                        </div>
                        <div className="text-base sm:text-lg font-medium text-gray-800">
                          {facility.details.studioDetails.suitableFor.join(
                            ", "
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Sound Proof */}
                  {facility.details.studioDetails.isSoundProof && (
                    <div className="inline-block border border-gray-200 rounded-md p-2 sm:p-3">
                      <div className="flex items-center gap-2">
                        <Volume2 className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600" />
                        <div>
                          <div className="text-gray-500 text-xs mb-1">
                            Sound Proof
                          </div>
                          <div className="text-base sm:text-lg font-medium text-gray-800">
                            Yes
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Ample Lighting */}
                  {facility.details.studioDetails.hasAmpleLighting && (
                    <div className="inline-block border border-gray-200 rounded-md p-2 sm:p-3">
                      <div className="flex items-center gap-2">
                        <Lightbulb className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600" />
                        <div>
                          <div className="text-gray-500 text-xs mb-1">
                            Ample Lighting
                          </div>
                          <div className="text-base sm:text-lg font-medium text-gray-800">
                            Yes
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Equipment Details */}
                  {facility.details.studioDetails.equipmentDetails &&
                    facility.details.studioDetails.equipmentDetails.length >
                      0 && (
                      <>
                        {facility.details.studioDetails.equipmentDetails
                          .slice(0, 2)
                          .map((item, index) => (
                            <div
                              key={index}
                              className="inline-block border border-gray-200 rounded-md p-2 sm:p-3"
                            >
                              <div className="flex items-center gap-2">
                                <div>
                                  <div className="text-gray-500 text-xs mb-1">
                                    Equipment
                                  </div>
                                  <div className="text-base sm:text-lg font-medium text-gray-800">
                                    {item.name}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    {item.model} (Qty: {item.quantity})
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        {facility.details.studioDetails.equipmentDetails
                          .length > 2 && (
                          <div className="inline-block border border-gray-200 rounded-md p-2 sm:p-3">
                            <div className="flex items-center gap-2">
                              <div>
                                <div className="text-gray-500 text-xs mb-1">
                                  More Equipment
                                </div>
                                <div className="text-base sm:text-lg font-medium text-gray-800">
                                  +
                                  {facility.details.studioDetails
                                    .equipmentDetails.length - 2}
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </>
                    )}
                </>
              )}

            {/* Default for other facility types */}
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
                facility.facilityType !== "event-workspace" &&
                facility.facilityType !== "studio" && (
                  <div className="inline-block border border-gray-200 rounded-md p-2 sm:p-3">
                    <div className="flex items-center gap-2">
                      <div>
                        <div className="text-gray-500 text-xs mb-1">
                          Facility Space
                        </div>
                        <div className="text-base sm:text-lg font-medium text-gray-800">
                          1400{" "}
                          <span className="text-xs text-gray-500">sq.ft</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
          </div>

          {/* Hosted By Section */}
          <div className="flex items-center gap-3 mb-8 sm:mb-10 pb-6 border-b border-gray-100">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0">
              {facility.serviceProvider?.logoUrl &&
              typeof facility.serviceProvider.logoUrl === "string" ? (
                <Image
                  src={facility.serviceProvider.logoUrl}
                  alt={
                    facility.serviceProvider.serviceName || "Service Provider"
                  }
                  width={48}
                  height={48}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-lg sm:text-xl font-semibold text-green-600">
                  {facility.serviceProvider?.serviceName
                    ? facility.serviceProvider.serviceName.charAt(0)
                    : "S"}
                </span>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-medium text-sm sm:text-base">
                Hosted by{" "}
                {facility.serviceProvider?.serviceName &&
                facility.serviceProvider?._id ? (
                  <Link
                    href={`/ViewProvider/${facility.serviceProvider._id}`}
                    className="font-bold text-green-600 hover:text-green-700 hover:underline cursor-pointer break-words"
                  >
                    {facility.serviceProvider.serviceName}
                  </Link>
                ) : (
                  <span>Service Provider</span>
                )}
                {!facility.serviceProvider?.serviceName && (
                  <span className="text-xs text-gray-500 ml-2">
                    (Service provider info unavailable)
                  </span>
                )}
              </p>
              <p className="text-xs sm:text-sm text-gray-600">
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

          {/* Description */}
          <div className="mb-8 sm:mb-10">
            <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-gray-800">
              About this space
            </h2>
            <p className="text-gray-600 whitespace-pre-line text-sm sm:text-base">
              {facility.details.description}
            </p>
          </div>

          {/* Amenities */}
          {facility.features && facility.features.length > 0 && (
            <div className="mb-8 sm:mb-10">
              <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-gray-800">
                Venue Amenities
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {facility.features.map((feature, index) => {
                  const IconComponent =
                    AMENITY_ICONS[feature as keyof typeof AMENITY_ICONS] ||
                    AMENITY_ICONS["Other"];
                  return (
                    <div
                      key={index}
                      className="flex items-center gap-2 sm:gap-3"
                    >
                      <IconComponent className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600 flex-shrink-0" />
                      <span className="text-gray-700 text-sm sm:text-base">
                        {feature}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {facility.relevantSectors && facility.relevantSectors.length > 0 && (
            <div className="mb-8 sm:mb-10">
              {facility.relevantSectors &&
                facility.relevantSectors.length > 0 && (
                  <div className="space-y-2">
                    <div className="border border-gray-200 rounded-md p-3 sm:p-4">
                      <h4 className="text-base sm:text-lg font-semibold mb-3">
                        Sector
                      </h4>
                      <div className="flex flex-wrap gap-2 sm:gap-3">
                        {facility.relevantSectors.map((sector, index) => (
                          <span
                            key={index}
                            className="px-3 sm:px-4 py-1.5 sm:py-2 border border-green-600 text-black rounded-full text-xs sm:text-sm font-medium whitespace-nowrap"
                          >
                            {sector
                              .replace(/-/g, " ")
                              .replace(/\b\w/g, (l) => l.toUpperCase())}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
            </div>
          )}

          {/* Venue Timings */}
          <div className="mb-8 sm:mb-10">
            <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-gray-800">
              Venue Timings
            </h2>

            {facility.timings && (
              <div className="space-y-2">
                <div className="border border-gray-200 rounded-md overflow-hidden">
                  {/* Current day timing - always visible */}
                  <div
                    className="bg-gray-50 py-3 px-4 flex justify-between items-center cursor-pointer"
                    onClick={() => setShowAllTimings(!showAllTimings)}
                  >
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <Clock className="h-4 w-4 text-gray-600 flex-shrink-0" />
                      <span className="font-medium text-sm sm:text-base">
                        {formatDayName(currentDay)}
                      </span>
                      <Badge
                        variant="outline"
                        className="ml-2 text-xs bg-blue-50 text-blue-700 border-blue-200"
                      >
                        Today
                      </Badge>
                    </div>
                    <div className="flex items-center ml-2">
                      <span className="text-gray-700 mr-2 text-sm sm:text-base">
                        {getTimingText(
                          facility.timings[currentDay as keyof Timings]
                        )}
                      </span>
                      {showAllTimings ? (
                        <ChevronUp className="h-4 w-4 text-gray-500 flex-shrink-0" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-gray-500 flex-shrink-0" />
                      )}
                    </div>
                  </div>

                  {/* All other days - animated */}
                  <AnimatePresence>
                    {showAllTimings && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="overflow-hidden"
                      >
                        <div className="divide-y divide-gray-200">
                          {[
                            "monday",
                            "tuesday",
                            "wednesday",
                            "thursday",
                            "friday",
                            "saturday",
                            "sunday",
                          ]
                            .filter((day) => day !== currentDay) // Filter out current day to avoid duplication
                            .map((day) => (
                              <div
                                key={day}
                                className="py-3 px-4 flex justify-between items-center"
                              >
                                <span className="text-sm sm:text-base">
                                  {formatDayName(day)}
                                </span>
                                <span className="text-gray-700 text-sm sm:text-base">
                                  {getTimingText(
                                    facility.timings[day as keyof Timings]
                                  )}
                                </span>
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

          {/* Address and Map */}
          <div className="mb-8 sm:mb-10">
            <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-gray-800">
              Address
            </h2>
            <div className="space-y-4 sm:space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm sm:text-base">
                <span className="text-gray-600 font-medium sm:font-normal">
                  City
                </span>
                <span className="sm:text-right">{facility.city}</span>
                <span className="text-gray-600 font-medium sm:font-normal">
                  Pincode
                </span>
                <span className="sm:text-right">{facility.pincode}</span>
                <span className="text-gray-600 font-medium sm:font-normal">
                  State
                </span>
                <span className="sm:text-right">{facility.state}</span>
                <span className="text-gray-600 font-medium sm:font-normal">
                  Country
                </span>
                <span className="sm:text-right">{facility.country}</span>
              </div>

              <div
                className="w-full h-[200px] sm:h-[250px] rounded-lg overflow-hidden cursor-pointer relative border border-gray-200"
                onClick={() => {
                  const address = encodeURIComponent(
                    `${facility.address}, ${facility.city}, ${facility.state}, ${facility.pincode}, ${facility.country}`
                  );
                  window.open(
                    `https://www.google.com/maps/search/?api=1&query=${address}`,
                    "_blank"
                  );
                }}
              >
                <iframe
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  loading="lazy"
                  allowFullScreen
                  referrerPolicy="no-referrer-when-downgrade"
                  src={mapUrl || ""}
                />
                <div className="absolute inset-0 bg-transparent hover:bg-black/5 transition-colors" />
              </div>
            </div>
          </div>
        </div>
        {/* Booking Section - Move to top on mobile */}

        <div className="lg:col-span-4 order-1 lg:order-2">
          <div className="sticky top-4 lg:top-8">
            <div className="bg-white rounded-xl shadow-lg border overflow-hidden">
              {/* Conditional rendering based on facility type */}
              {facility?.facilityType === "event-workspace" ? (
                // EVENT WORKSPACE BOOKING SECTION
                <>
                  <div className="p-4 sm:p-6 border-b">
                    <h3 className="text-lg font-semibold mb-4">
                      Event Space Details
                    </h3>

                    {/* Capacity Summary */}
                    <div className="border border-gray-200 rounded-lg p-4 mb-4">
                      <div className="text-sm text-gray-600 mb-2">
                        Total Capacity
                      </div>
                      <div className="text-2xl font-semibold text-gray-900">
                        {facility.details.seatingCapacity || 0} people
                      </div>
                      {/* {facility.details.features?.length > 0 && (
                        <div className="mt-3">
                          <h4 className="text-sm font-medium text-gray-700 mb-2">
                            Features:
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {facility.details.features.slice(0, 5).map((feature: string, index: number) => (
                              <span 
                                key={index}
                                className="bg-gray-100 text-gray-700 text-xs px-2.5 py-1 rounded-full"
                              >
                                {feature}
                              </span>
                            ))}
                            {facility.details.features.length > 5 && (
                              <span className="text-xs text-gray-500 self-center">
                                +{facility.details.features.length - 5} more
                              </span>
                            )}
                          </div>
                        </div>
                      )} */}
                    </div>

                    {/* Rental Plans */}
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-3">
                        Select Rental Plan:
                      </h4>
                      <div className="space-y-3">
                        {facility.details.rentalPlans?.map(
                          (plan: any, index: number) => (
                            <div
                              key={index}
                              onClick={() => setSelectedPlan(plan)}
                              className={`border rounded-lg p-4 cursor-pointer transition-all ${
                                selectedPlan?.name === plan.name
                                  ? "border-primary bg-primary/5"
                                  : "border-gray-200 hover:border-primary/50"
                              }`}
                            >
                              <div className="flex justify-between items-center">
                                <div>
                                  <h5 className="font-medium text-gray-900">
                                    {plan.name}
                                  </h5>
                                  <p className="text-sm text-gray-500">
                                    {plan.rentalPlan}
                                  </p>
                                </div>
                                <div className="text-right">
                                  <div className="font-semibold text-gray-900">
                                    ₹{basePrice.toLocaleString()}
                                  </div>
                                  {plan.discount && (
                                    <span className="text-xs text-green-600">
                                      {plan.discount}% off
                                    </span>
                                  )}
                                </div>
                              </div>

                              {/* Quantity Selector - Only show for selected plan */}
                              {selectedPlan?.name === plan.name && (
                                <div className="mt-3 pt-3 border-t">
                                  <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-700">
                                      {plan.name}
                                    </span>
                                    <div className="flex items-center space-x-2">
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          if (unitCount > 1)
                                            setUnitCount(unitCount - 1);
                                        }}
                                        className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-300 hover:bg-gray-100"
                                        disabled={unitCount <= 1}
                                      >
                                        <span className="text-lg">-</span>
                                      </button>
                                      <span className="w-10 text-center">
                                        {unitCount}
                                      </span>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setUnitCount(unitCount + 1);
                                        }}
                                        className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-300 hover:bg-gray-100"
                                      >
                                        <span className="text-lg">+</span>
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          )
                        )}
                      </div>

                      {!facility.details.rentalPlans?.length && (
                        <p className="text-sm text-gray-500 italic">
                          No rental plans available at the moment.
                        </p>
                      )}
                    </div>

                    {/* Price Summary */}
                    <div className="p-4 sm:p-6 border-b">
                      <div className="space-y-3">
                        <div className="flex justify-between text-sm sm:text-base">
                          <span>Price per {selectedPlan?.name || ""}</span>
                          <span className="font-semibold">
                            ₹{basePrice.toLocaleString() || "0"}
                          </span>
                        </div>

                        <div className="flex justify-between text-sm sm:text-base">
                          <span>
                            {selectedPlan?.name || ""} × {unitCount}
                          </span>
                          {/* <span>₹{(selectedPlan?.price * unitCount)?.toFixed(2) || "0.00"}</span> */}
                        </div>

                        {gstAmount > 0 && (
                          <div className="flex justify-between text-sm sm:text-base">
                            <span>GST (18%)</span>
                            <span>₹{displayTotalGst?.toFixed(2)}</span>
                          </div>
                        )}

                        <div className="flex justify-between font-semibold pt-3 border-t text-sm sm:text-base">
                          <span>Total Amount</span>
                          <span>₹{totalAmount?.toFixed(2) || "0.00"}</span>
                        </div>
                      </div>

                      {/* {selectedPlan && (
                        <div className="text-xs sm:text-sm text-gray-600 mt-2">
                          {getDurationText(selectedPlan?.name, unitCount)}
                        </div>
                      )} */}
                    </div>

                    {/* Booking Form for Event Workspace */}
                    <div className="p-4 sm:p-6">
                      {!session && (
                        <div className="mb-4 p-3 sm:p-4 bg-gray-50 rounded-lg text-center">
                          <p className="text-xs sm:text-sm text-gray-600 mb-3">
                            Sign in to book this event space
                          </p>
                          <div className="flex gap-2 justify-center">
                            <Link
                              href={`/sign-in?from=${encodeURIComponent(window.location.pathname)}`}
                            >
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-xs sm:text-sm"
                              >
                                Sign In
                              </Button>
                            </Link>
                            <Link
                              href={`/sign-up?from=${encodeURIComponent(window.location.pathname)}`}
                            >
                              <Button size="sm" className="text-xs sm:text-sm">
                                Create Account
                              </Button>
                            </Link>
                          </div>
                        </div>
                      )}

                      {session?.user?.userType === "Service Provider" && (
                        <div className="mb-4 p-3 sm:p-4 bg-amber-50 border border-amber-200 rounded-lg">
                          <p className="text-xs sm:text-sm text-amber-800">
                            Facility Partners cannot make bookings. Please use a
                            startup account to book facilities.
                          </p>
                        </div>
                      )}

                      {/* Booking Duration Selection */}
                      {/* <div className="mb-4 sm:mb-6">
                        <h3 className="text-sm font-medium mb-2 sm:mb-3">
                          Choose Booking Duration
                        </h3>
                        {sortedRentalPlans.map((plan) => {
                          const isSelected = selectedPlan?.name === plan.name;
                          const fixedFeePerUnit = getFixedServiceFee(
                            facility?.facilityType || ""
                          );

                          let fallbackPrice;
                          if (session?.user) {
                            if (
                              session?.user &&
                              !isProfileLoading &&
                              isExisting === false
                            ) {
                              const distanceBasedFee =
                                plan.price *
                                unitCount *
                                0.07;
                              fallbackPrice =
                                plan.price * unitCount +
                                distanceBasedFee;
                            } else {
                              const fixedFee =
                                fixedFeePerUnit *
                                unitCount;
                              fallbackPrice =
                                plan.price * unitCount +
                                fixedFee;
                            }
                          } else {
                            const distanceBasedFee =
                              plan.price *
                              unitCount *
                              0.07;
                            fallbackPrice =
                              plan.price * unitCount +
                              distanceBasedFee;
                          }

                          const totalPrice = Math.round(fallbackPrice);

                          return (
                            <button
                              key={plan.name}
                              onClick={() => {
                                setSelectedPlan(plan);
                                setSelectedDate(null);
                                setSelectedTime("");
                                setUnitCount(1);
                                setPriceDetails(null);
                              }}
                              className={`w-full flex items-center justify-between p-2 sm:p-3 mt-2 sm:mt-3 rounded-lg border transition-all ${
                                isSelected
                                  ? "border-primary bg-primary/5 text-primary"
                                  : "border-gray-200 hover:border-primary/50"
                              }`}
                            >
                              <span className="font-medium">
                                {plan.name === "One Day (24 Hours)"
                                  ? "Daily"
                                  : plan.name}
                              </span>
                              <span>₹{plan.price.toLocaleString()}</span>
                            </button>
                          );
                        })}
                      </div> */}

                      {/* Date and Time Selection */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4 sm:mb-6">
                        <div>
                          <Label
                            htmlFor="date-select"
                            className="text-sm font-medium mb-1.5 block"
                          >
                            Choose Date
                          </Label>
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
                              customInput={
                                <Input
                                  id="date-select"
                                  className="pl-3 pr-8 text-sm"
                                />
                              }
                            />
                            <CalendarIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                          </div>
                        </div>
                        <div>
                          <Label
                            htmlFor="time-select"
                            className="text-sm font-medium mb-1.5 block"
                          >
                            Choose Time
                          </Label>
                          <select
                            id="time-select"
                            value={selectedTime}
                            onChange={(e) => setSelectedTime(e.target.value)}
                            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                          >
                            <option value="">Select time</option>
                            {timeSlots.map((time) => (
                              <option key={time} value={time}>
                                {time}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Contact Number */}
                      <div className="mb-4 sm:mb-6">
                        <Label
                          htmlFor="contact-number"
                          className="text-sm font-medium mb-1.5 block"
                        >
                          Contact Number
                        </Label>
                        <Input
                          id="contact-number"
                          type="tel"
                          value={contactNumber}
                          onChange={(e) => setContactNumber(e.target.value)}
                          placeholder="Enter your contact number"
                          className="w-full text-sm"
                        />
                      </div>

                      {/* Booking Summary */}
                      {selectedDate && selectedTime && selectedPlan && (
                        <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-gray-50 rounded-lg">
                          <h3 className="text-sm font-medium mb-2">
                            Booking Summary
                          </h3>
                          <div className="space-y-2 text-xs sm:text-sm">
                            {/* <div className="flex justify-between">
                              <span className="text-gray-600">Rooms:</span>
                              <span>{selectedRooms.length}</span>
                            </div> */}
                            <div className="flex justify-between">
                              <span className="text-gray-600">Start:</span>
                              <span className="text-right">
                                {selectedDate.toLocaleDateString("en-US", {
                                  weekday: "short",
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                })}{" "}
                                {selectedTime}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">End:</span>
                              <span className="text-right">
                                {(() => {
                                  const startDate = new Date(selectedDate);
                                  const [hours, minutes] =
                                    selectedTime.split(" ")[0].split(":")
                                      .length === 2
                                      ? selectedTime.split(" ")[0].split(":")
                                      : [selectedTime.split(" ")[0], "00"];
                                  const isPM = selectedTime.includes("PM");
                                  startDate.setHours(
                                    isPM
                                      ? parseInt(hours) === 12
                                        ? 12
                                        : parseInt(hours) + 12
                                      : parseInt(hours) === 12
                                        ? 0
                                        : parseInt(hours),
                                    parseInt(minutes) || 0
                                  );

                                  const endDate = new Date(startDate);
                                  switch (selectedPlan.name) {
                                    case "Annual":
                                      endDate.setFullYear(
                                        endDate.getFullYear() + unitCount
                                      );
                                      break;
                                    case "Monthly":
                                      endDate.setMonth(
                                        endDate.getMonth() + unitCount
                                      );
                                      break;
                                    case "Weekly":
                                      endDate.setDate(
                                        endDate.getDate() + 7 * unitCount
                                      );
                                      break;
                                    case "One Day (24 Hours)":
                                      endDate.setDate(
                                        endDate.getDate() + unitCount
                                      );
                                      break;
                                    case "Hourly":
                                      endDate.setHours(
                                        endDate.getHours() + unitCount
                                      );
                                      break;
                                  }

                                  return (
                                    endDate.toLocaleDateString("en-US", {
                                      weekday: "short",
                                      day: "numeric",
                                      month: "short",
                                      year: "numeric",
                                    }) +
                                    " " +
                                    endDate.toLocaleTimeString("en-US", {
                                      hour: "numeric",
                                      minute: "2-digit",
                                      hour12: true,
                                    })
                                  );
                                })()}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Duration:</span>
                              <span>
                                {unitCount}{" "}
                                {selectedPlan.name === "Annual"
                                  ? `year${unitCount > 1 ? "s" : ""}`
                                  : selectedPlan.name === "Monthly"
                                    ? `month${unitCount > 1 ? "s" : ""}`
                                    : selectedPlan.name === "Weekly"
                                      ? `week${unitCount > 1 ? "s" : ""}`
                                      : selectedPlan.name ===
                                          "One Day (24 Hours)"
                                        ? `day${unitCount > 1 ? "s" : ""}`
                                        : `hour${unitCount > 1 ? "s" : ""}`}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">
                                Total amount:
                              </span>
                              <span>₹{totalAmount}</span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Book Button */}
                      <Button
                        className="w-full text-sm sm:text-base font-semibold py-4 sm:py-6"
                        onClick={handleBookingSubmit}
                        disabled={
                          !session ||
                          session?.user?.userType === "Service Provider" ||
                          !selectedDate ||
                          !selectedTime ||
                          !contactNumber ||
                          !selectedPlan ||
                          processingPayment
                          // selectedRooms.length === 0
                        }
                      >
                        {processingPayment ? (
                          <span className="flex items-center justify-center">
                            <span className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-white"></span>
                            Processing...
                          </span>
                        ) : session ? (
                          // selectedRooms.length === 0 ? (
                          //   "Select Rooms to Continue"
                          // ) :
                          "Reserve Event Space"
                        ) : (
                          "Sign in to Book"
                        )}
                      </Button>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {/* Price Display */}
                  <div className="p-4 sm:p-6 border-b">
                    <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
                      {/* Number of Slots */}
                      <div className="flex justify-between text-xs sm:text-sm text-gray-500">
                        <span>Number of Seats</span>
                        <span>{bookingSeats}</span>
                      </div>

                      {/* Base Price (includes service fee) */}
                      <div className="flex justify-between text-sm sm:text-base">
                        <span>
                          Base Price{" "}
                          {unitCount > 1 || bookingSeats > 1 ? (
                            <>
                             ({bookingSeats} × ₹
{selectedPlan
  ? (() => {
      const basePrice = selectedPlan.price; // per-unit base price
      const serviceFee = isExisting === true
        ? getFixedServiceFee(facility?.facilityType || "")
        : basePrice * 0.07; // per-unit service fee
      const companyGstPerUnit = 0.18 * serviceFee; // GST on service fee (per unit)
      const gstTotal = priceDetails?.gstAmount && priceDetails.gstAmount > 0
        ? priceDetails.gstAmount
        : 0;
      const unitCountForDivision = Math.max(1, unitCount * bookingSeats);
      const gstPerUnit = gstTotal ? gstTotal / unitCountForDivision : 0;

      const pricePerUnit = basePrice + serviceFee;
      return pricePerUnit.toFixed(2);
    })()
  : "0.00"}
)
                            </>
                          ) : null}
                        </span>
                        <span>
                          {selectedPlan
                            ? (() => {
                                const basePrice =
                                  selectedPlan.price * unitCount * bookingSeats;
                                const serviceFee =
                                  isExisting === true
                                    ? getFixedServiceFee(
                                        facility?.facilityType || ""
                                      ) *
                                      unitCount *
                                      bookingSeats
                                    : basePrice * 0.07;
                                const companygst = 0.18 * serviceFee;
                                const gstAmount =
                                  priceDetails?.gstAmount &&
                                  priceDetails.gstAmount > 0
                                    ? priceDetails.gstAmount
                                    : 0;

                                const finalTotalPrice = basePrice + serviceFee;
                                return `₹${finalTotalPrice.toFixed(2)}`;
                              })()
                            : "₹0.00"}
                        </span>
                      </div>

                      {/* GST if applicable */}
{/* GST if applicable (START OF CORRECTED LOGIC) */}
{displayTotalGst > 0 && (
      <div className="flex justify-between text-sm sm:text-base">
        <span>GST (18%)</span>
        <span>₹{displayTotalGst.toFixed(2)}</span>
      </div>
    )}
{/* GST if applicable (END OF CORRECTED LOGIC) */}

                      {/* Total Fare */}
                      <div className="flex justify-between font-semibold pt-3 border-t text-sm sm:text-base">
                        <span>Total Fare (Inclusive of all taxes)</span>
                        <span>
                          {/* {
                           
                            selectedPlan
                              ? (() => {
                                  const basePrice =
                                    selectedPlan.price *
                                    unitCount *
                                    bookingSeats;
                                  const serviceFee =
                                    isExisting === true
                                      ? getFixedServiceFee(
                                          facility?.facilityType || ""
                                        ) *
                                        unitCount *
                                        bookingSeats
                                      : basePrice * 0.07;
                                  const companygst = serviceFee * 0.18;
                                  // console.log("Company GST:", companygst);
                                  const subtotal = basePrice + serviceFee;
                                  // console.log("subtotal" , subtotal)
                                  // const totalaftergst = companygst + subtotal;
                                  const gstAmount =
                                    priceDetails?.gstAmount &&
                                    priceDetails?.gstAmount > 0
                                      ? priceDetails.gstAmount
                                      : 0;
                                  // console.log("GST Amount:", gstAmount);
                                  const totalAmount =
                                    subtotal + gstAmount + companygst;
                                  // console.log("Total Amount:", totalAmount);
                                  return `₹${totalAmount.toFixed(2)}`;
                                })()
                              : "₹0.00" */}
                          ₹{totalAmount?.toFixed(2) || "0.00"}
                        </span>
                      </div>
                    </div>

                    <div className="text-xs sm:text-sm text-gray-600">
                      {selectedPlan?.name === "Monthly" &&
                        `for ${unitCount} month${unitCount > 1 ? "s" : ""}`}
                      {selectedPlan?.name === "Annual" &&
                        `for ${unitCount} year${unitCount > 1 ? "s" : ""}`}
                      {selectedPlan?.name === "Weekly" &&
                        `for ${unitCount} week${unitCount > 1 ? "s" : ""}`}
                      {selectedPlan?.name === "One Day (24 Hours)" &&
                        `for ${unitCount} day${unitCount > 1 ? "s" : ""}`}
                      {selectedPlan?.name === "Hourly" &&
                        `for ${unitCount} hour${unitCount > 1 ? "s" : ""}`}
                    </div>
                  </div>

                  {/* Booking Form */}
                  <div className="p-4 sm:p-6">
                    {/* Auth Overlay */}
                    {!session && (
                      <div className="mb-4 p-3 sm:p-4 bg-gray-50 rounded-lg text-center">
                        <p className="text-xs sm:text-sm text-gray-600 mb-3">
                          Sign in to book this facility
                        </p>
                        <div className="flex gap-2 justify-center">
                          <Link
                            href={`/sign-in?from=${encodeURIComponent(window.location.pathname)}`}
                          >
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-xs sm:text-sm"
                            >
                              Sign In
                            </Button>
                          </Link>
                          <Link
                            href={`/sign-up?from=${encodeURIComponent(window.location.pathname)}`}
                          >
                            <Button size="sm" className="text-xs sm:text-sm">
                              Create Account
                            </Button>
                          </Link>
                        </div>
                      </div>
                    )}

                    {/* Service Provider Warning */}
                    {session?.user?.userType === "Service Provider" && (
                      <div className="mb-4 p-3 sm:p-4 bg-amber-50 border border-amber-200 rounded-lg">
                        <p className="text-xs sm:text-sm text-amber-800">
                          Facility Partners cannot make bookings. Please use a
                          startup account to book facilities.
                        </p>
                      </div>
                    )}

                    {/* Booking Period Selection */}
                    <div className="mb-4 sm:mb-6">
                      <h3 className="text-sm font-medium mb-2 sm:mb-3">
                        Choose Booking Duration
                      </h3>
                      {sortedRentalPlans.map((plan) => {
                        const isSelected = selectedPlan?.name === plan.name;

                        const basePrice = plan.price;
                        const fixedFeePerUnit = getFixedServiceFee(
                          facility?.facilityType || ""
                        );
                        let planServiceFee = 0;
                        if (session?.user && isExisting === true) {
                          planServiceFee = fixedFeePerUnit;
                        } else {
                          planServiceFee = basePrice * 0.07;
                        }

                        const displayPrice = basePrice + planServiceFee;

                        return (
                          <button
                            key={plan.name}
                            onClick={() => {
                              setSelectedPlan(plan);
                              setSelectedDate(null);
                              setSelectedTime("");
                              setUnitCount(1);
                              setBookingSeats(1);
                            }}
                            className={`w-full flex items-center justify-between p-2 sm:p-3 mt-2 sm:mt-3 rounded-lg border transition-all text-sm sm:text-base ${
                              isSelected
                                ? "border-primary bg-primary/5 text-primary"
                                : "border-gray-200 hover:border-primary/50"
                            }`}
                          >
                            <span className="font-medium">
                              {plan.name === "One Day (24 Hours)"
                                ? "Daily"
                                : plan.name}
                            </span>
                            <span>₹{displayPrice.toFixed(2)}</span>
                          </button>
                        );
                      })}
                    </div>

                    {/* booking units and slots */}
                    <div className="mb-4 sm:mb-6">
                      <h3 className="text-sm font-medium mb-2 sm:mb-3">
                        Choose Booking Details
                      </h3>

                      <div className="space-y-3 sm:space-y-4">
                        {/* Unit Counter (years, months, weeks, days, hours) */}
                        {selectedPlan &&
                          [
                            "Annual",
                            "Monthly",
                            "Weekly",
                            "One Day (24 Hours)",
                            "Hourly",
                          ].includes(selectedPlan.name) && (
                            <div className="flex items-center justify-between p-2 sm:p-3 rounded-lg border border-gray-200">
                              <span className="text-sm font-medium">
                                {(() => {
                                  switch (selectedPlan.name) {
                                    case "Annual":
                                      return "Number of Years";
                                    case "Monthly":
                                      return "Number of Months";
                                    case "Weekly":
                                      return "Number of Weeks";
                                    case "One Day (24 Hours)":
                                      return "Number of Days";
                                    case "Hourly":
                                      return "Number of Hours";
                                    default:
                                      return "Number of Units";
                                  }
                                })()}
                              </span>
                              <div className="flex items-center gap-2 sm:gap-3">
                                <button
                                  onClick={() =>
                                    setUnitCount(Math.max(1, unitCount - 1))
                                  }
                                  className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-full border border-gray-200 hover:border-primary/50 transition-colors"
                                  type="button"
                                >
                                  <span className="text-base sm:text-lg">
                                    -
                                  </span>
                                </button>
                                <span className="w-6 sm:w-8 text-center font-medium text-sm sm:text-base">
                                  {unitCount}
                                </span>
                                <button
                                  onClick={() => setUnitCount(unitCount + 1)}
                                  className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-full border border-gray-200 hover:border-primary/50 transition-colors"
                                  type="button"
                                >
                                  <span className="text-base sm:text-lg">
                                    +
                                  </span>
                                </button>
                              </div>
                            </div>
                          )}

                        {/* Slot/Sample/Seat Counter - Only show for specific booking plan types */}
                        {(() => {
                          const bookingPlanType =
                            facility?.details?.bookingPlanType;
                          const facilityType = facility?.facilityType;

                          // Show for per_slot and per_sample (labs/equipment)
                          if (
                            bookingPlanType === "per_slot" ||
                            bookingPlanType === "per_sample"
                          ) {
                            return (
                              <div className="flex items-center justify-between p-2 sm:p-3 rounded-lg border border-gray-200">
                                <span className="text-sm font-medium">
                                  Number of {bookingUnitLabelPlural}
                                </span>
                                <div className="flex items-center gap-2 sm:gap-3">
                                  <button
                                    onClick={() =>
                                      setBookingSeats(
                                        Math.max(1, bookingSeats - 1)
                                      )
                                    }
                                    className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-full border border-gray-200 hover:border-primary/50 transition-colors"
                                    type="button"
                                  >
                                    <span className="text-base sm:text-lg">
                                      -
                                    </span>
                                  </button>
                                  <span className="w-6 sm:w-8 text-center font-medium text-sm sm:text-base">
                                    {bookingSeats}
                                  </span>
                                  <button
                                    onClick={() =>
                                      setBookingSeats(bookingSeats + 1)
                                    }
                                    className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-full border border-gray-200 hover:border-primary/50 transition-colors"
                                    type="button"
                                  >
                                    <span className="text-base sm:text-lg">
                                      +
                                    </span>
                                  </button>
                                </div>
                              </div>
                            );
                          }

                          // Show for facilities with available seats/cabins (coworking, individual-cabin)
                          if (
                            (facilityType === "coworking-spaces" &&
                              (facility.details.availableSeats ?? 0) > 0) ||
                            (facilityType === "individual-cabin" &&
                              (facility.details.availableCabins ?? 0) > 0) ||
                            (facilityType === "training-rooms" &&
                              (facility.details.totalTrainingRoomSeaters ?? 0) >
                                0)
                          ) {
                            return (
                              <div className="flex items-center justify-between p-2 sm:p-3 rounded-lg border border-gray-200">
                                <span className="text-sm font-medium">
                                  Number of{" "}
                                  {facilityType === "individual-cabin"
                                    ? "Cabins"
                                    : "Seats"}
                                </span>
                                <div className="flex items-center gap-2 sm:gap-3">
                                  <button
                                    onClick={() =>
                                      setBookingSeats(
                                        Math.max(1, bookingSeats - 1)
                                      )
                                    }
                                    className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-full border border-gray-200 hover:border-primary/50 transition-colors"
                                    type="button"
                                  >
                                    <span className="text-base sm:text-lg">
                                      -
                                    </span>
                                  </button>
                                  <span className="w-6 sm:w-8 text-center font-medium text-sm sm:text-base">
                                    {bookingSeats}
                                  </span>
                                  <button
                                    onClick={() =>
                                      setBookingSeats((prev) =>
                                        Math.min(getMaxSeats(), prev + 1)
                                      )
                                    }
                                    disabled={bookingSeats >= getMaxSeats()}
                                    className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-full border border-gray-200 hover:border-primary/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    type="button"
                                  >
                                    <span className="text-base sm:text-lg">
                                      +
                                    </span>
                                  </button>
                                </div>
                              </div>
                            );
                          }

                          // Don't show for whole-unit bookings (raw-space, meeting-rooms, board-room, studio, etc.)
                          return null;
                        })()}

                        {/* Price Display */}
                        {priceDetails && (
                          <div className="flex justify-between p-2 sm:p-3 rounded-lg border border-gray-200">
                            <span className="text-sm font-medium">
                              Total Price
                            </span>
                            <span className="text-sm font-semibold text-primary">
                              {/* {selectedPlan
                                ? (() => {
                                    const basePrice =
                                      selectedPlan.price *
                                      unitCount *
                                      bookingSeats;
                                    const serviceFee =
                                      isExisting === true
                                        ? getFixedServiceFee(
                                            facility?.facilityType || ""
                                          ) *
                                          unitCount *
                                          bookingSeats
                                        : basePrice * 0.07;
                                    const companygst = serviceFee * 0.18;
                                    // console.log("Company GST:", companygst);
                                    const subtotal = basePrice + serviceFee;
                                    // console.log("subtotal" , subtotal)
                                    // const totalaftergst = companygst + subtotal;
                                    const gstAmount =
                                      priceDetails?.gstAmount &&
                                      priceDetails?.gstAmount > 0
                                        ? priceDetails.gstAmount
                                        : 0;
                                    // console.log("GST Amount:", gstAmount);
                                    const totalAmount =
                                      subtotal + gstAmount + companygst;
                                    // console.log("Total Amount:", totalAmount);
                                    return `₹${totalAmount.toFixed(2)}`;
                                  })()
                                : "₹0.00"} */}
                                  ₹{totalAmount?.toFixed(2) || "0.00"}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Date and Time Selection */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4 sm:mb-6">
                      <div>
                        <Label
                          htmlFor="date-select"
                          className="text-sm font-medium mb-1.5 block"
                        >
                          Choose Date
                        </Label>
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
                            customInput={
                              <Input
                                id="date-select"
                                className="pl-3 pr-8 text-sm"
                              />
                            }
                          />
                          <CalendarIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        </div>
                      </div>
                      <div>
                        <Label
                          htmlFor="time-select"
                          className="text-sm font-medium mb-1.5 block"
                        >
                          Choose Time
                        </Label>
                        <select
                          id="time-select"
                          value={selectedTime}
                          onChange={(e) => setSelectedTime(e.target.value)}
                          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                        >
                          <option value="">Select time</option>
                          {timeSlots.map((time) => (
                            <option key={time} value={time}>
                              {time}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Contact Number */}
                    <div className="mb-4 sm:mb-6">
                      <Label
                        htmlFor="contact-number"
                        className="text-sm font-medium mb-1.5 block"
                      >
                        Contact Number
                      </Label>
                      <Input
                        id="contact-number"
                        type="tel"
                        value={contactNumber}
                        onChange={(e) => setContactNumber(e.target.value)}
                        placeholder="Enter your contact number"
                        className="w-full text-sm"
                      />
                    </div>

                    <div className="mb-4">
                      <h3 className="text-sm font-medium mb-2">
                        Have a Coupon Code?
                      </h3>

                      {!appliedCoupon ? (
                        <div className="space-y-2">
                          <div className="flex gap-2">
                            <Input
                              placeholder="Enter coupon code"
                              value={couponCode}
                              onChange={(e) => {
                                setCouponCode(e.target.value.toUpperCase());
                                setCouponError("");
                              }}
                              className="flex-1 h-9 text-sm uppercase"
                              maxLength={20}
                              disabled={isCouponLoading}
                            />
                            <Button
                              onClick={handleApplyCoupon}
                              disabled={
                                isCouponLoading ||
                                !couponCode.trim() ||
                                !getSelectedPlanPrice()
                              }
                              variant="outline"
                              size="sm"
                              className="h-9 px-4"
                            >
                              {isCouponLoading ? "Applying..." : "Apply"}
                            </Button>
                          </div>

                          {couponError && (
                            <p className="text-xs text-red-600">
                              {couponError}
                            </p>
                          )}

                          <p className="text-xs text-gray-500">
                            Enter your coupon code to get a discount
                          </p>
                        </div>
                      ) : (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                          <div className="flex items-start justify-between mb-1">
                            <div className="flex items-center gap-2">
                              <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                                <svg
                                  className="w-3 h-3 text-white"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M5 13l4 4L19 7"
                                  />
                                </svg>
                              </div>
                              <div>
                                <p className="font-semibold text-green-900 text-sm">
                                  {appliedCoupon.couponCode} Applied!
                                </p>
                                <p className="text-xs text-green-700">
                                  You saved ₹
                                  {appliedCoupon.discountAmount.toLocaleString()}{" "}
                                  ({appliedCoupon.discount}% off)
                                </p>
                              </div>
                            </div>
                            <button
                              onClick={handleRemoveCoupon}
                              className="text-green-700 hover:text-green-900 p-1"
                              title="Remove coupon"
                            >
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M6 18L18 6M6 6l12 12"
                                />
                              </svg>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Booking Summary */}
                    {selectedDate && selectedTime && selectedPlan && (
                      <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-gray-50 rounded-lg">
                        <h3 className="text-sm font-medium mb-2">
                          Booking Summary
                        </h3>
                        <div className="space-y-2 text-xs sm:text-sm">
                          {/* Booking Duration Details */}
                          <div className="mb-2 pb-2 border-b border-gray-200">
                            <div className="flex justify-between mb-1">
                              <span className="text-gray-600">
                                Duration Type:
                              </span>
                              <span className="font-medium">
                                {selectedPlan.name === "One Day (24 Hours)"
                                  ? "Daily"
                                  : selectedPlan.name}
                              </span>
                            </div>
                            <div className="flex justify-between mb-1">
                              <span className="text-gray-600">Duration:</span>
                              <span className="font-medium">
                                {unitCount}{" "}
                                {selectedPlan.name === "Annual"
                                  ? `year${unitCount > 1 ? "s" : ""}`
                                  : selectedPlan.name === "Monthly"
                                    ? `month${unitCount > 1 ? "s" : ""}`
                                    : selectedPlan.name === "Weekly"
                                      ? `week${unitCount > 1 ? "s" : ""}`
                                      : selectedPlan.name ===
                                          "One Day (24 Hours)"
                                        ? `day${unitCount > 1 ? "s" : ""}`
                                        : `hour${unitCount > 1 ? "s" : ""}`}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">
                                Number of {bookingUnitLabel}s:
                              </span>
                              <span className="font-medium">
                                {bookingSeats}
                              </span>
                            </div>
                          </div>

                          {/* Timing Details */}
                          <div className="flex justify-between">
                            <span className="text-gray-600">Start:</span>
                            <span className="text-right">
                              {selectedDate.toLocaleDateString("en-US", {
                                weekday: "short",
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })}{" "}
                              {selectedTime}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">End:</span>
                            <span className="text-right">
                              {(() => {
                                const startDate = new Date(selectedDate);
                                const [hours, minutes] =
                                  selectedTime.split(" ")[0].split(":")
                                    .length === 2
                                    ? selectedTime.split(" ")[0].split(":")
                                    : [selectedTime.split(" ")[0], "00"];
                                const isPM = selectedTime.includes("PM");
                                startDate.setHours(
                                  isPM
                                    ? parseInt(hours) === 12
                                      ? 12
                                      : parseInt(hours) + 12
                                    : parseInt(hours) === 12
                                      ? 0
                                      : parseInt(hours),
                                  parseInt(minutes) || 0
                                );

                                const endDate = new Date(startDate);
                                switch (selectedPlan.name) {
                                  case "Annual":
                                    endDate.setFullYear(
                                      endDate.getFullYear() + unitCount
                                    );
                                    break;
                                  case "Monthly":
                                    endDate.setMonth(
                                      endDate.getMonth() + unitCount
                                    );
                                    break;
                                  case "Weekly":
                                    endDate.setDate(
                                      endDate.getDate() + 7 * unitCount
                                    );
                                    break;
                                  case "One Day (24 Hours)":
                                    endDate.setDate(
                                      endDate.getDate() + unitCount
                                    );
                                    break;
                                  case "Hourly":
                                    endDate.setHours(
                                      endDate.getHours() + unitCount
                                    );
                                    break;
                                }

                                return (
                                  endDate.toLocaleDateString("en-US", {
                                    weekday: "short",
                                    day: "numeric",
                                    month: "short",
                                    year: "numeric",
                                  }) +
                                  " " +
                                  endDate.toLocaleTimeString("en-US", {
                                    hour: "numeric",
                                    minute: "2-digit",
                                    hour12: true,
                                  })
                                );
                              })()}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Duration:</span>
                            <span>
                              {unitCount}{" "}
                              {selectedPlan.name === "Annual"
                                ? `year${unitCount > 1 ? "s" : ""}`
                                : selectedPlan.name === "Monthly"
                                  ? `month${unitCount > 1 ? "s" : ""}`
                                  : selectedPlan.name === "Weekly"
                                    ? `week${unitCount > 1 ? "s" : ""}`
                                    : selectedPlan.name === "One Day (24 Hours)"
                                      ? `day${unitCount > 1 ? "s" : ""}`
                                      : `hour${unitCount > 1 ? "s" : ""}`}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Price Calculation - Update to show combined base price + service fee */}
                    <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
                      {/* Booking Slot Info */}
                      <div className="flex justify-between text-xs sm:text-sm">
                        <span>Number of Seats</span>
                        <span>{bookingSeats}</span>
                      </div>

                      {/* Base Price with units and slots shown */}
                      <div className="flex justify-between text-sm sm:text-base">
                        <span>
                          Base Price{" "}
                          {unitCount > 1 || bookingSeats > 1 ? (
                            <>
                              ({bookingSeats} × ₹
                              {selectedPlan
  ? (() => {
      const basePrice = selectedPlan.price; // per-unit base price
      const serviceFee = isExisting === true
        ? getFixedServiceFee(facility?.facilityType || "")
        : basePrice * 0.07; // per-unit service fee
      const companyGstPerUnit = 0.18 * serviceFee; // GST on service fee (per unit)
      const gstTotal = priceDetails?.gstAmount && priceDetails.gstAmount > 0
        ? priceDetails.gstAmount
        : 0;
      const unitCountForDivision = Math.max(1, unitCount * bookingSeats);
      const gstPerUnit = gstTotal ? gstTotal / unitCountForDivision : 0;

      const pricePerUnit = basePrice + serviceFee;
      return pricePerUnit.toFixed(2);
    })()
  : "0.00"}
)
                            </>
                          ) : null}
                        </span>
                        <span>
                          {selectedPlan
                            ? (() => {
                                const basePrice =
                                  selectedPlan.price * unitCount * bookingSeats;
                                const serviceFee =
                                  isExisting === true
                                    ? getFixedServiceFee(
                                        facility?.facilityType || ""
                                      ) *
                                      unitCount *
                                      bookingSeats
                                    : basePrice * 0.07;
                                const companygst = serviceFee * 0.18;
                                const gstAmount =
                                  priceDetails?.gstAmount &&
                                  priceDetails.gstAmount > 0
                                    ? priceDetails.gstAmount
                                    : 0;

                                const finalTotalPrice =
                                  basePrice +
                                  serviceFee;

                                return `₹${finalTotalPrice.toFixed(2)}`;
                              })()
                            : "₹0.00"}
                        </span>
                      </div>

                      {/* GST */}
                  {displayTotalGst > 0 && (
      <div className="flex justify-between text-sm sm:text-base">
        <span>GST (18%)</span>
        <span>₹{displayTotalGst.toFixed(2)}</span>
      </div>
    )}

                      {/* Subtotal before discount (only show if coupon is applied) */}
                      {appliedCoupon && (
                        <>
                          <div className="flex justify-between text-sm sm:text-base border-t pt-2">
                            <span className="text-gray-600">Subtotal</span>
                            <span className="text-gray-600">
                              ₹{totalAmount.toFixed(2)}
                            </span>
                          </div>

                          {/* Coupon Discount */}
                          <div className="flex justify-between text-sm sm:text-base text-green-600 bg-green-50 -mx-2 px-2 py-2 rounded">
                            <span className="flex items-center gap-1.5">
                              <svg
                                className="w-4 h-4"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                                <path
                                  fillRule="evenodd"
                                  d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z"
                                  clipRule="evenodd"
                                />
                              </svg>
                              Coupon ({appliedCoupon.couponCode}) -{" "}
                              {appliedCoupon.discount}% off
                            </span>
                            <span className="font-semibold">
                              - ₹{appliedCoupon.discountAmount.toFixed(2)}
                            </span>
                          </div>
                        </>
                      )}

                      {/* Total Fare */}
                      <div
                        className={`flex justify-between font-bold pt-3 border-t text-base sm:text-lg ${
                          appliedCoupon ? "text-green-700" : "text-gray-900"
                        }`}
                      >
                        <span>Total Amount (Inclusive of all taxes)</span>
                        <span>
                          ₹
                          {appliedCoupon
                            ? (
                                totalAmount - appliedCoupon.discountAmount
                              ).toFixed(2)
                            : totalAmount.toFixed(2)}
                        </span>
                      </div>

                      {/* Savings Banner */}
                      {appliedCoupon && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-2.5 sm:p-3 -mx-2">
                          <p className="text-xs sm:text-sm text-green-800 font-medium text-center flex items-center justify-center gap-1.5">
                            <span className="text-base">🎉</span>
                            You saved ₹{appliedCoupon.discountAmount.toFixed(2)}
                            !
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Book Now Button */}
                    <Button
                      className="w-full text-sm sm:text-base font-semibold py-4 sm:py-6"
                      onClick={handleBookingSubmit}
                      disabled={
                        !session ||
                        session?.user?.userType === "Service Provider" ||
                        !selectedDate ||
                        !selectedTime ||
                        !contactNumber ||
                        !selectedPlan ||
                        processingPayment
                      }
                    >
                      {processingPayment ? (
                        <span className="flex items-center justify-center">
                          <span className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-white"></span>
                          Processing...
                        </span>
                      ) : session ? (
                        "Reserve"
                      ) : (
                        "Sign in to Book"
                      )}
                    </Button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* More Facilities from this Provider - Full Width Section */}
      {facility.serviceProviderId && (
        <div className="mb-12 sm:mb-16">
          <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-gray-900">
            More facilities from{" "}
            {facility.serviceProvider?.serviceName &&
            facility.serviceProvider?._id ? (
              <Link
                href={`/ViewProvider/${facility.serviceProvider._id}`}
                className="font-bold text-green-600 hover:text-green-700 hover:underline cursor-pointer break-words"
              >
                {facility.serviceProvider.serviceName}
              </Link>
            ) : (
              "this provider"
            )}
          </h2>

          <div className="relative">
            {loadingRelatedFacilities ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
                {Array.from({ length: 4 }).map((_, index) => (
                  <FacilityCardSkeleton key={index} />
                ))}
              </div>
            ) : relatedFacilities.length > 0 ? (
              <div className="overflow-x-auto pb-4 hide-scrollbar">
                <div className="flex gap-3 sm:gap-4">
                  {relatedFacilities.map((relatedFacility) => (
                    <div
                      key={relatedFacility._id}
                      style={{
                        width: "280px",
                        minWidth: "280px",
                        height: "400px",
                      }}
                      className="flex-shrink-0"
                    >
                      <FacilityCard
                        facility={relatedFacility}
                        isHovered={hoveredFacilityId === relatedFacility._id}
                        onMouseEnter={() =>
                          setHoveredFacilityId(relatedFacility._id)
                        }
                        onMouseLeave={() => setHoveredFacilityId(null)}
                        isFeatured={relatedFacility.isFeatured}
                        className="h-full"
                      />
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 rounded-lg p-6 sm:p-8 text-center">
                <p className="text-gray-500 text-sm sm:text-base">
                  No other facilities available from this provider.
                </p>
                {facility.serviceProvider?.serviceName &&
                  facility.serviceProvider?._id && (
                    <p className="text-xs sm:text-sm text-gray-400 mt-2">
                      This is the only facility listed by{" "}
                      <Link
                        href={`/ViewProvider/${facility.serviceProvider._id}`}
                        className="text-green-600 hover:text-green-700 hover:underline cursor-pointer break-words"
                      >
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

      <Reviews
        facilityId={facilityId}
        serviceProvider={facility.serviceProviderId}
      />

      {/* Fullscreen Image Viewer */}
      {isFullscreen &&
        facility.details.images &&
        facility.details.images.length > 0 && (
          <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
            <div className="relative w-full h-full flex items-center justify-center">
              {/* Close button */}
              <button
                className="absolute top-2 sm:top-4 right-2 sm:right-4 text-white p-2 rounded-full hover:bg-white/10 transition-colors z-10"
                onClick={() => setIsFullscreen(false)}
              >
                <X className="h-6 w-6 sm:h-8 sm:w-8" />
              </button>

              {/* Navigation buttons */}
              {facility.details.images.length > 1 && (
                <>
                  <button
                    className="absolute left-2 sm:left-4 text-white p-2 rounded-full hover:bg-white/10 transition-colors z-10"
                    onClick={previousImage}
                  >
                    <ChevronLeft className="h-6 w-6 sm:h-8 sm:w-8" />
                  </button>
                  <button
                    className="absolute right-2 sm:right-4 text-white p-2 rounded-full hover:bg-white/10 transition-colors z-10"
                    onClick={nextImage}
                  >
                    <ChevronRight className="h-6 w-6 sm:h-8 sm:w-8" />
                  </button>
                </>
              )}

              {/* Image */}
              <div className="relative w-full h-full max-w-5xl max-h-[80vh] flex items-center justify-center">
                <Image
                  src={facility.details.images[fullscreenIndex]}
                  alt={`${facility.details.name} - Image ${fullscreenIndex + 1}`}
                  fill
                  className="object-contain"
                />
              </div>

              {/* Image counter */}
              <div className="absolute bottom-2 sm:bottom-4 left-1/2 transform -translate-x-1/2 bg-black/50 text-white px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm">
                {fullscreenIndex + 1} / {facility.details.images.length}
              </div>
            </div>
          </div>
        )}

      {/* Booking Modal */}
      {facility && (
        <BookingModal
          isOpen={isBookingModalOpen}
          onClose={() => setIsBookingModalOpen(false)}
          facility={facility}
        />
      )}

      {/* Incomplete Profile Modal */}
      <IncompleteProfileModal
        isOpen={showIncompleteProfileModal}
        onClose={() => setShowIncompleteProfileModal(false)}
        completionPercentage={completionPercentage}
        incompleteFields={incompleteFields}
        userType="startup"
        redirectPath="/startup/profile"
      />
    </div>
  );
}
