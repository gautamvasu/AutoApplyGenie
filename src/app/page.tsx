"use client";

import { useState, useCallback } from "react";
import ResumeUpload from "@/components/ResumeUpload";
import JobSearch from "@/components/JobSearch";
import JobCard from "@/components/JobCard";
import StatsBar from "@/components/StatsBar";
import ResumePreview from "@/components/ResumePreview";
import { ResumeData, Job } from "@/lib/types";
import { Loader2, Zap, RotateCcw } from "lucide-react";

export default function Home() {
  const [resume, setResume] = useState<ResumeData | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isScoringAll, setIsScoringAll] = useState(false);
  const [isAutoApplying, setIsAutoApplying] = useState(false);
  const [optimizedResume, setOptimizedResume] = useState<{
    text: string;
    changes: string[];
    score: number;
  } | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  const handleResumeParsed = useCallback((data: ResumeData) => {
    setResume(data);
  }, []);

  const handleJobsFound = useCallback((newJobs: Job[]) => {
    setJobs(newJobs);
  }, []);

  const handleScoreCalculated = useCallback(
    (jobId: string, score: number, matched: string[], missing: string[]) => {
      setJobs((prev) =>
        prev.map((j) =>
          j.id === jobId
            ? { ...j, ats_score: score, matched_keywords: matched, missing_keywords: missing }
            : j
        )
      );
    },
    []
  );

  const handleScoreAll = async () => {
    if (!resume) return;
    setIsScoringAll(true);

    for (const job of jobs) {
      if (job.ats_score !== undefined) continue;

      try {
        const res = await fetch("/api/ats-score", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            resume_text: resume.raw_text,
            job_description: job.description,
          }),
        });

        if (res.ok) {
          const data = await res.json();
          handleScoreCalculated(job.id, data.score, data.matched_keywords, data.missing_keywords);
        }
      } catch (err) {
        console.error(`Scoring failed for ${job.id}:`, err);
      }
    }

    setIsScoringAll(false);
  };

  const handleAutoApply = async () => {
    setIsAutoApplying(true);
    const eligibleJobs = jobs.filter(
      (j) => j.ats_score !== undefined && j.ats_score >= 90 && j.status === "found"
    );

    for (const job of eligibleJobs) {
      setJobs((prev) =>
        prev.map((j) => (j.id === job.id ? { ...j, status: "applying" as const } : j))
      );

      // Open the job application link
      window.open(job.url, "_blank");

      await new Promise((resolve) => setTimeout(resolve, 1500));

      setJobs((prev) =>
        prev.map((j) =>
          j.id === job.id ? { ...j, status: "applied" as const } : j
        )
      );
    }

    setIsAutoApplying(false);
  };

  const handleOptimize = async (
    jobId: string,
    jobDescription: string,
    missingKeywords: string[]
  ) => {
    if (!resume) return;

    try {
      const res = await fetch("/api/optimize-resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resume_text: resume.raw_text,
          job_description: jobDescription,
          missing_keywords: missingKeywords,
        }),
      });

      if (!res.ok) throw new Error("Optimization failed");

      const data = await res.json();
      setOptimizedResume({
        text: data.optimized_text,
        changes: data.changes_made,
        score: data.new_score,
      });
      setShowPreview(true);
    } catch (err) {
      console.error(err);
    }
  };

  const scoredJobs = jobs.filter((j) => j.ats_score !== undefined);
  const unscoredJobs = jobs.filter((j) => j.ats_score === undefined);
  const sortedJobs = [
    ...scoredJobs.sort((a, b) => (b.ats_score || 0) - (a.ats_score || 0)),
    ...unscoredJobs,
  ];

  const eligibleCount = jobs.filter(
    (j) => j.ats_score !== undefined && j.ats_score >= 90 && j.status === "found"
  ).length;

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Job Application Dashboard</h1>
        <p className="text-gray-500 mt-1">
          Upload your resume, search for jobs, and let AI handle the rest.
        </p>
      </div>

      {/* Upload & Search */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ResumeUpload onResumeParsed={handleResumeParsed} />
        <JobSearch onJobsFound={handleJobsFound} />
      </div>

      {/* Resume Info */}
      {resume && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm text-gray-500">Parsed Resume:</span>{" "}
              <span className="font-medium text-gray-900">{resume.name}</span>
              {resume.email && (
                <span className="text-sm text-gray-400 ml-2">({resume.email})</span>
              )}
            </div>
            <div className="flex flex-wrap gap-1">
              {resume.skills.slice(0, 8).map((skill) => (
                <span
                  key={skill}
                  className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full"
                >
                  {skill}
                </span>
              ))}
              {resume.skills.length > 8 && (
                <span className="text-xs text-gray-400">
                  +{resume.skills.length - 8} more
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Stats */}
      {jobs.length > 0 && <StatsBar jobs={jobs} />}

      {/* Action Buttons */}
      {jobs.length > 0 && resume && (
        <div className="flex gap-3">
          <button
            onClick={handleScoreAll}
            disabled={isScoringAll || unscoredJobs.length === 0}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 flex items-center gap-2 font-medium text-sm"
          >
            {isScoringAll ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Zap className="w-4 h-4" />
            )}
            Score All Jobs ({unscoredJobs.length})
          </button>

          {eligibleCount > 0 && (
            <button
              onClick={handleAutoApply}
              disabled={isAutoApplying}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-2 font-medium text-sm"
            >
              {isAutoApplying ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <RotateCcw className="w-4 h-4" />
              )}
              Auto-Apply to {eligibleCount} Jobs (ATS 90+)
            </button>
          )}
        </div>
      )}

      {/* Job List */}
      {sortedJobs.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Jobs Found ({jobs.length})
            {scoredJobs.length > 0 && (
              <span className="text-sm font-normal text-gray-500 ml-2">
                - Sorted by ATS score
              </span>
            )}
          </h2>
          {sortedJobs.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              resume={resume}
              onScoreCalculated={handleScoreCalculated}
              onOptimize={handleOptimize}
            />
          ))}
        </div>
      )}

      {/* Empty State */}
      {jobs.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <p className="text-lg">Upload your resume and search for jobs to get started</p>
        </div>
      )}

      {/* Resume Preview Modal */}
      {showPreview && (
        <ResumePreview
          originalText={resume?.raw_text || ""}
          optimizedText={optimizedResume?.text || null}
          changesMade={optimizedResume?.changes || []}
          newScore={optimizedResume?.score || null}
          onClose={() => setShowPreview(false)}
        />
      )}
    </main>
  );
}
