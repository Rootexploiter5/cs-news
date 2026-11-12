import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { ThreatArticle, ThreatStats } from "@/types/threat";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const search = searchParams.get("search") || "";
  const severityMin = parseInt(searchParams.get("severity_min") || "0", 10);
  const source = searchParams.get("source") || "";

  try {
    let whereClauses: string[] = ["1=1"];
    let params: any[] = [];
    let paramIndex = 1;

    if (search) {
      whereClauses.push(
        `(title ILIKE $${paramIndex} OR summary ILIKE $${paramIndex} OR threat_actor ILIKE $${paramIndex} OR cve_list::text ILIKE $${paramIndex})`
      );
      params.push(`%${search}%`);
      paramIndex++;
    }

    if (severityMin > 0) {
      whereClauses.push(`severity >= $${paramIndex}`);
      params.push(severityMin);
      paramIndex++;
    }

    if (source && source !== "all") {
      whereClauses.push(`source ILIKE $${paramIndex}`);
      params.push(`%${source}%`);
      paramIndex++;
    }

    const whereSql = whereClauses.join(" AND ");

    // Fetch filtered threat articles
    const articlesSql = `
      SELECT id, source_url, title, summary, content, threat_actor, severity, cve_list, source, published_at, created_at
      FROM threat_articles
      WHERE ${whereSql}
      ORDER BY published_at DESC
      LIMIT 100;
    `;
    const articlesRes = await query<ThreatArticle>(articlesSql, params);

    // Fetch aggregate statistics
    const statsSql = `
      SELECT 
        COUNT(*)::int as total,
        COUNT(CASE WHEN severity >= 8 THEN 1 END)::int as critical,
        COUNT(DISTINCT threat_actor)::int as actors
      FROM threat_articles;
    `;
    const statsRes = await query(statsSql);
    const row = statsRes.rows[0] || {};

    // Calculate distinct CVEs count
    const cveSql = `
      SELECT DISTINCT jsonb_array_elements_text(cve_list) as cve
      FROM threat_articles
      WHERE cve_list IS NOT NULL AND jsonb_array_length(cve_list) > 0;
    `;
    const cveRes = await query(cveSql);

    const stats: ThreatStats = {
      totalThreats: row.total || 0,
      criticalCount: row.critical || 0,
      threatActorsCount: row.actors || 0,
      activeCves: cveRes.rowCount || 0,
    };

    return NextResponse.json({
      success: true,
      articles: articlesRes.rows,
      stats,
    });
  } catch (error: any) {
    console.error("Failed to query threat feed from database:", error.message);

    // Graceful fallback for initial setup / unseeded state
    const fallbackArticles: ThreatArticle[] = [
      {
        id: "1",
        source_url: "https://www.bleepingcomputer.com/news/security/lockbit-surge",
        title: "LockBit Ransomware Surge Targets Critical Infrastructure Globally",
        summary: "A surge in LockBit ransomware intrusions has impacted manufacturing and healthcare sectors. The group exploits exposed VPN gateways and unpatched remote management endpoints.",
        threat_actor: "LockBit 3.0",
        severity: 9,
        cve_list: ["CVE-2024-21887", "CVE-2024-3400"],
        source: "BleepingComputer",
        published_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
      },
      {
        id: "2",
        source_url: "https://thehackernews.com/cisco-vpn-zero-day",
        title: "Critical Zero-Day in Cisco ASA and FTD Firewalls Actively Exploited",
        summary: "Cisco released emergency patches addressing an RCE zero-day flaw in ASA and FTD software. Threat actors are bypassing authentication via crafted HTTP requests.",
        threat_actor: "Volt Typhoon",
        severity: 10,
        cve_list: ["CVE-2026-1029", "CVE-2026-1030"],
        source: "The Hacker News",
        published_at: new Date(Date.now() - 3600000).toISOString(),
        created_at: new Date(Date.now() - 3600000).toISOString(),
      },
      {
        id: "3",
        source_url: "https://www.bleepingcomputer.com/news/security/darkgate-wave",
        title: "Massive Phishing Wave Deploys DarkGate Malware via PDFs",
        summary: "Security researchers observed a high-volume phishing campaign distributing DarkGate loader disguised as financial invoices to steal browser credentials.",
        threat_actor: "DarkGate Operator",
        severity: 7,
        cve_list: [],
        source: "BleepingComputer",
        published_at: new Date(Date.now() - 7200000).toISOString(),
        created_at: new Date(Date.now() - 7200000).toISOString(),
      }
    ];

    const fallbackStats: ThreatStats = {
      totalThreats: fallbackArticles.length,
      criticalCount: fallbackArticles.filter((a) => a.severity >= 8).length,
      activeCves: 4,
      threatActorsCount: 3,
    };

    return NextResponse.json({
      success: true,
      articles: fallbackArticles,
      stats: fallbackStats,
      fallback: true,
    });
  }
}

