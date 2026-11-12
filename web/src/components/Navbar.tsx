"use client";

import React from "react";
import {
  PanelLeft,
  Sparkles,
  Radio,
  Plus,
  ShieldCheck
} from "lucide-react";

interface NavbarProps {
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
  activeView: "chat" | "feed";
  onSelectView: (view: "chat" | "feed") => void;
  onNewChat: () => void;
  threatCount: number;
}

export default function Navbar({
  isSidebarOpen,
  onToggleSidebar,
  activeView,
  onSelectView,
  onNewChat,
  threatCount,
}: NavbarProps) {
  return (
    <header className="sticky top-0 z-30 flex h-14 w-full items-center justify-between border-b border-slate-800/80 bg-slate-950/80 px-3 backdrop-blur-md">
      {/* Left controls */}
      <div className="flex items-center gap-2">
        {!isSidebarOpen && (
          <button
            onClick={onToggleSidebar}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-900 hover:text-white transition"
            title="Open sidebar"
          >
            <PanelLeft className="h-4 w-4" />
          </button>
        )}

        {/* ChatGPT-style Model Selector Pill */}
        <div className="flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-900/60 px-3 py-1.5 text-xs font-semibold text-slate-200 shadow-sm">
          <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
          <span>Sentinel AI 4.0</span>
          <span className="rounded bg-cyan-950 px-1 py-0.2 text-[9px] font-mono text-cyan-400 border border-cyan-800/40">
            768d RAG
          </span>
        </div>
      </div>

      {/* Center View Switcher Tabs */}
      <div className="flex items-center rounded-xl border border-slate-800 bg-slate-900/80 p-0.5 shadow-sm">
        <button
          onClick={() => onSelectView("chat")}
          className={`flex items-center gap-1.5 rounded-lg px-3 py-1 text-xs font-medium transition ${
            activeView === "chat"
              ? "bg-slate-800 text-white shadow-sm font-semibold"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
          <span>AI Analyst</span>
        </button>

        <button
          onClick={() => onSelectView("feed")}
          className={`flex items-center gap-1.5 rounded-lg px-3 py-1 text-xs font-medium transition ${
            activeView === "feed"
              ? "bg-slate-800 text-white shadow-sm font-semibold"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <Radio className="h-3.5 w-3.5 text-emerald-400" />
          <span>Threat Feed</span>
          <span className="rounded-full bg-slate-800 px-1.5 py-0.2 text-[10px] text-slate-400 font-mono">
            {threatCount}
          </span>
        </button>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-2">
        <div className="hidden sm:flex items-center gap-1.5 rounded-full border border-slate-800/80 bg-slate-900/40 px-2.5 py-1 text-[11px] text-slate-300">
          <ShieldCheck className="h-3 w-3 text-emerald-400" />
          <span>pgvector Active</span>
        </div>

        <button
          onClick={onNewChat}
          className="flex items-center gap-1 rounded-lg border border-slate-800 bg-slate-900 px-2.5 py-1.5 text-xs font-medium text-slate-200 hover:bg-slate-800 hover:text-white transition"
          title="New Investigation"
        >
          <Plus className="h-3.5 w-3.5 text-cyan-400" />
          <span className="hidden md:inline">New Chat</span>
        </button>
      </div>
    </header>
  );
}
