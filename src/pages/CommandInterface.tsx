import { useState, useRef, useEffect } from 'react'
import { 
  Send, 
  Terminal, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Loader, 
  Zap, 
  CreditCard,
  History,
  Copy,
  Play,
  AlertTriangle
} from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '../components/AuthProvider'
import { useNavigate } from 'react-router-dom'

interface Command {
  id: string
  command: string
  timestamp: string
  status: 'pending' | 'running' | 'completed' | 'error'
  output?: string
  isPremium: boolean
  cost?: number
}

interface CommandSuggestion {
  command: string
  description: string
  isPremium: boolean
  cost?: number
}

const CommandInterface = () => {
  const [currentCommand, setCurrentCommand] = useState('')
  const [commands, setCommands] = useState<Command[]>([])
  const [isExecuting, setIsExecuting] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [pendingCommand, setPendingCommand] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const outputRef = useRef<HTMLDivElement>(null)
  const { credits, updateCredits } = useAuth()
  const navigate = useNavigate()

  const commandSuggestions: CommandSuggestion[] = [
    {
      command: '/implement',
      description: 'Implement a feature or functionality',
      isPremium: false
    },
    {
      command: '/test',
      description: 'Generate tests for existing code',
      isPremium: false
    },
    {
      command: '/refactor',
      description: 'Refactor and optimize code',
      isPremium: false
    },
    {
      command: '/deploy',
      description: 'Deploy application to production',
      isPremium: true,
      cost: 10
    },
    {
      command: '/analyze',
      description: 'Analyze codebase for issues',
      isPremium: false
    },
    {
      command: '/optimize',
      description: 'Optimize performance and bundle size',
      isPremium: true,
      cost: 5
    }
  ]

  const filteredSuggestions = commandSuggestions.filter(suggestion =>
    suggestion.command.toLowerCase().includes(currentCommand.toLowerCase()) &&
    currentCommand.startsWith('/')
  )

  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight
    }
  }, [commands])

  const executeCommand = async (commandText: string) => {
    if (!commandText.trim()) return

    const commandSuggestion = commandSuggestions.find(s => 
      commandText.startsWith(s.command)
    )
    const isPremium = commandSuggestion?.isPremium || false
    const cost = commandSuggestion?.cost || 0

    if (isPremium) {
      // Check if user has enough credits
      if (credits < cost) {
        setPendingCommand(commandText)
        setShowPaymentModal(true)
        return
      }
      
      // Deduct credits for premium command
      updateCredits(-cost) // Use negative value to deduct credits
      toast.success(`${cost} credits deducted for premium command`)
    }

    const newCommand: Command = {
      id: Date.now().toString(),
      command: commandText,
      timestamp: new Date().toISOString(),
      status: 'pending',
      isPremium,
      cost
    }

    setCommands(prev => [...prev, newCommand])
    setCurrentCommand('')
    setIsExecuting(true)

    // Save command to localStorage for persistence
    const savedCommands = localStorage.getItem('wagus-commands')
    const existingCommands = savedCommands ? JSON.parse(savedCommands) : []
    localStorage.setItem('wagus-commands', JSON.stringify([...existingCommands, newCommand]))

    // Update command status to running
    setTimeout(() => {
      setCommands(prev => prev.map(cmd => 
        cmd.id === newCommand.id 
          ? { ...cmd, status: 'running' }
          : cmd
      ))
    }, 500)

    // Show error message indicating this requires real development setup
    setTimeout(() => {
      const errorOutput = `❌ Command execution failed\n\n🔧 Development Environment Required\n\nThis command requires a properly configured development environment with:\n\n• OpenAI API integration\n• Code generation backend\n• File system access\n• Git repository connection\n\n💡 Next Steps:\n1. Set up your OpenAI API key in settings\n2. Connect your development environment\n3. Configure workspace permissions\n4. Retry command execution\n\n📞 Contact support for enterprise setup assistance.`
      
      setCommands(prev => prev.map(cmd => 
        cmd.id === newCommand.id 
          ? { 
              ...cmd, 
              status: 'error',
              output: errorOutput
            }
          : cmd
      ))
      setIsExecuting(false)
      toast.error('Command requires development environment setup')
    }, 2000)
  }

  const handlePaymentRedirect = () => {
    setShowPaymentModal(false)
    navigate('/payment')
  }

  const executePendingCommand = () => {
    if (pendingCommand) {
      setShowPaymentModal(false)
      setPendingCommand(null)
      executeCommand(pendingCommand)
    }
  }

  // Load saved commands from localStorage on component mount
  useEffect(() => {
    const savedCommands = localStorage.getItem('wagus-commands')
    if (savedCommands) {
      setCommands(JSON.parse(savedCommands))
    }
  }, [])

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      executeCommand(currentCommand)
    } else if (e.key === 'Tab' && filteredSuggestions.length > 0) {
      e.preventDefault()
      setCurrentCommand(filteredSuggestions[0].command + ' ')
      setShowSuggestions(false)
    }
  }

  const getStatusIcon = (status: Command['status']) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />
      case 'running':
        return <Loader className="w-4 h-4 text-blue-500 animate-spin" />
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500" />
    }
  }

  const getStatusColor = (status: Command['status']) => {
    switch (status) {
      case 'pending': return 'text-yellow-600 bg-yellow-50'
      case 'running': return 'text-blue-600 bg-blue-50'
      case 'completed': return 'text-green-600 bg-green-50'
      case 'error': return 'text-red-600 bg-red-50'
    }
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 bg-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Command Interface</h1>
            <p className="text-gray-600">Execute slash commands to trigger AI workflows</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Terminal className="w-4 h-4" />
              <span>{commands.length} commands executed</span>
            </div>
            <div className="flex items-center space-x-2 px-3 py-2 bg-orange-50 border border-orange-200 rounded-lg">
              <CreditCard className="w-4 h-4 text-orange-600" />
              <span className="text-sm font-medium text-orange-700">{credits} Credits</span>
            </div>
            <button className="flex items-center px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <History className="w-4 h-4 mr-2" />
              History
            </button>
          </div>
        </div>
      </div>

      {/* Command Output */}
      <div 
        ref={outputRef}
        className="flex-1 overflow-auto p-6 bg-gray-50 font-mono text-sm"
      >
        {commands.length === 0 ? (
          <div className="text-center py-12">
            <Terminal className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Ready for commands</h3>
            <p className="text-gray-600 mb-4">Type a slash command to get started</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-w-4xl mx-auto">
              {commandSuggestions.map((suggestion) => (
                <button
                  key={suggestion.command}
                  onClick={() => setCurrentCommand(suggestion.command + ' ')}
                  className="p-3 text-left border border-gray-200 rounded-lg hover:bg-white hover:shadow-sm transition-all"
                >
                  <div className="flex items-center justify-between mb-1">
                    <code className="text-orange-600 font-medium">{suggestion.command}</code>
                    {suggestion.isPremium && (
                      <div className="flex items-center space-x-1">
                        <CreditCard className="w-3 h-3 text-purple-600" />
                        <span className="text-xs text-purple-600">{suggestion.cost} WAGUS</span>
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-gray-600">{suggestion.description}</p>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {commands.map((command) => (
              <div key={command.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                {/* Command Header */}
                <div className="p-4 border-b border-gray-200 bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(command.status)}
                      <div>
                        <code className="text-orange-600 font-medium">{command.command}</code>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(command.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {command.isPremium && (
                        <span className="px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded-full">
                          Premium
                        </span>
                      )}
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(command.status)}`}>
                        {command.status}
                      </span>
                      <button className="p-1 text-gray-400 hover:text-gray-600">
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
                
                {/* Command Output */}
                {command.output && (
                  <div className="p-4">
                    <pre className="whitespace-pre-wrap text-sm text-gray-800">
                      {command.output}
                    </pre>
                  </div>
                )}
                
                {command.status === 'running' && (
                  <div className="p-4">
                    <div className="flex items-center space-x-2 text-blue-600">
                      <Loader className="w-4 h-4 animate-spin" />
                      <span className="text-sm">Executing command...</span>
                    </div>
                    <div className="mt-2 bg-blue-50 rounded p-2">
                      <div className="text-xs text-blue-700">
                        🤖 AI Agent is processing your request...
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Command Input */}
      <div className="p-6 bg-white border-t border-gray-200">
        <div className="relative">
          {/* Suggestions */}
          {showSuggestions && filteredSuggestions.length > 0 && (
            <div className="absolute bottom-full left-0 right-0 mb-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-auto">
              {filteredSuggestions.map((suggestion) => (
                <button
                  key={suggestion.command}
                  onClick={() => {
                    setCurrentCommand(suggestion.command + ' ')
                    setShowSuggestions(false)
                    inputRef.current?.focus()
                  }}
                  className="w-full p-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <code className="text-orange-600 font-medium">{suggestion.command}</code>
                      <p className="text-sm text-gray-600 mt-1">{suggestion.description}</p>
                    </div>
                    {suggestion.isPremium && (
                      <div className="flex items-center space-x-1">
                        <CreditCard className="w-4 h-4 text-purple-600" />
                        <span className="text-sm text-purple-600">{suggestion.cost} WAGUS</span>
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="flex items-center space-x-3">
            <div className="flex-1 relative">
              <input
                ref={inputRef}
                type="text"
                value={currentCommand}
                onChange={(e) => {
                  setCurrentCommand(e.target.value)
                  setShowSuggestions(e.target.value.startsWith('/'))
                }}
                onKeyDown={handleKeyPress}
                onFocus={() => setShowSuggestions(currentCommand.startsWith('/'))}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                placeholder="Type a slash command (e.g., /implement user authentication)"
                disabled={isExecuting}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <Zap className="w-5 h-5 text-gray-400" />
              </div>
            </div>
            <button
              onClick={() => executeCommand(currentCommand)}
              disabled={!currentCommand.trim() || isExecuting}
              className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
            >
              {isExecuting ? (
                <Loader className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              <span>{isExecuting ? 'Executing...' : 'Execute'}</span>
            </button>
          </div>
          
          <div className="mt-2 text-xs text-gray-500">
            Press Tab to autocomplete • Enter to execute • Premium commands require WAGUS tokens
          </div>
        </div>
      </div>

      {/* Insufficient Credits Modal */}
      {showPaymentModal && pendingCommand && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Insufficient Credits</h3>
              <button
                onClick={() => {
                  setShowPaymentModal(false)
                  setPendingCommand(null)
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="w-5 h-5 text-orange-500 mt-0.5" />
                <div>
                  <p className="text-gray-900 font-medium">Premium Command Requires Credits</p>
                  <p className="text-sm text-gray-600 mt-1">
                    The command <code className="bg-gray-100 px-1 rounded text-orange-600">{pendingCommand}</code> requires{' '}
                    {commandSuggestions.find(s => pendingCommand?.startsWith(s.command))?.cost || 0} credits to execute.
                  </p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Your current credits:</span>
                  <span className="font-medium">{credits}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Required credits:</span>
                  <span className="font-medium">
                    {commandSuggestions.find(s => pendingCommand?.startsWith(s.command))?.cost || 0}
                  </span>
                </div>
                <div className="flex justify-between text-sm border-t pt-2 mt-2">
                  <span className="text-gray-600">Credits needed:</span>
                  <span className="font-medium text-red-600">
                    {(commandSuggestions.find(s => pendingCommand?.startsWith(s.command))?.cost || 0) - credits}
                  </span>
                </div>
              </div>

              <div className="text-xs text-gray-500">
                <p>• Purchase credits with WAGUS tokens</p>
                <p>• Credits are used for premium AI commands</p>
                <p>• Your command will be saved and executed after purchase</p>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  onClick={() => {
                    setShowPaymentModal(false)
                    setPendingCommand(null)
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handlePaymentRedirect}
                  className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors flex items-center justify-center"
                >
                  <CreditCard className="w-4 h-4 mr-2" />
                  Buy Credits
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CommandInterface