"use client";

import React, { useEffect, useState } from "react";
import { X, ShieldAlert, UserCheck, Bug, Calendar, ExternalLink, MessageSquareText, Copy, Check } from "lucide-react";
import { ThreatArticle } from "@/types/threat";

interface ThreatDetailModalProps {
  article: ThreatArticle | null;
  onClose: () => void;
  onAskChat: (article: ThreatArticle) => void;
}

export default function ThreatDetailModal({
  article,
  onClose,
  onAskChat,
}: ThreatDetailModalProps) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (article) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [article, onClose]);

  if (!article) return null;

  const getSeverityInfo = (sev: number) => {
    if (sev >= 9) {
      return {
        label: `CRITICAL ZERO-DAY (${sev}/10)`,
        color: "text-red-400 bg-red-950/60 border-red-500/40",
        meterBg: "bg-red-500",
        desc: "Active exploitation in the wild, widespread ransomware, or unauthenticated RCE.",
      };
    }
    if (sev >= 7) {
      return {
        label: `HIGH THREAT LEVEL (${sev}/10)`,
        color: "text-orange-400 bg-orange-950/60 border-orange-500/40",
        meterBg: "bg-orange-500",
        desc: "High severity vulnerability, active privilege escalation, or confirmed malware campaign.",
      };
    }
    if (sev >= 4) {
      return {
        label: `MEDIUM THREAT LEVEL (${sev}/10)`,
        color: "text-amber-400 bg-amber-950/60 border-amber-500/40",
        meterBg: "bg-amber-500",
        desc: "Moderate vulnerability, proof-of-concept exploit, or credential phishing attack.",
      };
    }
    return {
      label: `INFORMATIONAL (${sev}/10)`,
      color: "text-blue-400 bg-blue-950/60 border-blue-500/40",
      meterBg: "bg-blue-500",
      desc: "Security patches, defensive advisory, or informational disclosure.",
    };
  };

  const sevInfo = getSeverityInfo(article.severity);

  const formattedDate = new Date(article.published_at).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const fullText = article.content || article.summary || "No extended details provided.";
  // Split into paragraphs for natural readability
  const paragraphs = fullText.split("\n\n").filter(Boolean);

  const copyBriefing = () => {
    const text = `SENTINEL AI THREAT DOSSIER\nTitle: ${article.title}\nSeverity: ${article.severity}/10 (${sevInfo.label})\nActor: ${article.threat_actor}\nCVEs: ${article.cve_list?.join(", ") || "None"}\nSource: ${article.source} (${article.source_url})\n\nSUMMARY:\n${article.summary}\n\nDETAILS:\n${fullText}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-10">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/85 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative flex flex-col w-full max-w-4xl max-h-[90vh] rounded-2xl border border-slate-700/80 bg-slate-900 shadow-2xl overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-800 bg-slate-950/90 px-6 py-4">
          <div className="space-y-1.5 pr-6">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`rounded-md border px-2.5 py-0.5 text-xs font-bold tracking-wide ${sevInfo.color}`}>
                {sevInfo.label}
              </span>
              <span className="rounded-md border border-slate-800 bg-slate-900 px-2.5 py-0.5 text-xs font-medium text-slate-300">
                {article.source}
              </span>
              <span className="flex items-center gap-1 text-xs text-slate-400">
                <Calendar className="h-3.5 w-3.5" />
                {formattedDate}
              </span>
            </div>
            <h2 className="text-xl font-bold tracking-tight text-white leading-snug">
              {article.title}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition"
            title="Close Dossier (Esc)"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
          {/* Metadata Grid */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 rounded-xl border border-slate-800 bg-slate-950/50 p-4">
            {/* Actor */}
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-emerald-400">
                <UserCheck className="h-5 w-5" />
              </div>
              <div>
                <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">Threat Actor</span>
                <span className="text-sm font-semibold text-emerald-300">{article.threat_actor || "Unknown / Unattributed"}</span>
              </div>
            </div>

            {/* Severity Rating */}
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-950/40 border border-red-500/30 text-red-400">
                <ShieldAlert className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">CVSS Impact Score</span>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-sm font-bold text-white">{article.severity} / 10</span>
                  <div className="h-1.5 flex-1 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className={`h-full ${sevInfo.meterBg}`}
                      style={{ width: `${(article.severity / 10) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Tracked CVEs */}
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-950/40 border border-amber-500/30 text-amber-400">
                <Bug className="h-5 w-5" />
              </div>
              <div>
                <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">Identified CVEs</span>
                <span className="text-sm font-semibold text-amber-300">
                  {article.cve_list && article.cve_list.length > 0 ? `${article.cve_list.length} CVEs Cataloged` : "None Assigned"}
                </span>
              </div>
            </div>
          </div>

          {/* CVE Identifiers Pill List */}
          {article.cve_list && article.cve_list.length > 0 && (
            <div className="space-y-1.5">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                Cataloged Vulnerability Identifiers:
              </span>
              <div className="flex flex-wrap gap-2">
                {article.cve_list.map((cve) => (
                  <span
                    key={cve}
                    className="font-mono rounded-lg bg-red-950/50 px-3 py-1 text-xs font-bold text-red-300 border border-red-500/40 shadow-sm"
                  >
                    {cve}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Executive AI Briefing */}
          <div className="rounded-xl border border-cyan-500/30 bg-cyan-950/20 p-4 space-y-1.5">
            <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider block">
              Executive Threat Briefing
            </span>
            <p className="text-xs text-slate-200 leading-relaxed">
              {article.summary}
            </p>
          </div>

          {/* Full Ingested Intelligence Narrative */}
          <div className="space-y-3">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
              Full Intelligence Report & Technical Breakdown
            </span>
            <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-5 text-sm text-slate-300 leading-relaxed space-y-3 font-normal">
              {paragraphs.map((p, idx) => (
                <p key={idx}>{p}</p>
              ))}
            </div>
          </div>

          {/* External Citation Reference */}
          <div className="flex items-center justify-between text-xs text-slate-500 border-t border-slate-800 pt-3">
            <span>Primary Intelligence Source: <strong className="text-slate-400">{article.source}</strong></span>
            <a
              href={article.source_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-cyan-400 hover:text-cyan-300 hover:underline"
            >
              <span>Original Advisory Source Link</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-800 bg-slate-950/90 px-6 py-4">
          <button
            onClick={copyBriefing}
            className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition"
          >
            {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
            <span>{copied ? "Copied Dossier!" : "Copy Full Briefing"}</span>
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="rounded-lg border border-slate-800 bg-slate-900 px-4 py-1.5 text-xs font-medium text-slate-400 hover:bg-slate-800 hover:text-white transition"
            >
              Close
            </button>
            <button
              onClick={() => {
                onClose();
                onAskChat(article);
              }}
              className="flex items-center gap-2 rounded-lg bg-cyan-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-cyan-500 shadow-md shadow-cyan-600/20 transition"
            >
              <MessageSquareText className="h-4 w-4" />
              <span>Analyze in AI Assistant</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

