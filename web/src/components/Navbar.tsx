"use client";

import React from "react";
import { ShieldAlert, Database, Radio, Github } from "lucide-react";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-950/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-950/40 border border-red-500/30 text-red-500 shadow-sm shadow-red-500/20">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold tracking-tight text-white text-lg">SENTINEL AI</span>
              <span className="rounded bg-cyan-950 px-1.5 py-0.5 text-[10px] font-semibold text-cyan-400 border border-cyan-800/40">
                v1.0 MONOREPO
              </span>
            </div>
            <p className="text-xs text-slate-400">Autonomous Threat Intelligence & pgvector RAG</p>
          </div>
        </div>

        {/* Real-time Status Badges */}
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900/60 px-3 py-1 text-xs text-slate-300">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <Radio className="h-3.5 w-3.5 text-emerald-400" />
            <span>Worker Ingesting</span>
          </div>

          <div className="hidden sm:flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900/60 px-3 py-1 text-xs text-slate-300">
            <Database className="h-3.5 w-3.5 text-cyan-400" />
            <span>pgvector HNSW</span>
          </div>

          <a
            href="https://github.com/Rootexploiter5/cs-news"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs font-medium text-slate-300 hover:border-slate-700 hover:text-white transition"
          >
            <Github className="h-4 w-4" />
            <span className="hidden md:inline">GitHub</span>
          </a>
        </div>
      </div>
    </header>
  );
}
