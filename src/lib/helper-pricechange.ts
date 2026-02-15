import axios from "axios";

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
  const apiUrl = "http://localhost:3001";
  try {
    const res = await axios.post(
      `${apiUrl}/api/pricing/calculate-detail`,
      {
        facilityId,
        rentalPlan,
        unitCount,
        bookingSeats,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
      }
    );

    const data = res.data;
    return data.data;
  } catch (err: any) {
    const message = err?.response?.data?.error || err?.message || "Failed to fetch price";
    throw new Error(message);
  }
}
