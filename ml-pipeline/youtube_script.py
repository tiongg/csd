import csv
import os
from datetime import UTC, datetime, timedelta

import requests
from dotenv import load_dotenv

load_dotenv()

API_KEY = os.getenv("YOUTUBE_API_KEY")
COUNTRIES = ["US", "SG", "GB", "AU", "CA"]
BASE_URL = "https://www.googleapis.com/youtube/v3/videos"
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
OUTPUT_DIR = os.path.join(BASE_DIR, "data", "raw")
HOURS = 168
CUTOFF = datetime.now(UTC) - timedelta(hours=HOURS)

os.makedirs(OUTPUT_DIR, exist_ok=True)

if not API_KEY:
    raise ValueError("Missing YOUTUBE_API_KEY in environment variables.")

for region in COUNTRIES:
    print(f"\nFetching trending for {region}...")

    params = {
        "part": "snippet,statistics",
        "chart": "mostPopular",
        "regionCode": region,
        "maxResults": 50,
        "key": API_KEY,
    }

    response = requests.get(BASE_URL, params=params, timeout=30)
    data = response.json()

    if "items" not in data:
        print(f"API error for {region}: {data}")
        continue

    rows = []
    for video in data["items"]:
        snippet = video.get("snippet", {})
        stats = video.get("statistics", {})
        published = snippet.get("publishedAt")

        if not published:
            continue

        publish_date = datetime.fromisoformat(published.replace("Z", "+00:00")).astimezone(UTC)
        if publish_date < CUTOFF:
            continue

        video_id = video.get("id")
        rows.append(
            [
                video_id,
                snippet.get("title", ""),
                snippet.get("channelTitle", ""),
                stats.get("viewCount", ""),
                stats.get("likeCount", ""),
                published,
                f"https://youtube.com/watch?v={video_id}",
            ]
        )

    timestamp = datetime.now().strftime("%Y-%m-%d_%H%M%S")
    filename = os.path.join(OUTPUT_DIR, f"{timestamp}_youtube_{region}.csv")

    with open(filename, "w", newline="", encoding="utf-8") as file:
        writer = csv.writer(file)
        writer.writerow(["video_id", "title", "channel", "views", "likes", "published_at", "url"])
        writer.writerows(rows)

    print(f"Saved {len(rows)} rows -> {filename}")

print("\nDone.")
