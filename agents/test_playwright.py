import asyncio
import sys

# Attempt to set the event loop policy to Proactor at the absolute earliest point
if sys.platform == "win32":
    try:
        # Trying ProactorEventLoopPolicy as SelectorEventLoopPolicy didn't resolve it
        asyncio.set_event_loop_policy(asyncio.WindowsProactorEventLoopPolicy())
        print("Successfully set WindowsProactorEventLoopPolicy.")
    except Exception as e:
        print(f"Error setting event loop policy: {e}")

from playwright.async_api import async_playwright

async def main_async():
    print("Attempting to launch Playwright browser...")
    try:
        async with async_playwright() as p:
            browser = await p.chromium.launch(headless=True)
            print("Chromium browser launched successfully (headless).")
            page = await browser.new_page()
            print("New page created.")
            await page.goto("http://example.com")
            page_title = await page.title()
            print(f"Page title for example.com: {page_title}")
            await browser.close()
            print("Browser closed successfully.")
    except Exception as e:
        print(f"An error occurred during Playwright test: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    print("Starting Playwright direct test...")
    asyncio.run(main_async())
    print("Playwright direct test finished.")
