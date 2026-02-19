import csv
import os
from datetime import datetime, timedelta, UTC
from pathlib import Path
from dotenv import load_dotenv

import requests

load_dotenv()

API_KEY = os.getenv("YOUTUBE_API_KEY")
COUNTRIES = ["US", "SG", "GB", "AU", "CA"]
BASE_URL = "https://www.googleapis.com/youtube/v3/videos"
OUTPUT_DIR = "youtube_trends_by_country"
HOURS = 168
CUTOFF = datetime.now(UTC) - timedelta(hours=HOURS)
TIMESTAMP = datetime.now().strftime("%Y%m%d_%H%M%S")


os.makedirs(OUTPUT_DIR, exist_ok=True)

if not API_KEY:
    raise ValueError("Missing YOUTUBE_API_KEY in environment variables.")

for REGION in COUNTRIES:

    print(f"\nFetching trending for {REGION}...")

    params = {
        "part": "snippet,statistics",
        "chart": "mostPopular",
        "regionCode": REGION,
        "maxResults": 50,
        "key": API_KEY
    }

    r = requests.get(BASE_URL, params=params)
    data = r.json()

    # --- basic API error guard ---
    if "items" not in data:
        print(f"API error for {REGION}:", data)
        continue

    rows = []

    for v in data["items"]:

        snippet = v.get("snippet", {})
        stats = v.get("statistics", {})
        published = snippet.get("publishedAt")
        publish_date = datetime.fromisoformat(published.replace("Z", "+00:00")).astimezone(UTC)

        if not published:
            continue

        if publish_date < CUTOFF:
            continue

        video_id = v.get("id")

        rows.append([
            video_id,
            snippet.get("title", ""),
            snippet.get("channelTitle", ""),
            stats.get("viewCount", ""),
            stats.get("likeCount", ""),
            published,
            f"https://youtube.com/watch?v={video_id}"
        ])

    
    filename = f"{OUTPUT_DIR}/trending_{REGION}_{HOURS}h_{TIMESTAMP}.csv"

    with open(filename, "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(["video_id", "title", "channel", "views", "likes", "published_at", "url"])
        writer.writerows(rows)

    print(f"Saved {len(rows)} rows → {filename}")

print("\nDone.")

