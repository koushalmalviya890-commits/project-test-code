"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { FacilityCard } from "@/components/ui/facility-card-affliate";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { X, ChevronLeft, ChevronRight, MapPin, Clock, Wifi, Coffee, CheckCircle, Phone, Mail, Globe, UserCircle, ChevronDown, ChevronUp } from "lucide-react";
import { AMENITY_ICONS } from "@/components";
import { AnimatePresence, motion } from "framer-motion";

// Define interfaces
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

interface FacilityType {
  type: string;
  count: number;
  originalType?: string;
}

interface ServiceProvider {
  _id: string;
  serviceName: string | null;
  serviceProviderType: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  pincode: string | null;
  logoUrl: string | null;
  images: string[];
  features: string[];
  facilityTypes: FacilityType[];
  timings: Timings;
  primaryContact1Name: string | null;
  primaryContact1Designation: string | null;
  primaryContactNumber: string | null;
  primaryEmailId: string | null;
  websiteUrl: string | null;
}

interface Facility {
  _id: string;
  serviceProviderId: string;
  facilityType: string;
  status: string;
  details: {
    name: string;
    images: string[];
    rentalPlans?: Array<{
      name: string;
      price: number;
      duration: string;
    }>;
    description?: string;
  };
  address: string;
  city: string;
  state: string;
  country: string;
  pincode: string;
  features: string[];
  isFeatured: boolean;
  serviceProvider: {
    serviceName: string;
    serviceProviderType: string;
    features: string[];
  };
}

interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasMore: boolean;
}

export default function ViewProviderClient({
  providerId,
  affiliateId,
}: {
  providerId: string;
  affiliateId: string;
}) {
  const { data: session } = useSession();
  const [provider, setProvider] = useState<ServiceProvider | null>(null);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<number>(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [fullscreenIndex, setFullscreenIndex] = useState(0);
  const [mapUrl, setMapUrl] = useState<string | null>(null);
  const [hoveredFacilityId, setHoveredFacilityId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("about");
  const [pagination, setPagination] = useState<Pagination>({
    total: 0,
    page: 1,
    limit: 6,
    totalPages: 1,
    hasMore: false,
  });
  const [loadingFacilities, setLoadingFacilities] = useState(false);
  const [showAllTimings, setShowAllTimings] = useState(false);
  const [currentDay, setCurrentDay] = useState<string>("");

  // Track visitor when component mounts with affiliateId
  useEffect(() => {
    if (affiliateId) {
      const trackVisitor = async () => {
        try {
          const response = await fetch("/api/affiliate/user/visitors", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ affiliateId }),
          });

          if (!response.ok) {
            console.error("Failed to track visitor:", response.statusText);
          }
        } catch (error) {
          console.error("Error tracking visitor:", error);
        }
      };

      trackVisitor();
    }
  }, [affiliateId]);

  // Fetch service provider data
  useEffect(() => {
    const fetchServiceProvider = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/service-providers/${providerId}`);
        if (!response.ok) {
          if (response.status === 401) {
            setError("You need to sign in to view provider details");
            return;
          }
          throw new Error("Failed to fetch service provider details");
        }
        const data = await response.json();

        const provider = {
          ...data,
          address: data.address && data.address !== "" ? data.address : null,
          city: data.city && data.city !== "" ? data.city : null,
          state: data.stateProvince && data.stateProvince !== "" ? data.stateProvince : null,
          pincode: data.zipPostalCode && data.zipPostalCode !== "" ? data.zipPostalCode : null,
        };

        setProvider(provider);

        if (provider.address) {
          const fullAddress = [provider.address, provider.city, provider.state, provider.pincode].filter(Boolean).join(", ");
          const mapResponse = await fetch(`/api/maps?query=${encodeURIComponent(fullAddress)}`);
          if (mapResponse.ok) {
            const mapData = await mapResponse.json();
            setMapUrl(mapData.embedUrl);
          }
        }
      } catch (error) {
        console.error("Error fetching service provider:", error);
        setError("Failed to load service provider details");
      } finally {
        setLoading(false);
      }
    };

    if (providerId) {
      fetchServiceProvider();
    }
  }, [providerId]);

  // Fetch facilities for this service provider
  useEffect(() => {
    const fetchFacilities = async () => {
      try {
        setLoadingFacilities(true);
        const response = await fetch(`/api/service-providers/${providerId}/facilities?page=${pagination.page}&limit=${pagination.limit}`);

        if (!response.ok) {
          if (response.status === 401) {
            //// console.log("Authentication required to view facilities");
            setFacilities([]);
            return;
          }
          throw new Error(`Failed to fetch facilities: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        setFacilities(data.facilities);
        setPagination(data.pagination);
      } catch (error) {
        console.error("Error fetching facilities:", error);
        setFacilities([]);
      } finally {
        setLoadingFacilities(false);
      }
    };

    if (providerId && activeTab === "facilities") {
      fetchFacilities();
    }
  }, [providerId, pagination.page, pagination.limit, activeTab]);

  // Set current day on component mount
  useEffect(() => {
    const days = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
    const today = days[new Date().getDay()];
    setCurrentDay(today);
  }, []);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    if (value === "facilities" && pagination.page !== 1) {
      setPagination((prev) => ({ ...prev, page: 1 }));
    }
  };

  const goToNextPage = () => {
    if (pagination.hasMore) {
      setPagination((prev) => ({ ...prev, page: prev.page + 1 }));
    }
  };

  const goToPreviousPage = () => {
    if (pagination.page > 1) {
      setPagination((prev) => ({ ...prev, page: prev.page - 1 }));
    }
  };

  const goToPage = (page: number) => {
    if (page >= 1 && page <= pagination.totalPages) {
      setPagination((prev) => ({ ...prev, page }));
    }
  };

  const nextImage = () => {
    if (!provider?.images?.length) return;
    setSelectedImage((prev) => (prev + 1) % provider.images.length);
  };

  const previousImage = () => {
    if (!provider?.images?.length) return;
    setSelectedImage((prev) => (prev - 1 + provider.images.length) % provider.images.length);
  };

  const openFullscreen = (index: number) => {
    setFullscreenIndex(index);
    setIsFullscreen(true);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isFullscreen) return;

      switch (e.key) {
        case "ArrowRight":
          if (provider?.images) {
            setFullscreenIndex((prev) => (prev + 1) % provider.images.length);
          }
          break;
        case "ArrowLeft":
          if (provider?.images) {
            setFullscreenIndex((prev) => (prev - 1 + provider.images.length) % provider.images.length);
          }
          break;
        case "Escape":
          setIsFullscreen(false);
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isFullscreen, provider?.images]);

  const formatDayName = (day: string): string => {
    return day.charAt(0).toUpperCase() + day.slice(1);
  };

  const getTimingText = (timing: DayTiming): string => {
    if (!timing.isOpen) return "Closed";
    return `${timing.openTime} - ${timing.closeTime}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !provider) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">{error ? "Something went wrong" : "Service provider not found"}</h2>
        <p className="text-gray-600 mb-6">{error || "We could not find the service provider you are looking for."}</p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Button asChild>
            <a href="/ProviderSearch">Browse Service Providers</a>
          </Button>
          {error === "You need to sign in to view provider details" && (
            <Button variant="outline" asChild>
              <a href="/sign-in">Sign In</a>
            </Button>
          )}
        </div>
      </div>
    );
  }

  const images = provider.images && provider.images.length > 0 ? provider.images : [provider.logoUrl || "/placeholder-image.jpg"];

  return (
    <div className="bg-white">
      <div className="container mx-auto px-8 py-12 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{provider.serviceName || "Unnamed Provider"}</h1>
          <div className="flex items-center text-gray-600">
            <MapPin className="h-4 w-4 mr-1" />
            <p>{provider.address || "No address provided"}</p>
          </div>
        </div>

        {images.length > 0 && (
          <div className="mb-8">
            {images.length === 1 ? (
              <div className="relative aspect-[16/9] w-full">
                <Image
                  src={images[0]}
                  alt={provider.serviceName || "Service Provider"}
                  fill
                  className="rounded-md object-contain cursor-pointer"
                  onClick={() => openFullscreen(0)}
                />
              </div>
            ) : (
              <div className="grid grid-cols-12 gap-3">
                <div className="col-span-12 md:col-span-8 relative aspect-[16/9]">
                  <Image
                    src={images[selectedImage]}
                    alt={provider.serviceName || "Service Provider"}
                    fill
                    className="rounded-md object-contain cursor-pointer"
                    onClick={() => openFullscreen(selectedImage)}
                  />
                </div>
                <div className="col-span-12 md:col-span-4 grid grid-cols-2 gap-3 h-full">
                  {images.map((image, index) => {
                    if (index >= 4) return null;
                    if (index === selectedImage) return null;
                    return (
                      <div key={index} className="relative aspect-square bg-gray-50">
                        <Image
                          src={image}
                          alt={`${provider.serviceName || "Service Provider"} - Image ${index + 1}`}
                          fill
                          className="rounded-md object-contain cursor-pointer hover:opacity-90 transition-opacity"
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

        {isFullscreen && (
          <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center">
            <button className="absolute top-4 right-4 text-white p-2 rounded-full bg-black/50 hover:bg-black/70" onClick={() => setIsFullscreen(false)}>
              <X className="h-6 w-6" />
            </button>
            <button
              className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white p-2 rounded-full bg-black/50 hover:bg-black/70"
              onClick={() => setFullscreenIndex((prev) => (prev - 1 + images.length) % images.length)}
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <div className="relative h-[80vh] w-[80vw] bg-gray-800/20 rounded-lg">
              <Image src={images[fullscreenIndex] || "/placeholder-image.jpg"} alt={provider.serviceName || "Service Provider"} fill className="object-contain" />
            </div>
            <button
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white p-2 rounded-full bg-black/50 hover:bg-black/70"
              onClick={() => setFullscreenIndex((prev) => (prev + 1) % images.length)}
            >
              <ChevronRight className="h-6 w-6" />
            </button>
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white">
              {fullscreenIndex + 1} / {images.length}
            </div>
          </div>
        )}
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <Tabs defaultValue="about" onValueChange={handleTabChange} className="w-full">
          <div className="border-b border-gray-200">
            <TabsList className="flex h-10 items-center justify-start space-x-8 bg-transparent p-0">
              <TabsTrigger
                value="about"
                className="data-[state=active]:border-b-2 data-[state=active]:border-black data-[state=active]:font-semibold data-[state=active]:shadow-none px-1 pb-3 text-lg bg-transparent"
              >
                About
              </TabsTrigger>
              <TabsTrigger
                value="facilities"
                className="data-[state=active]:border-b-2 data-[state=active]:border-black data-[state=active]:font-semibold data-[state=active]:shadow-none px-1 pb-3 text-lg bg-transparent"
              >
                Facilities
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="about" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-8">
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold text-gray-800">Amenities</h2>
                  {provider.features && provider.features.length > 0 ? (
                    <div className="grid grid-cols-2 gap-4">
                      {provider.features.map((feature, index) => {
                        const IconComponent = AMENITY_ICONS[feature as keyof typeof AMENITY_ICONS] || CheckCircle;
                        return (
                          <div key={index} className="flex items-center gap-2">
                            <IconComponent className="h-5 w-5 text-gray-600" />
                            <span className="text-gray-700">{feature}</span>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-gray-500">No amenities listed</p>
                  )}
                </div>
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold text-gray-800">Contact Information</h2>
                  <div className="space-y-3">
                    {provider.primaryContact1Name && (
                      <div className="flex items-center gap-2">
                        <UserCircle className="h-5 w-5 text-gray-600" />
                        <div>
                          <p className="text-gray-700">{provider.primaryContact1Name}</p>
                          {provider.primaryContact1Designation && (
                            <p className="text-gray-500 text-sm">{provider.primaryContact1Designation}</p>
                          )}
                        </div>
                      </div>
                    )}
                    {provider.primaryContactNumber && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-5 w-5 text-gray-600" />
                        <span className="font-semibold text-gray-900">{provider.primaryContactNumber}</span>
                      </div>
                    )}
                    {provider.primaryEmailId && (
                      <div className="flex items-center gap-2">
                        <Mail className="h-5 w-5 text-gray-600" />
                        <span className="font-semibold text-gray-900">{provider.primaryEmailId}</span>
                      </div>
                    )}
                    {provider.websiteUrl && (
                      <div className="flex items-center gap-2">
                        <Globe className="h-5 w-5 text-gray-600" />
                        <a
                          href={provider.websiteUrl.startsWith("http") ? provider.websiteUrl : `https://${provider.websiteUrl}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-semibold text-gray-900 hover:underline"
                        >
                          {provider.websiteUrl}
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="space-y-8">
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold text-gray-800">Address</h2>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      {provider.address && (
                        <div>
                          <p className="text-sm text-gray-500">Address</p>
                          <p className="text-gray-700">{provider.address || "Not provided"}</p>
                        </div>
                      )}
                      {provider.city && (
                        <div>
                          <p className="text-sm text-gray-500">City</p>
                          <p className="text-gray-700">{provider.city || "Not provided"}</p>
                        </div>
                      )}
                      {provider.state && (
                        <div>
                          <p className="text-sm text-gray-500">State</p>
                          <p className="text-gray-700">{provider.state || "Not provided"}</p>
                        </div>
                      )}
                      {provider.pincode && (
                        <div>
                          <p className="text-sm text-gray-500">Pincode</p>
                          <p className="text-gray-700">{provider.pincode || "Not provided"}</p>
                        </div>
                      )}
                    </div>
                    {(provider.address || provider.city || provider.state || provider.pincode) && (
                      <div className="relative h-64 w-full overflow-hidden rounded-lg">
                        <div
                          className="w-full h-full cursor-pointer relative"
                          onClick={() => {
                            const fullAddress = [provider.address, provider.city, provider.state, provider.pincode].filter(Boolean).join(", ");
                            window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress)}`, "_blank");
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
                    )}
                  </div>
                </div>
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold text-gray-800">Venue Timings</h2>
                  {provider.timings && (
                    <div className="space-y-2">
                      <div className="border border-gray-200 rounded-md overflow-hidden">
                        <div
                          className="bg-gray-50 py-3 px-4 flex justify-between items-center cursor-pointer"
                          onClick={() => setShowAllTimings(!showAllTimings)}
                        >
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-gray-600" />
                            <span className="font-medium">{formatDayName(currentDay)}</span>
                            <Badge variant="outline" className="ml-2 text-xs bg-blue-50 text-blue-700 border-blue-200">
                              Today
                            </Badge>
                          </div>
                          <div className="flex items-center">
                            <span className="text-gray-700 mr-2">{getTimingText(provider.timings[currentDay as keyof Timings])}</span>
                            {showAllTimings ? <ChevronUp className="h-4 w-4 text-gray-500" /> : <ChevronDown className="h-4 w-4 text-gray-500" />}
                          </div>
                        </div>
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
                                {["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]
                                  .filter((day) => day !== currentDay)
                                  .map((day) => (
                                    <div key={day} className="py-3 px-4 flex justify-between items-center">
                                      <span>{formatDayName(day)}</span>
                                      <span className="text-gray-700">{getTimingText(provider.timings[day as keyof Timings])}</span>
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
              </div>
            </div>
          </TabsContent>

          <TabsContent value="facilities" className="mt-6">
            {loadingFacilities ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
              </div>
            ) : facilities.length > 0 ? (
              <div className="mt-8">
                <h3 className="text-xl font-semibold mb-4">Facilities</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {facilities.map((facility) => (
                    <FacilityCard
                      affiliateId={affiliateId}
                      key={facility._id}
                      facility={facility}
                      onMouseEnter={() => setHoveredFacilityId(facility._id)}
                      onMouseLeave={() => setHoveredFacilityId(null)}
                      isHovered={hoveredFacilityId === facility._id}
                    />
                  ))}
                </div>
                {pagination.totalPages > 1 && (
                  <div className="flex justify-center items-center mt-8 space-x-2">
                    <Button variant="outline" size="sm" onClick={goToPreviousPage} disabled={pagination.page === 1}>
                      Previous
                    </Button>
                    {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                      .filter((page) => page === 1 || page === pagination.totalPages || (page >= pagination.page - 1 && page <= pagination.page + 1))
                      .map((page, index, array) => (
                        <React.Fragment key={page}>
                          {index > 0 && array[index - 1] !== page - 1 && <span className="text-gray-500">...</span>}
                          <Button variant={pagination.page === page ? "default" : "outline"} size="sm" onClick={() => goToPage(page)}>
                            {page}
                          </Button>
                        </React.Fragment>
                      ))}
                    <Button variant="outline" size="sm" onClick={goToNextPage} disabled={!pagination.hasMore}>
                      Next
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12">
                <h3 className="text-xl font-semibold mb-2">No Facilities Listed</h3>
                <p className="text-gray-600">This service provider hasn't listed any facilities yet.</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
      <br />
    </div>
  );
}
