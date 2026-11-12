"""
Sentinel AI: Ingestion Engine Entry Point & Scheduler Loop
Runs background thread polling cybersecurity intelligence feeds every 15 minutes.
"""

import os
import sys
import time
import signal
import logging
from datetime import datetime

from fetcher import fetch_all_feeds
from ai_pipeline import process_threat_article
from db_client import db_client
from alerts import dispatch_discord_threat_alert, dispatch_telegram_threat_alert, dispatch_pipeline_crash_alert

# Setup structured logging
logging.basicConfig(
    level=logging.INFO,
    format="[%(asctime)s] [%(levelname)s] [%(name)s]: %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S"
)
logger = logging.getLogger("sentinel.worker")

POLL_INTERVAL_SECONDS = int(os.getenv("POLL_INTERVAL_SECONDS", "900"))  # Default: 15 minutes
RUNNING = True


def signal_handler(sig, frame):
    global RUNNING
    logger.info("Received termination signal. Gracefully shutting down Sentinel AI worker...")
    RUNNING = False


signal.signal(signal.SIGINT, signal_handler)
signal.signal(signal.SIGTERM, signal_handler)


def run_ingestion_cycle():
    """Executes a single end-to-end ingestion, analysis, storage, and alert cycle."""
    logger.info("Starting Threat Intelligence Ingestion Cycle...")
    start_time = time.time()

    articles = fetch_all_feeds()
    logger.info(f"Fetched {len(articles)} total articles across feeds.")

    new_articles_count = 0
    alerts_triggered_count = 0

    for article in articles:
        if not RUNNING:
            break

        source_url = article["source_url"]

        # 1. Deduplication Check
        if db_client.check_url_exists(source_url):
            logger.debug(f"Skipping already ingested URL: {source_url}")
            continue

        logger.info(f"New threat identified: '{article['title']}' ({article['source']})")

        # 2. AI Extraction & Vector Embedding Generation
        try:
            analysis = process_threat_article(article["title"], article.get("raw_text", ""))
        except Exception as e:
            logger.error(f"Error processing article '{article['title']}': {e}")
            continue

        # Merge raw metadata with AI extraction results
        record = {
            "source_url": source_url,
            "title": article["title"],
            "summary": analysis["summary"],
            "content": article.get("raw_text", analysis["summary"]),
            "threat_actor": analysis["threat_actor"],
            "severity": analysis["severity"],
            "cve_list": analysis["cve_list"],
            "embedding": analysis["embedding"],
            "source": article["source"],
            "published_at": article.get("published_at", datetime.utcnow())
        }

        # 3. PostgreSQL Persistence
        inserted = db_client.insert_threat_article(record)
        if inserted:
            new_articles_count += 1

            # 4. Critical Severity Alert Routing (Discord & Telegram Webhooks)
            d_alert = dispatch_discord_threat_alert(record)
            t_alert = dispatch_telegram_threat_alert(record)
            if d_alert or t_alert:
                alerts_triggered_count += 1

    elapsed = round(time.time() - start_time, 2)
    logger.info(
        f"Cycle Complete. Ingested {new_articles_count} new threats, "
        f"triggered {alerts_triggered_count} alerts in {elapsed}s."
    )


def main():
    logger.info("=" * 65)
    logger.info("SENTINEL AI: Threat Intelligence Autonomous Worker")
    logger.info(f"Polling Interval: {POLL_INTERVAL_SECONDS} seconds ({POLL_INTERVAL_SECONDS // 60} mins)")
    logger.info("=" * 65)

    # Verify initial database readiness
    try:
        db_client.get_connection()
    except Exception as e:
        logger.critical(f"Database readiness check failed: {e}")
        dispatch_pipeline_crash_alert(str(e))
        sys.exit(1)

    while RUNNING:
        try:
            run_ingestion_cycle()
        except Exception as e:
            logger.exception(f"Unhandled error during ingestion cycle: {e}")
            dispatch_pipeline_crash_alert(str(e))

        # Sleep with 1-second check intervals to allow responsive SIGINT
        logger.info(f"Sleeping for {POLL_INTERVAL_SECONDS} seconds until next cycle...")
        for _ in range(POLL_INTERVAL_SECONDS):
            if not RUNNING:
                break
            time.sleep(1)

    logger.info("Sentinel AI worker has stopped.")


if __name__ == "__main__":
    main()

