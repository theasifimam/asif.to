import { NextResponse } from "next/server";
import { getAnalyticsOverview } from "@/lib/googleAnalytics";

export async function GET() {
  try {
    const analytics = await getAnalyticsOverview();

    return NextResponse.json({
      success: true,
      analytics,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to load analytics",
      },
      { status: 500 },
    );
  }
}
