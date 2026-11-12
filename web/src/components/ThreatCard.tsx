"use client";

import React, { useState } from "react";
import { MessageSquareText, Calendar, UserCheck, ChevronDown, ChevronUp, Maximize2 } from "lucide-react";
import { ThreatArticle } from "@/types/threat";

interface ThreatCardProps {
  article: ThreatArticle;
  onAskChat: (article: ThreatArticle) => void;
  onOpenModal: (article: ThreatArticle) => void;
}

export default function ThreatCard({ article, onAskChat, onOpenModal }: ThreatCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const getSeverityBadge = (sev: number) => {
    if (sev >= 9) {
      return {
        text: `CRITICAL ${sev}/10`,
        classes: "bg-red-950/70 text-red-400 border-red-500/40 animate-pulse",
      };
    }
    if (sev >= 7) {
      return {
        text: `HIGH ${sev}/10`,
        classes: "bg-orange-950/70 text-orange-400 border-orange-500/40",
      };
    }
    if (sev >= 4) {
      return {
        text: `MEDIUM ${sev}/10`,
        classes: "bg-amber-950/70 text-amber-400 border-amber-500/40",
      };
    }
    return {
      text: `LOW ${sev}/10`,
      classes: "bg-cyan-950/70 text-cyan-400 border-cyan-500/40",
    };
  };

  const badge = getSeverityBadge(article.severity);

  const formattedDate = new Date(article.published_at).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const fullContent = article.content || article.summary || "";
  const paragraphs = fullContent.split("\n\n").filter(Boolean);

  return (
    <article className="group relative rounded-2xl border border-zinc-850 bg-[#0a0a0a] p-4 sm:p-5 transition-all duration-300 hover:border-zinc-700 hover:bg-[#0f0f0f] shadow-lg">
      <div className="flex flex-col gap-3">
        {/* Header row: Source, Date, Severity */}
        <div className="flex items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 text-zinc-400">
            <span className="font-semibold text-zinc-200">{article.source || "Feed"}</span>
            <span className="text-zinc-600">•</span>
            <span className="flex items-center gap-1 text-zinc-400">
              <Calendar className="h-3 w-3" />
              {formattedDate}
            </span>
          </div>

          <span className={`rounded-md border px-2 py-0.5 text-[11px] font-bold tracking-wide ${badge.classes}`}>
            {badge.text}
          </span>
        </div>

        {/* Title: Opens in-UI Dossier Modal on click */}
        <h3
          onClick={() => onOpenModal(article)}
          className="text-base font-semibold leading-snug text-white hover:text-cyan-400 cursor-pointer transition flex items-center justify-between gap-2"
        >
          <span>{article.title}</span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onOpenModal(article);
            }}
            className="opacity-0 group-hover:opacity-100 p-1 text-zinc-400 hover:text-cyan-400 transition"
            title="Open Full Intelligence Dossier"
          >
            <Maximize2 className="h-3.5 w-3.5" />
          </button>
        </h3>

        {/* Summary or Expanded Full Content in Place */}
        {!isExpanded ? (
          <p className="text-xs leading-relaxed text-zinc-300 line-clamp-3 font-normal">
            {article.summary}
          </p>
        ) : (
          <div className="space-y-2 rounded-xl bg-black p-3.5 text-xs leading-relaxed text-zinc-200 border border-zinc-800 animate-in fade-in duration-200 shadow-inner">
            <div className="font-bold text-cyan-400 text-[11px] uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-ping"></span>
              Full Ingested Intelligence Report:
            </div>
            {paragraphs.map((p, idx) => (
              <p key={idx} className="leading-relaxed">{p}</p>
            ))}
          </div>
        )}

        {/* Inline Toggle: Read Full Story / Collapse */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1 text-[11px] font-medium text-cyan-400 hover:text-cyan-300 transition"
          >
            <span>{isExpanded ? "Collapse Details" : "Read Full Story Inline"}</span>
            {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          </button>

          <span className="text-zinc-700 text-[10px]">•</span>

          <button
            onClick={() => onOpenModal(article)}
            className="flex items-center gap-1 text-[11px] font-medium text-zinc-400 hover:text-white transition"
          >
            <Maximize2 className="h-2.5 w-2.5" />
            <span>Full Screen Dossier</span>
          </button>
        </div>

        {/* Metadata Tags: Actor & CVEs */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          {article.threat_actor && article.threat_actor !== "Unknown" && (
            <div className="flex items-center gap-1 rounded bg-zinc-900 px-2 py-0.5 text-[11px] font-medium text-emerald-400 border border-emerald-500/20">
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
            <span className="text-[11px] text-zinc-500 italic">No CVE assigned</span>
          )}
        </div>

        {/* Action footer */}
        <div className="flex items-center justify-between border-t border-zinc-850 pt-3 mt-1 text-xs">
          <span className="text-[11px] text-zinc-500 font-mono">pgvector: 768-dim</span>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onAskChat(article)}
              className="flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-900 px-2.5 py-1 text-xs font-medium text-cyan-400 hover:bg-zinc-800 hover:border-cyan-500/40 transition shadow-sm"
            >
              <MessageSquareText className="h-3.5 w-3.5" />
              <span>Ask AI About This</span>
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
