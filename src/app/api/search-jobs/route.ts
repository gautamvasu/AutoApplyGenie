import { NextRequest, NextResponse } from "next/server";
import { searchJobs } from "@/lib/job-search";

export async function POST(request: NextRequest) {
  try {
    const { query, location, page } = await request.json();

    if (!query) {
      return NextResponse.json(
        { error: "Search query is required" },
        { status: 400 }
      );
    }

    const jobs = await searchJobs(query, location || "United States", page || 1);
    return NextResponse.json({ jobs, total: jobs.length });
  } catch (error) {
    console.error("Job search error:", error);
    return NextResponse.json(
      { error: "Failed to search jobs. Check your RAPIDAPI_KEY." },
      { status: 500 }
    );
  }
}
