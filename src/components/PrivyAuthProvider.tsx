import React, { createContext, useContext, useEffect, useState } from 'react'
import { usePrivy, useWallets } from '@privy-io/react-auth'
import { useSolanaWallets } from '@privy-io/react-auth/solana'
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
  const { createWallet, wallets: solanaWallets } = useSolanaWallets()
  
  const [user, setUser] = useState<User | null>(null)
  const [credits, setCredits] = useState(0)
  const [openAiKey, setOpenAiKey] = useState('')
  const [connecting, setConnecting] = useState(false)
  const [walletCreationAttempted, setWalletCreationAttempted] = useState(false)
  
  // Debug: Log both wallet sources
  useEffect(() => {
    console.log('=== WALLET COMPARISON ===')
    console.log('useWallets() returned:', wallets.length, 'wallets')
    console.log('useSolanaWallets() returned:', solanaWallets?.length || 0, 'wallets')
    if (solanaWallets && solanaWallets.length > 0) {
      console.log('Solana wallets from useSolanaWallets():', solanaWallets)
    }
    console.log('========================')
  }, [wallets, solanaWallets])

  // Debug all wallets to see what Privy is providing
  useEffect(() => {
    console.log('=== ALL WALLETS FROM PRIVY ===')
    console.log('Wallet count:', wallets.length)
    wallets.forEach((wallet, index) => {
      console.log(`Wallet ${index}:`, {
        address: wallet.address,
        connectorType: wallet.connectorType,
        walletClientType: wallet.walletClientType,
        chainId: (wallet as any).chainId,
        chainType: (wallet as any).chainType,
        isEmbedded: wallet.connectorType === 'embedded',
        addressFormat: wallet.address?.startsWith('0x') ? 'EVM' : 'Solana',
        allProperties: wallet
      })
    })
    console.log('==============================')
  }, [wallets])

  // Try multiple methods to find Solana wallet
  const allWallets = [...wallets, ...(solanaWallets || [])]
  const solanaWallet = allWallets.find(wallet => {
    // Only select Solana wallets (44 chars, no 0x prefix)
    return wallet.address?.length === 44 && !wallet.address?.startsWith('0x')
  })
  
  // Also check if privyUser has a Solana address directly
  const privySolanaAddress = privyUser?.wallet?.address && 
    privyUser.wallet.address.length === 44 && 
    !privyUser.wallet.address.startsWith('0x') 
    ? privyUser.wallet.address 
    : null
  
  const publicKey = solanaWallet?.address || privySolanaAddress || null
  const connected = authenticated && !!publicKey
  
  // Debug wallet info - only log when wallet status changes
  useEffect(() => {
    if (wallets.length > 0 && !walletCreationAttempted) {
      console.log('Wallet status:', {
        walletCount: wallets.length,
        hasSolanaWallet: !!solanaWallet,
        hasEthereumWallet: wallets.some(w => w.address?.startsWith('0x')),
        selectedWallet: solanaWallet ? 'Solana' : 'None'
      })
    }
  }, [wallets.length, solanaWallet, walletCreationAttempted])

  // Wait for Solana wallet to appear after authentication
  useEffect(() => {
    if (!ready || !authenticated) return
    
    let checkCount = 0
    const maxChecks = 10 // Check up to 10 times
    
    const checkForSolanaWallet = () => {
      const hasSolanaWallet = allWallets.some(w => 
        w.address?.length === 44 && !w.address?.startsWith('0x')
      )
      const hasEthereumWallet = allWallets.some(w => w.address?.startsWith('0x'))
      
      console.log(`Wallet check #${checkCount + 1}:`, {
        authenticated,
        walletCount: allWallets.length,
        hasSolanaWallet,
        hasEthereumWallet,
        solanaWallet: solanaWallet?.address,
        privySolanaAddress
      })
      
      checkCount++
      
      // If we found a Solana wallet or reached max checks, stop
      if (hasSolanaWallet || checkCount >= maxChecks) {
        if (!hasSolanaWallet && checkCount >= maxChecks) {
          console.error('❌ No Solana wallet found after', maxChecks, 'checks')
          console.error('Make sure Solana is enabled in your Privy dashboard')
        }
        return
      }
      
      // Check again in 1 second
      setTimeout(checkForSolanaWallet, 1000)
    }
    
    // Start checking after a small delay
    setTimeout(checkForSolanaWallet, 500)
  }, [ready, authenticated])

  useEffect(() => {
    console.log('🔍 PrivyAuthProvider useEffect:', {
      ready,
      authenticated,
      privyUser: !!privyUser,
      publicKey,
      walletsLength: wallets.length,
      solanaWallet: !!solanaWallet
    })
    
    if (ready && authenticated && privyUser) {
      console.log('✅ Calling handleUserAuth')
      handleUserAuth()
    } else if (ready && !authenticated) {
      console.log('🔄 Clearing user data - not authenticated')
      // Clear user data when not authenticated
      setUser(null)
      setCredits(0)
      setOpenAiKey('')
      localStorage.removeItem('wagus-user')
      localStorage.removeItem('wagus-credits')
      localStorage.removeItem('wagus-openai-key')
    } else {
      console.log('⏳ Waiting for Privy to be ready or authentication')
    }
   }, [ready, authenticated, privyUser, publicKey])

  const handleUserAuth = async () => {
    console.log('🔐 handleUserAuth called:', { privyUser: !!privyUser, publicKey })
    
    if (!privyUser || !publicKey) {
      console.log('❌ Missing privyUser or publicKey:', { privyUser: !!privyUser, publicKey })
      return
    }

    try {
      console.log('🔍 Checking for existing user data')
      // Check if this is a returning user
      const existingUser = localStorage.getItem('wagus-user')
      const existingCredits = localStorage.getItem('wagus-credits')
      const existingOpenAiKey = localStorage.getItem('wagus-openai-key')

      if (existingUser) {
        console.log('👤 Found existing user, loading data')
        // Returning user
        const userData = JSON.parse(existingUser)
        setUser(userData)
        setCredits(parseInt(existingCredits || '0'))
        setOpenAiKey(existingOpenAiKey || '')
        console.log('✅ Existing user data loaded successfully')
        return
      }

      console.log('🆕 Creating new user')
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
      
      console.log('💰 Granting initial credits')
      // Grant 5 free credits for new users
      const initialCredits = 5
      
      setUser(newUser)
      setCredits(initialCredits)
      setOpenAiKey('')

      // Store in localStorage
      localStorage.setItem('wagus-user', JSON.stringify(newUser))
      localStorage.setItem('wagus-credits', initialCredits.toString())
      localStorage.setItem('wagus-openai-key', '')

      console.log('🎉 New user created successfully')
      toast.success('Welcome to WAGUS Agents!', {
        description: `You've received ${initialCredits} free credits to start`
      })

    } catch (error) {
      console.error('❌ Authentication error:', error)
      toast.error('Authentication failed', {
        description: 'Please try connecting again'
      })
    }
  }

  const signInWithPrivy = async () => {
    console.log('🚀 signInWithPrivy called, ready:', ready)
    
    if (!ready) {
      console.log('❌ Privy not ready yet')
      toast.error('Authentication not ready', {
        description: 'Please wait a moment and try again'
      })
      return
    }
    
    console.log('🔄 Setting connecting to true')
    setConnecting(true)
    
    try {
      console.log('📞 Calling Privy login()')
      await login()
      console.log('✅ Privy login() completed successfully')
    } catch (error: any) {
      console.error('❌ Authentication error:', error)
      
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
      
      console.log('🚨 Login error message:', errorMessage)
      toast.error('Login failed', {
        description: errorMessage
      })
    } finally {
      console.log('🔄 Setting connecting to false')
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