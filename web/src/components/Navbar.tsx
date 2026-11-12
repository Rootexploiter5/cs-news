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
    <header className="sticky top-0 z-30 flex h-14 w-full items-center justify-between border-b border-zinc-850 bg-black/90 px-4 backdrop-blur-md">
      {/* Left controls */}
      <div className="flex items-center gap-2.5">
        {!isSidebarOpen && (
          <button
            onClick={onToggleSidebar}
            className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-900 hover:text-white transition"
            title="Open sidebar"
          >
            <PanelLeft className="h-4 w-4" />
          </button>
        )}

        {/* ChatGPT-style Model Selector Pill with Flowing Gradient Glow */}
        <div className="flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-1.5 text-xs font-semibold text-zinc-100 shadow-md">
          <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
          <span className="font-semibold text-white">Sentinel AI 4.0</span>
          <span className="rounded bg-black px-1.5 py-0.5 text-[9px] font-mono text-cyan-400 border border-cyan-800/40">
            768d RAG
          </span>
        </div>
      </div>

      {/* Center View Switcher Tabs */}
      <div className="flex items-center rounded-xl border border-zinc-850 bg-zinc-950 p-1 shadow-inner">
        <button
          onClick={() => onSelectView("chat")}
          className={`flex items-center gap-1.5 rounded-lg px-3 py-1 text-xs font-medium transition ${
            activeView === "chat"
              ? "bg-zinc-850 text-white shadow-sm font-semibold border border-zinc-750"
              : "text-zinc-400 hover:text-white"
          }`}
        >
          <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
          <span>AI Analyst</span>
        </button>

        <button
          onClick={() => onSelectView("feed")}
          className={`flex items-center gap-1.5 rounded-lg px-3 py-1 text-xs font-medium transition ${
            activeView === "feed"
              ? "bg-zinc-850 text-white shadow-sm font-semibold border border-zinc-750"
              : "text-zinc-400 hover:text-white"
          }`}
        >
          <Radio className="h-3.5 w-3.5 text-emerald-400" />
          <span>Threat Feed</span>
          <span className="rounded-full bg-black border border-zinc-800 px-1.5 py-0.2 text-[10px] text-zinc-300 font-mono">
            {threatCount}
          </span>
        </button>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-2.5">
        <div className="hidden sm:flex items-center gap-1.5 rounded-full border border-zinc-850 bg-zinc-950 px-3 py-1 text-[11px] text-zinc-300">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
          <span>pgvector Active</span>
        </div>

        <button
          onClick={onNewChat}
          className="flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-zinc-800 hover:border-zinc-700 transition shadow-sm"
          title="New Investigation"
        >
          <Plus className="h-3.5 w-3.5 text-cyan-400" />
          <span className="hidden md:inline">New Chat</span>
        </button>
      </div>
    </header>
  );
}
