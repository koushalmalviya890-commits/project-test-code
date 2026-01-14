"use client";
import { useState, useEffect, useMemo } from "react";
import { Dialog, DialogContent , DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  X,
  Calendar,
  MapPin,
  Clock,
  Download,
  AlertCircle,
  Loader2,
  CheckCircle,
  Router,
  ChevronDown,
} from "lucide-react";
import Image from "next/image";
import EventService from "@/services/Events/services/event-api-services";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
// 🕒 Import IST helpers
import { 
  formatDateIST, 
  formatDateRangeIST, 
  getRelativeTimeIST,
  convertUTCtoIST 
} from "@/utils/dateTimeHelper";

interface EventData {
  _id: string;
  title: string;
  startDateTime: string;
  endDateTime: string;
  venue: string;
  ticketType: string;
  applyGst:string;
  applyPlatformFee:string;
  ticketPrice: number;
  venueStatus: string;
  description: string;
  serviceProviderId: string;
  couponAvailability: boolean;
  collectPersonalInfo: Array<{
    fullName: string;
    email: string;
    phoneNumber: string;
    _id: string;
  }>;
  collectIdentityProof: Array<{
    idProof: string;
    idProofType: string;
    idNumber: string;
    websiteLink?: string;
    _id: string;
  }>;
  customQuestions: Array<{
    questionType: string;
    question: string;
    options: string[];
    isRequired: string;
    _id: string;
  }>;
}

interface BookingData {
  fullName: string;
  email: string;
  mobileNumber: string;
  idProofType?: string;
  idProofNumber?: string;
  websiteLink?: string;
  keepDataForEvent: boolean;
  customAnswers: { [key: string]: string | string[] };
}

interface BookingResponse {
  booking: {
    id: string;
    eventId: string;
    bookingTickets: number;
    totalAmount: number;
    bookingRefNumber: string;
  };
  order?: {
    id: string;
    amount: number;
    currency: string;
  };
  invoiceUrl?: string;
}

type PriceDetails = {
  platformFee: number;
  gst: number;
  grandTotal: number;
  basePrice?: number;
  ticketPrice?: number;
  ticketCount?: number;
  coupon?: {
    code: string;
    discount: number;
    discountAmount: number;
    discountedBase: number;
    discountedGrandTotal: number;
  } | null;
};

export default function PaymentStepperModal({
  eventData,
  open,
  onOpenChange,
  timerMinutes = 10,
  ticketCount,
}: {
  eventData: EventData;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  timerMinutes?: number;
  ticketCount: number;
}) {
  const router = useRouter();
  const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID;
  // const RAZORPAY_KEY_ID ="rzp_test_Ka7SgBuSi4HH1j";
  // Check if event is free
  const isFreeEvent = eventData.ticketType === "free";
  
 // console.log("Event Data in Booking Popup:", eventData);
 // console.log("Is Free Event:", isFreeEvent);

  const [step, setStep] = useState(1);
  const [selectedPayment, setSelectedPayment] = useState("");
  const [bookingData, setBookingData] = useState<BookingData>({
    fullName: "",
    email: "",
    mobileNumber: "",
    keepDataForEvent: false,
    customAnswers: {},
  });

  // Booking states
  const [isProcessing, setIsProcessing] = useState(false);
  const [bookingResponse, setBookingResponse] = useState<BookingResponse | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});

  // Timer state
  const [timeLeft, setTimeLeft] = useState(timerMinutes * 60);
  const [isTimerActive, setIsTimerActive] = useState(false);

  // Coupon states (only for paid events)
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{
    discount: number;
    discountAmount: number;
    discountedBase: number;
    discountedGrandTotal: number;
  } | null>(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState("");
 
  const [invoiceUrl, setInvoiceUrl] = useState("");
  const [isRazorpayOpen, setIsRazorpayOpen] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [pendingPaymentData, setPendingPaymentData] = useState<any>(null);
  const [showExitConfirmation, setShowExitConfirmation] = useState(false);

  const next = () => setStep((s) => Math.min(s + 1, 3));
  const prev = () => setStep((s) => Math.max(s - 1, 1));
  
  const [priceDetails, setPriceDetails] = useState<PriceDetails>({
    platformFee: 0,
    gst: 0,
    grandTotal: 0,
  });

  // Fetch price details only for paid events
  // useEffect(() => {
  //   if (!isFreeEvent) {
  //     const fetchPrice = async () => {
  //       try {
  //         const res = await EventService.pricingDetails({
  //           event_id: eventData._id,
  //           ticket_count: ticketCount,
  //         });
  //         setPriceDetails(
  //           res.data as { platformFee: number; gst: number; grandTotal: number }
  //         );
  //       } catch (error) {
  //         console.error("Error fetching price:", error);
  //       }
  //     };
  //     fetchPrice();
  //   } else {
  //     // For free events, set pricing to 0
  //     setPriceDetails({
  //       platformFee: 0,
  //       gst: 0,
  //       grandTotal: 0,
  //     });
  //   }
  // }, [eventData._id, ticketCount, isFreeEvent]);
 // console.log("Price Details:", priceDetails);

 // 🧮 PRICE CALCULATION ENGINE
const paymentBreakdown = useMemo(() => {
  // If free event, return zeros
  if (isFreeEvent) {
    return {
      basePrice: 0,
      platformFeeAmount: 0,
      gstOnPlatformFee: 0,
      gstOnTicket: 0,
      totalAmount: 0
    };
  }

  // 1. Base Price (Ticket Price x Count)
  const basePrice = (eventData.ticketPrice || 0) * ticketCount;
  
  // 2. Platform Fee Calculation
  // Logic: 2% of Ticket Price ONLY if applyPlatformFee is "yes"
  let platformFeeAmount = 0;
  if (eventData.applyPlatformFee === "yes") {
    platformFeeAmount = basePrice * 0.02; 
  }

  // 3. GST on Platform Fee Calculation
  // Logic: 18% of the Platform Fee ONLY if applyPlatformFee is "yes"
  let gstOnPlatformFee = 0;
  if (eventData.applyPlatformFee === "yes") {
    gstOnPlatformFee = platformFeeAmount * 0.18;
  }

  // 4. GST on Ticket Price Calculation
  // Logic: 18% of Base Price ONLY if applyGst is "yes"
  let gstOnTicket = 0;
  if (eventData.applyGst === "yes") {
    gstOnTicket = basePrice * 0.18;
  }



  // 5. Grand Total
  const totalAmount = basePrice + platformFeeAmount + gstOnPlatformFee + gstOnTicket;

  return {
    basePrice,
    platformFeeAmount,
    gstOnPlatformFee,
    gstOnTicket,
    totalAmount
  };
}, [ticketCount, isFreeEvent, eventData.ticketPrice, eventData.applyPlatformFee, eventData.applyGst]);

// Update your variables to use this new object
const calculatedTotalFare = paymentBreakdown.totalAmount;
  const totalGst = paymentBreakdown.gstOnPlatformFee + paymentBreakdown.gstOnTicket;

  const platformFee = isFreeEvent ? 0 : (priceDetails.platformFee || 0);
  const gst = isFreeEvent ? 0 : (priceDetails.gst || 0);
  const totalFare = isFreeEvent ? 0 : (priceDetails.grandTotal || 0);

  // Coupon functions (only for paid events)
  const handleApplyCoupon = async () => {
    if (isFreeEvent) return; // Skip coupon logic for free events
    
    if (!couponCode.trim()) {
      setCouponError("Please enter a coupon code");
      return;
    }

    try {
      setCouponLoading(true);
      setCouponError("");

      const res = await EventService.pricingDetails({
        event_id: eventData._id,
        ticket_count: ticketCount,
        couponCode: couponCode.trim().toUpperCase(),
      });

      const data = res.data as PriceDetails;
      if (data.coupon) {
        setAppliedCoupon(data.coupon);
        setPriceDetails(data);
        // setCouponCode("");
        toast.success(
          `Coupon applied! You saved ₹${data.coupon?.discountAmount || 0}`
        );
      } else {
        setCouponError(res.message || "Invalid or expired coupon code");
        toast.error(res.message || "Invalid or expired coupon code");
      }
    } catch (error: any) {
      setCouponError(error.response?.message || "Invalid or expired coupon");
      toast.error(error.response?.message || "Invalid or expired coupon");
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = async () => {
    if (isFreeEvent) return; // Skip coupon logic for free events
    
    try {
      setAppliedCoupon(null);
      setCouponCode("");
      setCouponError("");

      const res = await EventService.pricingDetails({
        event_id: eventData._id,
        ticket_count: ticketCount,
      });

      setPriceDetails(
        res.data as { platformFee: number; gst: number; grandTotal: number }
      );
      toast.success("Coupon removed");
    } catch (error) {
      console.error("Error removing coupon:", error);
    }
  };

  // 🕒 UPDATED: Format date and time using IST helpers
  const formatDate = (dateString: string) => {
    return formatDateIST(dateString, 'dateOnly');
  };

  const formatTime = (startDate: string, endDate: string) => {
    return formatDateRangeIST(startDate, endDate);
  };

  // Reset all data function
  const resetAllData = () => {
    setStep(1);
    setSelectedPayment("");
    setBookingData({
      fullName: "",
      email: "",
      mobileNumber: "",
      keepDataForEvent: false,
      customAnswers: {},
    });
    setBookingResponse(null);
    setValidationErrors([]);
    setFieldErrors({});
    setTimeLeft(timerMinutes * 60);
    setIsTimerActive(false);
    // Reset coupon states
    setCouponCode("");
    setAppliedCoupon(null);
    setCouponError("");
    setCouponLoading(false);
    // Reset new states
    setIsRazorpayOpen(false);
    setIsVerifying(false);
    setPendingPaymentData(null);
    setShowExitConfirmation(false);
  };

  // Start timer when popup opens
  useEffect(() => {
    if (open) {
       const fetchPrice = async () => {
        try {
          const res = await EventService.pricingDetails({
            event_id: eventData._id,
            ticket_count: ticketCount,
          });
          setPriceDetails(
            res.data as { platformFee: number; gst: number; grandTotal: number }
          );
        } catch (error) {
          console.error("Error fetching price:", error);
        }
      };

      fetchPrice();

      setTimeLeft(timerMinutes * 60);
      setIsTimerActive(true);
    } else {
      setIsTimerActive(false);
    }
  }, [open, timerMinutes]);

  // Timer countdown effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isTimerActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((timeLeft) => timeLeft - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      resetAllData();
      onOpenChange(false);
      toast.error("Session expired. Please start again.");
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerActive, timeLeft, onOpenChange]);

  // Auto-hide field errors after 10 seconds
  useEffect(() => {
    if (Object.keys(fieldErrors).length > 0) {
      const timer = setTimeout(() => {
        setFieldErrors({});
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [fieldErrors]);

  // Format timer display
  const formatTimeDisplay = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleInputChange = (
    field: keyof BookingData,
    value: string | boolean
  ) => {
    setBookingData((prev) => ({
      ...prev,
      [field]: value,
    }));
    // Clear field error when user starts typing
    if (fieldErrors[field]) {
      setFieldErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
    // Clear validation errors when user starts typing
    if (validationErrors.length > 0) {
      setValidationErrors([]);
    }
  };

  const handleCustomAnswerChange = (
    questionId: string,
    value: string | string[]
  ) => {
    setBookingData((prev) => ({
      ...prev,
      customAnswers: {
        ...prev.customAnswers,
        [questionId]: value,
      },
    }));
    // Clear field error for custom questions
    if (fieldErrors[questionId]) {
      setFieldErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[questionId];
        return newErrors;
      });
    }
  };

  // Form validation with individual field errors
  const validateForm = (): boolean => {
    const errors: string[] = [];
    const newFieldErrors: { [key: string]: string } = {};

    // Validate personal info
    if (eventData.collectPersonalInfo?.[0]) {
      const personalInfo = eventData.collectPersonalInfo[0];

      // Full name is always required
      if (!bookingData.fullName.trim()) {
        errors.push("Full name is required");
        newFieldErrors.fullName = "Full name is required";
      }

      // Email validation
      if (personalInfo.email === "required" && !bookingData.email.trim()) {
        errors.push("Email is required");
        newFieldErrors.email = "Email is required";
      }
      if (
        bookingData.email &&
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(bookingData.email)
      ) {
        errors.push("Please enter a valid email address");
        newFieldErrors.email = "Please enter a valid email address";
      }

      // Phone validation
      if (
        personalInfo.phoneNumber === "required" &&
        !bookingData.mobileNumber.trim()
      ) {
        errors.push("Mobile number is required");
        newFieldErrors.mobileNumber = "Mobile number is required";
      }
      if (
        bookingData.mobileNumber &&
        !/^[0-9]{10}$/.test(bookingData.mobileNumber.replace(/\s+/g, ""))
      ) {
        errors.push("Please enter a valid 10-digit mobile number");
        newFieldErrors.mobileNumber =
          "Please enter a valid 10-digit mobile number";
      }
    }

    // Validate identity proof
    if (eventData.collectIdentityProof?.[0]) {
      const identityInfo = eventData.collectIdentityProof[0];

      if (
        identityInfo.idNumber === "required" &&
        !bookingData.idProofNumber?.trim()
      ) {
        errors.push("ID number is required");
        newFieldErrors.idProofNumber = "ID number is required";
      }

      if (
        identityInfo.websiteLink === "required" &&
        !bookingData.websiteLink?.trim()
      ) {
        errors.push("Website link is required");
        newFieldErrors.websiteLink = "Website link is required";
      }
    }

    // Validate custom questions
    eventData.customQuestions?.forEach((question) => {
      if (question.isRequired === "required") {
        const answer = bookingData.customAnswers[question._id];
        if (
          !answer ||
          (Array.isArray(answer) && answer.length === 0) ||
          (typeof answer === "string" && !answer.trim())
        ) {
          errors.push(`${question.question} is required`);
          newFieldErrors[question._id] = `${question.question} is required`;
        }
      }
    });

    setValidationErrors(errors);
    setFieldErrors(newFieldErrors);
    return errors.length === 0;
  };

  // Load Razorpay script (only for paid events)
  const loadRazorpayScript = (): Promise<boolean> => {
    if (isFreeEvent) return Promise.resolve(true); // Skip for free events
    
    return new Promise((resolve) => {
      if ((window as any).Razorpay) {
        resolve(true);
        return;
      }

      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  // Updated booking function to handle both free and paid events
  const placeBooking = async () => {
    if (!validateForm()) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      setIsProcessing(true);

      // Prepare booking data according to your backend schema
      const bookingPayload = {
        eventId: eventData._id,
        serviceProviderId: eventData.serviceProviderId,
        ticket_count: ticketCount,
        totalPrice: totalFare,
        gstAmount: gst,
        platformFee: platformFee,
        couponCode: couponCode ? couponCode.trim().toUpperCase(): '',
        PersonalInfo: [
          {
            userfullName: bookingData.fullName,
            useremail: bookingData.email,
            userphoneNumber: bookingData.mobileNumber,
          },
        ],
        IdentityProof: [
          {
            useridProof: bookingData.idProofType || "",
            useridNumber: bookingData.idProofNumber || "",
            userwebisteLink: bookingData.websiteLink || "",
          },
        ],
        customQuestions: Object.entries(bookingData.customAnswers).map(
          ([questionId, answer]) => {
            const question = eventData.customQuestions?.find(
              (q) => q._id === questionId
            );
            return {
              question: question?.question || "",
              answer: Array.isArray(answer) ? answer.join(", ") : answer,
            };
          }
        ),
      };

     // console.log("Placing booking with data:", bookingPayload);

      let response;
      
      if (isFreeEvent) {
        // Use free booking API for free events
        response = await EventService.placeBookingFree(bookingPayload);
       // console.log("Free booking response:", response);
        
        if (response) {
          setBookingResponse({
            booking: {
              id: response.booking?.id || response.booking?._id,
              eventId: response.booking?.eventId,
              bookingTickets: response.booking?.bookingTickets,
              totalAmount: 0, // Free event
              bookingRefNumber: response.booking?.bookingRefNumber,
            }
          });
          
          setInvoiceUrl(response.invoiceUrl || "");
          toast.success("Free booking confirmed successfully!");
          setIsTimerActive(false); // Stop timer
          setStep(3); // Go directly to success step
          setIsProcessing(false);
        } else {
          throw new Error("Invalid response from server");
        }
      } else {
        // Use paid booking API for paid events
        response = await EventService.placeBooking(bookingPayload);
       // console.log("Paid booking response:", response);

        if (response) {
          setBookingResponse(response);
          toast.success("Booking created successfully!");

          // Load Razorpay and proceed to payment
          const isScriptLoaded = await loadRazorpayScript();
          if (!isScriptLoaded) {
            throw new Error("Failed to load payment gateway");
          }

          // Use user-filled data for payment
          const paymentData = {
            booking: response.booking,
            order: response.order,
            userInfo: {
              fullName: bookingData.fullName,
              email: bookingData.email,
              mobileNumber: bookingData.mobileNumber,
            },
          };

          // Store payment data and initiate payment
          setPendingPaymentData(paymentData);
          initiatePayment(paymentData);
        } else {
          throw new Error("Invalid response from server");
        }
      }
    } catch (error: any) {
      console.error("Error placing booking:", error);
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Failed to create booking"
      );
      setIsProcessing(false);
    }
  };

  // Initiate Razorpay payment (only for paid events)
  const initiatePayment = (paymentData: any) => {
    if (isFreeEvent) return; // Skip payment for free events
    
   // console.log("Initiating payment with data:", paymentData);

    const options = {
      key: RAZORPAY_KEY_ID,
      amount: paymentData.order.amount,
      currency: paymentData.order.currency,
      name: "Cumma Events",
      description: `Booking for ${eventData.title}`,
      order_id: paymentData.order.id,
      handler: function (response: any) {
       // console.log("Payment successful:", response);
        setIsRazorpayOpen(false);
        onOpenChange(true);
        setStep(3);
        setIsVerifying(true);
        verifyPayment(
          response,
          paymentData.booking.id,
          eventData.serviceProviderId
        );
      },
      prefill: {
        name: paymentData.userInfo.fullName,
        email: paymentData.userInfo.email,
        contact: paymentData.userInfo.mobileNumber,
      },
      notes: {
        eventId: eventData._id,
        bookingId: paymentData.booking.id,
      },
      theme: {
        color: "#10B981",
      },
      modal: {
        ondismiss: function () {
         // console.log("Payment modal dismissed");
          setIsRazorpayOpen(false);
          setIsProcessing(false);
          onOpenChange(true);
          toast.error("Payment cancelled");
        },
        onhidden: function () {
         // console.log("Razorpay modal completely hidden");
          setIsRazorpayOpen(false);
        },
      },
      retry: {
        enabled: true,
        max_count: 1,
      },
    };

   // console.log("Razorpay options:", options);

    try {
      const razorpay = new (window as any).Razorpay(options);

      razorpay.on("payment.failed", function (response: any) {
        console.error("Payment failed:", response.error);
        setIsRazorpayOpen(false);
        setIsProcessing(false);
        onOpenChange(true);
        toast.error(`Payment failed: ${response.error.description}`);
      });

      setIsRazorpayOpen(true);
      onOpenChange(false);

      setTimeout(() => {
        razorpay.open();
      }, 100);
    } catch (error) {
      console.error("Error opening Razorpay:", error);
      setIsProcessing(false);
      toast.error("Failed to open payment gateway");
    }
  };

  // Verify payment (only for paid events)
  const verifyPayment = async (
    paymentResponse: any,
    eventBookingId: string,
    serviceProviderId: string
  ) => {
    if (isFreeEvent) return; // Skip payment verification for free events
    
    try {
      setIsVerifying(true);

      const verifyPayload = {
        razorpay_order_id: paymentResponse.razorpay_order_id,
        razorpay_payment_id: paymentResponse.razorpay_payment_id,
        razorpay_signature: paymentResponse.razorpay_signature,
        eventBookingId: eventBookingId,
        serviceProviderId: serviceProviderId,
      };

     // console.log("Verifying payment with data:", verifyPayload);

      const response = await EventService.verifyPayment(verifyPayload);
      setInvoiceUrl(response?.invoiceUrl || "");
     // console.log("Payment verification response:", response);

      if (response?.data || response?.message?.includes("successful")) {
        toast.success("Payment successful!");
        setIsTimerActive(false);
      } else {
        throw new Error("Payment verification failed");
      }
    } catch (error: any) {
      console.error("Error verifying payment:", error);
      toast.error(
        error.response?.data?.message || "Payment verification failed"
      );
      setStep(2);
    } finally {
      setIsProcessing(false);
      setIsVerifying(false);
    }
  };

  const handleDialogOpenChange = (newOpen: boolean) => {
    if (step === 1) {
      onOpenChange(newOpen);
    } else if (isVerifying) {
      toast.info("Please wait while we verify your payment...");
    } else if (step === 3) {
      toast.info("Please use the 'Back To Events' button to continue");
    } else if (step === 2 && !newOpen) {
      setTimeout(() => {
        const shouldClose = window.confirm(
          "Are you sure you want to cancel the booking process? All entered data will be lost."
        );
        if (shouldClose) {
          resetAllData();
          onOpenChange(false);
        }
      }, 100);
    }
  };

  // 🎨 UPDATED: Render custom question fields with improved dropdown
  const renderCustomQuestion = (question: any) => {
    const {
      _id,
      questionType,
      question: questionText,
      options,
      isRequired,
    } = question;
    const required = isRequired === "required";
    const hasError = fieldErrors[_id];

    switch (questionType) {
      case "text":
        return (
          <div key={_id}>
            <Label htmlFor={_id} className="text-sm font-medium text-gray-700">
              {questionText}
              {required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Input
              id={_id}
              value={(bookingData.customAnswers[_id] as string) || ""}
              onChange={(e) => handleCustomAnswerChange(_id, e.target.value)}
              className={`mt-1 rounded-lg focus:border-green-500 focus:ring-green-500 ${
                hasError ? "border-red-500" : "border-gray-300"
              } placeholder:opacity-50`}
              placeholder={`Enter ${questionText.toLowerCase()}`}
              required={required}
            />
            {hasError && (
              <p className="mt-1 text-sm text-red-500">{hasError}</p>
            )}
          </div>
        );

      case "radio":
        return (
          <div key={_id}>
            <Label className="text-sm font-medium text-gray-700 mb-3 block">
              {questionText}
              {required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <RadioGroup
              value={(bookingData.customAnswers[_id] as string) || ""}
              onValueChange={(value) => handleCustomAnswerChange(_id, value)}
            >
              {options.map((option: string, index: number) => (
                <div key={index} className="flex items-center space-x-2">
                  <RadioGroupItem value={option} id={`${_id}_${index}`} />
                  <Label
                    htmlFor={`${_id}_${index}`}
                    className="text-sm text-gray-700"
                  >
                    {option}
                  </Label>
                </div>
              ))}
            </RadioGroup>
            {hasError && (
              <p className="mt-1 text-sm text-red-500">{hasError}</p>
            )}
          </div>
        );

      case "checkbox":
        return (
          <div key={_id}>
            <Label className="text-sm font-medium text-gray-700 mb-3 block">
              {questionText}
              {required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <div className="space-y-2">
              {options.map((option: string, index: number) => (
                <div key={index} className="flex items-center space-x-2">
                  <Checkbox
                    id={`${_id}_${index}`}
                    checked={(
                      (bookingData.customAnswers[_id] as string[]) || []
                    ).includes(option)}
                    onCheckedChange={(checked) => {
                      const currentValues =
                        (bookingData.customAnswers[_id] as string[]) || [];
                      if (checked) {
                        handleCustomAnswerChange(_id, [
                          ...currentValues,
                          option,
                        ]);
                      } else {
                        handleCustomAnswerChange(
                          _id,
                          currentValues.filter((v) => v !== option)
                        );
                      }
                    }}
                  />
                  <Label
                    htmlFor={`${_id}_${index}`}
                    className="text-sm text-gray-700"
                  >
                    {option}
                  </Label>
                </div>
              ))}
            </div>
            {hasError && (
              <p className="mt-1 text-sm text-red-500">{hasError}</p>
            )}
          </div>
        );

      case "options":
        return (
          <div key={_id}>
            <Label
              htmlFor={_id}
              className="text-sm font-medium text-gray-700 mb-2 block"
            >
              {questionText}
              {required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            {/* 🎨 UPDATED: Super UI Select dropdown */}
            <Select
              value={(bookingData.customAnswers[_id] as string) || ""}
              onValueChange={(value) => handleCustomAnswerChange(_id, value)}
              required={required}
            >
              <SelectTrigger className={`w-full rounded-lg focus:border-green-500 focus:ring-green-500 ${
                hasError ? "border-red-500" : "border-gray-300"
              }`}>
                <SelectValue 
                  placeholder={
                    <span className="text-gray-400 opacity-50">
                      Select an option
                    </span>
                  }
                />
              </SelectTrigger>
              <SelectContent className="rounded-lg shadow-lg border border-gray-200">
                {options.map((option: string, index: number) => (
                  <SelectItem 
                    key={index} 
                    value={option}
                    className="hover:bg-green-50 focus:bg-green-50 cursor-pointer transition-colors rounded-md"
                  >
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {hasError && (
              <p className="mt-1 text-sm text-red-500">{hasError}</p>
            )}
          </div>
        );

      case "website":
        return (
          <div key={_id}>
            <Label htmlFor={_id} className="text-sm font-medium text-gray-700">
              {questionText}
              {required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Input
              id={_id}
              type="url"
              value={(bookingData.customAnswers[_id] as string) || ""}
              onChange={(e) => handleCustomAnswerChange(_id, e.target.value)}
              className={`mt-1 rounded-lg focus:border-green-500 focus:ring-green-500 ${
                hasError ? "border-red-500" : "border-gray-300"
              } placeholder:opacity-50`}
              placeholder="https://example.com"
              required={required}
            />
            {hasError && (
              <p className="mt-1 text-sm text-red-500">{hasError}</p>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  const StepIndicator = ({ currentStep }: { currentStep: number }) => (
    <div className="sticky">
    <div className="border-b pb-3 mb-4 flex flex-col relative">
      <div className="absolute top-4 right-0">
        {/* Conditional close button */}
        {step === 1 && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleDialogOpenChange(false)}
            className="h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
        )}

        {step === 2 && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowExitConfirmation(true)}
            className="h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
        )}

        {(step === 3 || isVerifying) && (
          <div className="w-8 h-8 flex items-center justify-center opacity-30">
            <X className="h-4 w-4" />
          </div>
        )}
      </div>
      <div className="flex items-center justify-center p-4 pb-2">
        <Image
          src="/logo-green.png"
          alt="Cumma"
          width={80}
          height={24}
          className="object-contain"
        />
      </div>

      <div className="flex items-center justify-center mb-4">
        <div className="flex items-center justify-between">
          {[1, 2, 3].map((stepNum) => (
            <div key={stepNum} className="flex items-center justify-between">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  stepNum <= currentStep
                    ? "bg-green-500 text-white"
                    : stepNum === currentStep + 1
                      ? "bg-green-100 text-green-500 border-2 border-green-500"
                      : "bg-gray-200 text-gray-500"
                }`}
              >
                {stepNum <= currentStep ? "✓" : stepNum}
              </div>
              {stepNum < 3 && (
                <div
                  className={`w-12 h-0.5 ${
                    stepNum < currentStep ? "bg-green-500" : "bg-gray-200"
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-between items-center text-xs text-gray-500 px-6 mb-2">
        <span className={step >= 1 ? "text-green-500" : ""}>Basic Info</span>
        <span className={step >= 2 ? "text-green-500" : ""}>
          {isFreeEvent ? "Book Ticket" : "Ticket & Payment"}
        </span>
        <span className={step >= 3 ? "text-green-500" : ""}>Summary</span>
      </div>

      {step < 3 && (
        <div className="mx-6 mb-1">
          <div className="flex items-center justify-center space-x-2">
            <Clock
              className={`w-3 h-3 ${timeLeft <= 60 ? "text-red-500" : "text-green-500"}`}
            />
            <span
              className={`text-sm font-semibold ${timeLeft <= 60 ? "text-red-600" : "text-green-600"}`}
            >
              {formatTimeDisplay(timeLeft)}
            </span>
            <span className="text-xs text-gray-400">remaining</span>
            {timeLeft <= 60 && (
              <AlertCircle className="w-3 h-3 text-red-500 animate-pulse" />
            )}
          </div>
        </div>
      )}
    </div>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={handleDialogOpenChange}>
      <DialogContent
        onPointerDownOutside={(e) => {
          if (step !== 1) {
            e.preventDefault();
            if (isVerifying) {
              toast.info("Please wait while we verify your payment...");
            } else if (step === 3) {
              toast.info("Please use the 'Back To Events' button to continue");
            }
          }
        }}
        onEscapeKeyDown={(e) => {
          if (step !== 1) {
            e.preventDefault();
            if (isVerifying) {
              toast.info("Please wait while we verify your payment...");
            } else if (step === 3) {
              toast.info("Please use the 'Back To Events' button to continue");
            }
          }
        }}
        className="max-h-[500px] w-[340px] md:max-h-[500px] md:w-[512px] lg:max-h-[600px] rounded-2xl p-0 scrollbar-hide border-0 shadow-xl bg-white"
      >
        <DialogTitle className="hidden">
        </DialogTitle>
        <div className="sticky top-0 bg-white z-10">
          <StepIndicator currentStep={step} />
        </div>

        {showExitConfirmation && (
          <div className="absolute inset-0 bg-black/50 h-[925px] overflow-hidden h-min-screen backdrop-blur-sm  z-50 flex items-center justify-center">
            <div className="bg-white rounded-lg p-6 max-w-sm  mx-4 shadow-xl">
              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-4 bg-orange-100 rounded-full flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-orange-500" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Cancel Booking?
                </h3>
                <p className="text-gray-600 mb-6">
                  Are you sure you want to cancel the booking process? All
                  entered data will be lost.
                </p>
                <div className="flex gap-3">
                  <Button
                    onClick={() => setShowExitConfirmation(false)}
                    variant="outline"
                    className="flex-1"
                  >
                    Continue Booking
                  </Button>
                  <Button
                    onClick={() => {
                      setShowExitConfirmation(false);
                      resetAllData();
                      onOpenChange(false);
                    }}
                    variant="destructive"
                    className="flex-1"
                  >
                    Yes, Cancel
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 1 - Registration Form */}
        {step === 1 && (
          <div className="px-6 pb-6">
            <div className="mb-6">
              <h3 className="font-bold text-gray-900 mb-2">
                {eventData.title}
              </h3>
              {/* 🕒 UPDATED: Event info with IST formatting */}
              <div className="space-y-4 text-sm text-gray-600">
                <div className="flex flex-col md:flex-row items-center space-x-2">
                  <Calendar className="w-4 h-4 mt-2 md:mt-0 text-green-500" />
                  <span className="mt-2 md:mt-0">{formatDate(eventData.startDateTime)}</span>
                  <Clock className="w-4 h-4 mt-2 md:mt-0 text-green-500 ml-4" />
                  <span className="mt-2 md:mt-0">
                    {formatTime(eventData.startDateTime, eventData.endDateTime)}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4 text-green-500" />
                  <span>{eventData.venue}</span>
                </div>
              </div>
            </div>

            <div className="space-y-4 mb-6">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">
                  Number of Tickets
                </span>
                <span className="text-lg font-bold text-gray-900">
                  {ticketCount}
                </span>
              </div>

              {/* 🚀 UPDATED: Form fields with improved spacing and placeholder opacity */}
              <div className="space-y-6">
                {/* Personal Info Fields */}
                {eventData.collectPersonalInfo &&
                  eventData.collectPersonalInfo.map((info) => (
                    <div key={info._id}>
                      {/* Full Name */}
                      <div className="mb-4">
                        <Label
                          htmlFor="fullName"
                          className="text-sm font-medium text-gray-700"
                        >
                          Full Name<span className="text-red-500 ml-1">*</span>
                        </Label>
                        <Input
                          id="fullName"
                          value={bookingData.fullName}
                          onChange={(e) =>
                            handleInputChange("fullName", e.target.value)
                          }
                          className={`mt-1 rounded-lg focus:border-green-500 focus:ring-green-500 placeholder:opacity-50 ${
                            fieldErrors.fullName
                              ? "border-red-500"
                              : "border-gray-300"
                          }`}
                          placeholder="Enter your full name"
                          required
                        />
                        {fieldErrors.fullName && (
                          <p className="mt-1 text-sm text-red-500">
                            {fieldErrors.fullName}
                          </p>
                        )}
                      </div>

                      {/* Email */}
                      {info.email !== "off" && (
                        <div className="mb-4">
                          <Label
                            htmlFor="email"
                            className="text-sm font-medium text-gray-700"
                          >
                            Your Email
                            {info.email === "required" && (
                              <span className="text-red-500 ml-1">*</span>
                            )}
                          </Label>
                          <Input
                            id="email"
                            type="email"
                            value={bookingData.email}
                            onChange={(e) =>
                              handleInputChange("email", e.target.value)
                            }
                            className={`mt-1 rounded-lg focus:border-green-500 focus:ring-green-500 placeholder:opacity-50 ${
                              fieldErrors.email
                                ? "border-red-500"
                                : "border-gray-300"
                            }`}
                            placeholder="Confirmation will be sent to email"
                            required={info.email === "required"}
                          />
                          {fieldErrors.email && (
                            <p className="mt-1 text-sm text-red-500">
                              {fieldErrors.email}
                            </p>
                          )}
                        </div>
                      )}

                      {/* Phone Number */}
                      {info.phoneNumber !== "off" && (
                        <div className="mb-4">
                          <Label
                            htmlFor="mobile"
                            className="text-sm font-medium text-gray-700"
                          >
                            Mobile Number
                            {info.phoneNumber === "required" && (
                              <span className="text-red-500 ml-1">*</span>
                            )}
                          </Label>
                          <Input
                            id="mobile"
                            value={bookingData.mobileNumber}
                            onChange={(e) =>
                              handleInputChange("mobileNumber", e.target.value)
                            }
                            className={`mt-1 rounded-lg focus:border-green-500 focus:ring-green-500 placeholder:opacity-50 ${
                              fieldErrors.mobileNumber
                                ? "border-red-500"
                                : "border-gray-300"
                            }`}
                            placeholder="Enter mobile number"
                            required={info.phoneNumber === "required"}
                          />
                          {fieldErrors.mobileNumber && (
                            <p className="mt-1 text-sm text-red-500">
                              {fieldErrors.mobileNumber}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  ))}

                {/* Identity Proof Fields */}
                {eventData.collectIdentityProof &&
                  eventData.collectIdentityProof.map((identityInfo) => (
                    <div key={identityInfo._id}>
                      {/* ID Number */}
                      {identityInfo.idNumber !== "off" && (
                        <div className="mb-4">
                          <Label
                            htmlFor="idProofNumber"
                            className="text-sm font-medium text-gray-700"
                          >
                            ID Number ({identityInfo.idProofType})
                            {identityInfo.idNumber === "required" && (
                              <span className="text-red-500 ml-1">*</span>
                            )}
                          </Label>
                          <Input
                            id="idProofNumber"
                            value={bookingData.idProofNumber || ""}
                            onChange={(e) =>
                              handleInputChange("idProofNumber", e.target.value)
                            }
                            className={`mt-1 rounded-lg focus:border-green-500 focus:ring-green-500 placeholder:opacity-50 ${
                              fieldErrors.idProofNumber
                                ? "border-red-500"
                                : "border-gray-300"
                            }`}
                            placeholder="Enter ID number"
                            required={identityInfo.idNumber === "required"}
                          />
                          {fieldErrors.idProofNumber && (
                            <p className="mt-1 text-sm text-red-500">
                              {fieldErrors.idProofNumber}
                            </p>
                          )}
                        </div>
                      )}

                      {/* Website Link */}
                      {identityInfo.websiteLink !== "off" && (
                        <div className="mb-4">
                          <Label
                            htmlFor="websiteLink"
                            className="text-sm font-medium text-gray-700"
                          >
                            Website Link
                            {identityInfo.websiteLink === "required" && (
                              <span className="text-red-500 ml-1">*</span>
                            )}
                          </Label>
                          <Input
                            id="websiteLink"
                            type="url"
                            value={bookingData.websiteLink || ""}
                            onChange={(e) =>
                              handleInputChange("websiteLink", e.target.value)
                            }
                            className={`mt-1 rounded-lg focus:border-green-500 focus:ring-green-500 placeholder:opacity-50 ${
                              fieldErrors.websiteLink
                                ? "border-red-500"
                                : "border-gray-300"
                            }`}
                            placeholder="https://example.com"
                            required={identityInfo.websiteLink === "required"}
                          />
                          {fieldErrors.websiteLink && (
                            <p className="mt-1 text-sm text-red-500">
                              {fieldErrors.websiteLink}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  ))}

                {/* 🚀 UPDATED: Custom Questions with spacing */}
                {eventData.customQuestions &&
                  eventData.customQuestions.map((question, index) => (
                    <div key={question._id} className={index > 0 ? "mt-6" : ""}>
                      {renderCustomQuestion(question)}
                    </div>
                  ))}
              </div>

              <div className="flex items-center space-x-2 mt-6">
                <Checkbox
                  id="keepData"
                  checked={bookingData.keepDataForEvent}
                  onCheckedChange={(checked) =>
                    handleInputChange("keepDataForEvent", !!checked)
                  }
                />
                <Label htmlFor="keepData" className="text-xs text-gray-600">
                  Keep my data for the event
                </Label>
              </div>
            </div>

            <Button
              onClick={() => {
                if (validateForm()) {
                  next();
                }
              }}
              className="w-full bg-green-500 hover:bg-green-600 text-white py-3 rounded-xl font-medium"
            >
              Next
            </Button>

            <p className="text-xs text-gray-500 text-center mt-4">
              By continuing, you agree to the Terms of use and Privacy Policy.
            </p>
          </div>
        )}

        {/* Step 2 - Payment Method or Free Booking */}
        {step === 2 && (
          <div className="px-6 pb-6">
            <div className="mb-6">
              <h3 className="font-bold text-gray-900 mb-2">
                {eventData.title}
              </h3>
              {/* 🕒 UPDATED: Event info with IST formatting */}
              <div className="space-y-4 text-sm text-gray-600">
                <div className="flex flex-col md:flex-row items-center space-x-2">
                  <Calendar className="w-4 h-4 mt-2 md:mt-0 text-green-500" />
                  <span className="mt-2 md:mt-0">{formatDate(eventData.startDateTime)}</span>
                  <Clock className="w-4 h-4 mt-2 md:mt-0 text-green-500 ml-4" />
                  <span className="mt-2 md:mt-0">
                    {formatTime(eventData.startDateTime, eventData.endDateTime)}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4 text-green-500" />
                  <span>{eventData.venue}</span>
                </div>
              </div>
            </div>

            <div className="space-y-3 mb-6 text-sm">
              <div className="flex justify-between">
                <span>Number of Tickets</span>
                <span className="font-medium">{ticketCount}</span>
              </div>
              
              {isFreeEvent ? (
                // Free Event Pricing Display
                <>
                  <div className="flex justify-between">
                    <span>Ticket Price</span>
                    <span className="font-medium text-green-600">FREE</span>
                  </div>
                  {/* <div className="flex justify-between">
                    <span>Platform Fee</span>
                    <span className="font-medium">₹0</span>
                  </div>
                  <div className="flex justify-between">
                    <span>GST (18%)</span>
                    <span className="font-medium">₹0</span>
                  </div> */}
                  <hr className="my-2" />
                  <div className="flex justify-between font-bold">
                    <span>Total Fare</span>
                    <span className="text-green-600">FREE</span>
                  </div>
                </>
              ) : (
                // Paid Event Pricing Display
                <>
                  <div className="flex justify-between">
                    <span>
                         {eventData.applyPlatformFee === "yes" ? "₹" + (eventData.ticketPrice * 1.02).toFixed(2) : "₹" + eventData.ticketPrice} x {ticketCount} Nos
                      
                      {/* ₹{eventData.ticketPrice} x {ticketCount} Nos */}
                    </span>
                    <span className="font-medium">
                      {eventData.applyPlatformFee === "yes" ? "₹" + (eventData.ticketPrice * 1.02 * ticketCount).toFixed(2) : "₹" + (eventData.ticketPrice * ticketCount).toFixed(2)}
                      {/* ₹{eventData.ticketPrice * ticketCount} */}
                    </span>
                  </div>
                 {/* <div className="flex justify-between">
                    <span>Platform Fee</span>
                    <span className="font-medium">₹{platformFee}</span>
                  </div> */}
                  {eventData.applyGst === "yes" && (
                    <div className="flex justify-between">
                      <span>GSTs (18%) (on Ticket and platform fee)</span>
                      <span className="font-medium">₹{totalGst}</span>
                    </div>
                  )}
                  {
                    appliedCoupon && (
                      <div className="flex justify-between text-green-600">
                        <span>Coupon Discount</span>
                        <span className="font-medium">-₹{appliedCoupon.discountAmount}</span>
                      </div>
                    )
                  }
                  <hr className="my-2" />
                  <div className="flex justify-between font-bold">
  <span>
    Total Fare{" "}
    {eventData.applyGst === "yes" && (
      <span className="text-xs text-gray-500">(include 18% GST)</span>
    )}
  </span>
  <span>₹{calculatedTotalFare.toFixed(3)}</span>
</div>

                </>
              )}
            </div>

            {/* Coupon Section - Only show for paid events */}
            {!isFreeEvent && eventData.couponAvailability && (
              <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg">
                {!appliedCoupon ? (
                  <>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <span className="text-green-600 text-lg">🎟️</span>
                      </div>
                      <span className="text-sm font-medium text-green-700">
                        Have a coupon? Apply it and save on tickets!
                      </span>
                    </div>

                    <div className="flex gap-2">
                      <Input
                        value={couponCode}
                        onChange={(e) => {
                          setCouponCode(e.target.value.toUpperCase());
                          setCouponError("");
                        }}
                        placeholder="Enter coupon code"
                        className="flex-1 text-center font-mono uppercase border-green-200 focus:border-green-400 placeholder:opacity-50"
                        disabled={couponLoading}
                      />
                      <Button
                        onClick={handleApplyCoupon}
                        disabled={!couponCode.trim() || couponLoading}
                        className="bg-green-500 hover:bg-green-600 text-white px-6"
                      >
                        {couponLoading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          "Apply"
                        )}
                      </Button>
                    </div>
                    

                    {couponError && (
                      <div className="mt-2 flex items-center gap-2 text-red-600">
                        <AlertCircle className="w-4 h-4" />
                        <span className="text-sm">{couponError}</span>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <span className="font-medium text-green-700">
                          Coupon Applied Successfully!
                        </span>
                        <p className="text-sm text-green-600">
                          You saved ₹{appliedCoupon.discountAmount} on this
                          booking
                        </p>
                      </div>
                    </div>
                    <Button
                      onClick={handleRemoveCoupon}
                      variant="ghost"
                      size="sm"
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      Remove
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* Payment Method Selection - Only show for paid events */}
            {!isFreeEvent && (
              <div className="mb-6">
                <Label className="text-sm font-medium text-gray-700 mb-4 block">
                  Select payment method
                </Label>
                <RadioGroup
                  value={selectedPayment}
                  onValueChange={setSelectedPayment}
                  className="space-y-3"
                >
                  <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50">
                    <RadioGroupItem value="razorPay" id="razorPay" />
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-6 bg-blue-600 rounded flex items-center justify-center">
                        <span className="text-white text-xs font-bold">RP</span>
                      </div>
                      <span className="text-sm">RazorPay</span>
                    </div>
                  </div>
                </RadioGroup>
              </div>
            )}

            {/* Action Button */}
            {isFreeEvent ? (
              // Free Event - Single Book Ticket Button
              <Button
                onClick={placeBooking}
                disabled={isProcessing}
                className="w-full bg-green-500 hover:bg-green-600 text-white py-3 rounded-xl font-medium disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Booking Ticket...
                  </>
                ) : (
                  "Book Ticket"
                )}
              </Button>
            ) : (
              // Paid Event - Proceed to Pay Button
              <Button
                onClick={placeBooking}
                disabled={!selectedPayment || isProcessing}
                className="w-full bg-green-500 hover:bg-green-600 text-white py-3 rounded-xl font-medium disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Proceed to Pay"
                )}
              </Button>
            )}

            <Button
              className="w-full mt-3 bg-white border border-gray-300 text-gray-700 py-3 rounded-xl font-medium"
              onClick={prev}
              disabled={isProcessing}
            >
              Back
            </Button>

            <p className="text-xs text-gray-500 text-center mt-4">
              By continuing, you agree to the Terms of use and Privacy Policy.
            </p>
          </div>
        )}

        {/* Step 3 - Success/Verification */}
        {step === 3 && (
          <div className="px-6 pb-6 text-center">
            {isVerifying ? (
              // Verification Loader (Only for paid events)
              <>
                <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
                  <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
                </div>

                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Verifying Payment...
                </h2>
                <p className="text-gray-600 mb-6">
                  Please wait while we confirm your payment.
                </p>

                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <div className="animate-pulse space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
                  </div>
                </div>
              </>
            ) : (
              // Success Content
              <>
                {/* Success Icon */}
                <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-10 h-10 text-green-500" />
                </div>

                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {isFreeEvent ? "Booking Confirmed!" : "Booking Confirmed!"}
                </h2>
                <p className="text-gray-600 mb-6">
                  {isFreeEvent 
                    ? "Your free ticket booking is confirmed successfully."
                    : "Your payment was successful and your booking is confirmed."
                  }
                </p>

                <div className="mb-6">
                  <h3 className="font-bold text-gray-900 mb-2">
                    {eventData.title}
                  </h3>
                  {/* 🕒 UPDATED: Event info with IST formatting */}
                   <div className="space-y-4 text-sm mt-3 text-gray-600">
                <div className="flex flex-col md:flex-row items-center space-x-2">
                  <Calendar className="w-4 h-4 mt-2 md:mt-0 text-green-500" />
                  <span className="mt-2 md:mt-0">{formatDate(eventData.startDateTime)}</span>
                  <Clock className="w-4 h-4 mt-2 md:mt-0 text-green-500 ml-4" />
                  <span className="mt-2 md:mt-0">
                    {formatTime(eventData.startDateTime, eventData.endDateTime)}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4 text-green-500" />
                  <span>{eventData.venue}</span>
                </div>
              </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">
                      Number of Tickets
                    </span>
                    <span className="text-lg font-bold">{ticketCount}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">
                      Total Amount {isFreeEvent ? "" : "Paid"}
                    </span>
                    <span className={`text-lg font-bold ${isFreeEvent ? 'text-green-600' : 'text-green-600'}`}>
                      {isFreeEvent ? "FREE" : `₹${totalFare}`}
                    </span>
                  </div>
                </div>

                {bookingResponse && (
                  <div className="space-y-3 mb-6 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Booking ID</span>
                      <span className="font-mono font-bold">
                        {bookingResponse.booking.bookingRefNumber || bookingResponse.booking.id}
                      </span>
                    </div>
                    {!isFreeEvent && bookingResponse.order && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Order ID</span>
                        <span className="font-mono text-xs">
                          {bookingResponse.order.id}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                <div className="space-y-3 mb-6">
                  <Button
                    onClick={() => {
                      if (invoiceUrl) {
                        window.open(invoiceUrl, '_blank');
                      } else {
                        toast.info("Ticket download will be available shortly");
                      }
                    }}
                    variant="outline"
                    className="w-full"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download Ticket Invoice
                  </Button>
                </div>

                <Button
                  onClick={() => {
                    resetAllData();
                    onOpenChange(false);
                    router.push("/events-page");
                  }}
                  className="w-full bg-green-500 hover:bg-green-600 text-white py-3 rounded-xl font-medium"
                >
                  Back To Events
                </Button>
              </>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="border-t bg-gray-50 px-6 py-4">
          <div className="flex items-center justify-center space-x-4 text-xs text-gray-500">
            <div className="flex items-center space-x-1">
              <div className="w-4 h-4 rounded-full bg-green-500 flex items-center justify-center">
                <span className="text-white text-xs">✓</span>
              </div>
              <span>100% safe and secure</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-4 h-4 rounded-full bg-green-500 flex items-center justify-center">
                <span className="text-white text-xs">↺</span>
              </div>
              <span>Easy Refund</span>
            </div>
          </div>

          {step === 3 && (
            <div className="mt-4 text-center">
              <div className="text-xs text-gray-500 mb-2">
                Booking Related Queries
              </div>
              <div className="text-xs text-gray-600">
                Send us WhatsApp message at +91 98459 59539 or Call us
              </div>
              <div className="flex items-center justify-center mt-2 space-x-2">
                <Image
                  src="/logo-green.png"
                  alt="Cumma"
                  width={60}
                  height={18}
                />
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
