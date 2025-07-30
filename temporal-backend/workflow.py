import os
from datetime import timedelta
from temporalio import workflow, activity
from temporalio.common import RetryPolicy

# Ensure OpenAI API key is set
os.environ["OPENAI_API_KEY"] = os.getenv("OPENAI_API_KEY", "")

@workflow.defn(name="AgentWorkflow")
class AgentWorkflow:
    def __init__(self):
        self.conversation_history = []
        self.clarification_received = False
        self.user_clarification = ""
    
    @workflow.run
    async def run(self, input_data: dict) -> dict:
        prompt = input_data.get("prompt", "")
        
        # Run agent as an activity - pass agent type as string
        result = await workflow.execute_activity(
            run_agent,
            {"agent_type": "triage", "input": prompt},
            start_to_close_timeout=timedelta(seconds=60),
            retry_policy=RetryPolicy(maximum_attempts=3)
        )
        
        # NOTE: Simplified for current functionality. Original intent was to update
        # conversation history and check for "CLARIFICATION_NEEDED"
        # For now, it directly returns the result.
        return {
            "final_output": result["output"],
            "agent_used": result["agent_name"],
            "required_clarification": False,
            "conversation_history": []
        }
    
    @workflow.signal
    async def user_clarification(self, clarification: str):
        """Signal to provide user clarification"""
        self.user_clarification = clarification
        self.clarification_received = True
        workflow.logger.info(f"Received clarification: {clarification}")

# Activity to run agent - imports only happen here, not in workflow
@activity.defn(name="run_agent")
async def run_agent(params: dict) -> dict:
    """Execute an agent and return the result"""
    # Import OpenAI agents only in the activity (not workflow)
    from agents import Agent, Runner
    
    input_prompt = params["input"]
    
    # Agent definition is now inlined in the activity
    agent = Agent(
        name="AI Assistant",
        model="gpt-4o-mini",
        instructions="You are a helpful AI assistant. Answer questions clearly and concisely."
    )
    
    try:
        # Run the agent using OpenAI Agents SDK Runner
        result = await Runner.run(agent, input=input_prompt)
        
        return {
            "output": result.final_output,
            "agent_name": agent.name,
            "success": True
        }
    except Exception as e:
        activity.logger.error(f"Error running agent: {e}")
        return {
            "output": f"I apologize, but I encountered an error: {str(e)}",
            "agent_name": agent.name,
            "success": False
        }