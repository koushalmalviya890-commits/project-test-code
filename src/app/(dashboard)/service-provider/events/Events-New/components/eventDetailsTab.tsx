"use client";

import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Calendar,
  ChevronDown,
  ChevronUp,
  FileText,
  Upload,
  Plus,
  X,
  ChevronLeft,
  ChevronRight,
  Image as ImageIcon,
  FileIcon,
  Loader2,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { useEventForm } from "../../services/contexts/EventFormContext";
import { toast } from "sonner";

interface EventFormData {
  serviceProviderId: string;
  title: string;
  status: "public" | "private";
  venueStatus: "online" | "offline";
  startDateTime: string;
  endDateTime: string;
  venue: string;
  description: string;
  category: string;
  sectors: string[];
  amenities: string[];
  coverImage: string | null;
  features: { name: string; files: string[] }[];
  chiefGuests: { name: string; image: string | null }[];
  hasFeatures: boolean;
  hasChiefGuest: boolean;
}

interface ValidationErrors {
  [key: string]: string;
}

const EventDetailsTab: React.FC<{ onNext: () => void }> = ({ onNext }) => {
  const { data: session } = useSession();
  // 🕒 USING: Context helper functions as specified
  const { formData, updateFormData, formatDateTimeLocalIST } = useEventForm() as unknown as {
    formData: EventFormData;
    updateFormData: (key: keyof EventFormData, value: any) => void;
    formatDateTimeLocalIST: (date: any) => string;
  };

  const [startDate, setStartDate] = useState<Date | null>(null);
  // 🕒 UPDATED: Removed seconds from time state
  const [startTime, setStartTime] = useState<{
    hour: string;
    minute: string;
    period: "AM" | "PM";
  } | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  // 🕒 UPDATED: Removed seconds from time state
  const [endTime, setEndTime] = useState<{
    hour: string;
    minute: string;
    period: "AM" | "PM";
  } | null>(null);

  const [openCalendar, setOpenCalendar] = useState<"start" | "end" | null>(null);
  const [openTimeSelector, setOpenTimeSelector] = useState<"start" | "end" | null>(null);

  // Loading states for file uploads
  const [coverImageLoading, setCoverImageLoading] = useState(false);
  const [featureFileLoading, setFeatureFileLoading] = useState<{
    [key: number]: boolean;
  }>({});
  const [chiefGuestImageLoading, setChiefGuestImageLoading] = useState<{
    [key: number]: boolean;
  }>({});
  
  // Error states for file uploads
  const [fileErrors, setFileErrors] = useState<{ [key: string]: string }>({});

  const [openSectorsDropdown, setOpenSectorsDropdown] = useState(false);
  const [openAmenitiesDropdown, setOpenAmenitiesDropdown] = useState(false);
  const [featuresOpen, setFeaturesOpen] = useState(false);
  const [chiefGuestOpen, setChiefGuestOpen] = useState(false);
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1)
  );
  const [errors, setErrors] = useState<ValidationErrors>({});

  const coverImageInputRef = useRef<HTMLInputElement>(null);
  const featureFileInputRefs = useRef<{
    [key: number]: HTMLInputElement | null;
  }>({});
  const chiefGuestImageInputRefs = useRef<{
    [key: number]: HTMLInputElement | null;
  }>({});


const [openCategoryDropdown , setOpenCategoryDropdown] = useState(false)

const [categories, setCategories] = useState([
  "Technology",
  "Workshops",
  "Hackathons",
  "Meetups",
  "Conferences",
  "Bootcamps",
]);


  // Others popovers state
    const [categoryOthersOpen, setCategoryOthersOpen] = useState(false);
    const [categoryOthersValue, setCategoryOthersValue] = useState("");
  
    const [sectorsOthersOpen, setSectorsOthersOpen] = useState(false);
    const [sectorsOthersValue, setSectorsOthersValue] = useState("");
  
    const [amenitiesOthersOpen, setAmenitiesOthersOpen] = useState(false);
    const [amenitiesOthersValue, setAmenitiesOthersValue] = useState("");

  useEffect(() => {
    if (session?.user.id && !formData.serviceProviderId) {
      updateFormData("serviceProviderId", session.user.id);
    }
  }, [session, formData.serviceProviderId, updateFormData]);

  // Clear sectors and amenities when switching to online mode
useEffect(() => {
  if (formData.venueStatus === 'online') {
    // Clear sectors and amenities data when switching to online
    if (formData.sectors.length > 0) {
      updateFormData('sectors', []);
    }
    if (formData.amenities.length > 0) {
      updateFormData('amenities', []);
    }
  }
}, [formData.venueStatus, updateFormData, formData.sectors.length, formData.amenities.length]);


  // 🕒 UPDATED: Load existing times without seconds
  useEffect(() => {
    if (formData.startDateTime) {
      const dt = new Date(formData.startDateTime);
      setStartDate(dt);
      let hours = dt.getHours();
      const minutes = String(dt.getMinutes()).padStart(2, "0");
      const period = hours >= 12 ? "PM" : "AM";
      hours = hours % 12 || 12;
      setStartTime({
        hour: String(hours).padStart(2, "0"),
        minute: minutes,
        period,
      });
    }

    if (formData.endDateTime) {
      const dt = new Date(formData.endDateTime);
      setEndDate(dt);
      let hours = dt.getHours();
      const minutes = String(dt.getMinutes()).padStart(2, "0");
      const period = hours >= 12 ? "PM" : "AM";
      hours = hours % 12 || 12;
      setEndTime({
        hour: String(hours).padStart(2, "0"),
        minute: minutes,
        period,
      });
    }
  }, [formData.startDateTime, formData.endDateTime]);

  // 🕒 RESTORED: Original validation logic - start date/time must be before end date/time
  const validateRequiredFields = (): boolean => {
    const newErrors: ValidationErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = "Event name is required";
    }
    

    if (!startDate) {
      newErrors.startDate = "Start date is required";
    }

    if (!endDate) {
      newErrors.endDate = "End date is required";
    }

    if(!startTime){
      newErrors.startTime = "Start Time is required";
    }

    if(!endTime){
      newErrors.endTime = "End Time is required";
    }

    // 🕒 RESTORED: Original validation - check both date and time
    if (startDate && endDate && startTime && endTime) {
      const startDateTime = computeDateTime(startDate, {
        ...startTime,
        second: "00"
      });
      const endDateTime = computeDateTime(endDate, {
        ...endTime,
        second: "00"
      });

      if (new Date(endDateTime) <= new Date(startDateTime)) {
        newErrors.endDate = "End date and time must be after start date and time";
      }
    }

    if (!formData.venue.trim()) {
      newErrors.venue = "Venue details are required";
    }

    if (!formData.coverImage) {
      newErrors.coverImage = "Cover image is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveAndProceed = () => {
    if (validateRequiredFields()) {
      onNext();
    } else {
      toast.error("Please fill in all required fields");
    }
  };

  // 🕒 UPDATED: Remove seconds from updateTimeField
  const updateTimeField = (
    type: "startTime" | "endTime",
    field: "hour" | "minute" | "period",
    value: string
  ): void => {
    const newTime = (type === "startTime" ? startTime : endTime)
      ? { ...(type === "startTime" ? startTime : endTime)!, [field]: value }
      : {
          hour: "09",
          minute: "00",
          period: "AM",
          [field]: value,
        };
    
    if (type === "startTime") {
      setStartTime(newTime as {
        hour: string;
        minute: string;
        period: "AM" | "PM";
      });
  setErrors((prev) => ({ ...prev, startTime: "" }));
      
    } else {
      setEndTime(newTime as {
        hour: string;
        minute: string;
        period: "AM" | "PM";
      });
      setErrors((prev) => ({ ...prev, endTime: "" }));
    }
    
    const date = type === "startTime" ? startDate : endDate;
    if (date && newTime.hour && newTime.minute && newTime.period) {
      const fullDateTime = computeDateTime(date, {
        ...newTime as {
          hour: string;
          minute: string;
          period: "AM" | "PM";
        },
        second: "00" // Always set seconds to 00
      });
      updateFormData(
        type === "startTime" ? "startDateTime" : "endDateTime",
        fullDateTime
      );
    }
  };

  const toggleArrayItem = (
    field: "sectors" | "amenities",
    item: string
  ): void => {
    const newArray = formData[field].includes(item)
      ? formData[field].filter((i) => i !== item)
      : [...formData[field], item];
    updateFormData(field, newArray);
  };

  // 🕒 UPDATED: computeDateTime still accepts seconds but we'll always pass "00"
  const computeDateTime = (
    date: Date,
    time: { hour: string; minute: string; second: string; period: "AM" | "PM" }
  ): Date => {
    let hours = parseInt(time.hour);
    if (time.period === "PM" && hours < 12) hours += 12;
    if (time.period === "AM" && hours === 12) hours = 0;

    // Create IST date (local time)
    const fullDate = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      hours,
      parseInt(time.minute),
      parseInt(time.second),
      0
    );

    return fullDate;
  };

  // All file upload functions remain the same...
  const uploadToS3 = async (file: File): Promise<string> => {
    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileType: file.type }),
      });

      if (!response.ok) {
        throw new Error("Failed to get upload URL");
      }

      const { url, key } = await response.json();

      const uploadResponse = await fetch(url, {
        method: "PUT",
        body: file,
        headers: {
          "Content-Type": file.type,
        },
      });

      if (!uploadResponse.ok) {
        throw new Error("Failed to upload file");
      }

      return `https://${process.env.NEXT_PUBLIC_AWS_BUCKET_NAME}.s3.${process.env.NEXT_PUBLIC_AWS_REGION}.amazonaws.com/${key}`;
    } catch (error) {
      console.error("Error uploading file:", error);
      throw error;
    }
  };

  const deleteFromS3 = async (url: string) => {
    try {
      const urlObj = new URL(url);
      const key = urlObj.pathname.substring(1);
      if (!key) throw new Error("Invalid URL");
      const response = await fetch("/api/upload", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileKey: key }),
      });
      if (!response.ok) {
        throw new Error("Failed to delete file");
      }
    } catch (error) {
      console.error("Error deleting file:", error);
      throw error;
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = async (
    e: React.DragEvent,
    type: "cover" | "feature" | "chiefGuest",
    index?: number
  ) => {
    e.preventDefault();
    e.stopPropagation();
    const files = Array.from(e.dataTransfer.files);
    if (files.length === 0) return;

    if (type === "cover") {
      const file = files[0];
      if (file && file.type.startsWith("image/")) {
        setCoverImageLoading(true);
        setFileErrors(prev => ({ ...prev, coverImage: "" }));
        try {
          const s3Url = await uploadToS3(file);
          updateFormData("coverImage", s3Url);
          toast.success("Cover image uploaded successfully!");
        } catch (error) {
          setFileErrors(prev => ({ ...prev, coverImage: "Failed to upload image. Please try again." }));
          toast.error("Failed to upload cover image");
        } finally {
          setCoverImageLoading(false);
        }
      }
    } else if (type === "feature" && typeof index === "number") {
      const file = files[0];
      setFeatureFileLoading(prev => ({ ...prev, [index]: true }));
      setFileErrors(prev => ({ ...prev, [`feature-${index}`]: "" }));
      try {
        const s3Url = await uploadToS3(file);
        const updatedFeatures = formData.features.map((feature, i) =>
          i === index ? { ...feature, files: [s3Url] } : feature
        );
        updateFormData("features", updatedFeatures);
        updateFormData("hasFeatures", updatedFeatures.length > 0);
        toast.success("Feature file uploaded successfully!");
      } catch (error) {
        setFileErrors(prev => ({ ...prev, [`feature-${index}`]: "Failed to upload file. Please try again." }));
        toast.error("Failed to upload feature file");
      } finally {
        setFeatureFileLoading(prev => ({ ...prev, [index]: false }));
      }
    } else if (type === "chiefGuest" && typeof index === "number") {
      const file = files[0];
      if (file && file.type.startsWith("image/")) {
        setChiefGuestImageLoading(prev => ({ ...prev, [index]: true }));
        setFileErrors(prev => ({ ...prev, [`chiefGuest-${index}`]: "" }));
        try {
          const s3Url = await uploadToS3(file);
          const updatedGuests = formData.chiefGuests.map((guest, i) =>
            i === index ? { ...guest, image: s3Url } : guest
          );
          updateFormData("chiefGuests", updatedGuests);
          updateFormData("hasChiefGuest", updatedGuests.length > 0);
          toast.success("Chief guest image uploaded successfully!");
        } catch (error) {
          setFileErrors(prev => ({ ...prev, [`chiefGuest-${index}`]: "Failed to upload image. Please try again." }));
          toast.error("Failed to upload chief guest image");
        } finally {
          setChiefGuestImageLoading(prev => ({ ...prev, [index]: false }));
        }
      }
    }
  };

const handleCoverImageUpload = async (
  event: React.ChangeEvent<HTMLInputElement>
) => {
  const file = event.target.files?.[0];
  if (!file) return;

  // ✅ File type validation
  if (!file.type.startsWith("image/")) {
    setFileErrors(prev => ({ 
      ...prev, 
      coverImage: "Please select an image file" 
    }));
    toast.error("Please select an image file");
    // Clear the input
    if (event.target) {
      event.target.value = '';
    }
    return;
  }

  // ✅ File size validation - Must be between 2MB and 50MB
  const minSizeInBytes = 2 * 1024 * 1024; // 2MB
  const maxSizeInBytes = 50 * 1024 * 1024; // 50MB
  
  // if (file.size < minSizeInBytes) {
  //   setFileErrors(prev => ({
  //     ...prev,
  //     // coverImage: "Image must be larger than 2MB"
  //   }));
  //   // toast.error("Image must be larger than 2MB");
  //   // Clear the input
  //   if (event.target) {
  //     event.target.value = '';
  //   }
  //   return;
  // }

  if (file.size > maxSizeInBytes) {
    setFileErrors(prev => ({
      ...prev,
      coverImage: "Image must be smaller than 50MB"
    }));
    toast.error("Image must be smaller than 50MB");
    // Clear the input
    if (event.target) {
      event.target.value = '';
    }
    return;
  }

  // ✅ Additional file type validation for specific formats
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    setFileErrors(prev => ({
      ...prev,
      coverImage: "Only JPEG, PNG, and WebP images are allowed"
    }));
    toast.error("Only JPEG, PNG, and WebP images are allowed");
    // Clear the input
    if (event.target) {
      event.target.value = '';
    }
    return;
  }

// NEW: Aspect ratio validation ~ 2:1
  const isValidAspectRatio = await new Promise<boolean>((resolve) => {
    const img = new Image();
    img.onload = () => {
      const w = img.naturalWidth;
      const h = img.naturalHeight;
      // Guard zero
      if (!w || !h) return resolve(false);
      const ratio = w / h;
      // Allow small tolerance for encoders/crops, tweak as needed
      resolve(ratio >= 1.95 && ratio <= 2.05);
    };
    img.onerror = () => resolve(false);
    img.src = URL.createObjectURL(file);
  });

  if (!isValidAspectRatio) {
    setFileErrors(prev => ({
      ...prev,
      coverImage: "Cover image must be 2:1 (e.g., 2000×1000, 2400×1200). Please upload a wide rectangular image.",
    }));
    toast.error("Cover image must be 2:1");
    if (event.target) event.target.value = "";
    return;
  }

  // ✅ All validations passed, proceed with upload
  setCoverImageLoading(true);
  setFileErrors(prev => ({ ...prev, coverImage: "" }));
  
  try {
    const s3Url = await uploadToS3(file);
    updateFormData("coverImage", s3Url);
    toast.success("Cover image uploaded successfully!");
    setErrors(prev => ({ ...prev, coverImage: "" }));
  } catch (error) {
    console.error("Cover image upload error:", error);
    setFileErrors(prev => ({ 
      ...prev, 
      coverImage: "Failed to upload image. Please try again." 
    }));
    toast.error("Failed to upload cover image");
  } finally {
    setCoverImageLoading(false);
    // Clear the input after upload (successful or failed)
    if (event.target) {
      event.target.value = '';
    }
  }
};

const removeCoverImage = async () => {
  if (formData.coverImage) {
    setCoverImageLoading(true);
    try {
      await deleteFromS3(formData.coverImage);
      updateFormData("coverImage", null);
      
      // ✅ Clear the file input reference
      if (coverImageInputRef.current) {
        coverImageInputRef.current.value = "";
      }
      
      // ✅ Clear any existing errors
      setFileErrors(prev => ({ ...prev, coverImage: "" }));
      
      toast.success("Cover image deleted successfully!");
    } catch (error) {
      console.error("Cover image delete error:", error);
      toast.error("Failed to delete cover image");
    } finally {
      setCoverImageLoading(false);
    }
  }
};


  const updateFeature = (index: number, field: "name", value: string): void => {
    const updatedFeatures = formData.features.map((feature, i) =>
      i === index ? { ...feature, [field]: value } : feature
    );
    updateFormData("features", updatedFeatures);
    updateFormData("hasFeatures", updatedFeatures.length > 0);
  };

  const handleFeatureFileUpload = async (
    index: number,
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      setFeatureFileLoading(prev => ({ ...prev, [index]: true }));
      setFileErrors(prev => ({ ...prev, [`feature-${index}`]: "" }));
      try {
        const s3Url = await uploadToS3(file);
        const updatedFeatures = formData.features.map((feature, i) =>
          i === index ? { ...feature, files: [s3Url] } : feature
        );
        updateFormData("features", updatedFeatures);
        updateFormData("hasFeatures", updatedFeatures.length > 0);
        toast.success("Feature file uploaded successfully!");
      } catch (error) {
        setFileErrors(prev => ({ ...prev, [`feature-${index}`]: "Failed to upload file. Please try again." }));
        toast.error("Failed to upload feature file");
      } finally {
        setFeatureFileLoading(prev => ({ ...prev, [index]: false }));
      }
    }
  };

  const removeFeatureFile = async (featureIndex: number) => {
    const fileToRemove = formData.features[featureIndex].files[0];
    if (fileToRemove) {
      setFeatureFileLoading(prev => ({ ...prev, [featureIndex]: true }));
      try {
        await deleteFromS3(fileToRemove);
        const updatedFeatures = formData.features.map((feature, i) =>
          i === featureIndex ? { ...feature, files: [] } : feature
        );
        updateFormData("features", updatedFeatures);
        updateFormData("hasFeatures", updatedFeatures.length > 0);
        toast.success("Feature file deleted successfully!");
      } catch (error) {
        toast.error("Failed to delete feature file");
      } finally {
        setFeatureFileLoading(prev => ({ ...prev, [featureIndex]: false }));
      }
    }
  };

  const addFeature = (): void => {
    const updatedFeatures = [...formData.features, { name: "", files: [] }];
    updateFormData("features", updatedFeatures);
    updateFormData("hasFeatures", updatedFeatures.length > 0);
  };

  const removeFeature = (index: number): void => {
    const updatedFeatures = formData.features.filter((_, i) => i !== index);
    updateFormData("features", updatedFeatures);
    updateFormData("hasFeatures", updatedFeatures.length > 0);
  };

  const updateChiefGuest = (
    index: number,
    field: "name",
    value: string
  ): void => {
    const updatedGuests = formData.chiefGuests.map((guest, i) =>
      i === index ? { ...guest, [field]: value } : guest
    );
    updateFormData("chiefGuests", updatedGuests);
    updateFormData("hasChiefGuest", updatedGuests.length > 0);
  };

  const handleChiefGuestImageUpload = async (
    index: number,
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      setChiefGuestImageLoading(prev => ({ ...prev, [index]: true }));
      setFileErrors(prev => ({ ...prev, [`chiefGuest-${index}`]: "" }));
      try {
        const s3Url = await uploadToS3(file);
        const updatedGuests = formData.chiefGuests.map((guest, i) =>
          i === index ? { ...guest, image: s3Url } : guest
        );
        updateFormData("chiefGuests", updatedGuests);
        updateFormData("hasChiefGuest", updatedGuests.length > 0);
        toast.success("Chief guest image uploaded successfully!");
      } catch (error) {
        setFileErrors(prev => ({ ...prev, [`chiefGuest-${index}`]: "Failed to upload image. Please try again." }));
        toast.error("Failed to upload chief guest image");
      } finally {
        setChiefGuestImageLoading(prev => ({ ...prev, [index]: false }));
      }
    }
  };

  const removeChiefGuestImage = async (index: number) => {
    if (formData.chiefGuests[index].image) {
      setChiefGuestImageLoading(prev => ({ ...prev, [index]: true }));
      try {
        await deleteFromS3(formData.chiefGuests[index].image!);
        const updatedGuests = formData.chiefGuests.map((guest, i) =>
          i === index ? { ...guest, image: null } : guest
        );
        updateFormData("chiefGuests", updatedGuests);
        updateFormData("hasChiefGuest", updatedGuests.length > 0);
        if (chiefGuestImageInputRefs.current[index]) {
          chiefGuestImageInputRefs.current[index]!.value = "";
        }
        toast.success("Chief guest image deleted successfully!");
      } catch (error) {
        toast.error("Failed to delete chief guest image");
      } finally {
        setChiefGuestImageLoading(prev => ({ ...prev, [index]: false }));
      }
    }
  };

  const addChiefGuest = (): void => {
    const updatedGuests = [...formData.chiefGuests, { name: "", image: null }];
    updateFormData("chiefGuests", updatedGuests);
    updateFormData("hasChiefGuest", updatedGuests.length > 0);
  };

  const removeChiefGuest = (index: number): void => {
    const updatedGuests = formData.chiefGuests.filter((_, i) => i !== index);
    updateFormData("chiefGuests", updatedGuests);
    updateFormData("hasChiefGuest", updatedGuests.length > 0);
  };

  const handleDateSelect = (date: Date | undefined, type: "start" | "end") => {
    if (date) {
      if (type === "start") {
        setStartDate(date);
        if (startTime && startTime.hour && startTime.minute && startTime.period) {
          const fullDateTime = computeDateTime(date, {
            ...startTime,
            second: "00"
          });
          updateFormData("startDateTime", fullDateTime);
        }
        if (errors.startDate) {
          setErrors((prev) => ({ ...prev, startDate: "" }));
        }
      } else {
        setEndDate(date);
        if (endTime && endTime.hour && endTime.minute && endTime.period) {
          const fullDateTime = computeDateTime(date, {
            ...endTime,
            second: "00"
          });
          updateFormData("endDateTime", fullDateTime);
        }
        if (errors.endDate) {
          setErrors((prev) => ({ ...prev, endDate: "" }));
        }
      }
      setOpenCalendar(null);
      setOpenTimeSelector(type);
    }
  };

  // 🕒 UPDATED: handleTimeSet without seconds
  const handleTimeSet = (type: "start" | "end") => {
    const date = type === "start" ? startDate : endDate;
    const time = type === "start" ? startTime : endTime;
    if (date && time && time.hour && time.minute && time.period) {
      const fullDateTime = computeDateTime(date, {
        ...time,
        second: "00" // Always set seconds to 00
      });
      updateFormData(
        type === "start" ? "startDateTime" : "endDateTime",
        fullDateTime
      );
      
      // Clear any previous validation errors
      if (errors.endDate) {
        setErrors((prev) => ({ ...prev, endDate: "" }));
      }
    }
    setOpenTimeSelector(null);
  };

  const formatDate = (date: Date | null): string => {
    if (!date) return "Select Date";
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // 🕒 UPDATED: formatTime without seconds
  const formatTime = (
    time: {
      hour: string;
      minute: string;
      period: "AM" | "PM";
    } | null
  ): string => {
    if (!time) return "Select Time";
    return `${time.hour}:${time.minute} ${time.period}`;
  };

  // 🕒 UPDATED: getDefaultTime without seconds
  const getDefaultTime = () => ({
    hour: "00",
    minute: "00",
    period: "AM" as "AM" | "PM",
  });

  const CustomCalendar = ({
    selectedDate,
    onSelect,
    type,
  }: {
    selectedDate: Date | undefined;
    onSelect: (date: Date | undefined) => void;
    type?: "start" | "end";
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
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December",
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
        const isPast = date < today;

      // 🕒 RESTORED: Original validation - end date must be after start date
      // const isBeforeStartDate = type === "end" && startDate && date < startDate;

      days.push(
        <button
          key={day}
          onClick={() => !isPast && onSelect(date)}
          disabled={!!(isPast)}
          className={`h-8 w-8 text-sm rounded transition-colors ${
            isSelected
              ? "bg-green-500 text-white font-medium"
              : isToday
                ? "bg-blue-100 text-blue-700"
                : isPast
                  ? "text-gray-300 cursor-not-allowed"
                  : "hover:bg-gray-100 text-gray-700"
          }`}
        >
          {day}
        </button>
      );
    }

    return (
      <div className="p-4 w-70 bg-white shadow-lg rounded-lg border">
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
            className="p-2 hover:bg-gray-100  rounded-full"
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

  // 🕒 UPDATED: TimePicker component without seconds
  const TimePicker = ({
    time,
    onTimeChange,
    isOpen,
    onOpenChange,
    type,
  }: {
    time: {
      hour: string;
      minute: string;
      period: "AM" | "PM";
    } | null;
    onTimeChange: (
      field: "hour" | "minute" | "period",
      value: string
    ) => void;
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    type: "start" | "end";
  }) => {
    const currentTime = time || getDefaultTime();

    return (
      <Popover open={isOpen} onOpenChange={onOpenChange}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="w-full justify-between h-11 font-normal shadow-md text-gray-700"
          >
            {formatTime(time)}
            <ChevronDown className="h-4 w-4 text-gray-500" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-4" align="start">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Select
                value={currentTime.hour}
                onValueChange={(value) => onTimeChange("hour", value)}
              >
                <SelectTrigger className="w-16">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 13 }, (_, i) => {
                    const hour = i;
                    return (
                      <SelectItem
                        key={hour}
                        value={hour.toString().padStart(2, "0")}
                      >
                        {hour.toString().padStart(2, "0")}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>

              <span>:</span>

              <Select
                value={currentTime.minute}
                onValueChange={(value) => onTimeChange("minute", value)}
              >
                <SelectTrigger className="w-16">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 60 }, (_, i) => (
                    <SelectItem key={i} value={i.toString().padStart(2, "0")}>
                      {i.toString().padStart(2, "0")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={currentTime.period}
                onValueChange={(value) => onTimeChange("period", value)}
              >
                <SelectTrigger className="w-16">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="AM">AM</SelectItem>
                  <SelectItem value="PM">PM</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-center">
              <Button
                onClick={() => {
                  handleTimeSet(type);
                  onOpenChange(false);
                  
                }}
                className="bg-green-500 hover:bg-green-600 text-white px-8 py-2 rounded-lg font-medium"
              >
                Set
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    );
  };

  const sectorsData = [
    "AI", "Blockchain", "IoT", "Prop Tech", "WhiteBoard", "E Commerce", "D2C",
    "Art and Culture", "Livelihood", "Energy", "Ed Tech", "Finance Tech", "Deep Tech", "Fin Tech",
  ];

  const amenitiesData = [
    { name: "WiFi", icon: "📶" },
    { name: "Parking", icon: "🅿️" },
    { name: "Food Stalls", icon: "🍔" },
    { name: "AC Venue", icon: "❄️" },
    { name: "Power Backup", icon: "🔋" },
    { name: "Storage & Locker", icon: "🗄️" },
    { name: "Tea, Coffee & Refreshments", icon: "☕" },
    { name: "Business Templates", icon: "📄" },
    { name: "Printer", icon: "🖨️" },
    { name: "Charging Stations", icon: "🔌" },
    { name: "Stationery", icon: "✏️" },
    { name: "Welcome kits", icon: "🎁" },
    { name: "flip charts", icon: "📋" },
    { name: "Notepads and pens", icon: "📝" },
    { name: "Lunch", icon: "🍽️" },
    { name: "Marker", icon: "🖍️" },
    { name: "Social media coverage", icon: "📱" },
  ];

    // Helpers for Others submission
  const addCustomCategory = () => {
    const value = categoryOthersValue.trim();
    if (!value) return;
    updateFormData("category", value);
    setCategoryOthersValue("");
    setCategoryOthersOpen(false);
  };

  const addCustomSector = () => {
    const value = sectorsOthersValue.trim();
    if (!value) return;
    const exists = formData.sectors.some(s => s.toLowerCase() === value.toLowerCase());
    if (!exists) updateFormData("sectors", [...formData.sectors, value]);
    setSectorsOthersValue("");
    setSectorsOthersOpen(false);
  };

  const addCustomAmenity = () => {
    const value = amenitiesOthersValue.trim();
    if (!value) return;
    const exists = formData.amenities.some(a => a.toLowerCase() === value.toLowerCase());
    if (!exists) updateFormData("amenities", [...formData.amenities, value]);
    setAmenitiesOthersValue("");
    setAmenitiesOthersOpen(false);
  };

  return (
    <div className="">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-10">
          <div className="xl:col-span-2">
            <div className="bg-white rounded-xl p-8 shadow-sm">
              <h3 className="text-xl font-bold mb-8 text-gray-900">
                Basic Details
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label
                    htmlFor="title"
                    className="text-sm font-medium text-gray-700 mb-3 block"
                  >
                    Event Name<span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => {
                      updateFormData("title", e.target.value);
                      if (errors.title) {
                        setErrors((prev) => ({ ...prev, title: "" }));
                      }
                    }}
                    placeholder="Event Name"
                    className={`h-12 border-gray-300 focus:border-green-500 focus:ring-green-500 ${
                      errors.title ? "border-red-500" : ""
                    }`}
                  />
                  {errors.title && (
                    <span className="text-red-500 text-xs mt-1">
                      {errors.title}
                    </span>
                  )}
                  <span className="text-xs text-gray-500 mt-1">
                    100 Characters
                  </span>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-3 block">
                    Event Status<span className="text-red-500">*</span>
                  </Label>
                  <RadioGroup
                    value={formData.status}
                    onValueChange={(value: "public" | "private") => {
                      updateFormData("status", value);
                    }}
                    className="flex gap-8"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem
                        value="public"
                        id="public"
                        className="border-gray-300"
                      />
                      <Label
                        htmlFor="public"
                        className="text-sm font-medium text-gray-700"
                      >
                        Public
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem
                        value="private"
                        id="private"
                        className="border-gray-300"
                      />
                      <Label
                        htmlFor="private"
                        className="text-sm font-medium text-gray-700"
                      >
                        Private
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-3 block">
                    Venue Status<span className="text-red-500">*</span>
                  </Label>
                  <RadioGroup
                    value={formData.venueStatus}
                    onValueChange={(value: "online" | "offline") => {
                      updateFormData("venueStatus", value);
                    }}
                    className="flex gap-8"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem
                        value="online"
                        id="online"
                        className="border-gray-300"
                      />
                      <Label
                        htmlFor="online"
                        className="text-sm font-medium text-gray-700"
                      >
                        Online
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem
                        value="offline"
                        id="offline"
                        className="border-gray-300"
                      />
                      <Label
                        htmlFor="offline"
                        className="text-sm font-medium text-gray-700"
                      >
                        Offline
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-3 block">
                    Start Date<span className="text-red-500">*</span>
                  </Label>
                  <Collapsible
                    open={openCalendar === "start"}
                    onOpenChange={(open) =>
                      setOpenCalendar(open ? "start" : null)
                    }
                  >
                    <CollapsibleTrigger asChild>
                      <Button
                        variant="outline"
                        className={`w-full justify-between h-12 shadow-md font-normal text-gray-700 hover:border-green-500 ${
                          errors.startDate ? "border-red-500" : ""
                        }`}
                      >
                        {formatDate(startDate)}
                        {openCalendar === "start" ? (
                          <ChevronUp className="h-4 w-4 text-gray-500" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-gray-500" />
                        )}
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="w-full p-0">
                      <CustomCalendar
                        selectedDate={startDate || undefined}
                        onSelect={(date) => handleDateSelect(date, "start")}
                        type="start"
                      />
                    </CollapsibleContent>
                  </Collapsible>
                  {errors.startDate && (
                    <span className="text-red-500 text-xs mt-1">
                      {errors.startDate}
                    </span>
                  )}

                  <div className="mt-4">
                     <Label className="text-sm font-medium text-gray-700 mb-3 block">
                    Start Time<span className="text-red-500">*</span>
                  </Label>
                    <TimePicker
                  
                      time={startTime}
                      onTimeChange={(field, value) =>
                        updateTimeField("startTime", field, value)
                      }
                      isOpen={openTimeSelector === "start"}
                      onOpenChange={(open) =>
                        setOpenTimeSelector(open ? "start" : null)
                      }
                      type="start"
                    />
                    {errors.startTime && (
                    <span className="text-red-500 text-xs mt-1">
                      {errors.startTime}
                    </span>
                  )}
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-3 block">
                    End Date<span className="text-red-500">*</span>
                  </Label>
                  <Collapsible
                    open={openCalendar === "end"}
                    onOpenChange={(open) =>
                      setOpenCalendar(open ? "end" : null)
                    }
                  >
                    <CollapsibleTrigger asChild>
                      <Button
                        variant="outline"
                        className={`w-full justify-between h-12 font-normal shadow-md text-gray-700 hover:border-green-500 ${
                          errors.endDate ? "border-red-500" : ""
                        }`}
                      >
                        {formatDate(endDate)}
                        {openCalendar === "end" ? (
                          <ChevronUp className="h-4 w-4 text-gray-500" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-gray-500" />
                        )}
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="w-full p-0">
                      <CustomCalendar
                        selectedDate={endDate || undefined}
                        onSelect={(date) => handleDateSelect(date, "end")}
                        type="end"
                      />
                    </CollapsibleContent>
                  </Collapsible>
                  {errors.endDate && (
                    <span className="text-red-500 text-xs mt-1">
                      {errors.endDate}
                    </span>
                  )}

                  <div className="mt-4">
                       <Label className="text-sm font-medium text-gray-700 mb-3 block">
                    End Time<span className="text-red-500">*</span>
                  </Label>
                    <TimePicker
                      time={endTime}
                      onTimeChange={(field, value) =>
                        updateTimeField("endTime", field, value)
                      }
                      isOpen={openTimeSelector === "end"}
                      onOpenChange={(open) =>
                        setOpenTimeSelector(open ? "end" : null)
                      }
                      type="end"
                    />
                      {errors.endTime && (
                    <span className="text-red-500 text-xs mt-1">
                      {errors.endTime}
                    </span>
                  )}
                  </div>
                </div>
              </div>

              <div className="mt-8">
                <Label
                  htmlFor="venue"
                  className="text-sm font-medium text-gray-700 mb-3 block"
                >
                  Venue Details<span className="text-red-500">*</span>
                </Label>
                <Input
                  id="venue"
                  value={formData.venue}
                  onChange={(e) => {
                    updateFormData("venue", e.target.value);
                    if (errors.venue) {
                      setErrors((prev) => ({ ...prev, venue: "" }));
                    }
                  }}
                  placeholder="Offline Location or Virtual Link"
                  className={`h-12 border-gray-300 focus:border-green-500 focus:ring-green-500 ${
                    errors.venue ? "border-red-500" : ""
                  }`}
                />
                {errors.venue && (
                  <span className="text-red-500 text-xs mt-1">
                    {errors.venue}
                  </span>
                )}
              </div>

              <div className="mt-8">
                <div className="flex items-center justify-between mb-3">
                  <Label
                    htmlFor="description"
                    className="text-sm font-medium text-gray-700"
                  >
                    Description
                  </Label>
                </div>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    updateFormData("description", e.target.value)
                  }
                  placeholder="100 Characters"
                  className="min-h-[300px] resize-none border-gray-300 focus:border-green-500 focus:ring-green-500"
                />
              </div>

              {/* Features section - keeping all existing code */}
              <div className="mt-8">
                <Collapsible open={featuresOpen} onOpenChange={setFeaturesOpen}>
                  <CollapsibleTrigger className="flex items-center justify-between w-full p-4 border border-gray-200 rounded-lg bg-white hover:bg-gray-50 transition-colors">
                    <span className="text-sm font-medium text-gray-700">
                      Benefits
                    </span>
                    {featuresOpen ? (
                      <ChevronUp className="h-4 w-4 text-gray-500" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-gray-500" />
                    )}
                  </CollapsibleTrigger>
                  <CollapsibleContent className="border-l border-r border-b border-gray-200 rounded-b-lg bg-white p-4">
                    <div className="space-y-4">
                      {formData.features.map((feature, index) => (
                        <div
                          key={index}
                          className="border border-gray-200 rounded-lg p-4"
                        >
                          <div className="flex items-center gap-3 mb-3">
                            <Input
                              value={feature.name}
                              onChange={(e) =>
                                updateFeature(index, "name", e.target.value)
                              }
                              placeholder="Enter What they Gain"
                              className="flex-1 h-10"
                              disabled={featureFileLoading[index]}
                            />
                            {formData.features.length > 1 && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeFeature(index)}
                                className="text-gray-400 hover:text-red-500 p-2"
                                disabled={featureFileLoading[index]}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            )}
                          </div>

                          {feature.files.length === 0 ? (
                            <div>
                              <div
                                className={`border-2 border-dashed border-gray-300 rounded-lg p-4 text-center transition-colors cursor-pointer ${
                                  featureFileLoading[index] 
                                    ? "opacity-50 cursor-not-allowed" 
                                    : "hover:border-green-400"
                                }`}
                                onDragOver={featureFileLoading[index] ? undefined : handleDragOver}
                                onDrop={featureFileLoading[index] ? undefined : (e) => handleDrop(e, "feature", index)}
                                onClick={featureFileLoading[index] ? undefined : () =>
                                  featureFileInputRefs.current[index]?.click()
                                }
                              >
                                <input
                                  type="file"
                                  ref={(el) => {
                                    featureFileInputRefs.current[index] = el;
                                  }}
                                  onChange={(e) =>
                                    handleFeatureFileUpload(index, e)
                                  }
                                  accept="*/*"
                                  className="hidden"
                                  disabled={featureFileLoading[index]}
                                />
                                {featureFileLoading[index] ? (
                                  <div className="flex flex-col items-center">
                                    <Loader2 className="w-8 h-8 mx-auto mb-2 text-green-500 animate-spin" />
                                    <div className="text-sm text-green-600">Uploading...</div>
                                  </div>
                                ) : (
                                  <>
                                    <Upload className="w-8 h-8 mx-auto mb-2 text-green-500" />
                                    <div className="flex items-center justify-center gap-2 text-sm">
                                      <span className="text-green-600">
                                        Click to Upload
                                      </span>
                                      <span className="text-gray-500">
                                        or drag and drop
                                      </span>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">
                                      (Max File size: 25 MB)
                                    </p>
                                  </>
                                )}
                              </div>
                              {fileErrors[`feature-${index}`] && (
                                <p className="text-red-500 text-xs mt-1">
                                  {fileErrors[`feature-${index}`]}
                                </p>
                              )}
                            </div>
                          ) : (
                            <div className="relative inline-block">
                              {featureFileLoading[index] && (
                                <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center rounded-lg">
                                  <Loader2 className="w-6 h-6 text-green-500 animate-spin" />
                                </div>
                              )}
                              {feature.files[0].endsWith(".pdf") ? (
                                <div className="w-full h-32 flex items-center justify-center bg-gray-100 rounded-lg border border-gray-200">
                                  <FileIcon className="w-12 h-12 text-gray-500" />
                                </div>
                              ) : (
                                <img
                                  src={feature.files[0]}
                                  alt="Feature"
                                  className="w-full h-32 object-cover rounded-lg border border-gray-200"
                                />
                              )}
                              <button
                                onClick={() => removeFeatureFile(index)}
                                className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 transition-colors"
                                disabled={featureFileLoading[index]}
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          )}
                        </div>
                      ))}

                      <div className="flex items-center">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={addFeature}
                          className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
                        >
                          <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white">
                            <Plus className="h-3 w-3" />
                          </div>
                          <span className="text-sm">Add</span>
                        </Button>
                      </div>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              </div>

              {/* Chief Guest section - keeping all existing code */}
              <div className="mt-6">
                <Collapsible
                  open={chiefGuestOpen}
                  onOpenChange={setChiefGuestOpen}
                >
                  <CollapsibleTrigger className="flex items-center justify-between w-full p-4 border border-gray-200 rounded-lg bg-white hover:bg-gray-50 transition-colors">
                    <span className="text-sm font-medium text-gray-700">
                      Chief Guest
                    </span>
                    {chiefGuestOpen ? (
                      <ChevronUp className="h-4 w-4 text-gray-500" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-gray-500" />
                    )}
                  </CollapsibleTrigger>
                  <CollapsibleContent className="border-l border-r border-b border-gray-200 rounded-b-lg bg-white p-4">
                    <div className="space-y-4">
                      {formData.chiefGuests.map((guest, index) => (
                        <div
                          key={index}
                          className="border border-gray-200 rounded-lg p-4"
                        >
                          <div className="flex items-center gap-3 mb-3">
                            <Input
                              value={guest.name}
                              onChange={(e) =>
                                updateChiefGuest(index, "name", e.target.value)
                              }
                              placeholder="Enter Chief Guest Name"
                              className="flex-1 h-10"
                              disabled={chiefGuestImageLoading[index]}
                            />
                            {formData.chiefGuests.length > 1 && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeChiefGuest(index)}
                                className="text-gray-400 hover:text-red-500 p-2"
                                disabled={chiefGuestImageLoading[index]}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            )}
                          </div>

                          {!guest.image ? (
                            <div>
                              <div
                                className={`border-2 border-dashed border-gray-300 rounded-lg p-4 text-center transition-colors cursor-pointer ${
                                  chiefGuestImageLoading[index]
                                    ? "opacity-50 cursor-not-allowed"
                                    : "hover:border-green-400"
                                }`}
                                onDragOver={chiefGuestImageLoading[index] ? undefined : handleDragOver}
                                onDrop={chiefGuestImageLoading[index] ? undefined : (e) => handleDrop(e, "chiefGuest", index)}
                                onClick={chiefGuestImageLoading[index] ? undefined : () =>
                                  chiefGuestImageInputRefs.current[index]?.click()
                                }
                              >
                                <input
                                  type="file"
                                  ref={(el) => {
                                    chiefGuestImageInputRefs.current[index] = el;
                                  }}
                                  onChange={(e) =>
                                    handleChiefGuestImageUpload(index, e)
                                  }
                                  accept="image/*"
                                  className="hidden"
                                  disabled={chiefGuestImageLoading[index]}
                                />
                                {chiefGuestImageLoading[index] ? (
                                  <div className="flex flex-col items-center">
                                    <Loader2 className="w-8 h-8 mx-auto mb-2 text-green-500 animate-spin" />
                                    <div className="text-sm text-green-600">Uploading...</div>
                                  </div>
                                ) : (
                                  <>
                                    <Upload className="w-8 h-8 mx-auto mb-2 text-green-500" />
                                    <div className="flex items-center justify-center gap-2 text-sm">
                                      <span className="text-green-600">
                                        Click to Upload
                                      </span>
                                      <span className="text-gray-500">
                                        or drag and drop
                                      </span>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">
                                      (Max File size: 25 MB)
                                    </p>
                                  </>
                                )}
                              </div>
                              {fileErrors[`chiefGuest-${index}`] && (
                                <p className="text-red-500 text-xs mt-1">
                                  {fileErrors[`chiefGuest-${index}`]}
                                </p>
                              )}
                            </div>
                          ) : (
                            <div className="relative inline-block">
                              {chiefGuestImageLoading[index] && (
                                <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center rounded-lg">
                                  <Loader2 className="w-6 h-6 text-green-500 animate-spin" />
                                </div>
                              )}
                              <img
                                src={guest.image}
                                alt="Chief Guest"
                                className="w-full h-32 object-cover rounded-lg border border-gray-200"
                              />
                              <button
                                onClick={() => removeChiefGuestImage(index)}
                                className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 transition-colors"
                                disabled={chiefGuestImageLoading[index]}
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          )}
                        </div>
                      ))}

                      <div className="flex items-center">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={addChiefGuest}
                          className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
                        >
                          <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white">
                            <Plus className="h-3 w-3" />
                          </div>
                          <span className="text-sm">Add</span>
                        </Button>
                      </div>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              </div>
            </div>
          </div>

          {/* Right side column - keeping all existing code */}
          <div className="xl:col-span-2">
            <div className="bg-white rounded-xl p-8 shadow-sm sticky top-6">
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <Label className="text-sm font-medium text-gray-700">
                    Upload Cover Image(2:1) with high quality<span className="text-red-500">*</span>
                  </Label>
                </div>

                {formData.coverImage ? (
                  <div className="relative">
                    {coverImageLoading && (
                      <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center rounded-xl z-10">
                        <Loader2 className="w-8 h-8 text-green-500 animate-spin" />
                      </div>
                    )}
                    <img
                      src={formData.coverImage}
                      alt="Cover"
                      className="w-full h-48 object-cover rounded-xl border border-gray-200"
                    />
                    <button
                      onClick={removeCoverImage}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 transition-colors"
                      disabled={coverImageLoading}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <div>
                    <div
                      className={`border-2 border-dashed border-gray-300 rounded-xl p-8 text-center bg-gray-50 cursor-pointer transition-colors ${
                        coverImageLoading
                          ? "opacity-50 cursor-not-allowed"
                          : "hover:border-green-400"
                      }`}
                      onDragOver={coverImageLoading ? undefined : handleDragOver}
                      onDrop={coverImageLoading ? undefined : (e) => handleDrop(e, "cover")}
                      onClick={coverImageLoading ? undefined : () => coverImageInputRef.current?.click()}
                    >
                      <input
                        type="file"
                        ref={coverImageInputRef}
                        onChange={handleCoverImageUpload}
                        accept="image/*"
                        className="hidden"
                        disabled={coverImageLoading}
                      />
                      {coverImageLoading ? (
                        <div className="flex flex-col items-center">
                          <Loader2 className="w-16 h-16 mx-auto mb-4 text-green-500 animate-spin" />
                          <p className="text-sm text-green-600 mb-2">
                            Uploading cover image...
                          </p>
                        </div>
                      ) : (
                        <>
                          <div className="w-16 h-16 mx-auto mb-4 text-gray-400">
                            <Upload className="w-full h-full" />
                          </div>
                          <p className="text-sm text-gray-600 mb-2">
                            Drag & drop images here, or click to select
                          </p>
                          <p className="text-xs text-gray-500">
                            Supports: JPEG, PNG, JPG
                          </p>
                          <p className="text-xs text-gray-500">Max 50mb</p>
                        </>
                      )}
                    </div>
                    {fileErrors.coverImage && (
                      <p className="text-red-500 text-xs mt-1">
                        {fileErrors.coverImage}
                      </p>
                    )}
                  </div>
                )}
                {errors.coverImage && (
                  <span className="text-red-500 text-xs">
                    {errors.coverImage}
                  </span>
                )}
              </div>
<div className="mb-8">
  <Label className="text-sm font-medium text-gray-700 mb-3 block">
    Category
  </Label>

  <Collapsible
    open={openCategoryDropdown}
    onOpenChange={setOpenCategoryDropdown}
  >
    <CollapsibleTrigger asChild>
      <Button
        variant="outline"
        className="w-full justify-between h-12 font-normal text-left border-gray-300 hover:border-green-500"
      >
       <span
  className={`${
    formData.category ? "text-gray-900 font-semibold" : "text-gray-500"
  }`}
>
  {formData.category || "Select Category"}
</span>

        {openCategoryDropdown ? (
          <ChevronUp className="h-4 w-4 text-gray-500" />
        ) : (
          <ChevronDown className="h-4 w-4 text-gray-500" />
        )}
      </Button>
    </CollapsibleTrigger>

    <CollapsibleContent className="w-full p-4 shadow-lg border rounded-lg">
      <div className="grid grid-cols-2 gap-3 max-h-60 overflow-y-auto scrollbar-hide">
        {/* Predefined + custom category buttons */}
        {categories.map((category) => (
          <button
            key={category}
            type="button"
            onClick={() => updateFormData("category", category)}
            className={`px-3 py-2 text-sm rounded-lg text-left transition-all font-medium ${
              formData.category === category
                ? "bg-green-500 text-white shadow-md"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200"
            }`}
          >
            {category}
          </button>
        ))}

        {/* Others button */}
        <Popover open={categoryOthersOpen} onOpenChange={setCategoryOthersOpen}>
          <PopoverTrigger asChild>
            <button
              type="button"
              className="px-3 py-2 text-sm rounded-lg text-left font-medium bg-white text-green-600 border border-dashed border-green-300 hover:bg-green-50"
            >
              + Others
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-64" align="start">
            <div className="space-y-2">
              <Label className="text-xs text-gray-600">Enter custom category</Label>
              <Input
                value={categoryOthersValue}
                onChange={(e) => setCategoryOthersValue(e.target.value)}
                placeholder="Type category"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addCustomCategory();
                  }
                }}
              />
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setCategoryOthersValue("");
                    setCategoryOthersOpen(false);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={addCustomCategory}
                  className="bg-green-500 text-white"
                >
                  Add
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </CollapsibleContent>
  </Collapsible>

  {/* Show selected category below */}
  {/* {formData.category && (
    <div className="mt-4 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm w-max">
      Selected Category: <span className="font-medium">{formData.category}</span>
    </div>
  )} */}
</div>



              {formData.venueStatus === "offline" && (
                <div className="mb-8">
                  <Label className="text-sm font-medium text-gray-700 mb-3 block">
                    Choose Key Sectors
                  </Label>
                  <Collapsible
                    open={openSectorsDropdown}
                    onOpenChange={setOpenSectorsDropdown}
                  >
                    <CollapsibleTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-between h-12 font-normal text-left border-gray-300 hover:border-green-500"
                      >
                        <span className="text-gray-500">Select Sectors</span>
                        {openSectorsDropdown ? (
                          <ChevronUp className="h-4 w-4 text-gray-500" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-gray-500" />
                        )}
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="w-full p-4 shadow-lg border rounded-lg">
                      <div className="grid grid-cols-2 gap-3 max-h-60 overflow-y-auto scrollbar-hide">
                        {sectorsData.map((sector) => (
                          <button
                            key={sector}
                            type="button"
                            onClick={() => toggleArrayItem("sectors", sector)}
                            className={`px-3 py-2 text-sm rounded-lg text-left transition-all font-medium ${
                              formData.sectors.includes(sector)
                                ? "bg-green-500 text-white shadow-md"
                                : "bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200"
                            }`}
                          >
                            {sector}
                          </button>
                        ))}

                        <Popover open={sectorsOthersOpen} onOpenChange={setSectorsOthersOpen}>
                          <PopoverTrigger asChild>
                            <button
                              type="button"
                              className="px-3 py-2 text-sm rounded-lg text-left font-medium bg-white text-green-600 border border-dashed border-green-300 hover:bg-green-50"
                            >
                              + Others
                            </button>
                          </PopoverTrigger>
                          <PopoverContent className="w-64" align="start">
                            <div className="space-y-2">
                              <Label className="text-xs text-gray-600">Enter custom sector</Label>
                              <Input
                                value={sectorsOthersValue}
                                onChange={(e) => setSectorsOthersValue(e.target.value)}
                                placeholder="Type sector"
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") {
                                    e.preventDefault();
                                    addCustomSector();
                                  }
                                }}
                              />
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setSectorsOthersValue("");
                                    setSectorsOthersOpen(false);
                                  }}
                                >
                                  Cancel
                                </Button>
                                <Button size="sm" onClick={addCustomSector} className="bg-green-500 text-white">
                                  Add
                                </Button>
                              </div>
                            </div>
                          </PopoverContent>
                        </Popover>
                      </div>
                    </CollapsibleContent>
                  </Collapsible>

                  {formData.sectors.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-4">
                      {formData.sectors.map((sector) => (
                        <div
                          key={sector}
                          className="flex items-center gap-1 bg-gray-100 text-gray-700 px-3 py-2 rounded-full text-sm border"
                        >
                          <span>{sector}</span>
                          <button
                            onClick={() => toggleArrayItem("sectors", sector)}
                            className="text-gray-500 hover:text-red-500 ml-1"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {formData.venueStatus === "offline" && (
                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-3 block">
                    Choose Amenities What You Provide (Choose all that apply)
                  </Label>
                  <Collapsible
                    open={openAmenitiesDropdown}
                    onOpenChange={setOpenAmenitiesDropdown}
                  >
                    <CollapsibleTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-between h-12 font-normal text-left border-gray-300 hover:border-green-500"
                      >
                        <span className="text-gray-500">Select Amenities</span>
                        {openAmenitiesDropdown ? (
                          <ChevronUp className="h-4 w-4 text-gray-500" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-gray-500" />
                        )}
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="w-full p-4 shadow-lg border rounded-lg">
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-60 overflow-y-auto scrollbar-hide">
                        {amenitiesData.map((amenity) => (
                          <button
                            key={amenity.name}
                            type="button"
                            onClick={() => toggleArrayItem("amenities", amenity.name)}
                            className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg border transition-all text-left ${
                              formData.amenities.includes(amenity.name)
                                ? "bg-green-500 text-white border-green-500 shadow-md"
                                : "bg-white text-gray-700 border-gray-300 hover:border-green-300 hover:shadow-sm"
                            }`}
                          >
                            <span
                              className={
                                formData.amenities.includes(amenity.name)
                                  ? "text-white"
                                  : "text-gray-600"
                              }
                            >
                              {amenity.icon}
                            </span>
                            <span className="truncate">{amenity.name}</span>
                          </button>
                        ))}

                        <Popover open={amenitiesOthersOpen} onOpenChange={setAmenitiesOthersOpen}>
                          <PopoverTrigger asChild>
                            <button
                              type="button"
                              className="px-3 py-2 text-sm rounded-lg text-left font-medium bg-white text-green-600 border border-dashed border-green-300 hover:bg-green-50"
                            >
                              + Others
                            </button>
                          </PopoverTrigger>
                          <PopoverContent className="w-64" align="start">
                            <div className="space-y-2">
                              <Label className="text-xs text-gray-600">Enter custom amenity</Label>
                              <Input
                                value={amenitiesOthersValue}
                                onChange={(e) => setAmenitiesOthersValue(e.target.value)}
                                placeholder="Type amenity"
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") {
                                    e.preventDefault();
                                    addCustomAmenity();
                                  }
                                }}
                              />
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setAmenitiesOthersValue("");
                                    setAmenitiesOthersOpen(false);
                                  }}
                                >
                                  Cancel
                                </Button>
                                <Button size="sm" onClick={addCustomAmenity} className="bg-green-500 text-white">
                                  Add
                                </Button>
                              </div>
                            </div>
                          </PopoverContent>
                        </Popover>
                      </div>
                    </CollapsibleContent>
                  </Collapsible>

                  {formData.amenities.length > 0 && (
                    <div className="flex flex-wrap gap-3 mt-4">
                      {formData.amenities.map((amenity) => {
                        const amenityData = amenitiesData.find((a) => a.name === amenity);
                        return (
                          <div
                            key={amenity}
                            className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-full text-sm font-medium shadow-md"
                          >
                            <span>{amenityData?.icon}</span>
                            <span>{amenity}</span>
                            <button
                              onClick={() => toggleArrayItem("amenities", amenity)}
                              className="text-white hover:text-red-200 ml-1"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-center mt-12">
          <Button
            onClick={handleSaveAndProceed}
            className="bg-green-500 hover:bg-green-600 text-white px-16 py-6 text-lg font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all"
          >
            Save and Proceed
          </Button>
        </div>
        <br />
      </div>
    </div>
  );
};

export default EventDetailsTab;
