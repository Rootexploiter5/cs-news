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
      label: "Today's Threat Reports (24h)",
      value: stats.totalThreats,
      icon: ShieldCheck,
      color: "text-blue-400",
      bg: "bg-blue-500/10 border-blue-500/20",
    },
    {
      label: "Critical Threats Today",
      value: stats.criticalCount,
      icon: AlertTriangle,
      color: "text-red-400",
      bg: "bg-red-500/10 border-red-500/20",
      highlight: true,
    },
    {
      label: "Tracked CVEs Today",
      value: stats.activeCves,
      icon: Bug,
      color: "text-amber-400",
      bg: "bg-amber-500/10 border-amber-500/20",
    },
    {
      label: "Active Threat Actors (24h)",
      value: stats.threatActorsCount,
      icon: Users,
      color: "text-emerald-400",
      bg: "bg-emerald-500/10 border-emerald-500/20",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.label}
            className={`relative overflow-hidden rounded-xl border p-4 transition-all duration-200 ${card.bg} ${
              card.highlight ? "shadow-lg shadow-red-500/5 ring-1 ring-red-500/30" : ""
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400">{card.label}</span>
              <Icon className={`h-5 w-5 ${card.color}`} />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold tracking-tight text-white">{card.value}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

