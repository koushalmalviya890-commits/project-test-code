import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function POST(req: NextRequest) {
  try {
    // Get request data
    const requestData = await req.json();
    const { startupMailId } = requestData;

    // Validate required fields
    if (!startupMailId) {
      return NextResponse.json(
        { error: "Missing required field: startupMailId" },
        { status: 400 }
      );
    }

    // Validate startupMailId as a valid ObjectId
    // let startupObjectId;
    // try {
    //   startupObjectId = new ObjectId(startupMailId);
    // } catch (error) {
    //   return NextResponse.json(
    //     { error: "Invalid startupMailId format" },
    //     { status: 400 }
    //   );
    // }

    // Connect to MongoDB
    const { db } = await connectToDatabase();

    // Check if startup exists in AffiliateLinkUsers collection
    const userFromAffiliate = await db.collection("AffiliateLinkUsers").findOne({
      mailId: startupMailId,
    });

    if (!userFromAffiliate) {
      return NextResponse.json(
        { error: "No affiliate link found for this startup" },
        { status: 404 }
      );
    }

    // Get affiliateId from AffiliateLinkUsers
    const affiliateId = userFromAffiliate.affiliateId;
    if (!affiliateId) {
      return NextResponse.json(
        { error: "No affiliateId associated with this startup" },
        { status: 400 }
      );
    }

    // Validate affiliateId as a valid ObjectId
    let affiliateObjectId;
    try {
      affiliateObjectId = new ObjectId(affiliateId);
    } catch (error) {
      return NextResponse.json(
        { error: "Invalid affiliateId format" },
        { status: 400 }
      );
    }

    // Check if affiliate exists in AffiliatePartners collection
    const affiliate = await db.collection("affiliatepartners").findOne({
      _id: affiliateObjectId,
    });

      if (affiliate) {

      // If affiliate exists, increment customers count
      await db.collection("affiliatepartners").updateOne(
        { _id: affiliateObjectId },
        {
          $inc: { customers: 1 },
          $set: { updatedAt: new Date() },
        }
      );
}

    // Return success response
    return NextResponse.json(
      { message: "Customer tracked successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error tracking customer:", error);
    return NextResponse.json(
      { error: "Failed to track customer" },
      { status: 500 }
    );
  }
}
