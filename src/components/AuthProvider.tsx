import { createContext, useContext, useEffect, useState } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'

interface User {
  publicKey: string
  credits: number
  openAiKey: string
}

interface AuthContextType {
  user: User | null
  loading: boolean
  credits: number
  openAiKey: string
  signInWithPhantom: () => Promise<void>
  signOut: () => Promise<void>
  signMessage: (message: string) => Promise<Uint8Array | null>
  updateCredits: (amount: number) => void
  updateOpenAiKey: (key: string) => void
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

const AuthProvider = ({ children }: AuthProviderProps) => {
  const { publicKey, connected, disconnect, signMessage: walletSignMessage } = useWallet()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [credits, setCredits] = useState(0)
  const [openAiKey, setOpenAiKey] = useState('')

  // Load user data from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('wagus-user')
    const savedCredits = localStorage.getItem('wagus-credits')
    const savedOpenAiKey = localStorage.getItem('wagus-openai-key')
    
    if (savedUser && publicKey) {
      const userData = JSON.parse(savedUser)
      if (userData.publicKey === publicKey.toString()) {
        setUser(userData)
        setCredits(savedCredits ? parseInt(savedCredits) : 100) // Default 100 credits
        setOpenAiKey(savedOpenAiKey || '')
      }
    } else if (publicKey && connected) {
      // New user
      const newUser = {
        publicKey: publicKey.toString(),
        credits: 100,
        openAiKey: ''
      }
      setUser(newUser)
      setCredits(100)
      localStorage.setItem('wagus-user', JSON.stringify(newUser))
      localStorage.setItem('wagus-credits', '100')
    }
    setLoading(false)
  }, [publicKey, connected])

  const signInWithPhantom = async () => {
    // This is handled by the wallet adapter
  }

  const signOut = async () => {
    await disconnect()
    setUser(null)
    setCredits(0)
    setOpenAiKey('')
    localStorage.removeItem('wagus-user')
    localStorage.removeItem('wagus-credits')
    localStorage.removeItem('wagus-openai-key')
  }

  const signMessage = async (message: string): Promise<Uint8Array | null> => {
    if (!walletSignMessage || !connected) {
      console.error('Wallet not connected or does not support message signing')
      return null
    }

    try {
      const encodedMessage = new TextEncoder().encode(message)
      const signature = await walletSignMessage(encodedMessage)
      return signature
    } catch (error) {
      console.error('Failed to sign message:', error)
      return null
    }
  }

  const updateCredits = (amount: number) => {
    // Credits can only be updated through verified blockchain transactions
    // This function is now only called internally after successful WAGUS token transfers
    if (amount <= 0) return // Only allow positive credit additions from verified payments
    
    const newCredits = credits + amount
    setCredits(newCredits)
    localStorage.setItem('wagus-credits', newCredits.toString())
    if (user) {
      const updatedUser = { ...user, credits: newCredits }
      setUser(updatedUser)
      localStorage.setItem('wagus-user', JSON.stringify(updatedUser))
    }
  }

  const updateOpenAiKey = (key: string) => {
    setOpenAiKey(key)
    localStorage.setItem('wagus-openai-key', key)
    if (user) {
      const updatedUser = { ...user, openAiKey: key }
      setUser(updatedUser)
      localStorage.setItem('wagus-user', JSON.stringify(updatedUser))
    }
  }

  const value = {
    user,
    loading,
    credits,
    openAiKey,
    signInWithPhantom,
    signOut,
    signMessage,
    updateCredits,
    updateOpenAiKey
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <div className="w-24 h-24 mx-auto mb-6">
            <svg viewBox="0 0 100 100" className="w-full h-full text-white">
              <path d="M20 20 L80 20 L70 80 L30 80 Z" fill="currentColor" />
              <path d="M35 35 L45 35 L40 65 L30 65 Z" fill="#1a1a1a" />
              <path d="M55 35 L65 35 L70 65 L60 65 Z" fill="#1a1a1a" />
              <path d="M45 45 L55 45 L50 60 L45 60 Z" fill="#1a1a1a" />
            </svg>
          </div>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-300">Loading WAGUS Agents...</p>
        </div>
      </div>
    )
  }

  if (!user || !connected) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="max-w-md w-full space-y-8 p-8">
          <div className="text-center">
            <div className="w-24 h-24 mx-auto mb-6">
              <svg viewBox="0 0 100 100" className="w-full h-full text-white">
                <path d="M20 20 L80 20 L70 80 L30 80 Z" fill="currentColor" />
                <path d="M35 35 L45 35 L40 65 L30 65 Z" fill="#1a1a1a" />
                <path d="M55 35 L65 35 L70 65 L60 65 Z" fill="#1a1a1a" />
                <path d="M45 45 L55 45 L50 60 L45 60 Z" fill="#1a1a1a" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-white">Welcome to WAGUS Agents</h2>
            <p className="mt-2 text-gray-300">Connect your Phantom wallet to get started</p>
            <p className="mt-1 text-sm text-gray-400">You control your agents, you control your keys</p>
          </div>
          <div className="space-y-6">
            <div className="flex justify-center">
              <WalletMultiButton className="!bg-orange-600 hover:!bg-orange-700 !rounded-lg !font-medium !transition-colors" />
            </div>
            <div className="bg-gray-800 rounded-lg p-4 space-y-3">
              <h3 className="text-white font-medium">What you get:</h3>
              <ul className="text-sm text-gray-300 space-y-1">
                <li>• 100 free credits to start</li>
                <li>• Secure local storage</li>
                <li>• Your own OpenAI API key</li>
                <li>• Full control over your data</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export default AuthProvider