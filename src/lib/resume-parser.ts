import { ResumeData } from "./types";

export async function parseResumeText(text: string, fileName: string): Promise<ResumeData> {
  const emailRegex = /[\w.-]+@[\w.-]+\.\w+/g;
  const phoneRegex = /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g;

  const emails = text.match(emailRegex) || [];
  const phones = text.match(phoneRegex) || [];

  const lines = text.split("\n").filter((l) => l.trim());
  const name = lines[0]?.trim() || "Unknown";

  const skillKeywords = [
    "javascript", "typescript", "python", "java", "c++", "c#", "react", "angular",
    "vue", "node", "express", "django", "flask", "spring", "aws", "azure", "gcp",
    "docker", "kubernetes", "git", "sql", "nosql", "mongodb", "postgresql", "mysql",
    "redis", "graphql", "rest", "api", "html", "css", "sass", "tailwind", "bootstrap",
    "figma", "agile", "scrum", "ci/cd", "jenkins", "terraform", "linux", "bash",
    "machine learning", "deep learning", "nlp", "data science", "pandas", "numpy",
    "tensorflow", "pytorch", "spark", "hadoop", "kafka", "rabbitmq", "microservices",
    "devops", "sre", "monitoring", "grafana", "prometheus", "elasticsearch",
    "swift", "kotlin", "flutter", "react native", "go", "rust", "scala", "r",
    "tableau", "power bi", "excel", "jira", "confluence", "slack",
    "project management", "leadership", "communication", "problem solving",
  ];

  const lowerText = text.toLowerCase();
  const skills = skillKeywords.filter((skill) => lowerText.includes(skill));

  const experienceSection = extractSection(text, ["experience", "work history", "employment"]);
  const educationSection = extractSection(text, ["education", "academic", "qualifications"]);
  const summarySection = extractSection(text, ["summary", "objective", "profile", "about"]);

  return {
    raw_text: text,
    name,
    email: emails[0] || "",
    phone: phones[0] || "",
    skills: Array.from(new Set(skills)),
    experience: experienceSection,
    education: educationSection,
    summary: summarySection.join(" "),
    file_name: fileName,
  };
}

function extractSection(text: string, headers: string[]): string[] {
  const lines = text.split("\n");
  const results: string[] = [];
  let capturing = false;

  for (const line of lines) {
    const lower = line.toLowerCase().trim();
    if (headers.some((h) => lower.startsWith(h) || lower === h)) {
      capturing = true;
      continue;
    }
    if (capturing) {
      const sectionHeaders = [
        "experience", "education", "skills", "projects", "certifications",
        "awards", "publications", "references", "summary", "objective",
        "work history", "employment", "academic", "qualifications", "profile",
        "about", "interests", "hobbies", "languages", "volunteer",
      ];
      if (sectionHeaders.some((h) => lower.startsWith(h) || lower === h)) {
        break;
      }
      if (line.trim()) results.push(line.trim());
    }
  }
  return results;
}
