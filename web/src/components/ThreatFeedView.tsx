"use client";

import React from "react";
import StatsOverview from "@/components/StatsOverview";
import FilterBar from "@/components/FilterBar";
import ThreatCard from "@/components/ThreatCard";
import { ThreatArticle, ThreatStats } from "@/types/threat";
import { Shield, AlertCircle } from "lucide-react";

interface ThreatFeedViewProps {
  articles: ThreatArticle[];
  stats: ThreatStats;
  isLoading: boolean;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  severityFilter: number;
  setSeverityFilter: (s: number) => void;
  sourceFilter: string;
  setSourceFilter: (src: string) => void;
  onRefresh: () => void;
  onAskChat: (article: ThreatArticle) => void;
  onOpenModal: (article: ThreatArticle) => void;
}

export default function ThreatFeedView({
  articles,
  stats,
  isLoading,
  searchQuery,
  setSearchQuery,
  severityFilter,
  setSeverityFilter,
  sourceFilter,
  setSourceFilter,
  onRefresh,
  onAskChat,
  onOpenModal,
}: ThreatFeedViewProps) {
  return (
    <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 lg:px-8 space-y-6 max-w-6xl mx-auto w-full">
      {/* Top Threat Metrics Overview */}
      <StatsOverview stats={stats} />

      {/* Main Threat Intelligence Feed Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-cyan-400" />
            <h1 className="text-lg font-bold tracking-tight text-white">
              Autonomous Cybersecurity Feed
            </h1>
          </div>
          <span className="text-xs text-slate-400">
            Displaying {articles.length} ingested report{articles.length === 1 ? "" : "s"}
          </span>
        </div>

        {/* Filter Controls Bar */}
        <FilterBar
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          severityFilter={severityFilter}
          setSeverityFilter={setSeverityFilter}
          sourceFilter={sourceFilter}
          setSourceFilter={setSourceFilter}
          onRefresh={onRefresh}
          isLoading={isLoading}
        />

        {/* Threat Articles Stream */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-slate-800 bg-slate-900/30 p-12 text-slate-400">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-cyan-400 border-t-transparent" />
            <p className="mt-3 text-xs">Querying threat intelligence database...</p>
          </div>
        ) : articles.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-800 bg-slate-900/20 p-12 text-center text-slate-400">
            <AlertCircle className="h-8 w-8 text-amber-500/60 mb-2" />
            <h3 className="text-sm font-semibold text-slate-300">No matching threat reports</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm">
              No reports match your current search or severity criteria. Try clearing filters or refresh the live RSS feed.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {articles.map((article) => (
              <ThreatCard
                key={article.id}
                article={article}
                onAskChat={onAskChat}
                onOpenModal={onOpenModal}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

