"use client";

import React, { useState, useEffect, useCallback } from "react";
import StatsOverview from "@/components/StatsOverview";
import FilterBar from "@/components/FilterBar";
import ThreatCard from "@/components/ThreatCard";
import ChatBox from "@/components/ChatBox";
import ThreatDetailModal from "@/components/ThreatDetailModal";
import { ThreatArticle, ThreatStats } from "@/types/threat";
import { Shield, AlertCircle } from "lucide-react";

export default function DashboardPage() {
  const [articles, setArticles] = useState<ThreatArticle[]>([]);
  const [stats, setStats] = useState<ThreatStats>({
    totalThreats: 0,
    criticalCount: 0,
    activeCves: 0,
    threatActorsCount: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [severityFilter, setSeverityFilter] = useState(0);
  const [sourceFilter, setSourceFilter] = useState("all");
  const [chatPrompt, setChatPrompt] = useState<string>("");
  const [selectedArticle, setSelectedArticle] = useState<ThreatArticle | null>(null);

  const fetchThreatData = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.set("search", searchQuery);
      if (severityFilter > 0) params.set("severity_min", severityFilter.toString());
      if (sourceFilter && sourceFilter !== "all") params.set("source", sourceFilter);

      const res = await fetch(`/api/feed?${params.toString()}`);
      const data = await res.json();

      if (data.success) {
        setArticles(data.articles || []);
        if (data.stats) {
          setStats(data.stats);
        }
      }
    } catch (err) {
      console.error("Failed to load threat intelligence feed:", err);
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, severityFilter, sourceFilter]);

  // Initial load and filter change trigger
  useEffect(() => {
    const handler = setTimeout(() => {
      fetchThreatData();
    }, 250);

    return () => clearTimeout(handler);
  }, [fetchThreatData]);

  const handleCardAskChat = (article: ThreatArticle) => {
    const prompt = `Analyze this incident: "${article.title}" (Severity: ${article.severity}/10, Actor: ${article.threat_actor}). What are the key indicators of compromise, vulnerabilities, and recommended mitigations?`;
    setChatPrompt(prompt);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 space-y-6">
      {/* Top Threat Metrics */}
      <StatsOverview stats={stats} />

      {/* Main Split Layout: Threat Feed & Live RAG Assistant */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left Column: Intelligence Feed (7 Cols on desktop) */}
        <section className="space-y-4 lg:col-span-7">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-cyan-400" />
              <h1 className="text-lg font-bold tracking-tight text-white">Chronological Threat Feed</h1>
            </div>
            <span className="text-xs text-slate-400">
              Showing {articles.length} report{articles.length === 1 ? "" : "s"}
            </span>
          </div>

          {/* Filtering Controls */}
          <FilterBar
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            severityFilter={severityFilter}
            setSeverityFilter={setSeverityFilter}
            sourceFilter={sourceFilter}
            setSourceFilter={setSourceFilter}
            onRefresh={fetchThreatData}
            isLoading={isLoading}
          />

          {/* Articles Feed */}
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
                No articles match your current search or severity filter criteria. Try clearing filters or wait for the next ingestion poll.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {articles.map((article) => (
                <ThreatCard
                  key={article.id}
                  article={article}
                  onAskChat={handleCardAskChat}
                  onOpenModal={(art) => setSelectedArticle(art)}
                />
              ))}
            </div>
          )}
        </section>

        {/* Right Column: RAG Chat Assistant (5 Cols, Sticky) */}
        <aside className="lg:col-span-5">
          <div className="sticky top-20 h-[calc(100vh-6.5rem)] min-h-[500px]">
            <ChatBox
              initialPrompt={chatPrompt}
              onClearPrompt={() => setChatPrompt("")}
            />
          </div>
        </aside>
      </div>

      {/* In-UI Full Threat Intelligence Dossier Modal */}
      <ThreatDetailModal
        article={selectedArticle}
        onClose={() => setSelectedArticle(null)}
        onAskChat={handleCardAskChat}
      />
    </div>
  );
}

