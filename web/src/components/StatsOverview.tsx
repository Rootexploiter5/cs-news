"use client";

import React from "react";
import { ShieldCheck, AlertTriangle, Bug, Users } from "lucide-react";
import { ThreatStats } from "@/types/threat";

interface StatsOverviewProps {
  stats: ThreatStats;
}

export default function StatsOverview({ stats }: StatsOverviewProps) {
  const cards = [
    {
      label: "Total Monitored Threats",
      value: stats.totalThreats,
      icon: ShieldCheck,
      color: "text-cyan-400",
      accent: "bg-cyan-500/10 border-cyan-500/20",
    },
    {
      label: "Critical Alerts (Sev >= 8)",
      value: stats.criticalCount,
      icon: AlertTriangle,
      color: "text-red-400",
      accent: "bg-red-500/10 border-red-500/30 ring-1 ring-red-500/20",
      highlight: true,
    },
    {
      label: "Active Tracked CVEs",
      value: stats.activeCves,
      icon: Bug,
      color: "text-amber-400",
      accent: "bg-amber-500/10 border-amber-500/20",
    },
    {
      label: "Identified Threat Actors",
      value: stats.threatActorsCount,
      icon: Users,
      color: "text-emerald-400",
      accent: "bg-emerald-500/10 border-emerald-500/20",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3.5 lg:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.label}
            className={`relative overflow-hidden rounded-2xl border border-zinc-850 bg-[#0a0a0a] p-4 transition-all duration-300 hover:border-zinc-700 hover:shadow-xl ${
              card.highlight ? "shadow-lg shadow-red-500/5" : ""
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-zinc-400">{card.label}</span>
              <div className={`flex h-7 w-7 items-center justify-center rounded-lg border ${card.accent}`}>
                <Icon className={`h-4 w-4 ${card.color}`} />
              </div>
            </div>
            <div className="mt-2.5 flex items-baseline gap-2">
              <span className="text-2xl font-extrabold tracking-tight text-white">{card.value}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
