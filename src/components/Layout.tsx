import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { 
  Home, 
  FolderOpen, 
  Terminal, 
  GitBranch, 
  CreditCard, 
  Settings as SettingsIcon,
  Menu,
  X,
  User,
  LogOut
} from 'lucide-react'
import { useAuth } from '../components/AuthProvider'

interface LayoutProps {
  children: React.ReactNode
}

const Layout = ({ children }: LayoutProps) => {
  const [leftPanelOpen, setLeftPanelOpen] = useState(true)
  const [rightPanelOpen, setRightPanelOpen] = useState(true)
  const location = useLocation()
  const { user, signOut, credits, openAiKey } = useAuth()

  const navigation = [
    { name: 'Dashboard', href: '/', icon: Home },
    { name: 'Contexts', href: '/contexts', icon: FolderOpen },
    { name: 'Commands', href: '/commands', icon: Terminal },
    { name: 'Repository', href: '/repository', icon: GitBranch },
    { name: 'Payments', href: '/payments', icon: CreditCard },
    { name: 'Settings', href: '/settings', icon: SettingsIcon },
  ]

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Left Sidebar */}
      <div className={`${leftPanelOpen ? 'w-64' : 'w-16'} transition-all duration-300 bg-slate-800 text-white flex flex-col`}>
        {/* Header */}
        <div className="p-4 border-b border-slate-700">
          <div className="flex items-center justify-between">
            {leftPanelOpen ? (
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8">
                  <svg viewBox="0 0 100 100" className="w-full h-full text-orange-400">
                    <path d="M20 20 L80 20 L70 80 L30 80 Z" fill="currentColor" />
                    <path d="M35 35 L45 35 L40 65 L30 65 Z" fill="#1e293b" />
                    <path d="M55 35 L65 35 L70 65 L60 65 Z" fill="#1e293b" />
                    <path d="M45 45 L55 45 L50 60 L45 60 Z" fill="#1e293b" />
                  </svg>
                </div>
                <h1 className="text-xl font-bold text-orange-400">WAGUS Agents</h1>
              </div>
            ) : (
              <div className="w-8 h-8">
                <svg viewBox="0 0 100 100" className="w-full h-full text-orange-400">
                  <path d="M20 20 L80 20 L70 80 L30 80 Z" fill="currentColor" />
                  <path d="M35 35 L45 35 L40 65 L30 65 Z" fill="#1e293b" />
                  <path d="M55 35 L65 35 L70 65 L60 65 Z" fill="#1e293b" />
                  <path d="M45 45 L55 45 L50 60 L45 60 Z" fill="#1e293b" />
                </svg>
              </div>
            )}
            <button
              onClick={() => setLeftPanelOpen(!leftPanelOpen)}
              className="p-2 rounded-lg hover:bg-slate-700 transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon
              const isActive = location.pathname === item.href
              return (
                <li key={item.name}>
                  <Link
                    to={item.href}
                    className={`flex items-center px-3 py-2 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-orange-600 text-white'
                        : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {leftPanelOpen && <span className="ml-3">{item.name}</span>}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* User Profile */}
        {user && (
          <div className="p-4 border-t border-slate-700">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-orange-600 rounded-full flex items-center justify-center">
                <User className="w-4 h-4" />
              </div>
              {leftPanelOpen && (
                <div className="flex-1">
                  <p className="text-sm font-medium">
                    {user.publicKey.slice(0, 4)}...{user.publicKey.slice(-4)}
                  </p>
                  <p className="text-xs text-slate-400">{credits} credits</p>
                  <button
                    onClick={signOut}
                    className="text-xs text-slate-400 hover:text-white flex items-center mt-1"
                  >
                    <LogOut className="w-3 h-3 mr-1" />
                    Disconnect
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h2 className="text-xl font-semibold text-gray-900">
                {navigation.find(item => item.href === location.pathname)?.name || 'WAGUS Agents'}
              </h2>
            </div>
            <div className="flex items-center space-x-4">
              {/* Credits Display */}
              <div className="flex items-center space-x-2 bg-orange-50 px-3 py-1 rounded-lg">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <span className="text-sm font-medium text-orange-700">{credits} credits</span>
              </div>
              
              {/* OpenAI Key Status */}
              <div className={`flex items-center space-x-2 px-3 py-1 rounded-lg ${
                openAiKey ? 'bg-green-50' : 'bg-red-50'
              }`}>
                <div className={`w-2 h-2 rounded-full ${
                  openAiKey ? 'bg-green-500' : 'bg-red-500'
                }`}></div>
                <span className={`text-sm font-medium ${
                  openAiKey ? 'text-green-700' : 'text-red-700'
                }`}>
                  {openAiKey ? 'API Key Set' : 'No API Key'}
                </span>
              </div>
              
              <button
                onClick={() => setRightPanelOpen(!rightPanelOpen)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                {rightPanelOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Main Content */}
          <main className="flex-1 overflow-auto">
            {children}
          </main>

          {/* Right Panel */}
          {rightPanelOpen && (
            <div className="w-80 bg-white border-l border-gray-200 overflow-auto">
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Repository Explorer</h3>
                <div className="space-y-2">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">No repository connected</p>
                    <button className="mt-2 text-sm text-orange-600 hover:text-orange-700">
                      Connect Repository
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Layout