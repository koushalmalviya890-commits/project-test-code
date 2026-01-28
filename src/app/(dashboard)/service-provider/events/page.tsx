"use client";

import React, { useState, useEffect, useRef } from "react";
// import { useSession } from "next-auth/react";
import  { useAuth } from "@/context/AuthContext";
import { format } from "date-fns";
import {
  Pencil,
  CalendarIcon,
  Plus,
  Check,
  MoreHorizontal,
  Eye,
  Download,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Calendar,
  TrendingUp,
  TrendingDown,
  Filter,
  Copy,
} from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { toast } from "sonner";
import Link from "next/link";
import EventService from "./services/event-api-services";
import * as XLSX from "xlsx";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

import { useEventForm } from "./services/contexts/EventFormContext";
import { EventFormProvider } from "./services/contexts/EventFormContext";

interface Event {
  _id: string;
  serviceProviderId: string;
  serviceProviderName: string;
  title: string;
  status: "public" | "private";
  startDateTime: string;
  endDateTime: string;
  venue: string;
  venueStatus: "offline" | "online";
  description: string;
  category: string;
  sectors: string[];
  amenities: string[];
  coverImage: string;
  features: Array<{
    name: string;
    files: string[];
    _id: string;
  }>;
  chiefGuests: Array<{
    name: string;
    image: string;
    _id: string;
  }>;
  hasChiefGuest: boolean;
  hasFeatures: boolean;
  approvalStatus: "pending" | "approved" | "rejected";
  activeStatus: "upcoming" | "ongoing" | "completed" | "cancelled";
  ticketType: "free" | "paid";
  tickets: "limited" | "unlimited";
  ticketCapacity: number;
  bookedTicketsCount: number;
  ticketPrice: number;
  bulkRegistration: boolean;
  bulkTickets: number;
  registrationStartDateTime: string;
  registrationEndDateTime: string;
  customizeTicketEmail: boolean;
  ticketEmailContent: string;
  bulkEmailFile: string;
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
    webisteLink: string;
    _id: string;
  }>;
  customQuestions: Array<{
    questionType: string;
    question: string;
    options: string[];
    isRequired: string;
    _id: string;
  }>;
  customizeRegistrationEmail: boolean;
  registrationEmailBodyContent: string;
  termsAndConditions: string;
  refundPolicy: string;
  couponAvailability: boolean;
  couponDetails: Array<{
    couponCode: string;
    discount: number;
    validFrom: string;
    validTo: string;
    _id: string;
  }>;
  eventReminder: boolean;
  postEventFeedback: boolean;
  postEventFeedbackDetails: Array<{
    scheduledDateTime: string;
    bodyContent: string;
    _id: string;
  }>;
  socialMediaLinks: Array<{
    socialLink: string;
    _id: string;
  }>;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

interface EventKPIData {
  totalEvents: number;
  upcomingEvents: number;
  ongoingEvents: number;
  completedEvents: number;
  cancelledEvents: number;
  rejectedEvents: number;
  pendingEvents: number;
}

interface EarningsData {
  today: { amount: number; count: number };
  thisWeek: { amount: number; count: number };
  thisMonth: { amount: number; count: number };
  lastMonth: { amount: number; count: number };
  total: { amount: number; count: number };
  byStatus: Array<{ _id: string; total: number; count: number }>;
  monthly: Array<{
    _id: { year: number; month: number };
    total: number;
    count: number;
  }>;
  trends: { weeklyChange: number; monthlyChange: number };
  filtered: { amount: number; trend: number; percentageChange: number };
  trend: number;
  amount: number;
  percentageChange: number;
}

// CONTENT COMPONENT: This is the main component (wrapped by provider)
const MyEventsContent = () => {
  const router = useRouter();
  // const { data: session, status } = useSession();
  const { user, loading } = useAuth();
  const status = loading ? "loading" : user ? "authenticated" : "unauthenticated";
  
  const [events, setEvents] = useState<Event[]>([]);
  const [allEvents, setAllEvents] = useState<Event[]>([]);
  const [earningsData, setEarningsData] = useState<EarningsData | null>(null);
  const [kpiData, setKpiData] = useState<EventKPIData>({
    totalEvents: 0,
    upcomingEvents: 0,
    ongoingEvents: 0,
    completedEvents: 0,
    cancelledEvents: 0,
    rejectedEvents: 0,
    pendingEvents: 0,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState<string>("All Time");
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"bookings" | "earnings">(
    "bookings"
  );
  const [showRestrictionBanner, setShowRestrictionBanner] = useState(false);
  const [restrictionReason, setRestrictionReason] = useState("");
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [showCalendar, setShowCalendar] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [filterPaymentStatus, setFilterPaymentStatus] = useState<string>("all");
  const [filterEventId, setFilterEventId] = useState<string>("all");
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const calendarRef = useRef<HTMLDivElement>(null);
  const { setEditMode, clearFormData } = useEventForm();

  // Custom Calendar Component (keeping the same as provided)
  const CustomCalendar = ({
    selectedDate,
    onSelect,
  }: {
    selectedDate: Date | undefined;
    onSelect: (date: Date | undefined) => void;
  }) => {
    const daysInMonth = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth() + 1,
      0
    ).getDate();
    const firstDayOfMonth = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      1
    ).getDay();
    const today = new Date();

    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    const days = [];

    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="h-8"></div>);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(
        currentMonth.getFullYear(),
        currentMonth.getMonth(),
        day
      );
      const isSelected =
        selectedDate && date.toDateString() === selectedDate.toDateString();
      const isToday = date.toDateString() === today.toDateString();

      days.push(
        <button
          key={day}
          onClick={() => onSelect(date)}
          className={`h-8 w-8 text-sm rounded transition-colors ${
            isSelected
              ? "bg-green-500 text-white font-medium"
              : isToday
                ? "bg-blue-100 text-blue-700"
                : "hover:bg-gray-100"
          }`}
        >
          {day}
        </button>
      );
    }

    return (
      <div className="p-4 w-80 bg-white shadow-lg rounded-lg border">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() =>
              setCurrentMonth(
                new Date(
                  currentMonth.getFullYear(),
                  currentMonth.getMonth() - 1
                )
              )
            }
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <ChevronLeft className="h-4 w-4 text-gray-600" />
          </button>
          <h3 className="font-semibold text-gray-900">
            {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
          </h3>
          <button
            onClick={() =>
              setCurrentMonth(
                new Date(
                  currentMonth.getFullYear(),
                  currentMonth.getMonth() + 1
                )
              )
            }
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <ChevronRight className="h-4 w-4 text-gray-600" />
          </button>
        </div>
        <div className="grid grid-cols-7 gap-1 mb-2">
          {weekDays.map((day, index) => (
            <div
              key={day}
              className={`h-8 flex items-center justify-center text-xs font-medium ${
                index === 0 || index === 6 ? "text-green-500" : "text-gray-500"
              }`}
            >
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">{days}</div>
      </div>
    );
  };

  // Format currency helper function
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Close calendar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        calendarRef.current &&
        !calendarRef.current.contains(event.target as Node)
      ) {
        setShowCalendar(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Show restriction banner for 5 seconds
  const showRestrictionWarning = (reason: string) => {
    setRestrictionReason(reason);
    setShowRestrictionBanner(true);

    setTimeout(() => {
      setShowRestrictionBanner(false);
    }, 5000);
  };

  // Filter events based on selected month and date
  useEffect(() => {
    if (!Array.isArray(allEvents) || allEvents.length === 0) {
      //// console.log("allEvents is not an array or is empty:", allEvents);
      return;
    }

    const now = new Date();
    let filteredEvents: Event[] = [];

    try {
      // If a specific date is selected, filter by that date
      if (selectedDate) {
        filteredEvents = allEvents.filter((event) => {
          const eventDate = new Date(event.createdAt);
          return eventDate.toDateString() === selectedDate.toDateString();
        });
      } else {
        // Otherwise filter by month
        switch (selectedMonth) {
          case "This Month":
            const startOfThisMonth = new Date(
              now.getFullYear(),
              now.getMonth(),
              1
            );
            filteredEvents = allEvents.filter(
              (event) => new Date(event.createdAt) >= startOfThisMonth
            );
            break;

          case "Last Month":
            const startOfLastMonth = new Date(
              now.getFullYear(),
              now.getMonth() - 1,
              1
            );
            const endOfLastMonth = new Date(
              now.getFullYear(),
              now.getMonth(),
              0,
              23,
              59,
              59
            );
            filteredEvents = allEvents.filter((event) => {
              const createdDate = new Date(event.createdAt);
              return (
                createdDate >= startOfLastMonth && createdDate <= endOfLastMonth
              );
            });
            break;

          case "Last 3 Months":
            const start3Months = new Date(
              now.getFullYear(),
              now.getMonth() - 3,
              1
            );
            filteredEvents = allEvents.filter((event) => {
              const createdDate = new Date(event.createdAt);
              return createdDate >= start3Months;
            });
            break;

          case "Last 6 Months":
            const start6Months = new Date(
              now.getFullYear(),
              now.getMonth() - 6,
              1
            );
            filteredEvents = allEvents.filter((event) => {
              const createdDate = new Date(event.createdAt);
              return createdDate >= start6Months;
            });
            break;

          case "This Year":
            const startOfYear = new Date(now.getFullYear(), 0, 1);
            const endOfYear = new Date(now.getFullYear(), 11, 31, 23, 59, 59);
            filteredEvents = allEvents.filter((event) => {
              const createdDate = new Date(event.createdAt);
              return createdDate >= startOfYear && createdDate <= endOfYear;
            });
            break;

          case "All Time":
          default:
            filteredEvents = [...allEvents];
            break;
        }
      }
     // console.log("Filtered events:", filteredEvents);

      setEvents(filteredEvents);

      // Calculate KPIs based on filtered events with status logic
      const kpiCounts = {
        totalEvents: filteredEvents.length,
        upcomingEvents: 0,
        ongoingEvents: 0,
        completedEvents: 0,
        cancelledEvents: 0,
        rejectedEvents: 0,
        pendingEvents: 0,
      };

      filteredEvents.forEach((event) => {
        const eventStatus = getEventStatusText(event);

        switch (eventStatus) {
          case "Upcoming":
            kpiCounts.upcomingEvents++;
            break;
          case "Ongoing":
            kpiCounts.ongoingEvents++;
            break;
          case "Completed":
            kpiCounts.completedEvents++;
            break;
          case "Cancelled By You":
            kpiCounts.cancelledEvents++;
            break;
          case "Rejected":
            kpiCounts.rejectedEvents++;
            break;
          case "Pending for Approval":
            kpiCounts.pendingEvents++;
            break;
        }
      });

      setKpiData(kpiCounts);
    } catch (error) {
      console.error("Error filtering events:", error);
      setEvents([]);
      setKpiData({
        totalEvents: 0,
        upcomingEvents: 0,
        ongoingEvents: 0,
        completedEvents: 0,
        cancelledEvents: 0,
        rejectedEvents: 0,
        pendingEvents: 0,
      });
    }
  }, [selectedMonth, selectedDate, allEvents]);

  // Fetch events from API with filters
  const fetchEvents = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // if (!session?.user?.id) {
      if (!user?.id) {

      // console.log("No user session found");
        setAllEvents([]);
        return;
      }

      // Prepare filters
      const filters = {
        period: selectedDate ? "Custom Date" : selectedMonth,
        ...(selectedDate && {
          startDate: selectedDate.toISOString(),
          endDate: selectedDate.toISOString(),
        }),
      };

     // console.log("Fetching events with filters:", filters);
      const response = await EventService.getAllEventsByServiceProvider(
        // session.user.id,
        user.id,
        filters
      );
     // console.log("Fetched events response:", response);

      const eventsData: Event[] = Array.isArray(response.events)
        ? (response.events as unknown as Event[])
        : [];

      // Set earnings data from API response
    

      setAllEvents(eventsData);
    } catch (error) {
      console.error("Error fetching events:", error);
      setError(
        error instanceof Error ? error.message : "Failed to load events"
      );
      setAllEvents([]);
      toast.error("Failed to load events. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Re-fetch data when filters change
  useEffect(() => {
    if (status === "loading") return;
    if (status === "unauthenticated") {
      setError("Please log in to view events");
      return;
    }

   if (user?.id) {
        fetchEvents();
    }
  }, [status, user?.id, selectedMonth, selectedDate]);

  // Debug logging
  useEffect(() => {
   // console.log("Current state:", {
    //   isLoading,
    //   allEventsType: typeof allEvents,
    //   allEventsIsArray: Array.isArray(allEvents),
    //   allEventsLength: Array.isArray(allEvents) ? allEvents.length : "N/A",
    //   eventsLength: Array.isArray(events) ? events.length : "N/A",
    //   error,
    //   session: session?.user?.id,
    //   earningsData,
    // });
  }, [isLoading, allEvents, events, error, user?.id, earningsData]);

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="px-4 md:px-8 py-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl md:text-4xl font-bold text-[#1A1A1A]">
            Events
          </h1>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <h3 className="text-red-800 text-lg font-medium mb-2">
            Error Loading Events
          </h3>
          <p className="text-red-600 mb-4">{error}</p>
          <Button
            className="bg-red-600 hover:bg-red-700"
            onClick={() => {
              setError(null);
              setIsLoading(true);
              fetchEvents();
            }}
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  // Get event status text using the same logic as badge
  const getEventStatusText = (event: Event): string => {
    if (event.approvalStatus === "pending") {
      return "Pending for Approval";
    }

    if (event.approvalStatus === "rejected") {
      return "Rejected";
    }

    if (event.approvalStatus === "approved") {
      if (event.activeStatus === "cancelled") {
        return "Cancelled By You";
      }

      // Time-based status comparison
      const now = new Date().getTime();
      const startDateTime = new Date(event.startDateTime).getTime();
      const endDateTime = new Date(event.endDateTime).getTime();

     // console.log(
      //   `Event: ${event.title}, Now: ${now}, Start: ${startDateTime}, End: ${endDateTime}`
      // );

      if (now < startDateTime) {
        return "Upcoming";
      } else if (startDateTime <= now && now < endDateTime) {
        return "Ongoing";
      } else if (now >= endDateTime) {
        return "Completed";
      }
    }

    return "Unknown";
  };

  // Status label logic as per your requirements
  const getStatusBadge = (event: Event) => {
    const statusText = getEventStatusText(event);

    const statusStyles: Record<string, string> = {
      Upcoming: " text-blue-800",
      Ongoing: " text-orange-800",
      Completed: " text-green-800",
      "Cancelled By You": " text-red-800",
      Rejected: " text-red-800",
      "Pending for Approval": " text-yellow-800",
    };

    const style = statusStyles[statusText] || "bg-gray-100 text-gray-800";

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${style}`}>
        {statusText}
      </span>
    );
  };

  // Check if event can be modified/cancelled - only allow if status is Upcoming
  const canModifyEvent = (event: Event) => {
    const statusText = getEventStatusText(event);
    if (statusText !== "Upcoming" && statusText !== "Pending for Approval") {
      return { canModify: false, reason: statusText };
    }
    return { canModify: true };
  };

  // Handle row selection
  const handleRowSelect = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedRows([...selectedRows, id]);
    } else {
      setSelectedRows(selectedRows.filter((rowId) => rowId !== id));
    }
  };

  // Handle select all
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedRows(events.map((event) => event._id));
    } else {
      setSelectedRows([]);
    }
  };

  // Handle calendar date selection
  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    setShowCalendar(false);
    if (!date) {
      setSelectedMonth("This Month");
    }
  };

   const handleBookingExportData = async () => {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASEURL}/api/events/export`, {
      method: "POST",
      body: JSON.stringify({
        'event_ids': 'all',
        'facility_id': user?.id
      }),
      headers: {
        "Content-Type": "application/json",
      },
    }); 

    if (!response.ok) {
      throw new Error("Failed to export data");
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);

    // Create a hidden link element and trigger download
    const a = document.createElement("a");
    a.href = url;
    a.download = "all_events.xlsx";
    document.body.appendChild(a);
    a.click();
    a.remove();

    window.URL.revokeObjectURL(url);
    toast.success("All event data exported successfully!");
  } catch (error) {
    console.error("Export error:", error);
    toast.error("Export failed. Please try again.");
  }
};


  // Export functionality with Excel support
  const handleExportData = (type: "bookings" | "earnings") => {
    const dataToExport =
      selectedRows.length > 0
        ? events.filter((event) => selectedRows.includes(event._id))
        : events;

    if (dataToExport.length === 0) {
      toast.error("No data to export");
      return;
    }

    let exportData = [];

    if (type === "bookings") {

      exportData = dataToExport.map((event, index) => ({
        "SL.NO": index + 1,
        DATE: formatDate(event.startDateTime),
        "EVENT NAME": event.title,
        START: formatDate(event.startDateTime),
        END: formatDate(event.endDateTime),
        "REGISTERED BY": formatDate(event.createdAt),
        "VENUE DETAILS": event.venue,
        TICKETS: getTicketInfo(event),
        "EVENT TYPE": event.status,
        PAYMENT: event.ticketType === "paid" ? "Yes" : "No",
        PRICE: formatPrice(event),
        "STATUS LABELS": getEventStatusText(event),
      }));
    } else {
      // Earnings export with extra columns
      exportData = dataToExport.map((event, index) => ({
        "SL.NO": index + 1,
        DATE: formatDate(event.startDateTime),
        "EVENT NAME": event.title,
        START: formatDate(event.startDateTime),
        END: formatDate(event.endDateTime),
        "REGISTERED BY": formatDate(event.createdAt),
        "VENUE DETAILS": event.venue,
        TICKETS: getTicketInfo(event),
        "EVENT TYPE": event.status,
        PAYMENT: event.ticketType === "paid" ? "Yes" : "No",
        PRICE: formatPrice(event),
        EARNINGS: formatCurrency(14000), // This would be calculated from actual booking data
        "STATUS LABELS": getEventStatusText(event),
      }));
    }

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      type === "bookings" ? "Bookings" : "Earnings"
    );

    const fileName = `${type}_data_${selectedDate ? selectedDate.toDateString() : selectedMonth.replace(" ", "_")}.xlsx`;
    XLSX.writeFile(workbook, fileName);

    toast.success(
      `${type === "bookings" ? "Bookings" : "Earnings"} data exported successfully! (${dataToExport.length} rows)`
    );
  };

  // Export individual event details
  const handleExportEventDetails = (event: Event) => {
    const exportData = [
      {
        "Event ID": event._id,
        "Event Name": event.title,
        Status: event.status,
        "Start Date": formatDate(event.startDateTime),
        "End Date": formatDate(event.endDateTime),
        Venue: event.venue,
        "Venue Status": event.venueStatus,
        Description: event.description,
        Category: event.category,
        Sectors: event.sectors.join(", "),
        Amenities: event.amenities.join(", "),
        "Approval Status": event.approvalStatus,
        "Active Status": event.activeStatus,
        "Ticket Type": event.ticketType,
        "Tickets Available": event.tickets,
        "Ticket Capacity": event.ticketCapacity,
        "Booked Tickets": event.bookedTicketsCount,
        "Ticket Price": event.ticketPrice,
        "Created At": formatDate(event.createdAt),
        "Updated At": formatDate(event.updatedAt),
      },
    ];

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Event Details");

    XLSX.writeFile(workbook, `event_${event._id}_details.xlsx`);
    toast.success("Event details exported successfully!");
  };

  const getEventTypeIcon = (status: string) => {
    return status === "public" ? (
      <span className="text-green-600">●</span>
    ) : (
      <span className="text-blue-600">●</span>
    );
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd MMM yyyy");
    } catch (error) {
      return "Invalid Date";
    }
  };

  const formatPrice = (event: Event) => {
    if (event.ticketType === "free") {
      return "FREE";
    }
    return `₹${event.ticketPrice?.toLocaleString("en-IN") || 0}`;
  };

  const getTicketInfo = (event: Event) => {
    return `${event.bookedTicketsCount}/${
      event.tickets === "limited" ? event.ticketCapacity || 0 : "unlimited"
    }`;
  };

  // Mobile Event Card Component
  const MobileEventCard = ({
    event,
    index,
  }: {
    event: Event;
    index: number;
  }) => {
    const modifyCheck = canModifyEvent(event);

    return (
      <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2">
            <Checkbox
              checked={selectedRows.includes(event._id)}
              onCheckedChange={(checked) =>
                handleRowSelect(event._id, checked as boolean)
              }
            />
            <span className="text-sm text-gray-500">#{index + 1}</span>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() =>
                  router.push(
                    `/service-provider/events/event-detail/${event._id}`
                  )
                }
              >
                <Eye className="mr-2 h-4 w-4" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={async () => {
                  if (!modifyCheck.canModify) {
                    showRestrictionWarning(modifyCheck.reason || "unknown");
                    return;
                  }
                  try {
                    clearFormData();
                    await setEditMode(event._id);
                    router.push(
                      `/service-provider/events/edit-event/${event._id}`
                    );
                  } catch (error) {
                    console.error("Error setting edit mode:", error);
                    toast.error("Failed to load event for editing");
                  }
                }}
              >
                <Pencil className="mr-2 h-4 w-4" />
                Cancel / Modify
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExportEventDetails(event)}>
                <Download className="mr-2 h-4 w-4" />
                Export Details
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Plus className="mr-2 h-4 w-4" />
                Initiate Refund
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative h-12 w-12 rounded-lg overflow-hidden bg-gray-100 border border-gray-200 flex-shrink-0">
            {event.coverImage && (
              <Image
                src={event.coverImage}
                alt={event.title}
                fill
                className="object-cover"
              />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <Link href={`/service-provider/events/event-detail/${event._id}`}>
              <h3 className="font-medium text-blue-600 hover:underline truncate">
                {event.title}
              </h3>
            </Link>
            <p className="text-sm text-gray-500 truncate">{event.venue}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <span className="text-gray-500">Start:</span>
            <p className="font-medium">{formatDate(event.startDateTime)}</p>
          </div>
          <div>
            <span className="text-gray-500">End:</span>
            <p className="font-medium">{formatDate(event.endDateTime)}</p>
          </div>
          <div>
            <span className="text-gray-500">Tickets:</span>
            <p className="font-medium">{getTicketInfo(event)}</p>
          </div>
          <div>
            <span className="text-gray-500">Price:</span>
            <p className="font-medium">{formatPrice(event)}</p>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getEventTypeIcon(event.status)}
            <span className="text-sm capitalize">{event.status}</span>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${
                event.ticketType === "paid"
                  ? "bg-green-100 text-green-800"
                  : "bg-gray-100 text-gray-800"
              }`}
            >
              {event.ticketType === "paid" ? "Paid" : "Free"}
            </span>
            {getStatusBadge(event)}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="px-4 md:px-8 py-6 space-y-6">
      {/* Restriction Warning Banner */}
      {showRestrictionBanner && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-center gap-3 mb-6">
          <div className="bg-yellow-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0">
            !
          </div>
          <p className="text-yellow-800 text-sm md:text-base">
            You cannot modify or cancel because the event status is{" "}
            {restrictionReason}
          </p>
        </div>
      )}

      {/* Header with title and actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        {activeTab === "bookings" ? (
          <h1 className="text-2xl md:text-4xl font-bold text-[#1A1A1A]">
            Events
          </h1>
        ) : (
          <h1 className="text-2xl md:text-4xl font-bold text-[#1A1A1A]">
            Earnings
          </h1>
        )}

        {/* Mobile Add New Button */}
        <div className="sm:hidden">
          <Link href="/service-provider/events/Events-New">
            <Button className="bg-green-500 hover:bg-green-600 h-[38px] flex items-center gap-2 w-full">
              <Plus className="h-4 w-4" />
              Add New Event
            </Button>
          </Link>
        </div>
      </div>

      {/* Tab Toggles and Controls */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        {/* Tab Toggles */}
        <div className="flex gap-3 rounded-full p-1">
          <Button
            size="sm"
            onClick={() => setActiveTab("bookings")}
            className={`px-4 py-2 text-sm font-medium rounded-full ${
              activeTab === "bookings"
                ? "bg-black text-white shadow-md"
                : "bg-white text-gray-600 shadow-md hover:text-gray-900"
            }`}
          >
            Bookings
          </Button>
          <Button
            size="sm"
            onClick={() => setActiveTab("earnings")}
            className={`px-4 py-2 text-sm font-medium rounded-full ${
              activeTab === "earnings"
                ? "bg-black text-white shadow-md"
                : "bg-white text-gray-600 shadow-md hover:text-gray-900"
            }`}
          >
            Earnings
          </Button>
        </div>

        {/* Desktop Controls */}
        <div className="hidden lg:flex gap-3">
          {/* Custom Calendar Filter */}
          <div className="relative" ref={calendarRef}>
            {/* <Button
              variant="outline"
              size="icon"
              onClick={() => setShowCalendar(!showCalendar)}
              className={`h-10 w-10 ${selectedDate ? "border-green-500 text-green-600" : "text-gray-500"}`}
            >
              <Calendar className="h-5 w-5" />
            </Button> */}
            {/* {showCalendar && (
              <div className="absolute top-12 right-0 z-50">
                <CustomCalendar
                  selectedDate={selectedDate}
                  onSelect={handleDateSelect}
                />
              </div>
            )} */}
          </div>

          {/* Month Filter */}
          <div className="flex items-center rounded-md border border-gray-200 bg-white">
            {/* <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 text-gray-500"
            >
              <CalendarIcon className="h-5 w-5" />
            </Button> */}
            <Select
              value={selectedDate ? "Custom Date" : selectedMonth}
              onValueChange={(value) => {
                if (value !== "Custom Date") {
                  setSelectedMonth(value);
                  setSelectedDate(undefined);
                }
              }}
            >
              <SelectTrigger className="border-0 w-[150px] h-10 focus:ring-0">
                <SelectValue>
                  {selectedDate ? "Custom Date" : selectedMonth}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="This Month">This Month</SelectItem>
                <SelectItem value="Last Month">Last Month</SelectItem>
                <SelectItem value="Last 3 Months">Last 3 Months</SelectItem>
                <SelectItem value="Last 6 Months">Last 6 Months</SelectItem>
                <SelectItem value="This Year">This Year</SelectItem>
                <SelectItem value="All Time">All Time</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Export Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="flex h-10 items-center gap-2 border-2 text-gray-600 bg-white"
              >
                <Download className="h-4 w-4" />
                Export {selectedRows.length > 0 && `(${selectedRows.length})`}
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() =>     handleBookingExportData()}>
                Export Bookings
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExportData("earnings")}>
                Export Earnings
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Link href="/service-provider/events/Events-New">
            <Button className="bg-green-500 hover:bg-green-600 h-[38px] flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add New
            </Button>
          </Link>
        </div>

        {/* Mobile Filter Button */}
        <div className="lg:hidden">
          <Sheet open={showMobileFilters} onOpenChange={setShowMobileFilters}>
            <SheetTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Filters & Export
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <SheetHeader>
                <SheetTitle>Filters & Actions</SheetTitle>
              </SheetHeader>
              <div className="space-y-4 mt-6">
                {/* Date Filter */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Date Range
                  </label>
                  <Select
                    value={selectedDate ? "Custom Date" : selectedMonth}
                    onValueChange={(value) => {
                      if (value !== "Custom Date") {
                        setSelectedMonth(value);
                        setSelectedDate(undefined);
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue>
                        {selectedDate ? "Custom Date" : selectedMonth}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="This Month">This Month</SelectItem>
                      <SelectItem value="Last Month">Last Month</SelectItem>
                      <SelectItem value="Last 3 Months">
                        Last 3 Months
                      </SelectItem>
                      <SelectItem value="Last 6 Months">
                        Last 6 Months
                      </SelectItem>
                      <SelectItem value="This Year">This Year</SelectItem>
                      <SelectItem value="All Time">All Time</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Custom Calendar */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Custom Date
                  </label>
                  <Button
                    variant="outline"
                    onClick={() => setShowCalendar(!showCalendar)}
                    className={`w-full ${selectedDate ? "border-green-500 text-green-600" : ""}`}
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    {selectedDate
                      ? formatDate(selectedDate.toISOString())
                      : "Select Date"}
                  </Button>
                  {showCalendar && (
                    <div className="mt-2">
                      <CustomCalendar
                        selectedDate={selectedDate}
                        onSelect={handleDateSelect}
                      />
                    </div>
                  )}
                </div>

                {/* Export Actions */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 block">
                    Export Data{" "}
                    {selectedRows.length > 0 &&
                      `(${selectedRows.length} selected)`}
                  </label>
                  <Button
                    variant="outline"
                    onClick={() => {
                          handleBookingExportData();
                      setShowMobileFilters(false);
                    }}
                    className="w-full"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export Bookings
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      handleExportData("earnings");
                      setShowMobileFilters(false);
                    }}
                    className="w-full"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export Earnings
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* KPI Cards - Responsive Grid */}
      {activeTab === "bookings" ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
          <div className="col-span-2 sm:col-span-1 rounded-[20px] md:rounded-[30px] bg-green-500 text-white relative overflow-hidden shadow-sm">
            <div className="absolute top-0 right-0 w-16 h-16 md:w-32 md:h-32 opacity-30">
              <div className="w-full h-full rounded-bl-[40px] md:rounded-bl-[80px] bg-white"></div>
            </div>
            <div className="p-4 md:p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm md:text-base font-medium">Total Events</p>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-white/70 hover:text-white"
                >
                  <svg
                    className="h-4 w-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                      clipRule="evenodd"
                    />
                  </svg>
                </Button>
              </div>
              <p className="text-3xl md:text-5xl font-bold">
                {String(kpiData.totalEvents).padStart(2, "0")}
              </p>
            </div>
          </div>

          <div className="rounded-[20px] md:rounded-[30px] bg-white text-black relative overflow-hidden shadow-sm">
            <div className="absolute top-0 right-0 w-16 h-16 md:w-32 md:h-32 opacity-10">
              <div className="w-full h-full rounded-bl-[40px] md:rounded-bl-[80px] bg-gradient-to-br from-[#FFF04B] to-[#22A146]"></div>
            </div>
            <div className="p-4 md:p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm md:text-base font-medium text-gray-700">
                  Upcoming
                </p>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-gray-400 hover:text-gray-600"
                >
                  <svg
                    className="h-4 w-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                      clipRule="evenodd"
                    />
                  </svg>
                </Button>
              </div>
              <p className="text-3xl md:text-5xl font-bold">
                {String(kpiData.upcomingEvents).padStart(2, "0")}
              </p>
            </div>
          </div>

          <div className="rounded-[20px] md:rounded-[30px] bg-white text-black relative overflow-hidden shadow-sm">
            <div className="absolute top-0 right-0 w-16 h-16 md:w-32 md:h-32 opacity-10">
              <div className="w-full h-full rounded-bl-[40px] md:rounded-bl-[80px] bg-gradient-to-br from-[#FFF04B] to-[#22A146]"></div>
            </div>
            <div className="p-4 md:p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm md:text-base font-medium text-gray-700">
                  Ongoing
                </p>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-gray-400 hover:text-gray-600"
                >
                  <svg
                    className="h-4 w-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                      clipRule="evenodd"
                    />
                  </svg>
                </Button>
              </div>
              <p className="text-3xl md:text-5xl font-bold">
                {String(kpiData.ongoingEvents).padStart(2, "0")}
              </p>
            </div>
          </div>

          <div className="rounded-[20px] md:rounded-[30px] bg-white text-black relative overflow-hidden shadow-sm">
            <div className="absolute top-0 right-0 w-16 h-16 md:w-32 md:h-32 opacity-10">
              <div className="w-full h-full rounded-bl-[40px] md:rounded-bl-[80px] bg-gradient-to-br from-[#FFF04B] to-[#22A146]"></div>
            </div>
            <div className="p-4 md:p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm md:text-base font-medium text-gray-700">
                  Completed
                </p>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-gray-400 hover:text-gray-600"
                >
                  <svg
                    className="h-4 w-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                      clipRule="evenodd"
                    />
                  </svg>
                </Button>
              </div>
              <p className="text-3xl md:text-5xl font-bold">
                {String(kpiData.completedEvents).padStart(2, "0")}
              </p>
            </div>
          </div>

          <div className="rounded-[20px] md:rounded-[30px] bg-white text-black relative overflow-hidden shadow-sm">
            <div className="absolute top-0 right-0 w-16 h-16 md:w-32 md:h-32 opacity-10">
              <div className="w-full h-full rounded-bl-[40px] md:rounded-bl-[80px] bg-gradient-to-br from-[#FFF04B] to-[#22A146]"></div>
            </div>
            <div className="p-4 md:p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm md:text-base font-medium text-gray-700">
                  Cancelled
                </p>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-gray-400 hover:text-gray-600"
                >
                  <svg
                    className="h-4 w-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                      clipRule="evenodd"
                    />
                  </svg>
                </Button>
              </div>
              <p className="text-3xl md:text-5xl font-bold">
                {String(kpiData.cancelledEvents).padStart(2, "0")}
              </p>
            </div>
          </div>

          <div className="rounded-[20px] md:rounded-[30px] bg-white text-black relative overflow-hidden shadow-sm">
            <div className="absolute top-0 right-0 w-16 h-16 md:w-32 md:h-32 opacity-10">
              <div className="w-full h-full rounded-bl-[40px] md:rounded-bl-[80px] bg-gradient-to-br from-[#FFF04B] to-[#22A146]"></div>
            </div>
            <div className="p-4 md:p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm md:text-base font-medium text-gray-700">
                  Pending
                </p>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-gray-400 hover:text-gray-600"
                >
                  <svg
                    className="h-4 w-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                      clipRule="evenodd"
                    />
                  </svg>
                </Button>
              </div>
              <p className="text-3xl md:text-5xl font-bold">
                {String(kpiData.pendingEvents).padStart(2, "0")}
              </p>
            </div>
          </div>
        </div>
      ) : (
        // Earnings Tab KPI Cards - Responsive Grid
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
          <div className="rounded-[20px] md:rounded-[30px] bg-green-500 text-white relative overflow-hidden shadow-sm">
            <div className="p-4 md:p-6">
              <p className="text-sm md:text-base font-medium">
                Today's Earnings
              </p>
              <p className="text-2xl md:text-5xl font-bold">
                {earningsData
                  ? formatCurrency(earningsData.today.amount)
                  : "₹0"}
              </p>
              <p className="text-xs md:text-sm opacity-75 flex items-center gap-1 mt-1">
                <span className="text-green-200">📊</span>{" "}
                {earningsData?.today.count || 0} bookings
              </p>
            </div>
          </div>

          <div className="rounded-[20px] md:rounded-[30px] bg-white text-black relative overflow-hidden shadow-sm">
            <div className="p-4 md:p-6">
              <p className="text-sm md:text-base font-medium text-gray-700">
                This Week Earnings
              </p>
              <p className="text-2xl md:text-5xl font-bold">
                {earningsData
                  ? formatCurrency(earningsData.thisWeek.amount)
                  : "₹0"}
              </p>
              <p className="text-xs md:text-sm text-gray-500 flex items-center gap-1 mt-1">
                {earningsData && earningsData.trends.weeklyChange >= 0 ? (
                  <TrendingUp className="h-4 w-4 text-green-500" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-500" />
                )}
                {earningsData?.trends.weeklyChange || 0}% from last period
              </p>
            </div>
          </div>

          <div className="rounded-[20px] md:rounded-[30px] bg-white text-black relative overflow-hidden shadow-sm">
            <div className="p-4 md:p-6">
              <p className="text-sm md:text-base font-medium text-gray-700">
                {selectedDate
                  ? "Selected Date Earnings"
                  : `${selectedMonth} Earnings`}
              </p>
              <p className="text-2xl md:text-5xl font-bold">
                {earningsData?.filtered
                  ? formatCurrency(earningsData.filtered.amount)
                  : "₹0"}
              </p>
              <p className="text-xs md:text-sm text-gray-500 flex items-center gap-1 mt-1">
                {earningsData && earningsData.filtered.trend >= 0 ? (
                  <TrendingUp className="h-4 w-4 text-green-500" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-500" />
                )}
                {earningsData?.filtered.trend || 0}% vs previous period
              </p>
            </div>
          </div>

          <div className="rounded-[20px] md:rounded-[30px] bg-white text-black relative overflow-hidden shadow-sm">
            <div className="p-4 md:p-6">
              <p className="text-sm md:text-base font-medium text-gray-700">
                Total Earnings
              </p>
              <p className="text-2xl md:text-5xl font-bold">
                {earningsData
                  ? formatCurrency(earningsData.total.amount)
                  : "₹0"}
              </p>
              <p className="text-xs md:text-sm text-gray-500 flex items-center gap-1 mt-1">
                <span className="text-blue-500">🎯</span>{" "}
                {earningsData?.total.count || 0} total bookings
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Events Table/Cards - Responsive Display */}
      <div className="bg-white rounded-[10px] overflow-hidden shadow-lg border border-gray-200">
        {/* Desktop Table View */}
        <div className="hidden lg:block overflow-x-auto">
          <Table>
            <TableHeader className="bg-gray-50 border-b border-gray-200">
              <TableRow className="divide-x divide-gray-200">
                <TableHead className="py-5 px-5 text-center font-semibold text-gray-600">
                  <Checkbox
                    checked={
                      selectedRows.length === events.length && events.length > 0
                    }
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead className="py-5 px-6 font-semibold text-gray-600 text-left">
                  SL.NO
                </TableHead>
                <TableHead className="py-5 px-6 font-semibold text-gray-600 text-left">
                  EVENT NAME
                </TableHead>
                <TableHead className="py-5 px-6 font-semibold text-gray-600 text-center">
                  START
                </TableHead>
                <TableHead className="py-5 px-6 font-semibold text-gray-600 text-center">
                  END
                </TableHead>
                <TableHead className="py-5 px-6 font-semibold text-gray-600 text-center">
                  REGISTERED BY
                </TableHead>
                <TableHead className="py-5 px-6 font-semibold text-gray-600 text-left">
                  VENUE DETAILS
                </TableHead>
                <TableHead className="py-5 px-6 font-semibold text-gray-600 text-center">
                  TICKETS
                </TableHead>
                <TableHead className="py-5 px-6 font-semibold text-gray-600 text-center">
                  EVENT TYPE
                </TableHead>
                <TableHead className="py-5 px-6 font-semibold text-gray-600 text-center">
                  PAYMENT
                </TableHead>
                <TableHead className="py-5 px-6 font-semibold text-gray-600 text-right">
                  PRICE
                </TableHead>
                <TableHead className="py-5 px-6 font-semibold text-gray-600 text-center">
                  EVENT STATUS
                </TableHead>
                <TableHead className="py-5 px-6 font-semibold text-gray-600 text-center">
                  ACTION
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-gray-200">
              {Array.isArray(events) && events.length > 0 ? (
                events.map((event, index) => {
                  const modifyCheck = canModifyEvent(event);
                  return (
                    <TableRow
                      key={event._id}
                      className="hover:bg-gray-50 divide-x divide-gray-200"
                    >
                      <TableCell className="py-4 px-4">
                        <Checkbox
                          checked={selectedRows.includes(event._id)}
                          onCheckedChange={(checked) =>
                            handleRowSelect(event._id, checked as boolean)
                          }
                        />
                      </TableCell>
                      <TableCell className="py-4 px-6 text-gray-700">
                        {index + 1}
                      </TableCell>
                      <TableCell className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="relative h-9 w-9 rounded-lg overflow-hidden bg-gray-100 border border-gray-200 flex-shrink-0">
                            {event.coverImage && (
                              <Image
                                src={event.coverImage}
                                alt={event.title}
                                fill
                                className="object-cover"
                              />
                            )}
                          </div>
                          <span className="font-medium text-blue-600 hover:underline cursor-pointer max-w-[200px] truncate">
                            <Link
                              href={`/service-provider/events/event-detail/${event._id}`}
                              className="max-w-[200px]"
                            >
                              {event.title}
                            </Link>
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="py-4 px-6 text-center text-gray-700">
                        {formatDate(event.startDateTime)}
                      </TableCell>
                      <TableCell className="py-4 px-6 text-center text-gray-700">
                        {formatDate(event.endDateTime)}
                      </TableCell>
                      <TableCell className="py-4 px-6 text-center text-gray-700">
                        {formatDate(event.createdAt)}
                      </TableCell>
                      <TableCell className="py-4 px-6 text-gray-700 max-w-[200px] truncate">
                        {event.venue}
                      </TableCell>
                      <TableCell className="py-4 px-6 text-center text-gray-700">
                        {getTicketInfo(event)}
                      </TableCell>
                      <TableCell className="py-4 px-6 text-center">
                        <div className="flex items-center justify-center gap-2">
                          {getEventTypeIcon(event.status)}
                          <span className="text-sm capitalize">
                            {event.status}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="py-4 px-6 text-center">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            event.ticketType === "paid"
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {event.ticketType === "paid" ? "Yes" : "No"}
                        </span>
                      </TableCell>
                      <TableCell className="py-4 px-6 text-right font-semibold">
                        {formatPrice(event)}
                      </TableCell>
                      <TableCell className="py-4 px-6 text-center">
                        {getStatusBadge(event)}
                      </TableCell>
                      <TableCell className="py-4 px-6 text-center">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() =>
                                router.push(
                                  `/service-provider/events/event-detail/${event._id}`
                                )
                              }
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={async () => {
                                if (!modifyCheck.canModify) {
                                  showRestrictionWarning(
                                    modifyCheck.reason || "unknown"
                                  );
                                  return;
                                }
                                try {
                                  clearFormData();
                                  await setEditMode(event._id);
                                  router.push(
                                    `/service-provider/events/edit-event/${event._id}`
                                  );
                                } catch (error) {
                                  console.error(
                                    "Error setting edit mode:",
                                    error
                                  );
                                  toast.error(
                                    "Failed to load event for editing"
                                  );
                                }
                              }}
                            >
                              <Pencil className="mr-2 h-4 w-4" />
                              Cancel / Modify
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleExportEventDetails(event)}
                            >
                              <Download className="mr-2 h-4 w-4" />
                              Export Details
                            </DropdownMenuItem> 
                             <DropdownMenuItem 
                              onClick={() => handleBookingExportData()}
                            >       
                              <Download className="mr-2 h-4 w-4" />
                              Export Bookings
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Plus className="mr-2 h-4 w-4" />
                              Initiate Refund
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                const url = `https://cumma.in/EventDetail/${event._id}`;
                                navigator.clipboard
                                  .writeText(url)
                                  .then(() => {
                                    toast.success("URL copied to clipboard!");
                                  })
                                  .catch(() => {
                                    toast.error("Failed to copy URL");
                                  });
                              }}
                            >
                              <Copy className="mr-2 h-4 w-4" />
                              Access Link
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={13} className="h-60 text-center">
                    <div className="flex flex-col items-center justify-center gap-4">
                      <p className="text-gray-500 text-xl">No events found.</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Mobile Card View */}
        <div className="lg:hidden">
          {Array.isArray(events) && events.length > 0 ? (
            <div className="p-4 space-y-4">
              {events.map((event, index) => (
                <MobileEventCard key={event._id} event={event} index={index} />
              ))}
            </div>
          ) : (
            <div className="p-8 text-center">
              <p className="text-gray-500 text-lg">No events found.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// MAIN COMPONENT: This wraps MyEventsContent with the EventFormProvider
export default function MyEvents() {
  return (
    <EventFormProvider>
      <MyEventsContent />
    </EventFormProvider>
  );
}
