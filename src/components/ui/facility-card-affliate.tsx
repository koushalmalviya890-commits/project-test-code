"use client";
import React from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { FacilityBadge } from "@/components/ui/facility-badge";
import { cn } from "@/lib/utils";
// import { useSession } from "next-auth/react";
import { useAuth } from "@/context/AuthContext";
import { getFixedServiceFee } from "@/lib/pricing";

export interface FacilityCardProps {
  facility: {
    _id: string;
    details: {
      name: string;
      images: string[];
      rentalPlans?: Array<{
        name: string;
        price: number;
        duration: string;
      }>;
    };
    address: string;
    features: string[];
    serviceProvider?: {
      serviceName: string;
      features?: string[];
    };
    facilityType: string;
  };
  affiliateId?: string; // Added affiliateId property
  isHovered: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  isFeatured?: boolean;
  className?: string;
}

export function FacilityCard({
  affiliateId,
  facility,
  isHovered,
  onMouseEnter,
  onMouseLeave,
  isFeatured = true,
  className,
}: FacilityCardProps) {
  // const { data: session } = useSession();
  const { user } = useAuth();
  // const session = user; // For compatibility with previous code
  const [finalPrice, setFinalPrice] = React.useState<number | null>(null);
const [reviewStats, setReviewStats] = React.useState<{
  totalReviews: number;
  averageRating: number;
} | null>(null);
React.useEffect(() => {
  const fetchFinalPrice = async () => {
    if (!facility.details.rentalPlans?.length) return; // removed session check

    const lowestBasePrice = Math.min(...facility.details.rentalPlans.map(plan => plan.price));

    try {
      const res = await fetch("/api/affiliate/user/pricing", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          facilityId: facility._id,
          basePrice: lowestBasePrice,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setFinalPrice(data.data.finalPrice);
      } else {
        console.warn("Price fallback:", data.error);
        const fixedFee = getFixedServiceFee(facility.facilityType);
        setFinalPrice(lowestBasePrice + fixedFee);
      }
    } catch (err) {
      console.error("Error fetching price:", err);
    }
  };

  fetchFinalPrice();
}, [facility]); // removed session dependency

React.useEffect(() => {
  const fetchReviewStats = async () => {
    try {
      const res = await fetch(`/api/reviews?facilityId=${facility._id}`);
      const data = await res.json();

      if (res.ok) {
        setReviewStats({
          totalReviews: data.totalReviews,
          averageRating: data.averageRating,
        });
      } else {
        console.warn("Review stats fetch failed:", data.error);
      }
    } catch (err) {
      console.error("Error fetching review stats:", err);
    }
  };

  fetchReviewStats();
}, [facility._id]);

  return (
    <Link 
      href={`/viewDetails/${facility._id}?affiliateId=${affiliateId}`}
      target="_blank"
      rel="noopener noreferrer"
      className="block h-full w-full"
    >
      <Card 
        className={cn(
          "flex flex-col w-full h-full rounded-[13px] overflow-hidden transition-all duration-300 cursor-pointer",
          isHovered 
            ? "shadow-[0px_8px_16px_rgba(0,0,0,0.1)] transform -translate-y-1" 
            : "shadow-[0px_1px_2px_#0000000d]",
          className
        )}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      >
        <div 
          className="relative w-full h-[200px] bg-cover bg-center flex-shrink-0" 
          style={{ backgroundImage: `url(${facility.details.images[0] || '/placeholder-facility.jpg'})` }}
        >
          {isFeatured && (
            <Badge className="absolute top-5 left-0 bg-[#23bb4e] text-white rounded-none w-[110px] h-7 flex items-center justify-center">
              <span className="ml-5 font-semibold text-xs truncate max-w-[80px]">
                FEATURED
              </span>
            </Badge>
          )}
          
          {/* Facility Type Badge */}
          <div className="absolute bottom-5 left-5 z-10">
            <FacilityBadge 
              facilityType={facility.facilityType || "meeting-rooms"} 
              isHovered={isHovered}
              variant="card"
            />
          </div>
        </div>

        <CardContent className="flex flex-col gap-2 pt-3 pb-0 flex-grow overflow-hidden">
          <h3 className="font-extrabold text-base text-black leading-normal line-clamp-2 min-h-[40px] break-words">
            {facility.details.name}
          </h3>
{reviewStats && reviewStats.averageRating > 0 && (
  <div className="flex items-center gap-1 text-sm text-[#555]">
    <span className="font-medium text-[#000]">
      ⭐ {reviewStats.averageRating.toFixed(1)}
    </span>
    <span className="text-xs text-[#666]">({reviewStats.totalReviews} reviews)</span>
  </div>
)}
          <div className="flex flex-col w-full overflow-hidden">
            <div className="text-[14px] text-[#40404099] mb-1 overflow-hidden">
              <span className="font-medium text-[#404040] underline truncate block max-w-full">
                {facility.serviceProvider?.serviceName || "Service Provider"}
              </span>
            </div>
            <div className="text-[13px] text-[#40404099] line-clamp-2 min-h-[36px] break-words">
              {facility.address}
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex justify-between items-center mt-auto py-3 flex-shrink-0 w-full overflow-hidden">
          <div className="flex flex-col gap-0.5 overflow-hidden min-w-0">
            {finalPrice !== null ? (
              <>
                <span className="text-xs text-[#40404099] truncate">
                  Starting from
                </span>
                <span className="font-bold text-base tracking-[0.03px] text-[#0a0b0a] truncate">
                  ₹{finalPrice.toLocaleString()}/-
                </span>
              </>
            ) : (
              <span className="text-xs text-[#40404099] truncate">
                Price on request
              </span>
            )}
          </div>

          <Button
            variant="outline"
            className="w-28 h-[38px] rounded-[11px] border-[#009f2de6] text-[#0a0b0a] text-sm font-medium flex-shrink-0 whitespace-nowrap ml-2"
          >
            View Details
          </Button>
        </CardFooter>
      </Card>
    </Link>
  );
}

export function FacilityCardSkeleton() {
  return (
    <div className="w-full h-full bg-white rounded-[13px] shadow-[0px_1px_2px_#0000000d] overflow-hidden animate-pulse">
      <div className="relative w-full h-[200px] bg-gray-200 rounded-t-[13px] flex-shrink-0">
        <div className="absolute top-5 left-0 bg-gray-300 w-[110px] h-7"></div>
        <div className="absolute bottom-5 left-5 bg-gray-300/50 w-[43px] h-10 rounded-md"></div>
      </div>
      <div className="p-4 flex flex-col h-[calc(100%-200px)] overflow-hidden">
        <div className="h-10 bg-gray-200 rounded w-3/4 mb-3" />
        <div className="h-4 bg-gray-200 rounded w-1/2 mb-2" />
        <div className="mt-auto flex justify-between items-center w-full">
          <div className="h-8 bg-gray-200 rounded w-1/3" />
          <div className="h-10 bg-gray-200 rounded w-1/3" />
        </div>
      </div>
    </div>
  );
}
