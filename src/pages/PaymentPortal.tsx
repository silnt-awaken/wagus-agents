import { useState, useEffect, useMemo } from 'react'
import { useWallet, useConnection } from '@solana/wallet-adapter-react'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import { 
  PublicKey, 
  LAMPORTS_PER_SOL, 
  Transaction as SolanaTransaction,
  SystemProgram,
  ConfirmOptions
} from '@solana/web3.js'
import { 
  getAssociatedTokenAddress,
  createTransferInstruction,
  TOKEN_PROGRAM_ID,
  getAccount,
  TokenAccountNotFoundError,
  TokenInvalidAccountOwnerError
} from '@solana/spl-token'
import { 
  Wallet, 
  CreditCard, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  XCircle, 
  RefreshCw,
  Send,
  History,
  ExternalLink,
  AlertTriangle,
  DollarSign
} from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '../components/AuthProvider'

interface Token {
  symbol: string
  name: string
  mint?: string
  decimals: number
  balance: number
  usdPrice: number
  logo: string
  coingeckoId?: string
}

interface PaymentTransaction {
  id: string
  type: 'credit_purchase' | 'command_payment'
  token: string
  amount: number
  usdValue: number
  creditsEarned?: number
  status: 'pending' | 'confirmed' | 'failed'
  timestamp: string
  signature?: string
  confirmations?: number
}

interface CreditPackage {
  id: string
  credits: number
  usdValue: number
  popular?: boolean
}

interface PremiumFeature {
  id: string
  name: string
  description: string
  wagusPrice: number
  category: 'theme' | 'command' | 'feature'
  icon: string
}

const PaymentPortal = () => {
  const { publicKey, connected, sendTransaction } = useWallet()
  const { connection } = useConnection()
  const { credits, updateCredits } = useAuth()
  const [tokens, setTokens] = useState<Token[]>([])
  const [transactions, setTransactions] = useState<PaymentTransaction[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isPriceLoading, setPriceLoading] = useState(false)
  const [wagusBalance, setWagusBalance] = useState(0)
  const [ownedFeatures, setOwnedFeatures] = useState<string[]>(() => {
    const saved = localStorage.getItem('wagus-owned-features')
    return saved ? JSON.parse(saved) : []
  })
  const [showAllFeatures, setShowAllFeatures] = useState(false)

  // WAGUS token mint address - Production WAGUS token
  const WAGUS_MINT = import.meta.env.VITE_WAGUS_MINT || '7BMxgTQhTthoBcQizzFoLyhmSDscM56uMramXGMhpump'
  const USDC_MINT = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v' // USDC mainnet
  
  // WAGUS LLC Treasury wallet for receiving payments
  const WAGUS_TREASURY = import.meta.env.VITE_WAGUS_TREASURY || 'DZuJUNmVxNQwq55wrrrpFeE4PES1cyBv2bxuSqm7UXdj' // Real treasury wallet

  // Credit packages with real WAGUS pricing
  // WAGUS Internal Economic Model State
  const [wagusPrice, setWagusPrice] = useState(0.001) // Internal calculated price
  const [lastPriceUpdate, setLastPriceUpdate] = useState<Date | null>(null)
  const [treasuryValue, setTreasuryValue] = useState(50000) // USD value in treasury
  const [circulatingSupply, setCirculatingSupply] = useState(10000000) // Total WAGUS in circulation
  const [totalStaked, setTotalStaked] = useState(2000000) // WAGUS tokens staked
  const [dailyVolume, setDailyVolume] = useState(5000) // Daily transaction volume
  const [burnedTokens, setBurnedTokens] = useState(100000) // Total burned tokens
  const [demandMultiplier, setDemandMultiplier] = useState(1.2) // Usage-based demand factor

  // Credit packages with fixed USD pricing - payable with USDC or SOL
  const creditPackages: CreditPackage[] = [
    {
      id: 'starter',
      credits: 100,
      usdValue: 10.00
    },
    {
      id: 'pro',
      credits: 500,
      usdValue: 40.00,
      popular: true
    },
    {
      id: 'enterprise',
      credits: 1000,
      usdValue: 75.00
    },
    {
      id: 'premium',
      credits: 2500,
      usdValue: 175.00
    }
  ]

  // Premium features purchasable with WAGUS
  const premiumFeatures: PremiumFeature[] = [
    {
      id: 'prompt_optimizer',
      name: 'Prompt Optimizer Pro',
      description: 'AI-powered prompt optimization with format conversion (MD, XML, JSON, TXT)',
      wagusPrice: 10000,
      category: 'feature',
      icon: '🧠'
    },
    {
      id: 'dark_theme',
      name: 'Dark Theme Pro',
      description: 'Premium dark theme with custom colors',
      wagusPrice: 1000,
      category: 'theme',
      icon: '🌙'
    },
    {
      id: 'neon_theme',
      name: 'Neon Theme',
      description: 'Cyberpunk-inspired neon theme',
      wagusPrice: 1500,
      category: 'theme',
      icon: '⚡'
    },
    {
      id: 'minimal_theme',
      name: 'Minimal Clean Theme',
      description: 'Clean and minimalist design',
      wagusPrice: 800,
      category: 'theme',
      icon: '✨'
    },
    {
      id: 'cyberpunk_theme',
      name: 'Cyberpunk Theme',
      description: 'Futuristic cyberpunk aesthetic',
      wagusPrice: 2000,
      category: 'theme',
      icon: '🔮'
    },
    {
      id: 'matrix_theme',
      name: 'Matrix Theme',
      description: 'Falling green code rain effect',
      wagusPrice: 2500,
      category: 'theme',
      icon: '💚'
    },
    {
      id: 'advanced_commands',
      name: 'Advanced AI Commands',
      description: 'Access to premium AI command suite',
      wagusPrice: 5000,
      category: 'command',
      icon: '🤖'
    },
    {
      id: 'priority_processing',
      name: 'Priority Processing',
      description: 'Skip queues and get faster responses',
      wagusPrice: 2500,
      category: 'feature',
      icon: '⚡'
    },
    {
      id: 'custom_themes',
      name: 'Custom Theme Builder',
      description: 'Create and customize your own themes',
      wagusPrice: 3500,
      category: 'theme',
      icon: '🎨'
    },
    {
      id: 'ai_assistant',
      name: 'Personal AI Assistant',
      description: 'Dedicated AI assistant for complex tasks',
      wagusPrice: 7500,
      category: 'feature',
      icon: '🤖'
    },
    {
      id: 'code_analyzer',
      name: 'Advanced Code Analyzer',
      description: 'Deep code analysis and optimization suggestions',
      wagusPrice: 6000,
      category: 'feature',
      icon: '🔍'
    },
    {
      id: 'export_tools',
      name: 'Export & Integration Tools',
      description: 'Export data and integrate with external services',
      wagusPrice: 4000,
      category: 'feature',
      icon: '📤'
    }
  ]

  useEffect(() => {
    // Initialize tokens with CoinGecko IDs for real-time pricing
    setTokens([
      {
        symbol: 'SOL',
        name: 'Solana',
        decimals: 9,
        balance: 0,
        usdPrice: 0,
        logo: '🟣',
        coingeckoId: 'solana'
      },
      {
        symbol: 'USDC',
        name: 'USD Coin',
        mint: USDC_MINT,
        decimals: 6,
        balance: 0,
        usdPrice: 1.00,
        logo: '💵',
        coingeckoId: 'usd-coin'
      },
      {
        symbol: 'WAGUS',
        name: 'WAGUS Token',
        mint: WAGUS_MINT,
        decimals: 6,
        balance: 0,
        usdPrice: 0,
        logo: '🐕',
        coingeckoId: 'wagus' // Replace with actual CoinGecko ID when listed
      }
    ])

    // Load transaction history from localStorage
    const savedTransactions = localStorage.getItem('wagus-transactions')
    if (savedTransactions) {
      setTransactions(JSON.parse(savedTransactions))
    }

    // Initialize WAGUS economic model and fetch external prices
    fetchTokenPrices()

    // Set up automatic economic updates every 60 seconds
    const economicUpdateInterval = setInterval(() => {
      console.log('Auto-updating WAGUS economic model...')
      fetchTokenPrices()
    }, 60000) // 60 seconds for economic model updates

    // Cleanup interval on component unmount
    return () => {
      clearInterval(economicUpdateInterval)
    }
  }, [])

  // WAGUS Internal Economic Engine - Calculate intrinsic value
  const calculateWagusPrice = (): number => {
    console.log('Calculating WAGUS intrinsic value using internal economic model...')
    
    // Base price calculation: Treasury Value / Effective Circulating Supply
    const effectiveSupply = circulatingSupply - totalStaked - burnedTokens
    const basePrice = treasuryValue / effectiveSupply
    
    // Apply demand multiplier based on usage patterns
    const volumeBonus = Math.min(dailyVolume / 10000, 0.5) // Max 50% bonus from volume
    const stakingBonus = (totalStaked / circulatingSupply) * 0.3 // Up to 30% bonus from staking
    const burnBonus = (burnedTokens / circulatingSupply) * 0.4 // Up to 40% bonus from burns
    
    const totalMultiplier = demandMultiplier + volumeBonus + stakingBonus + burnBonus
    const calculatedPrice = basePrice * totalMultiplier
    
    // Apply minimum price floor and maximum growth rate
    const minPrice = 0.0001 // $0.0001 minimum
    const maxPrice = 1.0 // $1.00 maximum for initial phase
    const finalPrice = Math.max(minPrice, Math.min(maxPrice, calculatedPrice))
    
    console.log('WAGUS Economic Calculation:', {
      treasuryValue,
      effectiveSupply,
      basePrice,
      totalMultiplier,
      calculatedPrice,
      finalPrice
    })
    
    return finalPrice
  }

  // Simulate treasury operations and economic activity
  const updateEconomicMetrics = () => {
    console.log('Updating WAGUS economic metrics...')
    
    // Simulate treasury growth from platform revenue (2-5% daily)
    const treasuryGrowth = treasuryValue * (0.02 + Math.random() * 0.03)
    setTreasuryValue(prev => prev + treasuryGrowth)
    
    // Simulate token burns from transaction fees (0.1-0.5% of daily volume)
    const burnAmount = dailyVolume * (0.001 + Math.random() * 0.004)
    setBurnedTokens(prev => prev + burnAmount)
    
    // Simulate staking changes (±1-3% daily)
    const stakingChange = totalStaked * (Math.random() * 0.06 - 0.03)
    setTotalStaked(prev => Math.max(0, prev + stakingChange))
    
    // Simulate volume fluctuations (±10-30% daily)
    const volumeChange = dailyVolume * (Math.random() * 0.6 - 0.3)
    setDailyVolume(prev => Math.max(1000, prev + volumeChange))
    
    // Update demand multiplier based on platform activity
    const activityScore = (dailyVolume / 5000) * (totalStaked / circulatingSupply) * 2
    setDemandMultiplier(1.0 + Math.min(activityScore, 1.0))
    
    console.log('Economic metrics updated:', {
      treasuryValue: treasuryValue + treasuryGrowth,
      burnedTokens: burnedTokens + burnAmount,
      dailyVolume: dailyVolume + volumeChange,
      demandMultiplier: 1.0 + Math.min(activityScore, 1.0)
    })
  }

  // Update token prices using internal economic engine for WAGUS
  const fetchTokenPrices = async () => {
    setPriceLoading(true)
    console.log('Updating token prices with internal WAGUS economic model...')
    
    try {
      // Fetch SOL and USDC prices from CoinGecko
      const response = await fetch(
        'https://api.coingecko.com/api/v3/simple/price?ids=solana,usd-coin&vs_currencies=usd',
        {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          },
        }
      )
      
      let prices = {}
      if (response.ok) {
        prices = await response.json()
        console.log('Fetched CoinGecko prices:', prices)
      } else {
        console.log('CoinGecko API unavailable, using fallback prices')
      }
      
      // Update economic metrics and calculate WAGUS price internally
      updateEconomicMetrics()
      const currentWagusPrice = calculateWagusPrice()
      setWagusPrice(currentWagusPrice)
      setLastPriceUpdate(new Date())
      console.log('WAGUS price calculated internally:', currentWagusPrice)
      
      setTokens(prev => prev.map(token => {
        if (token.coingeckoId && prices[token.coingeckoId]) {
          const newPrice = prices[token.coingeckoId].usd
          console.log(`Updated ${token.symbol} price to $${newPrice}`)
          return { ...token, usdPrice: newPrice }
        }
        // Use internally calculated WAGUS price
        if (token.symbol === 'WAGUS') {
          return { ...token, usdPrice: currentWagusPrice }
        }
        // Fallback prices for SOL and USDC if API fails
        if (token.symbol === 'SOL' && !prices['solana']) {
          return { ...token, usdPrice: 100 } // Fallback SOL price
        }
        if (token.symbol === 'USDC') {
          return { ...token, usdPrice: 1.00 } // USDC is always $1
        }
        return token
      }))
      
      console.log('Token prices updated successfully')
      toast.success(`WAGUS economic model updated! Focus on utility and features.`)
      
    } catch (error) {
      console.error('Error updating token prices:', error)
      
      // Even if external APIs fail, we can still calculate WAGUS price internally
      updateEconomicMetrics()
      const currentWagusPrice = calculateWagusPrice()
      setWagusPrice(currentWagusPrice)
      setLastPriceUpdate(new Date())
      
      setTokens(prev => prev.map(token => {
        if (token.symbol === 'WAGUS') {
          return { ...token, usdPrice: currentWagusPrice }
        }
        if (token.symbol === 'SOL') {
          return { ...token, usdPrice: 100 } // Fallback SOL price
        }
        if (token.symbol === 'USDC') {
          return { ...token, usdPrice: 1.00 } // USDC is always $1
        }
        return token
      }))
      
      toast.success(`WAGUS economic model updated! Explore premium features.`)
    } finally {
      setPriceLoading(false)
    }
  }

  useEffect(() => {
    if (connected && publicKey) {
      fetchBalances()
    }
  }, [connected, publicKey])

  const fetchBalances = async () => {
    if (!publicKey) {
      console.log('No public key available for balance fetching')
      return
    }

    setIsLoading(true)
    console.log('Fetching balances for wallet:', publicKey.toString())
    console.log('Using RPC endpoint:', connection.rpcEndpoint)
    
    try {
      // Test connection first
      console.log('Testing RPC connection...')
      const slot = await connection.getSlot()
      console.log('RPC connection successful, current slot:', slot)
      
      // Fetch SOL balance
      console.log('Fetching SOL balance...')
      const solBalance = await connection.getBalance(publicKey)
      console.log('SOL balance:', solBalance / LAMPORTS_PER_SOL)
      
      // Fetch real WAGUS token balance from blockchain
      let wagusBalance = 0
      try {
        console.log('Fetching WAGUS balance...')
        const wagusTokenAccount = await getAssociatedTokenAddress(
          new PublicKey(WAGUS_MINT),
          publicKey
        )
        console.log('WAGUS token account:', wagusTokenAccount.toString())
        
        // Check if the token account exists
        const accountInfo = await connection.getAccountInfo(wagusTokenAccount)
        if (accountInfo) {
          const tokenAccountInfo = await getAccount(connection, wagusTokenAccount)
          wagusBalance = Number(tokenAccountInfo.amount) / Math.pow(10, 6) // WAGUS has 6 decimals
          console.log('WAGUS balance:', wagusBalance)
        } else {
          console.log('WAGUS token account does not exist, balance is 0')
          wagusBalance = 0
        }
        setWagusBalance(wagusBalance)
      } catch (error) {
        console.error('Error fetching WAGUS balance:', error)
        if (error instanceof TokenAccountNotFoundError || error instanceof TokenInvalidAccountOwnerError) {
          console.log('WAGUS token account not found, setting balance to 0')
        }
        wagusBalance = 0
        setWagusBalance(0)
      }
      
      // Fetch real USDC token balance from blockchain
      let usdcBalance = 0
      try {
        console.log('Fetching USDC balance...')
        const usdcTokenAccount = await getAssociatedTokenAddress(
          new PublicKey(USDC_MINT),
          publicKey
        )
        console.log('USDC token account:', usdcTokenAccount.toString())
        
        // Check if the USDC token account exists
        const usdcAccountInfo = await connection.getAccountInfo(usdcTokenAccount)
        if (usdcAccountInfo) {
          const usdcTokenAccountInfo = await getAccount(connection, usdcTokenAccount)
          usdcBalance = Number(usdcTokenAccountInfo.amount) / Math.pow(10, 6) // USDC has 6 decimals
          console.log('USDC balance:', usdcBalance)
        } else {
          console.log('USDC token account does not exist, balance is 0')
          usdcBalance = 0
        }
      } catch (error) {
        console.error('Error fetching USDC balance:', error)
        if (error instanceof TokenAccountNotFoundError || error instanceof TokenInvalidAccountOwnerError) {
          console.log('USDC token account not found, setting balance to 0')
        }
        usdcBalance = 0
      }
      
      console.log('Updating token balances - SOL:', solBalance / LAMPORTS_PER_SOL, 'USDC:', usdcBalance, 'WAGUS:', wagusBalance)
      
      setTokens(prev => prev.map(token => {
        if (token.symbol === 'SOL') {
          return { ...token, balance: solBalance / LAMPORTS_PER_SOL }
        }
        if (token.symbol === 'USDC') {
          return { ...token, balance: usdcBalance }
        }
        if (token.symbol === 'WAGUS') {
          return { ...token, balance: wagusBalance }
        }
        return token
      }))
      
      toast.success('Balances updated successfully')
    } catch (error) {
      console.error('Error fetching balances:', error)
      
      // More specific error handling
      if (error instanceof Error) {
        if (error.message.includes('403') || error.message.includes('Access forbidden')) {
          toast.error('RPC access denied. The free RPC endpoint may be rate limited. Please try again in a few minutes.')
        } else if (error.message.includes('429')) {
          toast.error('Rate limit exceeded. Please wait before trying again.')
        } else {
          toast.error(`Failed to fetch balances: ${error.message}`)
        }
      } else {
        toast.error('Failed to fetch wallet balances. Please check your connection.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const purchaseCreditsWithUSDC = async (creditPackage: CreditPackage) => {
    if (!publicKey || !connected) {
      toast.error('Please connect your wallet first')
      return
    }

    const usdcToken = tokens.find(t => t.symbol === 'USDC')
    if (!usdcToken || usdcToken.balance < creditPackage.usdValue) {
      toast.error(`Insufficient USDC balance. You need $${creditPackage.usdValue} USDC.`)
      return
    }

    // Add confirmation dialog
    const confirmed = window.confirm(
      `Are you sure you want to purchase ${creditPackage.credits} credits for $${creditPackage.usdValue} USDC?\n\nThis action cannot be undone.`
    )
    
    if (!confirmed) {
      return
    }

    setIsLoading(true)

    try {
      // Create USDC token transfer transaction
      const usdcTokenAccount = await getAssociatedTokenAddress(
        new PublicKey(USDC_MINT),
        publicKey
      )
      
      const treasuryUsdcAccount = await getAssociatedTokenAddress(
        new PublicKey(USDC_MINT),
        new PublicKey(WAGUS_TREASURY)
      )

      const transaction = new SolanaTransaction().add(
        createTransferInstruction(
          usdcTokenAccount,
          treasuryUsdcAccount,
          publicKey,
          creditPackage.usdValue * Math.pow(10, 6), // USDC has 6 decimals
          [],
          TOKEN_PROGRAM_ID
        )
      )

      // Set recent blockhash and fee payer
      const { blockhash } = await connection.getLatestBlockhash()
      transaction.recentBlockhash = blockhash
      transaction.feePayer = publicKey

      const signature = await sendTransaction(transaction, connection, {
        skipPreflight: false,
        preflightCommitment: 'confirmed'
      } as ConfirmOptions)
      
      // Add to transaction history
      const newTransaction: PaymentTransaction = {
        id: Date.now().toString(),
        type: 'credit_purchase',
        token: 'USDC',
        amount: creditPackage.usdValue,
        usdValue: creditPackage.usdValue,
        creditsEarned: creditPackage.credits,
        status: 'pending',
        timestamp: new Date().toISOString(),
        signature,
        confirmations: 0
      }

      const updatedTransactions = [newTransaction, ...transactions]
      setTransactions(updatedTransactions)
      localStorage.setItem('wagus-transactions', JSON.stringify(updatedTransactions))
      
      // Purchase completed successfully
      
      toast.success('Credit purchase submitted! Waiting for confirmation...')
      
      // Wait for transaction confirmation
      const confirmation = await connection.confirmTransaction({
        signature,
        blockhash,
        lastValidBlockHeight: (await connection.getLatestBlockhash()).lastValidBlockHeight
      })

      if (confirmation.value.err) {
        throw new Error('Transaction failed')
      }

      // Update transaction status and add credits
      const confirmedTransactions = updatedTransactions.map(tx => 
        tx.id === newTransaction.id 
          ? { ...tx, status: 'confirmed' as const, confirmations: 1 }
          : tx
      )
      setTransactions(confirmedTransactions)
      localStorage.setItem('wagus-transactions', JSON.stringify(confirmedTransactions))
      
      // Add credits to user account
      updateCredits(creditPackage.credits)
      
      // Refresh balances
      await fetchBalances()
      
      toast.success(`Successfully purchased ${creditPackage.credits} credits with USDC!`)

    } catch (error) {
      console.error('Credit purchase error:', error)
      toast.error('Credit purchase failed. Please try again.')
      
      // Update transaction status to failed
      setTransactions(prev => prev.map(tx => 
        tx.signature === undefined ? { ...tx, status: 'failed' as const } : tx
      ))
    } finally {
      setIsLoading(false)
    }
  }

  const purchaseCreditsWithSOL = async (creditPackage: CreditPackage) => {
    if (!publicKey || !connected) {
      toast.error('Please connect your wallet first')
      return
    }

    const solToken = tokens.find(t => t.symbol === 'SOL')
    if (!solToken || !solToken.usdPrice) {
      toast.error('SOL price not available. Please try again.')
      return
    }

    const solAmount = creditPackage.usdValue / solToken.usdPrice
    if (solToken.balance < solAmount) {
      toast.error(`Insufficient SOL balance. You need ${solAmount.toFixed(4)} SOL.`)
      return
    }

    // Add confirmation dialog
    const confirmed = window.confirm(
      `Are you sure you want to purchase ${creditPackage.credits} credits for ${solAmount.toFixed(4)} SOL ($${creditPackage.usdValue})?\n\nThis action cannot be undone.`
    )
    
    if (!confirmed) {
      return
    }

    setIsLoading(true)

    try {
      // Create SOL transfer transaction
      const transaction = new SolanaTransaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: new PublicKey(WAGUS_TREASURY),
          lamports: Math.floor(solAmount * LAMPORTS_PER_SOL)
        })
      )

      // Set recent blockhash and fee payer
      const { blockhash } = await connection.getLatestBlockhash()
      transaction.recentBlockhash = blockhash
      transaction.feePayer = publicKey

      const signature = await sendTransaction(transaction, connection, {
        skipPreflight: false,
        preflightCommitment: 'confirmed'
      } as ConfirmOptions)
      
      // Add to transaction history
      const newTransaction: PaymentTransaction = {
        id: Date.now().toString(),
        type: 'credit_purchase',
        token: 'SOL',
        amount: solAmount,
        usdValue: creditPackage.usdValue,
        creditsEarned: creditPackage.credits,
        status: 'pending',
        timestamp: new Date().toISOString(),
        signature,
        confirmations: 0
      }

      const updatedTransactions = [newTransaction, ...transactions]
      setTransactions(updatedTransactions)
      localStorage.setItem('wagus-transactions', JSON.stringify(updatedTransactions))
      
      // Purchase completed successfully
      
      toast.success('Credit purchase submitted! Waiting for confirmation...')
      
      // Wait for transaction confirmation
      const confirmation = await connection.confirmTransaction({
        signature,
        blockhash,
        lastValidBlockHeight: (await connection.getLatestBlockhash()).lastValidBlockHeight
      })

      if (confirmation.value.err) {
        throw new Error('Transaction failed')
      }

      // Update transaction status and add credits
      const confirmedTransactions = updatedTransactions.map(tx => 
        tx.id === newTransaction.id 
          ? { ...tx, status: 'confirmed' as const, confirmations: 1 }
          : tx
      )
      setTransactions(confirmedTransactions)
      localStorage.setItem('wagus-transactions', JSON.stringify(confirmedTransactions))
      
      // Add credits to user account
      updateCredits(creditPackage.credits)
      
      // Refresh balances
      await fetchBalances()
      
      toast.success(`Successfully purchased ${creditPackage.credits} credits with SOL!`)

    } catch (error) {
      console.error('Credit purchase error:', error)
      toast.error('Credit purchase failed. Please try again.')
      
      // Update transaction status to failed
      setTransactions(prev => prev.map(tx => 
        tx.signature === undefined ? { ...tx, status: 'failed' as const } : tx
      ))
    } finally {
      setIsLoading(false)
    }
  }

  const purchasePremiumFeature = async (feature: PremiumFeature) => {
    if (!publicKey || !connected) {
      toast.error('Please connect your wallet first')
      return
    }

    if (wagusBalance < feature.wagusPrice) {
      toast.error(`Insufficient WAGUS balance. You need ${feature.wagusPrice} WAGUS tokens.`)
      return
    }

    // Add confirmation dialog
    const confirmed = window.confirm(
      `Are you sure you want to purchase ${feature.name} for ${feature.wagusPrice} WAGUS tokens?\n\nThis action cannot be undone.`
    )
    
    if (!confirmed) {
      return
    }

    setIsLoading(true)

    try {
      // Create WAGUS token transfer transaction
      const wagusTokenAccount = await getAssociatedTokenAddress(
        new PublicKey(WAGUS_MINT),
        publicKey
      )
      
      const treasuryTokenAccount = await getAssociatedTokenAddress(
        new PublicKey(WAGUS_MINT),
        new PublicKey(WAGUS_TREASURY)
      )

      const transaction = new SolanaTransaction().add(
        createTransferInstruction(
          wagusTokenAccount,
          treasuryTokenAccount,
          publicKey,
          feature.wagusPrice * Math.pow(10, 6), // WAGUS has 6 decimals
          [],
          TOKEN_PROGRAM_ID
        )
      )

      // Set recent blockhash and fee payer
      const { blockhash } = await connection.getLatestBlockhash()
      transaction.recentBlockhash = blockhash
      transaction.feePayer = publicKey

      const signature = await sendTransaction(transaction, connection, {
        skipPreflight: false,
        preflightCommitment: 'confirmed'
      } as ConfirmOptions)
      
      // Add to transaction history
      const newTransaction: PaymentTransaction = {
        id: Date.now().toString(),
        type: 'command_payment',
        token: 'WAGUS',
        amount: feature.wagusPrice,
        usdValue: 0, // Focus on utility, not USD value
        status: 'pending',
        timestamp: new Date().toISOString(),
        signature,
        confirmations: 0
      }

      const updatedTransactions = [newTransaction, ...transactions]
      setTransactions(updatedTransactions)
      localStorage.setItem('wagus-transactions', JSON.stringify(updatedTransactions))
      
      toast.success('Premium feature purchase submitted! Waiting for confirmation...')
      
      // Wait for transaction confirmation
      const confirmation = await connection.confirmTransaction({
        signature,
        blockhash,
        lastValidBlockHeight: (await connection.getLatestBlockhash()).lastValidBlockHeight
      })

      if (confirmation.value.err) {
        throw new Error('Transaction failed')
      }

      // Update transaction status
      const confirmedTransactions = updatedTransactions.map(tx => 
        tx.id === newTransaction.id 
          ? { ...tx, status: 'confirmed' as const, confirmations: 1 }
          : tx
      )
      setTransactions(confirmedTransactions)
      localStorage.setItem('wagus-transactions', JSON.stringify(confirmedTransactions))
      
      // Update WAGUS balance locally for immediate UI feedback
      setWagusBalance(prev => prev - feature.wagusPrice)
      
      // Add feature to owned features
      const updatedOwnedFeatures = [...ownedFeatures, feature.id]
      setOwnedFeatures(updatedOwnedFeatures)
      localStorage.setItem('wagus-owned-features', JSON.stringify(updatedOwnedFeatures))
      
      // Refresh balances from blockchain
      await fetchBalances()
      
      toast.success(`Successfully purchased ${feature.name}! You now own this premium feature.`)

    } catch (error) {
      console.error('Premium feature purchase error:', error)
      toast.error('Premium feature purchase failed. Please try again.')
      
      // Update transaction status to failed
      setTransactions(prev => prev.map(tx => 
        tx.signature === undefined ? { ...tx, status: 'failed' as const } : tx
      ))
    } finally {
      setIsLoading(false)
    }
  }

  // Function to handle command payments (called from CommandInterface)
  const processCommandPayment = async (commandCost: number) => {
    if (!publicKey || !connected) {
      toast.error('Please connect your wallet first')
      return false
    }

    if (wagusBalance < commandCost) {
      toast.error(`Insufficient WAGUS balance. You need ${commandCost} WAGUS tokens.`)
      return false
    }

    try {
      // Create WAGUS token transfer transaction for command payment
      const wagusTokenAccount = await getAssociatedTokenAddress(
        new PublicKey(WAGUS_MINT),
        publicKey
      )
      
      const treasuryTokenAccount = await getAssociatedTokenAddress(
        new PublicKey(WAGUS_MINT),
        new PublicKey(WAGUS_TREASURY)
      )

      const transaction = new SolanaTransaction().add(
        createTransferInstruction(
          wagusTokenAccount,
          treasuryTokenAccount,
          publicKey,
          commandCost * Math.pow(10, 6), // WAGUS has 6 decimals
          [],
          TOKEN_PROGRAM_ID
        )
      )

      const { blockhash } = await connection.getLatestBlockhash()
      transaction.recentBlockhash = blockhash
      transaction.feePayer = publicKey

      const signature = await sendTransaction(transaction, connection)
      
      const newTransaction: PaymentTransaction = {
        id: Date.now().toString(),
        type: 'command_payment',
        token: 'WAGUS',
        amount: commandCost,
        usdValue: 0, // Focus on utility, not USD value
        status: 'pending',
        timestamp: new Date().toISOString(),
        signature
      }

      const updatedTransactions = [newTransaction, ...transactions]
      setTransactions(updatedTransactions)
      localStorage.setItem('wagus-transactions', JSON.stringify(updatedTransactions))
      
      await fetchBalances()
      return true
      
    } catch (error) {
      console.error('Command payment error:', error)
      return false
    }
  }

  const getStatusIcon = (status: PaymentTransaction['status']) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />
      case 'confirmed':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-500" />
    }
  }

  const getStatusColor = (status: PaymentTransaction['status']) => {
    switch (status) {
      case 'pending': return 'text-yellow-600 bg-yellow-50'
      case 'confirmed': return 'text-green-600 bg-green-50'
      case 'failed': return 'text-red-600 bg-red-50'
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Payment Portal</h1>
          <p className="text-gray-600">Manage your Solana wallet and token balances</p>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={fetchTokenPrices}
            disabled={isPriceLoading}
            className="flex items-center px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
          >
            <DollarSign className={`w-4 h-4 mr-2 ${isPriceLoading ? 'animate-spin' : ''}`} />
            {isPriceLoading ? 'Updating...' : 'Update Prices'}
          </button>
          <button
            onClick={() => {
              fetchBalances()
              fetchTokenPrices()
            }}
            disabled={!connected || isLoading || isPriceLoading}
            className="flex items-center px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading || isPriceLoading ? 'animate-spin' : ''}`} />
            {isLoading || isPriceLoading ? 'Refreshing...' : 'Refresh All'}
          </button>
          <WalletMultiButton className="!bg-orange-600 hover:!bg-orange-700" />
        </div>
      </div>

      {!connected ? (
        <div className="text-center py-12">
          <Wallet className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Connect Your Wallet</h3>
          <p className="text-gray-600 mb-6">
            Connect your Phantom wallet to purchase WAGUS credits and unlock premium commands
          </p>
          <div className="mb-6">
            <WalletMultiButton className="!bg-orange-600 hover:!bg-orange-700" />
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md mx-auto">
            <div className="flex items-start space-x-2">
              <div className="w-5 h-5 text-blue-600 mt-0.5">
                ℹ️
              </div>
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">Network: Solana Mainnet</p>
                <p>Make sure your wallet is connected to Solana Mainnet to see your real token balances.</p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Portal</h1>
                <p className="text-gray-600">
                  Manage your WAGUS tokens and purchase credits for premium AI commands
                </p>
              </div>
              <div className="flex items-center space-x-2 bg-green-50 px-3 py-2 rounded-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-green-700">Mainnet Connected</span>
              </div>
            </div>
          </div>

          {/* Wallet Info */}
          <div className="bg-gradient-to-r from-purple-600 to-orange-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold mb-2">WAGUS Agents Wallet</h2>
                <p className="text-purple-100 font-mono text-sm">
                  {publicKey?.toString().slice(0, 8)}...{publicKey?.toString().slice(-8)}
                </p>
                <div className="mt-2 flex items-center space-x-4">
                  <div className="flex items-center space-x-1">
                    <span className="text-purple-100 text-sm">Credits:</span>
                    <span className="font-bold">{credits}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <span className="text-purple-100 text-sm">WAGUS:</span>
                    <span className="font-bold">{wagusBalance.toFixed(2)}</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-purple-100 text-sm">Portfolio Value</p>
                <p className="text-2xl font-bold">
                  ${tokens.reduce((sum, token) => sum + (token.balance * token.usdPrice), 0).toFixed(2)}
                </p>
                {isPriceLoading && (
                  <p className="text-xs text-purple-200 mt-1">Updating prices...</p>
                )}
              </div>
            </div>
          </div>

          {/* WAGUS Economic Dashboard */}
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">WAGUS Economic Model</h2>
                  <p className="text-sm text-gray-600">Internal value calculation based on treasury and utility metrics</p>
                </div>
                <div className="flex items-center space-x-2 bg-green-50 px-3 py-2 rounded-lg">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-green-700">Economic Model Active</span>
                </div>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Current WAGUS Price */}
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-green-800">WAGUS Price</h3>
                    <DollarSign className="w-4 h-4 text-green-600" />
                  </div>
                  <p className="text-2xl font-bold text-green-900">Utility Token</p>
                  <p className="text-xs text-green-600 mt-1">Focus on Features</p>
                </div>

                {/* Treasury Value */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-blue-800">Treasury Value</h3>
                    <Wallet className="w-4 h-4 text-blue-600" />
                  </div>
                  <p className="text-2xl font-bold text-blue-900">${treasuryValue.toLocaleString()}</p>
                  <p className="text-xs text-blue-600 mt-1">USD Reserves</p>
                </div>

                {/* Circulating Supply */}
                <div className="bg-gradient-to-br from-purple-50 to-violet-50 p-4 rounded-lg border border-purple-200">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-purple-800">Effective Supply</h3>
                    <TrendingUp className="w-4 h-4 text-purple-600" />
                  </div>
                  <p className="text-2xl font-bold text-purple-900">{(circulatingSupply - totalStaked - burnedTokens).toLocaleString()}</p>
                  <p className="text-xs text-purple-600 mt-1">WAGUS Tokens</p>
                </div>

                {/* Staked Tokens */}
                <div className="bg-gradient-to-br from-orange-50 to-amber-50 p-4 rounded-lg border border-orange-200">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-orange-800">Staked Tokens</h3>
                    <Clock className="w-4 h-4 text-orange-600" />
                  </div>
                  <p className="text-2xl font-bold text-orange-900">{totalStaked.toLocaleString()}</p>
                  <p className="text-xs text-orange-600 mt-1">{((totalStaked / circulatingSupply) * 100).toFixed(1)}% of Supply</p>
                </div>

                {/* Daily Volume */}
                <div className="bg-gradient-to-br from-cyan-50 to-teal-50 p-4 rounded-lg border border-cyan-200">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-cyan-800">Daily Volume</h3>
                    <Send className="w-4 h-4 text-cyan-600" />
                  </div>
                  <p className="text-2xl font-bold text-cyan-900">{dailyVolume.toLocaleString()}</p>
                  <p className="text-xs text-cyan-600 mt-1">WAGUS Transactions</p>
                </div>

                {/* Burned Tokens */}
                <div className="bg-gradient-to-br from-red-50 to-rose-50 p-4 rounded-lg border border-red-200">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-red-800">Burned Tokens</h3>
                    <XCircle className="w-4 h-4 text-red-600" />
                  </div>
                  <p className="text-2xl font-bold text-red-900">{burnedTokens.toLocaleString()}</p>
                  <p className="text-xs text-red-600 mt-1">{((burnedTokens / circulatingSupply) * 100).toFixed(2)}% Burned</p>
                </div>

                {/* Demand Multiplier */}
                <div className="bg-gradient-to-br from-yellow-50 to-amber-50 p-4 rounded-lg border border-yellow-200">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-yellow-800">Demand Factor</h3>
                    <TrendingUp className="w-4 h-4 text-yellow-600" />
                  </div>
                  <p className="text-2xl font-bold text-yellow-900">{demandMultiplier.toFixed(2)}x</p>
                  <p className="text-xs text-yellow-600 mt-1">Usage Multiplier</p>
                </div>

                {/* Market Cap */}
                <div className="bg-gradient-to-br from-gray-50 to-slate-50 p-4 rounded-lg border border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-gray-800">Market Cap</h3>
                    <CreditCard className="w-4 h-4 text-gray-600" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{circulatingSupply.toLocaleString()}</p>
                  <p className="text-xs text-gray-600 mt-1">Total Supply</p>
                </div>
              </div>

              {/* Economic Model Explanation */}
              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="text-sm font-medium text-blue-800 mb-2">How WAGUS Value is Calculated</h4>
                <p className="text-sm text-blue-700">
                  WAGUS price = (Treasury Value ÷ Effective Supply) × Demand Multiplier. 
                  The demand multiplier increases based on daily volume, staking participation, and token burns, 
                  creating a utility-driven economy where platform usage directly increases token value.
                </p>
              </div>
            </div>
          </div>

          {/* Credit Packages - USDC/SOL Payment */}
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Purchase Credits</h2>
                  <p className="text-sm text-gray-600">Buy credits with USDC or SOL at fixed USD prices</p>
                  <div className="mt-2 flex items-center space-x-4">
                    <div className="flex items-center space-x-1">
                      <span className="text-xs text-gray-500">SOL Price:</span>
                      <span className="text-xs font-medium text-purple-600">${tokens.find(t => t.symbol === 'SOL')?.usdPrice?.toFixed(2) || '0.00'}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <span className="text-xs text-gray-500">USDC:</span>
                      <span className="text-xs font-medium text-green-600">$1.00</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2 bg-blue-50 px-3 py-2 rounded-lg">
                  <DollarSign className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-700">Fixed USD Pricing</span>
                </div>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {creditPackages.map((pkg) => {
                  const solToken = tokens.find(t => t.symbol === 'SOL')
                  const usdcToken = tokens.find(t => t.symbol === 'USDC')
                  const solAmount = solToken?.usdPrice ? pkg.usdValue / solToken.usdPrice : 0
                  const canPayWithSOL = solToken && solToken.balance >= solAmount
                  const canPayWithUSDC = usdcToken && usdcToken.balance >= pkg.usdValue
                  
                  return (
                    <div
                      key={pkg.id}
                      className={`relative border rounded-lg p-6 transition-all hover:shadow-md ${
                        pkg.popular 
                          ? 'border-orange-500 bg-orange-50' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {pkg.popular && (
                        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                          <span className="bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                            Most Popular
                          </span>
                        </div>
                      )}
                      <div className="text-center">
                        <h3 className="text-lg font-semibold text-gray-900 capitalize">{pkg.id}</h3>
                        <div className="mt-2">
                          <span className="text-3xl font-bold text-gray-900">{pkg.credits}</span>
                          <span className="text-gray-600 ml-1">credits</span>
                        </div>
                        <div className="mt-4 space-y-2">
                          <div className="flex items-center justify-center space-x-2">
                            <DollarSign className="w-4 h-4 text-green-600" />
                            <span className="text-lg font-bold text-gray-900">${pkg.usdValue.toFixed(2)}</span>
                          </div>
                          <div className="text-xs text-gray-500 space-y-1">
                            <div>≈ {solAmount.toFixed(4)} SOL</div>
                            <div>≈ {pkg.usdValue.toFixed(2)} USDC</div>
                          </div>
                        </div>
                        <div className="mt-4 space-y-2">
                          <button
                            onClick={() => purchaseCreditsWithUSDC(pkg)}
                            disabled={!canPayWithUSDC || isLoading}
                            className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
                              canPayWithUSDC && !isLoading
                                ? 'bg-green-600 text-white hover:bg-green-700'
                                : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                            }`}
                          >
                            {isLoading ? 'Processing...' : canPayWithUSDC ? 'Pay with USDC' : 'Insufficient USDC'}
                          </button>
                          <button
                            onClick={() => purchaseCreditsWithSOL(pkg)}
                            disabled={!canPayWithSOL || isLoading}
                            className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
                              canPayWithSOL && !isLoading
                                ? 'bg-purple-600 text-white hover:bg-purple-700'
                                : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                            }`}
                          >
                            {isLoading ? 'Processing...' : canPayWithSOL ? 'Pay with SOL' : 'Insufficient SOL'}
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Premium Store - WAGUS Payment */}
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">🐕 WAGUS Premium Store</h2>
                  <p className="text-sm text-gray-600">Unlock exclusive features, themes, and tools with WAGUS tokens</p>
                  <div className="mt-3 flex items-center space-x-4">
                    <div className="flex items-center space-x-2 bg-orange-50 px-3 py-2 rounded-lg">
                      <Wallet className="w-4 h-4 text-orange-600" />
                      <span className="text-sm font-medium text-orange-600">{wagusBalance.toFixed(0)} WAGUS</span>
                    </div>
                    <div className="flex items-center space-x-2 bg-green-50 px-3 py-2 rounded-lg">
                      <TrendingUp className="w-4 h-4 text-green-600" />
                      <span className="text-sm font-medium text-green-600">Utility Token</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl mb-2">🛍️</div>
                  <p className="text-xs text-gray-500">{premiumFeatures.length} Premium Items</p>
                </div>
              </div>
            </div>
            
            <div className="p-6">
              {/* Featured Items */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">✨ Featured Items</h3>
                  <button
                    onClick={() => setShowAllFeatures(!showAllFeatures)}
                    className="flex items-center space-x-2 text-orange-600 hover:text-orange-700 font-medium text-sm"
                  >
                    <span>{showAllFeatures ? 'Show Less' : 'View All Items'}</span>
                    <ExternalLink className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {(showAllFeatures ? premiumFeatures : premiumFeatures.slice(0, 6)).map((feature) => {
                    const canPurchase = wagusBalance >= feature.wagusPrice
                    // Focus on utility, not USD value
                    const isOwned = ownedFeatures.includes(feature.id)
                    const isFeatured = ['prompt_optimizer', 'matrix_theme', 'advanced_commands', 'ai_assistant', 'dark_theme', 'priority_processing'].includes(feature.id)
                    
                    return (
                      <div
                        key={feature.id}
                        className={`relative border rounded-xl p-6 transition-all hover:shadow-lg hover:scale-105 ${
                          isOwned 
                            ? 'border-green-300 bg-gradient-to-br from-green-50 to-green-100' 
                            : isFeatured
                            ? 'border-orange-300 bg-gradient-to-br from-orange-50 to-yellow-50'
                            : 'border-gray-200 hover:border-orange-300 bg-gradient-to-br from-white to-gray-50'
                        }`}
                      >
                        {isFeatured && !isOwned && (
                          <div className="absolute -top-2 -right-2">
                            <div className="bg-orange-500 text-white text-xs px-2 py-1 rounded-full font-bold">
                              HOT
                            </div>
                          </div>
                        )}
                        
                        {isOwned && (
                          <div className="absolute -top-2 -right-2">
                            <div className="bg-green-500 text-white text-xs px-2 py-1 rounded-full font-bold">
                              OWNED
                            </div>
                          </div>
                        )}
                        
                        <div className="text-center">
                          <div className="text-4xl mb-3">{feature.icon}</div>
                          <h4 className="text-lg font-bold text-gray-900 mb-2">{feature.name}</h4>
                          <p className="text-sm text-gray-600 mb-4 min-h-[40px]">{feature.description}</p>
                          
                          <div className="space-y-3">
                            <div className="flex items-center justify-center space-x-2">
                              <span className="text-xl font-bold text-orange-600">{feature.wagusPrice.toLocaleString()}</span>
                              <span className="text-sm text-gray-600 font-medium">WAGUS</span>
                            </div>
                            <div className="text-xs text-gray-500">
                              Premium Feature
                            </div>
                            <div className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                              feature.category === 'theme' ? 'bg-purple-100 text-purple-700' :
                              feature.category === 'feature' ? 'bg-blue-100 text-blue-700' :
                              'bg-green-100 text-green-700'
                            }`}>
                              {feature.category.toUpperCase()}
                            </div>
                          </div>
                          
                          <button
                            onClick={() => purchasePremiumFeature(feature)}
                            disabled={!canPurchase || isLoading || isOwned}
                            className={`mt-4 w-full py-3 px-4 rounded-lg font-bold transition-all ${
                              isOwned
                                ? 'bg-green-600 text-white cursor-default'
                                : canPurchase && !isLoading
                                ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700 shadow-lg'
                                : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                            }`}
                          >
                            {isOwned 
                              ? '✅ Owned' 
                              : isLoading 
                              ? '⏳ Processing...' 
                              : canPurchase 
                              ? '🛒 Purchase Now' 
                              : '💰 Need More WAGUS'
                            }
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
              
              {/* Get WAGUS Section */}
              {wagusBalance < 1000 && (
                <div className="mt-6 p-6 bg-gradient-to-r from-orange-50 to-yellow-50 border border-orange-200 rounded-xl">
                  <div className="flex items-start space-x-4">
                    <div className="text-4xl">🐕</div>
                    <div className="flex-1">
                      <h4 className="text-lg font-bold text-orange-800 mb-2">Need More WAGUS?</h4>
                      <p className="text-sm text-orange-700 mb-4">
                        Get WAGUS tokens to unlock premium features and power the WAGUS economy!
                      </p>
                      <div className="flex flex-wrap gap-3">
                        <a 
                          href="https://swap.wagus.app" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center space-x-2 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 font-medium text-sm transition-colors"
                        >
                          <span>🔄</span>
                          <span>Swap for WAGUS</span>
                          <ExternalLink className="w-4 h-4" />
                        </a>
                        <a 
                          href="https://wagus.app" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center space-x-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 font-medium text-sm transition-colors"
                        >
                          <span>📚</span>
                          <span>Learn More</span>
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Token Balances */}
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Token Balances</h2>
                <div className="flex items-center space-x-2">
                  <button 
                    onClick={fetchTokenPrices}
                    disabled={isPriceLoading}
                    className="flex items-center text-sm text-gray-600 hover:text-gray-700 disabled:opacity-50"
                  >
                    <TrendingUp className={`w-4 h-4 mr-2 ${isPriceLoading ? 'animate-spin' : ''}`} />
                    {isPriceLoading ? 'Updating Prices...' : 'Update Prices'}
                  </button>
                  <button 
                    onClick={fetchBalances}
                    disabled={isLoading}
                    className="flex items-center px-3 py-1 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 text-sm"
                  >
                    <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                    {isLoading ? 'Refreshing...' : 'Refresh Balances'}
                  </button>
                </div>
              </div>
            </div>
            <div className="divide-y divide-gray-200">
              {tokens.map((token) => (
                <div key={token.symbol} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="text-2xl">{token.logo}</div>
                      <div>
                        <h3 className="font-medium text-gray-900">{token.name}</h3>
                        <p className="text-sm text-gray-600">{token.symbol}</p>
                        {token.symbol === 'WAGUS' && (
                          <p className="text-xs text-orange-600">Used for premium commands</p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">
                        {token.balance.toFixed(token.symbol === 'SOL' ? 4 : 2)} {token.symbol}
                      </p>
                      <p className="text-sm text-gray-600">
                        ${(token.balance * token.usdPrice).toFixed(2)}
                      </p>
                      {token.symbol === 'WAGUS' && token.balance === 0 && (
                        <a 
                          href="https://swap.wagus.app" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-xs text-orange-600 hover:text-orange-700 underline"
                        >
                          Get WAGUS →
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Transaction History */}
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Transaction History</h2>
                <button 
                  onClick={() => {
                    localStorage.removeItem('wagus-transactions')
                    setTransactions([])
                    toast.success('Transaction history cleared')
                  }}
                  className="flex items-center text-sm text-gray-600 hover:text-gray-700"
                >
                  <History className="w-4 h-4 mr-2" />
                  Clear History
                </button>
              </div>
            </div>
            <div className="divide-y divide-gray-200">
              {transactions.length === 0 ? (
                <div className="p-8 text-center">
                  <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No transactions yet</p>
                  <p className="text-sm text-gray-500 mt-1">Purchase credits to see your transaction history</p>
                </div>
              ) : (
                transactions.map((tx) => (
                  <div key={tx.id} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        {getStatusIcon(tx.status)}
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-medium text-gray-900">
                              {tx.type === 'credit_purchase' ? 'Credit Purchase' : 'Command Payment'}
                            </span>
                            <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(tx.status)}`}>
                              {tx.status}
                            </span>
                            {tx.confirmations && (
                              <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                                {tx.confirmations} confirmations
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600">
                            {new Date(tx.timestamp).toLocaleString()}
                          </p>
                          {tx.creditsEarned && (
                            <p className="text-sm text-green-600 font-medium">
                              +{tx.creditsEarned} credits earned
                            </p>
                          )}
                          {tx.signature && (
                            <div className="flex items-center space-x-1 mt-1">
                              <span className="text-xs text-gray-500 font-mono">
                                {tx.signature.slice(0, 8)}...{tx.signature.slice(-8)}
                              </span>
                              <button 
                                onClick={() => window.open(`https://solscan.io/tx/${tx.signature}`, '_blank')}
                                className="text-orange-600 hover:text-orange-700"
                              >
                                <ExternalLink className="w-3 h-3" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900">
                          -{tx.amount} {tx.token}
                        </p>
                        <p className="text-sm text-gray-600">
                          ${tx.usdValue.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}


    </div>
  )
}

export default PaymentPortal