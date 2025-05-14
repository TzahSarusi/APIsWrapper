import asyncio

from autogen_agentchat.agents import AssistantAgent
from autogen_agentchat.messages import StructuredMessage
from autogen_agentchat.ui import Console
from autogen_ext.models.openai import OpenAIChatCompletionClient

 #Define a tool that searches the web for information.
# For simplicity, we will use a mock function here that returns a static string.
async def web_search(query: str) -> str:
    """Find information on the web"""
    return "AutoGen is a programming framework for building multi-agent applications."


# Create an agent that uses the OpenAI GPT-4o model.
model_client = OpenAIChatCompletionClient(
    model="gpt-4.1-nano",
     api_key="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",
)
agent = AssistantAgent(
    name="assistant",
    model_client=model_client,
    tools=[web_search],
    system_message="Use tools to solve tasks.",
)

# Use asyncio.run(agent.run(...)) when running in a script.
result = asyncio.run(agent.run(task="Find information on AutoGen"))
print(result.messages)
