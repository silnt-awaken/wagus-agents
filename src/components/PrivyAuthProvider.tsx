import React, { createContext, useContext, useEffect, useState } from 'react'
import { usePrivy, useWallets } from '@privy-io/react-auth'
import { toast } from 'sonner'

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
  updateOpenAiKey: (key: string) => void
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

  // Get the primary Solana wallet
  const solanaWallet = wallets.find(wallet => wallet.walletClientType === 'privy')
  const publicKey = solanaWallet?.address || user?.wallet?.address || null
  const connected = authenticated && !!publicKey

  useEffect(() => {
    if (ready && authenticated && privyUser) {
      handleUserAuth()
    } else if (ready && !authenticated) {
      // Clear user data when not authenticated
      setUser(null)
      setCredits(0)
      setOpenAiKey('')
      localStorage.removeItem('wagus-user')
      localStorage.removeItem('wagus-credits')
      localStorage.removeItem('wagus-openai-key')
    }
   }, [ready, authenticated, privyUser, publicKey])

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
      
      // Grant 5 free credits for new users
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
    if (!ready) {
      toast.error('Authentication not ready', {
        description: 'Please wait a moment and try again'
      })
      return
    }
    
    setConnecting(true)
    
    try {
      await login()
    } catch (error: any) {
      console.error('Authentication error:', error)
      
      let errorMessage = 'Authentication failed'
      
      if (error?.message?.includes('domain')) {
        errorMessage = 'Domain verification pending'
      } else if (error?.message?.includes('app_id')) {
        errorMessage = 'Invalid Privy App ID configuration'
      } else if (error?.message?.includes('network') || error?.message?.includes('fetch')) {
        errorMessage = 'Network error - check your internet connection'
      } else if (error?.status === 401 || error?.code === 401) {
        errorMessage = 'Unauthorized - invalid credentials'
      } else if (error?.message) {
        errorMessage = error.message
      }
      
      toast.error('Login failed', {
        description: errorMessage
      })
    } finally {
      setConnecting(false)
    }
  }

  const signOut = async () => {
    await logout()
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



  // Let AuthGuard handle login screen - just provide the context
  const contextValue: AuthContextType = {
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
    updateOpenAiKey,
    isAuthenticated: authenticated && !!user
  }

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  )
}

export default PrivyAuthProvider