"use client";

import { useState } from "react";
import { FileText, Download, Loader2, X, Copy, Check } from "lucide-react";

interface Props {
  originalText: string;
  optimizedText: string | null;
  changesMade: string[];
  newScore: number | null;
  onClose: () => void;
}

export default function ResumePreview({
  originalText,
  optimizedText,
  changesMade,
  newScore,
  onClose,
}: Props) {
  const [isExporting, setIsExporting] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleExport = async (format: "docx" | "pdf") => {
    setIsExporting(true);
    try {
      const res = await fetch("/api/export-resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: optimizedText || originalText, format }),
      });

      if (!res.ok) throw new Error("Export failed");

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `optimized_resume.${format === "pdf" ? "html" : format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
    } finally {
      setIsExporting(false);
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(optimizedText || originalText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-5 border-b">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-purple-600" />
            <h2 className="text-lg font-semibold">Optimized Resume</h2>
            {newScore && (
              <span className="text-sm bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                New ATS Score: {newScore}%
              </span>
            )}
          </div>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {changesMade.length > 0 && (
          <div className="px-5 py-3 bg-purple-50 border-b">
            <h3 className="text-sm font-medium text-purple-800 mb-1">Changes Made:</h3>
            <ul className="text-xs text-purple-700 space-y-0.5">
              {changesMade.map((change, i) => (
                <li key={i}>- {change}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-5">
          <pre className="whitespace-pre-wrap text-sm text-gray-700 font-sans leading-relaxed">
            {optimizedText || originalText}
          </pre>
        </div>

        <div className="flex items-center gap-3 p-5 border-t bg-gray-50 rounded-b-2xl">
          <button
            onClick={() => handleExport("docx")}
            disabled={isExporting}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2 text-sm font-medium"
          >
            {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            Download DOCX
          </button>
          <button
            onClick={() => handleExport("pdf")}
            disabled={isExporting}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-2 text-sm font-medium"
          >
            {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            Download PDF (HTML)
          </button>
          <button
            onClick={handleCopy}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 flex items-center gap-2 text-sm font-medium"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copied ? "Copied!" : "Copy Text"}
          </button>
        </div>
      </div>
    </div>
  );
}
