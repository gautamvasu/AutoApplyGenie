"use client";

import { Briefcase, Target, CheckCircle, AlertTriangle } from "lucide-react";
import { Job } from "@/lib/types";

interface Props {
  jobs: Job[];
}

export default function StatsBar({ jobs }: Props) {
  const total = jobs.length;
  const scored = jobs.filter((j) => j.ats_score !== undefined).length;
  const highScore = jobs.filter((j) => j.ats_score !== undefined && j.ats_score >= 90).length;
  const applied = jobs.filter((j) => j.status === "applied").length;

  const stats = [
    { label: "Jobs Found", value: total, icon: Briefcase, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Scored", value: scored, icon: Target, color: "text-purple-600", bg: "bg-purple-50" },
    { label: "ATS 90+", value: highScore, icon: AlertTriangle, color: "text-green-600", bg: "bg-green-50" },
    { label: "Applied", value: applied, icon: CheckCircle, color: "text-emerald-600", bg: "bg-emerald-50" },
  ];

  return (
    <div className="grid grid-cols-4 gap-4">
      {stats.map((stat) => (
        <div key={stat.label} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className={`${stat.bg} p-2 rounded-lg`}>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
              <div className="text-xs text-gray-500">{stat.label}</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
