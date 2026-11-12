"""
Sentinel AI: Real-Time Threat Alerts
Dispatches rich Discord embed notifications for high-severity threats (Severity >= 8).
"""

import os
import logging
from typing import Dict, Any, List
import requests

logger = logging.getLogger("sentinel.alerts")

DISCORD_WEBHOOK_URL = os.getenv("DISCORD_WEBHOOK_URL", "").strip()
SEVERITY_ALERT_THRESHOLD = int(os.getenv("SEVERITY_ALERT_THRESHOLD", "8"))


def get_severity_color(severity: int) -> int:
    """Returns hexadecimal color integer for Discord embed based on severity score."""
    if severity >= 9:
        return 0xFF0033  # Critical Crimson / Red
    if severity >= 7:
        return 0xFF7700  # High Orange
    if severity >= 4:
        return 0xFFAA00  # Medium Amber
    return 0x00AAFF      # Informational Blue


def dispatch_discord_threat_alert(article: Dict[str, Any]) -> bool:
    """
    Evaluates threat severity. If severity >= SEVERITY_ALERT_THRESHOLD,
    formats a rich Discord embed and sends an HTTP POST request to the webhook.
    """
    severity = article.get("severity", 1)
    if severity < SEVERITY_ALERT_THRESHOLD:
        return False

    if not DISCORD_WEBHOOK_URL:
        logger.info(f"[Alert Skipped] Severity {severity} >= {SEVERITY_ALERT_THRESHOLD}, but DISCORD_WEBHOOK_URL is not set.")
        return False

    title = article.get("title", "Critical Threat Advisory")
    source_url = article.get("source_url", "")
    summary = article.get("summary", "No summary provided.")
    actor = article.get("threat_actor", "Unknown")
    cves: List[str] = article.get("cve_list", [])
    source = article.get("source", "Sentinel AI Feed")

    cve_display = ", ".join(f"`{c}`" for c in cves) if cves else "*None Identified*"

    embed = {
        "title": f"🚨 [SEV {severity}/10] {title[:200]}",
        "url": source_url,
        "description": summary[:1800],
        "color": get_severity_color(severity),
        "fields": [
            {
                "name": "Threat Actor",
                "value": f"`{actor}`",
                "inline": True
            },
            {
                "name": "Severity Rating",
                "value": f"**{severity} / 10**",
                "inline": True
            },
            {
                "name": "Associated CVEs",
                "value": cve_display,
                "inline": False
            },
            {
                "name": "Intelligence Source",
                "value": source,
                "inline": True
            }
        ],
        "footer": {
            "text": "Sentinel AI Autonomous Threat Intelligence Engine"
        }
    }

    payload = {
        "username": "Sentinel AI Bot",
        "avatar_url": "https://raw.githubusercontent.com/Rootexploiter5/cs-news/main/docs/sentinel-icon.png",
        "embeds": [embed]
    }

    try:
        response = requests.post(DISCORD_WEBHOOK_URL, json=payload, timeout=10)
        if response.status_code in [200, 204]:
            logger.info(f"Successfully posted high-severity alert ({severity}/10) to Discord: {title[:50]}")
            return True
        else:
            logger.warning(f"Discord webhook responded with HTTP {response.status_code}: {response.text}")
            return False
    except Exception as e:
        logger.error(f"Failed to deliver Discord threat alert: {e}")
        return False


def dispatch_pipeline_crash_alert(error_details: str):
    """Sends immediate diagnostic notification to Discord if worker encounters fatal loop error."""
    if not DISCORD_WEBHOOK_URL:
        return

    payload = {
        "username": "Sentinel AI Monitor",
        "embeds": [{
            "title": "⚠️ Sentinel AI Worker Failure",
            "description": f"The threat ingestion pipeline encountered an unhandled exception:\n```{error_details[:1500]}```",
            "color": 0xFF2222
        }]
    }

    try:
        requests.post(DISCORD_WEBHOOK_URL, json=payload, timeout=5)
    except Exception:
        pass
