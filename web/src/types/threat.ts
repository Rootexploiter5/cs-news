export interface ThreatArticle {
  id: string;
  source_url: string;
  title: string;
  summary: string;
  threat_actor: string;
  severity: number;
  cve_list: string[];
  source: string;
  published_at: string;
  created_at: string;
  similarity?: number;
}

export interface ThreatStats {
  totalThreats: number;
  criticalCount: number;
  activeCves: number;
  threatActorsCount: number;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources?: ThreatArticle[];
  timestamp: string;
}
