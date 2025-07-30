import { getTemporalClient } from './temporal-client.js';

export default async function handler(req, res) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { workflowId } = req.query;

  // Validate input
  if (!workflowId || typeof workflowId !== 'string') {
    return res.status(400).json({ error: 'Invalid workflow ID provided' });
  }

  try {
    const client = await getTemporalClient();
    const handle = client.workflow.getHandle(workflowId);

    // Get workflow status
    const description = await handle.describe();
    
    // If workflow is completed, get the result
    if (description.status.name === 'COMPLETED') {
      const result = await handle.result();
      
      return res.status(200).json({
        workflowId,
        status: 'COMPLETED',
        result
      });
    }

    // If workflow failed
    if (description.status.name === 'FAILED') {
      return res.status(200).json({
        workflowId,
        status: 'FAILED',
        error: 'Workflow execution failed'
      });
    }

    // Otherwise, it's still running
    return res.status(200).json({
      workflowId,
      status: 'RUNNING'
    });
  } catch (error) {
    console.error('Error checking workflow:', error);
    return res.status(500).json({
      error: 'Failed to check workflow status',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};