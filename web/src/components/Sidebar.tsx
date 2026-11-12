"use client";

import React from "react";
import {
  MessageSquare,
  SquarePen,
  ShieldAlert,
  Radio,
  Flame,
  Bug,
  Database,
  Trash2,
  PanelLeftClose,
  Sparkles,
  Github
} from "lucide-react";
import { ChatSession } from "@/types/chat";

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  activeView: "chat" | "feed";
  onSelectView: (view: "chat" | "feed", filter?: string) => void;
  sessions: ChatSession[];
  activeSessionId: string;
  onSelectSession: (id: string) => void;
  onNewChat: () => void;
  onDeleteSession: (id: string, e: React.MouseEvent) => void;
  threatCount: number;
  criticalCount: number;
  cveCount: number;
}

export default function Sidebar({
  isOpen,
  onToggle,
  activeView,
  onSelectView,
  sessions,
  activeSessionId,
  onSelectSession,
  onNewChat,
  onDeleteSession,
  threatCount,
  criticalCount,
  cveCount,
}: SidebarProps) {
  if (!isOpen) return null;

  return (
    <aside className="fixed inset-y-0 left-0 z-40 flex w-64 md:w-72 flex-col border-r border-zinc-850 bg-black text-zinc-200 transition-all duration-200">
      {/* Top Header */}
      <div className="flex h-14 items-center justify-between border-b border-zinc-850/80 px-4 bg-black">
        <div className="flex items-center gap-2.5">
          <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-900 border border-zinc-700 text-cyan-400 shadow-md">
            <ShieldAlert className="h-4 w-4" />
          </div>
          <div>
            <span className="font-bold text-sm tracking-tight text-white block">SENTINEL AI</span>
            <span className="text-[10px] text-cyan-400 block font-mono font-medium">pgvector 768d RAG</span>
          </div>
        </div>

        <button
          onClick={onToggle}
          className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-900 hover:text-white transition"
          title="Close sidebar"
        >
          <PanelLeftClose className="h-4 w-4" />
        </button>
      </div>

      {/* New Chat Button (Styled with subtle gradient highlight) */}
      <div className="p-3">
        <button
          onClick={onNewChat}
          className="flex w-full items-center justify-between rounded-xl border border-zinc-800 bg-zinc-900/90 px-3.5 py-2.5 text-xs font-semibold text-white hover:bg-zinc-850 hover:border-zinc-700 transition shadow-sm group"
        >
          <div className="flex items-center gap-2">
            <SquarePen className="h-4 w-4 text-cyan-400 group-hover:scale-110 transition" />
            <span>New Threat Analysis</span>
          </div>
          <span className="rounded bg-black px-1.5 py-0.5 text-[10px] font-mono text-zinc-400 border border-zinc-800">
            Ctrl+K
          </span>
        </button>
      </div>

      {/* Navigation Modes */}
      <div className="px-3 pb-2 space-y-1">
        <button
          onClick={() => onSelectView("chat")}
          className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-xs font-medium transition ${
            activeView === "chat"
              ? "bg-zinc-900 text-white border border-zinc-800 font-semibold shadow-sm"
              : "text-zinc-400 hover:bg-zinc-900/60 hover:text-white"
          }`}
        >
          <div className="flex items-center gap-2.5">
            <Sparkles className="h-4 w-4 text-cyan-400" />
            <span>AI Analyst (ChatGPT)</span>
          </div>
          <span className="rounded-full bg-cyan-950/80 border border-cyan-500/40 px-1.5 py-0.5 text-[10px] text-cyan-300 font-mono">
            LIVE
          </span>
        </button>

        <button
          onClick={() => onSelectView("feed")}
          className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-xs font-medium transition ${
            activeView === "feed"
              ? "bg-zinc-900 text-white border border-zinc-800 font-semibold"
              : "text-zinc-400 hover:bg-zinc-900/60 hover:text-white"
          }`}
        >
          <div className="flex items-center gap-2.5">
            <Radio className="h-4 w-4 text-emerald-400" />
            <span>Live Threat Feed</span>
          </div>
          <span className="rounded-full bg-zinc-900 px-2 py-0.5 text-[10px] text-zinc-300 font-mono border border-zinc-800">
            {threatCount}
          </span>
        </button>

        <button
          onClick={() => onSelectView("feed", "critical")}
          className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-xs font-medium text-zinc-400 hover:bg-zinc-900 hover:text-white transition"
        >
          <div className="flex items-center gap-2.5">
            <Flame className="h-4 w-4 text-red-400" />
            <span>Critical Zero-Days</span>
          </div>
          <span className="rounded-full bg-red-950/80 border border-red-500/30 px-2 py-0.5 text-[10px] text-red-300 font-mono font-bold">
            {criticalCount}
          </span>
        </button>

        <button
          onClick={() => onSelectView("feed", "cve")}
          className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-xs font-medium text-zinc-400 hover:bg-zinc-900 hover:text-white transition"
        >
          <div className="flex items-center gap-2.5">
            <Bug className="h-4 w-4 text-amber-400" />
            <span>CVE Vulnerability Index</span>
          </div>
          <span className="rounded-full bg-amber-950/80 border border-amber-500/30 px-2 py-0.5 text-[10px] text-amber-300 font-mono">
            {cveCount}
          </span>
        </button>
      </div>

      {/* Chat Sessions History */}
      <div className="flex-1 overflow-y-auto px-3 py-2">
        <div className="mb-2 px-2 text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">
          Recent Investigations
        </div>

        <div className="space-y-1">
          {sessions.length === 0 ? (
            <div className="px-2 py-4 text-center text-xs text-zinc-500 italic">
              No recent investigations yet. Start a new threat query above.
            </div>
          ) : (
            sessions.map((session) => {
              const isActive = session.id === activeSessionId && activeView === "chat";
              return (
                <div
                  key={session.id}
                  onClick={() => {
                    onSelectSession(session.id);
                    onSelectView("chat");
                  }}
                  className={`group flex items-center justify-between rounded-lg px-2.5 py-2 text-xs cursor-pointer transition ${
                    isActive
                      ? "bg-zinc-900 text-white font-medium border border-zinc-800"
                      : "text-zinc-400 hover:bg-zinc-900/60 hover:text-zinc-200"
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0 pr-1">
                    <MessageSquare className="h-3.5 w-3.5 shrink-0 opacity-70 group-hover:opacity-100" />
                    <span className="truncate">{session.title}</span>
                  </div>

                  <button
                    onClick={(e) => onDeleteSession(session.id, e)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-zinc-500 hover:text-red-400 transition"
                    title="Delete Chat"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Footer / System Status */}
      <div className="border-t border-zinc-850 bg-black p-3 space-y-2">
        <div className="flex items-center justify-between rounded-lg border border-zinc-850 bg-zinc-950 p-2.5 text-[11px]">
          <div className="flex items-center gap-2">
            <Database className="h-3.5 w-3.5 text-cyan-400" />
            <span className="text-zinc-300">pgvector HNSW</span>
          </div>
          <span className="font-mono text-emerald-400 text-[10px] font-bold">ONLINE</span>
        </div>

        <div className="flex items-center justify-between px-1 text-[11px] text-zinc-400">
          <span className="flex items-center gap-1.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>Feeds Ingesting</span>
          </span>
          <a
            href="https://github.com/Rootexploiter5/cs-news"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 hover:text-white transition"
          >
            <Github className="h-3 w-3" />
            <span>GitHub</span>
          </a>
        </div>
      </div>
    </aside>
  );
}
