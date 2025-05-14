from fastapi import FastAPI, HTTPException, Body
from langchain.chains import LLMChain
from langchain_core.prompts import ChatPromptTemplate
from langchain_community.chat_models import ChatOpenAI
import json
import os
from dotenv import load_dotenv

# Load environment variables from .env file (ensure .env is in the same directory or parent)
# Adjust path to .env if your agent_server.py is run from a different CWD than the .env file location
# For example, if .env is in the project root (mcp-workflow) and agent_server.py is in agents/
# load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), '..', '.env'))
# Or ensure OPENAI_API_KEY is set in the environment where this server runs
load_dotenv() 

app = FastAPI()

# Get API key from environment variable
api_key = os.getenv("OPENAI_API_KEY")

if not api_key:
    print("Warning: OPENAI_API_KEY not found. The agent will not work.")
    # raise ValueError("Missing OPENAI_API_KEY in environment variables.") # Or handle more gracefully

llm = None
if api_key:
    try:
        llm = ChatOpenAI(
            openai_api_key=api_key,
            model="gpt-4", # Consider gpt-3.5-turbo for speed/cost if quality is sufficient
            temperature=0,
            # max_tokens=4000 # Be mindful of token limits and costs
        )
    except Exception as e:
        print(f"Error initializing ChatOpenAI: {e}")
        llm = None

prompt_template_str = """
You will receive a URL to an API documentation page. Your job is to:
1. Analyze it and extract all available API endpoints.
2. If it's a structured API (like REST, GraphQL, etc.), identify the available paths and methods for each endpoint.
3. For each endpoint, include:
    - A descriptive name (e.g., "Get User Profile").
    - The HTTP method (e.g., "GET", "POST").
    - The endpoint path (e.g., "/users/{id}").
    - A brief description of what the endpoint does.
    - Details about path parameters, query parameters (name, type, required, description).
    - An example of the request body schema if applicable (especially for POST/PUT).
    - An example of a successful response schema (e.g., for 200 OK or 201 Created).
4. If Swagger/OpenAPI docs are present or linked, prioritize using them to enrich the output with accurate schema details.
5. Structure the output for EACH extracted API endpoint as a JSON object with the following keys: "name", "method", "endpoint", "description", "schema".
   The "schema" object should itself contain "pathParams" (array), "queryParams" (array), "requestBody" (object), and "responsePreview" (object with status codes as keys).
6. Return a valid JSON array containing these objects. Do not include explanations, markdown formatting, or any text outside the JSON array.

URL: {url}
"""
# Ensure the prompt clearly asks for an array of objects, each matching our desired ApiDefinition structure.

chain = None
if llm:
    # Ensure the prompt template only expects 'url'
    try:
        prompt = ChatPromptTemplate.from_template(template=prompt_template_str, input_variables=['url'])
        # Validate that only 'url' is an input variable
        if set(prompt.input_variables) != {'url'}:
            print(f"Warning: Prompt input variables are {prompt.input_variables}, expected only ['url']. Check template string for hidden placeholders.")
            # Fallback or raise error if validation fails strictly
            # For now, we'll proceed but this warning is important.
            # If it still expects 'id', the prompt_template_str itself needs scrutiny for hidden/implicit placeholders.
        chain = LLMChain(llm=llm, prompt=prompt)
    except Exception as e:
        print(f"Error creating ChatPromptTemplate or LLMChain: {e}")
        chain = None


class URLRequest(json.JSONDecoder): # Using Body for Pydantic model
    url: str

@app.post("/scrape-url/")
async def scrape_url_endpoint(payload: dict = Body(...)): # Expecting {"url": "some_url"}
    target_url = payload.get("url")
    if not target_url:
        raise HTTPException(status_code=400, detail="URL is required in the request body.")

    if not chain:
        raise HTTPException(status_code=500, detail="LLM chain not initialized. Check OPENAI_API_KEY and model setup.")

    print(f"Agent Server: Received request to scrape URL: {target_url}")
    try:
        if chain and hasattr(chain, 'prompt'):
            print(f"Agent Server: Chain expected input variables: {chain.prompt.input_variables}")
        else:
            print("Agent Server: Chain or chain.prompt is not properly initialized.")

        print(f"Agent Server: Variables being passed to chain.run: {{'url': '{target_url}'}}")
        # The LLMChain.run method might take some time.
        # For a production server, you'd run this in a separate thread or use async capabilities of Langchain if available.
        raw_response = chain.run(url=target_url)
        print(f"Agent Server: Raw response from LLM chain: {raw_response[:500]}...") # Log snippet
        
        # Attempt to parse the raw_response as JSON
        # The LLM is prompted to return JSON, but it might sometimes fail or add extra text.
        # Robust parsing might involve trying to extract JSON from a larger string if necessary.
        try:
            parsed_json_response = json.loads(raw_response)
        except json.JSONDecodeError as e:
            print(f"Agent Server: Failed to decode JSON directly from LLM response. Error: {e}")
            print(f"Agent Server: Attempting to find JSON block in response...")
            # Try to find a JSON block if the LLM wrapped it in text or markdown
            import re
            match = re.search(r"```json\s*([\s\S]*?)\s*```|([\s\S]*)", raw_response)
            if match:
                json_str_from_match = match.group(1) or match.group(2)
                if json_str_from_match:
                    try:
                        parsed_json_response = json.loads(json_str_from_match.strip())
                        print("Agent Server: Successfully extracted and parsed JSON block.")
                    except json.JSONDecodeError as e2:
                        print(f"Agent Server: Still failed to decode JSON after extraction. Error: {e2}")
                        raise HTTPException(status_code=500, detail=f"LLM returned non-JSON or malformed JSON output after extraction attempt. Raw: {raw_response[:200]}")
                else: # Should not happen with the regex used
                    raise HTTPException(status_code=500, detail=f"LLM returned non-JSON or malformed JSON output, no JSON block found. Raw: {raw_response[:200]}")

            else: # Should not happen with the regex used
                 raise HTTPException(status_code=500, detail=f"LLM returned non-JSON or malformed JSON output, regex found no match. Raw: {raw_response[:200]}")


        print(f"Agent Server: Successfully parsed LLM response into JSON.")
        return parsed_json_response # Return the parsed JSON (expected to be an array of API defs)
    
    except HTTPException as e: # Re-raise HTTPExceptions
        raise e
    except Exception as e:
        print(f"Agent Server: Error during Langchain processing or other exception: {e}")
        raise HTTPException(status_code=500, detail=f"Error processing URL with agent: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    print("Starting FastAPI server for scrapperAgent...")
    print(f"OPENAI_API_KEY loaded: {'Yes' if api_key else 'No'}")
    print(f"LLM Initialized: {'Yes' if llm else 'No'}")
    print(f"LLMChain Initialized: {'Yes' if chain else 'No'}")
    uvicorn.run(app, host="0.0.0.0", port=8001) # Changed port to 8001 to avoid conflict if 8000 is common
