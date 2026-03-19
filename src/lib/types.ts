export interface ResumeData {
  raw_text: string;
  name: string;
  email: string;
  phone: string;
  skills: string[];
  experience: string[];
  education: string[];
  summary: string;
  file_name: string;
}

export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  url: string;
  posted_at: string;
  source: string;
  salary?: string;
  job_type?: string;
  ats_score?: number;
  matched_keywords?: string[];
  missing_keywords?: string[];
  status: "found" | "applying" | "applied" | "failed" | "skipped";
}

export interface ATSResult {
  score: number;
  matched_keywords: string[];
  missing_keywords: string[];
  suggestions: string[];
}

export interface OptimizedResume {
  optimized_text: string;
  changes_made: string[];
  new_score: number;
}
