import axios from "axios";

export async function getDistanceInKm(originPincode: string, destPincode: string): Promise<number> {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const url = `https://maps.googleapis.com/maps/api/distancematrix/json?units=metric&origins=${originPincode}&destinations=${destPincode}&key=${apiKey}`;

  const res = await axios.get(url);
  const data = res.data;

  if (data.status !== "OK" || data.rows[0].elements[0].status !== "OK") {
    throw new Error("Failed to fetch distance from Google Maps API");
  }

  const distanceInMeters = data.rows[0].elements[0].distance.value;
  return distanceInMeters / 1000; // convert to KM
}
