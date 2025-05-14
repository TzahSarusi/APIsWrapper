# mcptoolserver.py
from mcp.server.fastmcp import FastMCP, Context
import requests


# Create an MCP server
mcp = FastMCP("McpToolsServer", dependencies=["requests"])

# Base URL for the API
BASE_URL = "https://data.gov.il/api/3"

@mcp.tool(description="Get details about a GitHub repository.")
async def getRepoInfo(ctx: Context, owner: str, repo: str) -> dict:
#Returns repository information from GitHub.

 url = f"https://api.github.com/repos/{owner}/{repo}"
 response = requests.get(url)
 if response.status_code != 200:
   return {"error": f"Repo {owner}/{repo} not found."}
 return response.json()

if __name__ == "__main__":
    # This code only runs when the file is executed directly
    mcp.run()