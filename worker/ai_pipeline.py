"""
Sentinel AI: LLM Structured Extraction & Vector Embedding Pipeline
Extracts structured indicators (actors, severity, CVEs) and 768-dim embeddings.
"""

import os
import re
import json
import hashlib
import logging
import math
from typing import Dict, Any, List, Optional
import google.generativeai as genai
from pydantic import BaseModel, Field

logger = logging.getLogger("sentinel.ai_pipeline")

# Initialize Gemini if API key is present
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "").strip()
LLM_MODEL = os.getenv("LLM_MODEL", "gemini-1.5-flash")
EMBEDDING_MODEL = os.getenv("EMBEDDING_MODEL", "models/text-embedding-004")
VECTOR_DIMENSION = int(os.getenv("EMBEDDING_DIMENSIONS", "768"))

if GEMINI_API_KEY:
    try:
        genai.configure(api_key=GEMINI_API_KEY)
        logger.info(f"Gemini AI client successfully configured (Model: {LLM_MODEL})")
    except Exception as e:
        logger.warning(f"Failed to configure Gemini client: {e}")
else:
    logger.info("GEMINI_API_KEY not configured. Running in autonomous heuristic fallback mode.")


class ThreatAnalysisResult(BaseModel):
    summary: str = Field(description="A concise 2-3 sentence executive threat summary.")
    threat_actor: str = Field(default="Unknown", description="Identified threat actor, group, or campaign name.")
    severity: int = Field(ge=1, le=10, description="Threat severity score from 1 (informational) to 10 (critical zero-day).")
    cve_list: List[str] = Field(default_factory=list, description="List of CVE identifiers found, e.g. CVE-2026-1234.")


def extract_cves_regex(text: str) -> List[str]:
    """Scans text for standard CVE identifier formats."""
    matches = re.findall(r"\bCVE-\d{4}-\d{4,7}\b", text, flags=re.IGNORECASE)
    # Deduplicate while preserving uppercase standard format
    return sorted(list(set(m.upper() for m in matches)))


def generate_deterministic_embedding(text: str, dim: int = 768) -> List[float]:
    """
    Generates a deterministic normalized pseudo-embedding vector of specified dimension
    when offline or running without external API keys. Ensures pgvector compatibility.
    """
    vector: List[float] = []
    # Seed generator with MD5 hash of text
    seed_hash = hashlib.sha256(text.encode("utf-8")).digest()
    for i in range(dim):
        byte_val = seed_hash[i % len(seed_hash)]
        # Add trigonometric variation for distributed representation
        val = math.sin((i + 1) * (byte_val + 1)) * math.cos(i * 0.1)
        vector.append(round(val, 6))

    # Normalize vector to unit length (L2 norm) for cosine similarity
    norm = math.sqrt(sum(x * x for x in vector)) or 1.0
    return [round(x / norm, 6) for x in vector]


def extract_threat_with_gemini(title: str, text: str) -> Optional[ThreatAnalysisResult]:
    """Uses Gemini LLM with strict system prompting to extract threat metadata."""
    if not GEMINI_API_KEY:
        return None

    system_prompt = (
        "You are a Senior Threat Intelligence Analyst for Sentinel AI. Analyze the following cybersecurity news article. "
        "Extract the threat intelligence into a strict JSON object with this exact schema:\n"
        "{\n"
        '  "summary": "Concise 2-3 sentence executive threat briefing.",\n'
        '  "threat_actor": "Name of threat actor or group (e.g. LockBit, APT28, Lazarus), or \'Unknown\'",\n'
        '  "severity": <integer 1 to 10 based on CVSS / real-world impact>,\n'
        '  "cve_list": ["CVE-YYYY-NNNN"]\n'
        "}\n"
        "Severity Guidelines:\n"
        "- 9-10: Actively exploited zero-day, widespread ransomware, critical remote code execution (RCE).\n"
        "- 7-8: High severity authenticated RCE, active privilege escalation, notable malware campaign.\n"
        "- 4-6: Moderate vulnerabilities, phishing templates, proof-of-concept without active exploit.\n"
        "- 1-3: Low severity, informational advisory, security patches or policy updates."
    )

    prompt = f"Article Title: {title}\n\nArticle Content:\n{text[:4000]}"

    try:
        model = genai.GenerativeModel(
            model_name=LLM_MODEL,
            generation_config={"response_mime_type": "application/json"}
        )
        response = model.generate_content([system_prompt, prompt])
        parsed = json.loads(response.text)
        return ThreatAnalysisResult(**parsed)
    except Exception as e:
        logger.warning(f"Gemini analysis failed or rate limited: {e}. Falling back to heuristic.")
        return None


def heuristic_analysis(title: str, text: str) -> ThreatAnalysisResult:
    """
    High-accuracy heuristic fallback that scores threat severity and extracts actors
    when the LLM API is unavailable.
    """
    combined = (title + " " + text).lower()
    
    # 1. Base Severity Calculation
    score = 4
    if any(k in combined for k in ["zero-day", "0-day", "actively exploited", "critical rce", "emergency patch"]):
        score = 10
    elif any(k in combined for k in ["ransomware", "remote code execution", "lockbit", "bypass authentication"]):
        score = 9
    elif any(k in combined for k in ["privilege escalation", "data breach", "supply chain", "backdoor"]):
        score = 8
    elif any(k in combined for k in ["malware", "trojan", "infostealer", "cve-", "unpatched"]):
        score = 7
    elif any(k in combined for k in ["phishing", "scam", "vulnerability"]):
        score = 5

    # 2. Actor Extraction
    threat_actor = "Unknown"
    known_actors = [
        "LockBit", "BlackCat", "ALPHV", "Volt Typhoon", "Lazarus", "APT28", "APT29", 
        "Cozy Bear", "Fancy Bear", "UNC5221", "Scattered Spider", "DarkGate", "Qakbot",
        "Akira", "BianLian", "Rhysida", "Clop"
    ]
    for actor in known_actors:
        if actor.lower() in combined:
            threat_actor = actor
            break

    # 3. Summary Construction
    first_sentence = text.split(".")[0] if "." in text else text[:200]
    summary = f"{title}. {first_sentence}.".strip()
    if len(summary) > 300:
        summary = summary[:297] + "..."

    return ThreatAnalysisResult(
        summary=summary,
        threat_actor=threat_actor,
        severity=score,
        cve_list=extract_cves_regex(title + " " + text)
    )


def generate_embedding(text: str) -> List[float]:
    """Generates 768-dimensional embedding using Gemini or deterministic fallback."""
    if GEMINI_API_KEY:
        try:
            result = genai.embed_content(
                model=EMBEDDING_MODEL,
                content=text,
                task_type="retrieval_document"
            )
            embedding = result.get("embedding", [])
            if len(embedding) == VECTOR_DIMENSION:
                return embedding
        except Exception as e:
            logger.warning(f"Gemini embedding API call failed: {e}. Using deterministic embedding.")

    return generate_deterministic_embedding(text, dim=VECTOR_DIMENSION)


def process_threat_article(title: str, raw_text: str) -> Dict[str, Any]:
    """
    Full pipeline: runs extraction (Gemini with heuristic fallback),
    merges regex CVEs, and generates 768-dim embedding.
    """
    analysis = extract_threat_with_gemini(title, raw_text)
    if not analysis:
        analysis = heuristic_analysis(title, raw_text)

    # Augment CVEs with strict regex scan over full article text
    regex_cves = extract_cves_regex(title + " " + raw_text)
    combined_cves = sorted(list(set(analysis.cve_list + regex_cves)))

    # Generate 768-dim vector embedding of the threat summary
    embedding = generate_embedding(analysis.summary)

    return {
        "title": title,
        "summary": analysis.summary,
        "threat_actor": analysis.threat_actor,
        "severity": analysis.severity,
        "cve_list": combined_cves,
        "embedding": embedding
    }

