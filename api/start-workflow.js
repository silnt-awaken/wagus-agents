import { getTemporalClient } from './temporal-client.js';

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { prompt, conversationHistory } = req.body;

  // Validate input
  if (!prompt || typeof prompt !== 'string') {
    return res.status(400).json({ error: 'Invalid prompt provided' });
  }

  try {
    const client = await getTemporalClient();
    const workflowId = `agent-workflow-${Date.now()}-${Math.random().toString(36).substring(7)}`;

    // Start the workflow
    const handle = await client.workflow.start('AgentWorkflow', {
      taskQueue: 'agent-queue',
      workflowId,
      args: [{ prompt }],
    });

    // Return workflow ID and initial status
    return res.status(200).json({
      workflowId: handle.workflowId,
      status: 'started',
      message: 'Workflow started successfully'
    });
  } catch (error) {
    console.error('Error starting workflow:', error);
    return res.status(500).json({
      error: 'Failed to start workflow',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};