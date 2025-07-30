import { Connection, Client } from '@temporalio/client';

let temporalClient = null;

async function getTemporalClient() {
  if (temporalClient) {
    return temporalClient;
  }

  const temporalHost = process.env.TEMPORAL_HOST || 'localhost:7233';
  const temporalNamespace = process.env.TEMPORAL_NAMESPACE || 'default';

  try {
    const connection = await Connection.connect({
      address: temporalHost,
    });

    temporalClient = new Client({
      connection,
      namespace: temporalNamespace,
    });

    return temporalClient;
  } catch (error) {
    console.error('Failed to connect to Temporal:', error);
    throw new Error('Unable to connect to Temporal server');
  }
}

export { getTemporalClient };