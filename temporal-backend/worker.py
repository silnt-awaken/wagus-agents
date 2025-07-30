import asyncio
import os
import logging
from datetime import timedelta
from dotenv import load_dotenv

# Load environment variables FIRST
load_dotenv()

from temporalio.client import Client
from temporalio.worker import Worker
from workflow import AgentWorkflow, run_agent

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def main():
    # Verify OpenAI API key is set
    if not os.getenv("OPENAI_API_KEY"):
        logger.error("OPENAI_API_KEY environment variable is not set")
        return
    
    # Temporal connection settings
    temporal_host = os.getenv("TEMPORAL_HOST", "localhost:7233")
    temporal_namespace = os.getenv("TEMPORAL_NAMESPACE", "default")
    
    try:
        # Connect to Temporal server
        logger.info(f"Connecting to Temporal server at {temporal_host}")
        client = await Client.connect(temporal_host, namespace=temporal_namespace)
        
        # Create and start worker
        worker = Worker(
            client,
            task_queue="agent-queue",
            workflows=[AgentWorkflow],
            activities=[run_agent]
        )
        
        logger.info("Starting Temporal worker on task queue: agent-queue")
        await worker.run()
        
    except Exception as e:
        logger.error(f"Failed to start worker: {e}")
        raise

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        logger.info("Worker stopped by user")