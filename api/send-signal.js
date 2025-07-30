import { getTemporalClient } from './temporal-client.js';

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { workflowId, clarification } = req.body;

  // Validate input
  if (!workflowId || typeof workflowId !== 'string') {
    return res.status(400).json({ error: 'Invalid workflow ID provided' });
  }

  if (!clarification || typeof clarification !== 'string') {
    return res.status(400).json({ error: 'Invalid clarification provided' });
  }

  try {
    const client = await getTemporalClient();
    const handle = client.workflow.getHandle(workflowId);

    // Send signal to workflow
    await handle.signal('user_clarification', clarification);

    return res.status(200).json({
      success: true,
      message: 'Clarification sent successfully'
    });
  } catch (error) {
    console.error('Error sending signal:', error);
    return res.status(500).json({
      error: 'Failed to send clarification',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};