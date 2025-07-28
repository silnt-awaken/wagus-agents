import { useState, useEffect } from 'react'
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
  wagusAmount: number
  usdValue: number
  popular?: boolean
}

const PaymentPortal = () => {
  const { publicKey, connected, sendTransaction } = useWallet()
  const { connection } = useConnection()
  const { credits, updateCredits } = useAuth()
  const [tokens, setTokens] = useState<Token[]>([])
  const [selectedPackage, setSelectedPackage] = useState<CreditPackage | null>(null)
  const [transactions, setTransactions] = useState<PaymentTransaction[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isPriceLoading, setPriceLoading] = useState(false)
  const [showPurchaseModal, setShowPurchaseModal] = useState(false)
  const [wagusBalance, setWagusBalance] = useState(0)

  // WAGUS token mint address - Production WAGUS token
  const WAGUS_MINT = import.meta.env.VITE_WAGUS_MINT || '7BMxgTQhTthoBcQizzFoLyhmSDscM56uMramXGMhpump'
  const USDC_MINT = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v' // USDC mainnet
  
  // WAGUS LLC Treasury wallet for receiving payments
  const WAGUS_TREASURY = import.meta.env.VITE_WAGUS_TREASURY || 'DZuJUNmVxNQwq55wrrrpFeE4PES1cyBv2bxuSqm7UXdj' // Real treasury wallet

  // Credit packages with real WAGUS pricing
  const creditPackages: CreditPackage[] = [
    {
      id: 'starter',
      credits: 100,
      wagusAmount: 50,
      usdValue: 12.50
    },
    {
      id: 'pro',
      credits: 500,
      wagusAmount: 200,
      usdValue: 50.00,
      popular: true
    },
    {
      id: 'enterprise',
      credits: 1000,
      wagusAmount: 350,
      usdValue: 87.50
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

    // Fetch real-time prices
    fetchTokenPrices()
  }, [])

  // Fetch real-time token prices from CoinGecko
  const fetchTokenPrices = async () => {
    setPriceLoading(true)
    console.log('Fetching token prices from CoinGecko...')
    
    try {
      const response = await fetch(
        'https://api.coingecko.com/api/v3/simple/price?ids=solana,usd-coin&vs_currencies=usd',
        {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          },
        }
      )
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const prices = await response.json()
      console.log('Fetched prices:', prices)
      
      setTokens(prev => prev.map(token => {
        if (token.coingeckoId && prices[token.coingeckoId]) {
          const newPrice = prices[token.coingeckoId].usd
          console.log(`Updated ${token.symbol} price to $${newPrice}`)
          return { ...token, usdPrice: newPrice }
        }
        // For WAGUS, use a fixed price until listed on CoinGecko
        if (token.symbol === 'WAGUS') {
          return { ...token, usdPrice: 0.25 } // $0.25 per WAGUS
        }
        return token
      }))
      
      console.log('Token prices updated successfully')
    } catch (error) {
      console.error('Error fetching token prices:', error)
      toast.error(`Failed to fetch current token prices: ${error instanceof Error ? error.message : 'Network error'}`)
      // Fallback to default prices
      console.log('Using fallback prices')
      setTokens(prev => prev.map(token => ({
        ...token,
        usdPrice: token.symbol === 'SOL' ? 100 : token.symbol === 'WAGUS' ? 0.25 : 1.00
      })))
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

  const purchaseCredits = async (creditPackage: CreditPackage) => {
    if (!publicKey || !connected) {
      toast.error('Please connect your wallet first')
      return
    }

    if (wagusBalance < creditPackage.wagusAmount) {
      toast.error(`Insufficient WAGUS balance. You need ${creditPackage.wagusAmount} WAGUS tokens.`)
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
          creditPackage.wagusAmount * Math.pow(10, 6), // WAGUS has 6 decimals
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
        token: 'WAGUS',
        amount: creditPackage.wagusAmount,
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
      
      setShowPurchaseModal(false)
      setSelectedPackage(null)
      
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
      
      toast.success(`Successfully purchased ${creditPackage.credits} credits!`)

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
        usdValue: commandCost * 0.25, // WAGUS price
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
            onClick={fetchBalances}
            disabled={!connected}
            className="flex items-center px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
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

          {/* Credit Packages */}
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Purchase Credits</h2>
                  <p className="text-sm text-gray-600">Buy credits with WAGUS tokens to unlock premium commands</p>
                </div>
                <button
                  onClick={fetchTokenPrices}
                  disabled={isPriceLoading}
                  className="flex items-center px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${isPriceLoading ? 'animate-spin' : ''}`} />
                  Update Prices
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {creditPackages.map((pkg) => (
                  <div
                    key={pkg.id}
                    className={`relative border rounded-lg p-6 cursor-pointer transition-all hover:shadow-md ${
                      pkg.popular 
                        ? 'border-orange-500 bg-orange-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => {
                      setSelectedPackage(pkg)
                      setShowPurchaseModal(true)
                    }}
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
                          <span className="text-sm text-gray-600">Cost:</span>
                          <span className="font-medium">{pkg.wagusAmount} WAGUS</span>
                        </div>
                        <div className="flex items-center justify-center space-x-2">
                          <DollarSign className="w-4 h-4 text-green-600" />
                          <span className="text-sm text-gray-600">${pkg.usdValue.toFixed(2)} USD</span>
                        </div>
                      </div>
                      <button
                        className={`mt-4 w-full py-2 px-4 rounded-lg font-medium transition-colors ${
                          wagusBalance >= pkg.wagusAmount
                            ? pkg.popular
                              ? 'bg-orange-600 text-white hover:bg-orange-700'
                              : 'bg-gray-900 text-white hover:bg-gray-800'
                            : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                        }`}
                        disabled={wagusBalance < pkg.wagusAmount}
                      >
                        {wagusBalance >= pkg.wagusAmount ? 'Purchase' : 'Insufficient WAGUS'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              
              {wagusBalance === 0 && (
                <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-medium text-yellow-800">No WAGUS Tokens Found</h4>
                      <p className="text-sm text-yellow-700 mt-1">
                        You need WAGUS tokens to purchase credits. Visit{' '}
                        <a href="https://swap.wagus.app" target="_blank" rel="noopener noreferrer" className="underline">
                          swap.wagus.app
                        </a>{' '}
                        to get WAGUS tokens.
                      </p>
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

      {/* Purchase Confirmation Modal */}
      {showPurchaseModal && selectedPackage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Confirm Purchase</h3>
              <button
                onClick={() => {
                  setShowPurchaseModal(false)
                  setSelectedPackage(null)
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              {/* Package Details */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 capitalize mb-2">{selectedPackage.id} Package</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Credits:</span>
                    <span className="font-medium">{selectedPackage.credits}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Cost:</span>
                    <span className="font-medium">{selectedPackage.wagusAmount} WAGUS</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">USD Value:</span>
                    <span className="font-medium">${selectedPackage.usdValue.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span className="text-gray-600">Your WAGUS Balance:</span>
                    <span className={`font-medium ${
                      wagusBalance >= selectedPackage.wagusAmount ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {wagusBalance.toFixed(2)} WAGUS
                    </span>
                  </div>
                </div>
              </div>

              {/* Warning for insufficient balance */}
              {wagusBalance < selectedPackage.wagusAmount && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-start space-x-2">
                    <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5" />
                    <div className="text-sm">
                      <p className="text-red-800 font-medium">Insufficient WAGUS Balance</p>
                      <p className="text-red-700 mt-1">
                        You need {(selectedPackage.wagusAmount - wagusBalance).toFixed(2)} more WAGUS tokens.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Transaction Info */}
              <div className="text-xs text-gray-500 space-y-1">
                <p>• Transaction will be processed on Solana blockchain</p>
                <p>• Credits will be added to your account after confirmation</p>
                <p>• This action cannot be undone</p>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3 pt-4">
                <button
                  onClick={() => {
                    setShowPurchaseModal(false)
                    setSelectedPackage(null)
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => purchaseCredits(selectedPackage)}
                  disabled={wagusBalance < selectedPackage.wagusAmount || isLoading}
                  className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:bg-gray-400 transition-colors flex items-center justify-center"
                >
                  {isLoading ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    'Confirm Purchase'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default PaymentPortal