import nest_asyncio
nest_asyncio.apply()

import asyncio
import sys

if sys.platform == "win32":
    try:
        asyncio.set_event_loop_policy(asyncio.WindowsProactorEventLoopPolicy())
        print("Crawler Server: Successfully set WindowsProactorEventLoopPolicy.")
    except Exception as e:
        print(f"Crawler Server: Warning - Error setting event loop policy: {e}")

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from crawl4ai import AsyncWebCrawler
from crawl4ai.async_configs import BrowserConfig, CrawlerRunConfig, CacheMode
import os

app = FastAPI()

class UrlInput(BaseModel):
    url: str

@app.post("/fetch-markdown/")
async def fetch_markdown_endpoint(data: UrlInput):
    print(f"Crawler Server: Received URL to fetch markdown: {data.url}")
    
    browser_config = BrowserConfig(
        headless=True, 
        verbose=False, # Set to True for more crawl4ai logs if needed
        extra_args=["--disable-gpu", "--disable-dev-shm-usage", "--no-sandbox"]
    )
    crawl_config = CrawlerRunConfig(cache_mode=CacheMode.BYPASS) 

    markdown_content = ""
    crawler = AsyncWebCrawler(config=browser_config)
    try:
        await crawler.start()
        print(f"Crawler Server: crawl4ai starting to crawl {data.url}...")
        result = await crawler.arun(url=data.url, config=crawl_config)
        if result.success and result.markdown:
            markdown_content = result.markdown
            print(f"Crawler Server: crawl4ai successfully fetched markdown. Length: {len(markdown_content)} chars.")
        else:
            print(f"Crawler Server: crawl4ai failed to fetch or process URL {data.url}. Error: {result.error_message}")
            raise HTTPException(status_code=502, detail=f"crawl4ai failed for {data.url}: {result.error_message}")
    except Exception as e:
        print(f"Crawler Server: Exception during crawl: {e}")
        raise HTTPException(status_code=500, detail=f"Crawling error: {str(e)}")
    finally:
        await crawler.close()

    if not markdown_content.strip():
        print("Crawler Server: crawl4ai returned empty markdown content.")
        raise HTTPException(status_code=422, detail="crawl4ai returned empty markdown content.")

    # Return raw markdown text
    return {"url": data.url, "markdown_content": markdown_content}

if __name__ == "__main__":
    import uvicorn
    print("Starting Crawler Server (FastAPI with crawl4ai)...")
    # Port for crawler, e.g., 8002 (different from LLM agent)
    uvicorn.run("crawler_server:app", host="0.0.0.0", port=8002, reload=True)
