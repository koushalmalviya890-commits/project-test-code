"use client";
// import { useSession } from "next-auth/react";
import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import { format } from "date-fns";
import { Pencil, CalendarIcon, Plus, Check } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { toast } from "sonner";
import Link from "next/link";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FacilityForm } from "@/components/forms/facility-form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AddFacilityDialog } from "@/components/dialogs/add-facility-dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import ReviewsDialog from "@/components/dialogs/getreviews-dialog";
interface Facility {
  _id: string;
  details: {
    name: string;
    images: string[];
    rentalPlans?: {
      name: string;
      price: number;
      duration: string;
    }[];
  };
  facilityType: FacilityType;
  createdAt: string;
  updatedAt: string;
  status: string;
  address: string;
  city: string;
  pincode: string;
  state: string;
  country: string;
  timings?: {
    monday: { isOpen: boolean; openTime: string; closeTime: string };
    tuesday: { isOpen: boolean; openTime: string; closeTime: string };
    wednesday: { isOpen: boolean; openTime: string; closeTime: string };
    thursday: { isOpen: boolean; openTime: string; closeTime: string };
    friday: { isOpen: boolean; openTime: string; closeTime: string };
    saturday: { isOpen: boolean; openTime: string; closeTime: string };
    sunday: { isOpen: boolean; openTime: string; closeTime: string };
  };
  isFeatured?: boolean;
  serviceProviderId: string;
  privacyType?: string; // Optional field for privacy type
}

type FacilityType =
  | "bio-allied-labs"
  | "manufacturing-labs"
  | "prototyping-labs"
  | "raw-space-office"
  | "raw-space-lab"
  | "software"
  | "saas-allied"
  | "individual-cabin"
  | "coworking-spaces"
  | "meeting-rooms"
  | "studio"
  | "event-workspace";

interface KPIData {
  totalFacilities: number;
  activeFacilities: number;
  inactiveFacilities: number;
  approvedFacilities: number;
  pendingFacilities: number;
}

export default function MyFacilities() {
  const router = useRouter();
  // const { data: session, status } = useSession();
  const { user, loading, logout } = useAuth();
  const status = loading ? "loading" : user ? "authenticated" : "unauthenticated";
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [allFacilities, setAllFacilities] = useState<Facility[]>([]);
  const [kpiData, setKpiData] = useState<KPIData>({
    totalFacilities: 0,
    activeFacilities: 0,
    inactiveFacilities: 0,
    approvedFacilities: 0,
    pendingFacilities: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFacility, setSelectedFacility] = useState<Facility | null>(
    null
  );
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [facilityToDelete, setFacilityToDelete] = useState<string | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<string>("All Time");
  const [error, setError] = useState<string | null>(null);
  const [statusUpdateFacilityId, setStatusUpdateFacilityId] = useState<
    string | null
  >(null);
  const [selectedStatus, setSelectedStatus] = useState<string>("active");
  const [isStatusPopoverOpen, setIsStatusPopoverOpen] = useState(false);

  useEffect(() => {
    if (allFacilities.length === 0) return;

    const now = new Date();
    let filteredFacilities: Facility[] = [];

    // Filter facilities based on selectedMonth
    switch (selectedMonth) {
      case "This Month":
        const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        filteredFacilities = allFacilities.filter(
          (facility) => new Date(facility.createdAt) >= startOfThisMonth
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
        filteredFacilities = allFacilities.filter((facility) => {
          const createdDate = new Date(facility.createdAt);
          return (
            createdDate >= startOfLastMonth && createdDate <= endOfLastMonth
          );
        });
        break;

      case "All Time":
      default:
        filteredFacilities = [...allFacilities];
        break;
    }

    setFacilities(filteredFacilities);

    // Calculate metrics based on all facilities..
    setKpiData({
      totalFacilities: allFacilities.length,
      activeFacilities: allFacilities.filter((f) => f.status === "active")
        .length,
      inactiveFacilities: allFacilities.filter((f) => f.status === "inactive")
        .length,
      approvedFacilities: allFacilities.filter((f) => f.status === "active")
        .length, // Approved is same as active
      pendingFacilities: allFacilities.filter((f) => f.status === "pending")
        .length,
    });
  }, [selectedMonth, allFacilities]);

  const fetchFacilities = async () => {
    try {
      if (!user?.id) return; // Guard clause

      setIsLoading(true);
      const response = await fetch("/api/facilities");

      if (!response.ok) {
        const errorText = await response.text();
        console.error("API Error:", errorText);
        throw new Error(errorText || "Failed to fetch facilities");
      }

      const data = await response.json();
      setAllFacilities(data);
    } catch (error) {
      console.error("Error fetching facilities:", error);
      setError(
        error instanceof Error ? error.message : "Failed to load facilities"
      );
      setAllFacilities([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (status === "loading") return; // Don't fetch while loading
    if (status === "unauthenticated") return; // Don't fetch if not authenticated

    fetchFacilities();
  }, [user?.id, loading]);

  const handleEdit = async (facility: Facility) => {
    try {
     // console.log("Fetching facility details for:", facility._id);
      const response = await fetch(`/api/facilities/${facility._id}`);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Failed to fetch facility details:", errorText);
        throw new Error("Failed to fetch facility details");
      }

      const data = await response.json();
     // console.log("Received facility data:", data);

      if (!data || !data.details) {
        console.error("Invalid facility data received:", data);
        throw new Error("Invalid facility data received");
      }

      // Check if timings data exists
     // console.log("Facility timings data:", data.timings);

      // Create proper rental plans array if it doesn't exist
      const rentalPlans =
        data.details.rentalPlans?.map((plan: any) => ({
          name: plan.name,
          price: plan.price,
          duration: plan.duration,
        })) || [];

      // Make sure we have all required fields for the form
      const formattedData: any = {
        _id: data._id,
        facilityType: data.facilityType,
        name: data.details.name,
        description: data.details.description,
        images: data.details.images || [],
        videoLink: data.details.videoLink || "",
        rentalPlans,
        address: data.address,
        city: data.city,
        pincode: data.pincode,
        email: data.email,
        privacyType: data.privacyType,

        state: data.state,
        country: data.country,
        relevantSectors: data.relevantSectors || [],
        timings: data.timings || {
          monday: { isOpen: false, openTime: "", closeTime: "" },
          tuesday: { isOpen: false, openTime: "", closeTime: "" },
          wednesday: { isOpen: false, openTime: "", closeTime: "" },
          thursday: { isOpen: false, openTime: "", closeTime: "" },
          friday: { isOpen: false, openTime: "", closeTime: "" },
          saturday: { isOpen: false, openTime: "", closeTime: "" },
          sunday: { isOpen: false, openTime: "", closeTime: "" },
        },
      };

      // Add facility type-specific fields
      switch (data.facilityType) {
        case "saas-allied":
        case "software":
        case "bio-allied-labs":
        case "manufacturing-labs":
        case "prototyping-labs":
          formattedData.equipment = data.details.equipment || [];
          break;
        case "individual-cabin":
          formattedData.totalCabins = data.details.totalCabins;
          formattedData.availableCabins = data.details.availableCabins;
          break;
        case "coworking-spaces":
          formattedData.totalSeats = data.details.totalSeats;
          formattedData.availableSeats = data.details.availableSeats;
          break;
        case "meeting-rooms":
          formattedData.totalRooms = data.details.totalRooms;
          formattedData.seatingCapacity = data.details.seatingCapacity;
          formattedData.totalTrainingRoomSeaters =
            data.details.totalTrainingRoomSeaters;
          break;
        case "raw-space-office":
        case "raw-space-lab":
          formattedData.areaDetails = data.details.areaDetails || [];
          break;
        case "studio":
          formattedData.studioDetails = data.details.studioDetails;
          break;
        case "event-workspace":
          formattedData.seatingCapacity = data.details.seatingCapacity;
          break;
      }

     // console.log("Formatted data for form:", formattedData);
      setSelectedFacility(formattedData);
      setIsEditDialogOpen(true);
    } catch (error) {
      console.error("Error in handleEdit:", error);
      toast.error("Failed to load facility details");
    }
  };

  const handleEditSubmit = async (formData: any) => {
   // console.log("Submit", formData);

    if (!selectedFacility) return;

    try {
     // console.log(
      //   "Form data received in handleEditSubmit:",
      //   JSON.stringify(formData, null, 2)
      // );

      // First, fetch the current facility data again to make sure we have the most recent version
      const fetchResponse = await fetch(
        `/api/facilities/${selectedFacility._id}`
      );
      if (!fetchResponse.ok) {
        throw new Error("Failed to fetch current facility data");
      }

      const currentFacility = await fetchResponse.json();
     // console.log("Current facility data:", currentFacility);

      // We need to create a proper details object that matches the schema
      const updatedDetails: any = {
        // IMPORTANT: Always ensure all fields are set with proper fallbacks
        name:
          formData.name ||
          formData.details?.name ||
          currentFacility.details.name,
        description:
          formData.description ||
          formData.details?.description ||
          currentFacility.details.description,
        images:
          formData.images &&
          Array.isArray(formData.images) &&
          formData.images.length > 0
            ? formData.images
            : formData.details?.images || currentFacility.details.images,
        videoLink:
          formData.videoLink !== undefined
            ? formData.videoLink
            : formData.details?.videoLink ||
              currentFacility.details.videoLink ||
              "",
      };

      // Process rental plans correctly
      let rentalPlans: any[] = [];

      if (
        "selectedRentalPlans" in formData &&
        Array.isArray(formData.selectedRentalPlans) &&
        formData.selectedRentalPlans.length > 0
      ) {
        // Build rental plans from individual fields
        if (
          formData.selectedRentalPlans.includes("Annual") &&
          formData.rentPerYear
        ) {
          rentalPlans.push({
            name: "Annual",
            price: Number(formData.rentPerYear),
            duration: "Annual",
          });
        }

        if (
          formData.selectedRentalPlans.includes("Monthly") &&
          formData.rentPerMonth
        ) {
          rentalPlans.push({
            name: "Monthly",
            price: Number(formData.rentPerMonth),
            duration: "Monthly",
          });
        }

        if (
          formData.selectedRentalPlans.includes("Weekly") &&
          formData.rentPerWeek
        ) {
          rentalPlans.push({
            name: "Weekly",
            price: Number(formData.rentPerWeek),
            duration: "Weekly",
          });
        }

        if (
          formData.selectedRentalPlans.includes("One Day (24 Hours)") &&
          formData.dayPassRent
        ) {
          rentalPlans.push({
            name: "One Day (24 Hours)",
            price: Number(formData.dayPassRent),
            duration: "One Day (24 Hours)",
          });
        }

        if (
          formData.selectedRentalPlans.includes("Hourly") &&
          formData.hourlyRent
        ) {
          rentalPlans.push({
            name: "Hourly",
            price: Number(formData.hourlyRent),
            duration: "Hourly",
          });
        }
      } else if (
        formData.details?.rentalPlans &&
        Array.isArray(formData.details.rentalPlans) &&
        formData.details.rentalPlans.length > 0
      ) {
        // Use rental plans from details object if available
        rentalPlans = formData.details.rentalPlans;
      } else if (
        formData.rentalPlans &&
        Array.isArray(formData.rentalPlans) &&
        formData.rentalPlans.length > 0
      ) {
        // Use direct rental plans array
        rentalPlans = formData.rentalPlans;
      } else {
        // Fall back to current rental plans
        rentalPlans = currentFacility.details.rentalPlans || [];
      }

      // Ensure rental plans have the required structure
      if (rentalPlans.length === 0) {
        throw new Error("At least one rental plan is required");
      }

      // Make sure all rental plans have proper fields and types
      rentalPlans = rentalPlans.map((plan: any) => ({
        name: plan.name,
        price: Number(plan.price),
        duration: plan.duration,
      }));

      updatedDetails.rentalPlans = rentalPlans;

      // Add facility type-specific fields to details object based on facility type
      const facilityType = currentFacility.facilityType;

      switch (facilityType) {
        case "saas-allied":
        case "software":
        case "bio-allied-labs":
        case "manufacturing-labs":
        case "prototyping-labs":
          // For equipment-based facilities
          const equipment =
            formData.equipment &&
            Array.isArray(formData.equipment) &&
            formData.equipment.length > 0
              ? formData.equipment
              : formData.details?.equipment &&
                  Array.isArray(formData.details.equipment) &&
                  formData.details.equipment.length > 0
                ? formData.details.equipment
                : currentFacility.details.equipment || [];

          if (equipment.length === 0) {
            throw new Error(
              `At least one equipment item is required for ${facilityType}`
            );
          }
          updatedDetails.equipment = equipment;
          break;

        case "individual-cabin":
          updatedDetails.totalCabins =
            formData.totalCabins !== undefined
              ? Number(formData.totalCabins)
              : formData.details?.totalCabins !== undefined
                ? Number(formData.details.totalCabins)
                : currentFacility.details.totalCabins;

          updatedDetails.availableCabins =
            formData.availableCabins !== undefined
              ? Number(formData.availableCabins)
              : formData.details?.availableCabins !== undefined
                ? Number(formData.details.availableCabins)
                : currentFacility.details.availableCabins;
          break;

        case "coworking-spaces":
          updatedDetails.totalSeats =
            formData.totalSeats !== undefined
              ? Number(formData.totalSeats)
              : formData.details?.totalSeats !== undefined
                ? Number(formData.details.totalSeats)
                : currentFacility.details.totalSeats;

          updatedDetails.availableSeats =
            formData.availableSeats !== undefined
              ? Number(formData.availableSeats)
              : formData.details?.availableSeats !== undefined
                ? Number(formData.details.availableSeats)
                : currentFacility.details.availableSeats;
          break;

        case "meeting-rooms":
          updatedDetails.totalRooms =
            formData.totalRooms !== undefined
              ? Number(formData.totalRooms)
              : formData.details?.totalRooms !== undefined
                ? Number(formData.details.totalRooms)
                : currentFacility.details.totalRooms;

          updatedDetails.seatingCapacity =
            formData.seatingCapacity !== undefined
              ? Number(formData.seatingCapacity)
              : formData.details?.seatingCapacity !== undefined
                ? Number(formData.details.seatingCapacity)
                : currentFacility.details.seatingCapacity;

          updatedDetails.totalTrainingRoomSeaters =
            formData.totalTrainingRoomSeaters !== undefined
              ? Number(formData.totalTrainingRoomSeaters)
              : formData.details?.totalTrainingRoomSeaters !== undefined
                ? Number(formData.details.totalTrainingRoomSeaters)
                : currentFacility.details.totalTrainingRoomSeaters;
          break;

        case "raw-space-office":
        case "raw-space-lab":
          const areaDetails =
            formData.areaDetails &&
            Array.isArray(formData.areaDetails) &&
            formData.areaDetails.length > 0
              ? formData.areaDetails
              : formData.details?.areaDetails &&
                  Array.isArray(formData.details.areaDetails) &&
                  formData.details.areaDetails.length > 0
                ? formData.details.areaDetails
                : currentFacility.details.areaDetails || [];

          if (areaDetails.length === 0) {
            throw new Error(
              `At least one area detail is required for ${facilityType}`
            );
          }
          updatedDetails.areaDetails = areaDetails;
          break;

        case "studio":
          updatedDetails.studioDetails = formData.studioDetails
            ? formData.studioDetails
            : formData.details?.studioDetails
              ? formData.details.studioDetails
              : currentFacility.details.studioDetails;

          if (!updatedDetails.studioDetails) {
            throw new Error(
              "Studio details are required for studio facility type"
            );
          }
          break;
        case "event-workspace":
          updatedDetails.seatingCapacity =
            formData.seatingCapacity !== undefined
              ? Number(formData.seatingCapacity)
              : formData.details?.seatingCapacity !== undefined
                ? Number(formData.details.seatingCapacity)
                : currentFacility.details.seatingCapacity;
          break;
      }

      // Build timings object ensuring it has all required fields
      const timings = formData.timings
        ? formData.timings
        : formData.details?.timings
          ? formData.details.timings
          : currentFacility.timings || {
              monday: { isOpen: false, openTime: "", closeTime: "" },
              tuesday: { isOpen: false, openTime: "", closeTime: "" },
              wednesday: { isOpen: false, openTime: "", closeTime: "" },
              thursday: { isOpen: false, openTime: "", closeTime: "" },
              friday: { isOpen: false, openTime: "", closeTime: "" },
              saturday: { isOpen: false, openTime: "", closeTime: "" },
              sunday: { isOpen: false, openTime: "", closeTime: "" },
            };

      // Make sure each day has isOpen defined
      for (const day of [
        "monday",
        "tuesday",
        "wednesday",
        "thursday",
        "friday",
        "saturday",
        "sunday",
      ]) {
        if (!timings[day]) {
          timings[day] = { isOpen: false, openTime: "", closeTime: "" };
        } else if (timings[day].isOpen === undefined) {
          timings[day].isOpen = false;
        }
      }

      // Create the final payload exactly matching the schema structure
      const payload = {
        // Keep the service provider ID from the original facility
        serviceProviderId: currentFacility.serviceProviderId,

        // Facility type and status
        facilityType: currentFacility.facilityType,
        status: "pending", // Always pending after edit

        // Updated or preserved details object
        details: updatedDetails,

        // Address fields
        address: formData.address || currentFacility.address,
        city: formData.city || currentFacility.city,
        pincode: formData.pincode || currentFacility.pincode,
        state: formData.state || currentFacility.state,
        country: formData.country || currentFacility.country,
        privacyType: formData.privacyType || currentFacility.privacyType,

        email: formData.email || currentFacility.email,
        relevantSectors:
          formData.relevantSectors || currentFacility.releventSectors,
        // Ensure the isFeatured field is present
        isFeatured:
          currentFacility.isFeatured !== undefined
            ? currentFacility.isFeatured
            : false,

        // Include createdAt from the original facility (the server will convert it to a Date object)
        createdAt: currentFacility.createdAt,

        // Timing information
        timings: timings,
      };

     // console.log(
      //   "Final payload being sent:",
      //   JSON.stringify(payload, null, 2)
      // );

      const response = await fetch(`/api/facilities/${selectedFacility._id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      // Process the response
      if (response.ok) {
        // Parse JSON response
        const updatedFacility = await response.json();
       // console.log("Successfully updated facility:", updatedFacility);

        // Update local state immediately with the updated facility
        setAllFacilities((prevFacilities) =>
          prevFacilities.map((facility) =>
            facility._id === selectedFacility._id ? updatedFacility : facility
          )
        );

        toast.success("Facility updated successfully");
        setIsEditDialogOpen(false);

        // Fetch all facilities after a delay to ensure database consistency
        setTimeout(() => {
          fetchFacilities();
        }, 500);
      } else {
        // Handle error response
        const errorText = await response.text();
        let errorMessage = "Failed to update facility";

        try {
          // Try to parse the error response as JSON
          const errorData = JSON.parse(errorText);
          console.error("Update failed:", errorData);

          if (errorData.error) {
            errorMessage = errorData.error;

            // If we have detailed validation errors, show them
            if (errorData.field && errorData.message) {
              errorMessage += `: ${errorData.message} (Field: ${errorData.field})`;
            } else if (errorData.details) {
              if (Array.isArray(errorData.details)) {
                // Format the array of validation errors
                const detailsText = errorData.details
                  .map((detail: any) => {
                    if (detail.failingField && detail.missingProperties) {
                      return `${detail.failingField}: Missing ${detail.missingProperties.join(", ")}`;
                    }
                    return detail.reason || JSON.stringify(detail);
                  })
                  .join("; ");

                if (detailsText) {
                  errorMessage += ` - ${detailsText}`;
                }
              } else if (typeof errorData.details === "string") {
                errorMessage += ` - ${errorData.details}`;
              }
            }
          }
        } catch (parseError) {
          console.error("Failed to parse error response:", parseError);
          errorMessage += ` (${errorText})`;
        }

        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error("Error updating facility:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to update facility"
      );
    }
  };

  // Function to handle status change
  const handleStatusChange = async (facilityId: string, newStatus: string) => {
    try {
      const facility = facilities.find((f) => f._id === facilityId);
      if (!facility) return;

      const response = await fetch(`/api/facilities/${facilityId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        toast.success(
          `Facility ${newStatus === "active" ? "activated" : "deactivated"} successfully`
        );
        // Update local state to reflect the change immediately
        setAllFacilities((prev) =>
          prev.map((f) =>
            f._id === facilityId ? { ...f, status: newStatus } : f
          )
        );
        setIsStatusPopoverOpen(false);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to update facility status`);
      }
    } catch (error) {
      console.error("Error updating facility status:", error);
      toast.error("Failed to update facility status");
    }
  };

  // Function to handle opening the status popover
  const openStatusPopover = (facility: Facility) => {
    setStatusUpdateFacilityId(facility._id);
    setSelectedStatus(facility.status);
    setIsStatusPopoverOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-8 py-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-4xl font-bold text-[#1A1A1A]">My Facilities</h1>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <h3 className="text-red-800 text-lg font-medium mb-2">
            Error Loading Facilities
          </h3>
          <p className="text-red-600">{error}</p>
          <Button
            className="mt-4 bg-red-600 hover:bg-red-700"
            onClick={() => {
              setError(null);
              setIsLoading(true);
              fetchFacilities();
            }}
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  // Status badge colors
  const statusColors: Record<string, string> = {
    active: "bg-green-100 text-green-800",
    inactive: "bg-gray-100 text-gray-800",
    pending: "bg-blue-100 text-blue-800",
    rejected: "bg-yellow-100 text-yellow-800",
  };

  const getStatusBadge = (facility: Facility) => {
    const normalizedStatus = facility.status.toLowerCase();
    const cssClass =
      statusColors[normalizedStatus] || "bg-gray-100 text-gray-800";

    // Transform the status text for display (capitalize first letter of each word)
    const displayStatus = facility.status
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");

    // Only active and inactive facilities can have their status toggled
    const canToggleStatus =
      normalizedStatus === "active" || normalizedStatus === "inactive";

    if (!canToggleStatus) {
      // For pending and rejected facilities, return a non-interactive badge
      return (
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium ${cssClass}`}
        >
          {displayStatus}
        </span>
      );
    }

    // For active and inactive facilities, return an interactive popover
    return (
      <Popover
        open={isStatusPopoverOpen && statusUpdateFacilityId === facility._id}
        onOpenChange={(open) => {
          if (open) {
            setStatusUpdateFacilityId(facility._id);
            setSelectedStatus(facility.status);
          }
          setIsStatusPopoverOpen(open);
        }}
      >
        <PopoverTrigger asChild>
          <button
            className={`px-3 py-1 rounded-full text-xs font-medium ${cssClass} hover:opacity-80 transition-opacity cursor-pointer`}
          >
            {displayStatus}
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-6 rounded-xl shadow-md border-0">
          <div className="space-y-8">
            <h3 className="text-xl font-semibold text-gray-700">
              Change Status
            </h3>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div
                  className={`w-6 h-6 rounded flex items-center justify-center cursor-pointer ${
                    selectedStatus === "active"
                      ? "bg-green-500 text-white"
                      : "border border-gray-300"
                  }`}
                  onClick={() => setSelectedStatus("active")}
                >
                  {selectedStatus === "active" && <Check className="h-4 w-4" />}
                </div>
                <span className="text-lg font-medium">Active</span>
              </div>

              <div className="flex items-center gap-3">
                <div
                  className={`w-6 h-6 rounded flex items-center justify-center cursor-pointer ${
                    selectedStatus === "inactive"
                      ? "bg-green-500 text-white"
                      : "border border-gray-300"
                  }`}
                  onClick={() => setSelectedStatus("inactive")}
                >
                  {selectedStatus === "inactive" && (
                    <Check className="h-4 w-4" />
                  )}
                </div>
                <span className="text-lg font-medium">InActive</span>
              </div>
            </div>

            <Button
              className="w-full bg-gray-900 hover:bg-black text-white font-medium py-3 rounded-md"
              onClick={() =>
                handleStatusChange(statusUpdateFacilityId!, selectedStatus)
              }
            >
              Save Changes
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    );
  };

  // Function to safely parse dates
  const safelyParseDate = (dateString: string | undefined) => {
    if (!dateString) return new Date(); // Return current date as fallback
    try {
      return new Date(dateString);
    } catch (error) {
      console.error("Error parsing date:", dateString, error);
      return new Date(); // Return current date if parsing fails
    }
  };

  // Function to format facility type for display
  const formatFacilityType = (type: string): string => {
    // Convert hyphenated facility type to title case
    return type
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  // Function to get the best price from rental plans based on priority
  const getBestPrice = (facility: Facility): string => {
    const rentalPlans = facility.details.rentalPlans || [];

    if (rentalPlans.length === 0) {
      return "N/A";
    }

    // Priority: Monthly > Hourly > Daily > Yearly > Weekly
    const priorityOrder = [
      "Monthly",
      "Hourly",
      "One Day (24 Hours)",
      "Annual",
      "Weekly",
    ];

    let selectedPlan = rentalPlans[0]; // Default to first plan if no priority match

    // Try to find plans by priority
    for (const planType of priorityOrder) {
      const matchingPlan = rentalPlans.find((plan) => plan.name === planType);
      if (matchingPlan) {
        selectedPlan = matchingPlan;
        break; // Found highest priority plan
      }
    }

    // Format price with appropriate label
    const price = selectedPlan.price.toLocaleString("en-IN");
    let suffix = "";

    switch (selectedPlan.name) {
      case "Monthly":
        suffix = "/month";
        break;
      case "Hourly":
        suffix = "/hour";
        break;
      case "One Day (24 Hours)":
        suffix = "/day";
        break;
      case "Annual":
        suffix = "/year";
        break;
      case "Weekly":
        suffix = "/week";
        break;
    }

    return `₹${price}${suffix}`;
  };

  return (
    <div className="px-4 md:px-8 py-6 space-y-6">
      {/* Header with title and actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#1A1A1A]">
          My Facilities
        </h1>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 w-full sm:w-auto">
          <div className="flex items-center rounded-md border border-gray-200 bg-white w-full sm:w-auto">
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 text-gray-500 flex-shrink-0"
            >
              <CalendarIcon className="h-5 w-5" />
            </Button>
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger className="border-0 w-full sm:w-[150px] h-10 focus:ring-0">
                <SelectValue>{selectedMonth}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="This Month">This Month</SelectItem>
                <SelectItem value="Last Month">Last Month</SelectItem>
                <SelectItem value="All Time">All Time</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <AddFacilityDialog onSuccess={fetchFacilities}>
            <Button className="bg-green-500 hover:bg-green-600 h-10 flex items-center justify-center gap-2 w-full sm:w-auto">
              <Plus className="h-4 w-4" />
              <span className="whitespace-nowrap">Add Facility</span>
            </Button>
          </AddFacilityDialog>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 md:gap-5">
        {/* Total Facilities Card - Green */}
        <div className="rounded-[20px] md:rounded-[30px] bg-green-500 text-white relative overflow-hidden shadow-sm col-span-1 sm:col-span-2 lg:col-span-1">
          <div className="absolute top-0 right-0 w-20 h-20 md:w-32 md:h-32 opacity-30">
            <div className="w-full h-full rounded-bl-[40px] md:rounded-bl-[80px] bg-white"></div>
          </div>
          <div className="p-4 md:p-6">
            <p className="text-sm md:text-base font-medium mb-2 md:mb-3">
              Total Facilities
            </p>
            <p className="text-4xl md:text-7xl font-bold">
              {kpiData.totalFacilities}
            </p>
          </div>
        </div>

        {/* Active Facilities Card */}
        <div className="rounded-[20px] md:rounded-[30px] bg-white text-black relative overflow-hidden shadow-sm">
          <div className="absolute top-0 right-0 w-20 h-20 md:w-32 md:h-32 opacity-10">
            <div className="w-full h-full rounded-bl-[40px] md:rounded-bl-[80px] bg-gradient-to-br from-[#FFF04B] to-[#22A146]"></div>
          </div>
          <div className="p-4 md:p-6">
            <p className="text-sm md:text-base font-medium text-gray-700 mb-2 md:mb-3">
              Active Facilities
            </p>
            <p className="text-4xl md:text-7xl font-bold">
              {kpiData.activeFacilities}
            </p>
          </div>
        </div>

        {/* Inactive Facilities Card */}
        <div className="rounded-[20px] md:rounded-[30px] bg-white text-black relative overflow-hidden shadow-sm">
          <div className="absolute top-0 right-0 w-20 h-20 md:w-32 md:h-32 opacity-10">
            <div className="w-full h-full rounded-bl-[40px] md:rounded-bl-[80px] bg-gradient-to-br from-[#FFF04B] to-[#22A146]"></div>
          </div>
          <div className="p-4 md:p-6">
            <p className="text-sm md:text-base font-medium text-gray-700 mb-2 md:mb-3">
              Inactive Facilities
            </p>
            <p className="text-4xl md:text-7xl font-bold">
              {kpiData.inactiveFacilities}
            </p>
          </div>
        </div>

        {/* Approved Facilities Card */}
        <div className="rounded-[20px] md:rounded-[30px] bg-white text-black relative overflow-hidden shadow-sm">
          <div className="absolute top-0 right-0 w-20 h-20 md:w-32 md:h-32 opacity-10">
            <div className="w-full h-full rounded-bl-[40px] md:rounded-bl-[80px] bg-gradient-to-br from-[#FFF04B] to-[#22A146]"></div>
          </div>
          <div className="p-4 md:p-6">
            <p className="text-sm md:text-base font-medium text-gray-700 mb-2 md:mb-3">
              Approved
            </p>
            <p className="text-4xl md:text-7xl font-bold">
              {kpiData.approvedFacilities}
            </p>
          </div>
        </div>

        {/* Pending Facilities Card */}
        <div className="rounded-[20px] md:rounded-[30px] bg-white text-black relative overflow-hidden shadow-sm">
          <div className="absolute top-0 right-0 w-20 h-20 md:w-32 md:h-32 opacity-10">
            <div className="w-full h-full rounded-bl-[40px] md:rounded-bl-[80px] bg-gradient-to-br from-[#FFF04B] to-[#22A146]"></div>
          </div>
          <div className="p-4 md:p-6">
            <p className="text-sm md:text-base font-medium text-gray-700 mb-2 md:mb-3">
              Pending
            </p>
            <p className="text-4xl md:text-7xl font-bold">
              {kpiData.pendingFacilities}
            </p>
          </div>
        </div>
      </div>

      {/* Facilities Table */}
      <div className="bg-white rounded-[10px] overflow-hidden shadow-lg border border-gray-200">
        {/* Mobile Card View - Visible on small screens */}
        <div className="block md:hidden">
          <div className="divide-y divide-gray-200">
            {facilities.length > 0 ? (
              facilities.map((facility, index) => {
                const createdDate = safelyParseDate(facility.createdAt);
                return (
                  <div key={facility._id || index} className="p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="relative h-12 w-12 rounded-lg overflow-hidden bg-gray-100 border border-gray-200 flex-shrink-0">
                          {facility.details.images &&
                            facility.details.images.length > 0 && (
                              <Image
                                src={facility.details.images[0]}
                                alt={facility.details.name}
                                fill
                                className="object-cover"
                              />
                            )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="font-semibold text-gray-900 text-sm truncate">
                            {facility.details.name}
                          </h3>
                          <p className="text-xs text-gray-500 mt-1">
                            {formatFacilityType(facility.facilityType)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0 ml-2">
                        <div className="font-semibold text-sm text-gray-900">
                          {getBestPrice(facility)}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {getStatusBadge(facility)}
                      {facility.privacyType === "private" ? (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          Private
                        </span>
                      ) : (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Public
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>
                        #{index + 1} • {format(createdDate, "dd MMM yyyy")}
                      </span>
                      <div className="flex items-center gap-2">
                        <ReviewsDialog facilityId={facility._id} />
                        <Button
                          onClick={() => handleEdit(facility)}
                          variant="outline"
                          size="sm"
                          className="px-3 py-1 text-xs text-blue-600 border-blue-200 hover:bg-blue-50"
                        >
                          <Pencil className="h-3 w-3 mr-1" />
                          Edit
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="flex flex-col items-center justify-center py-12">
                <svg
                  width="48"
                  height="48"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="mb-3 text-gray-300"
                >
                  <path
                    d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M9 22V12H15V22"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <p className="text-gray-500 font-medium text-base mb-1">
                  No facilities found
                </p>
                <p className="text-gray-400 text-sm text-center px-4">
                  Add your first facility to get started
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Desktop Table View - Hidden on small screens */}
        <div className="hidden md:block overflow-x-auto">
          <Table className="w-full">
            <TableHeader className="bg-gray-50 border-b border-gray-200">
              <TableRow className="divide-x divide-gray-200">
                <TableHead className="py-3 md:py-5 font-semibold text-gray-600 px-3 md:px-6 text-left text-xs md:text-sm">
                  S.NO
                </TableHead>
                <TableHead className="py-3 md:py-5 font-semibold text-gray-600 px-3 md:px-6 text-left text-xs md:text-sm min-w-[200px]">
                  FACILITY NAME
                </TableHead>
                <TableHead className="py-3 md:py-5 font-semibold text-gray-600 px-3 md:px-6 text-left text-xs md:text-sm">
                  FACILITY TYPE
                </TableHead>
                <TableHead className="py-3 md:py-5 font-semibold text-gray-600 px-3 md:px-6 text-left text-xs md:text-sm">
                  DATE PUBLISHED
                </TableHead>
                <TableHead className="py-3 md:py-5 font-semibold text-gray-600 px-3 md:px-6 text-center text-xs md:text-sm">
                  STATUS
                </TableHead>
                <TableHead className="py-3 md:py-5 font-semibold text-gray-600 px-3 md:px-6 text-right text-xs md:text-sm">
                  PRICE
                </TableHead>
                <TableHead className="py-3 md:py-5 font-semibold text-gray-600 px-3 md:px-6 text-center text-xs md:text-sm">
                  ACTION
                </TableHead>
                <TableHead className="py-3 md:py-5 font-semibold text-gray-600 px-3 md:px-6 text-center text-xs md:text-sm">
                  PRIVACY TYPE
                </TableHead>
                <TableHead className="py-3 md:py-5 font-semibold text-gray-600 px-3 md:px-6 text-center text-xs md:text-sm">
                  REVIEWS
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-gray-200">
              {facilities.length > 0 ? (
                facilities.map((facility, index) => {
                  // Format dates for display - using safe parsing
                  const createdDate = safelyParseDate(facility.createdAt);

                  return (
                    <TableRow
                      key={facility._id || index}
                      className="hover:bg-gray-50 divide-x divide-gray-200"
                    >
                      <TableCell className="py-3 md:py-4 px-3 md:px-6 text-gray-700 text-sm">
                        {index + 1}
                      </TableCell>
                      <TableCell className="py-3 md:py-4 px-3 md:px-6">
                        <div className="flex items-center gap-2 md:gap-3">
                          <div className="relative h-8 w-8 md:h-9 md:w-9 rounded-lg overflow-hidden bg-gray-100 border border-gray-200 flex-shrink-0">
                            {facility.details.images &&
                              facility.details.images.length > 0 && (
                                <Image
                                  src={facility.details.images[0]}
                                  alt={facility.details.name}
                                  fill
                                  className="object-cover"
                                />
                              )}
                          </div>
                          <span className="font-medium text-gray-800 text-sm truncate">
                            {facility.details.name}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="py-3 md:py-4 px-3 md:px-6 text-gray-700 text-sm">
                        {formatFacilityType(facility.facilityType)}
                      </TableCell>
                      <TableCell className="py-3 md:py-4 px-3 md:px-6 text-gray-700 text-sm">
                        {format(createdDate, "dd MMM yyyy")}
                      </TableCell>
                      <TableCell className="py-3 md:py-4 px-3 md:px-6 text-center">
                        {getStatusBadge(facility)}
                      </TableCell>
                      <TableCell className="py-3 md:py-4 px-3 md:px-6 text-right font-semibold text-sm">
                        {getBestPrice(facility)}
                      </TableCell>
                      <TableCell className="py-3 md:py-4 px-3 md:px-6 text-center">
                        <Button
                          onClick={() => handleEdit(facility)}
                          variant="outline"
                          size="sm"
                          className="inline-flex justify-center items-center px-2 md:px-3 py-1 md:py-1.5 text-xs md:text-sm text-blue-600 border border-blue-200 rounded-md hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300 transition-colors"
                        >
                          <Pencil className="h-3 w-3 md:h-3.5 md:w-3.5 mr-1" />
                          Edit
                        </Button>
                      </TableCell>
                      <TableCell className="py-3 md:py-4 px-3 md:px-6 text-center">
                        {facility.privacyType === "private" ? (
                          <span className="px-2 md:px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            Private
                          </span>
                        ) : (
                          <span className="px-2 md:px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Public
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="py-3 md:py-4 px-3 md:px-6 text-center">
                        <ReviewsDialog facilityId={facility._id} />
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={9} className="h-40 md:h-60">
                    <div className="flex flex-col items-center justify-center h-full">
                      <svg
                        width="64"
                        height="64"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="mb-3 md:mb-4 text-gray-300"
                      >
                        <path
                          d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M9 22V12H15V22"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      <p className="text-gray-500 font-medium text-base md:text-lg mb-1">
                        No facilities found
                      </p>
                      <p className="text-gray-400 text-xs md:text-sm">
                        Add your first facility to get started
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Edit Facility Dialog */}
      {selectedFacility && (
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-[95vw] md:max-w-4xl max-h-[95vh] md:max-h-[90vh] overflow-y-auto smart-scrollbar mx-0 p-3 md:p-6">
            <DialogHeader>
              <DialogTitle></DialogTitle>
            </DialogHeader>
            <FacilityForm
              type={selectedFacility.facilityType}
              initialData={selectedFacility}
              onSubmit={handleEditSubmit}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
