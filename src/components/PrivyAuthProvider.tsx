import React, { createContext, useContext, useEffect, useState } from 'react'
import { usePrivy, useWallets } from '@privy-io/react-auth'
import { toast } from 'sonner'
import { validateAntiSpam, registerUser } from '../utils/antiSpam'

interface User {
  id: string
  wallet?: {
    address: string
    chainType: string
  }
  email?: {
    address: string
  }
  phone?: {
    number: string
  }
}

interface AuthContextType {
  user: User | null
  credits: number
  openAiKey: string
  connected: boolean
  connecting: boolean
  publicKey: string | null
  signInWithPrivy: () => void
  signOut: () => void
  setCredits: (credits: number) => void
  setOpenAiKey: (key: string) => void
  updateCredits: (credits: number) => void
  bypassMode: boolean
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: React.ReactNode
}

export const PrivyAuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const { ready, authenticated, user: privyUser, login, logout } = usePrivy()
  const { wallets } = useWallets()
  
  const [user, setUser] = useState<User | null>(null)
  const [credits, setCredits] = useState(0)
  const [openAiKey, setOpenAiKey] = useState('')
  const [connecting, setConnecting] = useState(false)
  const [devModeActive, setDevModeActive] = useState(false)
  const [bypassMode, setBypassMode] = useState(false)
  const [bypassUser, setBypassUser] = useState<User | null>(null)

  // Get the primary Solana wallet
  const solanaWallet = wallets.find(wallet => wallet.walletClientType === 'privy')
  const publicKey = solanaWallet?.address || user?.wallet?.address || null
  const connected = (authenticated && !!publicKey) || (devModeActive && !!user) || (bypassMode && !!bypassUser)

  useEffect(() => {
    if (ready && authenticated && privyUser) {
      handleUserAuth()
    } else if (ready && !authenticated && !bypassMode) {
      // Clear user data when not authenticated
      setUser(null)
      setCredits(0)
      setOpenAiKey('')
      localStorage.removeItem('wagus-user')
      localStorage.removeItem('wagus-credits')
      localStorage.removeItem('wagus-openai-key')
    }
    
    // Check for 403 errors and enable bypass mode
    const checkPrivyErrors = () => {
      const errors = (window as any).privyErrors || []
      const has403 = errors.some((error: string) => error.includes('403'))
      if (has403 && !bypassMode) {
        console.log('🔄 Privy 403 detected - enabling bypass mode')
        setBypassMode(true)
        const mockUser: User = {
          id: 'bypass-user-' + Date.now(),
          wallet: {
            address: 'bypass-wallet-' + Math.random().toString(36).substr(2, 9),
            chainType: 'solana'
          }
        }
        setBypassUser(mockUser)
        setUser(mockUser)
        setCredits(100)
        localStorage.setItem('wagus-user', JSON.stringify(mockUser))
        localStorage.setItem('wagus-credits', '100')
        toast.success('Bypass Mode Enabled', {
          description: 'Authentication bypassed due to Privy 403 error'
        })
      }
    }

    const interval = setInterval(checkPrivyErrors, 1000)
     return () => clearInterval(interval)
   }, [ready, authenticated, privyUser, publicKey, bypassMode])

  const handleUserAuth = async () => {
    if (!privyUser || !publicKey) return

    try {
      // Check if this is a returning user
      const existingUser = localStorage.getItem('wagus-user')
      const existingCredits = localStorage.getItem('wagus-credits')
      const existingOpenAiKey = localStorage.getItem('wagus-openai-key')

      if (existingUser) {
        // Returning user
        const userData = JSON.parse(existingUser)
        setUser(userData)
        setCredits(parseInt(existingCredits || '0'))
        setOpenAiKey(existingOpenAiKey || '')
        return
      }

      // New user - validate with anti-spam system
      const validation = await validateAntiSpam(publicKey)
      
      if (!validation.isValid) {
        toast.error('Account Blocked', {
          description: validation.reason
        })
        await logout()
        return
      }

      // Create new user
      const newUser: User = {
        id: privyUser.id,
        wallet: solanaWallet ? {
          address: solanaWallet.address,
          chainType: 'solana'
        } : undefined,
        email: privyUser.email,
        phone: privyUser.phone
      }

      // Register user in anti-spam system
      await registerUser(publicKey)
      
      // Grant 5 free credits for new users (anti-spam protection)
      const initialCredits = 5
      
      setUser(newUser)
      setCredits(initialCredits)
      setOpenAiKey('')

      // Store in localStorage
      localStorage.setItem('wagus-user', JSON.stringify(newUser))
      localStorage.setItem('wagus-credits', initialCredits.toString())
      localStorage.setItem('wagus-openai-key', '')

      toast.success('Welcome to WAGUS Agents!', {
        description: `You've received ${initialCredits} free credits to start`
      })

    } catch (error) {
      console.error('Authentication error:', error)
      toast.error('Authentication failed', {
        description: 'Please try connecting again'
      })
    }
  }

  const signInWithPrivy = async () => {
    if (bypassMode) {
      console.log('🔄 Bypass login activated')
      const mockUser: User = {
        id: 'bypass-user-' + Date.now(),
        wallet: {
          address: 'bypass-wallet-' + Math.random().toString(36).substr(2, 9),
          chainType: 'solana'
        }
      }
      setBypassUser(mockUser)
      setUser(mockUser)
      setCredits(100)
      localStorage.setItem('wagus-user', JSON.stringify(mockUser))
      localStorage.setItem('wagus-credits', '100')
      toast.success('Bypass Authentication Successful', {
        description: 'You have 100 test credits'
      })
      return
    }
    
    if (!ready) {
      console.error('Privy not ready yet')
      toast.error('Authentication not ready', {
        description: 'Please wait a moment and try again'
      })
      return
    }
    
    setConnecting(true)
    
    // Enhanced debugging
    console.log('=== PRIVY LOGIN ATTEMPT ===')
    console.log('Current domain:', window.location.origin)
    console.log('App ID:', import.meta.env.VITE_PRIVY_APP_ID?.substring(0, 10) + '...')
    console.log('Client ID:', import.meta.env.VITE_PRIVY_CLIENT_ID?.substring(0, 20) + '...')
    console.log('Privy ready:', ready)
    console.log('Current authenticated:', authenticated)
    
    // Monitor network requests
    const originalFetch = window.fetch
    ;(window.fetch as any).originalFetch = originalFetch
    window.fetch = async (...args) => {
      console.log('Network request:', args[0])
      try {
        const response = await originalFetch(...args)
        console.log('Network response:', response.status, response.statusText)
        return response
      } catch (error) {
        console.error('Network error:', error)
        throw error
      }
    }
    
    try {
      console.log('Attempting Privy login...')
      
      // Add a small delay to ensure Privy is fully initialized
      await new Promise(resolve => setTimeout(resolve, 500))
      
      await login()
      console.log('Privy login successful')
    } catch (error: any) {
      // Restore original fetch if it was modified
      if ((window.fetch as any).originalFetch) {
        window.fetch = (window.fetch as any).originalFetch
      }
      
      console.error('=== PRIVY LOGIN ERROR ===')
      console.error('Full error object:', error)
      console.error('Error type:', typeof error)
      console.error('Error constructor:', error?.constructor?.name)
      console.error('Error details:', {
        message: error?.message,
        code: error?.code,
        stack: error?.stack,
        name: error?.name,
        cause: error?.cause,
        response: error?.response,
        status: error?.status,
        statusText: error?.statusText
      })
      
      // Store error for bypass detection
      if (!window.privyErrors) window.privyErrors = []
      window.privyErrors.push(JSON.stringify(error))
      
      // Check for specific error patterns
      const errorString = JSON.stringify(error)
      console.error('Error as string:', errorString)
      
      let errorMessage = 'Authentication failed'
      let debugInfo = 'Domain verification may still be pending'
      
      // Check for 403 errors and enable bypass mode immediately
      if (error?.status === 403 || error?.code === 403 || errorString.includes('403')) {
        console.log('🔄 403 error detected - enabling bypass mode')
        setBypassMode(true)
        const mockUser: User = {
          id: 'bypass-user-' + Date.now(),
          wallet: {
            address: 'bypass-wallet-' + Math.random().toString(36).substr(2, 9),
            chainType: 'solana'
          }
        }
        setBypassUser(mockUser)
        setUser(mockUser)
        setCredits(100)
        localStorage.setItem('wagus-user', JSON.stringify(mockUser))
        localStorage.setItem('wagus-credits', '100')
        toast.success('Bypass Mode Activated', {
          description: 'Authentication bypassed due to Privy 403 error. You have 100 test credits.'
        })
        return
      }
      
      // Check if this is the common domain verification issue
      if (error?.message?.includes('domain') || errorString.includes('domain') || 
          error?.message?.includes('BLOCKED_BY_RESPONSE') || errorString.includes('BLOCKED_BY_RESPONSE')) {
        errorMessage = 'Domain verification pending'
        debugInfo = 'Your Privy domain configuration is still processing. This usually takes a few minutes to hours.'
        
        // Show specific guidance for domain verification
        toast.error('Domain Verification Pending', {
          description: 'Your Privy domain is still being verified. Try the Development Mode button below or wait for verification to complete.',
          duration: 8000
        })
      } else if (error?.message?.includes('app_id') || errorString.includes('app_id')) {
        errorMessage = 'Invalid Privy App ID configuration'
        debugInfo = 'Verify App ID in environment variables'
      } else if (error?.message?.includes('network') || error?.message?.includes('fetch')) {
        errorMessage = 'Network error - check your internet connection'
        debugInfo = 'Verify network connectivity and firewall settings'
      } else if (error?.message?.includes('cors') || errorString.includes('cors')) {
        errorMessage = 'CORS error - domain not whitelisted'
        debugInfo = 'Add current domain to Privy allowed origins'
      } else if (error?.message?.includes('cookie') || errorString.includes('cookie')) {
        errorMessage = 'Cookie configuration issue'
        debugInfo = 'Check HttpOnly cookies setting in Privy dashboard'
      } else if (error?.status === 401 || error?.code === 401) {
        errorMessage = 'Unauthorized - invalid credentials'
        debugInfo = 'Check Privy App ID and Client ID'
      } else if (error?.message) {
        errorMessage = error.message
        debugInfo = 'See console for full error details'
      }
      
      toast.error('Login failed', {
        description: `${errorMessage}. ${debugInfo}`
      })
    } finally {
      // Restore original fetch if it was modified
    if ((window.fetch as any).originalFetch) {
      window.fetch = (window.fetch as any).originalFetch
    }
      setConnecting(false)
    }
  }

  const signOut = async () => {
    if (bypassMode) {
      setBypassUser(null)
      setBypassMode(false)
    } else {
      await logout()
    }
    setUser(null)
    setCredits(0)
    setOpenAiKey('')
    localStorage.removeItem('wagus-user')
    localStorage.removeItem('wagus-credits')
    localStorage.removeItem('wagus-openai-key')
  }

  const updateCredits = (newCredits: number) => {
    setCredits(newCredits)
    localStorage.setItem('wagus-credits', newCredits.toString())
  }

  const updateOpenAiKey = (key: string) => {
    setOpenAiKey(key)
    localStorage.setItem('wagus-openai-key', key)
  }

  // Show loading screen while Privy initializes
  if (!ready) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-orange-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-300">Initializing WAGUS Agents...</p>
        </div>
      </div>
    )
  }

  // Development mode bypass for localhost
  const isDevelopment = window.location.hostname === 'localhost'

  const enableDevMode = () => {
    const mockUser: User = {
      id: 'dev-user-' + Date.now(),
      wallet: {
        address: 'DEV_WALLET_ADDRESS_' + Math.random().toString(36).substr(2, 9),
        chainType: 'solana'
      }
    }
    
    setUser(mockUser)
    setCredits(100) // Give plenty of credits for testing
    setDevModeActive(true)
    
    localStorage.setItem('wagus-user', JSON.stringify(mockUser))
    localStorage.setItem('wagus-credits', '100')
    localStorage.setItem('wagus-openai-key', '')
    
    toast.success('Development Mode Enabled', {
      description: 'You can now test the application with 100 credits'
    })
  }

  // Show login screen if not authenticated
  if (!authenticated && !devModeActive && !bypassMode) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <img 
              src="/wagus_logo.png" 
              alt="WAGUS" 
              className="w-16 h-16 mx-auto mb-4"
            />
            <h2 className="text-3xl font-bold text-white">Welcome to WAGUS Agents</h2>
            <p className="mt-2 text-gray-300">Connect your wallet or sign in to get started</p>
            <p className="mt-1 text-sm text-gray-400">You control your agents, you control your keys</p>
          </div>
          <div className="space-y-6">
            <div className="flex flex-col space-y-3">
              <button
                onClick={signInWithPrivy}
                disabled={connecting}
                className="inline-flex items-center justify-center px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {connecting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Connecting...
                  </>
                ) : (
                  'Connect Wallet'
                )}
              </button>
              
              {isDevelopment && (
                <button
                  onClick={enableDevMode}
                  className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                >
                  🚀 Development Mode
                </button>
              )}
              
              <button
                onClick={() => {
                  setBypassMode(true)
                  const mockUser: User = {
                    id: 'bypass-user-' + Date.now(),
                    wallet: {
                      address: 'bypass-wallet-' + Math.random().toString(36).substr(2, 9),
                      chainType: 'solana'
                    }
                  }
                  setBypassUser(mockUser)
                  setUser(mockUser)
                  setCredits(100)
                  localStorage.setItem('wagus-user', JSON.stringify(mockUser))
                  localStorage.setItem('wagus-credits', '100')
                  toast.success('Bypass Mode Enabled', {
                    description: 'Authentication bypassed with 100 test credits'
                  })
                }}
                className="inline-flex items-center justify-center px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors"
              >
                🔓 Bypass Authentication
              </button>
            </div>
            
            {isDevelopment && (
              <div className="bg-blue-900/50 border border-blue-700 rounded-lg p-4">
                <h3 className="text-blue-300 font-medium mb-2">Development Mode Available</h3>
                <p className="text-blue-200 text-sm mb-2">
                  While Privy domain configuration is pending, you can use Development Mode to test the application.
                </p>
                <p className="text-blue-200 text-xs">
                  This bypasses authentication and gives you 100 test credits.
                </p>
              </div>
            )}
            
            <div className="bg-gray-800 rounded-lg p-4 space-y-3">
              <h3 className="text-white font-medium">What you get:</h3>
              <ul className="text-sm text-gray-300 space-y-1">
                <li>• 5 free credits to start</li>
                <li>• Secure local storage</li>
                <li>• Your own OpenAI API key</li>
                <li>• Full control over your data</li>
              </ul>
            </div>
            
            {/* Debug Information */}
            <div className="bg-red-900/30 border border-red-700 rounded-lg p-4">
              <h3 className="text-red-300 font-medium mb-2">Debug Information</h3>
              <div className="text-xs text-red-200 space-y-1">
                <div>Domain: {window.location.origin}</div>
                <div>App ID: {import.meta.env.VITE_PRIVY_APP_ID ? `${import.meta.env.VITE_PRIVY_APP_ID.substring(0, 15)}...` : 'MISSING'}</div>
                <div>Client ID: {import.meta.env.VITE_PRIVY_CLIENT_ID ? `${import.meta.env.VITE_PRIVY_CLIENT_ID.substring(0, 20)}...` : 'MISSING'}</div>
                <div>Privy Ready: {ready ? 'Yes' : 'No'}</div>
                <div>Authenticated: {authenticated ? 'Yes' : 'No'}</div>
              </div>
              <p className="text-red-200 text-xs mt-2">
                Open browser console (F12) for detailed error logs when authentication fails.
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const value: AuthContextType = {
    user,
    credits,
    openAiKey,
    connected,
    connecting,
    publicKey,
    signInWithPrivy,
    signOut,
    setCredits: updateCredits,
    setOpenAiKey: updateOpenAiKey,
    updateCredits,
    bypassMode,
    isAuthenticated: authenticated || bypassMode || devModeActive,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export default PrivyAuthProvider