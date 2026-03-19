"use client";

import { useState } from "react";
import {
  Building2, MapPin, Clock, ExternalLink, Loader2,
  CheckCircle, XCircle, ChevronDown, ChevronUp, Zap, FileEdit,
} from "lucide-react";
import { Job, ResumeData } from "@/lib/types";

interface Props {
  job: Job;
  resume: ResumeData | null;
  onScoreCalculated: (jobId: string, score: number, matched: string[], missing: string[]) => void;
  onOptimize: (jobId: string, jobDescription: string, missingKeywords: string[]) => void;
}

export default function JobCard({ job, resume, onScoreCalculated, onOptimize }: Props) {
  const [expanded, setExpanded] = useState(false);
  const [isScoring, setIsScoring] = useState(false);
  const [scored, setScored] = useState(false);

  const handleScore = async () => {
    if (!resume) return;
    setIsScoring(true);

    try {
      const res = await fetch("/api/ats-score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resume_text: resume.raw_text,
          job_description: job.description,
        }),
      });

      if (!res.ok) throw new Error("Scoring failed");

      const data = await res.json();
      onScoreCalculated(job.id, data.score, data.matched_keywords, data.missing_keywords);
      setScored(true);
    } catch (err) {
      console.error(err);
    } finally {
      setIsScoring(false);
    }
  };

  const scoreColor =
    job.ats_score === undefined
      ? "text-gray-400"
      : job.ats_score >= 90
      ? "text-green-600"
      : job.ats_score >= 70
      ? "text-yellow-600"
      : "text-red-600";

  const scoreBg =
    job.ats_score === undefined
      ? "bg-gray-100"
      : job.ats_score >= 90
      ? "bg-green-50 border-green-200"
      : job.ats_score >= 70
      ? "bg-yellow-50 border-yellow-200"
      : "bg-red-50 border-red-200";

  const statusIcon = {
    found: null,
    applying: <Loader2 className="w-4 h-4 animate-spin text-blue-500" />,
    applied: <CheckCircle className="w-4 h-4 text-green-500" />,
    failed: <XCircle className="w-4 h-4 text-red-500" />,
    skipped: <XCircle className="w-4 h-4 text-gray-400" />,
  };

  return (
    <div className={`bg-white rounded-xl shadow-sm border p-5 transition-all ${scoreBg}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-gray-900 text-lg">{job.title}</h3>
            {statusIcon[job.status]}
            {job.status === "applied" && (
              <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                Applied
              </span>
            )}
          </div>
          <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <Building2 className="w-3.5 h-3.5" />
              {job.company}
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" />
              {job.location}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {new Date(job.posted_at).toLocaleDateString()}
            </span>
            {job.salary && <span className="text-green-600 font-medium">{job.salary}</span>}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {job.ats_score !== undefined ? (
            <div className={`text-center ${scoreColor}`}>
              <div className="text-2xl font-bold">{job.ats_score}%</div>
              <div className="text-xs">ATS Score</div>
            </div>
          ) : (
            <button
              onClick={handleScore}
              disabled={!resume || isScoring}
              className="px-3 py-1.5 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 disabled:opacity-50 flex items-center gap-1"
            >
              {isScoring ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Zap className="w-3.5 h-3.5" />
              )}
              Score
            </button>
          )}
        </div>
      </div>

      {/* Keywords */}
      {scored && job.matched_keywords && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {job.matched_keywords.map((kw) => (
            <span key={kw} className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
              {kw}
            </span>
          ))}
          {job.missing_keywords?.map((kw) => (
            <span key={kw} className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
              {kw}
            </span>
          ))}
        </div>
      )}

      {/* Expand/Collapse */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="mt-3 text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
      >
        {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        {expanded ? "Hide details" : "Show details"}
      </button>

      {expanded && (
        <div className="mt-3 space-y-3">
          <p className="text-sm text-gray-600 whitespace-pre-line max-h-60 overflow-y-auto">
            {job.description.substring(0, 1000)}
            {job.description.length > 1000 && "..."}
          </p>
          <div className="flex gap-2">
            <a
              href={job.url}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center gap-1"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              View Original
            </a>
            {scored && job.missing_keywords && job.missing_keywords.length > 0 && (
              <button
                onClick={() => onOptimize(job.id, job.description, job.missing_keywords || [])}
                className="px-3 py-1.5 text-sm bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 flex items-center gap-1"
              >
                <FileEdit className="w-3.5 h-3.5" />
                Optimize Resume
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
