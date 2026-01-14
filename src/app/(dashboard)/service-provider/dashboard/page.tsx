"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { formatCurrency } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Spinner } from "@/components/spinner";
import Image from "next/image";
import { format, addDays, subDays } from "date-fns";
import { Card } from "@/components/ui/card";
import { Calendar as CalendarIcon } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import React from "react";

interface Notification {
  _id: string;
  userName: string;
  facilityName: string;
  status: string;
  createdAt: string;
  isRead?: boolean;
  message?: string; // Add message property
}

interface Booking {
  _id: string;
  facilityId: string;
  facilityName: string;
  facilityType: string;
  startupId: string;
  startupName: string;
  status: string;
  amount: number;
  startDate: string;
  endDate: string;
  rentalPlan: string;
  createdAt: string;
}

interface FacilityGroup {
  facilityId: string;
  facilityName: string;
  bookings: Booking[];
}

interface KPIs {
  totalFacilities: number;
  totalBookings: number;
  totalEarnings: number;
  monthlyComparison: {
    bookings: number;
    earnings: number;
  };
  pendingPayouts: number;
}

interface DashboardData {
  kpis: KPIs;
  monthlyPayouts: {
    month: string;
    amount: number;
    count: number;
  }[];
  notifications: Notification[];
  calendarBookings: Booking[];
  dailyEarningData: {
    thisWeek: number;
    lastWeek: number;
  };
  monthlySummaryData: {
    totalEarnings: number;
    lastMonth: number;
    monthlyComparison: number;
  };
}

interface FacilityTypeEarnings {
  name: string;
  color: string;
  monthlyData: {
    [month: string]: number;
  };
  totalEarnings: number;
}

interface FacilityBookingCounts {
  name: string;
  color: string;
  gradient: string;
  monthlyData: {
    [month: string]: number;
  };
  totalBookings: number;
}

// Mock calendar booking data for initial UI rendering
const mockCalendarBookings: Booking[] = [];

// Hours for the calendar from 9 AM to 6 PM
const HOURS = [9, 10, 11, 12, 13, 14, 15, 16, 17, 18];

// Define colors for different facility types
const facilityTypeColors: Record<string, string> = {
  "individual-cabin": "#4F46E5", // Indigo
  "coworking-spaces": "#10B981", // Emerald
  "meeting-rooms": "#F59E0B", // Amber
  "bio-allied-labs": "#EF4444", // Red
  "manufacturing-labs": "#8B5CF6", // Purple
  "prototyping-labs": "#EC4899", // Pink
  software: "#06B6D4", // Cyan
  "saas-allied": "#F97316", // Orange
  "raw-space-office": "#6366F1", // Indigo
  "raw-space-lab": "#14B8A6", // Teal
  studio: "#8B5CF6", // Purple
  default: "#22C55E", // Default green
};

// Mapping of facility types to their display names
const facilityTypeNames: Record<string, string> = {
  "individual-cabin": "Individual Cabin",
  "coworking-spaces": "Coworking Space",
  "meeting-rooms": "Meeting Room",
  "bio-allied-labs": "Bio-Allied Lab",
  "manufacturing-labs": "Manufacturing Lab",
  "prototyping-labs": "Prototyping Lab",
  software: "Software Development",
  "saas-allied": "SaaS Allied",
  "raw-space-office": "Raw Space Office",
  "raw-space-lab": "Raw Space Lab",
  studio: "Studio",
};

export default function ServiceProviderDashboard() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState<"bookings" | "earnings">(
    "bookings"
  );
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isEarningsLoading, setIsEarningsLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [calendarBookings, setCalendarBookings] = useState<FacilityGroup[]>([]);
  const [recentNotifications, setRecentNotifications] = useState<
    Notification[]
  >([]);
  const [facilityTypeEarnings, setFacilityTypeEarnings] = useState<
    FacilityTypeEarnings[]
  >([]);
  const [facilityBookingCounts, setFacilityBookingCounts] = useState<
    FacilityBookingCounts[]
  >([]);
  // Added state for earnings data from earnings API
  const [earningsData, setEarningsData] = useState<{
    totalEarnings: number;
    monthlyEarnings: number;
    pendingPayouts: number;
  }>({
    totalEarnings: 0,
    monthlyEarnings: 0,
    pendingPayouts: 0,
  });

  // Colors for charts
  const COLORS = ["#FFAE4C", "#6FD195", "#7086FD", "#FF8042", "#8884d8"];

  // Gradients for bar chart
  const BAR_GRADIENTS = [
    "linear-gradient(180deg, #202BF6 0%, #41C6FF 100%)",
    "linear-gradient(180deg, #76F217 0%, #4CFF58 100%)",
    "linear-gradient(180deg, #12A454 0%, #47CC25 142.61%)",
  ];

  // Load the active tab from localStorage when the component mounts
  useEffect(() => {
    // Check if we're in the browser environment
    if (typeof window !== "undefined") {
      const savedTab = localStorage.getItem("dashboard_active_tab");
      if (savedTab === "bookings" || savedTab === "earnings") {
        setActiveTab(savedTab);
      }
    }
  }, []);

  // Save the active tab to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("dashboard_active_tab", activeTab);
    }
  }, [activeTab]);

  useEffect(() => {
    if (session?.user?.id) {
      fetchServiceProviderProfile();
      fetchDashboardData();
      fetchRecentNotifications();
      // Add new function call to fetch earnings data directly
      fetchEarningsApiData();
    }
  }, [session]);

  // New function to fetch data directly from earnings API
  const fetchEarningsApiData = async () => {
    try {
      setIsEarningsLoading(true);
      const response = await fetch("/api/service-provider/earnings");

      if (!response.ok) {
        throw new Error(`Error fetching earnings: ${response.status}`);
      }

      const data = await response.json();

      // Set earnings data
      setEarningsData({
        totalEarnings: data.totalEarnings,
        monthlyEarnings: data.monthlyEarnings,
        pendingPayouts: data.pendingPayouts,
      });
    } catch (error) {
      console.error("Error fetching earnings data:", error);
    } finally {
      setIsEarningsLoading(false);
    }
  };

  const fetchServiceProviderProfile = async () => {
    try {
      const response = await fetch("/api/service-provider/profile");
      const data = await response.json();
      if (data.error) {
        console.error("Error fetching profile:", data.error);
      } else {
        setUserProfile(data);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  };

  const fetchDashboardData = async (
    date: Date = selectedDate,
    userId?: string
  ) => {
    try {
      if (!dashboardData) {
        setIsLoading(true);
      }

      const dateStr = date.toISOString().split("T")[0];

      const serviceProviderId = userId || session?.user?.id;

      if (!serviceProviderId) {
        console.error("No service provider ID available");
        setIsLoading(false);
        return;
      }

      const response = await fetch(
        `/api/dashboard?date=${dateStr}&serviceProviderId=${serviceProviderId}`
      );

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const data = await response.json();

      if (data.error) {
        console.error("Error fetching dashboard data:", data.error);
      } else {
        const processedData = {
          ...data,
          kpis: {
            totalFacilities: data.kpis.totalFacilities,
            totalBookings: data.kpis.totalBookings,
            totalEarnings: data.kpis.totalEarnings,
            monthlyComparison: data.kpis?.monthlyComparison || {
              bookings: 0,
              earnings: 0,
            },
            pendingPayouts: data.kpis.pendingPayouts,
          },
          monthlyPayouts: data.monthlyPayouts,
          notifications: data.notifications,
          calendarBookings: data.calendarBookings,
          dailyEarningData: data.dailyEarningData,
          monthlySummaryData: data.monthlySummaryData,
        };
        setDashboardData(processedData);

        // Fetch booking data to generate the facility charts
        await fetchBookingsData();
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch bookings data for the charts
  const fetchBookingsData = async () => {
    try {
      // Fetch all bookings directly from the bookings API
      const bookingsResponse = await fetch("/api/bookings");

      if (!bookingsResponse.ok) {
        throw new Error(`Error fetching bookings: ${bookingsResponse.status}`);
      }

      const bookingsData = await bookingsResponse.json();

      // Handle both array format and object format with bookings property
      const bookings = Array.isArray(bookingsData)
        ? bookingsData
        : bookingsData.bookings || [];

      // Create transactions from all bookings
      const transactions = bookings.map((booking: any, index: number) => {
        // Convert date strings to date objects if they aren't already
        let startDate = booking.startDate;
        if (!(startDate instanceof Date) && startDate) {
          startDate = new Date(startDate);
        }

        // Format the date as ISO string for consistent processing
        const formattedDate =
          startDate instanceof Date
            ? startDate.toISOString().split("T")[0]
            : new Date().toISOString().split("T")[0]; // Default to today if date is invalid

        return {
          _id: booking._id,
          bookingId: booking.bookingId || `BOOK-${1000 + index}`,
          date: formattedDate,
          amount: booking.amount || 0,
          // Map 'approved' status to 'Completed' for UI display
          status:
            booking.status?.toLowerCase() === "approved"
              ? "Completed"
              : "Pending",
          facility: booking.facilityName || "Unknown Facility",
          facilityType: booking.facilityType || "Conference Room",
        };
      });

      // Calculate monthly earnings for each facility type to use in line chart
      // First, get monthly data for each facility type
      const facilityMonthlyData = transactions
        .filter((t: any) => t.status === "Completed")
        .reduce(
          (acc: { [key: string]: { [month: string]: number } }, curr: any) => {
            const type = curr.facilityType;
            const date = new Date(curr.date);
            const monthYear = `${date.toLocaleString("default", { month: "short" })} ${date.getFullYear().toString().slice(2)}`;

            if (!acc[type]) {
              acc[type] = {};
            }

            if (!acc[type][monthYear]) {
              acc[type][monthYear] = 0;
            }

            acc[type][monthYear] += curr.amount;
            return acc;
          },
          {}
        );

      // Calculate total earnings per facility type to find top 3
      const facilityTotalEarnings = Object.keys(facilityMonthlyData).map(
        (facilityType) => {
          const monthlyData = facilityMonthlyData[facilityType];
          const totalEarnings = Object.values(monthlyData).reduce(
            (sum: number, val: any) => sum + (Number(val) || 0),
            0
          );

          return {
            name: facilityType,
            monthlyData,
            totalEarnings,
          };
        }
      );

      // Sort by total earnings and get top 3
      const top3FacilityTypes = facilityTotalEarnings
        .sort(
          (a, b) => (b.totalEarnings as number) - (a.totalEarnings as number)
        )
        .slice(0, 3)
        .map((facility, index) => ({
          ...facility,
          color: COLORS[index],
        })) as FacilityTypeEarnings[];

      setFacilityTypeEarnings(top3FacilityTypes);

      // Create booking counts data by facility type and month
      const facilityBookingsByMonth = transactions.reduce(
        (acc: { [key: string]: { [month: string]: number } }, curr: any) => {
          const facility = curr.facilityType;
          const date = new Date(curr.date);
          const monthYear = `${date.toLocaleString("default", { month: "short" })} ${date.getFullYear().toString().slice(2)}`;

          if (!acc[facility]) {
            acc[facility] = {};
          }

          if (!acc[facility][monthYear]) {
            acc[facility][monthYear] = 0;
          }

          // Count each booking
          acc[facility][monthYear] += 1;

          return acc;
        },
        {}
      );

      // Calculate total bookings per facility to find top 3
      const facilityBookingCounts = Object.keys(facilityBookingsByMonth).map(
        (facilityType) => {
          const monthlyData = facilityBookingsByMonth[facilityType];
          const totalBookings = Object.values(monthlyData).reduce(
            (sum: number, val: any) => sum + (Number(val) || 0),
            0
          );

          return {
            name: facilityType,
            monthlyData,
            totalBookings,
          };
        }
      );

      // Sort by total bookings and get top 3
      const top3FacilitiesByBookings = facilityBookingCounts
        .sort(
          (a, b) => (b.totalBookings as number) - (a.totalBookings as number)
        )
        .slice(0, 3)
        .map((facility, index) => ({
          ...facility,
          color: COLORS[index],
          gradient: BAR_GRADIENTS[index],
        })) as FacilityBookingCounts[];

      setFacilityBookingCounts(top3FacilitiesByBookings);
    } catch (error) {
      console.error("Error fetching bookings data:", error);
    }
  };

  const handleDateChange = (newDate: Date) => {
    setSelectedDate(newDate);

    if (session?.user?.id) {
      fetchDashboardData(newDate, session.user.id);
    }
  };

  // Function to properly handle DB dates and timezone issues
  const formatDateFromDB = (dateString: string) => {
    // Create a date object properly converting to local timezone
    const date = new Date(dateString);

    // Format the time according to local timezone
    return {
      date,
      formattedTime: date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        // Removed timeZone: 'UTC' to use local timezone
      }),
      hours: date.getHours(), // Use local hours instead of UTC
      minutes: date.getMinutes(), // Use local minutes instead of UTC
    };
  };

  // Function to calculate position for time slots
  const calculateTimeSlotPosition = (startDate: string, endDate: string) => {
    // Parse dates directly from DB strings
    const startDateInfo = formatDateFromDB(startDate);
    const endDateInfo = formatDateFromDB(endDate);

    //// console.log("Calculating time slot position for:", {
    //   startDate,
    //   endDate,
    //   startTime: startDateInfo.formattedTime,
    //   endTime: endDateInfo.formattedTime,
    //   startHours: startDateInfo.hours,
    //   endHours: endDateInfo.hours,
    // });

    // Use local hours for positioning
    const startHour = startDateInfo.hours + startDateInfo.minutes / 60;
    const endHour = endDateInfo.hours + endDateInfo.minutes / 60;

    // Calculate positions based on 9am to 6pm time range (9 total hours)
    const startOffset = Math.max(startHour - 9, 0); // 9am is the start (0%)
    const endOffset = Math.min(endHour, 18) - 9; // 6pm (18:00) is the end (100%)
    const totalHours = 9; // 9 hours from 9am to 6pm

    const left = (startOffset / totalHours) * 100;
    const width = Math.max(((endOffset - startOffset) / totalHours) * 100, 5); // Ensure a minimum width

    //// console.log("Position calculation:", {
    //   startHour,
    //   endHour,
    //   startOffset,
    //   endOffset,
    //   left,
    //   width,
    //   timeRange: `${startDateInfo.formattedTime} to ${endDateInfo.formattedTime}`,
    //   widthInHours: (endHour - startHour).toFixed(2),
    //   daysSpanned:
    //     new Date(endDate).toDateString() !== new Date(startDate).toDateString()
    //       ? "Multiple days"
    //       : "Same day",
    // });

    return { left, width };
  };

  // Function to prepare chart data showing booking counts instead of amounts
  const prepareChartData = (
    monthlyData: { month: string; amount: number; count: number }[]
  ) => {
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth();

    // Generate all months of the current year
    const allMonths = Array.from({ length: 12 }, (_, i) => {
      const monthName = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ][i];
      return {
        month: `${monthName} ${currentYear.toString().slice(2)}`,
        bookings: 0, // Initialize count to 0
        hasData: false,
      };
    });

    // Fill in the data from the API
    monthlyData.forEach((data) => {
      const monthIndex = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ].findIndex((m) => data.month.startsWith(m));

      if (monthIndex !== -1) {
        allMonths[monthIndex].bookings = data.count; // Use count instead of amount
        allMonths[monthIndex].hasData = true;
      }
    });

    return allMonths;
  };

  // Update the useEffect that processes calendar bookings
  useEffect(() => {
    if (dashboardData?.calendarBookings) {
      //// console.log("Processing calendar bookings...");

      // Filter bookings for the selected date
      const selectedDateStr = selectedDate.toISOString().split("T")[0];
      //// console.log("Selected date:", selectedDateStr);

      // Filter bookings that overlap with the selected date
      const filteredBookings = dashboardData.calendarBookings.filter(
        (booking) => {
          const bookingStartDate = new Date(booking.startDate);
          const bookingEndDate = new Date(booking.endDate);

          // Log for debugging
          //// console.log("Booking dates:", {
          //   id: booking._id,
          //   facilityName: booking.facilityName,
          //   startupName: booking.startupName,
          //   startDate: booking.startDate,
          //   endDate: booking.endDate,
          //   rawStartDate: bookingStartDate.toString(),
          //   rawEndDate: bookingEndDate.toString(),
          //   startHours: bookingStartDate.getHours(),
          //   endHours: bookingEndDate.getHours(),
          // });

          const dayStart = new Date(selectedDate);
          dayStart.setHours(0, 0, 0, 0);
          const dayEnd = new Date(selectedDate);
          dayEnd.setHours(23, 59, 59, 999);

          // Booking starts on selected date
          const startsOnDay =
            bookingStartDate >= dayStart && bookingStartDate <= dayEnd;
          // Booking ends on selected date
          const endsOnDay =
            bookingEndDate >= dayStart && bookingEndDate <= dayEnd;
          // Booking spans over selected date
          const spansOverDay =
            bookingStartDate < dayStart && bookingEndDate > dayEnd;

          const shouldInclude = startsOnDay || endsOnDay || spansOverDay;
          //// console.log("Filtering result:", {
          //   startsOnDay,
          //   endsOnDay,
          //   spansOverDay,
          //   shouldInclude,
          // });

          return shouldInclude;
        }
      );

     // console.log("Filtered bookings count:", filteredBookings.length);

      // Group by facility
      const facilityMap = new Map<string, FacilityGroup>();

      filteredBookings.forEach((booking) => {
        if (!facilityMap.has(booking.facilityId)) {
          facilityMap.set(booking.facilityId, {
            facilityId: booking.facilityId,
            facilityName: booking.facilityName,
            bookings: [],
          });
        }

        const group = facilityMap.get(booking.facilityId);
        if (group) {
          group.bookings.push(booking);
        }
      });

      // Convert the map to an array
      const groupedBookings = Array.from(facilityMap.values());
      //// console.log("Grouped bookings by facility:", groupedBookings.length);

      setCalendarBookings(groupedBookings);
    }
  }, [dashboardData, selectedDate]);

  // New function to fetch recent notifications
  const fetchRecentNotifications = async () => {
    try {
      if (!session?.user?.id) return;

      // Updated API call with correct parameters
      const response = await fetch(
        "/api/notifications?limit=3&type=booking&status=approved"
      );

      if (response.ok) {
        const data = await response.json();

        // Transform notifications for display - preserve the original message
        const transformedNotifications = data.notifications.map(
          (notification: any) => ({
            _id: notification._id,
            userName: notification.metadata.startupName || "A startup",
            facilityName: notification.metadata.facilityName || "your facility",
            status: "approved",
            createdAt: notification.createdAt,
            isRead: notification.isRead,
            message: notification.message, // Add the original message
          })
        );

        setRecentNotifications(transformedNotifications);
      } else {
        console.error(
          "Failed to fetch recent notifications:",
          await response.text()
        );
      }
    } catch (error) {
      console.error("Error fetching recent notifications:", error);
    }
  };

  const handleTabChange = (tab: "bookings" | "earnings") => {
    setActiveTab(tab);
    localStorage.setItem("dashboard_active_tab", tab);
  };

  if (isLoading && activeTab === "bookings") {
    return (
      <div className="flex items-center justify-center h-96">
        <Spinner size="lg" />
      </div>
    );
  }

  if (isEarningsLoading && activeTab === "earnings") {
    return (
      <div className="flex items-center justify-center h-96">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!dashboardData && activeTab === "bookings") {
    return (
      <div className="p-4 rounded-md bg-gray-50 text-gray-600">
        No dashboard data available.
      </div>
    );
  }

  // Destructure dashboardData with default values for when it's null
  const {
    kpis = {
      totalFacilities: 0,
      totalBookings: 0,
      totalEarnings: 0,
      monthlyComparison: { bookings: 0, earnings: 0 },
      pendingPayouts: 0,
    },
    monthlyPayouts = [],
    notifications = [],
    dailyEarningData = { thisWeek: 0, lastWeek: 0 },
    monthlySummaryData = {
      totalEarnings: 0,
      lastMonth: 0,
      monthlyComparison: 0,
    },
  } = dashboardData || {};

  // Status badge colors
  const statusColors: { [key: string]: string } = {
    approved: "bg-green-100 text-green-800",
    pending: "bg-yellow-100 text-yellow-800",
    confirmed: "bg-blue-100 text-blue-800",
    cancelled: "bg-red-100 text-red-800",
    completed: "bg-purple-100 text-purple-800",
  };

  const getComparisonColor = (comparison: number) => {
    return comparison > 0
      ? "text-green-500"
      : comparison < 0
        ? "text-red-500"
        : "text-gray-500";
  };

  const formatComparison = (comparison: number) => {
    return comparison > 0
      ? `+${comparison}%`
      : comparison < 0
        ? `${comparison}%`
        : "0%";
  };

  // Get the last 6 months for the x-axis
  const getLastSixMonths = () => {
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const today = new Date();

    // Create a Set to ensure uniqueness
    const monthsSet = new Set<string>();

    // Start from 5 months ago (to get 6 months total including current)
    for (let i = 5; i >= 0; i--) {
      // Create a new date object to avoid modifying the original
      const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const monthStr = months[date.getMonth()];
      const yearStr = date.getFullYear().toString().slice(2);
      monthsSet.add(`${monthStr} ${yearStr}`);
    }

    // Convert Set back to Array and ensure proper order
    return Array.from(monthsSet).sort((a, b) => {
      // Sort by year first
      const yearA = parseInt(a.split(" ")[1]);
      const yearB = parseInt(b.split(" ")[1]);
      if (yearA !== yearB) return yearA - yearB;

      // Then sort by month
      const monthA = months.indexOf(a.split(" ")[0]);
      const monthB = months.indexOf(b.split(" ")[0]);
      return monthA - monthB;
    });
  };

  // Calculate maximum value for y-axis
  const calculateMaxValue = () => {
    if (facilityTypeEarnings.length === 0) return 30000;

    const allValues = facilityTypeEarnings.flatMap((facility) =>
      Object.values(facility.monthlyData)
    );

    const maxValue = Math.max(...allValues, 0);
    // Round up to nearest 5000
    return Math.ceil(maxValue / 5000) * 5000;
  };

  // Calculate maximum booking count for y-axis in the bar chart
  const calculateMaxBookingCount = () => {
    if (facilityBookingCounts.length === 0) return 50;

    const allCounts = facilityBookingCounts.flatMap((facility) =>
      Object.values(facility.monthlyData)
    );

    const maxCount = Math.max(...allCounts, 0);
    // Round up to nearest 10
    return Math.ceil(maxCount / 10) * 10;
  };

  // Helper function to format the notification date for display
  const formatNotificationDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();

    // Check if the date is today
    if (date.toDateString() === today.toDateString()) {
      return "Today";
    }

    // Otherwise return formatted date
    return date.toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-6">
      {/* Dashboard Header */}
      <div className="flex flex-col space-y-3 sm:space-y-4 mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tighter">
          Hello, {userProfile?.serviceName || "SNS Incubation Center"}
        </h1>
        <p className="text-base sm:text-lg text-muted-foreground opacity-60">
          Let's see the current updates
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex flex-col space-y-6 sm:space-y-8">
        <div className="flex items-center justify-between">
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
            <button
              className={`px-4 sm:px-5 py-2 sm:py-3 rounded-full font-semibold text-sm sm:text-base w-full sm:w-auto ${activeTab === "bookings" ? "bg-black text-white" : "bg-white text-black"}`}
              onClick={() => handleTabChange("bookings")}
            >
              Booking Details
            </button>
            <button
              className={`px-4 sm:px-5 py-2 sm:py-3 rounded-full font-semibold text-sm sm:text-base w-full sm:w-auto ${activeTab === "earnings" ? "bg-black text-white" : "bg-white text-black"}`}
              onClick={() => handleTabChange("earnings")}
            >
              Earnings & Facility Usage
            </button>
          </div>
        </div>

        {activeTab === "bookings" && (
          <div className="space-y-4 sm:space-y-5">
            {/* Top row: KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              {/* Total Bookings Card - Green (without arrow) */}
              <div className="p-4 sm:p-6 rounded-[20px] sm:rounded-[30px] bg-green-500 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-20 h-20 sm:w-32 sm:h-32 opacity-30">
                  <div className="w-full h-full rounded-bl-[40px] sm:rounded-bl-[80px] bg-white"></div>
                </div>
                <div className="flex flex-col gap-3 sm:gap-4">
                  <p className="text-sm sm:text-base font-medium">
                    Total Bookings (All Time)
                  </p>
                  <p className="text-2xl sm:text-4xl font-medium">
                    {kpis.totalBookings}
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="bg-white/20 rounded-full px-2 sm:px-3 py-1 text-xs sm:text-sm">
                      {kpis.monthlyComparison.bookings > 0 ? "+" : ""}
                      {kpis.monthlyComparison.bookings}% from last month
                    </span>
                  </div>
                </div>
              </div>

              {/* Total Earnings Card - Light colored (without arrow) */}
              <div className="p-4 sm:p-6 rounded-[20px] sm:rounded-[30px] bg-white text-black relative overflow-hidden">
                <div className="absolute top-0 right-0 w-20 h-20 sm:w-32 sm:h-32 opacity-10">
                  <div className="w-full h-full rounded-bl-[40px] sm:rounded-bl-[80px] bg-gradient-to-br from-[#FFF04B] to-[#22A146]"></div>
                </div>
                <div className="flex flex-col gap-3 sm:gap-4">
                  <p className="text-sm sm:text-base font-medium text-gray-700">
                    Total Earnings (All Time)
                  </p>
                  <p className="text-2xl sm:text-4xl font-medium">
                    {formatCurrency(kpis.totalEarnings)}
                  </p>
                  <div className="flex items-center gap-2">
                    <div
                      className={`${kpis.monthlyComparison.earnings >= 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"} px-2 py-1 rounded-full text-xs font-medium`}
                    >
                      {kpis.monthlyComparison.earnings > 0 ? "+" : ""}
                      {kpis.monthlyComparison.earnings}%
                    </div>
                    <span className="text-xs sm:text-sm text-gray-500">
                      than Last Month
                    </span>
                  </div>
                </div>
              </div>

              {/* Total Facilities Card - Light colored (without arrow) */}
              <div className="p-4 sm:p-6 rounded-[20px] sm:rounded-[30px] bg-white text-black relative overflow-hidden sm:col-span-2 lg:col-span-1">
                <div className="absolute top-0 right-0 w-20 h-20 sm:w-32 sm:h-32 opacity-10">
                  <div className="w-full h-full rounded-bl-[40px] sm:rounded-bl-[80px] bg-gradient-to-br from-[#FFF04B] to-[#22A146]"></div>
                </div>
                <div className="flex flex-col gap-3 sm:gap-4">
                  <p className="text-sm sm:text-base font-medium text-gray-700">
                    Total Facilities Added
                  </p>
                  <p className="text-2xl sm:text-4xl font-medium">
                    {kpis.totalFacilities}
                  </p>
                </div>
              </div>
            </div>

            {/* Middle row: Graph and Notifications */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5">
              {/* Charts section - stacked on mobile, side by side on larger screens */}
              <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
                {/* Monthly Earnings Chart */}
                <div className="bg-white rounded-[20px] sm:rounded-[30px] p-4 sm:p-6 shadow-sm border border-gray-100">
                  <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-gray-800">
                    Monthly Earnings by Facility Type
                  </h3>

                  <div className="relative h-[250px] sm:h-[320px] font-['Plus_Jakarta_Sans','Inter',sans-serif]">
                    {isLoading ? (
                      <div className="flex items-center justify-center h-full">
                        <Spinner size="lg" />
                      </div>
                    ) : (
                      /* Main Chart Container */
                      <div className="flex flex-col justify-center items-center p-1 sm:p-2 w-full h-full">
                        {/* Chart & Axis */}
                        <div className="flex flex-col items-start w-full h-[200px] sm:h-[255px]">
                          {/* Main Chart */}
                          <div className="flex flex-row items-center w-full h-[180px] sm:h-[234px] relative">
                            {/* Y-Axis Left */}
                            <div className="flex flex-col justify-between items-end py-0 px-1 h-[180px] sm:h-[234px] w-[30px] sm:w-[34px]">
                              {Array.from({ length: 6 }).map((_, i) => {
                                const maxValue = calculateMaxValue();
                                const value = Math.round(
                                  (maxValue * (5 - i)) / 5
                                );
                                return (
                                  <span
                                    key={i}
                                    className="text-[8px] sm:text-[10px] leading-[10px] sm:leading-[13px] text-black/70"
                                  >
                                    {i === 5
                                      ? "0"
                                      : `₹${value.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`}
                                  </span>
                                );
                              })}
                            </div>

                            {/* Graph & Grid */}
                            <div className="relative flex-1 h-[180px] sm:h-[234px]">
                              {/* X Lines - Horizontal grid lines */}
                              <div className="absolute inset-0 flex flex-col justify-between items-start py-[6px] px-[1px]">
                                {Array.from({ length: 6 }).map((_, i) => (
                                  <div
                                    key={i}
                                    className={`w-full border-t ${i === 5 ? "border-solid border-black/50" : "border-dashed border-black/25"}`}
                                  ></div>
                                ))}
                              </div>

                              {/* Custom Line Chart Implementation */}
                              <div className="absolute inset-0 py-[7px]">
                                {facilityTypeEarnings.map(
                                  (facility, facilityIndex) => {
                                    const months = getLastSixMonths();
                                    const maxValue = calculateMaxValue();

                                    // Calculate positions for line segments and points
                                    const points = months.map(
                                      (month, index) => {
                                        const value =
                                          facility.monthlyData[month] || 0;
                                        const xPos =
                                          8.33 + (index * (100 - 2 * 8.33)) / 5; // Calculate x position (8.33% to 91.67%)
                                        const yPos =
                                          100 - (value / maxValue) * 95; // Calculate y position (5% to 100%)
                                        return { month, value, xPos, yPos };
                                      }
                                    );

                                    // Areas for gradient fills
                                    const topPosition = Math.min(
                                      ...points.map((p) => p.yPos)
                                    );

                                    return (
                                      <React.Fragment key={facility.name}>
                                        {/* Gradient Area */}
                                        <div
                                          className={`absolute left-[8.33%] right-[8.33%] bg-gradient-to-b`}
                                          style={{
                                            top: `${topPosition}%`,
                                            bottom: `0%`,
                                            background: `linear-gradient(180deg, ${facility.color}4D 0%, ${facility.color}0D 100%)`,
                                          }}
                                        ></div>

                                        {/* Line connecting points */}
                                        {points.slice(0, -1).map((point, i) => {
                                          const nextPoint = points[i + 1];
                                          return (
                                            <div
                                              key={i}
                                              className="absolute border-t-2 z-10"
                                              style={{
                                                left: `${point.xPos}%`,
                                                width: `${nextPoint.xPos - point.xPos}%`,
                                                top: `${point.yPos}%`,
                                                borderColor: facility.color,
                                              }}
                                            ></div>
                                          );
                                        })}

                                        {/* Data Points */}
                                        {points.map((point, i) => (
                                          <div
                                            key={i}
                                            className="absolute z-20"
                                            style={{
                                              left: `${point.xPos}%`,
                                              top: `${point.yPos}%`,
                                            }}
                                          >
                                            <div
                                              className="absolute w-3 h-3 sm:w-4 sm:h-4 -left-1.5 -top-1.5 sm:-left-2 sm:-top-2 opacity-25 rounded-full"
                                              style={{
                                                background: facility.color,
                                              }}
                                            ></div>
                                            <div
                                              className="absolute w-1.5 h-1.5 sm:w-2 sm:h-2 -left-0.75 -top-0.75 sm:-left-1 sm:-top-1 border border-white rounded-full"
                                              style={{
                                                background: facility.color,
                                              }}
                                            ></div>
                                          </div>
                                        ))}
                                      </React.Fragment>
                                    );
                                  }
                                )}
                              </div>
                            </div>
                          </div>

                          {/* X Axis */}
                          <div className="flex flex-row items-start pl-[27px] sm:pl-[31px] pb-2 w-full h-[20px] sm:h-[23px]">
                            {getLastSixMonths().map((month, index) => (
                              <div
                                key={index}
                                className="flex-1 text-center text-[10px] sm:text-[12px] text-black/70"
                              >
                                {month.split(" ")[0]}
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Legends */}
                        <div className="flex flex-row flex-wrap justify-center items-center w-full h-[20px] sm:h-[24px]">
                          <div className="flex flex-row flex-wrap justify-center items-center px-1 sm:px-2 gap-x-1 sm:gap-x-2 h-[20px] sm:h-[24px]">
                            {facilityTypeEarnings.map((facility, index) => (
                              <div
                                key={index}
                                className="flex flex-row items-center p-0.5 sm:p-1 gap-0.5 sm:gap-1 h-5 sm:h-6"
                              >
                                <div className="relative w-3 h-3 sm:w-4 sm:h-4">
                                  <div
                                    className="absolute w-3 h-0.5 sm:w-4 sm:h-0.5 left-0 top-[5px] sm:top-[7px]"
                                    style={{ background: facility.color }}
                                  ></div>
                                  <div
                                    className="absolute w-1.5 h-1.5 sm:w-2 sm:h-2 left-0.75 top-0.75 sm:left-1 sm:top-1 rounded-full border border-white"
                                    style={{ background: facility.color }}
                                  ></div>
                                  <div
                                    className="absolute w-3 h-3 sm:w-4 sm:h-4 left-0 top-0 rounded-full opacity-25"
                                    style={{ background: facility.color }}
                                  ></div>
                                </div>
                                <span className="text-[10px] sm:text-[12px] text-black/70">
                                  {facility.name}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Top Facilities Chart */}
                <div className="bg-white rounded-[20px] sm:rounded-[30px] p-4 sm:p-6 shadow-sm border border-gray-100">
                  <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-gray-800">
                    Top Facilities
                  </h3>

                  <div className="relative h-[250px] sm:h-[320px] font-['Plus_Jakarta_Sans','Inter',sans-serif]">
                    {isLoading ? (
                      <div className="flex items-center justify-center h-full">
                        <Spinner size="lg" />
                      </div>
                    ) : (
                      /* Main Chart Container */
                      <div className="flex flex-col items-start p-1 sm:p-2 w-full h-full">
                        {/* Chart & Axis */}
                        <div className="flex flex-col items-start w-full h-[200px] sm:h-[265px]">
                          {/* Main Chart */}
                          <div className="flex flex-row items-center w-full h-[180px] sm:h-[244px] relative">
                            {/* Y-Axis Left */}
                            <div className="flex flex-col justify-between items-end py-0 px-1 h-[180px] sm:h-[244px] w-[20px] sm:w-[25px]">
                              {Array.from({ length: 6 }).map((_, i) => {
                                const maxValue = calculateMaxBookingCount();
                                const value = Math.round(
                                  (maxValue * (5 - i)) / 5
                                );
                                return (
                                  <span
                                    key={i}
                                    className="text-[10px] sm:text-[12px] leading-[12px] sm:leading-[15px] text-[#222222] font-normal"
                                  >
                                    {value}
                                  </span>
                                );
                              })}
                            </div>

                            {/* Graph & Grid */}
                            <div className="relative flex-1 h-[180px] sm:h-[244px]">
                              {/* X Lines - Horizontal grid lines */}
                              <div className="absolute inset-0 flex flex-col justify-between items-start py-[6px] px-[1px]">
                                {Array.from({ length: 6 }).map((_, i) => (
                                  <div
                                    key={i}
                                    className={`w-full border-t ${i === 5 ? "border-solid border-black/50" : "border-dashed border-black/25"}`}
                                  ></div>
                                ))}
                              </div>

                              {/* Bar Chart Implementation */}
                              <div className="absolute inset-0 py-[6px]">
                                {facilityBookingCounts.length > 0 && (
                                  <div className="w-full h-full relative">
                                    {getLastSixMonths().map(
                                      (month, monthIndex) => {
                                        const maxValue =
                                          calculateMaxBookingCount();
                                        // Get the top facility for this month
                                        let topFacility: FacilityBookingCounts | null =
                                          null;
                                        let topBookingCount = 0;

                                        facilityBookingCounts.forEach(
                                          (facility) => {
                                            const bookingCount =
                                              facility.monthlyData[month] || 0;
                                            if (
                                              bookingCount > topBookingCount
                                            ) {
                                              topFacility = facility;
                                              topBookingCount = bookingCount;
                                            }
                                          }
                                        );

                                        if (
                                          !topFacility ||
                                          topBookingCount === 0
                                        )
                                          return null;

                                        // Calculate position for each month (evenly spaced)
                                        const xPos =
                                          8.33 +
                                          (monthIndex * (100 - 2 * 8.33)) / 5;
                                        // Calculate bar height based on booking count
                                        const barHeight =
                                          (topBookingCount / maxValue) * 100;

                                        // Determine gradient based on facility index
                                        const facilityIndex =
                                          facilityBookingCounts.findIndex(
                                            (f) =>
                                              topFacility !== null &&
                                              f.name === topFacility.name
                                          );
                                        const gradient =
                                          BAR_GRADIENTS[
                                            facilityIndex >= 0
                                              ? facilityIndex
                                              : 0
                                          ];

                                        return (
                                          <div
                                            key={month}
                                            className="absolute"
                                            style={{
                                              left: `${xPos - 8}%`,
                                              width: "16%",
                                              bottom: "0",
                                              height: `${barHeight}%`,
                                            }}
                                          >
                                            {/* Bar for this month */}
                                            <div
                                              className="absolute w-full rounded-[8px] sm:rounded-[10px] opacity-70"
                                              style={{
                                                top: "0",
                                                bottom: "0",
                                                background: gradient,
                                              }}
                                            >
                                              {/* White overlay on left side */}
                                              <div
                                                className="absolute left-0 top-0 bottom-0 bg-white/30"
                                                style={{ width: "50%" }}
                                              ></div>

                                              {/* Booking count number */}
                                              {topBookingCount > 0 && (
                                                <div
                                                  className="absolute w-full flex justify-center items-center"
                                                  style={{ top: "20%" }}
                                                >
                                                  <span className="text-[20px] sm:text-[30px] leading-[25px] sm:leading-[38px] font-semibold text-white">
                                                    {topBookingCount}
                                                  </span>
                                                </div>
                                              )}
                                            </div>
                                          </div>
                                        );
                                      }
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* X Axis */}
                          <div className="flex flex-row items-start pl-[15px] sm:pl-[19px] pb-2 w-full h-[20px] sm:h-[23px]">
                            {getLastSixMonths().map((month, index) => (
                              <div
                                key={index}
                                className="flex-1 flex justify-center"
                              >
                                <span className="text-[10px] sm:text-[12px] leading-[12px] sm:leading-[15px] font-medium text-[#222222]">
                                  {month.split(" ")[0]}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Legends */}
                        <div className="flex flex-row flex-wrap justify-center items-center w-full h-[20px] sm:h-[24px]">
                          <div className="flex flex-row flex-wrap justify-center items-center px-1 sm:px-2 gap-x-1 sm:gap-x-2 h-[20px] sm:h-[24px]">
                            {facilityBookingCounts.map((facility, index) => (
                              <div
                                key={index}
                                className="flex flex-row items-center p-0.5 sm:p-1 gap-0.5 sm:gap-1 h-5 sm:h-6"
                              >
                                <div className="relative w-3 h-3 sm:w-4 sm:h-4">
                                  <div
                                    className="absolute w-1.5 h-1.5 sm:w-2 sm:h-2 left-0.75 top-0.75 sm:left-1 sm:top-1 rounded-none border border-white"
                                    style={{
                                      background:
                                        index === 0
                                          ? "#41C6FF"
                                          : index === 1
                                            ? "#4CFF58"
                                            : "#12A454",
                                    }}
                                  ></div>
                                </div>
                                <span className="text-[10px] sm:text-[12px] leading-[12px] sm:leading-[15px] font-medium text-[#222222]">
                                  {facility.name}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Right column: Notifications */}
              <div className="bg-white rounded-[20px] sm:rounded-[30px] p-4 sm:p-6 order-first lg:order-last">
                <div className="flex justify-between items-center mb-3 sm:mb-4">
                  <h3 className="text-xl sm:text-2xl font-bold">Bookings</h3>
                </div>

                <div className="space-y-4 sm:space-y-5">
                  {recentNotifications.length > 0 ? (
                    <>
                      <div>
                        <h4 className="text-sm sm:text-base font-semibold text-black/60 mb-2">
                          {formatNotificationDate(
                            recentNotifications[0].createdAt
                          )}
                        </h4>
                        <div className="space-y-3 sm:space-y-4">
                          {recentNotifications.map((notification, index) => (
                            <div
                              key={notification._id || index}
                              className="flex items-start gap-3 sm:gap-6"
                            >
                              <div className="bg-green-100 p-1.5 sm:p-2 rounded-lg flex-shrink-0">
                                <svg
                                  width="16"
                                  height="16"
                                  className="sm:w-5 sm:h-5"
                                  viewBox="0 0 20 20"
                                  fill="none"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <path
                                    d="M7.5 18.333H12.5C16.667 18.333 18.333 16.667 18.333 12.5V7.5C18.333 3.333 16.667 1.667 12.5 1.667H7.5C3.333 1.667 1.667 3.333 1.667 7.5V12.5C1.667 16.667 3.333 18.333 7.5 18.333Z"
                                    stroke="#22C55E"
                                    strokeWidth="1.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                  <path
                                    d="M7.5 9.167L9.167 10.833L12.5 7.5"
                                    stroke="#22C55E"
                                    strokeWidth="1.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                </svg>
                              </div>
                              <div className="flex-1">
                                <p className="text-base sm:text-lg font-semibold text-black/80">
                                  {notification.message ||
                                    `${notification.userName} has booked the ${notification.facilityName}`}
                                </p>
                                <p className="text-xs sm:text-sm text-black/35 font-semibold mt-1">
                                  {new Date(
                                    notification.createdAt
                                  ).toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  ) : (
                    <p className="text-gray-500">
                      No recent booking notifications
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Bottom row: Calendar */}
            <div className="bg-white rounded-[20px] sm:rounded-[30px] p-4 sm:p-6 relative">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 gap-3 sm:gap-0">
                <h3 className="text-xl sm:text-2xl font-bold">
                  Booking Schedule
                </h3>
                <div className="flex items-center gap-2 sm:gap-3">
                  <button
                    className="bg-white/50 h-7 w-7 sm:h-8 sm:w-8 rounded-full flex items-center justify-center shadow-sm"
                    onClick={() => handleDateChange(subDays(selectedDate, 1))}
                  >
                    <svg
                      width="14"
                      height="14"
                      className="sm:w-4 sm:h-4"
                      viewBox="0 0 16 16"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M10 3L5 8L10 13"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>

                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="h-8 sm:h-10 min-w-[160px] sm:min-w-[200px] justify-between bg-white shadow-sm border-gray-200 hover:bg-gray-50 hover:border-gray-300 text-xs sm:text-sm"
                      >
                        <div className="flex flex-col items-start">
                          <span className="text-xs sm:text-sm font-medium">
                            {format(selectedDate, "MMMM d, yyyy")}
                          </span>
                        </div>
                        <CalendarIcon className="h-3 w-3 sm:h-4 sm:w-4" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <div className="datepicker-container">
                        <style jsx global>{`
                          .react-datepicker {
                            font-size: 0.875rem;
                            border: 1px solid #e2e8f0;
                            border-radius: 0.5rem;
                          }
                          .react-datepicker__header {
                            padding-top: 0.75rem;
                          }
                          .react-datepicker__current-month {
                            font-size: 0.875rem;
                            margin-bottom: 0.375rem;
                          }
                          .react-datepicker__day-name {
                            width: 2rem;
                            font-size: 0.75rem;
                          }
                          .react-datepicker__day {
                            width: 2rem;
                            height: 2rem;
                            line-height: 2rem;
                            font-size: 0.875rem;
                            margin: 0.1rem;
                          }
                        `}</style>
                        <DatePicker
                          selected={selectedDate}
                          onChange={(date) => date && handleDateChange(date)}
                          dateFormat="MMMM d, yyyy"
                          inline
                        />
                      </div>
                    </PopoverContent>
                  </Popover>

                  <button
                    className="bg-white/50 h-7 w-7 sm:h-8 sm:w-8 rounded-full flex items-center justify-center shadow-sm"
                    onClick={() => handleDateChange(addDays(selectedDate, 1))}
                  >
                    <svg
                      width="14"
                      height="14"
                      className="sm:w-4 sm:h-4"
                      viewBox="0 0 16 16"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M6 3L11 8L6 13"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Calendar - Styled to match Figma design */}
              <div className="relative">
                {/* Time slots header - REMOVED AM/PM labels */}
                <div className="hidden sm:flex mb-6">
                  <div className="w-32 sm:w-40 flex-shrink-0"></div>
                  <div className="flex-1 grid grid-cols-10 gap-2">
                    {HOURS.map((hour) => (
                      <div
                        key={hour}
                        className="text-center text-sm font-medium text-gray-500"
                      >
                        {/* Empty div to maintain spacing but remove text */}
                        <div></div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Calendar Content */}
                <div className="overflow-x-auto">
  {calendarBookings.length === 0 ? (
    <div className="text-center py-12 sm:py-16 text-base sm:text-lg text-gray-500 bg-gray-50/50 rounded-xl">
      No bookings for {selectedDate.toLocaleDateString()}
    </div>
  ) : (
    <div className="space-y-4 sm:space-y-6">
      {/* Mobile: Card-based layout, Desktop: Timeline layout */}
      <div className="block sm:hidden">
        {/* Mobile Card Layout */}
        {calendarBookings.map((facilityGroup) => (
          <div key={facilityGroup.facilityId} className="mb-6">
            <h4 className="text-lg font-semibold text-gray-800 mb-3 px-1">
              {facilityGroup.facilityName}
            </h4>
            <div className="space-y-3">
              {facilityGroup.bookings.length === 0 ? (
                <div className="bg-gray-50 rounded-xl p-4 text-center text-gray-500">
                  No bookings for this facility
                </div>
              ) : (
                facilityGroup.bookings.map((booking) => {
                  const facilityTypeLabel =
                    facilityTypeNames[booking.facilityType] ||
                    booking.facilityType
                      .split("-")
                      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                      .join(" ");

                  const startDateInfo = formatDateFromDB(booking.startDate);
                  const endDateInfo = formatDateFromDB(booking.endDate);

                  return (
                    <div
                      key={booking._id}
                      className="rounded-xl p-4 text-white shadow-sm"
                      style={{
                        backgroundColor: facilityTypeColors[booking.facilityType] || "#22C55E",
                      }}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <span className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                            {booking.startupName?.[0] || "?"}
                          </span>
                          <div>
                            <h5 className="font-bold text-base">{booking.startupName}</h5>
                            <p className="text-sm opacity-90">{facilityTypeLabel}</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4 opacity-80" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                          </svg>
                          <span className="font-medium">
                            {startDateInfo.formattedTime} - {endDateInfo.formattedTime}
                          </span>
                        </div>
                        <div className="text-sm opacity-90">
                          {(() => {
                            const start = new Date(booking.startDate);
                            const end = new Date(booking.endDate);
                            const duration = Math.round((end.getTime() - start.getTime()) / (1000 * 60));
                            return duration >= 60 
                              ? `${Math.floor(duration / 60)}h ${duration % 60}m`
                              : `${duration}m`;
                          })()}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Desktop Timeline Layout */}
      <div className="hidden sm:block">
        {calendarBookings.map((facilityGroup) => (
          <div
            key={facilityGroup.facilityId}
            className="flex mb-4"
          >
            <div className="w-32 lg:w-40 pr-4 flex-shrink-0 flex items-center">
              <div className="text-base font-semibold truncate">
                {facilityGroup.facilityName}
              </div>
            </div>
            <div className="flex-1 relative h-16 bg-gray-50 rounded-2xl">
              {/* Display hours grid lines */}
              {HOURS.map((hour, index) => (
                <div
                  key={`line-${hour}`}
                  className="absolute top-0 bottom-0 w-px bg-gray-200"
                  style={{
                    left: `${(index / (HOURS.length - 1)) * 100}%`,
                  }}
                />
              ))}

              {/* Display bookings */}
              {facilityGroup.bookings.map((booking) => {
                const { left, width } = calculateTimeSlotPosition(
                  booking.startDate,
                  booking.endDate
                );

                // Skip rendering if the booking doesn't appear in the visible range
                if (width <= 0 || left >= 100) return null;

                const facilityTypeLabel =
                  facilityTypeNames[booking.facilityType] ||
                  booking.facilityType
                    .split("-")
                    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(" ");

                // Get properly formatted times
                const startDateInfo = formatDateFromDB(booking.startDate);
                const endDateInfo = formatDateFromDB(booking.endDate);

                return (
                  <div
                    key={booking._id}
                    className="absolute top-1/2 -translate-y-1/2 h-10 flex items-center justify-start rounded-xl text-white text-sm font-medium shadow-sm overflow-hidden"
                    style={{
                      left: `${left}%`,
                      width: `${width}%`,
                      backgroundColor: facilityTypeColors[booking.facilityType] || "#22C55E",
                    }}
                    title={`${booking.startupName} - ${facilityTypeLabel} - ${startDateInfo.formattedTime} to ${endDateInfo.formattedTime}`}
                  >
                    <div className="truncate px-3 flex items-center gap-2 w-full">
                      <span className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center text-xs flex-shrink-0">
                        {booking.startupName?.[0] || "?"}
                      </span>
                      <div className="flex flex-col min-w-0">
                        <span className="truncate text-xs font-bold">
                          {booking.startupName}
                        </span>
                        <span className="truncate text-[10px] font-normal opacity-80">
                          {startDateInfo.formattedTime} - {endDateInfo.formattedTime}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {/* Legend/time indicators at the bottom */}
        <div className="mt-6">
          <div className="flex">
            <div className="w-32 lg:w-40 flex-shrink-0"></div>
            <div className="flex-1 grid grid-cols-10 gap-4 text-center border-t pt-2">
              {HOURS.map((hour) => (
                <div
                  key={`hour-legend-${hour}`}
                  className="text-sm font-medium text-gray-400"
                >
                  {hour}:00
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )}
</div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "earnings" && (
          <div className="space-y-4 sm:space-y-5">
            {/* Top row: KPI Cards - Matched to the Booking Details tab style */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              {/* Total Earnings This Week Card - Green (matching first card from booking tab) */}
              <div className="p-4 sm:p-6 rounded-[20px] sm:rounded-[30px] bg-green-500 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-20 h-20 sm:w-32 sm:h-32 opacity-30">
                  <div className="w-full h-full rounded-bl-[40px] sm:rounded-bl-[80px] bg-white"></div>
                </div>
                <div className="flex flex-col gap-3 sm:gap-4">
                  <p className="text-sm sm:text-base font-medium">
                    This Week Earnings
                  </p>
                  <p className="text-2xl sm:text-4xl font-medium">
                    {formatCurrency(dailyEarningData.thisWeek)}
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="bg-white/20 rounded-full px-2 sm:px-3 py-1 text-xs sm:text-sm">
                      Last 7 days
                    </span>
                  </div>
                </div>
              </div>

              {/* Total Earnings This Month Card - White with gradient (matching second card from booking tab) */}
              <div className="p-4 sm:p-6 rounded-[20px] sm:rounded-[30px] bg-white text-black relative overflow-hidden">
                <div className="absolute top-0 right-0 w-20 h-20 sm:w-32 sm:h-32 opacity-10">
                  <div className="w-full h-full rounded-bl-[40px] sm:rounded-bl-[80px] bg-gradient-to-br from-[#FFF04B] to-[#22A146]"></div>
                </div>
                <div className="flex flex-col gap-3 sm:gap-4">
                  <p className="text-sm sm:text-base font-medium text-gray-700">
                    Total Earnings (All Time)
                  </p>
                  <p className="text-2xl sm:text-4xl font-medium">
                    {formatCurrency(earningsData.totalEarnings)}
                  </p>
                  <div className="flex items-center gap-2">
                    <div
                      className={`${monthlySummaryData.monthlyComparison >= 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"} px-2 py-1 rounded-full text-xs font-medium`}
                    >
                      Last 30 days:{" "}
                      {formatCurrency(earningsData.monthlyEarnings)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Pending Payouts Card - White with gradient (matching third card from booking tab) */}
              <div className="p-4 sm:p-6 rounded-[20px] sm:rounded-[30px] bg-white text-black relative overflow-hidden sm:col-span-2 lg:col-span-1">
                <div className="absolute top-0 right-0 w-20 h-20 sm:w-32 sm:h-32 opacity-10">
                  <div className="w-full h-full rounded-bl-[40px] sm:rounded-bl-[80px] bg-gradient-to-br from-[#FFF04B] to-[#22A146]"></div>
                </div>
                <div className="flex flex-col gap-3 sm:gap-4">
                  <p className="text-sm sm:text-base font-medium text-gray-700">
                    Pending Payouts
                  </p>
                  <p className="text-2xl sm:text-4xl font-medium">
                    {formatCurrency(earningsData.pendingPayouts)}
                  </p>
                  <div className="h-6">
                    {/* Empty div to match height of other cards */}
                  </div>
                </div>
              </div>
            </div>

            {/* Middle row: Graphs and Notifications */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5">
              {/* Left column: Both charts side by side */}
                <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
                {/* Monthly Earnings Chart */}
                <div className="bg-white rounded-[30px] p-6 shadow-sm border border-gray-100">
                  <h3 className="text-lg font-semibold mb-4 text-gray-800">
                    Monthly Earnings by Facility Type
                  </h3>

                  <div className="relative h-[320px] font-['Plus_Jakarta_Sans','Inter',sans-serif]">
                    {isLoading ? (
                      <div className="flex items-center justify-center h-full">
                        <Spinner size="lg" />
                      </div>
                    ) : (
                      /* Main Chart Container */
                      <div className="flex flex-col justify-center items-center p-2 w-full h-full">
                        {/* Chart & Axis */}
                        <div className="flex flex-col items-start w-full h-[255px]">
                          {/* Main Chart */}
                          <div className="flex flex-row items-center w-full h-[234px] relative">
                            {/* Y-Axis Left */}
                            <div className="flex flex-col justify-between items-end py-0 px-1 h-[234px] w-[34px]">
                              {Array.from({ length: 6 }).map((_, i) => {
                                const maxValue = calculateMaxValue();
                                const value = Math.round(
                                  (maxValue * (5 - i)) / 5
                                );
                                return (
                                  <span
                                    key={i}
                                    className="text-[10px] leading-[13px] text-black/70"
                                  >
                                    {i === 5
                                      ? "0"
                                      : `₹${value.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`}
                                  </span>
                                );
                              })}
                            </div>

                            {/* Graph & Grid */}
                            <div className="relative flex-1 h-[234px]">
                              {/* X Lines - Horizontal grid lines */}
                              <div className="absolute inset-0 flex flex-col justify-between items-start py-[6px] px-[1px]">
                                {Array.from({ length: 6 }).map((_, i) => (
                                  <div
                                    key={i}
                                    className={`w-full border-t ${i === 5 ? "border-solid border-black/50" : "border-dashed border-black/25"}`}
                                  ></div>
                                ))}
                              </div>

                              {/* Custom Line Chart Implementation */}
                              <div className="absolute inset-0 py-[7px]">
                                {facilityTypeEarnings.map(
                                  (facility, facilityIndex) => {
                                    const months = getLastSixMonths();
                                    const maxValue = calculateMaxValue();

                                    // Calculate positions for line segments and points
                                    const points = months.map(
                                      (month, index) => {
                                        const value =
                                          facility.monthlyData[month] || 0;
                                        const xPos =
                                          8.33 + (index * (100 - 2 * 8.33)) / 5; // Calculate x position (8.33% to 91.67%)
                                        const yPos =
                                          100 - (value / maxValue) * 95; // Calculate y position (5% to 100%)
                                        return { month, value, xPos, yPos };
                                      }
                                    );

                                    // Areas for gradient fills
                                    const topPosition = Math.min(
                                      ...points.map((p) => p.yPos)
                                    );

                                    return (
                                      <React.Fragment key={facility.name}>
                                        {/* Gradient Area */}
                                        <div
                                          className={`absolute left-[8.33%] right-[8.33%] bg-gradient-to-b`}
                                          style={{
                                            top: `${topPosition}%`,
                                            bottom: `0%`,
                                            background: `linear-gradient(180deg, ${facility.color}4D 0%, ${facility.color}0D 100%)`,
                                          }}
                                        ></div>

                                        {/* Line connecting points */}
                                        {points.slice(0, -1).map((point, i) => {
                                          const nextPoint = points[i + 1];
                                          return (
                                            <div
                                              key={i}
                                              className="absolute border-t-2 z-10"
                                              style={{
                                                left: `${point.xPos}%`,
                                                width: `${nextPoint.xPos - point.xPos}%`,
                                                top: `${point.yPos}%`,
                                                borderColor: facility.color,
                                              }}
                                            ></div>
                                          );
                                        })}

                                        {/* Data Points */}
                                        {points.map((point, i) => (
                                          <div
                                            key={i}
                                            className="absolute z-20"
                                            style={{
                                              left: `${point.xPos}%`,
                                              top: `${point.yPos}%`,
                                            }}
                                          >
                                            <div
                                              className="absolute w-4 h-4 -left-2 -top-2 opacity-25 rounded-full"
                                              style={{
                                                background: facility.color,
                                              }}
                                            ></div>
                                            <div
                                              className="absolute w-2 h-2 -left-1 -top-1 border border-white rounded-full"
                                              style={{
                                                background: facility.color,
                                              }}
                                            ></div>
                                          </div>
                                        ))}
                                      </React.Fragment>
                                    );
                                  }
                                )}
                              </div>
                            </div>
                          </div>

                          {/* X Axis */}
                          <div className="flex flex-row items-start pl-[31px] pb-2 w-full h-[23px]">
                            {getLastSixMonths().map((month, index) => (
                              <div
                                key={index}
                                className="flex-1 text-center text-[12px] text-black/70"
                              >
                                {month.split(" ")[0]}
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Legends */}
                        <div className="flex flex-row flex-wrap justify-center items-center w-full h-[24px]">
                          <div className="flex flex-row flex-wrap justify-center items-center px-2 gap-x-2 h-[24px]">
                            {facilityTypeEarnings.map((facility, index) => (
                              <div
                                key={index}
                                className="flex flex-row items-center p-1 gap-1 h-6"
                              >
                                <div className="relative w-4 h-4">
                                  <div
                                    className="absolute w-4 h-0.5 left-0 top-[7px]"
                                    style={{ background: facility.color }}
                                  ></div>
                                  <div
                                    className="absolute w-2 h-2 left-1 top-1 rounded-full border border-white"
                                    style={{ background: facility.color }}
                                  ></div>
                                  <div
                                    className="absolute w-4 h-4 left-0 top-0 rounded-full opacity-25"
                                    style={{ background: facility.color }}
                                  ></div>
                                </div>
                                <span className="text-[12px] text-black/70">
                                  {facility.name}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Top Facilities Chart */}
                <div className="bg-white rounded-[30px] p-6 shadow-sm border border-gray-100">
                  <h3 className="text-lg font-semibold mb-4 text-gray-800">
                    Top Facilities
                  </h3>

                  <div className="relative h-[320px] font-['Plus_Jakarta_Sans','Inter',sans-serif]">
                    {isLoading ? (
                      <div className="flex items-center justify-center h-full">
                        <Spinner size="lg" />
                      </div>
                    ) : (
                      /* Main Chart Container */
                      <div className="flex flex-col items-start p-2 w-full h-full">
                        {/* Chart & Axis */}
                        <div className="flex flex-col items-start w-full h-[265px]">
                          {/* Main Chart */}
                          <div className="flex flex-row items-center w-full h-[244px] relative">
                            {/* Y-Axis Left */}
                            <div className="flex flex-col justify-between items-end py-0 px-1 h-[244px] w-[25px]">
                              {Array.from({ length: 6 }).map((_, i) => {
                                const maxValue = calculateMaxBookingCount();
                                const value = Math.round(
                                  (maxValue * (5 - i)) / 5
                                );
                                return (
                                  <span
                                    key={i}
                                    className="text-[12px] leading-[15px] text-[#222222] font-normal"
                                  >
                                    {value}
                                  </span>
                                );
                              })}
                            </div>

                            {/* Graph & Grid */}
                            <div className="relative flex-1 h-[244px]">
                              {/* X Lines - Horizontal grid lines */}
                              <div className="absolute inset-0 flex flex-col justify-between items-start py-[6px] px-[1px]">
                                {Array.from({ length: 6 }).map((_, i) => (
                                  <div
                                    key={i}
                                    className={`w-full border-t ${i === 5 ? "border-solid border-black/50" : "border-dashed border-black/25"}`}
                                  ></div>
                                ))}
                              </div>

                              {/* Bar Chart Implementation */}
                              <div className="absolute inset-0 py-[6px]">
                                {facilityBookingCounts.length > 0 && (
                                  <div className="w-full h-full relative">
                                    {getLastSixMonths().map(
                                      (month, monthIndex) => {
                                        const maxValue =
                                          calculateMaxBookingCount();
                                        // Get the top facility for this month
                                        let topFacility: FacilityBookingCounts | null =
                                          null;
                                        let topBookingCount = 0;

                                        facilityBookingCounts.forEach(
                                          (facility) => {
                                            const bookingCount =
                                              facility.monthlyData[month] || 0;
                                            if (
                                              bookingCount > topBookingCount
                                            ) {
                                              topFacility = facility;
                                              topBookingCount = bookingCount;
                                            }
                                          }
                                        );

                                        if (
                                          !topFacility ||
                                          topBookingCount === 0
                                        )
                                          return null;

                                        // Calculate position for each month (evenly spaced)
                                        const xPos =
                                          8.33 +
                                          (monthIndex * (100 - 2 * 8.33)) / 5;
                                        // Calculate bar height based on booking count
                                        const barHeight =
                                          (topBookingCount / maxValue) * 100;

                                        // Determine gradient based on facility index
                                        const facilityIndex =
                                          facilityBookingCounts.findIndex(
                                            (f) =>
                                              topFacility !== null &&
                                              f.name === topFacility.name
                                          );
                                        const gradient =
                                          BAR_GRADIENTS[
                                            facilityIndex >= 0
                                              ? facilityIndex
                                              : 0
                                          ];

                                        return (
                                          <div
                                            key={month}
                                            className="absolute"
                                            style={{
                                              left: `${xPos - 8}%`,
                                              width: "16%",
                                              bottom: "0",
                                              height: `${barHeight}%`,
                                            }}
                                          >
                                            {/* Bar for this month */}
                                            <div
                                              className="absolute w-full rounded-[10px] opacity-70"
                                              style={{
                                                top: "0",
                                                bottom: "0",
                                                background: gradient,
                                              }}
                                            >
                                              {/* White overlay on left side */}
                                              <div
                                                className="absolute left-0 top-0 bottom-0 bg-white/30"
                                                style={{ width: "50%" }}
                                              ></div>

                                              {/* Booking count number */}
                                              {topBookingCount > 0 && (
                                                <div
                                                  className="absolute w-full flex justify-center items-center"
                                                  style={{ top: "20%" }}
                                                >
                                                  <span className="text-[30px] leading-[38px] font-semibold text-white">
                                                    {topBookingCount}
                                                  </span>
                                                </div>
                                              )}
                                            </div>
                                          </div>
                                        );
                                      }
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* X Axis */}
                          <div className="flex flex-row items-start pl-[19px] pb-2 w-full h-[23px]">
                            {getLastSixMonths().map((month, index) => (
                              <div
                                key={index}
                                className="flex-1 flex justify-center"
                              >
                                <span className="text-[12px] leading-[15px] font-medium text-[#222222]">
                                  {month.split(" ")[0]}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Legends */}
                        <div className="flex flex-row flex-wrap justify-center items-center w-full h-[24px]">
                          <div className="flex flex-row flex-wrap justify-center items-center px-2 gap-x-2 h-[24px]">
                            {facilityBookingCounts.map((facility, index) => (
                              <div
                                key={index}
                                className="flex flex-row items-center p-1 gap-1 h-6"
                              >
                                <div className="relative w-4 h-4">
                                  <div
                                    className="absolute w-2 h-2 left-1 top-1 rounded-none border border-white"
                                    style={{
                                      background:
                                        index === 0
                                          ? "#41C6FF"
                                          : index === 1
                                            ? "#4CFF58"
                                            : "#12A454",
                                    }}
                                  ></div>
                                </div>
                                <span className="text-[12px] leading-[15px] font-medium text-[#222222]">
                                  {facility.name}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Right column: Notifications */}
              <div className="bg-white rounded-[30px] p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-2xl font-bold">Bookings</h3>
                </div>

                <div className="space-y-5">
                  {recentNotifications.length > 0 ? (
                    <>
                      <div>
                        <h4 className="text-base font-semibold text-black/60 mb-2">
                          {formatNotificationDate(
                            recentNotifications[0].createdAt
                          )}
                        </h4>
                        <div className="space-y-4">
                          {recentNotifications.map((notification, index) => (
                            <div
                              key={notification._id || index}
                              className="flex items-start gap-6"
                            >
                              <div className="bg-green-100 p-2 rounded-lg">
                                <svg
                                  width="20"
                                  height="20"
                                  viewBox="0 0 20 20"
                                  fill="none"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <path
                                    d="M7.5 18.333H12.5C16.667 18.333 18.333 16.667 18.333 12.5V7.5C18.333 3.333 16.667 1.667 12.5 1.667H7.5C3.333 1.667 1.667 3.333 1.667 7.5V12.5C1.667 16.667 3.333 18.333 7.5 18.333Z"
                                    stroke="#22C55E"
                                    strokeWidth="1.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                  <path
                                    d="M7.5 9.167L9.167 10.833L12.5 7.5"
                                    stroke="#22C55E"
                                    strokeWidth="1.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                </svg>
                              </div>
                              <div className="flex-1">
                                <p className="text-lg font-semibold text-black/80">
                                  {notification.message ||
                                    `${notification.userName} has booked the ${notification.facilityName}`}
                                </p>
                                <p className="text-sm text-black/35 font-semibold mt-1">
                                  {new Date(
                                    notification.createdAt
                                  ).toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  ) : (
                    <p className="text-gray-500">
                      No recent booking notifications
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Bottom row: Calendar */}
            <div className="bg-white rounded-[20px] sm:rounded-[30px] p-4 sm:p-6 relative">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 gap-3 sm:gap-0">
                <h3 className="text-xl sm:text-2xl font-bold">
                  Booking Schedule
                </h3>
                <div className="flex items-center gap-2 sm:gap-3">
                  <button
                    className="bg-white/50 h-7 w-7 sm:h-8 sm:w-8 rounded-full flex items-center justify-center shadow-sm"
                    onClick={() => handleDateChange(subDays(selectedDate, 1))}
                  >
                    <svg
                      width="14"
                      height="14"
                      className="sm:w-4 sm:h-4"
                      viewBox="0 0 16 16"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M10 3L5 8L10 13"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>

                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="h-8 sm:h-10 min-w-[160px] sm:min-w-[200px] justify-between bg-white shadow-sm border-gray-200 hover:bg-gray-50 hover:border-gray-300 text-xs sm:text-sm"
                      >
                        <div className="flex flex-col items-start">
                          <span className="text-xs sm:text-sm font-medium">
                            {format(selectedDate, "MMMM d, yyyy")}
                          </span>
                        </div>
                        <CalendarIcon className="h-3 w-3 sm:h-4 sm:w-4" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <div className="datepicker-container">
                        <style jsx global>{`
                          .react-datepicker {
                            font-size: 0.875rem;
                            border: 1px solid #e2e8f0;
                            border-radius: 0.5rem;
                          }
                          .react-datepicker__header {
                            padding-top: 0.75rem;
                          }
                          .react-datepicker__current-month {
                            font-size: 0.875rem;
                            margin-bottom: 0.375rem;
                          }
                          .react-datepicker__day-name {
                            width: 2rem;
                            font-size: 0.75rem;
                          }
                          .react-datepicker__day {
                            width: 2rem;
                            height: 2rem;
                            line-height: 2rem;
                            font-size: 0.875rem;
                            margin: 0.1rem;
                          }
                        `}</style>
                        <DatePicker
                          selected={selectedDate}
                          onChange={(date) => date && handleDateChange(date)}
                          dateFormat="MMMM d, yyyy"
                          inline
                        />
                      </div>
                    </PopoverContent>
                  </Popover>

                  <button
                    className="bg-white/50 h-7 w-7 sm:h-8 sm:w-8 rounded-full flex items-center justify-center shadow-sm"
                    onClick={() => handleDateChange(addDays(selectedDate, 1))}
                  >
                    <svg
                      width="14"
                      height="14"
                      className="sm:w-4 sm:h-4"
                      viewBox="0 0 16 16"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M6 3L11 8L6 13"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Calendar - Styled to match Figma design */}
              <div className="relative">
                {/* Time slots header - REMOVED AM/PM labels */}
                <div className="hidden sm:flex mb-6">
                  <div className="w-32 sm:w-40 flex-shrink-0"></div>
                  <div className="flex-1 grid grid-cols-10 gap-2">
                    {HOURS.map((hour) => (
                      <div
                        key={hour}
                        className="text-center text-sm font-medium text-gray-500"
                      >
                        {/* Empty div to maintain spacing but remove text */}
                        <div></div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Calendar Content */}
              <div className="overflow-x-auto">
  {calendarBookings.length === 0 ? (
    <div className="text-center py-12 sm:py-16 text-base sm:text-lg text-gray-500 bg-gray-50/50 rounded-xl">
      No bookings for {selectedDate.toLocaleDateString()}
    </div>
  ) : (
    <div className="space-y-4 sm:space-y-6">
      {/* Mobile: Card-based layout, Desktop: Timeline layout */}
      <div className="block sm:hidden">
        {/* Mobile Card Layout */}
        {calendarBookings.map((facilityGroup) => (
          <div key={facilityGroup.facilityId} className="mb-6">
            <h4 className="text-lg font-semibold text-gray-800 mb-3 px-1">
              {facilityGroup.facilityName}
            </h4>
            <div className="space-y-3">
              {facilityGroup.bookings.length === 0 ? (
                <div className="bg-gray-50 rounded-xl p-4 text-center text-gray-500">
                  No bookings for this facility
                </div>
              ) : (
                facilityGroup.bookings.map((booking) => {
                  const facilityTypeLabel =
                    facilityTypeNames[booking.facilityType] ||
                    booking.facilityType
                      .split("-")
                      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                      .join(" ");

                  const startDateInfo = formatDateFromDB(booking.startDate);
                  const endDateInfo = formatDateFromDB(booking.endDate);

                  return (
                    <div
                      key={booking._id}
                      className="rounded-xl p-4 text-white shadow-sm"
                      style={{
                        backgroundColor: facilityTypeColors[booking.facilityType] || "#22C55E",
                      }}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <span className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                            {booking.startupName?.[0] || "?"}
                          </span>
                          <div>
                            <h5 className="font-bold text-base">{booking.startupName}</h5>
                            <p className="text-sm opacity-90">{facilityTypeLabel}</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4 opacity-80" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                          </svg>
                          <span className="font-medium">
                            {startDateInfo.formattedTime} - {endDateInfo.formattedTime}
                          </span>
                        </div>
                        <div className="text-sm opacity-90">
                          {(() => {
                            const start = new Date(booking.startDate);
                            const end = new Date(booking.endDate);
                            const duration = Math.round((end.getTime() - start.getTime()) / (1000 * 60));
                            return duration >= 60 
                              ? `${Math.floor(duration / 60)}h ${duration % 60}m`
                              : `${duration}m`;
                          })()}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Desktop Timeline Layout */}
      <div className="hidden sm:block">
        {calendarBookings.map((facilityGroup) => (
          <div
            key={facilityGroup.facilityId}
            className="flex mb-4"
          >
            <div className="w-32 lg:w-40 pr-4 flex-shrink-0 flex items-center">
              <div className="text-base font-semibold truncate">
                {facilityGroup.facilityName}
              </div>
            </div>
            <div className="flex-1 relative h-16 bg-gray-50 rounded-2xl">
              {/* Display hours grid lines */}
              {HOURS.map((hour, index) => (
                <div
                  key={`line-${hour}`}
                  className="absolute top-0 bottom-0 w-px bg-gray-200"
                  style={{
                    left: `${(index / (HOURS.length - 1)) * 100}%`,
                  }}
                />
              ))}

              {/* Display bookings */}
              {facilityGroup.bookings.map((booking) => {
                const { left, width } = calculateTimeSlotPosition(
                  booking.startDate,
                  booking.endDate
                );

                // Skip rendering if the booking doesn't appear in the visible range
                if (width <= 0 || left >= 100) return null;

                const facilityTypeLabel =
                  facilityTypeNames[booking.facilityType] ||
                  booking.facilityType
                    .split("-")
                    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(" ");

                // Get properly formatted times
                const startDateInfo = formatDateFromDB(booking.startDate);
                const endDateInfo = formatDateFromDB(booking.endDate);

                return (
                  <div
                    key={booking._id}
                    className="absolute top-1/2 -translate-y-1/2 h-10 flex items-center justify-start rounded-xl text-white text-sm font-medium shadow-sm overflow-hidden"
                    style={{
                      left: `${left}%`,
                      width: `${width}%`,
                      backgroundColor: facilityTypeColors[booking.facilityType] || "#22C55E",
                    }}
                    title={`${booking.startupName} - ${facilityTypeLabel} - ${startDateInfo.formattedTime} to ${endDateInfo.formattedTime}`}
                  >
                    <div className="truncate px-3 flex items-center gap-2 w-full">
                      <span className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center text-xs flex-shrink-0">
                        {booking.startupName?.[0] || "?"}
                      </span>
                      <div className="flex flex-col min-w-0">
                        <span className="truncate text-xs font-bold">
                          {booking.startupName}
                        </span>
                        <span className="truncate text-[10px] font-normal opacity-80">
                          {startDateInfo.formattedTime} - {endDateInfo.formattedTime}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {/* Legend/time indicators at the bottom */}
        <div className="mt-6">
          <div className="flex">
            <div className="w-32 lg:w-40 flex-shrink-0"></div>
            <div className="flex-1 grid grid-cols-10 gap-4 text-center border-t pt-2">
              {HOURS.map((hour) => (
                <div
                  key={`hour-legend-${hour}`}
                  className="text-sm font-medium text-gray-400"
                >
                  {hour}:00
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )}
</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
