import { Job } from "./types";
import https from "https";

const RAPIDAPI_HOST = "jsearch.p.rapidapi.com";

function fetchJSearch(url: string, apiKey: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const req = https.get(
      url,
      {
        headers: {
          "x-rapidapi-key": apiKey,
          "x-rapidapi-host": RAPIDAPI_HOST,
        },
      },
      (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => resolve(data));
      }
    );
    req.on("error", reject);
    req.end();
  });
}

export async function searchJobs(
  query: string,
  location: string,
  page: number = 1
): Promise<Job[]> {
  const apiKey = process.env.RAPIDAPI_KEY;
  if (!apiKey) throw new Error("RAPIDAPI_KEY is not set");

  const params = new URLSearchParams({
    query: `${query} in ${location}`,
    page: String(page),
    num_pages: "1",
    date_posted: "today",
    remote_jobs_only: "false",
  });

  const url = `https://${RAPIDAPI_HOST}/search?${params.toString()}`;
  const raw = await fetchJSearch(url, apiKey);
  const data = JSON.parse(raw);

  if (!data.data || !Array.isArray(data.data)) {
    return [];
  }

  return data.data.map((job: Record<string, unknown>) => ({
    id: (job.job_id as string) || crypto.randomUUID(),
    title: (job.job_title as string) || "Unknown Title",
    company: (job.employer_name as string) || "Unknown Company",
    location: (job.job_city as string)
      ? `${job.job_city}, ${job.job_state || ""} ${job.job_country || ""}`
      : (job.job_country as string) || "Remote",
    description: (job.job_description as string) || "",
    url: (job.job_apply_link as string) || (job.job_google_link as string) || "",
    posted_at: (job.job_posted_at_datetime_utc as string) || new Date().toISOString(),
    source: (job.job_publisher as string) || "JSearch",
    salary: job.job_min_salary
      ? `$${job.job_min_salary} - $${job.job_max_salary}`
      : undefined,
    job_type: (job.job_employment_type as string) || undefined,
    status: "found" as const,
  }));
}
