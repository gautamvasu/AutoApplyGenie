import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic();

export async function POST(request: NextRequest) {
  try {
    const { resume_text, job_description } = await request.json();

    if (!resume_text || !job_description) {
      return NextResponse.json(
        { error: "Both resume_text and job_description are required" },
        { status: 400 }
      );
    }

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: `You are an ATS (Applicant Tracking System) scoring engine. Analyze the resume against the job description and return a JSON response.

RESUME:
${resume_text}

JOB DESCRIPTION:
${job_description}

Return ONLY valid JSON in this exact format (no markdown, no code blocks):
{
  "score": <number 0-100>,
  "matched_keywords": ["keyword1", "keyword2"],
  "missing_keywords": ["keyword1", "keyword2"],
  "suggestions": ["suggestion1", "suggestion2"]
}

Score criteria:
- Keyword match percentage (40%)
- Skills alignment (30%)
- Experience relevance (20%)
- Education match (10%)`,
        },
      ],
    });

    const content = message.content[0];
    if (content.type !== "text") {
      throw new Error("Unexpected response type");
    }

    const result = JSON.parse(content.text);
    return NextResponse.json(result);
  } catch (error) {
    console.error("ATS scoring error:", error);
    return NextResponse.json(
      { error: "Failed to calculate ATS score" },
      { status: 500 }
    );
  }
}
