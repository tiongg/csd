import os
from datetime import datetime
from pathlib import Path

import requests
from dotenv import load_dotenv

load_dotenv()

API_KEY = os.getenv("GEMINI_API_KEY")
PROMPT = "Hello, Gemini!"
MODEL = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")
BASE_DIR = Path(__file__).resolve().parent
ANALYSIS_DIR = BASE_DIR / "data" / "analysis"
ANALYSIS_DIR.mkdir(parents=True, exist_ok=True)

if not API_KEY:
    raise ValueError("Missing GEMINI_API_KEY in environment variables.")

url = f"https://generativelanguage.googleapis.com/v1beta/models/{MODEL}:generateContent"
params = {"key": API_KEY}
payload = {
    "contents": [
        {
            "parts": [
                {
                    "text": PROMPT
                }
            ]
        }
    ]
}

response = requests.post(url, params=params, json=payload, timeout=30)
response.raise_for_status()
data = response.json()

text = (
    data.get("candidates", [{}])[0]
    .get("content", {})
    .get("parts", [{}])[0]
    .get("text", "")
)

if not text:
    print("No text response found. Full response:")
    print(data)
else:
    print("Prompt:")
    print(PROMPT)
    print("\nGemini response:")
    print(text)

    timestamp = datetime.now().strftime("%Y-%m-%d_%H%M%S")
    output_path = ANALYSIS_DIR / f"{timestamp}_gemini_response.txt"
    output_path.write_text(text, encoding="utf-8")
    print(f"\nSaved analysis output: {output_path}")
