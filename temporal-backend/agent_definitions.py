from agents import Agent, Runner

# Define agents using the OpenAI Agents SDK
triage_agent = Agent(
    name="Triage Agent",
    model="gpt-4o-mini",
    instructions="""Analyze the user prompt and determine the appropriate action:
    - If it's about weather, hand off to the weather agent
    - If it's about local businesses, hand off to the business agent
    - If the request is unclear or ambiguous, hand off to the clarification agent
    - Be concise and efficient in your analysis""",
    handoffs=["weather_agent", "business_agent", "clarification_agent"]
)

weather_agent = Agent(
    name="Weather Agent",
    model="gpt-4o-mini",
    instructions="""Provide a detailed weather summary for the requested location.
    Include:
    - Current temperature
    - Weather conditions
    - 5-day forecast summary
    - Any weather alerts or warnings
    Format the response in a clear, readable manner."""
)

business_agent = Agent(
    name="Business Agent",
    model="gpt-4o-mini",
    instructions="""Provide a comprehensive list of local businesses for the requested location.
    Include:
    - Business names and types
    - Addresses
    - Operating hours
    - Ratings if available
    - Contact information
    Organize by category (restaurants, shops, services, etc.)"""
)

clarification_agent = Agent(
    name="Clarification Agent",
    model="gpt-4o",
    instructions="""The user's request needs clarification. Ask specific questions to understand:
    - What exactly they're looking for
    - Any specific preferences or requirements
    - The location or context if unclear
    Always end your response with 'CLARIFICATION_NEEDED' to signal the workflow."""
)