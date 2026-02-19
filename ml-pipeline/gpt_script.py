import os
import json
import re
from pathlib import Path
from datetime import datetime, timezone
from dotenv import load_dotenv
from openai import OpenAI

# -----------------------------
# Load API Key
# -----------------------------
load_dotenv()
API_KEY = os.getenv("GPT_API_KEY")
if not API_KEY:
    raise SystemExit("Missing GPT_API_KEY")

client = OpenAI(api_key=API_KEY)

# -----------------------------
# Config
# -----------------------------
N = 10
MODEL = "gpt-4.1"
TODAY_UTC = datetime.now(timezone.utc).date().isoformat()

BASE_DIR = Path(__file__).resolve().parent
OUTPUT_DIR = BASE_DIR / "data" / "analysis"
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

# -----------------------------
# Prompt
# -----------------------------
PROMPT = f"""
Use live web search.

Identify {N} Gen-Alpha-coded internet phenomena that are actively circulating today (UTC {TODAY_UTC}).

Each trend must be:
- Demonstrated or referenced in context on a platform page, active post, community thread, or short-form video page
- Clearly showing usage or engagement (not just defined or described)
- Strongly prioritize phenomena that first emerged or spiked within the last 30 days.
- De-prioritize multi-year persistent slang unless there is a clear new mutation, format, or revival in 2026.

Exclude long-standing meme vocabulary unless:
- There is evidence of a new variant
- There is a platform-native mutation
- There is a new wave distinct from prior usage

Place additional focus on sources where these trends are visible inside youth-native spaces such as (but not limited to): 

- Anime discussions
- Roblox experiences and dev forums
- Minecraft communities
- Reddit threads
- TikTok posts
- YouTube Shorts
- similar active youth platforms

Avoid sources that are:

- Pure editorial summaries
- List-style meme roundups
- Marketing trend blogs
- Slang dictionary lists
- Wikipedia pages
- Academic PDF documents
- Corporate newsroom articles

Ranking methodology:

Rank trends by:

1. Cross-platform presence (appears across multiple youth-native platforms)
2. Recency of references (appearing in posts within the last 7 days)
3. Contextual embedding (used naturally in conversation, not explained as a term)

If engagement counts are not visible, use:

- Cross-platform presence
- Repeated independent references
- Platform-native trending signals

Return ONLY valid JSON in this exact format:

[
  {{
    "rank": 1,
    "name": "trend name",
    "trend_type": "audio trend",
    "metric": "popularity metric or brief evidence metric",
    "source": "direct URL showing the trend in use"
  }}
]
"""

# -----------------------------
# Call Responses API (supports web_search)
# -----------------------------
response = client.responses.create(
    model=MODEL,
    tools=[{"type": "web_search"}],
    input=PROMPT,
)

raw_output = response.output_text.strip()

# -----------------------------
# Extract first JSON array found
# -----------------------------
match = re.search(r"\[\s*{.*}\s*\]", raw_output, re.S)

if not match:
    raise SystemExit(f"No JSON array found in response:\n{raw_output}")

json_text = match.group(0)

try:
    trends = json.loads(json_text)
except json.JSONDecodeError:
    raise SystemExit(f"Invalid JSON:\n{json_text}")

if len(trends) != N:
    raise SystemExit(f"Expected {N} trends, got {len(trends)}")

# -----------------------------
# Add Metadata
# -----------------------------
output_payload = {
    "metadata": {
        "generated_at_utc": datetime.now(timezone.utc).isoformat(),
        "date_queried_utc": TODAY_UTC,
        "model": MODEL,
        "trend_count": len(trends),
        "response_id": response.id
    },
    "trends": trends
}

# -----------------------------
# Save File
# -----------------------------
timestamp = datetime.now().strftime("%Y-%m-%d_%H%M%S")
output_path = OUTPUT_DIR / f"{timestamp}_gen_alpha_trends.json"

with open(output_path, "w", encoding="utf-8") as f:
    json.dump(output_payload, f, ensure_ascii=False, indent=2)

print(f"Saved to: {output_path}")
