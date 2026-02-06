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
  const apiUrl = "http://localhost:3001"
  // const res = await fetch("/api/pricing-detail-page", {
  const res = await fetch(`${apiUrl}/api/pricing/calculate-detail`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
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
