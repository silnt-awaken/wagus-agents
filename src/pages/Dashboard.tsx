import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { 
  Plus, 
  FolderOpen, 
  Terminal, 
  GitBranch, 
  Clock, 
  TrendingUp,
  Wallet,
  Zap
} from 'lucide-react'
import { useAuth } from '../components/AuthProvider'

interface Workspace {
  id: string
  name: string
  description: string
  contextCount: number
  lastActivity: string
  color: string
}

interface RecentActivity {
  id: string
  type: 'command' | 'upload' | 'commit'
  description: string
  timestamp: string
  status: 'success' | 'pending' | 'error'
}

const Dashboard = () => {
  const { user, credits, openAiKey, updateCredits, updateOpenAiKey } = useAuth()
  const [showSetup, setShowSetup] = useState(!openAiKey)
  const [apiKeyInput, setApiKeyInput] = useState('')
  const [workspaces, setWorkspaces] = useState<Workspace[]>([])
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])
  const [balances, setBalances] = useState({
    sol: 0,
    usdc: 0,
    wagus: 0
  })

  useEffect(() => {
    // Load real user data from localStorage or API
    const savedWorkspaces = localStorage.getItem('wagus-workspaces')
    if (savedWorkspaces) {
      setWorkspaces(JSON.parse(savedWorkspaces))
    }

    const savedActivity = localStorage.getItem('wagus-recent-activity')
    if (savedActivity) {
      setRecentActivity(JSON.parse(savedActivity))
    }
  }, [user])

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'command': return <Terminal className="w-4 h-4" />
      case 'upload': return <FolderOpen className="w-4 h-4" />
      case 'commit': return <GitBranch className="w-4 h-4" />
      default: return <Clock className="w-4 h-4" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-green-600'
      case 'pending': return 'text-yellow-600'
      case 'error': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Setup Modal */}
      {showSetup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Complete Your Setup</h2>
            <p className="text-gray-600 mb-6">
              Add your OpenAI API key to start using WAGUS Agents. Your key is stored securely in your browser.
            </p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  OpenAI API Key
                </label>
                <input
                  type="password"
                  value={apiKeyInput}
                  onChange={(e) => setApiKeyInput(e.target.value)}
                  placeholder="sk-..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowSetup(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Skip for now
                </button>
                <button
                  onClick={() => {
                    if (apiKeyInput.trim()) {
                      updateOpenAiKey(apiKeyInput.trim())
                      setShowSetup(false)
                    }
                  }}
                  disabled={!apiKeyInput.trim()}
                  className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Save & Continue
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-slate-800 to-orange-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">
              Welcome back, {user?.publicKey.slice(0, 6)}...{user?.publicKey.slice(-4)}!
            </h1>
            <p className="text-orange-100">
              Ready to build something amazing? Your agentic platform awaits.
            </p>
          </div>
          <div className="text-right">
            <p className="text-orange-200 text-sm">Your Credits</p>
            <p className="text-3xl font-bold">{credits}</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Workspaces</p>
              <p className="text-2xl font-bold text-gray-900">{workspaces.length}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <FolderOpen className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Contexts</p>
              <p className="text-2xl font-bold text-gray-900">
                {workspaces.reduce((sum, w) => sum + w.contextCount, 0)}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Commands Today</p>
              <p className="text-2xl font-bold text-gray-900">
                {recentActivity.filter(activity => 
                  activity.type === 'command' && 
                  activity.timestamp.includes('minutes ago') || activity.timestamp.includes('hour ago')
                ).length}
              </p>
            </div>
            <div className="p-3 bg-orange-100 rounded-lg">
              <Terminal className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Available Credits</p>
              <p className="text-2xl font-bold text-gray-900">{credits}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <Zap className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <div className="mt-4">
            <Link
              to="/payments"
              className="text-sm text-purple-600 hover:text-purple-700 font-medium"
            >
              Purchase Credits →
            </Link>
          </div>
        </div>
      </div>

      {/* Quick Setup Section */}
      {!openAiKey && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Zap className="w-5 h-5 text-yellow-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-medium text-yellow-800">Complete Your Setup</h3>
              <p className="text-sm text-yellow-700 mt-1">
                Add your OpenAI API key to start using AI agents and slash commands.
              </p>
              <button
                onClick={() => setShowSetup(true)}
                className="mt-2 text-sm font-medium text-yellow-800 hover:text-yellow-900"
              >
                Add API Key →
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Workspaces */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Your Workspaces</h2>
                <button className="flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors">
                  <Plus className="w-4 h-4 mr-2" />
                  New Workspace
                </button>
              </div>
            </div>
            <div className="p-6">
              {workspaces.length === 0 ? (
                <div className="text-center py-8">
                  <FolderOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No workspaces yet</p>
                  <p className="text-sm text-gray-500">Create your first workspace to get started</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {workspaces.map((workspace) => (
                    <div key={workspace.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3">
                          <div className={`w-3 h-3 rounded-full ${workspace.color} mt-2`}></div>
                          <div>
                            <h3 className="font-medium text-gray-900">{workspace.name}</h3>
                            <p className="text-sm text-gray-600 mt-1">{workspace.description}</p>
                            <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                              <span>{workspace.contextCount} contexts</span>
                              <span>•</span>
                              <span>{workspace.lastActivity}</span>
                            </div>
                          </div>
                        </div>
                        <Link
                          to="/contexts"
                          className="text-orange-600 hover:text-orange-700 text-sm font-medium"
                        >
                          Open
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recent Activity & Quick Actions */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
            </div>
            <div className="p-6 space-y-3">
              <Link
                to="/commands"
                className="flex items-center p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                <Zap className="w-5 h-5 text-orange-600 mr-3" />
                <div>
                  <p className="font-medium text-gray-900">Run Command</p>
                  <p className="text-sm text-gray-600">Execute slash commands</p>
                </div>
              </Link>
              <Link
                to="/contexts"
                className="flex items-center p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                <FolderOpen className="w-5 h-5 text-blue-600 mr-3" />
                <div>
                  <p className="font-medium text-gray-900">Upload Context</p>
                  <p className="text-sm text-gray-600">Add files or repositories</p>
                </div>
              </Link>
              <Link
                to="/payments"
                className="flex items-center p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                <Wallet className="w-5 h-5 text-purple-600 mr-3" />
                <div>
                  <p className="font-medium text-gray-900">Top Up Balance</p>
                  <p className="text-sm text-gray-600">Add WAGUS tokens</p>
                </div>
              </Link>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
            </div>
            <div className="p-6">
              {recentActivity.length === 0 ? (
                <p className="text-gray-600 text-center py-4">No recent activity</p>
              ) : (
                <div className="space-y-4">
                  {recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-start space-x-3">
                      <div className={`p-2 rounded-lg ${getStatusColor(activity.status)} bg-gray-50`}>
                        {getActivityIcon(activity.type)}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{activity.description}</p>
                        <p className="text-xs text-gray-500">{activity.timestamp}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard