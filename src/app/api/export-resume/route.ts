import { NextRequest, NextResponse } from "next/server";
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from "docx";

export async function POST(request: NextRequest) {
  try {
    const { text, format } = await request.json();

    if (!text) {
      return NextResponse.json({ error: "Resume text is required" }, { status: 400 });
    }

    if (format === "docx") {
      const lines = text.split("\n").filter((l: string) => l.trim());
      const paragraphs = lines.map((line: string, index: number) => {
        if (index === 0) {
          return new Paragraph({
            children: [new TextRun({ text: line, bold: true, size: 32 })],
            heading: HeadingLevel.HEADING_1,
            spacing: { after: 200 },
          });
        }

        const sectionHeaders = [
          "summary", "experience", "education", "skills", "projects",
          "certifications", "objective", "profile", "work history",
        ];
        const isHeader = sectionHeaders.some(
          (h) => line.toLowerCase().trim().startsWith(h)
        );

        if (isHeader) {
          return new Paragraph({
            children: [new TextRun({ text: line, bold: true, size: 26 })],
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 300, after: 100 },
          });
        }

        if (line.trim().startsWith("•") || line.trim().startsWith("-")) {
          return new Paragraph({
            children: [new TextRun({ text: line, size: 22 })],
            bullet: { level: 0 },
            spacing: { after: 50 },
          });
        }

        return new Paragraph({
          children: [new TextRun({ text: line, size: 22 })],
          spacing: { after: 100 },
        });
      });

      const doc = new Document({
        sections: [{ children: paragraphs }],
      });

      const buffer = await Packer.toBuffer(doc);

      return new NextResponse(new Uint8Array(buffer), {
        headers: {
          "Content-Type":
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          "Content-Disposition": 'attachment; filename="optimized_resume.docx"',
        },
      });
    }

    // For PDF, return HTML that the client can print to PDF
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Arial', sans-serif; max-width: 800px; margin: 0 auto; padding: 40px; color: #333; line-height: 1.6; }
          h1 { font-size: 24px; border-bottom: 2px solid #2563eb; padding-bottom: 8px; }
          h2 { font-size: 18px; color: #2563eb; margin-top: 20px; border-bottom: 1px solid #ddd; padding-bottom: 4px; }
          ul { padding-left: 20px; }
          li { margin-bottom: 4px; }
          p { margin: 8px 0; }
        </style>
      </head>
      <body>${formatResumeToHTML(text)}</body>
      </html>
    `;

    return new NextResponse(htmlContent, {
      headers: {
        "Content-Type": "text/html",
        "Content-Disposition": 'attachment; filename="optimized_resume.html"',
      },
    });
  } catch (error) {
    console.error("Export error:", error);
    return NextResponse.json({ error: "Failed to export resume" }, { status: 500 });
  }
}

function formatResumeToHTML(text: string): string {
  const lines = text.split("\n").filter((l) => l.trim());
  let html = "";

  const sectionHeaders = [
    "summary", "experience", "education", "skills", "projects",
    "certifications", "objective", "profile", "work history",
  ];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (i === 0) {
      html += `<h1>${escapeHtml(line)}</h1>`;
    } else if (sectionHeaders.some((h) => line.toLowerCase().startsWith(h))) {
      html += `<h2>${escapeHtml(line)}</h2>`;
    } else if (line.startsWith("•") || line.startsWith("-")) {
      html += `<li>${escapeHtml(line.replace(/^[•-]\s*/, ""))}</li>`;
    } else {
      html += `<p>${escapeHtml(line)}</p>`;
    }
  }

  return html;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
