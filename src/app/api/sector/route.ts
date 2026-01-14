import { NextResponse, NextRequest } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Sector } from "@/models/Sectors";

export async function GET() {
  try {
    await connectToDatabase();

    const sectors = await Sector.find({ isActive: true }).sort({ name: 1 });

    return NextResponse.json({ success: true, data: sectors });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to fetch sectors" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();

    const body = await req.json();
    let { name } = body;

    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json(
        { success: false, error: "Sector name is required" },
        { status: 400 }
      );
    }

    // Optional: normalize to a slug-ish format
    const normalizedName = name.trim().toLowerCase().replace(/\s+/g, "-");

    // If sector already exists, just return it
    let sector = await Sector.findOne({ name: normalizedName });

    if (!sector) {
      sector = await Sector.create({
        name: normalizedName,
        isActive: true,
      });
    } else if (!sector.isActive) {
      sector.isActive = true;
      await sector.save();
    }

    return NextResponse.json(
      { success: true, data: sector },
      { status: 201 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false, error: "Failed to create sector" },
      { status: 500 }
    );
  }
}
