import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import { BookingExtension } from "@/models/BookingExtension";
import { ObjectId } from "mongodb";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { status } = await req.json();
    if (!["approved", "rejected"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    await connectToDatabase();

    const updated = await BookingExtension.findByIdAndUpdate(
      params.id,
      { status, updatedAt: new Date() },
      { new: true }
    );

    if (!updated) {
      return NextResponse.json({ error: "Extension request not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Status updated successfully", updated }, { status: 200 });
  } catch (error) {
    console.error("Error updating extension status:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
