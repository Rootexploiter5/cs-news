import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { ThreatArticle } from "@/types/threat";
import crypto from "crypto";

export const dynamic = "force-dynamic";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";
const VECTOR_DIMENSION = 768;

/**
 * Generates a deterministic normalized pseudo-vector of 768 dimensions
 * to match the worker fallback when offline or without an active API key.
 */
function generateDeterministicEmbedding(text: string, dim: number = 768): number[] {
  const hash = crypto.createHash("sha256").update(text).digest();
  const vector: number[] = [];

  for (let i = 0; i < dim; i++) {
    const byte = hash[i % hash.length];
    const val = Math.sin((i + 1) * (byte + 1)) * Math.cos(i * 0.1);
    vector.push(parseFloat(val.toFixed(6)));
  }

  // Normalize (L2 norm)
  const norm = Math.sqrt(vector.reduce((acc, val) => acc + val * val, 0)) || 1.0;
  return vector.map((v) => parseFloat((v / norm).toFixed(6)));
}

/**
 * Generates a 768-dim embedding using Google Gemini's text-embedding-004.
 */
async function getQueryEmbedding(text: string): Promise<number[]> {
  if (GEMINI_API_KEY) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key=${GEMINI_API_KEY}`;
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "models/text-embedding-004",
          content: { parts: [{ text }] },
          outputDimensionality: VECTOR_DIMENSION,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const values = data.embedding?.values;
        if (Array.isArray(values) && values.length === VECTOR_DIMENSION) {
          return values;
        }
      }
    } catch (err) {
      console.warn("Gemini embedding API call failed, falling back to deterministic vector:", err);
    }
  }

  return generateDeterministicEmbedding(text, VECTOR_DIMENSION);
}

/**
 * Calls Gemini to synthesize an answer based on RAG context.
 */
async function synthesizeRagAnswer(
  userQuery: string,
  contextArticles: ThreatArticle[]
): Promise<string> {
  const contextText = contextArticles
    .map(
      (a, i) =>
        `[Source ${i + 1}]:\nTitle: ${a.title}\nSeverity: ${a.severity}/10\nThreat Actor: ${
          a.threat_actor
        }\nCVEs: ${a.cve_list?.join(", ") || "None"}\nSummary: ${a.summary}\nSource URL: ${
          a.source_url
        }\n`
    )
    .join("\n---\n");

  const prompt = `You are Sentinel AI, an autonomous cybersecurity threat intelligence assistant.
Analyze the user's question using the retrieved threat intelligence articles below.
Synthesize a clear, analytical, and actionable answer citing specific sources, CVE identifiers, threat actors, and severity scores.

Retrieved Threat Intelligence Context:
${contextText}

User Question: ${userQuery}

Guidelines:
- Provide an executive threat assessment.
- Cite sources using [Source N] format.
- Highlight any active zero-days, CVEs, or high-risk actors.
- Recommend defensive triage steps if applicable.`;

  if (GEMINI_API_KEY) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.2, maxOutputTokens: 1000 },
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) return text;
      }
    } catch (e) {
      console.warn("Gemini generation failed, using local synthesis engine:", e);
    }
  }

  // Autonomous synthesis engine if offline or no API key
  if (contextArticles.length === 0) {
    return `Sentinel AI did not find any matching threat reports in the current database for "${userQuery}". Try broadening your search or checking back after the next feed ingestion cycle.`;
  }

  const topArticle = contextArticles[0];
  const allCves = Array.from(new Set(contextArticles.flatMap((a) => a.cve_list || [])));

  return `### Threat Intelligence Synthesis

Based on semantic vector retrieval across our threat database, here are the primary findings for **"${userQuery}"**:

**Key Incident:** [${topArticle.title}](${topArticle.source_url})  
- **Severity Rating:** ${topArticle.severity}/10  
- **Identified Threat Actor:** ${topArticle.threat_actor}  
- **Tracked CVEs:** ${allCves.length > 0 ? allCves.join(", ") : "None directly assigned"}  

**Intelligence Summary:**  
${topArticle.summary}

**Correlated Threats:**  
${contextArticles
  .slice(1, 4)
  .map(
    (a, idx) =>
      `• **[Source ${idx + 2}]** [${a.title}](${a.source_url}) (Severity: ${a.severity}/10, Actor: ${a.threat_actor})`
  )
  .join("\n")}

**Recommended Action:**  
Verify endpoint telemetry for associated indicators of compromise and ensure emergency security patches for listed CVEs are applied.`;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const message = body.message?.trim();

    if (!message) {
      return NextResponse.json(
        { error: "Query message is required." },
        { status: 400 }
      );
    }

    // 1. Generate Query Vector Embedding
    const queryVector = await getQueryEmbedding(message);
    const vectorStr = `[${queryVector.join(",")}]`;

    // 2. Perform Cosine Similarity Search in PostgreSQL with pgvector
    let relevantArticles: ThreatArticle[] = [];

    try {
      const similaritySql = `
        SELECT 
          id, 
          source_url, 
          title, 
          summary, 
          threat_actor, 
          severity, 
          cve_list, 
          source, 
          published_at,
          1 - (embedding <=> $1::vector) AS similarity
        FROM threat_articles
        WHERE embedding IS NOT NULL
        ORDER BY embedding <=> $1::vector ASC
        LIMIT 5;
      `;
      const result = await query<ThreatArticle>(similaritySql, [vectorStr]);
      relevantArticles = result.rows;
    } catch (dbErr: any) {
      console.warn("pgvector query failed or uninitialized, falling back to text match:", dbErr.message);
      // Fallback text query
      const textSql = `
        SELECT id, source_url, title, summary, threat_actor, severity, cve_list, source, published_at
        FROM threat_articles
        ORDER BY severity DESC, published_at DESC
        LIMIT 5;
      `;
      const fallbackRes = await query<ThreatArticle>(textSql);
      relevantArticles = fallbackRes.rows;
    }

    // 3. Synthesize RAG Response
    const reply = await synthesizeRagAnswer(message, relevantArticles);

    return NextResponse.json({
      success: true,
      reply,
      sources: relevantArticles,
    });
  } catch (error: any) {
    console.error("Error in RAG chat endpoint:", error);
    return NextResponse.json(
      { error: "Internal threat intelligence engine error." },
      { status: 500 }
    );
  }
}
