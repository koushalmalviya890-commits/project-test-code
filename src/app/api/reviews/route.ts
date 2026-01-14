import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { authOptions } from "@/lib/auth";
import { ObjectId } from "mongodb";
import { Review } from "@/models/Reviews";
import Startup from "@/models/Startup";
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      console.error("Unauthorized attempt to POST review");
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const {
      bookingId,
      incubatorId,
      facilityId,
      rating,
      comment,
    } = await req.json();

    const startupId = session.user.id; // ensure startupId comes from session

    // Validate required fields
    if (!bookingId || !incubatorId || !facilityId || !rating) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // 🔒 Check for existing review by the same startup for this booking
    const existingReview = await Review.findOne({
      bookingId,
      startupId,
    });

    if (existingReview) {
      return NextResponse.json(
        { error: "You have already submitted a review for this booking." },
        { status: 409 }
      );
    }

    // ✅ Create new review
    const newReview = await Review.create({
      bookingId,
      incubatorId,
      startupId,
      facilityId,
      rating,
      comment,
    });

    return NextResponse.json(
      { message: "Review submitted successfully", review: newReview },
      { status: 201 }
    );

    
  } catch (error) {
    console.error("Error in POST /api/reviews:", error);
    return NextResponse.json(
      {
        error: "Internal Server Error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}



export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const facilityId = searchParams.get("facilityId");

    if (!facilityId) {
      return NextResponse.json(
        { error: "Missing facilityId" },
        { status: 400 }
      );
    }

    // ✅ Get only approved reviews
    const reviews = await Review.find({
      facilityId,
      status: "approved",
    }).sort({ createdAt: -1 });

    // Calculate average rating
    const totalReviews = reviews.length;
    const averageRating =
      totalReviews > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
        : 0;

    // Extract startupIds and map names
    const startupIds = reviews.map((r) => r.startupId);
    const startups = await Startup.find({ userId: { $in: startupIds } });
    const startupMap = new Map(
      startups.map((s) => [s.userId.toString(), s.startupName])
    );

    // Build the individual review list
    const reviewList = reviews.map((r) => ({
      startupName: startupMap.get(r.startupId.toString()) || "Unknown Startup",
      rating: r.rating,
      comment: r.comment,
    }));

    // ✅ Final response with stats
    return NextResponse.json({
      totalReviews,
      averageRating: parseFloat(averageRating.toFixed(1)), // round to 1 decimal
      reviews: reviewList,
    });
  } catch (error) {
    console.error("Error in GET /api/reviews:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}


