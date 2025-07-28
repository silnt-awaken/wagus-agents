import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { toast } from 'sonner'
import { 
  User, 
  Bell, 
  Shield, 
  Palette, 
  Database, 
  Key, 
  Globe, 
  Download, 
  Upload, 
  Trash2, 
  Save, 
  Eye, 
  EyeOff,
  ExternalLink,
  AlertTriangle
} from 'lucide-react'

interface SettingsSection {
  id: string
  title: string
  icon: React.ReactNode
  description: string
}

const Settings = () => {
  const { user, signOut, signMessage } = useAuth()
  const [activeSection, setActiveSection] = useState('profile')
  const [showApiKey, setShowApiKey] = useState(false)
  const [settings, setSettings] = useState({
    profile: {
      walletAddress: user?.publicKey || '',
      bio: '',
      timezone: 'UTC-8',
      language: 'en'
    },
    notifications: {
      emailNotifications: true,
      pushNotifications: true,
      commandUpdates: true,
      paymentAlerts: true,
      weeklyDigest: false
    },
    privacy: {
      profileVisibility: 'private',
      dataSharing: false,
      analyticsOptOut: false,
      twoFactorAuth: false
    },
    appearance: {
      theme: 'light',
      fontSize: 'medium',
      codeTheme: 'vs-dark',
      compactMode: false
    },
    integrations: {
      githubConnected: false,
      gitlabConnected: false,
      bitbucketConnected: false,
      slackConnected: false
    },
    api: {
      apiKey: 'sk-wagus-1234567890abcdef',
      rateLimitTier: 'premium',
      usageThisMonth: 1250,
      usageLimit: 5000
    }
  })

  const sections: SettingsSection[] = [
    {
      id: 'profile',
      title: 'Profile',
      icon: <User className="w-5 h-5" />,
      description: 'Manage your account information'
    },
    {
      id: 'notifications',
      title: 'Notifications',
      icon: <Bell className="w-5 h-5" />,
      description: 'Configure notification preferences'
    },
    {
      id: 'privacy',
      title: 'Privacy & Security',
      icon: <Shield className="w-5 h-5" />,
      description: 'Control your privacy and security settings'
    },
    {
      id: 'appearance',
      title: 'Appearance',
      icon: <Palette className="w-5 h-5" />,
      description: 'Customize the look and feel'
    },
    {
      id: 'integrations',
      title: 'Integrations',
      icon: <Globe className="w-5 h-5" />,
      description: 'Connect external services'
    },
    {
      id: 'api',
      title: 'API & Usage',
      icon: <Key className="w-5 h-5" />,
      description: 'Manage API access and usage'
    },
    {
      id: 'data',
      title: 'Data Management',
      icon: <Database className="w-5 h-5" />,
      description: 'Export, import, and manage your data'
    }
  ]

  const handleSave = () => {
    toast.success('Settings saved successfully')
  }

  const handleExportData = () => {
    toast.success('Data export started. You will receive an email when ready.')
  }

  const handleDeleteAccount = () => {
    if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      toast.error('Account deletion initiated. Please check your email for confirmation.')
    }
  }

  const renderProfileSettings = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-orange-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
            W
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-900">WAGUS User</h3>
            <p className="text-gray-600 font-mono text-sm">
              {user?.publicKey ? `${user.publicKey.slice(0, 8)}...${user.publicKey.slice(-8)}` : 'Not connected'}
            </p>
            <button className="text-sm text-orange-600 hover:text-orange-700 mt-1">
              Change Avatar
            </button>
          </div>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={async () => {
              const message = `Sign this message to verify your identity: ${Date.now()}`
              const signature = await signMessage(message)
              if (signature) {
                toast.success('Message signed successfully!')
                console.log('Signature:', signature)
              } else {
                toast.error('Failed to sign message')
              }
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Test Sign Message
          </button>
          <button
            onClick={signOut}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Sign Out
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Wallet Address
          </label>
          <input
            type="text"
            value={settings.profile.walletAddress}
            disabled
            className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 font-mono text-sm"
            placeholder="Connect your Phantom wallet"
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Bio
          </label>
          <textarea
            rows={3}
            value={settings.profile.bio}
            onChange={(e) => setSettings(prev => ({
              ...prev,
              profile: { ...prev.profile, bio: e.target.value }
            }))}
            placeholder="Tell us about yourself..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Timezone
          </label>
          <select
            value={settings.profile.timezone}
            onChange={(e) => setSettings(prev => ({
              ...prev,
              profile: { ...prev.profile, timezone: e.target.value }
            }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          >
            <option value="UTC-8">Pacific Time (UTC-8)</option>
            <option value="UTC-5">Eastern Time (UTC-5)</option>
            <option value="UTC+0">UTC</option>
            <option value="UTC+1">Central European Time (UTC+1)</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Language
          </label>
          <select
            value={settings.profile.language}
            onChange={(e) => setSettings(prev => ({
              ...prev,
              profile: { ...prev.profile, language: e.target.value }
            }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          >
            <option value="en">English</option>
            <option value="es">Español</option>
            <option value="fr">Français</option>
            <option value="de">Deutsch</option>
          </select>
        </div>
      </div>
    </div>
  )

  const renderNotificationSettings = () => (
    <div className="space-y-6">
      {Object.entries(settings.notifications).map(([key, value]) => (
        <div key={key} className="flex items-center justify-between">
          <div>
            <h4 className="font-medium text-gray-900 capitalize">
              {key.replace(/([A-Z])/g, ' $1').trim()}
            </h4>
            <p className="text-sm text-gray-600">
              {key === 'emailNotifications' && 'Receive notifications via email'}
              {key === 'pushNotifications' && 'Receive browser push notifications'}
              {key === 'commandUpdates' && 'Get notified when commands complete'}
              {key === 'paymentAlerts' && 'Alerts for payment transactions'}
              {key === 'weeklyDigest' && 'Weekly summary of your activity'}
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={value}
              onChange={(e) => setSettings(prev => ({
                ...prev,
                notifications: { ...prev.notifications, [key]: e.target.checked }
              }))}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
          </label>
        </div>
      ))}
    </div>
  )

  const renderApiSettings = () => (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center space-x-2 mb-2">
          <Key className="w-5 h-5 text-blue-600" />
          <h4 className="font-medium text-blue-900">API Access</h4>
        </div>
        <p className="text-sm text-blue-700">
          Use your API key to integrate Scout.New with external applications.
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          API Key
        </label>
        <div className="flex items-center space-x-2">
          <input
            type={showApiKey ? 'text' : 'password'}
            value={settings.api.apiKey}
            readOnly
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 font-mono text-sm"
          />
          <button
            onClick={() => setShowApiKey(!showApiKey)}
            className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
          <button className="px-3 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700">
            Regenerate
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-1">Current Tier</h4>
          <p className="text-2xl font-bold text-orange-600 capitalize">{settings.api.rateLimitTier}</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-1">Usage This Month</h4>
          <p className="text-2xl font-bold text-gray-900">{settings.api.usageThisMonth.toLocaleString()}</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-1">Usage Limit</h4>
          <p className="text-2xl font-bold text-gray-900">{settings.api.usageLimit.toLocaleString()}</p>
        </div>
      </div>

      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Usage Progress</span>
          <span className="text-sm text-gray-600">
            {Math.round((settings.api.usageThisMonth / settings.api.usageLimit) * 100)}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-orange-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(settings.api.usageThisMonth / settings.api.usageLimit) * 100}%` }}
          ></div>
        </div>
      </div>
    </div>
  )

  const renderDataSettings = () => (
    <div className="space-y-6">
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-center space-x-2 mb-2">
          <AlertTriangle className="w-5 h-5 text-yellow-600" />
          <h4 className="font-medium text-yellow-900">Data Management</h4>
        </div>
        <p className="text-sm text-yellow-700">
          Manage your data exports, imports, and account deletion.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="border border-gray-200 rounded-lg p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Download className="w-6 h-6 text-green-600" />
            <h3 className="font-medium text-gray-900">Export Data</h3>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Download all your data including contexts, commands, and settings.
          </p>
          <button
            onClick={handleExportData}
            className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Export All Data
          </button>
        </div>

        <div className="border border-gray-200 rounded-lg p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Upload className="w-6 h-6 text-blue-600" />
            <h3 className="font-medium text-gray-900">Import Data</h3>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Import previously exported data or migrate from another platform.
          </p>
          <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Import Data
          </button>
        </div>
      </div>

      <div className="border border-red-200 rounded-lg p-6 bg-red-50">
        <div className="flex items-center space-x-3 mb-4">
          <Trash2 className="w-6 h-6 text-red-600" />
          <h3 className="font-medium text-red-900">Delete Account</h3>
        </div>
        <p className="text-sm text-red-700 mb-4">
          Permanently delete your account and all associated data. This action cannot be undone.
        </p>
        <button
          onClick={handleDeleteAccount}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          Delete Account
        </button>
      </div>
    </div>
  )

  const renderContent = () => {
    switch (activeSection) {
      case 'profile':
        return renderProfileSettings()
      case 'notifications':
        return renderNotificationSettings()
      case 'api':
        return renderApiSettings()
      case 'data':
        return renderDataSettings()
      default:
        return (
          <div className="text-center py-12">
            <p className="text-gray-600">Settings for {activeSection} coming soon...</p>
          </div>
        )
    }
  }

  return (
    <div className="flex h-full">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 flex-shrink-0">
        <div className="p-6">
          <h1 className="text-xl font-bold text-gray-900">Settings</h1>
        </div>
        <nav className="px-3">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                activeSection === section.id
                  ? 'bg-orange-50 text-orange-700 border-r-2 border-orange-600'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              {section.icon}
              <div>
                <div className="font-medium">{section.title}</div>
                <div className="text-xs text-gray-500">{section.description}</div>
              </div>
            </button>
          ))}
        </nav>
        
        <div className="absolute bottom-6 left-3 right-3">
          <button
            onClick={signOut}
            className="w-full px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-left"
          >
            Sign Out
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-6">
          <div className="max-w-4xl">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {sections.find(s => s.id === activeSection)?.title}
                </h2>
                <p className="text-gray-600">
                  {sections.find(s => s.id === activeSection)?.description}
                </p>
              </div>
              {['profile', 'notifications', 'privacy', 'appearance'].includes(activeSection) && (
                <button
                  onClick={handleSave}
                  className="flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </button>
              )}
            </div>
            
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Settings