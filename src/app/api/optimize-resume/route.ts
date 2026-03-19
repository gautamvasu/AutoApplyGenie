import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic();

export async function POST(request: NextRequest) {
  try {
    const { resume_text, job_description, missing_keywords } = await request.json();

    if (!resume_text || !job_description) {
      return NextResponse.json(
        { error: "Both resume_text and job_description are required" },
        { status: 400 }
      );
    }

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4096,
      messages: [
        {
          role: "user",
          content: `You are a professional resume optimizer. Modify the resume to better match the job description while keeping it truthful and professional.

ORIGINAL RESUME:
${resume_text}

JOB DESCRIPTION:
${job_description}

MISSING KEYWORDS TO INCORPORATE:
${missing_keywords?.join(", ") || "None specified"}

Instructions:
1. Naturally incorporate missing keywords where truthful
2. Rewrite bullet points to better align with the JD
3. Optimize the summary/objective section
4. Keep the same structure and format
5. Do NOT fabricate experience or skills

Return ONLY valid JSON (no markdown, no code blocks):
{
  "optimized_text": "the full optimized resume text",
  "changes_made": ["change1", "change2"],
  "new_score": <estimated new ATS score 0-100>
}`,
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
    console.error("Resume optimization error:", error);
    return NextResponse.json(
      { error: "Failed to optimize resume" },
      { status: 500 }
    );
  }
}
