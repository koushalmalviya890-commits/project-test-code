"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { format } from "date-fns";
// import { useSession } from "next-auth/react";
import { useAuth } from "@/context/AuthContext"
import {
  Calendar,
  Clock,
  MapPin, 
  Info,
  CheckCircle,
  Phone,
  CreditCard,
  ArrowLeft,
  Loader2,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { getFixedServiceFee } from "@/lib/pricing";

interface FacilityDetails {
  _id: string;
  facilityType: string;
  details: {
    name: string;
    description: string;
    images: string[];
    rentalPlans: Array<{
      name: string;
      price: number;
      duration: string;
    }>;
  };
  address: string;
  city: string;
  state: string;
  serviceProvider?: {
    serviceName: string;
    logoUrl?: string | null;
  };
}

interface BookingDetails {
  facilityId: string;
  facility?: FacilityDetails;
  // duration: {
    rentalPlan: string;
    unitCount: number;
    unitLabel: string;
  // };
  // seating: {
  bookingSeats: number;
    // count: number;
    // type: string;
    label: string;
  // };
  // timing: {
    startDate: Date;
    endDate: Date;
  // };
  hasGST? : boolean;
  contactNumber: string;
  // pricing: {
  originalBaseAmount: number;
    baseAmount: number;
    perUnitPrice: number;
    serviceFee: number;
    gstAmount: number;
    gstOnServiceFee: number;
    totalBeforeDiscount: number;
    discount: number;
    amount: number;
  // };
  couponApplied?: {
    couponCode: string;
    discount: number;
    discountAmount: number;
    couponId: string;
  } | null;
}

export default function BookingDetailsClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  // const { data: session, status } = useSession();
  const {user, loading: authLoading} = useAuth();
  const status = authLoading ? "loading" : user ? "authenticated" : "unauthenticated";
  const [bookingDetails, setBookingDetails] = useState<BookingDetails | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorDetails, setErrorDetails] = useState<{
    message: string;
    redirect: string;
  } | null>(null);

  useEffect(() => {
    // Check if user is authenticated
    if (status === "unauthenticated") {
      router.push("/signin");
      return;
    }

    // Parse and validate query parameters
    try {
      if (!searchParams.has("data")) {
        throw new Error("No booking data provided");
      }

      const encodedData = searchParams.get("data");
      if (!encodedData) {
        throw new Error("Invalid booking data");
      }

      const decodedData = JSON.parse(decodeURIComponent(encodedData));
      //// console.log(decodedData, `post booking deatils`);
      // Validate required fields
      if (
        !decodedData.facilityId ||
        !decodedData.rentalPlan ||
        !decodedData.startDate ||
        !decodedData.contactNumber
      ) {
        throw new Error("Missing required booking details");
      }

      // Convert string dates to Date objects
      const parsedDetails = {
        ...decodedData,
        // timing: {
        //   ...decodedData.timing,
          startDate: new Date(decodedData.startDate),
          endDate: new Date(decodedData.endDate),
        // }
      };

      setBookingDetails(parsedDetails);
      //// console.log(bookingDetails?.gstAmount, `post for gst amount`);
      // Fetch facility details if not included in the data
      if (!parsedDetails.facility) {
        fetchFacilityDetails(parsedDetails.facilityId);
      } else {
        setLoading(false);
      }
    } catch (error) {
      console.error("Error parsing booking data:", error);
      setError("Invalid booking information");
      setErrorDetails({
        message: "Invalid booking information",
        redirect: "/",
      });
    }
  }, [searchParams, router, status]);

  useEffect(() => {
    if (error && errorDetails) {
      toast.error(error);
      if (errorDetails.redirect) {
        router.push(errorDetails.redirect);
      }
    }
  }, [error, errorDetails, router]);

  const fetchFacilityDetails = async (facilityId: string) => {
    try {
      const response = await fetch(`/api/facilities/${facilityId}`);
      if (!response.ok) throw new Error("Failed to fetch facility details");

      const facilityData = await response.json();

      setBookingDetails((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          facility: facilityData,
        };
      });
    } catch (error) {
      console.error("Error fetching facility details:", error);
      setError("Failed to load facility details");
    } finally {
      setLoading(false);
    }
  };

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

//refresh and back button block

useEffect(() => {
  if (processingPayment) {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = ""; // Required for Chrome to show confirmation
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }
}, [processingPayment]);


useEffect(() => {
  if (processingPayment) {
    const handlePopState = (e: PopStateEvent) => {
      e.preventDefault();
      window.history.pushState(null, "", window.location.href); // Push the same state again
    };

    window.history.pushState(null, "", window.location.href); // Initial push
    window.addEventListener("popstate", handlePopState);

    return () => window.removeEventListener("popstate", handlePopState);
  }
}, [processingPayment]);
 



  const handleProceedToPayment = async () => {
    if (!bookingDetails || !user?.id) return;

    try {
      setProcessingPayment(true);

      // Create a payment order
      const response = await fetch("/api/payments/razorpay/order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        //added credentials try to check it again if not required remove it
        credentials: "include",
        body: JSON.stringify({
          facilityId: bookingDetails.facilityId,
          rentalPlan: bookingDetails.rentalPlan,
          bookingSeats: bookingDetails.bookingSeats,
          // timing: {
            startDate: bookingDetails.startDate.toISOString(),
            endDate: bookingDetails.endDate.toISOString(),
          // },
          contactNumber: bookingDetails.contactNumber,
          // pricing: bookingDetails.pricing,
          originalBaseAmount: bookingDetails.originalBaseAmount,
          baseAmount: bookingDetails.baseAmount,
          perUnitPrice: bookingDetails.perUnitPrice,
          serviceFee: bookingDetails.serviceFee,
          gstOnServiceFee : bookingDetails.gstOnServiceFee,
          gstAmount: bookingDetails.gstAmount,
          totalBeforeDiscount: bookingDetails.totalBeforeDiscount,
          discount: bookingDetails.discount,
          amount: bookingDetails.amount,
          couponApplied: bookingDetails.couponApplied || null,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create payment order");
      }

      const orderData = await response.json();

      // Load Razorpay script
      const isScriptLoaded = await loadRazorpayScript();
      if (!isScriptLoaded) {
        throw new Error("Failed to load payment gateway");
      }

      // Configure Razorpay
      const options = {
        key: orderData.keyId,
        amount: orderData.amount, // already returns amount in paise
        currency: "INR",
        name: "Cumma",
        description: `Booking for ${bookingDetails.facility?.details?.name || "Facility"}`,
        order_id: orderData.orderId,
        image: `${window.location.origin}/logo.png`,
        handler: function (response: any) {
          // Verify payment on server
          verifyPayment(response, orderData.bookingId);
        },
        prefill: {
          name: user.name || "",
          email: user.email || "",
          contact: bookingDetails.contactNumber,
        },
        notes: {
          bookingId: orderData.bookingId,
          facilityName: bookingDetails.facility?.details.name,
          rentalPlan: bookingDetails.rentalPlan,
        },
        theme: {
          color: "#4F46E5",
        },
        modal: {
          ondismiss: function () {
            setProcessingPayment(false);
            setError("Payment cancelled");
          },
        },
        // Add better error handling for Razorpay errors
        callbacks: {
          error: function (response: any) {
            // This will catch Razorpay server errors
            console.error("Razorpay error:", response);
            setError(
              "Payment service error. Please try again in a few moments."
            );
            setProcessingPayment(false);
          },
        },
      };

      // Create Razorpay instance and open checkout
      try {
        const razorpay = new (window as any).Razorpay(options);
        razorpay.open();
      } catch (initError) {
        console.error("Error initializing Razorpay:", initError);
        setError("Failed to initialize payment. Please try again later.");
        setProcessingPayment(false);
      }
    } catch (error) {
      console.error("Error initiating payment:", error);
      setError(
        error instanceof Error ? error.message : "Failed to initiate payment"
      );
      setProcessingPayment(false);
    }
  };

  // const verifyPayment = async (response: any, bookingId: string) => {
  //   try {
  //     // Send payment details to server for verification
  //     const verifyResponse = await fetch("/api/payments/razorpay/verify", {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify({
  //         razorpay_payment_id: response.razorpay_payment_id,
  //         razorpay_order_id: response.razorpay_order_id,
  //         razorpay_signature: response.razorpay_signature,
  //         bookingId,
  //       }),
  //     });

  //     const data = await verifyResponse.json();

  //     if (verifyResponse.ok && data.success) {
  //       // Redirect to success page
  //       router.push(
  //         `/booking/success?bookingId=${bookingId}&paymentId=${response.razorpay_payment_id}`
  //       );
  //     } else {
  //       // Payment verification failed
  //       setError("Payment verification failed");
  //       setProcessingPayment(false);
  //     }
  //   } catch (error) {
  //     console.error("Error verifying payment:", error);
  //     setError("Failed to verify payment");
  //     setProcessingPayment(false);
  //   }
  // };
  const verifyPayment = async (response: any, bookingId: string) => {
  setProcessingPayment(true); // triggers back/refresh block via useEffect

  try {
    const verifyResponse = await fetch("/api/payments/razorpay/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        razorpay_payment_id: response.razorpay_payment_id,
        razorpay_order_id: response.razorpay_order_id,
        razorpay_signature: response.razorpay_signature,
        bookingId,
      }),
    }); 

    const data = await verifyResponse.json();

    if (verifyResponse.ok && data.success) {
      router.push(
        `/booking/success?bookingId=${bookingId}&paymentId=${response.razorpay_payment_id}`
      );
    } else {
      setError("Payment verification failed");
      setProcessingPayment(false);
    }
  } catch (error) {
    console.error("Error verifying payment:", error);
    setError("Failed to verify payment");
    setProcessingPayment(false);
  }
};


  if (loading) {
    return (
      <div className="container mx-auto py-12 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!bookingDetails || !bookingDetails.facility) {
    return (
      <div className="container mx-auto py-12 text-center">
        <h2 className="text-2xl font-semibold mb-4">
          Booking Information Not Available
        </h2>
        <p className="mb-6">
          We couldn't find the booking details you're looking for.
        </p>
        <Link href="/">
          <Button>Return to Home</Button>
        </Link>
      </div>
    );
  }

  const { facility } = bookingDetails;

  const TotalBasePrice = bookingDetails.baseAmount + bookingDetails.serviceFee;

  const TotalGst = (bookingDetails.hasGST === true)
    ? bookingDetails.gstAmount + bookingDetails.gstOnServiceFee
    : bookingDetails.gstOnServiceFee;

  return (
    <div className="container mx-auto px-4 py-8">

      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Booking Confirmation</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Booking summary */}
          <div className="md:col-span-2 bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4">Booking Summary</h2>

            <div className="flex gap-4 mb-6">
              <div className="w-24 h-24 relative rounded-md overflow-hidden">
                <Image
                  src={
                    facility.details.images[0] || "/placeholder-facility.jpg"
                  }
                  alt={facility.details.name}
                  fill
                  className="object-cover"
                />
              </div>

              <div>
                <h3 className="font-medium text-gray-900">
                  {facility.details.name}
                </h3>
                <p className="text-sm text-gray-500">{facility.facilityType}</p>

                <div className="flex items-center mt-1 text-sm text-gray-600">
                  <MapPin className="mr-1 h-4 w-4" />
                  <span>
                    {facility.address}, {facility.city}, {facility.state}
                  </span>
                </div>
              </div>
            </div>

            <Separator className="my-4" />

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-gray-500 mt-0.5" />
                <div>
                  <h3 className="font-medium">Booking Period</h3>
                  <p className="text-gray-700">
                    {format(bookingDetails.startDate, "PPP")} to{" "}
                    {format(bookingDetails.endDate, "PPP")}
                  </p>
                  <p className="text-sm text-gray-500">
                    {bookingDetails.rentalPlan} Plan
                  </p>
                </div>
              </div>

              {bookingDetails.unitCount > 1 && (
                <div className="flex items-start gap-3">
                  <Info className="h-5 w-5 text-gray-500 mt-0.5" />
                  <div>
                    <h3 className="font-medium">Duration</h3>
                    <p className="text-gray-700">
                      {bookingDetails.unitCount} {bookingDetails.unitLabel}
                    </p>
                  </div>
                </div>
              )}
              
              {bookingDetails.bookingSeats > 1 && (
                <div className="flex items-start gap-3">
                  <Users className="h-5 w-5 text-gray-500 mt-0.5" />
                  <div>
                    <h3 className="font-medium">Seating</h3>
                    <p className="text-gray-700">
                      {bookingDetails.bookingSeats} {bookingDetails.label}s
                    </p>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-3">
                <Phone className="h-5 w-5 text-gray-500 mt-0.5" />
                <div>
                  <h3 className="font-medium">Contact Number</h3>
                  <p className="text-gray-700">
                    {bookingDetails.contactNumber}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Payment details */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4">Payment Details</h2>

            <div className="space-y-3">
               {bookingDetails.serviceFee > 0 ? (
              <div className="flex justify-between">
                <span className="text-gray-600">
                  Base Price{" "} 
                  {(bookingDetails.unitCount > 1 || bookingDetails.bookingSeats > 1) && (
                    `(${bookingDetails.unitCount} ${bookingDetails.unitLabel}${
                      bookingDetails.bookingSeats > 1 
                        ? `, ${bookingDetails.bookingSeats} ${bookingDetails.label}s`
                        : ""
                    })`
                  )}
                </span>
                <span className="text-right min-w-[100px]">
                  ₹
                  {TotalBasePrice.toLocaleString("en-IN", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                   {/* {bookingDetails.baseAmount.toLocaleString("en-IN", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })} */}
                </span>
                </div> 
              ) 
              : (
                <div className="flex justify-between">
                <span className="text-gray-600">
                  Base Price{" "} 
                  {(bookingDetails.unitCount > 1 || bookingDetails.bookingSeats > 1) && (
                    `(${bookingDetails.unitCount} ${bookingDetails.unitLabel}${
                      bookingDetails.bookingSeats > 1 
                        ? `, ${bookingDetails.bookingSeats} ${bookingDetails.label}s`
                        : ""
                    })`
                  )}
                </span>
                <span className="text-right min-w-[100px]">
                  ₹
                 {bookingDetails.baseAmount.toLocaleString("en-IN", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
              </div>
              )
            }

              {/* <div className="flex justify-between">
                <span className="text-gray-600">Service Fee</span>
                <span className="text-right min-w-[100px]">
                  ₹
                  {bookingDetails.serviceFee?.toLocaleString("en-IN", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
              </div> */}



              <div className="flex justify-between">
                <span className="text-gray-600">GST Amount</span>
                <span className="text-right min-w-[100px]">
                  ₹
                  {TotalGst.toLocaleString("en-IN", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
              </div>

              {/* {bookingDetails.serviceFee > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Service Fee</span>
                  <span className="text-right min-w-[100px]">
                    ₹
                    {bookingDetails.serviceFee.toLocaleString("en-IN", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </div>
              )} */}

                  {/* <div className="flex justify-between">
                    <span className="text-gray-600">Booking Seats</span>
                    <span className="text-right min-w-[100px]">
                      
                      {bookingDetails.bookingSlots}
                    </span>
                  </div> */}
{/* 

                   {bookingDetails.couponApplied && (
    <div className="flex justify-between text-green-600 bg-green-50 -mx-2 px-2 py-2 rounded">
      <span className="flex items-center gap-1">
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z"/>
          <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd"/>
        </svg>
        Coupon ({bookingDetails.couponApplied.couponCode}) - {bookingDetails.couponApplied.discount}% off
      </span>
      <span className="font-semibold">
        - ₹{bookingDetails.couponApplied.discountAmount?.toLocaleString("en-IN", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}
      </span>
    </div>
  )}
   */}
              <Separator className="my-2" />

              <div className="flex justify-between font-semibold text-lg">
                <span>Total Amount</span>
                <span className="text-right min-w-[100px]">
                  ₹
                  {bookingDetails.amount.toLocaleString("en-IN", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
              </div>
            </div>

            <div className="mt-8">
              <Button
                className="w-full"
                size="lg"
                onClick={handleProceedToPayment}
                disabled={processingPayment}
              >
                {processingPayment ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CreditCard className="mr-2 h-4 w-4" />
                    Proceed to Payment
                  </>
                )}
              </Button>

              <p className="text-xs text-gray-500 text-center mt-2">
                By proceeding, you agree to our Terms and Conditions.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
