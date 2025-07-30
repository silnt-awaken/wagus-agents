import React, { useState, useEffect } from 'react';
import { Loader2, Send, MessageSquare, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface WorkflowState {
  workflowId: string | null;
  status: 'idle' | 'running' | 'waiting_clarification' | 'completed' | 'failed';
  needsClarification: boolean;
}

export default function AIAgent() {
  const [prompt, setPrompt] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [workflow, setWorkflow] = useState<WorkflowState>({
    workflowId: null,
    status: 'idle',
    needsClarification: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [clarificationInput, setClarificationInput] = useState('');

  // Poll for workflow status
  useEffect(() => {
    if (!workflow.workflowId || workflow.status === 'completed' || workflow.status === 'failed') {
      return;
    }

    const interval = setInterval(async () => {
      try {
        const response = await fetch(`/api/check-workflow?workflowId=${workflow.workflowId}`);
        const data = await response.json();

        if (data.status === 'COMPLETED' && data.result) {
          setWorkflow(prev => ({ ...prev, status: 'completed' }));
          
          // Add the result to messages
          setMessages(prev => [...prev, {
            role: 'assistant',
            content: data.result.final_output,
            timestamp: new Date()
          }]);

          // Check if clarification is needed
          if (data.result.required_clarification) {
            setWorkflow(prev => ({ ...prev, needsClarification: true, status: 'waiting_clarification' }));
          }
        } else if (data.status === 'FAILED') {
          setWorkflow(prev => ({ ...prev, status: 'failed' }));
          toast.error('Workflow failed. Please try again.');
        }
      } catch (error) {
        console.error('Error checking workflow:', error);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [workflow.workflowId, workflow.status]);

  const startWorkflow = async () => {
    if (!prompt.trim()) {
      toast.error('Please enter a prompt');
      return;
    }

    setIsLoading(true);
    
    // Add user message
    setMessages(prev => [...prev, {
      role: 'user',
      content: prompt,
      timestamp: new Date()
    }]);

    try {
      const response = await fetch('/api/start-workflow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          conversationHistory: messages
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to start workflow');
      }

      const data = await response.json();
      setWorkflow({
        workflowId: data.workflowId,
        status: 'running',
        needsClarification: false,
      });
      setPrompt('');
      toast.success('Processing your request...');
    } catch (error) {
      console.error('Error starting workflow:', error);
      toast.error('Failed to start workflow. Please try again.');
      setMessages(prev => prev.slice(0, -1)); // Remove the user message
    } finally {
      setIsLoading(false);
    }
  };

  const sendClarification = async () => {
    if (!clarificationInput.trim() || !workflow.workflowId) {
      toast.error('Please provide clarification');
      return;
    }

    setIsLoading(true);
    
    // Add clarification message
    setMessages(prev => [...prev, {
      role: 'user',
      content: clarificationInput,
      timestamp: new Date()
    }]);

    try {
      const response = await fetch('/api/send-signal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workflowId: workflow.workflowId,
          userInput: clarificationInput,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send clarification');
      }

      setClarificationInput('');
      setWorkflow(prev => ({ 
        ...prev, 
        status: 'running',
        needsClarification: false 
      }));
      toast.success('Clarification sent successfully');
    } catch (error) {
      console.error('Error sending clarification:', error);
      toast.error('Failed to send clarification. Please try again.');
      setMessages(prev => prev.slice(0, -1)); // Remove the clarification message
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-6">
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <MessageSquare className="w-8 h-8" />
              AI Agent Assistant
            </h1>
            <p className="text-purple-100 mt-2">
              Powered by OpenAI Agents SDK & Temporal
            </p>
          </div>

          {/* Messages */}
          <div className="p-6 space-y-4 max-h-[500px] overflow-y-auto">
            {messages.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <MessageSquare className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>Start a conversation by entering a prompt below</p>
                <p className="text-sm mt-2">Try asking about weather or local businesses!</p>
              </div>
            ) : (
              messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-3xl p-4 rounded-lg ${
                      message.role === 'user'
                        ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{message.content}</p>
                    <p className="text-xs mt-2 opacity-70">
                      {message.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))
            )}
            
            {workflow.status === 'running' && (
              <div className="flex justify-start">
                <div className="bg-gray-100 p-4 rounded-lg flex items-center gap-3">
                  <Loader2 className="w-5 h-5 animate-spin text-purple-600" />
                  <span className="text-gray-600">Processing your request...</span>
                </div>
              </div>
            )}
          </div>

          {/* Clarification Alert */}
          {workflow.needsClarification && (
            <div className="mx-6 mb-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex items-center gap-2 text-amber-800 mb-2">
                <AlertCircle className="w-5 h-5" />
                <span className="font-semibold">Clarification Needed</span>
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={clarificationInput}
                  onChange={(e) => setClarificationInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendClarification()}
                  placeholder="Provide more details..."
                  className="flex-1 px-4 py-2 border border-amber-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
                <button
                  onClick={sendClarification}
                  disabled={isLoading || !clarificationInput.trim()}
                  className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  Submit
                </button>
              </div>
            </div>
          )}

          {/* Input Area */}
          <div className="p-6 bg-gray-50 border-t">
            <div className="flex gap-3">
              <input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && !isLoading && startWorkflow()}
                placeholder="Ask about weather, local businesses, or anything else..."
                disabled={workflow.status === 'running' || workflow.needsClarification}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
              <button
                onClick={startWorkflow}
                disabled={isLoading || !prompt.trim() || workflow.status === 'running' || workflow.needsClarification}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
                Send
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}