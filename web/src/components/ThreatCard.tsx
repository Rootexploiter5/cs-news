"use client";

import React from "react";
import { ExternalLink, MessageSquareText, ShieldAlert, Calendar, UserCheck } from "lucide-react";
import { ThreatArticle } from "@/types/threat";

interface ThreatCardProps {
  article: ThreatArticle;
  onAskChat: (article: ThreatArticle) => void;
}

export default function ThreatCard({ article, onAskChat }: ThreatCardProps) {
  const getSeverityBadge = (sev: number) => {
    if (sev >= 9) {
      return {
        text: `CRITICAL ${sev}/10`,
        classes: "bg-red-500/20 text-red-400 border-red-500/40 animate-pulse",
      };
    }
    if (sev >= 7) {
      return {
        text: `HIGH ${sev}/10`,
        classes: "bg-orange-500/20 text-orange-400 border-orange-500/40",
      };
    }
    if (sev >= 4) {
      return {
        text: `MEDIUM ${sev}/10`,
        classes: "bg-amber-500/20 text-amber-400 border-amber-500/40",
      };
    }
    return {
      text: `LOW ${sev}/10`,
      classes: "bg-blue-500/20 text-blue-400 border-blue-500/40",
    };
  };

  const badge = getSeverityBadge(article.severity);

  const formattedDate = new Date(article.published_at).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <article className="group relative rounded-xl border border-slate-800 bg-slate-900/40 p-4 transition-all duration-200 hover:border-slate-700 hover:bg-slate-900/80">
      <div className="flex flex-col gap-3">
        {/* Header row: Source, Date, Severity */}
        <div className="flex items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 text-slate-400">
            <span className="font-semibold text-slate-300">{article.source || "Feed"}</span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {formattedDate}
            </span>
          </div>

          <span className={`rounded border px-2 py-0.5 text-[11px] font-bold tracking-wide ${badge.classes}`}>
            {badge.text}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-base font-semibold leading-snug text-white group-hover:text-cyan-300 transition">
          <a
            href={article.source_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 hover:underline"
          >
            <span>{article.title}</span>
            <ExternalLink className="h-3.5 w-3.5 opacity-60 group-hover:opacity-100" />
          </a>
        </h3>

        {/* Executive Summary */}
        <p className="text-xs leading-relaxed text-slate-300 line-clamp-3">
          {article.summary}
        </p>

        {/* Metadata Tags: Actor & CVEs */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          {article.threat_actor && article.threat_actor !== "Unknown" && (
            <div className="flex items-center gap-1 rounded bg-slate-800/80 px-2 py-0.5 text-[11px] font-medium text-emerald-400 border border-emerald-500/20">
              <UserCheck className="h-3 w-3" />
              <span>{article.threat_actor}</span>
            </div>
          )}

          {article.cve_list && article.cve_list.length > 0 ? (
            article.cve_list.map((cve) => (
              <span
                key={cve}
                className="font-mono rounded bg-red-950/40 px-2 py-0.5 text-[11px] font-semibold text-red-300 border border-red-500/30"
              >
                {cve}
              </span>
            ))
          ) : (
            <span className="text-[11px] text-slate-500 italic">No CVE assigned</span>
          )}
        </div>

        {/* Action footer */}
        <div className="flex items-center justify-between border-t border-slate-800/60 pt-3 mt-1">
          <span className="text-[11px] text-slate-500">Vector Indexed (768-dim)</span>

          <button
            onClick={() => onAskChat(article)}
            className="flex items-center gap-1.5 rounded-lg border border-cyan-500/30 bg-cyan-950/30 px-2.5 py-1 text-xs font-medium text-cyan-300 hover:bg-cyan-900/40 hover:border-cyan-500/50 transition"
          >
            <MessageSquareText className="h-3.5 w-3.5" />
            <span>Analyze in RAG Chat</span>
          </button>
        </div>
      </div>
    </article>
  );
}
