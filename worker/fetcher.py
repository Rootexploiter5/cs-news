"""
Sentinel AI: Threat Intelligence RSS Fetcher
Parses predetermined cybersecurity feeds and cleans article text.
"""

import re
import html
import logging
from typing import List, Dict, Any
from datetime import datetime
import feedparser

logger = logging.getLogger("sentinel.fetcher")

FEED_SOURCES = [
    {
        "name": "BleepingComputer",
        "url": "https://www.bleepingcomputer.com/feed/"
    },
    {
        "name": "The Hacker News",
        "url": "https://feeds.feedburner.com/TheHackersNews"
    },
    {
        "name": "CISA Advisories",
        "url": "https://www.cisa.gov/cybersecurity-advisories/all.xml"
    }
]


def clean_html(raw_html: str) -> str:
    """Removes HTML tags and decodes entities to extract pure textual content."""
    if not raw_html:
        return ""
    # Strip script and style blocks
    cleaned = re.sub(r"<(script|style).*?</\1>", "", raw_html, flags=re.DOTALL | re.IGNORECASE)
    # Strip HTML tags
    cleaned = re.sub(r"<[^>]+>", " ", cleaned)
    # Decode HTML entities
    cleaned = html.unescape(cleaned)
    # Normalize whitespaces
    cleaned = re.sub(r"\s+", " ", cleaned).strip()
    return cleaned


def parse_published_date(entry: Any) -> datetime:
    """Extracts published timestamp from an RSS entry, defaulting to now."""
    if hasattr(entry, "published_parsed") and entry.published_parsed:
        try:
            return datetime(*entry.published_parsed[:6])
        except Exception:
            pass
    if hasattr(entry, "updated_parsed") and entry.updated_parsed:
        try:
            return datetime(*entry.updated_parsed[:6])
        except Exception:
            pass
    return datetime.utcnow()


def fetch_all_feeds() -> List[Dict[str, Any]]:
    """
    Iterates over all configured cybersecurity RSS feeds,
    retrieves articles, and returns normalized article objects.
    """
    articles: List[Dict[str, Any]] = []

    for source in FEED_SOURCES:
        source_name = source["name"]
        feed_url = source["url"]
        logger.info(f"Fetching threat feed: {source_name} ({feed_url})")

        try:
            feed = feedparser.parse(feed_url)
            if feed.bozo and not feed.entries:
                logger.warning(f"Failed or empty feed for {source_name}: {feed.bozo_exception}")
                continue

            for entry in feed.entries:
                title = entry.get("title", "").strip()
                link = entry.get("link", "").strip()
                if not title or not link:
                    continue

                # Content might be in content, summary, or description
                raw_content = ""
                if "content" in entry and entry.content:
                    raw_content = entry.content[0].get("value", "")
                elif "summary" in entry:
                    raw_content = entry.summary
                elif "description" in entry:
                    raw_content = entry.description

                clean_text = clean_html(raw_content)
                published_at = parse_published_date(entry)

                articles.append({
                    "title": title,
                    "source_url": link,
                    "raw_text": clean_text,
                    "source": source_name,
                    "published_at": published_at
                })

            logger.info(f"Retrieved {len(feed.entries)} items from {source_name}")

        except Exception as e:
            logger.error(f"Error fetching feed from {source_name}: {e}")

    return articles

