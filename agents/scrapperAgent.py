import nest_asyncio
nest_asyncio.apply() # Apply this early

import asyncio
import sys

if sys.platform == "win32":
    try:
        asyncio.set_event_loop_policy(asyncio.WindowsProactorEventLoopPolicy())
        print("LLM Scraper Agent: Successfully set WindowsProactorEventLoopPolicy.")
    except Exception as e:
        print(f"LLM Scraper Agent: Warning - Error setting event loop policy: {e}")

from langchain.chains import LLMChain
from langchain_core.prompts import ChatPromptTemplate, SystemMessagePromptTemplate, HumanMessagePromptTemplate
from langchain_community.chat_models import ChatOpenAI
import json
import re
<<<<<<< HEAD
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
=======
from fastapi import FastAPI
from pydantic import BaseModel

>>>>>>> 5158105f11489e7135483e8a2b96e9ad96b6347b
from dotenv import load_dotenv
import os

load_dotenv()
api_key = os.getenv("OPENAI_API_KEY")

if not api_key:
    raise ValueError("Missing OPENAI_API_KEY in environment variables.")

<<<<<<< HEAD
llm = ChatOpenAI(
    openai_api_key=api_key,
    model="gpt-4", 
    temperature=0,
)

system_prompt_text = """
You are an expert API documentation parser. 
Your task is to meticulously analyze the provided Markdown content (extracted from an API documentation page) and extract information about all available API endpoints.

For each distinct API endpoint (a unique combination of an HTTP method and a path), you must provide the following details:
1.  "name": A concise, human-readable name for the endpoint (e.g., "Get User Profile", "Create Product").
2.  "method": The HTTP method in uppercase (e.g., "GET", "POST", "PUT", "DELETE").
3.  "endpoint": The relative path of the endpoint (e.g., "/users/{id}", "/products"). Path parameters in endpoint strings should use single braces.
4.  "description": A brief explanation of what the endpoint does.
5.  "schema": A JSON object detailing parameters and example structures. This object MUST contain the following keys:
    a.  "pathParams": An array of objects for path parameters. Each object should have "name" (string), "type" (string, e.g., "string", "integer"), "description" (string), and "required" (boolean). If no path parameters, use an empty array [].
    b.  "queryParams": An array of objects for query parameters. Each object should have "name" (string), "type" (string), "description" (string), and "required" (boolean). If no query parameters, use an empty array [].
    c.  "requestBody": A JSON object representing an example or schema of the request body (especially for POST, PUT, PATCH operations). Use an empty object {} if not applicable or no example is found.
    d.  "responsePreview": A JSON object where keys are HTTP status codes as strings (e.g., "200", "201", "404") and values are example JSON response bodies for those statuses. Use an empty object {} if no examples are found.

If the Markdown contains elements that look like Swagger/OpenAPI specification data, prioritize extracting data from it for accuracy.

CRITICAL OUTPUT FORMATTING RULES:
- Your entire output MUST be a single, valid JSON array.
- Each element in the array MUST be a JSON object representing one API endpoint, strictly adhering to the keys and structures described above.
- If no API endpoints can be reliably extracted from the Markdown, you MUST return an empty JSON array: [].
- ABSOLUTELY DO NOT include any introductory text, concluding remarks, explanations, apologies, markdown formatting (like ```json), or any characters whatsoever outside of the main JSON array. The response must be directly parsable by Python's `json.loads()` function.

Example of a single API endpoint object within the JSON array:
{
  "name": "Get Product Details",
  "method": "GET",
  "endpoint": "/products/{product_id}",
  "description": "Retrieves the details of a specific product by its ID.",
  "schema": {
    "pathParams": [ {"name": "product_id", "type": "integer", "description": "The unique identifier for the product.", "required": true} ],
    "queryParams": [ {"name": "include_details", "type": "boolean", "description": "Set to true to include extended product details.", "required": false} ],
    "requestBody": {},
    "responsePreview": {
      "200": {"id": 123, "name": "Awesome T-Shirt", "price": 29.99, "description": "A really cool t-shirt."},
      "404": {"error": "Product not found"}
    }
  }
}
"""
human_template_str = "Here is the Markdown content to parse:\n\nMARKDOWN_CONTENT:\n{markdown_content}"

system_message_prompt = SystemMessagePromptTemplate.from_template(system_prompt_text)
human_message_prompt = HumanMessagePromptTemplate.from_template(human_template_str)
chat_prompt_template = ChatPromptTemplate.from_messages([system_message_prompt, human_message_prompt])
chain = LLMChain(llm=llm, prompt=chat_prompt_template)

def extract_json_from_llm_response(text: str) -> list | dict | None:
    match_json_block = re.search(r"```json\s*([\s\S]*?)\s*```", text, re.DOTALL)
    if match_json_block:
        json_str = match_json_block.group(1).strip()
        try:
            return json.loads(json_str)
        except json.JSONDecodeError as e:
            print(f"LLM Scraper Agent: Found JSON block but failed to parse: {e}")
            pass
    try:
        return json.loads(text.strip())
    except json.JSONDecodeError:
        print(f"LLM Scraper Agent: Could not parse the text as JSON directly.")
        return None

async def generate_api_definitions_from_markdown(markdown_content: str):
    print(f"LLM Scraper Agent: Processing Markdown content. Length: {len(markdown_content)} chars.")
    if not chain:
        raise Exception("LLMChain not initialized.")
    
    if hasattr(chain, 'prompt') and hasattr(chain.prompt, 'input_variables'):
        print(f"LLM Scraper Agent: Chain expects input variables: {chain.prompt.input_variables}")
    else:
        print("LLM Scraper Agent: Chain or prompt object not fully initialized for variable check.")

    # Limit content length before sending to LLM if necessary
    max_chars = 80000 # Adjust based on typical markdown length and token limits for GPT-4
    if len(markdown_content) > max_chars:
        print(f"LLM Scraper Agent: Truncating markdown content from {len(markdown_content)} to {max_chars} chars.")
        markdown_content = markdown_content[:max_chars]

    raw_llm_response = await asyncio.to_thread(chain.run, {"markdown_content": markdown_content})
    print(f"LLM Scraper Agent: Raw LLM response snippet: {raw_llm_response[:1000]}...")

    extracted_data = extract_json_from_llm_response(raw_llm_response)

    if extracted_data is None:
        print("LLM Scraper Agent: No valid JSON found in LLM response.")
        raise ValueError("LLM did not return valid JSON data based on the markdown content.")
    
    if not isinstance(extracted_data, list):
        if isinstance(extracted_data, dict) and all(k in extracted_data for k in ["api_operation_description", "resource", "request_preview"]):
            print("LLM Scraper Agent: LLM returned a single API definition object; wrapping it in a list.")
            extracted_data = [extracted_data]
        else:
            print(f"LLM Scraper Agent: Extracted JSON is not a list of API definitions as expected. Type: {type(extracted_data)}")
            raise ValueError("LLM response was valid JSON, but not the expected array of API definitions.")

    print(f"LLM Scraper Agent: Successfully extracted {len(extracted_data)} API definition(s) from markdown.")
    return extracted_data

app = FastAPI()

class MarkdownInput(BaseModel):
    markdown_content: str
    source_url: str # Optional: for context/logging

@app.post("/extract-apis-from-markdown/")
async def extract_apis_endpoint_handler(data: MarkdownInput):
    try:
        print(f"LLM Scraper Agent: Received markdown from URL: {data.source_url}")
        api_definitions_list = await generate_api_definitions_from_markdown(data.markdown_content)
        return api_definitions_list
    except ValueError as ve:
        print(f"LLM Scraper Agent: ValueError during processing: {ve}")
        raise HTTPException(status_code=422, detail=str(ve))
    except Exception as e:
        print(f"LLM Scraper Agent: Unhandled exception: {e}")
        raise HTTPException(status_code=500, detail=f"An unexpected error occurred: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    print("Starting LLM Scraper Agent (FastAPI)...")
    print(f"OPENAI_API_KEY loaded: {'Yes' if api_key else 'No (Agent will not work!)'}")
    print(f"LLM Initialized: {'Yes' if llm else 'No (Agent will not work!)'}")
    # Port for LLM agent, e.g., 8001
    uvicorn.run("scrapperAgent:app", host="0.0.0.0", port=8001, reload=True)
=======

def generateApiJson(url):
    llm = ChatOpenAI(
        openai_api_key=api_key,
        model="gpt-4",
        temperature=0,
        # max_tokens=4000
    )
    prompt = ChatPromptTemplate.from_template("""
You will receive a URL to an API documentation page. Your job is to:
1. Analyze it and extract all available API endpoints.
2. if it's a structured API(like REST,GraphQL, etc), identify the available paths and methods.
2. Include HTTP methods, parameters, and usage examples.
3. If Swagger/OpenAPI docs are present, use them to enrich the output.
4. add explain to each end point.
5. Return valid JSON only.


URL: {url}
""")
    chain = LLMChain(llm=llm, prompt=prompt)
    # query = "https://shopify.dev/docs/storefronts/headless/building-with-the-storefront-api/"
    #query = "https://shopify.dev/docs/api/admin-rest"
    try:
        response = chain.run(url=url)
        print(response)
        data = extract_json(response)
        return (json.dumps(data, indent=2))
    except json.JSONDecodeError:
        print("Invalid JSON returned from the model.")
    except Exception as e:
        print(f"Error: {e}")


#generateApiJson("https://shopify.dev/docs/api/admin-rest")

def extract_json(text):
    # Try to extract the first JSON block in triple backticks
    match = re.search(r"```json\s*(\{.*?\})\s*```", text, re.DOTALL)
    if match:
        json_str = match.group(1)
    else:
        # Fallback: look for a plain JSON-like object
        match = re.search(r"(\{.*\"endpoints\".*\})", text, re.DOTALL)
        if not match:
            raise ValueError("No JSON found in the text.")
        json_str = match.group(1)

    try:
        return json.loads(json_str)
    except json.JSONDecodeError as e:
        raise ValueError("Found JSON but it is invalid.") from e

app = FastAPI()
# Request body model
class InputData(BaseModel):
    url: str

# API endpoint
@app.post("/generate-api-json")
def callGenerateApiJson(data: InputData):
    result = generateApiJson(data.url)
    return {"result": result}
>>>>>>> 5158105f11489e7135483e8a2b96e9ad96b6347b
