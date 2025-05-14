from dataclasses import dataclass
from typing import Callable
import asyncio

# Import necessary components from autogen_core for creating agent-based applications
from autogen_core import (
    DefaultTopicId,    # Default topic for message publishing
    MessageContext,    # Context information for message handling
    RoutedAgent,       # Base class for agents that can route messages
    message_handler,   # Decorator to mark methods that handle messages
    default_subscription, # Decorator to subscribe agents to default topics
    AgentId,           # Identifier for agents
    SingleThreadedAgentRuntime, # Runtime environment for agents
)


@dataclass
class Message:
    """Simple message class for communication between agents."""
    content: int  # The integer payload of the message


@default_subscription  # Subscribe to default topics
class Modifier(RoutedAgent):
    """Agent that modifies a value using a provided function."""
    def __init__(self, modify_val: Callable[[int], int]) -> None:
        """
        Initialize the Modifier agent.
        
        Args:
            modify_val: Function that takes an int and returns an int
        """
        super().__init__("A modifier agent.")
        self._modify_val = modify_val

    @message_handler  # Mark as a handler for incoming messages
    async def handle_message(self, message: Message, ctx: MessageContext) -> None:
        """
        Process incoming messages by applying the modification function.
        
        Args:
            message: The incoming message containing a value to modify
            ctx: Context of the message
        """
        val = self._modify_val(message.content)
        print(f"{'-'*80}\nModifier:\nModified {message.content} to {val}")
        # Publish the modified value to be consumed by other agents
        await self.publish_message(Message(content=val), DefaultTopicId())  # type: ignore


@default_subscription  # Subscribe to default topics
class Checker(RoutedAgent):
    """Agent that checks if processing should continue based on a condition."""
    def __init__(self, run_until: Callable[[int], bool]) -> None:
        """
        Initialize the Checker agent.
        
        Args:
            run_until: Function that takes an int and returns a bool indicating
                      whether to stop processing (True means stop)
        """
        super().__init__("A checker agent.")
        self._run_until = run_until

    @message_handler  # Mark as a handler for incoming messages
    async def handle_message(self, message: Message, ctx: MessageContext) -> None:
        """
        Check if processing should continue based on the message content.
        
        Args:
            message: The incoming message containing a value to check
            ctx: Context of the message
        """
        if not self._run_until(message.content):
            print(f"{'-'*80}\nChecker:\n{message.content} passed the check, continue.")
            # Forward the message to continue processing
            await self.publish_message(Message(content=message.content), DefaultTopicId())
        else:
            print(f"{'-'*80}\nChecker:\n{message.content} failed the check, stopping.")
            # No message published, which stops the processing chain


async def main():
    """
    Main function that sets up the agent system and starts processing.
    
    This creates a runtime with two agents:
    1. Modifier - decrements values by 1
    2. Checker - stops when value reaches 1 or below
    """
    # Create a runtime environment for the agents
    runtime = SingleThreadedAgentRuntime()

    # Register the Modifier agent which will decrement values by 1
    await Modifier.register(
        runtime,
        "modifier",  # Agent ID name
        lambda: Modifier(modify_val=lambda x: x - 1),
    )

    # Register the Checker agent which will stop when value <= 1
    await Checker.register(
        runtime,
        "checker",  # Agent ID name
        lambda: Checker(run_until=lambda x: x <= 1),
    )

    # Start the runtime to enable message processing
    runtime.start()
    
    # Send initial message with value 10 to the checker agent
    # The flow will be: Checker -> Modifier -> Checker -> Modifier -> ... until value <= 1
    await runtime.send_message(Message(10), AgentId("checker", "default"))
    
    # Wait for all message processing to complete
    await runtime.stop_when_idle()


if __name__ == "__main__":
    # Run the main function using asyncio
    asyncio.run(main())