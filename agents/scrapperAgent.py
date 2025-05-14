from langchain.chains import LLMChain
from langchain_core.prompts import ChatPromptTemplate
from langchain_community.chat_models import ChatOpenAI
import json
import re
from fastapi import FastAPI
from pydantic import BaseModel

from dotenv import load_dotenv
import os
# Load environment variables from .env file
load_dotenv()

# Get API key from environment variable
api_key = os.getenv("OPENAI_API_KEY")

if not api_key:
    raise ValueError("Missing OPENAI_API_KEY in environment variables.")


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