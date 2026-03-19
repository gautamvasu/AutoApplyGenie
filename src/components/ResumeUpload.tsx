"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { Upload, FileText, CheckCircle, Loader2 } from "lucide-react";
import { ResumeData } from "@/lib/types";

interface Props {
  onResumeParsed: (data: ResumeData) => void;
}

export default function ResumeUpload({ onResumeParsed }: Props) {
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  const handleFile = useCallback(
    async (file: File) => {
      setIsLoading(true);
      setError(null);
      setFileName(file.name);

      try {
        const formData = new FormData();
        formData.append("resume", file);

        const res = await fetch("/api/parse-resume", {
          method: "POST",
          body: formData,
        });

        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || "Failed to parse resume");
        }

        const data = await res.json();
        onResumeParsed(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to parse resume");
        setFileName(null);
      } finally {
        setIsLoading(false);
      }
    },
    [onResumeParsed]
  );

  // Prevent browser default drag/drop behavior on the whole page
  useEffect(() => {
    const preventDefault = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
    };
    window.addEventListener("dragover", preventDefault);
    window.addEventListener("drop", preventDefault);
    return () => {
      window.removeEventListener("dragover", preventDefault);
      window.removeEventListener("drop", preventDefault);
    };
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const openFilePicker = useCallback(() => {
    if (inputRef.current) {
      inputRef.current.value = "";
      inputRef.current.click();
    }
  }, []);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <FileText className="w-5 h-5 text-blue-600" />
        Upload Resume
      </h2>

      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.docx,.txt"
        onChange={handleChange}
        style={{ display: "none" }}
      />

      <div
        ref={dropZoneRef}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        role="button"
        tabIndex={0}
        onClick={openFilePicker}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") openFilePicker();
        }}
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer select-none ${
          isDragging
            ? "border-blue-500 bg-blue-50"
            : fileName
            ? "border-green-300 bg-green-50"
            : "border-gray-300 hover:border-blue-400 hover:bg-gray-50"
        }`}
      >
        {isLoading ? (
          <div className="flex flex-col items-center gap-2 pointer-events-none">
            <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
            <p className="text-gray-600">Parsing resume...</p>
          </div>
        ) : fileName ? (
          <div className="flex flex-col items-center gap-2 pointer-events-none">
            <CheckCircle className="w-10 h-10 text-green-500" />
            <p className="text-green-700 font-medium">{fileName}</p>
            <p className="text-sm text-gray-500">Resume parsed successfully. Click to upload a different file.</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 pointer-events-none">
            <Upload className="w-10 h-10 text-gray-400" />
            <p className="text-gray-600 font-medium">
              Drag & drop your resume or click to browse
            </p>
            <p className="text-sm text-gray-400">
              Supports PDF, DOCX, and TXT formats
            </p>
          </div>
        )}
      </div>

      {error && (
        <p className="mt-3 text-sm text-red-600 bg-red-50 p-2 rounded">{error}</p>
      )}
    </div>
  );
}
