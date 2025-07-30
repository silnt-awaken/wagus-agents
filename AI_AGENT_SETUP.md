# AI Agent with OpenAI Agents SDK and Temporal

This guide explains how to set up and run the long-running AI agent system using OpenAI Agents SDK with Temporal for durable execution.

## Overview

The system consists of:
- **OpenAI Agents SDK**: Provides agent definitions and execution logic
- **Temporal**: Handles durable workflow execution, state persistence, and retry logic
- **Vercel**: Hosts the frontend and API routes to trigger workflows
- **Human-in-the-Loop**: Supports pausing workflows for user clarification

## Architecture

```
┌─────────────┐     ┌──────────────┐     ┌─────────────────┐
│   Vercel    │────▶│   Temporal   │────▶│ Python Worker   │
│  Frontend   │     │   Server     │     │  (Agents SDK)   │
└─────────────┘     └──────────────┘     └─────────────────┘
       │                    │                      │
       └────────────────────┴──────────────────────┘
              Workflow Status & Signals
```

## Prerequisites

- Node.js 18+ and npm
- Python 3.8+
- Docker and Docker Compose (for local Temporal server)
- OpenAI API key (set in Vercel environment variables)

## Quick Start

### 1. Install Dependencies

**Frontend (Vercel):**
```bash
npm install
```

**Backend (Python):**
```bash
cd temporal-backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 2. Set Up Environment Variables

Copy `.env.example` to `.env` and fill in your values:
```bash
cp .env.example .env
```

Key variables:
- `OPENAI_API_KEY`: Your OpenAI API key
- `TEMPORAL_HOST`: Temporal server address (localhost:7233 for local)
- `TEMPORAL_NAMESPACE`: Temporal namespace (default for local)

### 3. Start Temporal Server (Local Development)

Using Docker Compose:
```bash
docker-compose up temporal temporal-ui -d
```

Or manually:
```bash
temporal server start-dev
```

The Temporal UI will be available at http://localhost:8080

### 4. Start the Python Worker

```bash
cd temporal-backend
python worker.py
```

### 5. Start the Vercel Development Server

```bash
npm run dev
```

Visit http://localhost:5173 and navigate to "AI Agent" in the sidebar.

## Usage

1. **Start a Conversation**: Enter a prompt in the AI Agent interface
2. **Agent Processing**: The triage agent analyzes your request and delegates to specialized agents
3. **Human-in-the-Loop**: If clarification is needed, you'll be prompted to provide more details
4. **View Results**: The agent's response will appear in the chat interface

### Example Prompts

- "What's the weather in Seattle?"
- "Show me restaurants in San Francisco"
- "Tell me about local businesses" (will trigger clarification request)

## Deployment

### Temporal Worker (Production)

1. **Using Render/Fly.io:**
   ```bash
   cd temporal-backend
   docker build -t temporal-worker .
   docker push your-registry/temporal-worker
   ```

2. **Configure Temporal Cloud:**
   - Sign up at temporal.io/cloud
   - Update environment variables with cloud credentials
   - Set `TEMPORAL_HOST`, `TEMPORAL_NAMESPACE`, and certificates

### Vercel Frontend

1. **Deploy to Vercel:**
   ```bash
   vercel --prod
   ```

2. **Set Environment Variables in Vercel Dashboard:**
   - `OPENAI_API_KEY`
   - `TEMPORAL_HOST`
   - `TEMPORAL_NAMESPACE`

## Agent Configuration

The system includes four agents:

1. **Triage Agent**: Analyzes requests and routes to appropriate agents
2. **Weather Agent**: Provides weather information
3. **Business Agent**: Lists local businesses
4. **Clarification Agent**: Requests additional information when needed

To modify agents, edit `temporal-backend/agents.py`.

## Troubleshooting

### Worker Not Connecting
- Ensure Temporal server is running: `temporal server start-dev`
- Check `TEMPORAL_HOST` in environment variables
- Verify Python dependencies are installed

### Workflow Failures
- Check Temporal UI at http://localhost:8080 for workflow history
- View worker logs for error messages
- Ensure `OPENAI_API_KEY` is valid

### API Route Errors
- Verify Vercel serverless functions are deployed
- Check browser console for API errors
- Ensure CORS is properly configured

## Development Tips

1. **Testing Locally**: Use `docker-compose up` to run all services
2. **Debugging Workflows**: Use Temporal UI to inspect workflow execution
3. **Hot Reload**: The Python worker supports hot reload in development
4. **API Testing**: Use tools like Postman to test API routes directly

## Security Considerations

1. **API Keys**: Never commit API keys to version control
2. **Temporal Security**: Use TLS certificates in production
3. **Rate Limiting**: Implement rate limiting on API routes
4. **Input Validation**: Validate all user inputs before processing

## Next Steps

- Add more specialized agents
- Implement conversation history persistence
- Add authentication to API routes
- Set up monitoring and logging
- Implement webhook notifications for long-running workflows