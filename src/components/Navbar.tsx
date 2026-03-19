"use client";

import { Briefcase } from "lucide-react";

export default function Navbar() {
  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <Briefcase className="w-8 h-8 text-blue-600" />
            <span className="text-xl font-bold text-gray-900">AutoApplyGenie</span>
            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">
              AI Agent
            </span>
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span>Auto-Apply Job Agent</span>
          </div>
        </div>
      </div>
    </nav>
  );
}
