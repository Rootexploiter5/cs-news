"""
Sentinel AI: PostgreSQL Client & Vector Insertion Layer
Manages database connection, URL deduplication, and vector persistence.
"""

import os
import json
import time
import logging
from typing import Dict, Any, Optional, List
import psycopg2
from psycopg2.extras import RealDictCursor

logger = logging.getLogger("sentinel.db_client")

# Fetch database configuration from environment
DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    pg_user = os.getenv("POSTGRES_USER", "sentinel")
    pg_pass = os.getenv("POSTGRES_PASSWORD", "sentinel_secure_pass_2026")
    pg_host = os.getenv("POSTGRES_HOST", "db")
    pg_port = os.getenv("POSTGRES_PORT", "5432")
    pg_db = os.getenv("POSTGRES_DB", "sentinel_db")
    DATABASE_URL = f"postgresql://{pg_user}:{pg_pass}@{pg_host}:{pg_port}/{pg_db}"


class DatabaseClient:
    def __init__(self, dsn: str = DATABASE_URL):
        self.dsn = dsn
        self.conn = None

    def get_connection(self):
        """Establishes or returns active PostgreSQL connection."""
        if self.conn and not self.conn.closed:
            return self.conn

        retries = 15
        wait_seconds = 2
        for attempt in range(1, retries + 1):
            try:
                self.conn = psycopg2.connect(self.dsn)
                self.conn.autocommit = True
                logger.info("Successfully connected to PostgreSQL database.")
                return self.conn
            except Exception as e:
                logger.warning(f"Database connection attempt {attempt}/{retries} failed: {e}. Retrying in {wait_seconds}s...")
                time.sleep(wait_seconds)

        raise ConnectionError(f"Could not connect to PostgreSQL at {self.dsn} after {retries} attempts.")

    def check_url_exists(self, source_url: str) -> bool:
        """Checks if an article with the given source_url already exists in the database."""
        conn = self.get_connection()
        query = "SELECT 1 FROM threat_articles WHERE source_url = %s LIMIT 1;"
        try:
            with conn.cursor() as cursor:
                cursor.execute(query, (source_url,))
                return cursor.fetchone() is not None
        except Exception as e:
            logger.error(f"Error checking URL deduplication for '{source_url}': {e}")
            return False

    def insert_threat_article(self, article: Dict[str, Any]) -> bool:
        """
        Inserts structured threat intelligence article and 768-dim vector embedding.
        Uses ON CONFLICT DO NOTHING on source_url.
        """
        conn = self.get_connection()

        # Format vector as string literal '[val1,val2,...]' for pgvector
        embedding = article.get("embedding")
        embedding_str = f"[{','.join(str(x) for x in embedding)}]" if embedding else None

        cve_json = json.dumps(article.get("cve_list", []))

        query = """
        INSERT INTO threat_articles (
            source_url,
            title,
            summary,
            content,
            threat_actor,
            severity,
            cve_list,
            embedding,
            source,
            published_at
        ) VALUES (
            %(source_url)s,
            %(title)s,
            %(summary)s,
            %(content)s,
            %(threat_actor)s,
            %(severity)s,
            %(cve_list)s::jsonb,
            %(embedding)s::vector,
            %(source)s,
            %(published_at)s
        )
        ON CONFLICT (source_url) DO NOTHING
        RETURNING id;
        """

        params = {
            "source_url": article["source_url"],
            "title": article["title"],
            "summary": article.get("summary", ""),
            "content": article.get("content", article.get("summary", "")),
            "threat_actor": article.get("threat_actor", "Unknown"),
            "severity": article.get("severity", 5),
            "cve_list": cve_json,
            "embedding": embedding_str,
            "source": article.get("source", "Unknown"),
            "published_at": article.get("published_at")
        }

        try:
            with conn.cursor() as cursor:
                cursor.execute(query, params)
                inserted = cursor.fetchone()
                if inserted:
                    logger.info(f"Inserted threat article id={inserted[0]}: {article['title'][:60]}")
                    return True
                else:
                    logger.info(f"Article already exists (conflict on source_url): {article['source_url']}")
                    return False
        except Exception as e:
            logger.error(f"Failed to insert threat article: {e}")
            return False

    def purge_expired_articles(self, hours: int = 24) -> int:
        """
        Deletes threat intelligence articles older than specified hours (default: 24h),
        guaranteeing the database only maintains current day-by-day news.
        """
        conn = self.get_connection()
        query = "DELETE FROM threat_articles WHERE published_at < NOW() - (%s || ' hours')::interval;"
        try:
            with conn.cursor() as cursor:
                cursor.execute(query, (hours,))
                deleted_count = cursor.rowcount
                if deleted_count > 0:
                    logger.info(f"Purged {deleted_count} expired threat articles older than {hours} hours.")
                return deleted_count
        except Exception as e:
            logger.error(f"Error purging expired articles: {e}")
            return 0

    def get_pending_alerts(self, severity_threshold: int = 8) -> List[Dict[str, Any]]:
        """
        Retrieves all high-severity articles whose alert has not been dispatched yet.
        """
        conn = self.get_connection()
        query = """
        SELECT id, source_url, title, summary, threat_actor, severity, cve_list, source
        FROM threat_articles
        WHERE severity >= %s AND (alert_sent IS FALSE OR alert_sent IS NULL)
        ORDER BY severity DESC, published_at DESC;
        """
        try:
            with conn.cursor() as cursor:
                cursor.execute(query, (severity_threshold,))
                rows = cursor.fetchall()
                results = []
                for row in rows:
                    results.append({
                        "id": str(row[0]),
                        "source_url": row[1],
                        "title": row[2],
                        "summary": row[3],
                        "threat_actor": row[4],
                        "severity": row[5],
                        "cve_list": row[6] if isinstance(row[6], list) else [],
                        "source": row[7]
                    })
                return results
        except Exception as e:
            logger.error(f"Error fetching pending alerts: {e}")
            return []

    def mark_alert_sent(self, article_id: str) -> bool:
        """
        Marks an article's alert_sent flag to TRUE in PostgreSQL.
        """
        conn = self.get_connection()
        query = "UPDATE threat_articles SET alert_sent = TRUE WHERE id = %s;"
        try:
            with conn.cursor() as cursor:
                cursor.execute(query, (article_id,))
                return True
        except Exception as e:
            logger.error(f"Error marking alert sent for article {article_id}: {e}")
            return False


# Singleton client instance
db_client = DatabaseClient()

