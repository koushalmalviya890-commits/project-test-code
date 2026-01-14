// app/api/startup/bookings/extend/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import { BookingExtension } from "@/models/BookingExtension";
import { sendBookingExtensionNotificationToProvider } from "@/lib/email";
import { ObjectId } from "mongodb";
// import db from '@/lib/db'
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { bookingId, extentDays, facilityId, incubatorId, startupId } =
      await request.json();
    const { db } = await connectToDatabase();
    const startup = await db
      .collection("Startups")
      .findOne({ userId: new ObjectId(startupId) });
    const facility = await db
      .collection("Facilities")
      .findOne({ _id: new ObjectId(facilityId) });
   const serviceProvider = await db
  .collection("Service Provider")
  .findOne({ userId: new ObjectId(incubatorId) });

if (!serviceProvider) {
  console.warn('❌ No service provider found for incubatorId:', incubatorId);
}

    if (startup?.startupName && facility?.details?.name && serviceProvider?.primaryEmailId) {
      await sendBookingExtensionNotificationToProvider({
        to: serviceProvider.primaryEmailId,
        startupName: startup.startupName,
        facilityName: facility.details.name,
        extentDays,
      });
}
// console.log("Startup:", startup);
// console.log("Facility:", facility);
// console.log("Service Provider:", serviceProvider);
// console.log("Sending email to:", serviceProvider?.primaryEmailId);
// console.log("startup name ", startup?.startupName)
// console.log("facilityName", facility?.details?.name)
    // Validate input
    if (
      !bookingId ||
      !extentDays ||
      extentDays <= 0 ||
      !incubatorId ||
      !facilityId ||
      !startupId
    ) {
      return NextResponse.json(
        { error: "Invalid booking ID or extension days" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Check if extension request already exists for this booking
    const existingExtension = await BookingExtension.findOne({
      bookingId,
      userId: session.user.id,
      // status: "pending",
    });

    if (existingExtension) {
      return NextResponse.json(
        { error: "Extension request already exists for this booking" },
        { status: 409 }
      );
    }

    // Create new extension request
    const extensionRequest = new BookingExtension({
      bookingId,
      startupId,
      incubatorId,
      facilityId,
      userId: session.user.id,
      extentDays,
      status: "pending",
      requestedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await extensionRequest.save();

    return NextResponse.json(
      {
        message: "Extension request sent successfully",
        extensionId: extensionRequest._id,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating extension request:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { db } = await connectToDatabase();

    const extensions = await BookingExtension.find({
      incubatorId: session.user.id,
    }).sort({ createdAt: -1 });

    const enrichedExtensions = await Promise.all(
      extensions.map(async (ext) => {
        const startup = await db
          .collection("Startups")
          .findOne({ userId: new ObjectId(ext.startupId) });

        const facility = await db
          .collection("Facilities")
          .findOne({ _id: new ObjectId(ext.facilityId) });

        return {
          ...ext.toObject(),
          startupName: startup?.startupName || "",
          facilityName: facility?.details?.name || "",
        };
      })
    );

    return NextResponse.json(enrichedExtensions, { status: 200 });
  } catch (error) {
    console.error("Error fetching extension requests:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
