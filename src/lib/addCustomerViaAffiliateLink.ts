
// import { Db } from "mongodb";

export async function addCustomerViaAffiliateLink(booking: any) {
  try {
   // console.log("Starting addCustomerViaAffiliateLink for booking:", booking._id.toString());

    const startupMailId = booking.affiliateUserEmail;
    if (!startupMailId) {
      console.warn("No startupMailId found in booking:", booking._id.toString());
      return;
    }

    // Send POST request to /api/affiliate/user/customer
    const response = await fetch(`${process.env.NEXTAUTH_URL || 'https://cumma.in'}/api/affiliate/user/customers`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ startupMailId }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Failed to add customer via affiliate link:", errorData.error);
      return;
    }

    const result = await response.json();
   // console.log("Customer added successfully via affiliate link:", result.message);
  } catch (error) {
    console.error("Error in addCustomerViaAffiliateLink:", error);
  }
}
