import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import  {AffiliateLinkUsers}  from "@/models/AffiliateLinkUsers";

export async function POST(req: NextRequest) {
  try {


    const { mailId, contactNumber , contactName , affiliateId } = await req.json();

    // Validate input
    if (mailId && !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(mailId)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();

    // Check for existing user with the same mailId
    if (mailId) {
      const existingUser = await db.collection("AffiliateLinkUsers").findOne({ mailId });
      if (existingUser) {
        return NextResponse.json(
          { error: "User with this email already exists" },
          { status: 409 }
        );
      }
    }

    // Create new user from affiliate
    const result = await db.collection("AffiliateLinkUsers").insertOne({
      mailId: mailId || null,
      contactNumber: contactNumber || null,
      contactName: contactName || null,
      affiliateId: affiliateId || null,
    });

    const newUser = await db.collection("AffiliateLinkUsers").findOne({ _id: result.insertedId });

    return NextResponse.json(
      {
        message: "User from affiliate created successfully",
        user: {
          mailId: newUser?.mailId,
          contactNumber: newUser?.contactNumber,
          createdAt: newUser?.createdAt,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error in POST /api/users-from-affiliate:", error);
    return NextResponse.json(
      {
        error: "Internal Server Error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}