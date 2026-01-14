export default async function fetchDynamicPrice({
  facilityId,
  rentalPlan,
  unitCount,
  bookingSeats,
}: {
  facilityId: string;
  rentalPlan: string;
  unitCount: number;
  bookingSeats: number;
}) {
  const res = await fetch("/api/affiliate/user/pricing-detail-page", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      facilityId,
      rentalPlan,
      unitCount,
      bookingSeats, // Include bookingSeats in the request
    }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to fetch price");
  return data.data;
}
