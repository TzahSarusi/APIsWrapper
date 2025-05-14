from langchain.chains import LLMChain
from langchain_core.prompts import ChatPromptTemplate
from langchain_community.chat_models import ChatOpenAI
import json

from dotenv import load_dotenv
import os
# Load environment variables from .env file
load_dotenv()

# Get API key from environment variable
api_key = os.getenv("OPENAI_API_KEY")

if not api_key:
    raise ValueError("Missing OPENAI_API_KEY in environment variables.")


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
4. Return valid JSON only. Do not include explanations.

URL: {url}
""")

chain = LLMChain(llm=llm, prompt=prompt)

#query = "https://shopify.dev/docs/storefronts/headless/building-with-the-storefront-api/"

query = "https://shopify.dev/docs/api/admin-rest"
try:
    response = chain.run(url=query)
    #print(response)
    data = json.loads(response)
    print(json.dumps(data, indent=2))
except json.JSONDecodeError:
    print("Invalid JSON returned from the model.")
except Exception as e:
    print(f"Error: {e}")
