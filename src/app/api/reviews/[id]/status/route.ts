// import { getServerSession } from "next-auth";
// import { NextRequest, NextResponse } from "next/server";
// import { authOptions } from "@/lib/auth";
// import { connectToDatabase } from "@/lib/mongodb";
// import { Review } from "@/models/Reviews";
// import Startup from "@/models/Startup";
// import Notification from "@/models/Notification";
// import { ObjectId } from "mongodb";

// export async function PATCH(
//   req: NextRequest,
//   { params }: { params: { id: string } }
// ) {
//   try {
//     const session = await getServerSession(authOptions);
//     if (!session?.user?.role || session.user.role !== "admin") {
//       return new NextResponse("Forbidden", { status: 403 });
//     }

//     const { id } = params;
//     const { status } = await req.json();

//     if (!["approved", "rejected"].includes(status)) {
//       return NextResponse.json({ error: "Invalid status" }, { status: 400 });
//     }

//     const { db } = await connectToDatabase();

//     const updatedReview = await Review.findByIdAndUpdate(
//       id,
//       { status },
//       { new: true }
//     );

//     if (!updatedReview) {
//       return NextResponse.json({ error: "Review not found" }, { status: 404 });
//     }

//     // ✅ Trigger notification only when approved
//     if (status === "approved") {
//       try {
//         const { startupId, facilityId, incubatorId, rating, comment, bookingId } =
//           updatedReview;

//         const startup = await Startup.findOne({ userId: startupId });
//         const facility = await db
//           .collection("Facilities")
//           .findOne({ _id: new ObjectId(facilityId) });

//         if (startup && facility) {
//           await Notification.create({
//             userId: incubatorId,
//             type: "booking-approved",
//             title: "Review Approved",
//             message: `${startup.startupName} review for ${facility.details?.name || "your facility"} is now live.`,
//             relatedId: bookingId,
//             relatedType: "booking",
//             isRead: false,
//             metadata: {
//               startupName: startup.startupName || "",
//               facilityName: facility.details?.name || "",
//               rating,
//               comment,
//             },
//           });

//          // console.log("✅ Review approval notification sent to provider");
//         } else {
//           console.warn("⚠️ Missing startup or facility for notification");
//         }
//       } catch (notifyErr) {
//         console.error("❌ Error sending notification:", notifyErr);
//       }
//     }

//     return NextResponse.json({
//       message: `Review ${status}`,
//       review: updatedReview,
//     });
//   } catch (error) {
//     console.error("Error in PATCH /api/reviews/:id/status:", error);
//     return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
//   }
// }
