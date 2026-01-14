
import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function POST(req: NextRequest) {
  try {
    // Get request data
    const requestData = await req.json();
    const { affiliateId } = requestData;

    // Validate required fields
    if (!affiliateId) {
      return NextResponse.json(
        { error: "Missing required field: affiliateId" },
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

    // Connect to MongoDB
    const { db } = await connectToDatabase();

    // Check if affiliate exists in AffiliatePartners collection
    const affiliate = await db.collection("affiliatepartners").findOne({
      _id: affiliateObjectId,
    });

    if (!affiliate) {
      // If affiliate doesn't exist, create a new document with visitors: 1
      await db.collection("affiliatepartners").insertOne({
        _id: affiliateObjectId,
        visitors: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    } else {
      // If affiliate exists, increment visitors count
      await db.collection("affiliatepartners").updateOne(
        { _id: affiliateObjectId },
        {
          $inc: { visitors: 1 },
          $set: { updatedAt: new Date() },
        }
      );
    }

    // Return success response
    return NextResponse.json(
      { message: "Visitor tracked successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error tracking visitor:", error);
    return NextResponse.json(
      { error: "Failed to track visitor" },
      { status: 500 }
    );
  }
}
