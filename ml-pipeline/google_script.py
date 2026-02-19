from pathlib import Path
from playwright.sync_api import sync_playwright
from datetime import datetime

HOURS = 168
COUNTRIES = ["US", "SG", "GB", "AU", "CA"]
BASE_DIR = Path(__file__).resolve().parent
RAW_DIR = BASE_DIR / "data" / "raw"
RAW_DIR.mkdir(parents=True, exist_ok=True)

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    context = browser.new_context(accept_downloads=True)
    page = context.new_page()

    for REGION in COUNTRIES:
        url = f"https://trends.google.com/trending?geo={REGION}&hours={HOURS}"
        print(f"\nOpening: {url}")
        page.goto(url, wait_until="domcontentloaded", timeout=30000)
        page.wait_for_timeout(7000)

        # Try consent once if it appears
        # for t in ["I agree", "Accept all", "Accept", "Got it"]:
        #     btn = page.get_by_role("button", name=t)
        #     if btn.count():
        #         try:
        #             btn.first.click(timeout=1200)
        #             page.wait_for_timeout(1000)
        #             break
        #         except:
        #             pass

        # Click Export button
        page.locator("button:has-text('Export')").first.click(timeout=10000)

        # Click Download CSV and save
        with page.expect_download(timeout=20000) as download_info:
            page.get_by_role("menuitem", name="Download CSV").first.click()

        download = download_info.value
        timestamp = datetime.now().strftime("%Y-%m-%d_%H%M%S")
        out = RAW_DIR / f"{timestamp}_google_{REGION}.csv"
        download.save_as(str(out))
        print(f"Saved: {out}")

        # Small wait between each region
        page.wait_for_timeout(1500)
    browser.close()
