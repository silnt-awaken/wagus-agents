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
  LogOut,
  Zap,
  ShoppingCart
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
    { name: 'Prompt Optimizer', href: '/prompt-optimizer', icon: Zap },
    { name: 'Agent Shop', href: '/agent-shop', icon: ShoppingCart },
    { name: 'Payments', href: '/payments', icon: CreditCard },
    { name: 'Settings', href: '/settings', icon: SettingsIcon },
  ]

  return (
    <div className="flex h-screen" style={{ backgroundColor: `rgb(var(--background))` }}>
      {/* Left Sidebar */}
      <div className={`${leftPanelOpen ? 'w-64' : 'w-16'} transition-all duration-300 flex flex-col`} style={{ backgroundColor: `rgb(var(--card))`, color: `rgb(var(--card-foreground))` }}>
        {/* Header */}
        <div className="p-4 border-b" style={{ borderColor: `rgb(var(--border))` }}>
          <div className="flex items-center justify-between">
            {leftPanelOpen ? (
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8">
                  <svg viewBox="0 0 100 100" className="w-full h-full" style={{ color: `rgb(var(--primary))` }}>
                    <path d="M20 20 L80 20 L70 80 L30 80 Z" fill="currentColor" />
                    <path d="M35 35 L45 35 L40 65 L30 65 Z" fill="#1e293b" />
                    <path d="M55 35 L65 35 L70 65 L60 65 Z" fill="#1e293b" />
                    <path d="M45 45 L55 45 L50 60 L45 60 Z" fill="#1e293b" />
                  </svg>
                </div>
                <h1 className="text-xl font-bold" style={{ color: `rgb(var(--primary))` }}>WAGUS Agents</h1>
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
              className="p-2 rounded-lg transition-colors"

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
                    className="flex items-center px-3 py-2 rounded-lg transition-colors"
                    style={{
                      backgroundColor: isActive ? `rgb(var(--primary))` : 'transparent',
                      color: isActive ? `rgb(var(--primary-foreground))` : `rgb(var(--foreground) / 0.7)`
                    }}
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
          <div className="p-4 border-t" style={{ borderColor: `rgb(var(--border))` }}>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: `rgb(var(--primary))` }}>
                <User className="w-4 h-4" />
              </div>
              {leftPanelOpen && (
                <div className="flex-1">
                  <p className="text-sm font-medium">
                    {user.publicKey.slice(0, 4)}...{user.publicKey.slice(-4)}
                  </p>
                  <p className="text-xs" style={{ color: `rgb(var(--foreground) / 0.6)` }}>{credits} credits</p>
                  <button
                    onClick={signOut}
                    className="text-xs flex items-center mt-1 transition-colors"
                    style={{ color: `rgb(var(--foreground) / 0.6)` }}
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
        <header className="border-b px-6 py-4" style={{ backgroundColor: `rgb(var(--card))`, borderColor: `rgb(var(--border))` }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h2 className="text-xl font-semibold" style={{ color: `rgb(var(--foreground))` }}>
                {navigation.find(item => item.href === location.pathname)?.name || 'WAGUS Agents'}
              </h2>
            </div>
            <div className="flex items-center space-x-4">
              {/* Credits Display */}
              <div className="flex items-center space-x-2 px-3 py-1 rounded-lg" style={{ backgroundColor: `rgb(var(--primary) / 0.1)` }}>
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: `rgb(var(--primary))` }}></div>
                <span className="text-sm font-medium" style={{ color: `rgb(var(--primary))` }}>{credits} credits</span>
              </div>
              
              {/* OpenAI Key Status */}
              <div className="flex items-center space-x-2 px-3 py-1 rounded-lg" style={{ backgroundColor: openAiKey ? 'rgb(34 197 94 / 0.1)' : 'rgb(239 68 68 / 0.1)' }}>
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: openAiKey ? 'rgb(34 197 94)' : 'rgb(239 68 68)' }}></div>
                <span className="text-sm font-medium" style={{ color: openAiKey ? 'rgb(34 197 94)' : 'rgb(239 68 68)' }}>
                  {openAiKey ? 'API Key Set' : 'No API Key'}
                </span>
              </div>
              
              <button
                onClick={() => setRightPanelOpen(!rightPanelOpen)}
                className="p-2 rounded-lg transition-colors"

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
            <div className="w-80 border-l overflow-auto" style={{ backgroundColor: `rgb(var(--card))`, borderColor: `rgb(var(--border))` }}>
              <div className="p-4">
                <h3 className="text-lg font-semibold mb-4" style={{ color: `rgb(var(--foreground))` }}>Repository Explorer</h3>
                <div className="space-y-2">
                  <div className="p-3 rounded-lg" style={{ backgroundColor: `rgb(var(--accent) / 0.1)` }}>
                    <p className="text-sm" style={{ color: `rgb(var(--foreground) / 0.7)` }}>No repository connected</p>
                    <button className="mt-2 text-sm transition-colors" style={{ color: `rgb(var(--primary))` }}>
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