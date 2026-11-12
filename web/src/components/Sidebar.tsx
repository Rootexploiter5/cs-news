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
    <aside className="fixed inset-y-0 left-0 z-40 flex w-64 md:w-72 flex-col border-r border-slate-800/80 bg-slate-950 text-slate-200 transition-all duration-200">
      {/* Top Header */}
      <div className="flex h-14 items-center justify-between border-b border-slate-800/60 px-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-950/50 border border-red-500/30 text-red-400 shadow-sm shadow-red-500/20">
            <ShieldAlert className="h-4 w-4" />
          </div>
          <div>
            <span className="font-bold text-sm tracking-tight text-white block">SENTINEL AI</span>
            <span className="text-[10px] text-cyan-400 block font-mono">pgvector RAG engine</span>
          </div>
        </div>

        <button
          onClick={onToggle}
          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-900 hover:text-white transition"
          title="Close sidebar"
        >
          <PanelLeftClose className="h-4 w-4" />
        </button>
      </div>

      {/* New Chat Button */}
      <div className="p-3">
        <button
          onClick={onNewChat}
          className="flex w-full items-center justify-between rounded-xl border border-slate-800 bg-slate-900/80 px-3.5 py-2.5 text-xs font-semibold text-white hover:bg-slate-800/80 hover:border-slate-700 transition shadow-sm group"
        >
          <div className="flex items-center gap-2">
            <SquarePen className="h-4 w-4 text-cyan-400 group-hover:scale-110 transition" />
            <span>New Threat Analysis</span>
          </div>
          <span className="rounded bg-slate-800 px-1.5 py-0.5 text-[10px] font-mono text-slate-400">Ctrl+K</span>
        </button>
      </div>

      {/* Navigation Modes */}
      <div className="px-3 pb-2 space-y-1">
        <button
          onClick={() => onSelectView("chat")}
          className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-xs font-medium transition ${
            activeView === "chat"
              ? "bg-cyan-950/40 text-cyan-300 border border-cyan-800/40 font-semibold"
              : "text-slate-300 hover:bg-slate-900 hover:text-white"
          }`}
        >
          <div className="flex items-center gap-2.5">
            <Sparkles className="h-4 w-4 text-cyan-400" />
            <span>AI Analyst (ChatGPT)</span>
          </div>
          <span className="rounded-full bg-cyan-950 px-1.5 py-0.5 text-[10px] text-cyan-300 font-mono">RAG</span>
        </button>

        <button
          onClick={() => onSelectView("feed")}
          className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-xs font-medium transition ${
            activeView === "feed"
              ? "bg-slate-800/80 text-white font-semibold"
              : "text-slate-300 hover:bg-slate-900 hover:text-white"
          }`}
        >
          <div className="flex items-center gap-2.5">
            <Radio className="h-4 w-4 text-emerald-400" />
            <span>Live Threat Feed</span>
          </div>
          <span className="rounded-full bg-slate-800 px-2 py-0.5 text-[10px] text-slate-300 font-mono">
            {threatCount}
          </span>
        </button>

        <button
          onClick={() => onSelectView("feed", "critical")}
          className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-xs font-medium text-slate-300 hover:bg-slate-900 hover:text-white transition"
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
          className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-xs font-medium text-slate-300 hover:bg-slate-900 hover:text-white transition"
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
        <div className="mb-2 px-2 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
          Recent Investigations
        </div>

        <div className="space-y-1">
          {sessions.length === 0 ? (
            <div className="px-2 py-4 text-center text-xs text-slate-500 italic">
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
                      ? "bg-slate-800 text-white font-medium"
                      : "text-slate-400 hover:bg-slate-900 hover:text-slate-200"
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0 pr-1">
                    <MessageSquare className="h-3.5 w-3.5 shrink-0 opacity-70 group-hover:opacity-100" />
                    <span className="truncate">{session.title}</span>
                  </div>

                  <button
                    onClick={(e) => onDeleteSession(session.id, e)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-slate-500 hover:text-red-400 transition"
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
      <div className="border-t border-slate-800/80 bg-slate-950 p-3 space-y-2">
        <div className="flex items-center justify-between rounded-lg border border-slate-800/80 bg-slate-900/60 p-2.5 text-[11px]">
          <div className="flex items-center gap-2">
            <Database className="h-3.5 w-3.5 text-cyan-400" />
            <span className="text-slate-300">pgvector HNSW</span>
          </div>
          <span className="font-mono text-emerald-400 text-[10px] font-bold">ONLINE</span>
        </div>

        <div className="flex items-center justify-between px-1 text-[11px] text-slate-400">
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
