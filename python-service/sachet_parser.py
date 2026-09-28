"""
SACHET NDMA Official Disaster Alert RSS Feed Parser.
Fetches, parses XML, classifies disaster types, extracts geo-coordinates,
and formats real-time alerts.
"""

import os
import logging
import xml.etree.ElementTree as ET
from datetime import datetime, timezone
from email.utils import parsedate_to_datetime
import requests

from geo_mapper import extract_state, get_coordinates_for_state, INDIA_CENTER

logger = logging.getLogger("sachet_parser")

DEFAULT_FEED_URL = "https://sachet.ndma.gov.in/cap_public_website/rss/rss_india.xml"
USER_AGENT = "DisasterAlert-NDMA-Sync/1.0 (India Disaster Management Platform; Contact: controlroom@disasteralert.in)"


def classify_disaster_type(text: str) -> str:
    """
    Classify disaster type based on NDMA title and description keywords.
    """
    text_lower = text.lower()

    if any(k in text_lower for k in ["flood", "flooding", "waterlogging", "water logging", "inundation"]):
        return "FLOOD"
    if any(k in text_lower for k in ["cyclone", "storm", "hurricane", "gale", "squall", "high wind"]):
        return "CYCLONE"
    if any(k in text_lower for k in ["earthquake", "seismic", "tremor", "aftershock"]):
        return "EARTHQUAKE"
    if any(k in text_lower for k in ["wildfire", "forest fire", "fire", "blaze", "flames"]):
        return "FIRE"
    if any(k in text_lower for k in ["landslide", "mudslide", "rockfall", "debris flow", "hillside collapse"]):
        return "LANDSLIDE"
    if any(k in text_lower for k in ["heatwave", "heat wave", "extreme temperature", "heat alert"]):
        return "HEATWAVE"
    if any(k in text_lower for k in ["rain", "rainfall", "thunderstorm", "lightning", "cloudburst", "precipitation"]):
        return "HEAVY_RAIN"

    return "GENERAL_ALERT"


def calculate_severity(text: str) -> tuple[str, int]:
    """
    Calculate severity level ('HIGH', 'MEDIUM', 'LOW') and integer score (1-10).
    """
    text_lower = text.lower()

    if any(k in text_lower for k in ["severe", "extreme", "red alert", "red warning", "critical", "high alert", "danger", "flash flood", "very heavy"]):
        return "HIGH", 9
    if any(k in text_lower for k in ["orange alert", "moderate", "warning", "caution", "heavy rain", "likely to occur"]):
        return "MEDIUM", 6
    
    return "LOW", 3


def parse_pub_date(date_str: str | None) -> str:
    """
    Convert RFC 2822 or custom RSS date strings to ISO 8601 string.
    """
    if not date_str:
        return datetime.now(timezone.utc).isoformat()

    try:
        dt = parsedate_to_datetime(date_str)
        if dt.tzinfo is None:
            dt = dt.replace(tzinfo=timezone.utc)
        return dt.isoformat()
    except Exception as e:
        logger.warning(f"Could not parse pubDate '{date_str}', falling back to current UTC time: {e}")
        return datetime.now(timezone.utc).isoformat()


def fetch_and_parse_sachet_feed(feed_url: str | None = None) -> list[dict]:
    """
    Fetch and parse official SACHET NDMA RSS XML feed.
    Returns structured list of alert dicts.
    """
    url = feed_url or os.getenv("SACHET_FEED_URL", DEFAULT_FEED_URL)
    logger.info(f"Fetching SACHET NDMA RSS feed from: {url}")

    try:
        response = requests.get(
            url,
            headers={"User-Agent": USER_AGENT, "Accept": "application/rss+xml, application/xml, text/xml"},
            timeout=15
        )
        response.raise_for_status()
    except requests.RequestException as e:
        logger.error(f"Failed to fetch SACHET NDMA RSS feed from {url}: {e}")
        return []

    try:
        # Parse XML from text
        root = ET.fromstring(response.content)
    except ET.ParseError as e:
        logger.error(f"Malformed XML received from SACHET NDMA feed: {e}")
        return []

    channel = root.find("channel")
    if channel is None:
        logger.warning("No <channel> element found in SACHET RSS XML.")
        return []

    items = channel.findall("item")
    logger.info(f"Found {len(items)} alert items in SACHET feed.")

    parsed_alerts = []
    for item in items:
        try:
            title_el = item.find("title")
            title = title_el.text.strip() if title_el is not None and title_el.text else "Official NDMA Alert"

            desc_el = item.find("description")
            description = desc_el.text.strip() if desc_el is not None and desc_el.text else ""

            link_el = item.find("link")
            source_url = link_el.text.strip() if link_el is not None and link_el.text else url

            guid_el = item.find("guid")
            if guid_el is not None and guid_el.text:
                sachet_id = guid_el.text.strip()
            else:
                # Fallback guid from link or title hash
                sachet_id = str(abs(hash(f"{title}_{source_url}")))

            author_el = item.find("author")
            author = author_el.text.strip() if author_el is not None and author_el.text else "NDMA Control Room"

            pubdate_el = item.find("pubDate")
            published_at = parse_pub_date(pubdate_el.text if pubdate_el is not None else None)

            # Combined text for keyword scanning
            combined_text = f"{title} {description} {author}"

            disaster_type = classify_disaster_type(combined_text)
            severity, severity_score = calculate_severity(combined_text)

            # Extract Indian state / UT
            state = extract_state(combined_text)
            geo = get_coordinates_for_state(state)

            alert_obj = {
                "sachet_id": sachet_id,
                "title": title,
                "description": description or title,
                "disaster_type": disaster_type,
                "state": state or "Pan India",
                "latitude": geo["latitude"],
                "longitude": geo["longitude"],
                "severity": severity,
                "severity_score": severity_score,
                "published_at": published_at,
                "source_url": source_url,
                "source": "SACHET_NDMA",
                "author": author
            }

            parsed_alerts.append(alert_obj)
        except Exception as e:
            logger.error(f"Error parsing individual SACHET item: {e}", exc_info=True)
            continue

    logger.info(f"Successfully parsed {len(parsed_alerts)} SACHET disaster alerts.")
    return parsed_alerts
