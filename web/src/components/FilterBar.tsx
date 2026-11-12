"use client";

import React from "react";
import { Search, RefreshCw } from "lucide-react";

interface FilterBarProps {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  severityFilter: number;
  setSeverityFilter: (s: number) => void;
  sourceFilter: string;
  setSourceFilter: (src: string) => void;
  onRefresh: () => void;
  isLoading: boolean;
}

export default function FilterBar({
  searchQuery,
  setSearchQuery,
  severityFilter,
  setSeverityFilter,
  sourceFilter,
  setSourceFilter,
  onRefresh,
  isLoading,
}: FilterBarProps) {
  const severityLevels = [
    { label: "All Severities", value: 0 },
    { label: "Critical (8-10)", value: 8 },
    { label: "High (6-7)", value: 6 },
    { label: "Medium (4-5)", value: 4 },
  ];

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-zinc-850 bg-[#0a0a0a] p-3 sm:flex-row sm:items-center sm:justify-between shadow-lg">
      {/* Search Input */}
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
        <input
          type="text"
          placeholder="Filter threat campaigns, actors, CVE-202X, or keywords..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full rounded-xl border border-zinc-800 bg-black py-2 pl-9 pr-4 text-xs text-white placeholder-zinc-500 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 transition"
        />
      </div>

      {/* Filter Controls */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Severity Level Buttons */}
        <div className="flex rounded-xl border border-zinc-800 bg-black p-0.5">
          {severityLevels.map((lvl) => (
            <button
              key={lvl.value}
              onClick={() => setSeverityFilter(lvl.value)}
              className={`rounded-lg px-2.5 py-1 text-xs font-medium transition ${
                severityFilter === lvl.value
                  ? "bg-zinc-800 text-cyan-400 font-semibold"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              {lvl.label}
            </button>
          ))}
        </div>

        {/* Source Select */}
        <select
          value={sourceFilter}
          onChange={(e) => setSourceFilter(e.target.value)}
          className="rounded-xl border border-zinc-800 bg-black px-3 py-1.5 text-xs text-zinc-300 focus:border-cyan-500 focus:outline-none"
        >
          <option value="all">All Intelligence Sources</option>
          <option value="BleepingComputer">BleepingComputer</option>
          <option value="The Hacker News">The Hacker News</option>
          <option value="CISA Advisories">CISA Advisories</option>
        </select>

        {/* Refresh Button */}
        <button
          onClick={onRefresh}
          disabled={isLoading}
          className="flex items-center gap-1.5 rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs font-medium text-zinc-200 hover:bg-zinc-850 hover:border-zinc-700 hover:text-white transition disabled:opacity-50"
          title="Refresh Feed"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin text-cyan-400" : ""}`} />
          <span className="hidden md:inline">Refresh</span>
        </button>
      </div>
    </div>
  );
}
